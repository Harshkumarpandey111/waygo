import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Navigation, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,0.07) 0%, transparent 60%)' }} />

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-[var(--shadow-card)]">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Navigation size={18} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold">Way<span className="text-accent">Go</span></span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-[var(--text-muted)] text-sm mb-8">Log in to access your saved trips</p>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              icon={<Mail size={15} />}
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              icon={<Lock size={15} />}
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Log In <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-light font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-4 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Just want to explore?{' '}
            <button
              onClick={() => setForm({ email: 'demo@waygo.in', password: 'demo123' })}
              className="text-accent hover:underline"
            >
              Fill demo credentials
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}