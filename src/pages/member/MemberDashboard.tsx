import { useOutletContext, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MoneyText } from '../../components/money/MoneyText';
import { CopyableRef } from '../../components/money/CopyableRef';

export function MemberDashboard() {
  const { member } = useOutletContext<{ member: any }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/members/dashboard').then((res) => res.json()).then(setData);
  }, []);

  if (!data) return <div>Loading dashboard…</div>;

  const m = data.member || member;
  const currentMonthObligation = data.obligations[0] || { expectedAmountKobo: 0, paidAmountKobo: 0 };
  const percentPaid =
    currentMonthObligation.expectedAmountKobo > 0
      ? (currentMonthObligation.paidAmountKobo / currentMonthObligation.expectedAmountKobo) * 100
      : 0;
  const strokeDasharray = 2 * Math.PI * 40;
  const strokeDashoffset = strokeDasharray - (percentPaid / 100) * strokeDasharray;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Welcome back, {m.firstName}</h1>
        <p className="text-ink-600 mt-1">
          Membership <span className="font-mono font-semibold text-seed-800">{m.membershipNumber}</span>
          {' · '}
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 bg-white rounded-[14px] p-6 border border-ink-200 shadow-sm flex flex-col sm:flex-row items-center gap-8">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" stroke="var(--color-ink-100)" strokeWidth="8" fill="none" />
              <motion.circle
                cx="50" cy="50" r="40"
                stroke="var(--color-seed-600)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: strokeDasharray }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-seed-950">{Math.round(percentPaid)}%</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-seed-950 mb-2">Current cycle contribution</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-ink-600 uppercase tracking-wider mb-1">Expected</p>
                <p className="text-xl font-semibold"><MoneyText kobo={currentMonthObligation.expectedAmountKobo} /></p>
              </div>
              <div>
                <p className="text-xs text-ink-600 uppercase tracking-wider mb-1">Paid</p>
                <p className="text-xl font-semibold text-success"><MoneyText kobo={currentMonthObligation.paidAmountKobo} /></p>
              </div>
            </div>
            {currentMonthObligation.expectedAmountKobo > currentMonthObligation.paidAmountKobo ? (
              <Link to="/member/contributions" className="inline-flex bg-seed-800 text-white px-5 py-2 rounded-[8px] text-sm font-medium hover:bg-seed-700">
                Pay outstanding
              </Link>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                Fully paid for {currentMonthObligation.monthPeriod}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-6 border border-ink-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-ink-600 mb-2">Total thrift</h3>
          <p className="text-3xl font-bold text-seed-950 mb-2">
            <MoneyText kobo={m.totalContributionsKobo} />
          </p>
          <p className="text-xs text-ink-600">
            Active for {Math.max(1, Math.floor((Date.now() - m.joinedAt * 1000) / (1000 * 60 * 60 * 24 * 30)))} months
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[14px] p-6 border border-ink-200 shadow-sm">
          <h3 className="font-semibold text-seed-950 mb-4">Loans</h3>
          {data.loans.length > 0 ? (
            <div className="space-y-4">
              {data.loans.map((loan: any) => (
                <div key={loan.id} className="border border-ink-100 rounded-[10px] p-4">
                  <div className="flex justify-between items-start mb-2">
                    <CopyableRef value={loan.reference} />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ink-100">{loan.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-ink-600">Principal</span>
                    <MoneyText kobo={loan.principalKobo} className="font-semibold" />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-ink-600">Outstanding</span>
                    <MoneyText kobo={loan.totalDueKobo - loan.paidKobo} className="font-semibold" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-500 text-sm">No loans. <Link className="text-seed-700 font-medium" to="/member/loans/apply">Apply for a loan</Link></p>
          )}
        </div>

        <div className="bg-white rounded-[14px] p-6 border border-ink-200 shadow-sm space-y-4">
          <h3 className="font-semibold text-seed-950">Your dividends</h3>
          {data.dividends?.length ? (
            data.dividends.slice(0, 3).map((d: any) => (
              <div key={d.id} className="flex justify-between text-sm">
                <span className="text-ink-600">{d.period?.label || 'Dividend'}</span>
                <MoneyText kobo={d.amountKobo} className="font-semibold text-success" />
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-500">No dividends yet.</p>
          )}
          <Link to="/member/dividends" className="text-sm font-medium text-seed-700">View all dividends →</Link>

          <div className="pt-4 border-t border-ink-100">
            <h3 className="font-semibold text-seed-950 mb-2">Co-op investments</h3>
            <p className="text-sm text-ink-600">
              {data.investmentsSummary?.activeCount || 0} active placements · portfolio{' '}
              <MoneyText kobo={data.investmentsSummary?.totalValueKobo || 0} className="font-semibold" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
