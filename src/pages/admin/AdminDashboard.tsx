import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MoneyText } from '../../components/money/MoneyText';
import { CopyableRef } from '../../components/money/CopyableRef';
import { ROLE_LABELS, ROLE_DUTIES } from '../../lib/roles';

export function AdminDashboard() {
  const { user } = useOutletContext<{ user: any }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/dashboard').then((res) => res.json()).then(setData);
  }, []);

  if (!data) return <div>Loading…</div>;

  const roleLabel = ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role;

  return (
    <div className="space-y-6">
      <div className="bg-seed-950 text-white rounded-[14px] p-6">
        <p className="text-seed-200 text-sm">Signed in as</p>
        <h1 className="text-2xl font-bold mt-1">{user.displayName || user.email}</h1>
        <p className="text-gold-400 font-semibold text-sm mt-1">{roleLabel}</p>
        <p className="text-seed-200 text-sm mt-2 max-w-2xl">{ROLE_DUTIES[user.role as keyof typeof ROLE_DUTIES]}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active members', value: data.activeMembers },
          { label: 'Pending applications', value: data.pendingApplications },
          { label: 'Pending loans', value: data.pendingLoans },
          { label: 'Pending withdrawals', value: data.pendingWithdrawals },
        ].map((c) => (
          <div key={c.label} className="bg-white p-5 rounded-[12px] border border-ink-200">
            <p className="text-xs uppercase text-ink-500 font-semibold">{c.label}</p>
            <p className="text-3xl font-bold text-seed-950 mt-1 tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[12px] border border-ink-200">
          <p className="text-xs uppercase text-ink-500 font-semibold">Member thrift total</p>
          <p className="text-2xl font-bold mt-1"><MoneyText kobo={data.totalContributions} /></p>
        </div>
        <div className="bg-white p-5 rounded-[12px] border border-ink-200">
          <p className="text-xs uppercase text-ink-500 font-semibold">Active loan book</p>
          <p className="text-2xl font-bold mt-1"><MoneyText kobo={data.activeLoanPortfolio} /></p>
        </div>
        <div className="bg-white p-5 rounded-[12px] border border-ink-200">
          <p className="text-xs uppercase text-ink-500 font-semibold">Investment portfolio</p>
          <p className="text-2xl font-bold mt-1"><MoneyText kobo={data.investmentValueKobo} /></p>
        </div>
        <div className="bg-white p-5 rounded-[12px] border border-ink-200">
          <p className="text-xs uppercase text-ink-500 font-semibold">Contribution compliance</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{data.contributionCompliance}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[12px] border border-ink-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-100 font-semibold bg-ink-50">Recent applications</div>
          <div className="divide-y divide-ink-100">
            {data.recentApplications.length === 0 ? (
              <div className="p-6 text-ink-400 text-center">No applications</div>
            ) : data.recentApplications.map((app: any) => (
              <div key={app.id} className="px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{app.firstName} {app.lastName}</p>
                  <CopyableRef value={app.reference} />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-seed-100 text-seed-800">{app.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-ink-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-100 font-semibold bg-ink-50">Recent ledger entries</div>
          <div className="divide-y divide-ink-100">
            {data.recentTransactions.map((tx: any) => (
              <div key={tx.id} className="px-5 py-3 flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{tx.description || tx.type.replace(/_/g, ' ')}</p>
                  <CopyableRef value={tx.reference} />
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold text-sm ${tx.side === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
                    <MoneyText kobo={tx.amountKobo} />
                  </p>
                  <p className="text-[10px] text-ink-400 uppercase">{tx.side}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
