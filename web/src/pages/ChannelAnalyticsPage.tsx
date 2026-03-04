import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReport } from "../reportContext";

type ChannelSummary = {
  channel: string;
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
};

type CampaignRow = {
  id: number;
  name: string;
  channel: string;
  spend: number;
  revenue: number;
  conversions: number;
  roas: number;
  cpa: number;
  status: string;
};

export function ChannelAnalyticsPage() {
  const { reportId } = useReport();
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);

  useEffect(() => {
    const qs = reportId ? `?reportId=${encodeURIComponent(reportId)}` : "";

    fetch(reportId ? `/api/report/channels${qs}` : "/api/channels/summary")
      .then((res) => res.json())
      .then(setChannels)
      .catch((err) => console.error("Failed to load channel summary", err));

    fetch(reportId ? `/api/report/campaigns${qs}` : "/api/channels/campaigns")
      .then((res) => res.json())
      .then(setCampaigns)
      .catch((err) => console.error("Failed to load campaign data", err));
  }, [reportId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Channel Analytics</h1>
      <p className="text-sm text-slate-500">
        Spend by channel, conversion efficiency, and campaign performance {reportId ? "(from CSV)" : "(mock data)"}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spend by channel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">Spend by channel</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={channels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="spend" fill="#3b82f6" name="Spend" />
              <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion rate & CPA (simple table) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 overflow-auto">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Conversion efficiency</h2>
          <table className="min-w-full text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left py-1 pr-2">Channel</th>
                <th className="text-right py-1 px-2">Conversions</th>
                <th className="text-right py-1 px-2">CPA</th>
                <th className="text-right py-1 pl-2">ROAS</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {channels.map((c) => (
                <tr key={c.channel} className="border-t border-slate-100">
                  <td className="py-1 pr-2">{c.channel}</td>
                  <td className="py-1 px-2 text-right">{c.conversions.toLocaleString()}</td>
                  <td className="py-1 px-2 text-right">
                    {c.cpa === 0 ? "-" : `₹${c.cpa.toFixed(1)}`}
                  </td>
                  <td className="py-1 pl-2 text-right">
                    {c.spend === 0 ? "-" : (c.revenue / c.spend).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign performance table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 overflow-auto">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Campaign performance</h2>
        <table className="min-w-full text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="text-left py-1 pr-2">Campaign</th>
              <th className="text-left py-1 px-2">Channel</th>
              <th className="text-right py-1 px-2">Spend</th>
              <th className="text-right py-1 px-2">Revenue</th>
              <th className="text-right py-1 px-2">Conv.</th>
              <th className="text-right py-1 px-2">ROAS</th>
              <th className="text-right py-1 px-2">CPA</th>
              <th className="text-right py-1 pl-2">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="py-1 pr-2">{c.name}</td>
                <td className="py-1 px-2">{c.channel}</td>
                <td className="py-1 px-2 text-right">₹{c.spend.toLocaleString()}</td>
                <td className="py-1 px-2 text-right">₹{c.revenue.toLocaleString()}</td>
                <td className="py-1 px-2 text-right">{c.conversions.toLocaleString()}</td>
                <td className="py-1 px-2 text-right">{c.roas.toFixed(2)}</td>
                <td className="py-1 px-2 text-right">₹{c.cpa.toFixed(1)}</td>
                <td className="py-1 pl-2 text-right capitalize">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

