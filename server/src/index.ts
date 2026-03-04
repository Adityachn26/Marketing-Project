import Fastify from "fastify";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import { createReport, getReport } from "./reportStore";
import {
  computeCampaignSummary,
  computeChannelSummary,
  computeKpis,
  computeRecommendations,
  computeTrend,
  parseAndNormalizeCsv,
} from "./reportAnalytics";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

fastify.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Basic CORS for local dev – you can tighten this later
// Fastify has its own CORS plugin, but for a quick start we can use a simple wrapper.
fastify.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    reply.status(204).send();
    return;
  }
});

// Routes
fastify.get("/api/overview/kpis", async () => {
  // TODO: replace with Prisma queries
  return {
    totalSpend: 120000,
    revenue: 360000,
    roas: 3.0,
    conversions: 4200,
    cac: 28.6,
  };
});

fastify.get("/api/overview/trend", async () => {
  
  // TODO: replace with Prisma queries
  const days = 14;
  const today = new Date();
  const data = Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const dateLabel = d.toISOString().slice(0, 10);
    const spend = 5000 + Math.random() * 2000;
    const revenue = spend * (2.5 + Math.random() * 1);
    return { date: dateLabel, spend, revenue };
  });
  return data;
});

// --- CSV report upload + analytics ---
fastify.post("/api/report/upload", async (request, reply) => {
  const file = await (request as any).file();
  if (!file) return reply.status(400).send({ error: "No file uploaded. Use form field name 'file'." });

  const filename = file.filename ?? "report.csv";
  const buf = await file.toBuffer();

  const { rows, warnings } = parseAndNormalizeCsv(buf);
  if (rows.length === 0) {
    return reply.status(400).send({
      error: "No usable rows found. Ensure the CSV has columns like channel/promo_method, spend/cost, revenue/sales.",
      warnings,
    });
  }

  const report = createReport({ filename, rows, warnings });

  return {
    reportId: report.reportId,
    filename: report.filename,
    rowCount: report.rows.length,
    warnings: report.warnings,
    kpis: computeKpis(report.rows),
    trend: computeTrend(report.rows),
    channels: computeChannelSummary(report.rows),
    recommendations: computeRecommendations(report.rows),
  };
});

function requireReport(reportId: string | undefined, reply: any) {
  if (!reportId) {
    reply.status(400).send({ error: "Missing reportId" });
    return undefined;
  }
  const r = getReport(reportId);
  if (!r) {
    reply.status(404).send({ error: "Report not found (maybe expired). Upload the CSV again." });
    return undefined;
  }
  return r;
}

fastify.get("/api/report/kpis", async (request, reply) => {
  const reportId = (request.query as any)?.reportId as string | undefined;
  const r = requireReport(reportId, reply);
  if (!r) return;
  return computeKpis(r.rows);
});

fastify.get("/api/report/trend", async (request, reply) => {
  const reportId = (request.query as any)?.reportId as string | undefined;
  const r = requireReport(reportId, reply);
  if (!r) return;
  return computeTrend(r.rows);
});

fastify.get("/api/report/channels", async (request, reply) => {
  const reportId = (request.query as any)?.reportId as string | undefined;
  const r = requireReport(reportId, reply);
  if (!r) return;
  return computeChannelSummary(r.rows);
});

fastify.get("/api/report/campaigns", async (request, reply) => {
  const reportId = (request.query as any)?.reportId as string | undefined;
  const r = requireReport(reportId, reply);
  if (!r) return;
  return computeCampaignSummary(r.rows);
});

fastify.get("/api/report/recommendations", async (request, reply) => {
  const reportId = (request.query as any)?.reportId as string | undefined;
  const r = requireReport(reportId, reply);
  if (!r) return;
  return computeRecommendations(r.rows);
});

// --- Channel analytics (mock data) ---
fastify.get("/api/channels/summary", async () => {
  return [
    { channel: "Google Ads", spend: 60000, revenue: 180000, conversions: 2200, cpa: 27.3 },
    { channel: "Meta Ads", spend: 40000, revenue: 120000, conversions: 1500, cpa: 26.7 },
    { channel: "LinkedIn", spend: 15000, revenue: 30000, conversions: 300, cpa: 50.0 },
    { channel: "Organic", spend: 0, revenue: 30000, conversions: 200, cpa: 0 },
  ];
});

fastify.get("/api/channels/campaigns", async () => {
  return [
    {
      id: 1,
      name: "Brand – Search",
      channel: "Google Ads",
      spend: 25000,
      revenue: 90000,
      conversions: 1100,
      roas: 3.6,
      cpa: 22.7,
      status: "active",
    },
    {
      id: 2,
      name: "Prospecting – Feed",
      channel: "Meta Ads",
      spend: 18000,
      revenue: 48000,
      conversions: 600,
      roas: 2.7,
      cpa: 30.0,
      status: "active",
    },
    {
      id: 3,
      name: "Retargeting – Dynamic",
      channel: "Meta Ads",
      spend: 22000,
      revenue: 72000,
      conversions: 900,
      roas: 3.3,
      cpa: 24.4,
      status: "active",
    },
  ];
});

// --- Funnel view (mock data) ---
fastify.get("/api/funnel/summary", async () => {
  const stages = [
    { name: "Visits", users: 20000 },
    { name: "Product views", users: 12000 },
    { name: "Add to cart", users: 6000 },
    { name: "Checkout", users: 3500 },
    { name: "Purchases", users: 2200 },
  ];

  return stages.map((stage, index) => {
    const prev = index === 0 ? stage.users : stages[index - 1].users;
    const rateFromPrev = index === 0 ? 1 : stage.users / prev;
    const dropoffFromPrev = index === 0 ? 0 : 1 - rateFromPrev;
    return {
      stage: stage.name,
      users: stage.users,
      rateFromPrev,
      dropoffFromPrev,
    };
  });
});

// --- Attribution studio (mock data) ---
fastify.get("/api/attribution/overview", async (request) => {
  const query: any = request.query;
  const model = (query.model as string) || "LAST_CLICK";

  const base = [
    { channel: "Google Ads", conversions: 1500, revenue: 120000 },
    { channel: "Meta Ads", conversions: 1100, revenue: 80000 },
    { channel: "Organic", conversions: 500, revenue: 40000 },
    { channel: "Email", conversions: 300, revenue: 20000 },
  ];

  // For now we just tweak numbers slightly per model to simulate redistribution
  const factorByModel: Record<string, number[]> = {
    LAST_CLICK: [1, 1, 1, 1],
    FIRST_CLICK: [0.9, 1.1, 1.1, 1.0],
    LINEAR: [1.0, 1.05, 1.05, 1.05],
    TIME_DECAY: [1.1, 0.95, 0.95, 0.9],
    POSITION_BASED: [1.05, 1.05, 1.0, 0.9],
  };

  const factors = factorByModel[model] ?? factorByModel.LAST_CLICK;

  const current = base.map((row, idx) => ({
    channel: row.channel,
    baselineConversions: row.conversions,
    baselineRevenue: row.revenue,
    conversions: Math.round(row.conversions * factors[idx]),
    revenue: Math.round(row.revenue * factors[idx]),
  }));

  return {
    model,
    channels: current,
  };
});

const port = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await fastify.listen({ port, host: "127.0.0.1" });
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

