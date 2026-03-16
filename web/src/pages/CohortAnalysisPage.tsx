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
} from "recharts";
import {
  Users,
  TrendingUp,
  Calendar,
  Percent,
  Info,
  Filter,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { clsx } from "clsx";

/* ── Cohort data ───────────────────────────────────────────── */
type CohortWeek = {
  week: string;
  day0: number;
  day7: number;
  day14: number;
  day21: number;
  day28: number;
  day35: number;
};

type CohortMetric = {
  cohort: string;
  size: number;
  retention: number;
  avgValue: number;
  ltv: number;
  churnRate: number;
};

const COHORT_DATA: CohortWeek[] = [
  { week: "W1", day0: 100, day7: 78, day14: 65, day21: 52, day28: 42, day35: 38 },
  { week: "W2", day0: 120, day7: 88, day14: 72, day21: 58, day28: 48, day35: 43 },
  { week: "W3", day0: 110, day7: 85, day14: 70, day21: 55, day28: 44, day35: 40 },
  { week: "W4", day0: 140, day7: 100, day14: 82, day21: 65, day28: 52, day35: 48 },
  { week: "W5", day0: 135, day7: 98, day14: 80, day21: 63, day28: 51, day35: 0 },
  { week: "W6", day0: 150, day7: 110, day14: 88, day21: 68, day28: 0, day35: 0 },
  { week: "W7", day0: 125, day7: 92, day14: 75, day21: 0, day28: 0, day35: 0 },
];

const COHORT_METRICS: CohortMetric[] = [
  { cohort: "W1 - Mar 01", size: 1200, retention: 38, avgValue: 1850, ltv: 2220, churnRate: 62 },
  { cohort: "W2 - Mar 08", size: 1450, retention: 36, avgValue: 1920, ltv: 2195, churnRate: 64 },
  { cohort: "W3 - Mar 15", size: 1320, retention: 36, avgValue: 1780, ltv: 2030, churnRate: 64 },
  { cohort: "W4 - Mar 22", size: 1680, retention: 34, avgValue: 2050, ltv: 2170, churnRate: 66 },
  { cohort: "W5 - Mar 29", size: 1620, retention: 38, avgValue: 1950, ltv: 2281, churnRate: 62 },
];

const RETENTION_IMPROVEMENT = [
  { day: "Day 0", rate: 100 },
  { day: "Day 7", rate: 73 },
  { day: "Day 14", rate: 62 },
  { day: "Day 21", rate: 52 },
  { day: "Day 28", rate: 43 },
  { day: "Day 35", rate: 38 },
];

export function CohortAnalysisPage() {
  const [selectedCohort, setSelectedCohort] = useState<number | null>(null);
  const [metricView, setMetricView] = useState<"retention" | "ltv">("retention");

  const selectedCohortData = selectedCohort !== null ? COHORT_METRICS[selectedCohort] : null;

  const totalUsers = COHORT_METRICS.reduce((s, c) => s + c.size, 0);
  const avgRetention = (COHORT_METRICS.reduce((s, c) => s + c.retention, 0) / COHORT_METRICS.length).toFixed(1);
  const avgLTV = COHORT_METRICS.reduce((s, c) => s + c.ltv, 0) / COHORT_METRICS.length;
  const avgChurn = (COHORT_METRICS.reduce((s, c) => s + c.churnRate, 0) / COHORT_METRICS.length).toFixed(1);

  const retentionCurve = useMemo(() => {
    return RETENTION_IMPROVEMENT.map((x) => ({ ...x }));
  }, []);

  const cohortRetentionHeatmap = useMemo(() => {
    return COHORT_DATA.map((cohort) => {
      const maxDay0 = 150;
      return {
        week: cohort.week,
        day0: (cohort.day0 / maxDay0) * 100,
        day7: (cohort.day7 / maxDay0) * 100,
        day14: (cohort.day14 / maxDay0) * 100,
        day21: (cohort.day21 / maxDay0) * 100,
        day28: (cohort.day28 / maxDay0) * 100,
        day35: (cohort.day35 / maxDay0) * 100,
      };
    });
  }, []);

  const getHeatmapColor = (value: number) => {
    if (value >= 80) return "#10b981"; // emerald
    if (value >= 60) return "#84cc16"; // lime
    if (value >= 40) return "#f59e0b"; // amber
    if (value >= 20) return "#ef4444"; // red
    return "#999999"; // gray (no data)
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cohort Analysis"
        subtitle="Understand user behavior and retention patterns by cohort"
        badge="Analytics"
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card hover className="stat-card-3d animate-slide-up">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            <AnimatedNumber value={totalUsers / 1000} decimals={1} suffix="k" />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "80ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Day 35 Retention</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <AnimatedNumber value={parseFloat(avgRetention)} decimals={1} suffix="%" />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "160ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. LTV (₹)</p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            <AnimatedNumber value={avgLTV} prefix="₹" decimals={0} />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "240ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Churn Rate</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            <AnimatedNumber value={parseFloat(avgChurn)} decimals={1} suffix="%" />
          </p>
        </Card>
      </div>

      {/* Retention curve */}
      <Card padding="lg">
        <CardHeader
          title="Average Retention Curve"
          subtitle="How many users remain active over time"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={retentionCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: "Retention (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                name="Retention Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cohort retention heatmap */}
      <Card padding="lg">
        <CardHeader
          title="Cohort Retention Heatmap"
          subtitle="Color intensity indicates retention %"
          icon={<Calendar className="w-5 h-5" />}
        />
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 rounded-l-lg">Cohort</th>
                <th className="text-center py-3 px-4">Day 0</th>
                <th className="text-center py-3 px-4">Day 7</th>
                <th className="text-center py-3 px-4">Day 14</th>
                <th className="text-center py-3 px-4">Day 21</th>
                <th className="text-center py-3 px-4">Day 28</th>
                <th className="text-center py-3 px-4 rounded-r-lg">Day 35</th>
              </tr>
            </thead>
            <tbody>
              {cohortRetentionHeatmap.map((cohort) => (
                <tr key={cohort.week} className="table-row">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{cohort.week}</td>
                  {Object.entries(cohort)
                    .filter(([k]) => k !== "week")
                    .map(([key, value]) => {
                      const numValue = typeof value === "number" ? value : 0;
                      return (
                        <td
                          key={key}
                          className="text-center py-3 px-4 text-white font-medium rounded"
                          style={{
                            backgroundColor: getHeatmapColor(numValue),
                            opacity: numValue === 0 ? 0.3 : 1,
                          }}
                        >
                          {numValue > 0 ? `${Math.round(numValue)}%` : "—"}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cohort detail cards */}
      <Card padding="lg">
        <CardHeader
          title="Cohort Performance Metrics"
          subtitle="Click a cohort for detailed analysis"
          icon={<Users className="w-5 h-5" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COHORT_METRICS.map((cohort, i) => {
            const isSelected = selectedCohort === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedCohort(isSelected ? null : i)}
                className={clsx(
                  "text-left p-4 rounded-xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-brand-400 bg-brand-50/50 dark:bg-brand-950/30 shadow-glow"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{cohort.cohort}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Size</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      {(cohort.size / 1000).toFixed(1)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Day 35 Retention</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {cohort.retention}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Avg Value</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      ₹{cohort.avgValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">LTV</p>
                    <p className="font-bold text-brand-600 dark:text-brand-400">
                      ₹{cohort.ltv}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Detailed cohort analysis */}
      {selectedCohortData && (
        <Card padding="lg" className="border-l-4 border-l-brand-500">
          <CardHeader
            title={`${COHORT_METRICS[selectedCohort!].cohort} - Deep Dive`}
            icon={<Info className="w-5 h-5" />}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Cohort Size</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                <AnimatedNumber value={selectedCohortData.size} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Day 35 Retention</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {selectedCohortData.retention}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Lifetime Value</p>
              <p className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                ₹<AnimatedNumber value={selectedCohortData.ltv} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Churn Rate</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                {selectedCohortData.churnRate}%
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 rounded-lg bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Insights</h4>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li>✓ This cohort shows {selectedCohortData.retention > 38 ? "above-average" : "below-average"} retention</li>
              <li>✓ LTV of ₹{selectedCohortData.ltv} is {selectedCohortData.ltv > 2200 ? "strong" : "moderate"}</li>
              <li>✓ Churn rate of {selectedCohortData.churnRate}% suggests focus needed on engagement</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
