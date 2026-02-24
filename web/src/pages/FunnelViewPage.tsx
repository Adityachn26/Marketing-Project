export function FunnelViewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Funnel View</h1>
      <p className="text-sm text-slate-500">
        Placeholder layout: funnel diagram, drop-off visualization, and stage conversion %
        will be added here.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-64">
        User journey funnel placeholder
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-48">
          Drop-off visualization placeholder
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-48">
          Stage conversion % placeholder
        </div>
      </div>
    </div>
  );
}

