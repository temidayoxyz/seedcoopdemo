import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function AdminDashboard() {
  const { user } = useOutletContext<{ user: any }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard').then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[10px] border border-ink-200 shadow-sm">
          <p className="text-sm font-medium text-ink-600 mb-1">Active Members</p>
          <p className="text-3xl font-bold text-seed-950 tabular-nums">{data.activeMembers}</p>
        </div>
        <div className="bg-white p-6 rounded-[10px] border border-ink-200 shadow-sm">
          <p className="text-sm font-medium text-ink-600 mb-1">Pending Applications</p>
          <p className="text-3xl font-bold text-seed-950 tabular-nums">{data.pendingApplications}</p>
        </div>
        <div className="bg-white p-6 rounded-[10px] border border-ink-200 shadow-sm">
          <p className="text-sm font-medium text-ink-600 mb-1">Total Contributions</p>
          <p className="text-3xl font-bold text-seed-950 tabular-nums">₦{(data.totalContributions / 100).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[10px] border border-ink-200 shadow-sm">
          <p className="text-sm font-medium text-ink-600 mb-1">Active Loan Portfolio</p>
          <p className="text-3xl font-bold text-seed-950 tabular-nums">₦{(data.activeLoanPortfolio / 100).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-200 flex justify-between items-center bg-ink-50">
            <h3 className="font-semibold">Recent Applications</h3>
          </div>
          <div className="divide-y divide-ink-100">
            {data.recentApplications.length === 0 ? (
              <div className="p-6 text-center text-ink-400">No recent applications</div>
            ) : (
              data.recentApplications.map((app: any) => (
                <div key={app.id} className="p-4 px-6 flex justify-between items-center hover:bg-ivory-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-seed-950">{app.firstName} {app.lastName}</p>
                    <p className="text-xs text-ink-600">{app.reference}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-seed-100 text-seed-800">
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-ink-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-200 flex justify-between items-center bg-ink-50">
            <h3 className="font-semibold">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-ink-100">
             {data.recentTransactions.length === 0 ? (
              <div className="p-6 text-center text-ink-400">No recent transactions</div>
            ) : (
              data.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="p-4 px-6 flex justify-between items-center hover:bg-ivory-50 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-seed-950">{tx.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-ink-600">{tx.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold tabular-nums text-sm ${tx.type.includes('PAYMENT') ? 'text-success' : 'text-danger'}`}>
                      ₦{(tx.amountKobo / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-ink-400">{new Date(tx.date * 1000).toLocaleDateString()}</p>
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
