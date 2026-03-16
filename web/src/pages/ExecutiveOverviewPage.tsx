import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { useReport } from "../reportContext";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Crown,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { SkeletonCard, SkeletonChart, SkeletonTable } from "../components/Skeleton";

type OverviewKpis = {
  totalSpend: number;
  revenue: number;
  roas: number;
  conversions: number;
  cac: number;
};

type TrendPoint = { date: string; spend: number; revenue: number };
type ChannelRow = {
  channel: string;
  spend: number;
  revenue: number;
  conversions: number;
  cpa?: number;
  roas?: number;
};

const kpiConfig = [
  {
    key: "totalSpend" as const,
    label: "Total Spend",
    icon: Coins,
    prefix: "₹",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    trend: -2.4,
  },
  {
    key: "revenue" as const,
    label: "Revenue",
    icon: DollarSign,
    prefix: "₹",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    trend: 12.5,
  },
  {
    key: "roas" as const,
    label: "ROAS",
    icon: TrendingUp,
    prefix: "",
    suffix: "x",
    decimals: 2,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    trend: 8.1,
  },
  {
    key: "conversions" as const,
    label: "Conversions",
    icon: Target,
    prefix: "",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    trend: 5.3,
  },
  {
    key: "cac" as const,
    label: "CAC",
    icon: Users,
    prefix: "₹",
    decimals: 1,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/50",
    iconBg: "bg-rose-100 dark:bg-rose-900/50",
    trend: -3.2,
  },
];

export function ExecutiveOverviewPage() {
  const { reportId } = useReport();
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [recommendations, setRecommendations] = useState<{
    headline: string;
    suggestions: string[];
    bestChannels: Array<{ channel: string; roas: number; spend: number; revenue: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = reportId ? `?reportId=${encodeURIComponent(reportId)}` : "";

    Promise.all([
      fetch(reportId ? `/api/report/kpis${qs}` : "/api/overview/kpis").then((r) => r.json()),
      fetch(reportId ? `/api/report/trend${qs}` : "/api/overview/trend").then((r) => r.json()),
      fetch(reportId ? `/api/report/channels${qs}` : "/api/channels/summary").then((r) => r.json()),
      reportId
        ? fetch(`/api/report/recommendations${qs}`).then((r) => r.json())
        : Promise.resolve(null),
    ])
      .then(([kpiData, trendData, channelData, recsData]) => {
        setKpis(kpiData);
        setTrend(trendData);
        setChannels(channelData);
        setRecommendations(recsData);
      })
      .catch((err) => console.error("Failed to load data", err))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Executive Overview" subtitle="Loading your data..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart />
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive Overview"
        subtitle={
          reportId
            ? "Powered by your uploaded CSV data"
            : "Real-time marketing performance · Mock data"
        }
        badge={reportId ? "Live Data" : "Demo"}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiConfig.map((cfg, index) => {
          const value = kpis?.[cfg.key];
          const Icon = cfg.icon;
          return (
            <Card key={cfg.key} hover className="animate-slide-up stat-card-3d" style={{ animationDelay: `${index * 80}ms` } as any}>
              <div className="flex items-start justify-between" style={{ transformStyle: "preserve-3d" }}>
                <div
                  className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center`}
                  style={{
                    transform: "translateZ(12px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${cfg.trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  {cfg.trend > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(cfg.trend)}%
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {cfg.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {value !== undefined ? (
                    <AnimatedNumber
                      value={value}
                      prefix={cfg.prefix}
                      suffix={(cfg as any).suffix || ""}
                      decimals={(cfg as any).decimals || 0}
                    />
                  ) : (
                    <span className="shimmer inline-block h-7 w-24 rounded" />
                  )}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Spend vs Revenue Trend - Area Chart */}
      <Card padding="lg">
        <CardHeader
          title="Revenue vs Spend Trend"
          subtitle="Performance over the last 14 days"
          icon={<TrendingUp className="w-5 h-5" />}
          action={
            <span className="badge-info">
              {reportId ? "CSV data" : "14-day range"}
            </span>
          }
        />
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
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
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, undefined]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#gradSpend)"
                name="Spend"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#gradRevenue)"
                name="Revenue"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recommendations */}
      {recommendations && (
        <Card padding="lg" className="animate-slide-up border-l-4 border-l-amber-400">
          <CardHeader
            title="Smart Recommendations"
            subtitle="AI-powered budget optimization suggestions"
            icon={<Lightbulb className="w-5 h-5" />}
          />
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            {recommendations.headline}
          </p>
          <div className="space-y-2">
            {recommendations.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30"
              >
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{s}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Channel Performance Table */}
      <Card padding="lg">
        <CardHeader
          title="Channel Performance Ranking"
          subtitle="Revenue vs spend by channel"
          icon={<Crown className="w-5 h-5" />}
          action={
            <span className="text-xs text-slate-400">
              Top {Math.min(channels.length, 10)} channels
            </span>
          }
        />
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 rounded-l-lg">#</th>
                <th className="text-left py-3 px-4">Channel</th>
                <th className="text-right py-3 px-4">Spend</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">ROAS</th>
                <th className="text-right py-3 px-4">Conversions</th>
                <th className="text-right py-3 px-4 rounded-r-lg">CPA</th>
              </tr>
            </thead>
            <tbody>
              {channels.slice(0, 10).map((c, idx) => {
                const roas = typeof c.roas === "number" ? c.roas : c.spend > 0 ? c.revenue / c.spend : 0;
                const cpa = typeof c.cpa === "number" ? c.cpa : c.conversions > 0 ? c.spend / c.conversions : 0;
                return (
                  <tr key={c.channel} className="table-row">
                    <td className="py-3 px-4">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" :
                        idx === 1 ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" :
                        idx === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400" :
                        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{c.channel}</td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">₹{c.spend.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400">₹{c.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`badge ${roas >= 3 ? "badge-success" : roas >= 1 ? "badge-warning" : "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-950/50 dark:text-red-400"}`}>
                        {roas.toFixed(2)}x
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">{c.conversions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                      {cpa === 0 ? "—" : `₹${cpa.toFixed(1)}`}
                    </td>
                  </tr>
                );
              })}
              {channels.length === 0 && (
                <tr>
                  <td className="py-8 text-center text-slate-400 dark:text-slate-500" colSpan={7}>
                    No channel data yet. Upload a CSV to populate this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

