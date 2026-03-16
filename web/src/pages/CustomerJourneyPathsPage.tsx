import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  GitMerge,
  ArrowRight,
  Eye,
  Mail,
  Share2,
  TrendingUp,
  Users,
  Zap,
  MousePointerClick,
  Info,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { clsx } from "clsx";

/* ── Journey path data ───────────────────────────────────── */
type JourneyStage = {
  name: string;
  icon: typeof Mail;
  users: number;
  conversions: number;
};

type PathData = {
  path: string;
  users: number;
  conversions: number;
  revenue: number;
  avgDays: number;
};

const JOURNEY_STAGES: JourneyStage[] = [
  { name: "Awareness", icon: Eye, users: 45000, conversions: 0 },
  { name: "Consideration", icon: Share2, users: 28000, conversions: 0 },
  { name: "Decision", icon: MousePointerClick, users: 12000, conversions: 0 },
  { name: "Purchase", icon: Zap, users: 4800, conversions: 4800 },
  { name: "Retention", icon: Users, users: 3840, conversions: 3840 },
];

const JOURNEY_PATHS: PathData[] = [
  { path: "Display → Search → Email → Purchase", users: 2400, conversions: 384, revenue: 30720, avgDays: 18 },
  { path: "Social → Search → Purchase", users: 1800, conversions: 324, revenue: 25920, avgDays: 12 },
  { path: "Search → Email → Purchase", users: 1600, conversions: 320, revenue: 25600, avgDays: 8 },
  { path: "Referral → Purchase", users: 1200, conversions: 240, revenue: 19200, avgDays: 5 },
  { path: "Social → Display → Search → Purchase", users: 900, conversions: 180, revenue: 14400, avgDays: 22 },
];

const TOUCHPOINT_TIMELINE = [
  { day: 1, awareness: 45, consideration: 28, decision: 12, purchase: 4.8, revenue: 24000 },
  { day: 3, awareness: 42, consideration: 30, decision: 14, purchase: 5.2, revenue: 26000 },
  { day: 5, awareness: 44, consideration: 32, decision: 16, purchase: 6.4, revenue: 32000 },
  { day: 7, awareness: 46, consideration: 35, decision: 18, purchase: 7.2, revenue: 36000 },
  { day: 10, awareness: 48, consideration: 38, decision: 20, purchase: 8.0, revenue: 40000 },
  { day: 14, awareness: 50, consideration: 40, decision: 22, purchase: 8.8, revenue: 44000 },
  { day: 21, awareness: 52, consideration: 42, decision: 24, purchase: 9.6, revenue: 48000 },
];

