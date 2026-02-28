import { Link } from 'react-router-dom';
import { Navigation, ArrowRight, Map, DollarSign, Compass, Shield, Zap, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🗺️', title: 'Smart Route Planning', desc: 'Enter your origin and destination with distance and travel details — we do the rest.' },
  { icon: '🚗', title: 'Any Transport Mode', desc: 'Car, bike, bus, train, flight, or cab — full cost breakdown for every option.' },
  { icon: '⛽', title: 'Live Fuel Calculator', desc: 'Enter your mileage and fuel price for a real-time litres + cost gauge.' },
  { icon: '💰', title: 'Full Cost Breakdown', desc: 'Fuel, toll, food, parking, fare, porter — every rupee accounted for.' },
  { icon: '🏨', title: 'Places Discovery', desc: 'Hotels, restaurants, petrol pumps, and shops near your route and destination.' },
  { icon: '📍', title: 'Google Maps Integration', desc: 'One tap to launch turn-by-turn navigation and find nearby places.' },
];

const stats = [
  { value: '50+', label: 'Cities Covered' },
  { value: '6', label: 'Transport Modes' },
  { value: '100%', label: 'Free to Use' },
  { value: '< 2min', label: 'Plan a Trip' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(249,115,22,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(56,189,248,0.07) 0%, transparent 50%)'
        }}
      />

      <div className="relative z-10">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm font-medium text-accent mb-8 animate-[fadeUp_0.5s_ease_forwards]">
            <Zap size={14} />
            Smart Travel Planner for India
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-[fadeUp_0.5s_ease_0.1s_both]">
            Your Journey,<br />
            <span className="relative inline-block">
              <span className="text-accent">Perfectly</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                <path d="M0 5 Q100 0 200 5" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}
            Planned
          </h1>

          <p className="text-[var(--text-muted)] text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed animate-[fadeUp_0.5s_ease_0.2s_both]">
            Calculate travel costs, discover nearby hotels & restaurants, and get turn-by-turn navigation — all in one place.
          </p>

          <div className="flex items-center justify-center gap-4 animate-[fadeUp_0.5s_ease_0.3s_both]">
            <Link to="/planner">
              <Button size="lg" className="text-base px-8 shadow-[0_0_40px_rgba(249,115,22,0.4)]">
                <Navigation size={18} />
                Plan a Trip
                <ArrowRight size={16} />
              </Button>
            </Link>
            {!user && (
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Create Free Account
                </Button>
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mt-16 animate-[fadeUp_0.5s_ease_0.4s_both]">
            {stats.map((s) => (
              <div key={s.label} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                <div className="font-display text-2xl font-bold text-accent">{s.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">How it works</h2>
            <p className="text-[var(--text-muted)]">Plan your entire journey in 5 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { num: '1', title: 'Enter Route', desc: 'From, to & distance', icon: '📍' },
              { num: '2', title: 'Pick Transport', desc: 'Car, train, flight...', icon: '🚗' },
              { num: '3', title: 'Get Costs', desc: 'Full breakdown', icon: '💰' },
              { num: '4', title: 'Find Places', desc: 'Hotels & food nearby', icon: '🏨' },
              { num: '5', title: 'Navigate', desc: 'Launch Google Maps', icon: '🗺️' },
            ].map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                <div className="w-12 h-12 bg-accent/15 border border-accent/25 rounded-2xl flex items-center justify-center text-2xl mb-3">
                  {step.icon}
                </div>
                <div className="absolute top-3 right-3 w-5 h-5 bg-[var(--surface2)] rounded-full flex items-center justify-center text-xs font-bold text-[var(--text-muted)]">
                  {step.num}
                </div>
                <div className="font-semibold text-sm text-white">{step.title}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Everything you need</h2>
            <p className="text-[var(--text-muted)]">Built for Indian travelers, with Indian routes in mind</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-orange-500/25 hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-12 h-12 bg-[var(--surface2)] rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-orange-500/10 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-base text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="p-12 bg-gradient-to-br from-[var(--surface)] to-[var(--surface2)] border border-[var(--border)] rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.4) 0%, transparent 70%)' }} />
            <div className="relative">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="font-display text-3xl font-bold mb-3">Ready to hit the road?</h2>
              <p className="text-[var(--text-muted)] mb-8">Start planning your trip in under 2 minutes. Completely free.</p>
              <Link to="/planner">
                <Button size="lg" className="text-base px-10">
                  <Navigation size={18} />
                  Start Planning Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
