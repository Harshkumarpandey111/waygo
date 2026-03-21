import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Navigation, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after register — default to planner
  const from = location.state?.from || '/planner';

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(56,189,248,0.06) 0%, transparent 60%)' }} />

      <div className="w-full max-w-md relative">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-[var(--shadow-card)]">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Navigation size={18} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold">Way<span className="text-accent">Go</span></span>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-[var(--text-muted)] text-sm mb-8">Save trips, track spending, plan better</p>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Full Name" id="name" type="text" placeholder="Your full name"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name} icon={<User size={15} />} />
            <Input label="Email" id="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email} icon={<Mail size={15} />} />
            <Input label="Password" id="password" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password} icon={<Lock size={15} />} />
            <Input label="Confirm Password" id="confirm" type="password" placeholder="Re-enter password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              error={errors.confirm} icon={<Lock size={15} />} />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Create Account <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-light font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}