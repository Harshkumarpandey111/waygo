import { Navigation2, Map, Hotel, Utensils, Fuel, RotateCcw, ExternalLink } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import Button from '../ui/Button';
import { Badge } from '../ui/Card';
import { formatCurrency, transportIcons, transportNames, getGoogleMapsUrl, getNearbyMapsUrl } from '../../utils/calculations';

export default function Step5Summary() {
  const planner = usePlanner();
  const costs = planner.costBreakdown;

  const isReturn = !!planner.returnDate;
  const nights = isReturn
    ? Math.max(0, Math.ceil((new Date(planner.returnDate) - new Date(planner.travelDate)) / (1000 * 3600 * 24)))
    : 0;

  const openMaps = (url) => window.open(url, '_blank');

  const quickActions = [
    {
      label: 'Get Directions',
      icon: <Navigation2 size={16} />,
      url: getGoogleMapsUrl(planner.origin, planner.destination),
      variant: 'primary',
    },
    {
      label: 'Hotels Nearby',
      icon: <Hotel size={16} />,
      url: getNearbyMapsUrl('hotels', planner.destination),
      variant: 'outline',
    },
    {
      label: 'Restaurants',
      icon: <Utensils size={16} />,
      url: getNearbyMapsUrl('restaurants', planner.destination),
      variant: 'outline',
    },
    {
      label: 'Petrol Pumps',
      icon: <Fuel size={16} />,
      url: getNearbyMapsUrl('petrol pump', planner.destination),
      variant: 'outline',
    },
  ];

  return (
    <div className="animate-[fadeUp_0.4s_ease_forwards]">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Navigation2 size={20} className="text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold">Your Journey Plan</h2>
        </div>
        <p className="text-[var(--text-muted)] text-sm ml-[52px]">Review your complete trip summary and launch navigation.</p>
      </div>

      {/* Route hero card */}
      <div className="relative overflow-hidden p-6 bg-gradient-to-br from-[var(--surface)] to-[var(--surface2)] border border-[var(--border)] rounded-3xl mb-5">
        {/* Decorative glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)' }} />

        {/* Route display */}
        <div className="flex items-center gap-4 mb-6 relative">
          <div className="flex-1 text-center">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">From</div>
            <div className="font-display text-3xl font-bold text-white">{planner.origin}</div>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
              <div className="text-xl">{transportIcons[planner.transport]}</div>
              <div className="w-16 h-px bg-gradient-to-r from-accent via-transparent to-transparent" />
            </div>
            <Badge variant="accent">{transportNames[planner.transport]}</Badge>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">To</div>
            <div className="font-display text-3xl font-bold text-white">{planner.destination}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Distance', value: `${planner.distance} km`, icon: '📏' },
            { label: 'Travelers', value: planner.travelers, icon: '👥' },
            { label: 'Est. Cost', value: formatCurrency(costs?.total || 0), icon: '💰' },
            { label: 'Duration', value: nights > 0 ? `${nights} nights` : 'Day Trip', icon: '📅' },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 bg-black/20 rounded-xl border border-[var(--border)]">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="font-display text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost summary strip */}
      {costs && (
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            costs.fuel && { label: 'Fuel', val: costs.fuel, color: 'accent' },
            costs.toll && { label: 'Toll', val: costs.toll, color: 'warning' },
            costs.fare && { label: 'Fare', val: costs.fare, color: 'info' },
            costs.food && { label: 'Food', val: costs.food, color: 'success' },
            costs.miscellaneous && { label: 'Misc', val: costs.miscellaneous, color: 'purple' },
          ].filter(Boolean).map((item) => (
            <Badge key={item.label} variant={item.color}>
              {item.label}: {formatCurrency(item.val)}
            </Badge>
          ))}
          {planner.travelDate && (
            <Badge variant="default">
              📅 {new Date(planner.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Badge>
          )}
          <Badge variant="accent">
            {formatCurrency(Math.round((costs?.total || 0) / (parseInt(planner.travelers) || 1)))} per person
          </Badge>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {quickActions.map((a) => (
          <Button
            key={a.label}
            variant={a.variant}
            onClick={() => openMaps(a.url)}
            className="justify-center"
          >
            {a.icon}
            {a.label}
            <ExternalLink size={12} className="ml-auto opacity-50" />
          </Button>
        ))}
      </div>

      {/* Launch navigation CTA */}
      <div className="text-center p-8 bg-[var(--surface2)] border border-dashed border-[var(--border)] rounded-2xl">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-[var(--text-muted)] text-sm mb-5">
          Ready to hit the road? Launch Google Maps for turn-by-turn navigation from <strong className="text-white">{planner.origin}</strong> to <strong className="text-white">{planner.destination}</strong>.
        </p>
        <Button
          variant="success"
          size="lg"
          onClick={() => openMaps(getGoogleMapsUrl(planner.origin, planner.destination))}
          className="text-base px-10 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-pulse-glow"
        >
          🚀 Launch Navigation
        </Button>
      </div>

      {planner.saved && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
          <span className="text-green-400 text-sm font-medium">✅ Trip saved to your dashboard!</span>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={planner.prevStep}>← Back</Button>
        <Button variant="ghost" onClick={planner.reset}>
          <RotateCcw size={15} /> Plan New Trip
        </Button>
      </div>
    </div>
  );
}
