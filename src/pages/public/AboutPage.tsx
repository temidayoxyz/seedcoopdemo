import { Users, Target, ShieldCheck, History, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="bg-seed-950 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About SeedCoop</h1>
          <p className="text-xl text-seed-200 max-w-2xl mx-auto leading-relaxed">
            We are a cooperative built on trust, transparency, and collective growth. 
            Empowering members through shared financial resources.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-ivory-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-white p-10 rounded-[20px] border border-ink-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-seed-100 opacity-20">
                <Target className="w-32 h-32" />
              </div>
              <div className="w-14 h-14 rounded-full bg-seed-100 text-seed-800 flex items-center justify-center mb-6 relative z-10">
                <Target className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-seed-950 mb-4 relative z-10">Our Mission</h2>
              <p className="text-ink-600 text-lg leading-relaxed relative z-10">
                To provide an accessible, transparent, and mutually beneficial financial cooperative 
                where members can pool resources, access credit at fair rates, and build a 
                secure future together through shared responsibility.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[20px] border border-ink-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-gold-100 opacity-20">
                <Users className="w-32 h-32" />
              </div>
              <div className="w-14 h-14 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center mb-6 relative z-10">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-seed-950 mb-4 relative z-10">Our Vision</h2>
              <p className="text-ink-600 text-lg leading-relaxed relative z-10">
                To become the most trusted cooperative institution, fostering a thriving 
                community where every member's contribution leads to collective prosperity 
                and enduring financial empowerment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-24 bg-white border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seed-50 text-seed-700 text-sm font-semibold mb-6">
                <History className="w-4 h-4" /> Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-seed-950 mb-6">Rooted in community</h2>
              <p className="text-ink-600 text-lg mb-6 leading-relaxed">
                SeedCoop was founded on a simple principle: when we work together, we grow together. 
                What started as a small group of individuals pooling resources to support each other's 
                goals has evolved into a robust cooperative.
              </p>
              <p className="text-ink-600 text-lg leading-relaxed mb-8">
                Over the years, we've maintained our commitment to transparency and democratic control. 
                Every decision we make is guided by the best interests of our members, ensuring that 
                our growth directly benefits the people who make it possible.
              </p>
              
              <div className="grid grid-cols-2 gap-8 border-t border-ink-100 pt-8">
                <div>
                  <div className="text-3xl font-bold text-seed-800 mb-1">2015</div>
                  <div className="text-sm font-medium text-ink-500 uppercase tracking-wide">Founded</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-seed-800 mb-1">100%</div>
                  <div className="text-sm font-medium text-ink-500 uppercase tracking-wide">Member Owned</div>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] rounded-[20px] overflow-hidden bg-ivory-50 border border-ink-200 shadow-lg group">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Team collaboration"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-seed-900/10 mix-blend-multiply"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-seed-50 border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-seed-950 mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Transparency',
                icon: ShieldCheck,
                description: 'An open ledger approach. Members always know where the cooperative stands and how decisions are made.'
              },
              {
                title: 'Mutual Benefit',
                icon: Users,
                description: 'We believe that the cooperative succeeds only when its individual members succeed.'
              },
              {
                title: 'Sustainability',
                icon: Target,
                description: 'Prudent management of resources to ensure long-term stability and growth for generations to come.'
              }
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[16px] border border-ink-200 shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-seed-100 flex items-center justify-center text-seed-700 mb-6">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-seed-950 mb-3">{value.title}</h3>
                <p className="text-ink-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-seed-950 mb-4">Elected Leadership</h2>
            <p className="text-ink-600 text-lg">
              Our cooperative is governed by a dedicated board of members, elected by the community to oversee our shared interests.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { role: 'Chairman', name: 'Chukwudi Okafor', img: 'https://i.pravatar.cc/300?img=11' },
              { role: 'Treasurer', name: 'Aisha Nuhu', img: 'https://i.pravatar.cc/300?img=5' },
              { role: 'Secretary', name: 'Emeka Obi', img: 'https://i.pravatar.cc/300?img=8' },
              { role: 'Loan Officer', name: 'Oluwaseun Adebayo', img: 'https://i.pravatar.cc/300?img=10' }
            ].map((leader, i) => (
              <div key={i} className="group text-center">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg bg-ivory-50">
                  <img src={leader.img} alt={leader.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="text-xl font-bold text-seed-950 mb-1">{leader.name}</h4>
                <p className="font-medium text-ink-500">{leader.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-seed-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to grow with us?</h2>
          <p className="text-seed-200 text-lg mb-10">
            Join the cooperative today and be part of a community that values shared prosperity.
          </p>
          <Link to="/login" className="inline-flex justify-center items-center px-8 py-4 rounded-[10px] bg-white text-seed-950 font-bold hover:bg-ivory-50 transition-colors">
            Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
