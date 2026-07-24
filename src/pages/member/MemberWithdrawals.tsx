import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MemberWithdrawals() {
  const { member, refreshMember } = useOutletContext<{ member: any; refreshMember?: () => void }>();
  const [requests, setRequests] = useState<any[]>([]);
  
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchRequests = () => {
    fetch('/api/members/funds').then(res => res.json()).then(data => {
      setRequests((data.requests || []).filter((r: any) => r.type === 'WITHDRAWAL'));
    }).catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const amountKobo = parseInt(amount) * 100;
    if (isNaN(amountKobo) || amountKobo <= 0) return toast.error('Invalid amount');
    if (amountKobo > member.totalContributionsKobo) return toast.error('Insufficient funds');
    
    if (!bankName.trim() || !accountNumber.trim()) {
      return toast.error('Please provide valid bank details');
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/members/funds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'WITHDRAWAL', 
          amountKobo,
          notes: `Bank: ${bankName} | Acct: ${accountNumber}`
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Withdrawal request submitted successfully.');
        setAmount('');
        setBankName('');
        setAccountNumber('');
        fetchRequests();
        if (refreshMember) refreshMember();
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setCancellingId(requestId);
    try {
      const res = await fetch(`/api/members/funds/${requestId}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Withdrawal request cancelled.');
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to cancel request');
      }
    } catch (err) {
      toast.error('An error occurred during cancellation');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Withdrawals</h1>
        <p className="text-ink-600 mt-1">Request a withdrawal to your bank account.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[10px] border border-ink-200 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-seed-950 mb-4">New Withdrawal Request</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-ivory-50 p-4 rounded-[8px] border border-ink-200 mb-6">
              <p className="text-xs text-ink-600 uppercase tracking-wider mb-1">Available Balance</p>
              <p className="font-bold text-2xl text-seed-950">₦{(member.totalContributionsKobo / 100).toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-ink-950">Amount (₦)</label>
              <input type="number" required min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] outline-none focus:border-seed-600 focus:ring-1 focus:ring-seed-600 transition-all text-sm" placeholder="e.g. 50000" />
            </div>

            <div className="pt-2 border-t border-ink-100">
              <h4 className="text-sm font-semibold mb-3 text-ink-950">Bank Details</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1">Bank Name</label>
                  <input type="text" required value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] outline-none text-sm focus:border-seed-600 focus:ring-1 focus:ring-seed-600 transition-all" placeholder="e.g. GTBank" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-600 mb-1">Account Number</label>
                  <input type="text" required value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full px-3 py-2 border border-ink-200 rounded-[8px] outline-none text-sm focus:border-seed-600 focus:ring-1 focus:ring-seed-600 transition-all" placeholder="e.g. 0123456789" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-seed-800 text-white rounded-[8px] text-sm font-medium hover:bg-seed-700 transition-colors mt-6">
              {isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="px-6 py-4 border-b border-ink-200 bg-ink-50">
            <h3 className="font-semibold text-seed-950">Withdrawal History</h3>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-ink-100">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-ink-500 text-sm">No withdrawal requests found.</div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="p-4 flex items-center justify-between hover:bg-ivory-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-seed-950 text-sm">{req.reference}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-50 text-gold-700`}>
                        {req.type}
                      </span>
                    </div>
                    <span className="text-xs text-ink-600 block mb-1">
                      {new Date(req.requestedAt * 1000).toLocaleString()} 
                    </span>
                    {req.notes && (
                      <span className="text-[11px] bg-ink-100 px-2 py-0.5 rounded text-ink-700 font-mono">
                        {req.notes}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="font-medium tabular-nums">₦{(req.amountKobo / 100).toLocaleString()}</p>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'PENDING' ? 'bg-warning/10 text-warning' : 
                        req.status === 'APPROVED' ? 'bg-success/10 text-success' : 
                        req.status === 'CANCELLED' ? 'bg-ink-100 text-ink-600' : 'bg-danger/10 text-danger'
                      }`}>
                        {req.status}
                      </span>

                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          disabled={cancellingId === req.id}
                          className="text-xs text-danger hover:text-danger/80 border border-danger/30 px-2 py-0.5 rounded-[4px] bg-white hover:bg-danger/5 transition-colors disabled:opacity-50"
                        >
                          {cancellingId === req.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
