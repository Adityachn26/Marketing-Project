import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReport } from "../reportContext";
import { Filter, ArrowDown, TrendingDown, AlertCircle, Info } from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { SkeletonChart, SkeletonTable } from "../components/Skeleton";

type FunnelStageRow = {
  stage: string;
  users: number;
  rateFromPrev: number;
  dropoffFromPrev: number;
};

const FUNNEL_COLORS = ["#6366f1", "#818cf8", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export function FunnelViewPage() {
  const { reportId } = useReport();
  const [stages, setStages] = useState<FunnelStageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportId) {
      setStages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/funnel/summary")
      .then((res) => res.json())
      .then(setStages)
      .catch((err) => console.error("Failed to load funnel summary", err))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Funnel View" />
        <SkeletonChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonTable rows={5} />
          <SkeletonTable rows={3} />
        </div>
      </div>
    );
  }

  if (reportId) {
    return (
      <div className="space-y-8">
        <PageHeader title="Funnel View" subtitle="User journey analysis" />
        <Card>
          <EmptyState
            icon={<AlertCircle className="w-8 h-8" />}
            title="Funnel Data Not Available"
            description="Funnel analysis requires stage-level event data (page views, add-to-cart, checkout, purchase) which isn't present in most marketing spend CSVs. Upload a funnel/events CSV or clear the current CSV to view the demo."
          />
        </Card>
      </div>
    );
  }

  // Visual funnel representation
  const maxUsers = stages[0]?.users || 1;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Funnel View"
        subtitle="User journey analysis with stage conversion rates"
        badge="Demo Data"
      />

      {/* Visual Funnel */}
      <Card padding="lg">
        <CardHeader
          title="Conversion Funnel"
          subtitle="Visual representation of user journey stages"
          icon={<Filter className="w-5 h-5" />}
        />
        <div className="flex flex-col items-center gap-1 py-6">
          {stages.map((stage, index) => {
            const widthPct = Math.max((stage.users / maxUsers) * 100, 20);
            const color = FUNNEL_COLORS[index % FUNNEL_COLORS.length];
            return (
              <div key={stage.stage} className="w-full flex flex-col items-center">
                <div
                  className="relative flex items-center justify-center py-4 rounded-xl text-white font-medium text-sm transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: color,
                    minWidth: "200px",
                  }}
                >
                  <div className="flex items-center justify-between w-full px-6">
                    <span className="font-semibold">{stage.stage}</span>
                    <span className="text-white/90 font-bold">{stage.users.toLocaleString()}</span>
                  </div>
                </div>
                {index < stages.length - 1 && (
                  <div className="flex items-center gap-2 py-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>
                      {((stages[index + 1].users / stage.users) * 100).toFixed(1)}% continue
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Funnel Bar Chart */}
      <Card padding="lg">
        <CardHeader
          title="Stage Volume"
          subtitle="User count at each funnel stage"
          icon={<TrendingDown className="w-5 h-5" />}
        />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stages} layout="vertical" margin={{ left: 20, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toLocaleString()}
              />
              <YAxis
                dataKey="stage"
                type="category"
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
                formatter={(value: any) => [value.toLocaleString(), "Users"]}
              />
              <Bar dataKey="users" name="Users" radius={[0, 8, 8, 0]}>
                {stages.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                ))}
                <LabelList
                  dataKey="users"
                  position="right"
                  formatter={(v: number) => v.toLocaleString()}
                  style={{ fontSize: "12px", fontWeight: 600, fill: "#475569" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Conversion Table */}
        <Card padding="lg">
          <CardHeader
            title="Stage Conversion Rates"
            subtitle="Step-by-step conversion percentages"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4 rounded-l-lg">Stage</th>
                  <th className="text-right py-3 px-4">Users</th>
                  <th className="text-right py-3 px-4">From Previous</th>
                  <th className="text-right py-3 px-4 rounded-r-lg">Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((s, idx) => (
                  <tr key={s.stage} className="table-row">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }}
                        />
                        {s.stage}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-200">
                      {s.users.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {idx === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span className="badge-success">
                          {(s.rateFromPrev * 100).toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {idx === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span className={`badge ${s.dropoffFromPrev > 0.3 ? "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-950/50 dark:text-red-400" : "badge-warning"}`}>
                          {(s.dropoffFromPrev * 100).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Implementation Notes */}
        <Card padding="lg">
          <CardHeader
            title="About This View"
            subtitle="Implementation details"
            icon={<Info className="w-5 h-5" />}
          />
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/30">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                In a full implementation, this view would be driven by <strong>funnel event data</strong> from
                your web/app analytics (e.g., page views, add-to-cart, checkout, purchase) stored in the{" "}
                <code className="px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-mono">
                  FunnelEvent
                </code>{" "}
                and{" "}
                <code className="px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-mono">
                  FunnelStage
                </code>{" "}
                tables.
              </p>
            </div>
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p>📊 Currently showing <strong>mock data</strong> for demonstration</p>
              <p>🔌 Connect your analytics platform to see real funnel data</p>
              <p>📈 Supports custom funnel stage definitions</p>
              <p>🎯 Drop-off analysis helps identify optimization opportunities</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

