import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type OverviewKpis = {
  totalSpend: number;
  revenue: number;
  roas: number;
  conversions: number;
  cac: number;
};

type TrendPoint = { date: string; spend: number; revenue: number };

export function ExecutiveOverviewPage() {
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  useEffect(() => {
    fetch("/api/overview/kpis")
      .then((res) => res.json())
      .then(setKpis)
      .catch((err) => console.error("Failed to load KPIs", err));

    fetch("/api/overview/trend")
      .then((res) => res.json())
      .then(setTrend)
      .catch((err) => console.error("Failed to load trend", err));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Executive Overview</h1>
        <div className="text-sm text-slate-500">Basic MVP dashboard skeleton</div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard label="Total Spend" value={kpis?.totalSpend} />
        <KpiCard label="Revenue" value={kpis?.revenue} />
        <KpiCard label="ROAS" value={kpis?.roas} />
        <KpiCard label="Conversions" value={kpis?.conversions} />
        <KpiCard label="CAC" value={kpis?.cac} />
      </div>

      {/* Spend vs Revenue trend */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Spend vs Revenue</h2>
          <span className="text-xs text-slate-500">Last 14 days (mock data)</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel performance placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Channel performance ranking
        </h2>
        <p className="text-sm text-slate-500">
          Placeholder table – will be powered by channel metrics from the API.
        </p>
        <div className="mt-4 border border-dashed border-slate-200 rounded-md p-6 text-sm text-slate-400">
          Channel ranking table or bar chart goes here.
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number | undefined }) {
  const display =
    value === undefined ? (
      <span className="inline-block h-6 w-20 bg-slate-100 animate-pulse rounded" />
    ) : (
      value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-2xl font-semibold mt-2 text-slate-900">{display}</span>
    </div>
  );
}

