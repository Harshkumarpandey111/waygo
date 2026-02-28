import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Map, LayoutDashboard, LogOut, LogIn, User, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
        ${pathname === to
          ? 'bg-orange-500/15 text-[var(--accent)] border border-orange-500/20'
          : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={15} />
      {label}
    </Link>
  );

  return (
    <header className="glass border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={user ? '/' : '/login'} className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-shadow">
            <Navigation size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Way<span className="text-accent">Go</span>
          </span>
          <span className="hidden sm:flex items-center px-2 py-0.5 bg-accent/15 border border-accent/25 rounded-full text-[10px] font-semibold text-accent">
            BETA
          </span>
        </Link>

        {/* Nav links — only show when logged in */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navLink('/', 'Home', Map)}
            {navLink('/planner', 'Plan Trip', Navigation)}
            {navLink('/dashboard', 'Dashboard', LayoutDashboard)}
          </nav>
        )}

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            // Logged in — show user name + logout
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--surface2)] rounded-xl border border-[var(--border)]">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-accent">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white">{user.name?.split(' ')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            // Not logged in — show only Login + Sign Up
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <LogIn size={15} />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-light hover:-translate-y-0.5 transition-all shadow-[0_4px_15px_rgba(249,115,22,0.3)]"
              >
                <User size={15} />
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}