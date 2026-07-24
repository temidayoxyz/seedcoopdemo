import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { can } from '../../lib/roles';
import { RotateCcw } from 'lucide-react';

export function AdminSettings() {
  const { user } = useOutletContext<{ user: any }>();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const canSettings = can(user?.role, 'settings:write');

  const reset = async () => {
    if (!confirm('Restore all cooperative data to the default opening state? Every member and staff balance on this device will reset.')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/system/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('Default state restored. Sign in again.');
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portal: 'ADMIN' }),
        });
        navigate('/login');
      } else toast.error(data.error || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Settings</h1>
        <p className="text-ink-600 mt-1">Cooperative rules and data management.</p>
      </header>

      <div className="bg-white rounded-[14px] border border-ink-200 p-6 space-y-4">
        <h2 className="font-semibold text-seed-950">Loan parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Max multiplier (× thrift)</label>
            <input type="number" defaultValue={2} disabled={!canSettings} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] disabled:bg-ink-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Monthly thrift (₦)</label>
            <input type="number" defaultValue={20000} disabled={!canSettings} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] disabled:bg-ink-50" />
          </div>
        </div>
        {!canSettings && (
          <p className="text-sm text-ink-500">Only Super Admin can change platform parameters.</p>
        )}
      </div>

      <div className="bg-white rounded-[14px] border border-ink-200 p-6 space-y-3">
        <h2 className="font-semibold text-seed-950">Restore default data</h2>
        <p className="text-sm text-ink-600">
          Returns all ten profiles, balances, loans, investments, dividends, announcements, and outbox messages to the opening cooperative state. Use this before a walkthrough.
        </p>
        <button
          type="button"
          onClick={reset}
          disabled={resetting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] border border-ink-200 bg-ivory-50 hover:bg-ink-50 text-sm font-medium"
        >
          <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          Restore default cooperative data
        </button>
      </div>
    </div>
  );
}
