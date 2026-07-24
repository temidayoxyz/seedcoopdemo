import { useOutletContext, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MemberLoans() {
  const { member } = useOutletContext<{ member: any }>();
  const [data, setData] = useState<any>(null);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchDashboard = () => {
    fetch('/api/members/dashboard').then(res => res.json()).then((d) => {
      setData(d);
      if (d.loans && d.loans.length > 0) {
        // Keep selected loan updated or default to first
        if (selectedLoan) {
          const updated = d.loans.find((l: any) => l.id === selectedLoan.id);
          setSelectedLoan(updated || d.loans[0]);
        } else {
          setSelectedLoan(d.loans[0]);
        }
      } else {
        setSelectedLoan(null);
      }
    });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCancelLoan = async (loanId: string) => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/members/loans/${loanId}/cancel`, {
        method: 'POST'
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success('Loan application cancelled successfully.');
        fetchDashboard();
      } else {
        toast.error(resData.error || 'Failed to cancel loan application');
      }
    } catch (err) {
      toast.error('An error occurred during cancellation');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-0">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-seed-950">Loans</h1>
          <p className="text-ink-600 mt-1">Manage your active loans and new applications.</p>
        </div>
        <Link 
          to="/member/loans/apply"
          className="bg-seed-800 text-white px-5 py-2.5 rounded-[10px] font-medium hover:bg-seed-700 transition-colors text-sm"
        >
          Apply for Loan
        </Link>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="px-6 py-4 border-b border-ink-200 bg-ink-50 flex justify-between items-center">
            <h3 className="font-semibold text-seed-950">Active Loans & History</h3>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-ink-100">
            {data.loans.length === 0 ? (
              <div className="p-8 text-center text-ink-500 text-sm">No loans found.</div>
            ) : (
              data.loans.map((loan: any) => (
                <div 
                  key={loan.id} 
                  onClick={() => setSelectedLoan(loan)}
                  className={`p-4 cursor-pointer hover:bg-ivory-50 transition-colors ${selectedLoan?.id === loan.id ? 'bg-seed-50 border-l-4 border-seed-600' : 'border-l-4 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-seed-950 text-sm">{loan.reference}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      loan.status === 'PENDING_APPROVAL' ? 'bg-warning/10 text-warning' : 
                      loan.status === 'APPROVED' ? 'bg-success/10 text-success' : 
                      loan.status === 'CANCELLED' ? 'bg-ink-100 text-ink-600' : 'bg-danger/10 text-danger'
                    }`}>
                      {loan.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-ink-600">₦{(loan.principalKobo / 100).toLocaleString()} for {loan.termMonths} Months</div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          {selectedLoan ? (
            <div className="bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-ink-200 bg-ink-50 flex justify-between items-center">
                <h3 className="font-semibold text-seed-950">Loan Details</h3>
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
                  <h4 className="text-sm font-semibold text-seed-800 uppercase tracking-wider mb-4 border-b border-ink-100 pb-2">Status & Actions</h4>
                  <div className="flex justify-between items-center bg-ivory-50 p-4 rounded-[8px] border border-ink-200">
                    <p className="text-sm text-ink-800">
                      {selectedLoan.status === 'PENDING_APPROVAL' ? 'Your loan is currently pending review by the loan committee.' : 
                       selectedLoan.status === 'CANCELLED' ? 'This loan application was cancelled.' :
                       'This loan is ' + selectedLoan.status.toLowerCase().replace('_', ' ') + '.'}
                    </p>
                    {selectedLoan.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleCancelLoan(selectedLoan.id)}
                        disabled={isCancelling}
                        className="px-4 py-2 text-xs font-semibold text-danger border border-danger/30 rounded-[8px] bg-white hover:bg-danger/5 transition-colors disabled:opacity-50"
                      >
                        {isCancelling ? 'Cancelling...' : 'Cancel Application'}
                      </button>
                    )}
                  </div>
                </section>

                {selectedLoan.guarantors && selectedLoan.guarantors.length > 0 && (
                  <section>
                    <h4 className="text-sm font-semibold text-seed-800 uppercase tracking-wider mb-4 border-b border-ink-100 pb-2">Guarantors</h4>
                    <div className="space-y-3">
                      {selectedLoan.guarantors.map((g: any) => (
                        <div key={g.id} className="flex justify-between items-center bg-ivory-50 p-3 rounded-[8px] border border-ink-200">
                          <div>
                            <p className="text-sm font-medium text-seed-950">{g.member?.firstName} {g.member?.lastName}</p>
                            <p className="text-xs font-mono text-ink-600">{g.member?.membershipNumber}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            g.status === 'ACCEPTED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                          }`}>
                            {g.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-ink-200 rounded-[10px] text-ink-500">
              Select a loan to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
