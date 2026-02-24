export function ChannelAnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Channel Analytics</h1>
      <p className="text-sm text-slate-500">
        Placeholder layout: spend by channel, conversion rate & CPA, campaign performance,
        heatmap comparison will be added here.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div ></div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-48">
          Spend by channel chart placeholder
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-48">
          Conversion rate & CPA placeholder
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-56">
        Campaign performance table placeholder
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-56">
        Heatmap comparison placeholder
      </div>
    </div>
  );
}

