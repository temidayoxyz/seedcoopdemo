import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MoneyText } from '../../components/money/MoneyText';
import { ReceiptModal, type ReceiptData } from '../../components/money/ReceiptModal';

export function MemberContributions() {
  const { member, refreshMember } = useOutletContext<{ member: any; refreshMember?: () => void }>();
  const [data, setData] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const load = () => fetch('/api/members/dashboard').then((r) => r.json()).then(setData);

  useEffect(() => { load(); }, []);

  const pay = async (obligationId: string) => {
    setPaying(true);
    try {
      const res = await fetch('/api/members/contributions/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obligationId }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success('Contribution recorded');
        if (d.receipt) setReceipt(d.receipt);
        load();
        refreshMember?.();
      } else toast.error(d.error || 'Payment failed');
    } catch {
      toast.error('Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (!data) return <div>Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Contributions</h1>
        <p className="text-ink-600 mt-1">
          Monthly thrift for {member.membershipNumber}. Total thrift:{' '}
          <strong><MoneyText kobo={data.member?.totalContributionsKobo ?? member.totalContributionsKobo} /></strong>
        </p>
      </header>

      <div className="bg-white rounded-[14px] border border-ink-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-ink-200 bg-ink-50 font-semibold">Obligations</div>
        <div className="divide-y divide-ink-100">
          {data.obligations.length === 0 ? (
            <div className="p-8 text-center text-ink-500">No obligations found.</div>
          ) : (
            data.obligations.map((ob: any) => {
              const outstanding = ob.expectedAmountKobo - ob.paidAmountKobo;
              return (
                <div key={ob.id} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="font-medium text-seed-950">{ob.monthPeriod}</p>
                    <p className="text-xs text-ink-600 mt-1">Due {new Date(ob.dueDate * 1000).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-600 uppercase tracking-wider mb-1">Expected</p>
                    <p className="font-medium"><MoneyText kobo={ob.expectedAmountKobo} /></p>
                    <p className="text-xs text-ink-500 mt-1">Paid <MoneyText kobo={ob.paidAmountKobo} /></p>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      ob.status === 'PAID' ? 'bg-success/10 text-success' :
                      ob.status === 'PARTIAL' ? 'bg-warning/10 text-warning' :
                      ob.status === 'OVERDUE' ? 'bg-danger/10 text-danger' :
                      'bg-ink-100 text-ink-600'
                    }`}>{ob.status}</span>
                  </div>
                  <div className="text-right">
                    {outstanding > 0 ? (
                      <button
                        type="button"
                        disabled={paying}
                        onClick={() => pay(ob.id)}
                        className="bg-seed-800 text-white px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-seed-700 disabled:opacity-50"
                      >
                        Pay <MoneyText kobo={outstanding} />
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-success">Fully paid</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
