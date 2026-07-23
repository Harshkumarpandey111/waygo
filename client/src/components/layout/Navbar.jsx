import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Map, LayoutDashboard, LogOut, LogIn, User, Navigation, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate('/');
  };

  const handleNav = (to) => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate(to);
  };

  const navLink = (to, label, Icon, mobile = false) => (
    <button
      onClick={() => handleNav(to)}
      className={`flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-200
        ${mobile ? 'w-full px-4 py-3' : 'px-4 py-2'}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Navigation size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold">
            Way<span className="text-accent">Go</span>
          </span>
        </Link>

        {/* Desktop Nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-3">
          {navLink('/', 'Home', Map)}
          {user && navLink('/planner', 'Plan Trip', Navigation)}
          {user && navLink('/dashboard', 'Dashboard', LayoutDashboard)}
        </nav>

        {/* Desktop Auth — hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
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
                onClick={() => handleNav('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-white"
              >
                <LogIn size={15} /> Login
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium"
              >
                <User size={15} /> Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger — visible on mobile only */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu — slide down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-5 pt-2 border-t border-[var(--border)] space-y-1">
          {/* Nav Links */}
          {navLink('/', 'Home', Map, true)}
          {user && navLink('/planner', 'Plan Trip', Navigation, true)}
          {user && navLink('/dashboard', 'Dashboard', LayoutDashboard, true)}

          {/* Divider */}
          <div className="h-px bg-[var(--border)] my-3" />

          {/* Auth Section */}
          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <User size={14} className="text-accent" />
                </div>
                <span className="text-white text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => handleNav('/login')}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 rounded-xl border border-[var(--border)] transition-colors"
              >
                <LogIn size={15} /> Login
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-light transition-colors"
              >
                <User size={15} /> Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}