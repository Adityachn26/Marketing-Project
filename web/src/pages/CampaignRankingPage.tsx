import { useEffect, useMemo, useState } from "react";
import { useReport } from "../reportContext";
import {
  Trophy,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Filter,
  Target,
  DollarSign,
  Crown,
} from "lucide-react";
import { Card, CardHeader } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { SkeletonTable } from "../components/Skeleton";
import { AnimatedNumber } from "../components/AnimatedNumber";

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

type SortField = "score" | "roas" | "revenue" | "spend" | "conversions" | "cpa";
type SortDir = "asc" | "desc";

function computeScore(c: CampaignRow, maxROAS: number, maxConv: number, maxRevenue: number): number {
  // Composite score: 40% ROAS efficiency + 30% conversion volume + 30% revenue
  const roasNorm = maxROAS > 0 ? c.roas / maxROAS : 0;
  const convNorm = maxConv > 0 ? c.conversions / maxConv : 0;
  const revNorm = maxRevenue > 0 ? c.revenue / maxRevenue : 0;
  return Math.round((roasNorm * 0.4 + convNorm * 0.3 + revNorm * 0.3) * 100);
}

export function CampaignRankingPage() {
  const { reportId } = useReport();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    const qs = reportId ? `?reportId=${encodeURIComponent(reportId)}` : "";
    fetch(reportId ? `/api/report/campaigns${qs}` : "/api/channels/campaigns")
      .then((r) => r.json())
      .then((data) => setCampaigns(data))
      .catch((err) => console.error("Failed to load campaigns", err))
      .finally(() => setLoading(false));
  }, [reportId]);

  const channels = useMemo(
    () => [...new Set(campaigns.map((c) => c.channel))].sort(),
    [campaigns]
  );

  const statuses = useMemo(
    () => [...new Set(campaigns.map((c) => c.status))].sort(),
    [campaigns]
  );

  // Max values for score normalization
  const maxROAS = useMemo(() => Math.max(...campaigns.map((c) => c.roas), 1), [campaigns]);
  const maxConv = useMemo(() => Math.max(...campaigns.map((c) => c.conversions), 1), [campaigns]);
  const maxRevenue = useMemo(() => Math.max(...campaigns.map((c) => c.revenue), 1), [campaigns]);

  // Filtered + scored + sorted campaigns
  const processedCampaigns = useMemo(() => {
    let filtered = campaigns.filter((c) => {
      if (channelFilter !== "all" && c.channel !== channelFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    const scored = filtered.map((c) => ({
      ...c,
      score: computeScore(c, maxROAS, maxConv, maxRevenue),
    }));

    scored.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDir === "desc" ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });

    return scored;
  }, [campaigns, channelFilter, statusFilter, searchQuery, sortField, sortDir, maxROAS, maxConv, maxRevenue]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortDir === "desc" ? (
      <ArrowDown className="w-3.5 h-3.5 text-brand-500" />
    ) : (
      <ArrowUp className="w-3.5 h-3.5 text-brand-500" />
    );
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    if (processedCampaigns.length === 0) return null;
    const totalRev = processedCampaigns.reduce((s, c) => s + c.revenue, 0);
    const totalSpend = processedCampaigns.reduce((s, c) => s + c.spend, 0);
    const totalConv = processedCampaigns.reduce((s, c) => s + c.conversions, 0);
    const avgROAS = totalSpend > 0 ? totalRev / totalSpend : 0;
    const avgScore = processedCampaigns.reduce((s, c) => s + c.score, 0) / processedCampaigns.length;
    return { totalRev, totalSpend, totalConv, avgROAS, avgScore };
  }, [processedCampaigns]);

  // Best campaign
  const bestCampaign = processedCampaigns.length > 0 ? processedCampaigns[0] : null;
  const maxScore = bestCampaign?.score || 100;

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Campaign Rankings" subtitle="Loading campaign data..." />
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campaign Rankings"
        subtitle={`Performance ranking & scoring across ${campaigns.length} campaigns ${reportId ? "from your CSV" : "· Mock data"}`}
        badge={`${processedCampaigns.length} Campaigns`}
      />

      {/* Summary KPI Cards */}
      {summaryStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: "Total Revenue",
              value: summaryStats.totalRev,
              prefix: "₹",
              icon: DollarSign,
              color: "text-emerald-600 dark:text-emerald-400",
              iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
            },
            {
              label: "Total Spend",
              value: summaryStats.totalSpend,
              prefix: "₹",
              icon: Target,
              color: "text-blue-600 dark:text-blue-400",
              iconBg: "bg-blue-100 dark:bg-blue-900/50",
            },
            {
              label: "Avg ROAS",
              value: summaryStats.avgROAS,
              prefix: "",
              suffix: "x",
              decimals: 2,
              icon: TrendingUp,
              color: "text-purple-600 dark:text-purple-400",
              iconBg: "bg-purple-100 dark:bg-purple-900/50",
            },
            {
              label: "Total Conversions",
              value: summaryStats.totalConv,
              prefix: "",
              icon: Crown,
              color: "text-amber-600 dark:text-amber-400",
              iconBg: "bg-amber-100 dark:bg-amber-900/50",
            },
            {
              label: "Avg Score",
              value: summaryStats.avgScore,
              prefix: "",
              suffix: "/100",
              decimals: 0,
              icon: Sparkles,
              color: "text-brand-600 dark:text-brand-400",
              iconBg: "bg-brand-100 dark:bg-brand-900/50",
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
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
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
      )}

      {/* Filters */}
      <Card padding="md" className="card-glow">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
          </div>

          {/* Channel filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Channels</option>
              {channels.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Status</option>
              {statuses.map((st) => (
                <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Ranking Table */}
      <Card padding="lg" className="card-glow">
        <CardHeader
          title="Performance Rankings"
          subtitle="Campaigns ranked by composite performance score"
          icon={<Trophy className="w-5 h-5" />}
          action={
            <span className="badge-info flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Score = 40% ROAS + 30% Conv. + 30% Rev.
            </span>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-center py-3 px-3 rounded-l-lg w-14">Rank</th>
                <th className="text-left py-3 px-4">Campaign</th>
                <th className="text-left py-3 px-4">Channel</th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors select-none"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Score <SortIcon field="score" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors select-none"
                  onClick={() => handleSort("roas")}
                >
                  <div className="flex items-center justify-end gap-1">
                    ROAS <SortIcon field="roas" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors select-none"
                  onClick={() => handleSort("revenue")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Revenue <SortIcon field="revenue" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors select-none"
                  onClick={() => handleSort("spend")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Spend <SortIcon field="spend" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors select-none"
                  onClick={() => handleSort("conversions")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Conv. <SortIcon field="conversions" />
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors select-none"
                  onClick={() => handleSort("cpa")}
                >
                  <div className="flex items-center justify-end gap-1">
                    CPA <SortIcon field="cpa" />
                  </div>
                </th>
                <th className="text-center py-3 px-4 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {processedCampaigns.map((c, idx) => {
                const rank = idx + 1;
                const scorePct = maxScore > 0 ? (c.score / maxScore) * 100 : 0;
                return (
                  <tr
                    key={c.id}
                    className="table-row animate-slide-up"
                    style={{ animationDelay: `${idx * 40}ms` } as any}
                  >
                    {/* Rank badge */}
                    <td className="py-3 px-3 text-center">
                      {rank === 1 ? (
                        <span className="rank-badge-gold">🥇</span>
                      ) : rank === 2 ? (
                        <span className="rank-badge-silver">🥈</span>
                      ) : rank === 3 ? (
                        <span className="rank-badge-bronze">🥉</span>
                      ) : (
                        <span className="rank-badge-default">{rank}</span>
                      )}
                    </td>

                    {/* Campaign name */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg font-medium">
                        {c.channel}
                      </span>
                    </td>

                    {/* Score with progress bar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full animate-score-fill"
                            style={{
                              width: `${scorePct}%`,
                              background: scorePct >= 70
                                ? "linear-gradient(90deg, #10b981, #059669)"
                                : scorePct >= 40
                                ? "linear-gradient(90deg, #f59e0b, #d97706)"
                                : "linear-gradient(90deg, #ef4444, #dc2626)",
                              animationDelay: `${idx * 40 + 200}ms`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            c.score >= 70
                              ? "text-emerald-600 dark:text-emerald-400"
                              : c.score >= 40
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-500 dark:text-red-400"
                          }`}
                        >
                          {c.score}
                        </span>
                      </div>
                    </td>

                    {/* ROAS */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`badge ${
                          c.roas >= 3
                            ? "badge-success"
                            : c.roas >= 1.5
                            ? "badge-warning"
                            : "bg-red-50 text-red-700 ring-1 ring-red-600/20 dark:bg-red-950/50 dark:text-red-400"
                        }`}
                      >
                        {c.roas.toFixed(2)}x
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ₹{c.revenue.toLocaleString()}
                    </td>

                    {/* Spend */}
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                      ₹{c.spend.toLocaleString()}
                    </td>

                    {/* Conversions */}
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                      {c.conversions.toLocaleString()}
                    </td>

                    {/* CPA */}
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                      ₹{c.cpa.toFixed(1)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`badge ${
                          c.status === "active"
                            ? "badge-success"
                            : c.status === "paused"
                            ? "badge-warning"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {processedCampaigns.length === 0 && (
                <tr>
                  <td className="py-12 text-center text-slate-400 dark:text-slate-500" colSpan={10}>
                    <div className="flex flex-col items-center gap-2">
                      <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p>No campaigns match your filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setChannelFilter("all");
                          setStatusFilter("all");
                        }}
                        className="text-brand-600 dark:text-brand-400 font-medium hover:underline text-sm"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
