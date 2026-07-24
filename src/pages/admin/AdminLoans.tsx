import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function AdminLoans() {
  const { user } = useOutletContext<{ user: any }>();
  const [loans, setLoans] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchLoans = () => {
    fetch('/api/admin/loans').then(res => res.json()).then(data => {
      const fetchedLoans = data.loans || [];
      setLoans(fetchedLoans);
      if (fetchedLoans.length > 0 && !selectedLoan) {
        setSelectedLoan(fetchedLoans[0]);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAction = async (action: 'APPROVE' | 'DISBURSE') => {
    if (!selectedLoan) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/loans/${selectedLoan.id}/${action.toLowerCase()}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Loan successfully ${action === 'APPROVE' ? 'approved' : 'disbursed'}.`);
        setSelectedLoan(null);
        fetchLoans();
      } else {
        toast.error(data.error || `Failed to ${action.toLowerCase()} loan`);
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Loan Administration</h1>
        <p className="text-ink-600 mt-1">Review applications and disburse approved loans.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-ink-200 bg-ink-50">
            <input type="text" placeholder="Search loans..." className="w-full px-3 py-2 text-sm border border-ink-200 rounded-[6px] outline-none" />
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-ink-100">
            {loans.length === 0 ? (
              <div className="p-8 text-center text-ink-500 text-sm">No loans found.</div>
            ) : (
              loans.map(loan => (
                <div 
                  key={loan.id} 
                  onClick={() => setSelectedLoan(loan)}
                  className={`p-4 cursor-pointer hover:bg-ivory-50 transition-colors ${selectedLoan?.id === loan.id ? 'bg-seed-50 border-l-4 border-seed-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-seed-950 text-sm">{loan.reference}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      loan.status === 'PENDING_APPROVAL' ? 'bg-warning/10 text-warning' : 
                      loan.status === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-ink-100 text-ink-600'
                    }`}>
                      {loan.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-ink-600 mt-1">{loan.member?.firstName} {loan.member?.lastName}</div>
                  <div className="text-xs text-ink-600">₦{(loan.principalKobo / 100).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedLoan ? (
            <div className="bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-ink-200 bg-ink-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-seed-950">Loan Details</h3>
                  <p className="text-xs text-ink-600 mt-1">{selectedLoan.member?.firstName} {selectedLoan.member?.lastName} • {selectedLoan.member?.membershipNumber}</p>
                </div>
                <span className="text-sm font-mono text-ink-600">{selectedLoan.reference}</span>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-8">
                <section>
                  <h4 className="text-sm font-semibold text-seed-800 uppercase tracking-wider mb-4 border-b border-ink-100 pb-2">Financials</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-ink-600 mb-1">Principal</p>
                      <p className="font-medium tabular-nums">₦{(selectedLoan.principalKobo / 100).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-600 mb-1">Total Due</p>
                      <p className="font-medium tabular-nums">₦{(selectedLoan.totalDueKobo / 100).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-600 mb-1">Term</p>
                      <p className="font-medium">{selectedLoan.termMonths} Months</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-semibold text-seed-800 uppercase tracking-wider mb-4 border-b border-ink-100 pb-2">Guarantors</h4>
                  {selectedLoan.guarantors && selectedLoan.guarantors.length > 0 ? (
                    <div className="space-y-3">
                      {selectedLoan.guarantors.map((g: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 border border-ink-200 rounded-[8px]">
                          <div>
                            <p className="text-sm font-medium">{g.member?.firstName} {g.member?.lastName}</p>
                            <p className="text-xs text-ink-600">{g.member?.membershipNumber}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            g.status === 'ACCEPTED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {g.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-ink-500">No guarantors required or recorded.</p>
                  )}
                </section>
              </div>

              {selectedLoan.status === 'PENDING_APPROVAL' && (user.role === 'SUPER_ADMIN' || user.role === 'LOAN_OFFICER') && (
                <div className="px-6 py-4 border-t border-ink-200 bg-ivory-50 flex justify-end gap-3">
                  <button onClick={() => handleAction('APPROVE')} disabled={isProcessing} className="px-6 py-2 text-sm font-medium text-white bg-seed-800 rounded-[8px] hover:bg-seed-700">
                    {isProcessing ? 'Processing...' : 'Approve Loan'}
                  </button>
                </div>
              )}
              
              {selectedLoan.status === 'APPROVED' && (user.role === 'SUPER_ADMIN' || user.role === 'TREASURER') && (
                <div className="px-6 py-4 border-t border-ink-200 bg-ivory-50 flex justify-end gap-3">
                  <button onClick={() => handleAction('DISBURSE')} disabled={isProcessing} className="px-6 py-2 text-sm font-medium text-white bg-gold-500 rounded-[8px] hover:bg-gold-600">
                    {isProcessing ? 'Processing...' : 'Simulate Disbursement'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-ink-200 rounded-[10px] text-ink-500">
              Select a loan to manage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
