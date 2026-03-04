import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReport } from "../reportContext";

type FunnelStageRow = {
  stage: string;
  users: number;
  rateFromPrev: number;
  dropoffFromPrev: number;
};

export function FunnelViewPage() {
  const { reportId } = useReport();
  const [stages, setStages] = useState<FunnelStageRow[]>([]);

  useEffect(() => {
    if (reportId) {
      setStages([]);
      return;
    }
    fetch("/api/funnel/summary")
      .then((res) => res.json())
      .then(setStages)
      .catch((err) => console.error("Failed to load funnel summary", err));
  }, [reportId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Funnel View</h1>
      <p className="text-sm text-slate-500">
        {reportId
          ? "Funnel needs stage-level event data (not usually present in marketing spend CSVs). Upload a funnel/events CSV later to power this view."
          : "Simple user journey funnel with stage counts and step conversion rates (mock data)."}
      </p>

      {/* Funnel bars */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">User journey funnel</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stages} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === "users") return [value.toLocaleString(), "Users"];
                if (name === "rateFromPrev") return [`${(value * 100).toFixed(1)}%`, "Step conversion"];
                if (name === "dropoffFromPrev") return [`${(value * 100).toFixed(1)}%`, "Drop-off"];
                return [value, name];
              }}
            />
            <Bar dataKey="users" fill="#3b82f6" name="Users">
              <LabelList
                dataKey="users"
                position="right"
                formatter={(v: number) => v.toLocaleString()}
                className="text-xs fill-slate-800"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Step conversion table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Stage conversion %</h2>
          <table className="w-full text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left py-1 pr-2">Stage</th>
                <th className="text-right py-1 px-2">Users</th>
                <th className="text-right py-1 px-2">From previous</th>
                <th className="text-right py-1 pl-2">Drop-off</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {stages.map((s) => (
                <tr key={s.stage} className="border-t border-slate-100">
                  <td className="py-1 pr-2">{s.stage}</td>
                  <td className="py-1 px-2 text-right">{s.users.toLocaleString()}</td>
                  <td className="py-1 px-2 text-right">
                    {s.stage === stages[0]?.stage ? "-" : `${(s.rateFromPrev * 100).toFixed(1)}%`}
                  </td>
                  <td className="py-1 pl-2 text-right">
                    {s.stage === stages[0]?.stage ? "-" : `${(s.dropoffFromPrev * 100).toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Notes</h2>
          <p className="text-xs text-slate-500">
            In a full implementation, this view would be driven by funnel event data from your web/app
            analytics (e.g. page views, add-to-cart, checkout, purchase) stored in the `FunnelEvent` and
            `FunnelStage` tables.
          </p>
        </div>
      </div>
    </div>
  );
}

