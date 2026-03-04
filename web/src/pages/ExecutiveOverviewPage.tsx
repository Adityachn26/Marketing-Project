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
import { useReport } from "../reportContext";

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

  useEffect(() => {
    const qs = reportId ? `?reportId=${encodeURIComponent(reportId)}` : "";

    fetch(reportId ? `/api/report/kpis${qs}` : "/api/overview/kpis")
      .then((res) => res.json())
      .then(setKpis)
      .catch((err) => console.error("Failed to load KPIs", err));

    fetch(reportId ? `/api/report/trend${qs}` : "/api/overview/trend")
      .then((res) => res.json())
      .then(setTrend)
      .catch((err) => console.error("Failed to load trend", err));

    fetch(reportId ? `/api/report/channels${qs}` : "/api/channels/summary")
      .then((res) => res.json())
      .then(setChannels)
      .catch((err) => console.error("Failed to load channels", err));

    if (reportId) {
      fetch(`/api/report/recommendations${qs}`)
        .then((res) => res.json())
        .then(setRecommendations)
        .catch((err) => console.error("Failed to load recommendations", err));
    } else {
      setRecommendations(null);
    }
  }, [reportId]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Executive Overview</h1>
        <div className="text-sm text-slate-500">
          {reportId ? "Powered by uploaded CSV" : "Mock data (upload a CSV to replace)"}
        </div>
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

      {/* Recommendations */}
      {recommendations ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Where to invest more</h2>
          <p className="text-sm text-slate-500 mb-3">{recommendations.headline}</p>
          <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
            {recommendations.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Channel performance placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Channel performance ranking
        </h2>
        <p className="text-sm text-slate-500 mb-3">
          Compare revenue vs spend by promo method / channel.
        </p>
        <div className="overflow-auto">
          <table className="min-w-full text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left py-1 pr-2">Channel</th>
                <th className="text-right py-1 px-2">Spend</th>
                <th className="text-right py-1 px-2">Revenue</th>
                <th className="text-right py-1 px-2">ROAS</th>
                <th className="text-right py-1 px-2">Conv.</th>
                <th className="text-right py-1 pl-2">CPA</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {channels.slice(0, 10).map((c) => {
                const roas = typeof c.roas === "number" ? c.roas : c.spend > 0 ? c.revenue / c.spend : 0;
                const cpa = typeof c.cpa === "number" ? c.cpa : c.conversions > 0 ? c.spend / c.conversions : 0;
                return (
                  <tr key={c.channel} className="border-t border-slate-100">
                    <td className="py-1 pr-2">{c.channel}</td>
                    <td className="py-1 px-2 text-right">₹{c.spend.toLocaleString()}</td>
                    <td className="py-1 px-2 text-right">₹{c.revenue.toLocaleString()}</td>
                    <td className="py-1 px-2 text-right">{roas.toFixed(2)}</td>
                    <td className="py-1 px-2 text-right">{c.conversions.toLocaleString()}</td>
                    <td className="py-1 pl-2 text-right">{cpa === 0 ? "-" : `₹${cpa.toFixed(1)}`}</td>
                  </tr>
                );
              })}
              {channels.length === 0 ? (
                <tr>
                  <td className="py-3 text-slate-400" colSpan={6}>
                    No channel data yet. Upload a CSV to populate this.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
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