export function CustomerJourneyPathsPage() {
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [metricsView, setMetricsView] = useState<"funnel" | "timeline">("funnel");

  const totalUsers = JOURNEY_STAGES[0].users;
  const totalConversions = JOURNEY_STAGES.reduce((s, x) => s + x.conversions, 0);
  const conversionRate = totalConversions > 0 ? (totalConversions / totalUsers) * 100 : 0;
  const totalRevenue = JOURNEY_PATHS.reduce((s, x) => s + x.revenue, 0);

  const funnelDropoff = useMemo(() => {
    return JOURNEY_STAGES.map((stage, i) => {
      const prev = i === 0 ? totalUsers : JOURNEY_STAGES[i - 1].users;
      const dropoff = i === 0 ? 0 : ((prev - stage.users) / prev) * 100;
      return {
        ...stage,
        dropoff,
        remainingPct: (stage.users / totalUsers) * 100,
      };
    });
  }, [totalUsers]);

  const selectedPathData = selectedPath !== null ? JOURNEY_PATHS[selectedPath] : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customer Journey Paths"
        subtitle="Visualize how customers navigate through your funnel"
        badge="Beta"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card hover className="stat-card-3d animate-slide-up">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            <AnimatedNumber value={totalUsers / 1000} decimals={1} suffix="k" />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "80ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversions</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <AnimatedNumber value={totalConversions} />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "160ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversion Rate</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            <AnimatedNumber value={conversionRate} decimals={1} suffix="%" />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "240ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            <AnimatedNumber value={totalRevenue} prefix="₹" />
          </p>
        </Card>
      </div>

      {/* Funnel visualization */}
      <Card padding="lg">
        <CardHeader
          title="Funnel Overview"
          subtitle="User progression through each stage"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <div className="space-y-4">
          {funnelDropoff.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={stage.name}>
                {/* Stage header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-brand-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-900 dark:text-white">{stage.users.toLocaleString()}</strong> users
                    </span>
                    {i > 0 && (
                      <span className={clsx(
                        "text-xs font-medium",
                        stage.dropoff > 20 ? "text-red-500" : stage.dropoff > 10 ? "text-amber-500" : "text-emerald-500"
                      )}>
                        {stage.dropoff.toFixed(1)}% dropoff
                      </span>
                    )}
                  </div>
                </div>

                {/* Funnel bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-xl transition-all duration-500 bg-gradient-to-r from-brand-500 to-purple-500"
                      style={{ width: `${stage.remainingPct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-12 text-right">
                    {stage.remainingPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline vs Funnel toggle */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setMetricsView("funnel")}
          className={clsx(
            "px-4 py-2 rounded-xl font-medium text-sm transition-all",
            metricsView === "funnel"
              ? "bg-brand-500 text-white shadow-lg"
              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
          )}
        >
          Funnel View
        </button>
        <button
          onClick={() => setMetricsView("timeline")}
          className={clsx(
            "px-4 py-2 rounded-xl font-medium text-sm transition-all",
            metricsView === "timeline"
              ? "bg-brand-500 text-white shadow-lg"
              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
          )}
        >
          Timeline View
        </button>
      </div>

      {/* Timeline chart */}
      {metricsView === "timeline" && (
        <Card padding="lg">
          <CardHeader
            title="Funnel Metrics Over Time"
            subtitle="How each stage evolves across days"
            icon={<Info className="w-5 h-5" />}
          />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TOUCHPOINT_TIMELINE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" label={{ value: "Days", position: "insideBottomRight", offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: "Users (k)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Revenue (₹k)", angle: 90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="awareness" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="consideration" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="decision" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="purchase" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Revenue (₹k)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Top paths */}
      <Card padding="lg">
        <CardHeader
          title="Top Conversion Paths"
          subtitle="Click a path to see detailed insights"
          icon={<GitMerge className="w-5 h-5" />}
        />
        <div className="space-y-3">
          {JOURNEY_PATHS.map((path, i) => {
            const isSelected = selectedPath === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedPath(isSelected ? null : i)}
                className={clsx(
                  "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-brand-400 bg-brand-50/50 dark:bg-brand-950/30 shadow-glow"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {path.path.split(" → ").map((step, si) => (
                    <span key={si} className="flex items-center gap-1">
                      {si > 0 && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {step}
                      </span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex gap-4">
                    <span><strong className="text-slate-700 dark:text-slate-200">{path.users.toLocaleString()}</strong> users</span>
                    <span><strong className="text-emerald-600 dark:text-emerald-400">{path.conversions}</strong> conversions</span>
                    <span><strong className="text-purple-600 dark:text-purple-400">₹{path.revenue.toLocaleString()}</strong></span>
                  </div>
                  <span className="badge-info">{path.avgDays}d avg</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Path details */}
      {selectedPathData && (
        <Card padding="lg" className="border-l-4 border-l-brand-500">
          <CardHeader
            title="Path Details"
            subtitle={`Deep dive: ${JOURNEY_PATHS[selectedPath!].path}`}
            icon={<Info className="w-5 h-5" />}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Users</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                <AnimatedNumber value={selectedPathData.users} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Conversions</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                <AnimatedNumber value={selectedPathData.conversions} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Conversion Rate</p>
              <p className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                {((selectedPathData.conversions / selectedPathData.users) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Avg. Journey Days</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {selectedPathData.avgDays}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
