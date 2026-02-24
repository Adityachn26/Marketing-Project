export function AttributionStudioPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Attribution Studio</h1>
      <p className="text-sm text-slate-500">
        Placeholder layout: model selector, channel credit distribution, revenue
        redistribution, and ranking changes will be added here.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Attribution model</label>
          <select className="border border-slate-200 rounded-md px-3 py-1.5 text-sm">
            <option>Last click</option>
            <option>First click</option>
            <option>Linear</option>
            <option>Time decay</option>
            <option>Position-based</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-56">
          Channel credit distribution placeholder
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-56">
          Revenue redistribution placeholder
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-56">
        Ranking changes placeholder
      </div>
    </div>
  );
}

