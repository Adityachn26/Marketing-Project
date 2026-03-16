import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Bar,
  BarChart,
} from "recharts";
import {
  TrendingUp,
  Zap,
  Calendar,
  AlertCircle,
  Target,
  Info,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { clsx } from "clsx";

/* ── Forecast data ───────────────────────────────────────────── */
type ForecastPoint = {
  date: string;
  actual?: number;
  forecast: number;
  upper80: number;
  lower80: number;
  upper95: number;
  lower95: number;
  isForecast: boolean;
};

type MetricForecast = {
  metric: string;
  current: number;
  q1Forecast: number;
  q2Forecast: number;
  q3Forecast: number;
  confidence: number;
  trend: "up" | "down" | "stable";
};

const FORECAST_DATA: ForecastPoint[] = [
  // Historical data
  { date: "Jan 1", actual: 48000, forecast: 48000, upper80: 49200, lower80: 46800, upper95: 50400, lower95: 45600, isForecast: false },
  { date: "Jan 8", actual: 52000, forecast: 52000, upper80: 53200, lower80: 50800, upper95: 54400, lower95: 49600, isForecast: false },
  { date: "Jan 15", actual: 55000, forecast: 55000, upper80: 56200, lower80: 53800, upper95: 57400, lower95: 52600, isForecast: false },
  { date: "Jan 22", actual: 61000, forecast: 61000, upper80: 62200, lower80: 59800, upper95: 63400, lower95: 58600, isForecast: false },
  { date: "Jan 29", actual: 64000, forecast: 64000, upper80: 65200, lower80: 62800, upper95: 66400, lower95: 61600, isForecast: false },
  { date: "Feb 5", actual: 69000, forecast: 69000, upper80: 70200, lower80: 67800, upper95: 71400, lower95: 66600, isForecast: false },
  { date: "Feb 12", actual: 71000, forecast: 71000, upper80: 72200, lower80: 69800, upper95: 73400, lower95: 68600, isForecast: false },
  // Forecast data
  { date: "Feb 19", actual: undefined, forecast: 76000, upper80: 78500, lower80: 73500, upper95: 81000, lower95: 71000, isForecast: true },
  { date: "Feb 26", actual: undefined, forecast: 82000, upper80: 85200, lower80: 78800, upper95: 88400, lower95: 75600, isForecast: true },
  { date: "Mar 5", actual: undefined, forecast: 88000, upper80: 91800, lower80: 84200, upper95: 95600, lower95: 80400, isForecast: true },
  { date: "Mar 12", actual: undefined, forecast: 94000, upper80: 98200, lower80: 89800, upper95: 102400, lower95: 85600, isForecast: true },
  { date: "Mar 19", actual: undefined, forecast: 101000, upper80: 105800, lower80: 96200, upper95: 110600, lower95: 91400, isForecast: true },
  { date: "Mar 26", actual: undefined, forecast: 108000, upper80: 113200, lower80: 102800, upper95: 118400, lower95: 97600, isForecast: true },
];

const METRIC_FORECASTS: MetricForecast[] = [
  { metric: "Revenue", current: 71000, q1Forecast: 88000, q2Forecast: 128000, q3Forecast: 165000, confidence: 0.88, trend: "up" },
  { metric: "Conversions", current: 12400, q1Forecast: 15600, q2Forecast: 22800, q3Forecast: 29200, confidence: 0.82, trend: "up" },
  { metric: "AOV", current: 5720, q1Forecast: 5840, q2Forecast: 5920, q3Forecast: 6080, confidence: 0.79, trend: "up" },
  { metric: "CAC", current: 145, q1Forecast: 142, q2Forecast: 138, q3Forecast: 135, confidence: 0.75, trend: "down" },
  { metric: "LTV:CAC Ratio", current: 14.2, q1Forecast: 15.1, q2Forecast: 16.3, q3Forecast: 17.8, confidence: 0.81, trend: "up" },
];

const SCENARIO_IMPACTS = [
  { scenario: "Conservative", q1: 75000, q2: 105000, q3: 132000, probability: 0.20 },
  { scenario: "Base Case", q1: 88000, q2: 128000, q3: 165000, probability: 0.50 },
  { scenario: "Optimistic", q1: 102000, q2: 156000, q3: 198000, probability: 0.25 },
  { scenario: "Aggressive", q1: 115000, q2: 182000, q3: 232000, probability: 0.05 },
];

export function ForecastingPage() {
  const [selectedMetric, setSelectedMetric] = useState<number>(0);
  const [confidenceLevel, setConfidenceLevel] = useState<80 | 95>(80);
  const [scenarioView, setScenarioView] = useState(false);

  const selectedMetricData = METRIC_FORECASTS[selectedMetric];
  const forecastMetric = selectedMetricData.metric.toLowerCase();

  // Key statistics
  const lastActual = FORECAST_DATA[FORECAST_DATA.length - 7];
  const lastForecast = FORECAST_DATA[FORECAST_DATA.length - 1];
  const growth = (((lastForecast.forecast - lastActual.actual!) / lastActual.actual!) * 100).toFixed(1);
  const avgConfidence = (METRIC_FORECASTS.reduce((s, m) => s + m.confidence, 0) / METRIC_FORECASTS.length * 100).toFixed(0);

  const forecastWithCI = useMemo(() => {
    return FORECAST_DATA.map((point) => ({
      ...point,
      display: point.isForecast ? (confidenceLevel === 80 ? point.upper80 : point.upper95) : undefined,
    }));
  }, [confidenceLevel]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Forecasting & Predictions"
        subtitle="AI-powered revenue and metric projections with confidence intervals"
        badge="Predictive"
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card hover className="stat-card-3d animate-slide-up">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Forecasted Revenue
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            ₹<AnimatedNumber value={lastForecast.forecast / 1000} decimals={0} suffix="k" />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "80ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Expected Growth
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <AnimatedNumber value={parseFloat(growth)} decimals={1} suffix="%" />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "160ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avg. Confidence
          </p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            <AnimatedNumber value={parseFloat(avgConfidence)} decimals={0} suffix="%" />
          </p>
        </Card>
        <Card hover className="stat-card-3d animate-slide-up" style={{ animationDelay: "240ms" } as any}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Q3 Projection
          </p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            ₹<AnimatedNumber value={165} decimals={0} suffix="k" />
          </p>
        </Card>
      </div>

      {/* Revenue forecast with confidence intervals */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <CardHeader
              title="Revenue Forecast"
              subtitle="12-week projection with confidence bands"
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setConfidenceLevel(80)}
              className={clsx(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                confidenceLevel === 80
                  ? "bg-brand-600 text-white shadow-lg"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              80% CI
            </button>
            <button
              onClick={() => setConfidenceLevel(95)}
              className={clsx(
                "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
                confidenceLevel === 95
                  ? "bg-brand-600 text-white shadow-lg"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}
            >
              95% CI
            </button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastWithCI}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: "Revenue (₹)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value: any) => (typeof value === "number" ? `₹${value.toLocaleString()}` : value)}
                labelFormatter={(label) => `Week: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="upper80"
                stroke="none"
                fill="url(#colorUpper)"
                name={`${confidenceLevel}% Upper Bound`}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#6366f1"
                fill="url(#colorForecast)"
                name="Forecast"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey={confidenceLevel === 80 ? "lower80" : "lower95"}
                stroke="none"
                fill="url(#colorUpper)"
                name={`${confidenceLevel}% Lower Bound`}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                fill="#10b981"
                name="Historical"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Scenario analysis toggle */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setScenarioView(false)}
          className={clsx(
            "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
            !scenarioView
              ? "bg-brand-600 text-white shadow-lg"
              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          )}
        >
          Metrics View
        </button>
        <button
          onClick={() => setScenarioView(true)}
          className={clsx(
            "px-4 py-2 rounded-lg font-semibold transition-all text-sm",
            scenarioView
              ? "bg-brand-600 text-white shadow-lg"
              : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          )}
        >
          Scenarios
        </button>
      </div>

      {/* Metric forecasts grid */}
      {!scenarioView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {METRIC_FORECASTS.map((metric, i) => {
            const isSelected = selectedMetric === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedMetric(i)}
                className={clsx(
                  "text-left p-4 rounded-xl border-2 transition-all duration-200 stat-card-3d",
                  isSelected
                    ? "border-brand-400 bg-brand-50/50 dark:bg-brand-950/30 shadow-glow"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{metric.metric}</h3>
                  <span
                    className={clsx(
                      "text-xs font-bold px-2 py-1 rounded",
                      metric.trend === "up"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}
                  >
                    {metric.trend === "up" ? "↑ Up" : "↓ Down"}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Current</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{metric.current}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Q1 Forecast</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">₹{metric.q1Forecast}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-gradient-to-r from-brand-400 to-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.min((metric.confidence * 100), 100)}%` }}
                    />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Confidence: {(metric.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Scenario comparison */}
      {scenarioView && (
        <Card padding="lg">
          <CardHeader
            title="Scenario Analysis"
            subtitle="Base case vs Conservative, Optimistic & Aggressive"
            icon={<Target className="w-5 h-5" />}
          />
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SCENARIO_IMPACTS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="scenario" />
                <YAxis label={{ value: "Revenue (₹)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="q1" fill="#6366f1" name="Q1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="q2" fill="#8b5cf6" name="Q2" radius={[8, 8, 0, 0]} />
                <Bar dataKey="q3" fill="#d946ef" name="Q3" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scenario probabilities */}
          <div className="mt-6 space-y-3">
            {SCENARIO_IMPACTS.map((scenario) => (
              <div key={scenario.scenario} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{scenario.scenario}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded">
                    {(scenario.probability * 100).toFixed(0)}% probability
                  </span>
                </div>
                <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-400 to-brand-600 h-2 rounded-full"
                    style={{ width: `${scenario.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed metric view */}
      {!scenarioView && (
        <Card padding="lg" className="border-l-4 border-l-brand-500">
          <CardHeader
            title={`${selectedMetricData.metric} - Detailed Forecast`}
            icon={<Info className="w-5 h-5" />}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Current Value</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                ₹<AnimatedNumber value={selectedMetricData.current} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Q1 Forecast</p>
              <p className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                ₹<AnimatedNumber value={selectedMetricData.q1Forecast} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Q2 Forecast</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                ₹<AnimatedNumber value={selectedMetricData.q2Forecast} />
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Q3 Forecast</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                ₹<AnimatedNumber value={selectedMetricData.q3Forecast} />
              </p>
            </div>
          </div>

          {/* Model confidence */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Model Confidence: {(selectedMetricData.confidence * 100).toFixed(0)}%
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Model Accuracy</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">87%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "87%" }} />
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-4 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Key Insights
            </h4>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li>✓ {selectedMetricData.metric} shows a {selectedMetricData.trend} trend</li>
              <li>✓ Expected {selectedMetricData.trend === "up" ? "increase" : "decrease"} by Q3 in {forecastMetric}</li>
              <li>✓ High confidence forecast with 87% model accuracy</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
