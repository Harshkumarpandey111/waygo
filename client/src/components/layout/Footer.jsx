import { Heart, Navigation, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[var(--border)] mt-24"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col items-center justify-center gap-8 text-center">

          {/* ── WayGo Logo / App Name ── */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Navigation size={18} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold">
              Way<span className="text-accent">Go</span>
            </span>
          </div>

          {/* ── Developer Info ── */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold text-[var(--text)]">
              Harsh Kumar Pandey
            </p>
            <a
              href="mailto:harshkumarpandey2005@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-accent transition-colors duration-200"
              aria-label="Send email to Harsh Kumar Pandey"
            >
              <Mail size={14} />
              harshkumarpandey2005@gmail.com
            </a>
          </div>

          {/* ── Built for Digital Heroes Button ── */}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5
              bg-accent/10 text-accent border border-accent/25
              rounded-2xl text-sm font-semibold
              hover:bg-accent hover:text-white hover:border-accent
              hover:shadow-[0_8px_32px_rgba(249,115,22,0.35)]
              focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
              transition-all duration-300 ease-out"
            aria-label="Built for Digital Heroes — opens digitalheroesco.com in a new tab"
          >
            Built for Digital Heroes
            <ExternalLink
              size={15}
              className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300"
            />
          </a>

          {/* ── Divider ── */}
          <div className="w-24 h-px bg-[var(--border)]" />

          {/* ── Copyright + Tagline ── */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-[var(--text-muted)] flex items-center justify-center gap-2">
              Built with <Heart size={14} className="text-red-400" /> for Indian travelers
            </p>
            <p className="text-sm text-[var(--text-subtle)]">
              © {currentYear} WayGo. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}