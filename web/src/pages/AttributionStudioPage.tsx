import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReport } from "../reportContext";

type AttributionChannelRow = {
  channel: string;
  baselineConversions: number;
  baselineRevenue: number;
  conversions: number;
  revenue: number;
};

const MODEL_OPTIONS = [
  { label: "Last click", value: "LAST_CLICK" },
  { label: "First click", value: "FIRST_CLICK" },
  { label: "Linear", value: "LINEAR" },
  { label: "Time decay", value: "TIME_DECAY" },
  { label: "Position-based", value: "POSITION_BASED" },
];

export function AttributionStudioPage() {
  const { reportId } = useReport();
  const [model, setModel] = useState<string>("LAST_CLICK");
  const [rows, setRows] = useState<AttributionChannelRow[]>([]);

  useEffect(() => {
    if (reportId) {
      setRows([]);
      return;
    }
    const params = new URLSearchParams({ model });
    fetch(`/api/attribution/overview?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setRows(data.channels))
      .catch((err) => console.error("Failed to load attribution overview", err));
  }, [model, reportId]);

  const tableData = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        revenueDelta: r.revenue - r.baselineRevenue,
        revenueDeltaPct: r.baselineRevenue === 0 ? 0 : (r.revenue - r.baselineRevenue) / r.baselineRevenue,
      })),
    [rows],
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Attribution Studio</h1>
      <p className="text-sm text-slate-500">
        {reportId
          ? "Attribution requires user journey touchpoints (not present in most spend/revenue CSVs). For now, clear the CSV to view the demo attribution screen."
          : "Explore how different attribution models redistribute credit across channels (mock data)."}
      </p>

      {/* Model selector */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Attribution model</label>
          <select
            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Channel credit distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Channel credit distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversions" fill="#3b82f6" name="Attributed conversions" />
              <Bar dataKey="revenue" fill="#22c55e" name="Attributed revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue redistribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 overflow-auto">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Revenue redistribution vs baseline</h2>
          <table className="min-w-full text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left py-1 pr-2">Channel</th>
                <th className="text-right py-1 px-2">Baseline rev.</th>
                <th className="text-right py-1 px-2">Current rev.</th>
                <th className="text-right py-1 px-2">Δ rev.</th>
                <th className="text-right py-1 pl-2">Δ %</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {tableData.map((r) => (
                <tr key={r.channel} className="border-t border-slate-100">
                  <td className="py-1 pr-2">{r.channel}</td>
                  <td className="py-1 px-2 text-right">₹{r.baselineRevenue.toLocaleString()}</td>
                  <td className="py-1 px-2 text-right">₹{r.revenue.toLocaleString()}</td>
                  <td className="py-1 px-2 text-right">
                    {r.revenueDelta >= 0 ? "+" : "-"}₹{Math.abs(r.revenueDelta).toLocaleString()}
                  </td>
                  <td className="py-1 pl-2 text-right">
                    {r.baselineRevenue === 0 ? "-" : `${(r.revenueDeltaPct * 100).toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranking changes simplified as sorting by revenue */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 overflow-auto">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Ranking by attributed revenue</h2>
        <table className="min-w-full text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="text-left py-1 pr-2">Rank</th>
              <th className="text-left py-1 px-2">Channel</th>
              <th className="text-right py-1 px-2">Current rev.</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {rows
              .slice()
              .sort((a, b) => b.revenue - a.revenue)
              .map((r, index) => (
                <tr key={r.channel} className="border-t border-slate-100">
                  <td className="py-1 pr-2">{index + 1}</td>
                  <td className="py-1 px-2">{r.channel}</td>
                  <td className="py-1 px-2 text-right">₹{r.revenue.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

