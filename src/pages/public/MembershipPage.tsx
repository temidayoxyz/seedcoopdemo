import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MembershipPage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <section className="bg-seed-950 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join SeedCoop</h1>
          <p className="text-xl text-seed-200">
            Become a part of a growing community dedicated to shared prosperity and financial empowerment.
          </p>
        </div>
      </section>
      <section className="py-24 bg-ivory-50 flex-grow">
        <div className="max-w-3xl mx-auto px-4 space-y-8 text-lg text-ink-700">
          <h2 className="text-3xl font-bold text-seed-950">Why Join Us?</h2>
          <ul className="space-y-4">
            {[
              "Access to low-interest cooperative loans",
              "Annual dividends based on cooperative surplus",
              "Democratic participation in cooperative decisions",
              "Secure savings with competitive returns"
            ].map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-seed-600 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 bg-seed-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-seed-700 transition-colors">
              Apply for Membership <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
