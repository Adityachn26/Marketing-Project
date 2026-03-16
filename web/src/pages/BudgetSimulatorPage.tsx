import { useState, useMemo, useCallback, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useReport } from "../reportContext";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Target,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Wallet,
  Percent,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { AnimatedNumber } from "../components/AnimatedNumber";

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6",
];

type ChannelConfig = {
  name: string;
  baseROAS: number;
  baseCPA: number;
  color: string;
};

const DEFAULT_CHANNELS: ChannelConfig[] = [
  { name: "Google Ads", baseROAS: 3.8, baseCPA: 120, color: "#6366f1" },
  { name: "Meta Ads", baseROAS: 2.9, baseCPA: 95, color: "#10b981" },
  { name: "Email", baseROAS: 5.2, baseCPA: 45, color: "#f59e0b" },
  { name: "SEO", baseROAS: 4.5, baseCPA: 60, color: "#8b5cf6" },
  { name: "LinkedIn", baseROAS: 2.1, baseCPA: 180, color: "#06b6d4" },
  { name: "YouTube", baseROAS: 2.6, baseCPA: 150, color: "#ef4444" },
];

type Scenario = {
  name: string;
  totalBudget: number;
  allocations: number[]; // percentages
};

export function BudgetSimulatorPage() {
  const [totalBudget, setTotalBudget] = useState(500000);
  const [allocations, setAllocations] = useState<number[]>(
    DEFAULT_CHANNELS.map(() => Math.round(100 / DEFAULT_CHANNELS.length * 10) / 10)
  );
  const [savedScenario, setSavedScenario] = useState<Scenario | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Normalize allocations to sum to 100
  const normalizedAllocations = useMemo(() => {
    const total = allocations.reduce((a, b) => a + b, 0);
    if (total === 0) return allocations.map(() => 100 / DEFAULT_CHANNELS.length);
    return allocations.map((a) => (a / total) * 100);
  }, [allocations]);

  const handleSliderChange = useCallback((index: number, newValue: number) => {
    setAllocations((prev) => {
      const next = [...prev];
      next[index] = newValue;
      return next;
    });
  }, []);

  const resetAllocations = useCallback(() => {
    setAllocations(DEFAULT_CHANNELS.map(() => Math.round(100 / DEFAULT_CHANNELS.length * 10) / 10));
  }, []);

  const saveScenario = useCallback(() => {
    setSavedScenario({
      name: `Scenario ${new Date().toLocaleTimeString()}`,
      totalBudget,
      allocations: [...normalizedAllocations],
    });
    setShowComparison(true);
  }, [totalBudget, normalizedAllocations]);

  // Diminishing returns model — ROAS drops slightly as budget share increases
  const channelMetrics = useMemo(() => {
    return DEFAULT_CHANNELS.map((ch, i) => {
      const pct = normalizedAllocations[i];
      const channelBudget = (totalBudget * pct) / 100;
      // Diminishing returns: ROAS reduces by up to 15% when allocation exceeds 25%
      const overAllocation = Math.max(0, pct - 25) / 75;
      const adjustedROAS = ch.baseROAS * (1 - overAllocation * 0.15);
      const projectedRevenue = channelBudget * adjustedROAS;
      const projectedConversions = channelBudget > 0 ? Math.round(channelBudget / ch.baseCPA) : 0;

      return {
        name: ch.name,
        color: ch.color,
        allocation: pct,
        budget: channelBudget,
        roas: adjustedROAS,
        revenue: projectedRevenue,
        conversions: projectedConversions,
        cpa: ch.baseCPA,
      };
    });
  }, [normalizedAllocations, totalBudget]);

  const totals = useMemo(() => {
    const totalRevenue = channelMetrics.reduce((s, m) => s + m.revenue, 0);
    const totalConversions = channelMetrics.reduce((s, m) => s + m.conversions, 0);
    const overallROAS = totalBudget > 0 ? totalRevenue / totalBudget : 0;
    return { totalRevenue, totalConversions, overallROAS };
  }, [channelMetrics, totalBudget]);

  const pieData = channelMetrics.map((m) => ({
    name: m.name,
    value: Math.round(m.budget),
  }));

  const comparisonData = useMemo(() => {
    if (!savedScenario) return [];
    return DEFAULT_CHANNELS.map((ch, i) => {
      const savedBudget = (savedScenario.totalBudget * savedScenario.allocations[i]) / 100;
      const savedOverAlloc = Math.max(0, savedScenario.allocations[i] - 25) / 75;
      const savedROAS = ch.baseROAS * (1 - savedOverAlloc * 0.15);
      const savedRevenue = savedBudget * savedROAS;

      return {
        name: ch.name,
        "Current Revenue": Math.round(channelMetrics[i].revenue),
        "Saved Revenue": Math.round(savedRevenue),
      };
    });
  }, [savedScenario, channelMetrics]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Budget Simulator"
        subtitle="Interactive marketing mix budget simulation with projected ROI"
        badge="Simulation"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={resetAllocations} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button onClick={saveScenario} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Scenario
            </button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Budget",
            value: totalBudget,
            prefix: "₹",
            icon: Wallet,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950/50",
            iconBg: "bg-blue-100 dark:bg-blue-900/50",
          },
          {
            label: "Projected Revenue",
            value: totals.totalRevenue,
            prefix: "₹",
            icon: DollarSign,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950/50",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
          },
          {
            label: "Overall ROAS",
            value: totals.overallROAS,
            prefix: "",
            suffix: "x",
            decimals: 2,
            icon: TrendingUp,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950/50",
            iconBg: "bg-purple-100 dark:bg-purple-900/50",
          },
          {
            label: "Total Conversions",
            value: totals.totalConversions,
            prefix: "",
            icon: Target,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/50",
            iconBg: "bg-amber-100 dark:bg-amber-900/50",
          },
        ].map((kpi, idx) => (
          <Card
            key={kpi.label}
            hover
            className="animate-slide-up"
            style={{ animationDelay: `${idx * 80}ms` } as any}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  <AnimatedNumber
                    value={kpi.value}
                    prefix={kpi.prefix}
                    suffix={(kpi as any).suffix || ""}
                    decimals={(kpi as any).decimals || 0}
                  />
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Total Budget Input */}
      <Card padding="lg" className="card-glow">
        <CardHeader
          title="Total Marketing Budget"
          subtitle="Set your total marketing spend for the simulation period"
          icon={<Wallet className="w-5 h-5" />}
        />
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-slate-400">₹</span>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Math.max(0, Number(e.target.value)))}
            className="flex-1 text-3xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-brand-500 dark:focus:border-brand-400 outline-none transition-colors py-2"
            step={10000}
            min={0}
          />
        </div>
        <div className="flex gap-2 mt-4">
          {[100000, 250000, 500000, 1000000, 2500000].map((preset) => (
            <button
              key={preset}
              onClick={() => setTotalBudget(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                totalBudget === preset
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              ₹{(preset / 100000).toFixed(preset >= 100000 ? 0 : 1)}L
            </button>
          ))}
        </div>
      </Card>

      {/* Sliders + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Channel Sliders */}
        <Card padding="lg" className="lg:col-span-3 card-glow">
          <CardHeader
            title="Channel Budget Allocation"
            subtitle="Drag sliders to adjust budget distribution across channels"
            icon={<Percent className="w-5 h-5" />}
          />
          <div className="space-y-5">
            {DEFAULT_CHANNELS.map((ch, i) => (
              <div
                key={ch.name}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` } as any}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ch.color }}
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {ch.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 tabular-nums">
                      {normalizedAllocations[i].toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums w-20 text-right">
                      ₹{Math.round((totalBudget * normalizedAllocations[i]) / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 h-2 top-[9px] rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div
                    className="absolute h-2 top-[9px] rounded-full transition-all duration-150"
                    style={{
                      width: `${(allocations[i] / 50) * 100}%`,
                      maxWidth: "100%",
                      background: `linear-gradient(90deg, ${ch.color}80, ${ch.color})`,
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={0.5}
                    value={allocations[i]}
                    onChange={(e) => handleSliderChange(i, parseFloat(e.target.value))}
                    className="sim-slider relative z-10 w-full"
                    style={{ background: "transparent" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Pie Chart */}
        <Card padding="lg" className="lg:col-span-2 card-glow">
          <CardHeader
            title="Budget Distribution"
            subtitle="Real-time allocation view"
            icon={<Calculator className="w-5 h-5" />}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  animationDuration={300}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEFAULT_CHANNELS[index].color} />
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
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {DEFAULT_CHANNELS.map((ch, i) => (
              <div key={ch.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                <span className="text-slate-600 dark:text-slate-300 truncate">{ch.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Projected ROI Table */}
      <Card padding="lg" className="card-glow">
        <CardHeader
          title="Projected ROI by Channel"
          subtitle="Estimated performance based on current budget allocation"
          icon={<TrendingUp className="w-5 h-5" />}
          action={
            <span className="badge-success flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Live Projection
            </span>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left py-3 px-4 rounded-l-lg">Channel</th>
                <th className="text-right py-3 px-4">Allocation</th>
                <th className="text-right py-3 px-4">Budget</th>
                <th className="text-right py-3 px-4">Proj. Revenue</th>
                <th className="text-right py-3 px-4">ROAS</th>
                <th className="text-right py-3 px-4">Conv.</th>
                <th className="text-right py-3 px-4 rounded-r-lg">CPA</th>
              </tr>
            </thead>
            <tbody>
              {channelMetrics.map((m, i) => (
                <tr key={m.name} className="table-row">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="badge-info tabular-nums">{m.allocation.toFixed(1)}%</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                    ₹{Math.round(m.budget).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ₹{Math.round(m.revenue).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`badge ${m.roas >= 3 ? "badge-success" : m.roas >= 1.5 ? "badge-warning" : "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-950/50 dark:text-red-400"}`}>
                      {m.roas.toFixed(2)}x
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                    {m.conversions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                    ₹{m.cpa.toFixed(0)}
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="border-t-2 border-slate-200 dark:border-slate-600 font-semibold">
                <td className="py-3 px-4 text-slate-900 dark:text-white">Total</td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white">100%</td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white tabular-nums">
                  ₹{totalBudget.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ₹{Math.round(totals.totalRevenue).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="badge-success">{totals.overallROAS.toFixed(2)}x</span>
                </td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white tabular-nums">
                  {totals.totalConversions.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Scenario Comparison */}
      {savedScenario && (
        <Card padding="lg" className="card-glow animate-slide-up">
          <CardHeader
            title="Scenario Comparison"
            subtitle={`Comparing current allocation with "${savedScenario.name}"`}
            icon={<ArrowRight className="w-5 h-5" />}
            action={
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="btn-ghost flex items-center gap-1"
              >
                {showComparison ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show
                  </>
                )}
              </button>
            }
          />

          {showComparison && (
            <div className="space-y-6">
              {/* Summary comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-700/30">
                  <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">
                    Saved Budget
                  </p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    ₹{savedScenario.totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl p-4 bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 border border-brand-200/50 dark:border-brand-700/30">
                  <p className="text-[10px] uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold mb-1">
                    Current Budget
                  </p>
                  <p className="text-lg font-bold text-brand-700 dark:text-brand-300">
                    ₹{totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/50 dark:border-emerald-700/30">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                    Revenue Difference
                  </p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {(() => {
                      const savedTotalRevenue = DEFAULT_CHANNELS.reduce((sum, ch, i) => {
                        const b = (savedScenario.totalBudget * savedScenario.allocations[i]) / 100;
                        const oa = Math.max(0, savedScenario.allocations[i] - 25) / 75;
                        return sum + b * ch.baseROAS * (1 - oa * 0.15);
                      }, 0);
                      const diff = totals.totalRevenue - savedTotalRevenue;
                      return `${diff >= 0 ? "+" : ""}₹${Math.round(Math.abs(diff)).toLocaleString()}`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Bar chart comparison */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
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
                    <Bar dataKey="Saved Revenue" fill="#94a3b8" name="Saved Scenario" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Current Revenue" fill="#6366f1" name="Current" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
