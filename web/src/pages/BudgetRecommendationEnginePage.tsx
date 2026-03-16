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
  LineChart,
  Line,
  ComposedChart,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { clsx } from "clsx";

/* ── Recommendation data ───────────────────────────────────── */
type ChannelRecommendation = {
  channel: string;
  current: number;
  recommended: number;
  expectedROAS: number;
  expectedRevenue: number;
  expectedCPA: number;
  reason: string;
  impact: number; // -20 to +40
};

type ScenarioData = {
  budget: number;
  revenue: number;
  roas: number;
  cpa: number;
};

const RECOMMENDATIONS: ChannelRecommendation[] = [
  {
    channel: "Google Ads",
    current: 60000,
    recommended: 85000,
    expectedROAS: 4.2,
    expectedRevenue: 357000,
    expectedCPA: 105,
    reason: "High ROAS with room to scale. Low saturation.",
    impact: 25,
  },
  {
    channel: "Meta Ads",
    current: 40000,
    recommended: 32000,
    expectedROAS: 2.6,
    expectedRevenue: 83200,
    expectedCPA: 128,
    reason: "Saturation detected. Slight reduction improves efficiency.",
    impact: -8,
  },
  {
    channel: "Email",
    current: 8000,
    recommended: 18000,
    expectedROAS: 5.8,
    expectedRevenue: 104400,
    expectedCPA: 62,
    reason: "Highest ROAS, significantly underfunded.",
    impact: 40,
  },
  {
    channel: "LinkedIn",
    current: 15000,
    recommended: 20000,
    expectedROAS: 3.2,
    expectedRevenue: 64000,
    expectedCPA: 156,
    reason: "B2B potential. Modest increase recommended.",
    impact: 12,
  },
  {
    channel: "Organic SEO",
    current: 5000,
    recommended: 12000,
    expectedROAS: 6.5,
    expectedRevenue: 78000,
    expectedCPA: 44,
    reason: "Highest ROAS potential, very efficient.",
    impact: 35,
  },
];

const SCENARIOS: ScenarioData[] = [
  { budget: 100000, revenue: 300000, roas: 3.0, cpa: 125 },
  { budget: 120000, revenue: 360000, roas: 3.0, cpa: 115 },
  { budget: 140000, revenue: 450000, roas: 3.2, cpa: 108 },
  { budget: 160000, revenue: 540000, roas: 3.4, cpa: 102 },
  { budget: 180000, revenue: 630000, roas: 3.5, cpa: 98 },
];

