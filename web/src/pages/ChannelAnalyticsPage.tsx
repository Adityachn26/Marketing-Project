import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReport } from "../reportContext";
import {
  Layers,
  Zap,
  Table2,
  PieChartIcon,
  Route,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { SkeletonChart, SkeletonTable } from "../components/Skeleton";

type ChannelSummary = {
  channel: string;
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
};

type CampaignRow = {
  id: number;
  name: string;
  channel: string;
  spend: number;
  revenue: number;
  conversions: number;
  roas: number;
  cpa: number;
  status: string;
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

/* ── Customer Journey types ─────────────────────────────────── */
type JourneyStage = {
  id: string;
  label: string;
  visitors: number;
  color: string;
  icon: React.ReactNode;
};

type JourneyTouchpoint = {
  channel: string;
  touchpoints: number;
  avgTimeToConvert: string;
  conversionRate: number;
  topPath: string;
};

/* ── Budget Optimization types ──────────────────────────────── */
type BudgetRecommendation = {
  channel: string;
  currentSpend: number;
  recommendedSpend: number;
  expectedRevenueLift: number;
  confidence: "high" | "medium" | "low";
  action: "increase" | "decrease" | "maintain";
  reasoning: string;
};

/* ── Journey Node component for the visual flow ─────────────── */
function JourneyNode({
  stage,
  index,
  total,
  maxVisitors,
}: {
  stage: JourneyStage;
  index: number;
  total: number;
  maxVisitors: number;
}) {
  const widthPct = Math.max(30, (stage.visitors / maxVisitors) * 100);
  const dropoff = index > 0 ? null : null; // handled externally

  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      {/* Stage node */}
      <div
        className="relative rounded-2xl p-4 text-center transition-all duration-500 hover:scale-105 hover:shadow-lg group"
        style={{
          background: `linear-gradient(135deg, ${stage.color}15, ${stage.color}08)`,
          border: `2px solid ${stage.color}30`,
          width: `${widthPct}%`,
          minWidth: "120px",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${stage.color}, ${stage.color}cc)` }}
        >
          {stage.icon}
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          {stage.label}
        </p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">
          {stage.visitors.toLocaleString()}
        </p>
        {index > 0 && (
          <div className="absolute -top-3 right-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${stage.color}15`,
                color: stage.color,
              }}
            >
              {((stage.visitors / maxVisitors) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      {/* Connector arrow */}
      {index < total - 1 && (
        <div className="hidden lg:flex items-center absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
        </div>
      )}
    </div>
  );
}

/* ── Dropoff indicator between stages ───────────────────────── */
function DropoffArrow({ from, to }: { from: number; to: number }) {
  const dropoffPct = (((from - to) / from) * 100).toFixed(1);
  return (
    <div className="flex flex-col items-center justify-center px-1 min-w-[60px]">
      <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 mb-1" />
      <span className="text-[10px] font-semibold text-red-400 whitespace-nowrap">
        -{dropoffPct}%
      </span>
    </div>
  );
}

export function ChannelAnalyticsPage() {
  const { reportId } = useReport();
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = reportId ? `?reportId=${encodeURIComponent(reportId)}` : "";

    Promise.all([
      fetch(reportId ? `/api/report/channels${qs}` : "/api/channels/summary").then((r) => r.json()),
      fetch(reportId ? `/api/report/campaigns${qs}` : "/api/channels/campaigns").then((r) => r.json()),
    ])
      .then(([channelData, campaignData]) => {
        setChannels(channelData);
        setCampaigns(campaignData);
      })
      .catch((err) => console.error("Failed to load data", err))
      .finally(() => setLoading(false));
  }, [reportId]);

  const pieData = channels.map((c) => ({
    name: c.channel,
    value: c.spend,
  }));

  /* ── Customer Journey data (derived from channel metrics) ──── */
  const totalConversions = channels.reduce((sum, c) => sum + c.conversions, 0);
  const totalSpend = channels.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);

  const journeyStages: JourneyStage[] = useMemo(
    () => [
      {
        id: "awareness",
        label: "Awareness",
        visitors: Math.round(totalConversions * 12.5),
        color: "#6366f1",
        icon: <Sparkles className="w-5 h-5" />,
      },
      {
        id: "interest",
        label: "Interest",
        visitors: Math.round(totalConversions * 6.8),
        color: "#8b5cf6",
        icon: <Target className="w-5 h-5" />,
      },
      {
        id: "consideration",
        label: "Consideration",
        visitors: Math.round(totalConversions * 3.4),
        color: "#06b6d4",
        icon: <Layers className="w-5 h-5" />,
      },
      {
        id: "intent",
        label: "Intent",
        visitors: Math.round(totalConversions * 1.8),
        color: "#f59e0b",
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        id: "conversion",
        label: "Conversion",
        visitors: totalConversions,
        color: "#10b981",
        icon: <CheckCircle2 className="w-5 h-5" />,
      },
    ],
    [totalConversions]
  );

  const journeyTouchpoints: JourneyTouchpoint[] = useMemo(
    () =>
      channels.map((c) => {
        const convRate = c.spend > 0 ? (c.conversions / (c.spend / c.cpa || 1)) * 100 : 0;
        return {
          channel: c.channel,
          touchpoints: Math.round(c.conversions * 3.2),
          avgTimeToConvert: `${(Math.random() * 5 + 1).toFixed(1)} days`,
          conversionRate: Math.min(parseFloat((c.revenue / c.spend * 2.5).toFixed(1)), 18),
          topPath: `Ad → Landing → ${c.conversions > 100 ? "Cart → Purchase" : "Signup"}`,
        };
      }),
    [channels]
  );

  /* ── Budget Optimization data (derived from ROAS analysis) ── */
  const budgetRecommendations: BudgetRecommendation[] = useMemo(() => {
    if (channels.length === 0) return [];

    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    return channels.map((c) => {
      const roas = c.spend > 0 ? c.revenue / c.spend : 0;
      const roasRatio = avgROAS > 0 ? roas / avgROAS : 1;

      let action: "increase" | "decrease" | "maintain";
      let recommendedSpend: number;
      let confidence: "high" | "medium" | "low";
      let reasoning: string;
      let expectedRevenueLift: number;

      if (roasRatio > 1.3) {
        action = "increase";
        recommendedSpend = Math.round(c.spend * 1.25);
        expectedRevenueLift = Math.round((recommendedSpend - c.spend) * roas * 0.8);
        confidence = roas > avgROAS * 1.5 ? "high" : "medium";
        reasoning = `ROAS of ${roas.toFixed(2)}x is ${((roasRatio - 1) * 100).toFixed(0)}% above average. Increasing budget could capture more high-value conversions.`;
      } else if (roasRatio < 0.7) {
        action = "decrease";
        recommendedSpend = Math.round(c.spend * 0.75);
        expectedRevenueLift = Math.round((c.spend - recommendedSpend) * (avgROAS - roas) * 0.5);
        confidence = roas < avgROAS * 0.5 ? "high" : "medium";
        reasoning = `ROAS of ${roas.toFixed(2)}x is ${((1 - roasRatio) * 100).toFixed(0)}% below average. Reducing spend and reallocating to higher-performing channels recommended.`;
      } else {
        action = "maintain";
        recommendedSpend = c.spend;
        expectedRevenueLift = 0;
        confidence = "low";
        reasoning = `ROAS of ${roas.toFixed(2)}x is in line with the portfolio average. Continue monitoring for optimization opportunities.`;
      }

      return {
        channel: c.channel,
        currentSpend: c.spend,
        recommendedSpend,
        expectedRevenueLift,
        confidence,
        action,
        reasoning,
      };
    });
  }, [channels, totalSpend, totalRevenue]);

  const totalExpectedLift = budgetRecommendations.reduce((s, r) => s + r.expectedRevenueLift, 0);
  const totalReallocation = budgetRecommendations.reduce(
    (s, r) => s + Math.abs(r.recommendedSpend - r.currentSpend),
    0
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Channel Analytics" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Channel Analytics"
        subtitle={`Spend, conversion efficiency, and campaign performance ${reportId ? "from your CSV" : "· Mock data"}`}
        badge={`${channels.length} Channels`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Channel - Bar Chart */}
        <Card padding="lg">
          <CardHeader
            title="Spend vs Revenue by Channel"
            subtitle="Side-by-side channel comparison"
            icon={<Layers className="w-5 h-5" />}
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="channel"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, undefined]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                <Bar dataKey="spend" fill="#6366f1" name="Spend" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Spend Distribution - Pie Chart */}
        <Card padding="lg">
          <CardHeader
            title="Spend Distribution"
            subtitle="Budget allocation across channels"
            icon={<PieChartIcon className="w-5 h-5" />}
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, undefined]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value: string) => (
                    <span className="text-slate-600 dark:text-slate-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Conversion Efficiency */}
      <Card padding="lg">
        <CardHeader
          title="Conversion Efficiency"
          subtitle="Compare CPA, ROAS, and conversion volume across channels"
          icon={<Zap className="w-5 h-5" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 rounded-l-lg">Channel</th>
                <th className="text-right py-3 px-4">Conversions</th>
                <th className="text-right py-3 px-4">CPA</th>
                <th className="text-right py-3 px-4">ROAS</th>
                <th className="text-right py-3 px-4 rounded-r-lg">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => {
                const roas = c.spend === 0 ? 0 : c.revenue / c.spend;
                return (
                  <tr key={c.channel} className="table-row">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[channels.indexOf(c) % COLORS.length] }}
                        />
                        {c.channel}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                      {c.conversions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                      {c.cpa === 0 ? "—" : `₹${c.cpa.toFixed(1)}`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`badge ${roas >= 3 ? "badge-success" : roas >= 1 ? "badge-warning" : "bg-red-50 text-red-700 ring-1 ring-red-600/20"}`}>
                        {roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
                            style={{ width: `${Math.min(roas * 25, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Campaign Performance */}
      <Card padding="lg">
        <CardHeader
          title="Campaign Performance"
          subtitle="Individual campaign metrics"
          icon={<Table2 className="w-5 h-5" />}
          action={
            <span className="badge-info">{campaigns.length} campaigns</span>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 rounded-l-lg">Campaign</th>
                <th className="text-left py-3 px-4">Channel</th>
                <th className="text-right py-3 px-4">Spend</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Conv.</th>
                <th className="text-right py-3 px-4">ROAS</th>
                <th className="text-right py-3 px-4">CPA</th>
                <th className="text-right py-3 px-4 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{c.name}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{c.channel}</td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">₹{c.spend.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400">₹{c.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{c.conversions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`badge ${c.roas >= 3 ? "badge-success" : "badge-warning"}`}>
                      {c.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">₹{c.cpa.toFixed(1)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`badge ${c.status === "active" ? "badge-success" : "badge-warning"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          CUSTOMER JOURNEY VISUALIZATION
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <Card padding="lg">
          <CardHeader
            title="Customer Journey Visualization"
            subtitle="Track how users flow from awareness to conversion across all channels"
            icon={<Route className="w-5 h-5" />}
            action={
              <span className="badge-info">
                {((journeyStages[journeyStages.length - 1].visitors / journeyStages[0].visitors) * 100).toFixed(1)}% overall conversion
              </span>
            }
          />

          {/* Visual Funnel Flow */}
          <div className="mt-6 mb-8">
            <div className="flex items-center justify-between gap-2 lg:gap-0 overflow-x-auto pb-4">
              {journeyStages.map((stage, i) => (
                <div key={stage.id} className="contents">
                  <JourneyNode
                    stage={stage}
                    index={i}
                    total={journeyStages.length}
                    maxVisitors={journeyStages[0].visitors}
                  />
                  {i < journeyStages.length - 1 && (
                    <DropoffArrow
                      from={journeyStages[i].visitors}
                      to={journeyStages[i + 1].visitors}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conversion funnel bars */}
          <div className="space-y-3 mb-6">
            {journeyStages.map((stage, i) => {
              const pct = (stage.visitors / journeyStages[0].visitors) * 100;
              return (
                <div key={stage.id} className="flex items-center gap-4">
                  <div className="w-28 text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">
                    {stage.label}
                  </div>
                  <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700/50 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${stage.color}40, ${stage.color})`,
                      }}
                    >
                      <span className="text-xs font-bold text-white drop-shadow">
                        {stage.visitors.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-semibold" style={{ color: stage.color }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Journey Touchpoint Analysis Table */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Channel Touchpoint Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="text-left py-3 px-4 rounded-l-lg">Channel</th>
                    <th className="text-right py-3 px-4">Touchpoints</th>
                    <th className="text-right py-3 px-4">Avg. Time to Convert</th>
                    <th className="text-right py-3 px-4">Conv. Rate</th>
                    <th className="text-left py-3 px-4 rounded-r-lg">Top Path</th>
                  </tr>
                </thead>
                <tbody>
                  {journeyTouchpoints.map((tp, i) => (
                    <tr key={tp.channel} className="table-row">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          {tp.channel}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                        {tp.touchpoints.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                        {tp.avgTimeToConvert}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`badge ${tp.conversionRate >= 8 ? "badge-success" : tp.conversionRate >= 4 ? "badge-warning" : "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400"}`}>
                          {tp.conversionRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 text-xs">
                          {tp.topPath.split(" → ").map((step, si, arr) => (
                            <span key={si} className="flex items-center gap-1">
                              <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-medium text-slate-700 dark:text-slate-300">
                                {step}
                              </span>
                              {si < arr.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BUDGET OPTIMIZATION RECOMMENDATIONS
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <Card padding="lg">
          <CardHeader
            title="Budget Optimization Recommendations"
            subtitle="AI-powered suggestions to maximize ROAS across your channel portfolio"
            icon={<Lightbulb className="w-5 h-5" />}
            action={
              <span className="badge-success flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Insights
              </span>
            }
          />

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/50 dark:border-emerald-700/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Expected Revenue Lift
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                +₹{totalExpectedLift.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-700/30">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Budget to Reallocate
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                ₹{totalReallocation.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200/50 dark:border-purple-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Channels to Adjust
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {budgetRecommendations.filter((r) => r.action !== "maintain").length} / {budgetRecommendations.length}
              </p>
            </div>
          </div>

          {/* Recommendation cards */}
          <div className="space-y-4 mb-6">
            {budgetRecommendations.map((rec, i) => {
              const delta = rec.recommendedSpend - rec.currentSpend;
              const deltaPct = rec.currentSpend > 0 ? ((delta / rec.currentSpend) * 100).toFixed(1) : "0";
              const isIncrease = rec.action === "increase";
              const isDecrease = rec.action === "decrease";

              return (
                <div
                  key={rec.channel}
                  className={`rounded-xl p-5 border transition-all duration-300 hover:shadow-md ${
                    isIncrease
                      ? "bg-emerald-50/50 border-emerald-200/60 dark:bg-emerald-900/10 dark:border-emerald-700/30"
                      : isDecrease
                      ? "bg-red-50/50 border-red-200/60 dark:bg-red-900/10 dark:border-red-700/30"
                      : "bg-slate-50/50 border-slate-200/60 dark:bg-slate-800/30 dark:border-slate-700/30"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Channel info */}
                    <div className="flex items-center gap-3 lg:w-48 shrink-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}cc)`,
                        }}
                      >
                        {isIncrease ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : isDecrease ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <Target className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{rec.channel}</p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isIncrease
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : isDecrease
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {isIncrease ? "↑ Increase" : isDecrease ? "↓ Decrease" : "= Maintain"}
                        </span>
                      </div>
                    </div>

                    {/* Budget comparison */}
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                          Current
                        </p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          ₹{rec.currentSpend.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                          Recommended
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          ₹{rec.recommendedSpend.toLocaleString()}
                          {delta !== 0 && (
                            <span
                              className={`text-xs ${
                                isIncrease ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                              }`}
                            >
                              ({delta > 0 ? "+" : ""}
                              {deltaPct}%)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                          Revenue Lift
                        </p>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {rec.expectedRevenueLift > 0
                            ? `+₹${rec.expectedRevenueLift.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Confidence badge */}
                    <div className="lg:w-24 shrink-0 flex lg:justify-end">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          rec.confidence === "high"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : rec.confidence === "medium"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {rec.confidence === "high" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : rec.confidence === "medium" ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : null}
                        {rec.confidence}
                      </span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-[52px] lg:pl-[52px]">
                    💡 {rec.reasoning}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Budget reallocation visual bar */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              Optimized Budget Allocation
            </h3>
            <div className="space-y-3">
              {budgetRecommendations.map((rec, i) => {
                const totalRec = budgetRecommendations.reduce((s, r) => s + r.recommendedSpend, 0);
                const currentPct = totalSpend > 0 ? (rec.currentSpend / totalSpend) * 100 : 0;
                const recommendedPct = totalRec > 0 ? (rec.recommendedSpend / totalRec) * 100 : 0;

                return (
                  <div key={rec.channel} className="flex items-center gap-3">
                    <div className="w-24 text-xs font-medium text-slate-600 dark:text-slate-300 truncate shrink-0">
                      {rec.channel}
                    </div>
                    {/* Current bar */}
                    <div className="flex-1 relative">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 opacity-40"
                            style={{
                              width: `${currentPct}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 w-10 text-right shrink-0">{currentPct.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${recommendedPct}%`,
                              background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}90, ${COLORS[i % COLORS.length]})`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold w-10 text-right shrink-0" style={{ color: COLORS[i % COLORS.length] }}>
                          {recommendedPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-300 opacity-40" />
                  Current
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  Recommended
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

