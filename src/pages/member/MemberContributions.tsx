import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MemberContributions() {
  const { member } = useOutletContext<{ member: any }>();
  const [data, setData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState<string | null>(null);

  const fetchContributions = () => {
    fetch('/api/members/dashboard').then(res => res.json()).then(setData);
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleSimulatePayment = async (obligationId: string, result: 'SUCCESS' | 'FAILED') => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/members/contributions/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obligationId, result })
      });
      const data = await res.json();
      if (data.success) {
        if (result === 'SUCCESS') {
          toast.success('Contribution payment recorded successfully.');
        } else {
          toast.error('Demo payment failed. No balance was changed.');
        }
        fetchContributions();
      } else {
        toast.error(data.error || 'Payment simulation failed');
      }
    } catch (err) {
      toast.error('An error occurred during simulation');
    } finally {
      setIsSimulating(false);
      setSelectedObligation(null);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Contributions</h1>
        <p className="text-ink-600 mt-1">Manage your monthly cooperative obligations.</p>
      </header>

      <div className="bg-white rounded-[14px] border border-ink-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-ink-200 flex justify-between items-center bg-ink-50">
          <h3 className="font-semibold text-seed-950">Obligations & History</h3>
        </div>
        <div className="divide-y divide-ink-100">
          {data.obligations.length === 0 ? (
            <div className="p-8 text-center text-ink-500">No contribution obligations found.</div>
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
                    <p className="font-medium tabular-nums">₦{(ob.expectedAmountKobo / 100).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-600 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      ob.status === 'PAID' ? 'bg-success/10 text-success' : 
                      ob.status === 'PARTIAL' ? 'bg-warning/10 text-warning' : 
                      'bg-ink-100 text-ink-600'
                    }`}>
                      {ob.status}
                    </span>
                  </div>
                  <div className="text-right">
                    {outstanding > 0 ? (
                      <button 
                        onClick={() => setSelectedObligation(ob.id)}
                        className="bg-seed-800 text-white px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-seed-700 transition-colors"
                      >
                        Simulate Payment
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-success flex items-center justify-end gap-1">
                        ✓ Fully Paid
                      </span>
                    )}
                  </div>

                  {/* Simulation Dialog Inline for Demo */}
                  {selectedObligation === ob.id && (
                    <div className="col-span-1 md:col-span-4 mt-4 p-4 bg-seed-50 border border-seed-200 rounded-[10px]">
                      <h4 className="font-semibold text-seed-950 mb-2">Simulate Payment</h4>
                      <p className="text-sm text-ink-600 mb-4">No real charge will occur. Select a simulated result for the outstanding amount of <strong>₦{(outstanding / 100).toLocaleString()}</strong>.</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleSimulatePayment(ob.id, 'SUCCESS')}
                          disabled={isSimulating}
                          className="bg-success text-white px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-opacity-90 disabled:opacity-50"
                        >
                          Simulate Success
                        </button>
                        <button 
                          onClick={() => handleSimulatePayment(ob.id, 'FAILED')}
                          disabled={isSimulating}
                          className="bg-danger text-white px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-opacity-90 disabled:opacity-50"
                        >
                          Simulate Failure
                        </button>
                        <button 
                          onClick={() => setSelectedObligation(null)}
                          disabled={isSimulating}
                          className="bg-white border border-ink-200 text-ink-600 px-4 py-2 rounded-[8px] text-sm font-medium hover:bg-ink-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
