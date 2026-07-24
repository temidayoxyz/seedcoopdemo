import { Link } from 'react-router-dom';

export function LoansPage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <section className="bg-seed-950 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Cooperative Loans</h1>
          <p className="text-xl text-seed-200">
            Fair, accessible credit designed for the growth and success of our members.
          </p>
        </div>
      </section>
      <section className="py-24 bg-ivory-50 flex-grow">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[16px] border border-ink-200 shadow-sm">
            <h3 className="text-2xl font-bold text-seed-950 mb-4">Personal Loans</h3>
            <p className="text-ink-600 mb-6">Designed for personal projects, emergencies, and general needs. Accessible up to 200% of your savings.</p>
            <div className="text-sm font-semibold text-seed-800 bg-seed-50 px-3 py-1.5 rounded-full inline-block">Interest: 5% flat</div>
          </div>
          <div className="bg-white p-8 rounded-[16px] border border-ink-200 shadow-sm">
            <h3 className="text-2xl font-bold text-seed-950 mb-4">Business Loans</h3>
            <p className="text-ink-600 mb-6">Capital to scale your business, buy inventory, or expand operations. Longer tenures available.</p>
            <div className="text-sm font-semibold text-seed-800 bg-seed-50 px-3 py-1.5 rounded-full inline-block">Interest: 7% flat</div>
          </div>
        </div>
      </section>
    </div>
  );
}
