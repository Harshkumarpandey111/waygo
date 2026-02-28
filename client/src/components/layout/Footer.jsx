import { Link } from 'react-router-dom';
import { Navigation, Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Navigation size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold">Way<span className="text-accent">Go</span></span>
          </div>
          <p className="text-[var(--text-muted)] text-sm flex items-center gap-1.5">
            Built with <Heart size={13} className="text-red-400" /> for Indian travelers
          </p>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <Link to="/planner" className="hover:text-white transition-colors">Plan a Trip</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span>© {new Date().getFullYear()} WayGo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
