import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-3 text-center">

          <p className="text-lg text-[var(--text-muted)] flex items-center justify-center gap-2">
            Built with <Heart size={18} className="text-red-400" /> for Indian travelers
          </p>

          <p className="text-lg text-[var(--text-muted)]">
            © {new Date().getFullYear()} WayGo
          </p>

        </div>
      </div>
    </footer>
  );
}