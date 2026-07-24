import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MemberDeposits() {
  const { member } = useOutletContext<{ member: any }>();
  const [requests, setRequests] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaystack, setShowPaystack] = useState(false);

  const fetchRequests = () => {
    fetch('/api/members/funds').then(res => res.json()).then(data => {
      setRequests((data.requests || []).filter((r: any) => r.type === 'DEPOSIT'));
    }).catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const initiatePayment = (e: any) => {
    e.preventDefault();
    const amountKobo = parseInt(amount) * 100;
    if (isNaN(amountKobo) || amountKobo <= 0) return toast.error('Invalid amount');
    setShowPaystack(true);
  };

  const handlePaystackComplete = async () => {
    const amountKobo = parseInt(amount) * 100;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/members/funds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DEPOSIT', amountKobo, notes: 'Paid via Paystack Demo' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment successful. Deposit is pending approval.');
        setAmount('');
        setShowPaystack(false);
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Deposits</h1>
        <p className="text-ink-600 mt-1">Fund your cooperative wallet securely.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[10px] border border-ink-200 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-seed-950 mb-4">New Deposit</h3>
          <form onSubmit={initiatePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount (₦)</label>
              <input type="number" required min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] outline-none" placeholder="e.g. 50000" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-[#0ba4db] text-white rounded-[8px] text-sm font-medium hover:bg-[#098bb8] transition-colors flex items-center justify-center gap-2">
              Pay with Paystack
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="px-6 py-4 border-b border-ink-200 bg-ink-50">
            <h3 className="font-semibold text-seed-950">Deposit History</h3>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-ink-100">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-ink-500 text-sm">No deposit requests found.</div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="p-4 flex items-center justify-between hover:bg-ivory-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-seed-950 text-sm">{req.reference}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-seed-50 text-seed-800`}>
                        {req.type}
                      </span>
                    </div>
                    <span className="text-xs text-ink-600">
                      {new Date(req.requestedAt * 1000).toLocaleString()} 
                      {req.notes && ` • ${req.notes}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums mb-1">₦{(req.amountKobo / 100).toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'PENDING' ? 'bg-warning/10 text-warning' : 
                      req.status === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showPaystack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0ba4db] p-6 text-white text-center">
              <p className="text-sm opacity-90 mb-1">TEST MODE</p>
              <h2 className="text-3xl font-bold">₦{parseInt(amount).toLocaleString()}</h2>
              <p className="text-sm mt-2 opacity-90">{member.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-600 uppercase tracking-wider mb-1">Card Number</label>
                <input type="text" value="4084 0840 8408 4081" readOnly className="w-full px-3 py-2 border border-ink-200 rounded-[8px] bg-ink-50 text-ink-950 font-mono text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-ink-600 uppercase tracking-wider mb-1">Expiry</label>
                  <input type="text" value="12/28" readOnly className="w-full px-3 py-2 border border-ink-200 rounded-[8px] bg-ink-50 text-ink-950 font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 uppercase tracking-wider mb-1">CVV</label>
                  <input type="text" value="123" readOnly className="w-full px-3 py-2 border border-ink-200 rounded-[8px] bg-ink-50 text-ink-950 font-mono text-sm" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowPaystack(false)}
                  className="flex-1 py-3 px-4 border border-ink-200 text-ink-600 rounded-[8px] font-medium hover:bg-ink-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePaystackComplete}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-[#0ba4db] text-white rounded-[8px] font-medium hover:bg-[#098bb8] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
            <div className="bg-ink-50 p-3 text-center text-xs text-ink-500 border-t border-ink-100">
              Secured by Paystack
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
