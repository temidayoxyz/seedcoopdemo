import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function MemberDashboard() {
  const { member } = useOutletContext<{ member: any }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/members/dashboard').then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  const currentMonthObligation = data.obligations[0] || { expectedAmountKobo: 0, paidAmountKobo: 0 };
  const percentPaid = currentMonthObligation.expectedAmountKobo > 0 ? (currentMonthObligation.paidAmountKobo / currentMonthObligation.expectedAmountKobo) * 100 : 0;
  const strokeDasharray = 2 * Math.PI * 40;
  const strokeDashoffset = strokeDasharray - (percentPaid / 100) * strokeDasharray;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-0">
      <header>
        <h1 className="text-2xl font-bold text-seed-950">Welcome back, {member.firstName}</h1>
        <p className="text-ink-600 mt-1">Here is your cooperative standing for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* The Contribution Ring */}
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
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-seed-950">{Math.round(percentPaid)}%</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-seed-950 mb-2">Current Cycle Contribution</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-ink-600 uppercase tracking-wider mb-1">Expected</p>
                <p className="text-xl font-semibold tabular-nums text-ink-950">
                  ₦{(currentMonthObligation.expectedAmountKobo / 100).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-600 uppercase tracking-wider mb-1">Paid</p>
                <p className="text-xl font-semibold tabular-nums text-success">
                  ₦{(currentMonthObligation.paidAmountKobo / 100).toLocaleString()}
                </p>
              </div>
            </div>
            {currentMonthObligation.expectedAmountKobo > currentMonthObligation.paidAmountKobo ? (
              <button className="bg-seed-800 text-white px-5 py-2 rounded-[8px] text-sm font-medium hover:bg-seed-700 transition-colors">
                Pay Outstanding ₦{((currentMonthObligation.expectedAmountKobo - currentMonthObligation.paidAmountKobo) / 100).toLocaleString()}
              </button>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                Fully Paid for {currentMonthObligation.monthPeriod}
              </span>
            )}
          </div>
        </div>

        {/* Total Contributions */}
        <div className="bg-white rounded-[14px] p-6 border border-ink-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-ink-600 mb-2">Total Contributions</h3>
          <p className="text-3xl font-bold text-seed-950 tabular-nums mb-4">
            ₦{(member.totalContributionsKobo / 100).toLocaleString()}
          </p>
          <div className="mt-auto">
            <div className="w-full bg-ink-100 rounded-full h-1.5 mb-2">
              <div className="bg-gold-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-ink-600">Active member for {Math.floor((new Date().getTime() - member.joinedAt * 1000) / (1000 * 60 * 60 * 24 * 30))} months</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[14px] p-6 border border-ink-200 shadow-sm">
          <h3 className="font-semibold text-seed-950 mb-4">Active Loan Status</h3>
          {data.loans.length > 0 ? (
            <div className="space-y-4">
              {data.loans.map((loan: any) => (
                <div key={loan.id} className="border border-ink-100 rounded-[10px] p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{loan.reference}</span>
                    <span className="text-xs px-2 py-1 bg-seed-50 text-seed-800 rounded-full">{loan.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div>
                      <p className="text-xs text-ink-600">Balance</p>
                      <p className="font-medium tabular-nums text-danger">₦{((loan.totalDueKobo - loan.paidKobo) / 100).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-600">Term</p>
                      <p className="font-medium">{loan.termMonths} months</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-ink-600 border border-dashed border-ink-200 rounded-[10px]">
              No active loans
            </div>
          )}
        </div>

        <div className="bg-white rounded-[14px] p-6 border border-ink-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-seed-950">Recent Announcements</h3>
            <span className="text-xs text-seed-600 hover:underline cursor-pointer">View all</span>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-seed-600 pl-4 py-1">
              <p className="font-medium text-sm">Annual General Meeting</p>
              <p className="text-xs text-ink-600 mt-1">Our upcoming AGM will hold on the 15th of next month...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
