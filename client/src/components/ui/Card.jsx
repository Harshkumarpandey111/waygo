// Badge component
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white/5 text-[var(--text-muted)] border-white/10',
    accent: 'bg-[var(--accent-dim)] text-[var(--accent-light)] border-orange-500/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Card component
export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        card-base
        ${hover ? 'hover:border-orange-500/30 cursor-pointer hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Stat card
export function StatCard({ icon, label, value, sub, color = 'accent' }) {
  const colors = {
    accent: 'text-[var(--accent)]',
    success: 'text-[var(--success)]',
    info: 'text-[var(--info)]',
    purple: 'text-[var(--purple)]',
  };
  return (
    <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-2xl p-5 hover:border-white/10 transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-display text-2xl font-bold ${colors[color]}`}>{value}</div>
      {sub && <div className="text-xs text-[var(--text-muted)] mt-1">{sub}</div>}
    </div>
  );
}

// Info tip box
export function TipBox({ icon = '💡', children, variant = 'purple' }) {
  const variants = {
    purple: 'bg-purple-500/5 border-purple-500/15 text-purple-300',
    accent: 'bg-orange-500/5 border-orange-500/15 text-orange-300',
    info: 'bg-sky-500/5 border-sky-500/15 text-sky-300',
    success: 'bg-green-500/5 border-green-500/15 text-green-300',
  };
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${variants[variant]}`}>
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}
