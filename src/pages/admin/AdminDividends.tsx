import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { can } from '../../lib/roles';
import { MoneyText } from '../../components/money/MoneyText';
export function AdminDividends() {
  const { user } = useOutletContext<{ user: any }>();
  const [data, setData] = useState<any>(null);
  const writable = can(user?.role, 'dividends:write');

  const load = () => fetch('/api/admin/dividends').then((r) => r.json()).then(setData);
  useEffect(() => { load(); }, []);

  const distribute = async (periodId: string) => {
    if (!confirm('Distribute this surplus to all active members pro-rata by thrift balance? Amounts credit each member and post to the ledger.')) return;
    const res = await fetch('/api/admin/dividends/distribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodId }),
    });
    const d = await res.json();
    if (d.success) {
      toast.success(`Dividends distributed · ${d.reference}`);
      load();
    } else toast.error(d.error || 'Failed');
  };

  if (!data) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Dividends & Surplus</h1>
        <p className="text-ink-600 mt-1">Declare and distribute cooperative surplus to members by thrift share.</p>
      </header>

      <div className="space-y-4">
        {data.periods.map((p: any) => (
          <div key={p.id} className="bg-white p-6 rounded-[14px] border border-ink-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-seed-950 text-lg">{p.label}</h3>
                <p className="text-sm text-ink-600 mt-1">{p.notes}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  <span>Surplus: <strong><MoneyText kobo={p.surplusKobo} /></strong></span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.status === 'DISTRIBUTED' ? 'bg-success/10 text-success' : 'bg-gold-100 text-gold-700'
                  }`}>{p.status}</span>
                </div>
              </div>
              {writable && p.status === 'DECLARED' && (
                <button
                  type="button"
                  onClick={() => distribute(p.id)}
                  className="bg-seed-800 text-white px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-seed-700"
                >
                  Distribute to members
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[14px] border border-ink-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100 font-semibold">Allocations</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs uppercase text-ink-600">
              <tr>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.allocations.map((a: any) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    {a.member ? `${a.member.firstName} ${a.member.lastName}` : '—'}
                    <div className="text-xs font-mono text-ink-500">{a.member?.membershipNumber}</div>
                  </td>
                  <td className="px-4 py-3">{a.period?.label}</td>
                  <td className="px-4 py-3 text-right font-medium"><MoneyText kobo={a.amountKobo} /></td>
                  <td className="px-4 py-3">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
