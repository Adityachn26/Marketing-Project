import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReport } from "../reportContext";
import {
  GitBranch,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Shuffle,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { SkeletonChart, SkeletonTable } from "../components/Skeleton";

type AttributionChannelRow = {
  channel: string;
  baselineConversions: number;
  baselineRevenue: number;
  conversions: number;
  revenue: number;
};

const MODEL_OPTIONS = [
  { label: "Last Click", value: "LAST_CLICK", description: "All credit goes to the last touchpoint" },
  { label: "First Click", value: "FIRST_CLICK", description: "All credit goes to the first touchpoint" },
  { label: "Linear", value: "LINEAR", description: "Equal credit across all touchpoints" },
  { label: "Time Decay", value: "TIME_DECAY", description: "More credit to recent touchpoints" },
  { label: "Position-Based", value: "POSITION_BASED", description: "40% first, 40% last, 20% middle" },
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function AttributionStudioPage() {
  const { reportId } = useReport();
  const [model, setModel] = useState<string>("LAST_CLICK");
  const [rows, setRows] = useState<AttributionChannelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ model });
    fetch(`/api/attribution/overview?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setRows(data.channels))
      .catch((err) => console.error("Failed to load attribution overview", err))
      .finally(() => setLoading(false));
  }, [model, reportId]);

  const tableData = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        revenueDelta: r.revenue - r.baselineRevenue,
        revenueDeltaPct: r.baselineRevenue === 0 ? 0 : (r.revenue - r.baselineRevenue) / r.baselineRevenue,
      })),
    [rows]
  );

  // Radar chart data
  const radarData = rows.map((r) => ({
    channel: r.channel,
    conversions: r.conversions,
    revenue: r.revenue / 1000,
  }));

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Attribution Studio" />
        <SkeletonChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonTable />
        </div>
      </div>
    );
  }

  if (reportId) {
    return (
      <div className="space-y-8">
        <PageHeader title="Attribution Studio" subtitle="Multi-touch attribution analysis" />
        <Card>
          <EmptyState
            icon={<AlertCircle className="w-8 h-8" />}
            title="Attribution Data Not Available"
            description="Attribution analysis requires user journey touchpoint data which isn't present in most spend/revenue CSVs. Clear the CSV to view the demo attribution models."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Attribution Studio"
        subtitle="Explore how different models redistribute credit across channels"
        badge="Demo Data"
      />

      {/* Model Selector */}
      <Card padding="lg">
        <CardHeader
          title="Attribution Model"
          subtitle="Select a model to see how channel credit changes"
          icon={<Shuffle className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MODEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setModel(opt.value)}
              className={`relative p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                model === opt.value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-md shadow-brand-500/10"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {model === opt.value && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
              <p className={`text-sm font-semibold ${
                model === opt.value
                  ? "text-brand-700 dark:text-brand-300"
                  : "text-slate-700 dark:text-slate-200"
              }`}>
                {opt.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {opt.description}
              </p>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Credit Distribution */}
        <Card padding="lg">
          <CardHeader
            title="Channel Credit Distribution"
            subtitle={`Based on ${MODEL_OPTIONS.find((m) => m.value === model)?.label} model`}
            icon={<GitBranch className="w-5 h-5" />}
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} barGap={4}>
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                <Bar dataKey="conversions" fill="#6366f1" name="Conversions" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Radar Chart */}
        <Card padding="lg">
          <CardHeader
            title="Channel Radar"
            subtitle="Multi-dimensional view of channel performance"
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="channel"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar
                  name="Conversions"
                  dataKey="conversions"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="Revenue (K)"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Revenue Redistribution Table */}
      <Card padding="lg">
        <CardHeader
          title="Revenue Redistribution vs Baseline"
          subtitle="How this model shifts revenue credit compared to last-click baseline"
          icon={<Shuffle className="w-5 h-5" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 rounded-l-lg">Channel</th>
                <th className="text-right py-3 px-4">Baseline Rev.</th>
                <th className="text-right py-3 px-4">Current Rev.</th>
                <th className="text-right py-3 px-4">Δ Revenue</th>
                <th className="text-right py-3 px-4">Δ %</th>
                <th className="text-right py-3 px-4 rounded-r-lg">Impact</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((r) => (
                <tr key={r.channel} className="table-row">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {r.channel}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">
                    ₹{r.baselineRevenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-200">
                    ₹{r.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`flex items-center justify-end gap-1 font-medium ${
                      r.revenueDelta >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-500 dark:text-red-400"
                    }`}>
                      {r.revenueDelta >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {r.revenueDelta >= 0 ? "+" : ""}₹{Math.abs(r.revenueDelta).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.baselineRevenue === 0 ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className={`badge ${
                        r.revenueDeltaPct >= 0 ? "badge-success" : "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-950/50 dark:text-red-400"
                      }`}>
                        {r.revenueDeltaPct >= 0 ? "+" : ""}{(r.revenueDeltaPct * 100).toFixed(1)}%
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="w-20 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden inline-block">
                      <div
                        className={`h-full rounded-full ${r.revenueDelta >= 0 ? "bg-emerald-500" : "bg-red-400"}`}
                        style={{
                          width: `${Math.min(Math.abs(r.revenueDeltaPct) * 500, 100)}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ranking */}
      <Card padding="lg">
        <CardHeader
          title="Channel Ranking by Attributed Revenue"
          subtitle="Channels sorted by the current model's attributed revenue"
          icon={<Trophy className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rows
            .slice()
            .sort((a, b) => b.revenue - a.revenue)
            .map((r, index) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div
                  key={r.channel}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    index === 0
                      ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{medals[index] ?? `#${index + 1}`}</span>
                    <span className="text-xs font-medium text-slate-400">
                      Rank {index + 1}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">{r.channel}</p>
                  <p className="text-lg font-bold text-brand-600 dark:text-brand-400 mt-1">
                    ₹{r.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {r.conversions.toLocaleString()} conversions
                  </p>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}

