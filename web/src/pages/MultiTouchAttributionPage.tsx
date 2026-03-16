import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  GitMerge,
  MousePointerClick,
  Eye,
  Mail,
  Share2,
  ArrowRight,
  Info,
  TrendingUp,
  Percent,
  Zap,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { AnimatedNumber } from "../components/AnimatedNumber";

/* ── Types ───────────────────────────────────────────────── */
type TouchpointData = {
  channel: string;
  firstTouch: number;
  lastTouch: number;
  linear: number;
  timDecay: number;
  positionBased: number;
  conversions: number;
  revenue: number;
};

type JourneyPath = {
  path: string[];
  users: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
};

/* ── Mock data ───────────────────────────────────────────── */
const TOUCHPOINT_DATA: TouchpointData[] = [
  { channel: "Google Ads", firstTouch: 35, lastTouch: 28, linear: 25, timDecay: 27, positionBased: 30, conversions: 1500, revenue: 120000 },
  { channel: "Meta Ads", firstTouch: 25, lastTouch: 22, linear: 22, timDecay: 20, positionBased: 23, conversions: 1100, revenue: 85000 },
  { channel: "Organic SEO", firstTouch: 20, lastTouch: 12, linear: 18, timDecay: 15, positionBased: 17, conversions: 700, revenue: 55000 },
  { channel: "Email", firstTouch: 8, lastTouch: 25, linear: 20, timDecay: 22, positionBased: 16, conversions: 900, revenue: 65000 },
  { channel: "Direct", firstTouch: 5, lastTouch: 8, linear: 8, timDecay: 10, positionBased: 7, conversions: 400, revenue: 30000 },
  { channel: "Referral", firstTouch: 7, lastTouch: 5, linear: 7, timDecay: 6, positionBased: 7, conversions: 300, revenue: 20000 },
];

const JOURNEY_PATHS: JourneyPath[] = [
  { path: ["Google Ads", "Direct", "Email"], users: 3200, conversions: 480, revenue: 38400, conversionRate: 15.0 },
  { path: ["Organic SEO", "Meta Ads", "Email"], users: 2800, conversions: 392, revenue: 31360, conversionRate: 14.0 },
  { path: ["Meta Ads", "Google Ads"], users: 2500, conversions: 325, revenue: 26000, conversionRate: 13.0 },
  { path: ["Google Ads", "Meta Ads", "Direct", "Email"], users: 1900, conversions: 304, revenue: 24320, conversionRate: 16.0 },
  { path: ["Referral", "Google Ads", "Email"], users: 1500, conversions: 210, revenue: 16800, conversionRate: 14.0 },
  { path: ["Organic SEO", "Direct"], users: 4200, conversions: 378, revenue: 30240, conversionRate: 9.0 },
  { path: ["Email", "Direct"], users: 3800, conversions: 494, revenue: 39520, conversionRate: 13.0 },
  { path: ["Google Ads"], users: 5000, conversions: 350, revenue: 28000, conversionRate: 7.0 },
];

