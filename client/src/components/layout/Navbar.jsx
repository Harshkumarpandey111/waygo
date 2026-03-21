import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Map, LayoutDashboard, LogOut, LogIn, User, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate('/');
  };

  const navLink = (to, label, Icon) => (
    <button
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        navigate(to);
      }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
        ${
          pathname === to
            ? 'bg-orange-500/15 text-[var(--accent)] border border-orange-500/20'
            : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );

  return (
    <header className="glass border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Navigation size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold">
            Way<span className="text-accent">Go</span>
          </span>
        </Link>

        {/* NAVBAR */}
        <nav className="flex items-center gap-3">
          {navLink('/', 'Home', Map)}
          {user && navLink('/planner', 'Plan Trip', Navigation)}
          {user && navLink('/dashboard', 'Dashboard', LayoutDashboard)}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-white text-sm">{user.name}</span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-400"
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "auto" });
                  navigate('/login');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-white"
              >
                <LogIn size={15} /> Login
              </button>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "auto" });
                  navigate('/register');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl"
              >
                <User size={15} /> Sign Up
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}