import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function AdminWithdrawals() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = () => {
    fetch('/api/admin/funds').then(res => res.json()).then(data => {
      setRequests((data.requests || []).filter((r: any) => r.type === 'WITHDRAWAL'));
    }).catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/funds/${id}/${action}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Withdrawal request successfully ${action}d.`);
        fetchRequests();
      } else {
        toast.error(data.error || `Failed to ${action} request`);
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Withdrawals Administration</h1>
        <p className="text-ink-600 mt-1">Review and process member withdrawals.</p>
      </header>

      <div className="bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden h-[calc(100vh-200px)] flex flex-col">
        <div className="px-6 py-4 border-b border-ink-200 bg-ink-50">
          <h3 className="font-semibold text-seed-950">Withdrawal Requests</h3>
        </div>
        <div className="overflow-y-auto flex-1 divide-y divide-ink-100">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-ink-500 text-sm">No withdrawal requests found.</div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-ivory-50 transition-colors gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-seed-950">{req.member?.firstName} {req.member?.lastName}</span>
                    <span className="text-xs font-mono text-ink-600">{req.member?.membershipNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ink-600 mb-2">
                    <span className="font-mono">{req.reference}</span>
                    <span>•</span>
                    <span>{new Date(req.requestedAt * 1000).toLocaleString()}</span>
                  </div>
                  {req.notes && (
                    <div className="bg-ink-100 text-ink-800 text-xs px-3 py-1.5 rounded-[6px] inline-block font-mono border border-ink-200">
                      {req.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 sm:text-right">
                  <div className="flex items-center sm:justify-end gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-50 text-gold-700`}>
                      {req.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === 'PENDING' ? 'bg-warning/10 text-warning' : 
                      req.status === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="font-semibold tabular-nums text-seed-950">
                    ₦{(req.amountKobo / 100).toLocaleString()}
                  </p>
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <button 
                      onClick={() => handleAction(req.id, 'approve')} 
                      disabled={isProcessing}
                      className="px-4 py-1.5 bg-success/10 text-success rounded-[6px] text-sm font-medium hover:bg-success hover:text-white transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'reject')} 
                      disabled={isProcessing}
                      className="px-4 py-1.5 bg-danger/10 text-danger rounded-[6px] text-sm font-medium hover:bg-danger hover:text-white transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