const MODELS = [
  { key: "firstTouch" as const, label: "First Touch", desc: "Credit to first interaction", icon: Eye },
  { key: "lastTouch" as const, label: "Last Touch", desc: "Credit to final interaction", icon: MousePointerClick },
  { key: "linear" as const, label: "Linear", desc: "Equal credit to all touchpoints", icon: Share2 },
  { key: "timDecay" as const, label: "Time Decay", desc: "More credit to recent touches", icon: TrendingUp },
  { key: "positionBased" as const, label: "Position-Based", desc: "40/20/40 split", icon: Zap },
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const CHANNEL_ICONS: Record<string, typeof Mail> = {
  "Google Ads": MousePointerClick,
  "Meta Ads": Share2,
  "Organic SEO": Eye,
  "Email": Mail,
  "Direct": ArrowRight,
  "Referral": GitMerge,
};

export function MultiTouchAttributionPage() {
  const [selectedModel, setSelectedModel] = useState<typeof MODELS[number]["key"]>("linear");
  const [selectedPath, setSelectedPath] = useState<number | null>(null);

  const modelInfo = MODELS.find((m) => m.key === selectedModel)!;

  const pieData = useMemo(() => {
    return TOUCHPOINT_DATA.map((d) => ({
      name: d.channel,
      value: d[selectedModel],
    }));
  }, [selectedModel]);

  const comparisonData = useMemo(() => {
    return TOUCHPOINT_DATA.map((d) => ({
      channel: d.channel,
      "First Touch": d.firstTouch,
      "Last Touch": d.lastTouch,
      Linear: d.linear,
      "Time Decay": d.timDecay,
      "Position-Based": d.positionBased,
    }));
  }, []);

  const totalConversions = TOUCHPOINT_DATA.reduce((s, d) => s + d.conversions, 0);
  const totalRevenue = TOUCHPOINT_DATA.reduce((s, d) => s + d.revenue, 0);
  const avgTouchpoints = 2.8;

  const sortedPaths = useMemo(() => {
    return [...JOURNEY_PATHS].sort((a, b) => b.conversions - a.conversions);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Touch Attribution"
        subtitle="Understand how every touchpoint contributes to conversions"
        badge="Advanced"
      />

      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover className="stat-card-3d animate-slide-up">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Attributed Conversions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            <AnimatedNumber value={totalConversions} />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "80ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue Attributed</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <AnimatedNumber value={totalRevenue} prefix="₹" />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "160ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Touchpoints per Conversion</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            <AnimatedNumber value={avgTouchpoints} decimals={1} />
          </p>
        </Card>
      </div>

      {/* Model selector */}
      <Card padding="lg">
        <CardHeader
          title="Attribution Model"
          subtitle="Select a model to see how credit is distributed"
          icon={<GitMerge className="w-5 h-5" />}
        />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MODELS.map((m) => {
            const Icon = m.icon;
            const active = selectedModel === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelectedModel(m.key)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  active
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40 shadow-glow"
                    : "border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${active ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`} />
                <p className={`text-sm font-semibold ${active ? "text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-300"}`}>
                  {m.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <Card padding="lg">
          <CardHeader
            title={`${modelInfo.label} Credit Distribution`}
            subtitle="Share of credit by channel (%)"
            icon={<Percent className="w-5 h-5" />}
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
                  label={({ name, value }) => `${name}: ${value}%`}
                  animationDuration={600}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`, "Credit Share"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cross-model comparison bar chart */}
        <Card padding="lg">
          <CardHeader
            title="Cross-Model Comparison"
            subtitle="How credit shifts across models"
            icon={<Info className="w-5 h-5" />}
          />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="First Touch" fill="#6366f1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Last Touch" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Linear" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Time Decay" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Position-Based" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Channel detail table */}
      <Card padding="lg">
        <CardHeader
          title="Channel Attribution Detail"
          subtitle="Conversions & revenue per channel"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 rounded-l-lg">Channel</th>
                <th className="text-right py-3 px-4">Credit ({modelInfo.label})</th>
                <th className="text-right py-3 px-4">Conversions</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4 rounded-r-lg">Rev / Conversion</th>
              </tr>
            </thead>
            <tbody>
              {TOUCHPOINT_DATA.map((d, i) => (
                <tr key={d.channel} className="table-row">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    {d.channel}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="badge-info">{d[selectedModel]}%</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                    {d.conversions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    ₹{d.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                    ₹{d.conversions > 0 ? (d.revenue / d.conversions).toFixed(0) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top conversion paths */}
      <Card padding="lg">
        <CardHeader
          title="Top Conversion Paths"
          subtitle="Most common multi-touch journeys that lead to conversion"
          icon={<Share2 className="w-5 h-5" />}
        />
        <div className="space-y-3">
          {sortedPaths.slice(0, 6).map((p, i) => {
            const isSelected = selectedPath === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedPath(isSelected ? null : i)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "border-brand-400 bg-brand-50/50 dark:bg-brand-950/30 shadow-glow"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {/* Path flow */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {p.path.map((step, si) => {
                    const Icon = CHANNEL_ICONS[step] || ArrowRight;
                    return (
                      <span key={si} className="flex items-center gap-1">
                        {si > 0 && <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-1" />}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <Icon className="w-3 h-3" />
                          {step}
                        </span>
                      </span>
                    );
                  })}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <span><strong className="text-slate-700 dark:text-slate-200">{p.users.toLocaleString()}</strong> users</span>
                  <span><strong className="text-emerald-600 dark:text-emerald-400">{p.conversions}</strong> conversions</span>
                  <span><strong className="text-emerald-600 dark:text-emerald-400">₹{p.revenue.toLocaleString()}</strong> revenue</span>
                  <span className="badge-success">{p.conversionRate}% conv. rate</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
