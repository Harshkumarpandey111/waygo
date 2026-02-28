import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-accent hover:bg-accent-light text-white shadow-[0_4px_20px_rgba(249,115,22,0.35)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.45)] hover:-translate-y-0.5',
  outline: 'bg-transparent border border-white/10 hover:border-accent/50 hover:text-accent text-white',
  ghost: 'bg-transparent hover:bg-white/5 text-[var(--text-muted)] hover:text-white',
  success: 'bg-success text-white shadow-[0_4px_20px_rgba(34,197,94,0.35)]',
  info: 'bg-info text-bg font-bold shadow-[0_4px_20px_rgba(56,189,248,0.35)]',
  danger: 'bg-red-500 hover:bg-red-400 text-white',
};

const sizes = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-[15px] gap-2',
  lg: 'px-8 py-4 text-base gap-2.5',
};

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, className = '',
  onClick, type = 'button', fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-xl font-medium
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