export function BudgetRecommendationEnginePage() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const totalCurrentBudget = RECOMMENDATIONS.reduce((s, r) => s + r.current, 0);
  const totalRecommendedBudget = RECOMMENDATIONS.reduce((s, r) => s + r.recommended, 0);
  const currentRevenue = RECOMMENDATIONS.reduce((s, r) => s + (r.current / 1000 * r.expectedROAS * 1000), 0);
  const expectedRevenue = RECOMMENDATIONS.reduce((s, r) => s + r.expectedRevenue, 0);
  const revenueIncrease = expectedRevenue - currentRevenue;
  const budgetChange = totalRecommendedBudget - totalCurrentBudget;

  const comparisonData = useMemo(() => {
    return RECOMMENDATIONS.map((r) => ({
      channel: r.channel,
      Current: r.current,
      Recommended: r.recommended,
    }));
  }, []);

  const impactData = useMemo(() => {
    return RECOMMENDATIONS.map((r) => ({
      channel: r.channel.slice(0, 8),
      "Impact %": r.impact,
    }));
  }, []);

  const selectedRec = selectedChannel
    ? RECOMMENDATIONS.find((r) => r.channel === selectedChannel)
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Budget Recommendation Engine"
        subtitle="AI-powered budget allocation for maximum ROI"
        badge="AI"
      />

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover className="stat-card-3d animate-slide-up">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget Change</p>
          <p className={clsx(
            "text-2xl font-bold mt-1",
            budgetChange > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"
          )}>
            {budgetChange > 0 ? "+" : ""}<AnimatedNumber value={budgetChange / 1000} decimals={1} suffix="k" />
          </p>
          <p className="text-xs text-slate-400 mt-1">
            from ₹{(totalCurrentBudget / 1000).toFixed(0)}k to ₹{(totalRecommendedBudget / 1000).toFixed(0)}k
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "80ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expected Revenue Lift</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            +<AnimatedNumber value={revenueIncrease / 1000} decimals={0} suffix="k" />
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {((revenueIncrease / currentRevenue) * 100).toFixed(1)}% increase
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "160ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Efficiency Gain</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            <AnimatedNumber value={((revenueIncrease / budgetChange) * 100)} decimals={0} suffix="%" />
          </p>
          <p className="text-xs text-slate-400 mt-1">Revenue per ₹ spent</p>
        </Card>
      </div>

      {/* Budget comparison chart */}
      <Card padding="lg">
        <CardHeader
          title="Current vs Recommended Budget"
          subtitle="Per-channel allocation comparison"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recommended" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Budget impact by channel */}
      <Card padding="lg">
        <CardHeader
          title="Expected Impact by Channel"
          subtitle="Projected ROI improvement (%)"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={impactData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Impact %" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {impactData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry["Impact %"] > 0 ? "#10b981" : entry["Impact %"] < 0 ? "#ef4444" : "#94a3b8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Scenario analysis */}
      <Card padding="lg">
        <CardHeader
          title="Scenario Analysis"
          subtitle="How different total budgets affect metrics"
          icon={<Target className="w-5 h-5" />}
        />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={SCENARIOS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="budget" label={{ value: "Budget (₹k)", position: "insideBottomRight", offset: -5 }} />
              <YAxis yAxisId="left" label={{ value: "Revenue (₹k)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "ROAS", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#6366f1" radius={[2, 2, 0, 0]} name="Revenue (₹k)" />
              <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#10b981" strokeWidth={2} name="ROAS" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Detailed recommendations */}
      <Card padding="lg">
        <CardHeader
          title="Channel Recommendations"
          subtitle="Click a channel for detailed analysis"
          icon={<Sparkles className="w-5 h-5" />}
        />
        <div className="space-y-3">
          {RECOMMENDATIONS.map((rec) => {
            const isSelected = selectedChannel === rec.channel;
            const budgetShift = rec.recommended - rec.current;
            const budgetShiftPct = ((budgetShift / rec.current) * 100).toFixed(0);

            return (
              <button
                key={rec.channel}
                onClick={() => setSelectedChannel(isSelected ? null : rec.channel)}
                className={clsx(
                  "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-brand-400 bg-brand-50/50 dark:bg-brand-950/30 shadow-glow"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                {/* Channel name + recommendation */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{rec.channel}</h3>
                  <div className="flex items-center gap-1.5">
                    {budgetShift > 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-orange-500" />
                    )}
                    <span
                      className={clsx(
                        "text-sm font-bold",
                        budgetShift > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"
                      )}
                    >
                      {budgetShift > 0 ? "+" : ""}{budgetShiftPct}%
                    </span>
                  </div>
                </div>

                {/* Reason + metrics */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{rec.reason}</p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Current</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">₹{(rec.current / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Recommended</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">₹{(rec.recommended / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Expected ROAS</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{rec.expectedROAS.toFixed(1)}x</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Expected CPA</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">₹{rec.expectedCPA}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Detailed channel analysis */}
      {selectedRec && (
        <Card padding="lg" className="border-l-4 border-l-brand-500">
          <CardHeader
            title={`${selectedRec.channel} - Detailed Analysis`}
            icon={<Info className="w-5 h-5" />}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Current Budget</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹{(selectedRec.current / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Recommended Budget</p>
              <p className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">₹{(selectedRec.recommended / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Expected Revenue</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹{(selectedRec.expectedRevenue / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Expected ROAS</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{selectedRec.expectedROAS.toFixed(2)}x</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
