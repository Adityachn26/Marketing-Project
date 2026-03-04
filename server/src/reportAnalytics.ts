import { parse } from "csv-parse/sync";
import type { NormalizedRow } from "./reportTypes";

type ParsedRow = Record<string, unknown>;

function normHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

function pickKey(headers: string[], candidates: string[]) {
  const set = new Set(headers.map(normHeader));
  for (const c of candidates) {
    if (set.has(normHeader(c))) return normHeader(c);
  }
  return undefined;
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const s = String(value).trim();
  if (!s) return 0;
  // Remove currency symbols and commas: ₹ $ , etc.
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function toDate(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  // Try ISO or common formats; ultimately rely on Date parsing.
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export function parseAndNormalizeCsv(buffer: Buffer) {
  const raw = buffer.toString("utf-8");
  const records = parse(raw, {
    columns: (header: string[]) => header.map(normHeader),
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
    trim: true,
  }) as ParsedRow[];

  const headers = records.length ? Object.keys(records[0]) : [];

  const dateKey = pickKey(headers, ["date", "day", "timestamp"]);
  const channelKey = pickKey(headers, ["channel", "promo_method", "promotion_method", "method", "source", "platform"]);
  const campaignKey = pickKey(headers, ["campaign", "campaign_name", "ad_name", "ad", "adset", "ad_set"]);
  const spendKey = pickKey(headers, ["spend", "cost", "amount_spent", "ad_spend", "expense"]);
  const revenueKey = pickKey(headers, ["revenue", "sales", "value", "purchase_value"]);
  const conversionsKey = pickKey(headers, ["conversions", "purchases", "orders", "leads"]);

  const warnings: string[] = [];
  if (!channelKey) warnings.push("Could not find a channel/promo method column. Add a column like 'channel' or 'promo_method'.");
  if (!spendKey) warnings.push("Could not find a spend/cost column. Add a column like 'spend' or 'cost'.");
  if (!revenueKey) warnings.push("Could not find a revenue/sales column. Add a column like 'revenue' or 'sales'.");
  if (!dateKey) warnings.push("No date column found. Trend chart will be empty unless you add a 'date' column.");
  if (!conversionsKey) warnings.push("No conversions column found. CAC/CPA will be zero unless you add 'conversions' or 'purchases'.");

  const rows: NormalizedRow[] = [];

  for (const r of records) {
    const channel = channelKey ? String(r[channelKey] ?? "").trim() : "";
    if (!channel) continue;
    const spend = spendKey ? toNumber(r[spendKey]) : 0;
    const revenue = revenueKey ? toNumber(r[revenueKey]) : 0;
    const conversions = conversionsKey ? toNumber(r[conversionsKey]) : 0;
    const date = dateKey ? toDate(r[dateKey]) : undefined;
    const campaign = campaignKey ? String(r[campaignKey] ?? "").trim() : undefined;

    rows.push({
      date,
      channel,
      campaign: campaign || undefined,
      spend,
      revenue,
      conversions,
    });
  }

  return { rows, warnings };
}

export function computeKpis(rows: NormalizedRow[]) {
  const totalSpend = rows.reduce((a, r) => a + r.spend, 0);
  const revenue = rows.reduce((a, r) => a + r.revenue, 0);
  const conversions = rows.reduce((a, r) => a + r.conversions, 0);
  const roas = totalSpend > 0 ? revenue / totalSpend : 0;
  const cac = conversions > 0 ? totalSpend / conversions : 0;

  return { totalSpend, revenue, roas, conversions, cac };
}

export function computeTrend(rows: NormalizedRow[]) {
  const byDate = new Map<string, { spend: number; revenue: number }>();
  for (const r of rows) {
    if (!r.date) continue;
    const cur = byDate.get(r.date) ?? { spend: 0, revenue: 0 };
    cur.spend += r.spend;
    cur.revenue += r.revenue;
    byDate.set(r.date, cur);
  }
  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, spend: v.spend, revenue: v.revenue }));
}

export function computeChannelSummary(rows: NormalizedRow[]) {
  const byChannel = new Map<string, { spend: number; revenue: number; conversions: number }>();
  for (const r of rows) {
    const cur = byChannel.get(r.channel) ?? { spend: 0, revenue: 0, conversions: 0 };
    cur.spend += r.spend;
    cur.revenue += r.revenue;
    cur.conversions += r.conversions;
    byChannel.set(r.channel, cur);
  }
  return Array.from(byChannel.entries())
    .map(([channel, v]) => ({
      channel,
      spend: v.spend,
      revenue: v.revenue,
      conversions: v.conversions,
      cpa: v.conversions > 0 ? v.spend / v.conversions : 0,
      roas: v.spend > 0 ? v.revenue / v.spend : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeCampaignSummary(rows: NormalizedRow[]) {
  const byCampaign = new Map<string, { channel: string; spend: number; revenue: number; conversions: number }>();
  for (const r of rows) {
    if (!r.campaign) continue;
    const key = `${r.channel}:::${r.campaign}`;
    const cur = byCampaign.get(key) ?? { channel: r.channel, spend: 0, revenue: 0, conversions: 0 };
    cur.spend += r.spend;
    cur.revenue += r.revenue;
    cur.conversions += r.conversions;
    byCampaign.set(key, cur);
  }
  return Array.from(byCampaign.entries())
    .map(([key, v], idx) => {
      const campaign = key.split(":::")[1] ?? "Campaign";
      return {
        id: idx + 1,
        name: campaign,
        channel: v.channel,
        spend: v.spend,
        revenue: v.revenue,
        conversions: v.conversions,
        roas: v.spend > 0 ? v.revenue / v.spend : 0,
        cpa: v.conversions > 0 ? v.spend / v.conversions : 0,
        status: "uploaded",
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 50);
}

export function computeRecommendations(rows: NormalizedRow[]) {
  const channels = computeChannelSummary(rows);
  const paid = channels.filter((c) => c.spend > 0);
  if (paid.length === 0) {
    return {
      headline: "No paid spend found in this CSV.",
      suggestions: ["Add spend/cost data per promo method to get budget recommendations."],
      bestChannels: channels.slice(0, 3),
      underperformers: [],
    };
  }

  const roasValues = paid.map((c) => c.roas).sort((a, b) => a - b);
  const median = roasValues[Math.floor(roasValues.length / 2)] ?? 0;

  const bestChannels = paid.slice().sort((a, b) => b.roas - a.roas).slice(0, 3);
  const underperformers = paid
    .slice()
    .filter((c) => c.roas < median)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3);

  const suggestions: string[] = [];
  if (bestChannels.length) {
    suggestions.push(
      `Increase budget for: ${bestChannels.map((c) => `${c.channel} (ROAS ${c.roas.toFixed(2)})`).join(", ")}.`
    );
  }
  if (underperformers.length) {
    suggestions.push(
      `Consider reducing budget for: ${underperformers.map((c) => `${c.channel} (ROAS ${c.roas.toFixed(2)})`).join(", ")} and reallocate to higher-ROAS channels.`
    );
  }
  suggestions.push("Validate with volume too: high ROAS + meaningful revenue/conversions is usually the safest scaling target.");

  return {
    headline: "Budget recommendations based on ROAS.",
    suggestions,
    bestChannels,
    underperformers,
  };
}

