export default function Input({
  label, id, error, className = '', icon, ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10 flex items-center justify-center w-4 h-4">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`
            w-full
            bg-[var(--surface2)]
            border border-[var(--border)]
            rounded-xl
            py-3.5
            text-[var(--text)]
            text-sm
            font-normal
            placeholder:text-[var(--text-muted)]
            outline-none
            transition-all duration-200
            focus:border-[var(--accent)]
            focus:bg-[rgba(249,115,22,0.05)]
            focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]
            ${icon ? 'pl-11 pr-4' : 'px-4'}
            ${error
              ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
              : ''
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-0.5">{error}</p>
      )}
    </div>
  );
}

export function Select({ label, id, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full
          bg-[var(--surface2)]
          border border-[var(--border)]
          rounded-xl
          px-4 py-3.5
          text-[var(--text)]
          text-sm
          outline-none
          cursor-pointer
          transition-all duration-200
          focus:border-[var(--accent)]
          focus:bg-[rgba(249,115,22,0.05)]
          appearance-none
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237c7c9a' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 16px center',
        }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-red-400 text-xs mt-0.5">{error}</p>
      )}
    </div>
  );
}