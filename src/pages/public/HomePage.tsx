import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, FileText, Shield, Users, ArrowRight } from 'lucide-react';

export function HomePage() {
  return (
    <div>
      {/* Section 1: Hero — Shared growth */}
      <section className="relative overflow-hidden bg-ivory-50 pt-20 pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] border border-seed-200 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] border border-seed-200 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] border border-seed-200 rounded-full opacity-40"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seed-100 text-seed-800 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-seed-600"></span>
              Join a modern cooperative
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-seed-950 mb-6 leading-[1.1]">
              Grow together. <br />
              <span className="text-seed-700">See every contribution count.</span>
            </h1>
            <p className="text-lg text-ink-600 mb-8 leading-relaxed">
              SeedCoop is a private digital operating system for our cooperative. 
              We turn individual contributions into a shared reserve, creating 
              transparent opportunity and collective stability for all members.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="inline-flex justify-center items-center px-6 py-3 rounded-[10px] bg-seed-800 text-white font-medium hover:bg-seed-700 transition-all hover:-translate-y-0.5">
                Sign In
              </Link>
              <Link to="/about" className="inline-flex justify-center items-center px-6 py-3 rounded-[10px] bg-white text-seed-900 border border-ink-200 font-medium hover:bg-seed-50 transition-all">
                Learn More
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-ink-600">
              <div className="flex -space-x-2">
                {[
                  'https://i.pravatar.cc/100?img=32',
                  'https://i.pravatar.cc/100?img=12',
                  'https://i.pravatar.cc/100?img=44',
                  'https://i.pravatar.cc/100?img=68'
                ].map((url, i) => (
                  <img key={i} src={url} alt={`Member ${i+1}`} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                ))}
              </div>
              <p>Trusted by 100+ members</p>
            </div>
          </div>
          <div className="relative h-[500px] flex items-center justify-center lg:justify-end">
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px] h-auto overflow-visible">
              <motion.circle cx="200" cy="200" r="120" stroke="var(--color-seed-200)" strokeWidth="1" fill="none" />
              <motion.circle cx="200" cy="200" r="80" stroke="var(--color-seed-200)" strokeWidth="1" fill="none" />
              
              <motion.circle cx="200" cy="200" r="40" fill="var(--color-seed-800)" 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.circle cx="200" cy="200" r="48" stroke="var(--color-gold-500)" strokeWidth="2" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 1 }}
              />

              {[
                { angle: 0, delay: 0.2 },
                { angle: 60, delay: 0.4 },
                { angle: 120, delay: 0.3 },
                { angle: 180, delay: 0.5 },
                { angle: 240, delay: 0.25 },
                { angle: 300, delay: 0.45 },
              ].map((node, i) => {
                const r = 160;
                const rad = (node.angle * Math.PI) / 180;
                const cx = 200 + r * Math.cos(rad);
                const cy = 200 + r * Math.sin(rad);

                return (
                  <g key={i}>
                    <motion.line x1={cx} y1={cy} x2="200" y2="200" stroke="var(--color-seed-200)" strokeWidth="1" />
                    <motion.circle cx={cx} cy={cy} r="8" fill="var(--color-seed-600)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: node.delay, duration: 0.4 }}
                    />
                    <motion.circle cx={cx} cy={cy} r="4" fill="var(--color-gold-500)"
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      animate={{ 
                        x: 200 - cx, 
                        y: 200 - cy,
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 2, 
                        delay: node.delay + 1,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </section>

      {/* Section 2: How contributions become progress */}
      <section className="py-24 bg-white border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-seed-950 mb-4">How contributions become progress</h2>
            <p className="text-ink-600">A living ledger where every member's participation builds our collective capacity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[14px] bg-ivory-50 border border-ink-200">
              <div className="w-12 h-12 rounded-full bg-seed-100 flex items-center justify-center mb-6">
                <span className="text-seed-800 font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Contribute</h3>
              <p className="text-ink-600">Members make regular monthly contributions, building individual savings within the cooperative.</p>
            </div>
            <div className="p-8 rounded-[14px] bg-ivory-50 border border-ink-200 relative">
              <div className="hidden md:block absolute top-1/2 -left-4 -translate-y-1/2 text-ink-300">
                <ChevronRight className="w-8 h-8" />
              </div>
              <div className="w-12 h-12 rounded-full bg-seed-100 flex items-center justify-center mb-6">
                <span className="text-seed-800 font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Pool Resources</h3>
              <p className="text-ink-600">Contributions form a shared reserve, creating collective financial power for the entire community.</p>
            </div>
            <div className="p-8 rounded-[14px] bg-ivory-50 border border-ink-200 relative">
              <div className="hidden md:block absolute top-1/2 -left-4 -translate-y-1/2 text-ink-300">
                <ChevronRight className="w-8 h-8" />
              </div>
              <div className="w-12 h-12 rounded-full bg-seed-100 flex items-center justify-center mb-6">
                <span className="text-seed-800 font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Access Opportunity</h3>
              <p className="text-ink-600">Eligible members can access loans at fair rates, supported by the strength of the shared reserve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The cooperative is the sum of its members */}
      <section className="py-24 bg-seed-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The cooperative is the sum of its members.</h2>
              <p className="text-seed-200 text-lg mb-8 leading-relaxed">
                We believe that consistent member activity creates collective capacity. Every contribution, no matter the size, strengthens the shared reserve. 
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-gold-500 shrink-0" />
                  <span className="text-seed-100">Transparent records of every single member contribution.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-gold-500 shrink-0" />
                  <span className="text-seed-100">Your savings are protected and mutually beneficial.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-gold-500 shrink-0" />
                  <span className="text-seed-100">A clear explanation of how records are maintained at all times.</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[400px] flex justify-center items-center">
              <div className="absolute inset-0 border border-seed-800 rounded-full w-[300px] h-[300px] mx-auto animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute inset-0 border border-seed-700 rounded-full w-[200px] h-[200px] mx-auto m-auto animate-[spin_40s_linear_infinite_reverse]"></div>
              <div className="bg-seed-800 w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 border-seed-600 z-10 shadow-xl">
                <span className="text-gold-500 text-sm font-bold tracking-widest uppercase">Reserve</span>
                <span className="text-white text-2xl font-bold tabular-nums">100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Loans as shared opportunity */}
      <section className="py-24 bg-ivory-50 border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-seed-950 mb-6">Loans as shared opportunity</h2>
            <p className="text-ink-600 text-lg">
              Loans emerge from cooperative participation and responsible governance. They are governed processes, designed to elevate members without burdening the collective.
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-ink-200 -z-10 hidden md:block"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 'Eligibility', desc: 'Based on consistent contributions' },
                { step: 'Guarantors', desc: 'Supported by trusted members' },
                { step: 'Approval', desc: 'Governed by the loan committee' },
                { step: 'Repayment', desc: 'Restoring the collective pool' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[14px] border border-ink-200 shadow-sm flex flex-col items-center relative">
                  <div className="w-10 h-10 rounded-full bg-seed-800 text-white flex items-center justify-center font-bold mb-4">
                    {idx + 1}
                  </div>
                  <h4 className="font-semibold text-seed-950 mb-2">{item.step}</h4>
                  <p className="text-sm text-ink-600 text-center">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Transparency and the living ledger */}
      <section className="py-24 bg-white border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-ivory-50 border border-ink-200 rounded-[14px] p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-ink-200">
                  <span className="text-xs font-semibold text-ink-500 uppercase">Transaction</span>
                  <span className="text-xs font-semibold text-ink-500 uppercase">Amount</span>
                </div>
                {[
                  { ref: 'DEMO-PAY-4912', type: 'Contribution', amount: '₦20,000', status: 'Completed' },
                  { ref: 'LN-2026-8192', type: 'Loan Disbursement', amount: '₦50,000', status: 'Completed' },
                  { ref: 'DEMO-PAY-9182', type: 'Repayment', amount: '₦10,000', status: 'Completed' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2 bg-white px-4 rounded-[8px] border border-ink-100 shadow-sm">
                    <div>
                      <div className="font-medium text-sm text-seed-950">{row.type}</div>
                      <div className="text-xs font-mono text-ink-500">{row.ref}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm tabular-nums text-seed-950">{row.amount}</div>
                      <div className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full inline-block mt-1">{row.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-seed-950 mb-6">Transparency and the living ledger</h2>
              <p className="text-ink-600 text-lg mb-6">
                Our cooperative operates on an append-only financial ledger. Every contribution, loan, and repayment is permanently recorded, ensuring absolute accountability.
              </p>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-seed-50 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-seed-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-seed-950 mb-1">Auditable Records</h4>
                  <p className="text-sm text-ink-600">Corrections appear as linked reversals rather than deleted history, maintaining complete trust in the system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Governance */}
      <section className="py-24 bg-ivory-50 border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-seed-950 mb-4">Governed by members, for members</h2>
            <p className="text-ink-600">Our cooperative is structured around clear policies and elected leadership to protect your contributions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Chairman', initials: 'CO', name: 'Chukwudi Okafor' },
              { role: 'Treasurer', initials: 'AN', name: 'Aisha Nuhu' },
              { role: 'Secretary', initials: 'EO', name: 'Emeka Obi' },
              { role: 'Loan Officer', initials: 'OA', name: 'Oluwaseun Adebayo' }
            ].map((leader, i) => (
              <div key={i} className="bg-white p-6 rounded-[14px] border border-ink-200 text-center">
                <div className="w-16 h-16 rounded-full bg-seed-100 border-2 border-white mx-auto flex items-center justify-center text-xl font-bold text-seed-800 mb-4 shadow-sm">
                  {leader.initials}
                </div>
                <h4 className="font-semibold text-seed-950">{leader.name}</h4>
                <p className="text-sm text-ink-500 mt-1">{leader.role}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-ink-600 bg-white px-4 py-2 rounded-full border border-ink-200">
              <Shield className="w-4 h-4 text-seed-600" /> Strict Data Protection
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-600 bg-white px-4 py-2 rounded-full border border-ink-200">
              <Users className="w-4 h-4 text-seed-600" /> Member-Voted Bylaws
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Member experience preview */}
      <section className="py-24 bg-white border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-seed-950 mb-6">Designed for clarity</h2>
          <p className="text-ink-600 max-w-2xl mx-auto mb-16 text-lg">
            The member portal gives you a complete, reassuring view of your cooperative standing at any time.
          </p>
          
          <div className="max-w-4xl mx-auto bg-ivory-50 rounded-[20px] border border-ink-200 shadow-xl overflow-hidden">
            <div className="bg-white border-b border-ink-200 px-6 py-4 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-ink-200"></div>
                <div className="w-3 h-3 rounded-full bg-ink-200"></div>
                <div className="w-3 h-3 rounded-full bg-ink-200"></div>
              </div>
              <div className="text-sm font-medium text-ink-400">SeedCoop Member Portal</div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="col-span-2 bg-white border border-ink-200 rounded-[10px] p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-seed-950 mb-4">Current Cycle Contribution</h4>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full border-4 border-seed-600 flex items-center justify-center">
                    <span className="font-bold text-seed-950 text-lg">100%</span>
                  </div>
                  <div>
                    <div className="text-xs text-ink-500 uppercase tracking-wider mb-1">Status</div>
                    <div className="text-success font-medium bg-success/10 px-3 py-1 rounded-full inline-block text-sm">Fully Paid</div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-ink-200 rounded-[10px] p-6 shadow-sm flex flex-col justify-center">
                <h4 className="text-sm font-semibold text-seed-950 mb-2">Total Contributions</h4>
                <div className="text-2xl font-bold tabular-nums text-seed-950 mb-2">₦120,000</div>
                <div className="w-full bg-ink-100 h-1.5 rounded-full"><div className="w-full h-1.5 bg-gold-500 rounded-full"></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Final invitation */}
      <section className="py-32 bg-seed-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-16 h-16 rounded-full bg-seed-800 mx-auto flex items-center justify-center mb-8 border-4 border-seed-700">
            <div className="w-4 h-4 rounded-full bg-gold-500"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Plant your seed today.</h2>
          <p className="text-seed-200 text-lg mb-10">
            Join the cooperative to start building a secure financial future, supported by a community you can trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="inline-flex justify-center items-center px-8 py-4 rounded-[10px] bg-white text-seed-950 font-bold hover:bg-ivory-50 transition-colors">
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/contact" className="inline-flex justify-center items-center px-8 py-4 rounded-[10px] bg-seed-800 text-white font-medium hover:bg-seed-700 transition-colors">
              Contact Support
            </Link>
          </div>
          <p className="mt-8 text-sm text-seed-400">
            Eligibility requirements apply. Please review our bylaws before joining.
          </p>
        </div>
      </section>
    </div>
  );
}

