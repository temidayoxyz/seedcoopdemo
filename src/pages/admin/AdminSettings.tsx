import { Save } from 'lucide-react';

export function AdminSettings() {
  return (
    <div className="flex-1 overflow-y-auto bg-ivory-50">
      <header className="bg-white border-b border-ink-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-seed-950">Platform Settings</h1>
          <p className="text-ink-600 mt-1">Configure cooperative rules and platform preferences.</p>
        </div>
        <button className="flex items-center gap-2 bg-seed-800 text-white px-4 py-2 rounded-[8px] font-medium hover:bg-seed-700 transition-colors">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </header>
      <div className="p-8 max-w-3xl">
        <div className="bg-white rounded-[14px] border border-ink-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-seed-950 mb-4">Loan Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Max Multiplier (x Savings)</label>
                <input type="number" defaultValue={2} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Default Interest Rate (%)</label>
                <input type="number" defaultValue={5} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] focus:ring-2 focus:ring-seed-500 outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
