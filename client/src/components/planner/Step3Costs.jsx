import { useEffect, useState } from 'react';
import { DollarSign, Save, ChevronRight, Check } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { TipBox } from '../ui/Card';
import { calculateCosts, formatCurrency } from '../../utils/calculations';
import api from '../../api/axios';

const costItems = [
  { key: 'fuel', icon: '⛽', label: 'Fuel Cost', color: 'text-orange-400' },
  { key: 'toll', icon: '🛣️', label: 'Toll Charges', color: 'text-yellow-400' },
  { key: 'fare', icon: '🎫', label: 'Transport Fare', color: 'text-sky-400' },
  { key: 'food', icon: '🍔', label: 'Food & Refreshments', color: 'text-green-400' },
  { key: 'parking', icon: '🅿️', label: 'Parking', color: 'text-purple-400' },
  { key: 'miscellaneous', icon: '🎒', label: 'Miscellaneous', color: 'text-pink-400' },
];

export default function Step3Costs() {
  const planner = usePlanner();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const costs = calculateCosts({
    transport: planner.transport,
    distance: planner.distance,
    travelers: planner.travelers,
    mileage: planner.vehicleDetails.mileage,
    fuelPrice: planner.vehicleDetails.fuelPrice,
    tollCharges: planner.vehicleDetails.tollCharges,
    farePerPerson: planner.publicTransport.farePerPerson,
    additionalCost: planner.additionalCost,
  });

  useEffect(() => {
    planner.setCosts(costs);
  }, []);

  const saveTrip = async () => {
    if (!user) {
      planner.nextStep();
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/trips', {
        origin: planner.origin,
        destination: planner.destination,
        distance: parseFloat(planner.distance),
        travelDate: planner.travelDate,
        returnDate: planner.returnDate || null,
        travelers: parseInt(planner.travelers),
        transport: planner.transport,
        vehicleDetails: planner.vehicleDetails,
        publicTransport: planner.publicTransport,
        additionalCost: parseFloat(planner.additionalCost) || 0,
        notes: '',
      });
      planner.setTripId(data.trip._id);
      setSaved(true);
      setTimeout(() => planner.nextStep(), 800);
    } catch (err) {
      console.error(err);
      planner.nextStep();
    } finally {
      setSaving(false);
    }
  };

  const perPerson = Math.round(costs.total / (parseInt(planner.travelers) || 1));

  return (
    <div className="animate-[fadeUp_0.4s_ease_forwards]">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <DollarSign size={20} className="text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold">Cost Breakdown</h2>
        </div>
        <p className="text-[var(--text-muted)] text-sm ml-[52px]">
          {planner.origin} → {planner.destination} · {planner.distance} km · {planner.travelers} traveler{planner.travelers > 1 ? 's' : ''}
        </p>
      </div>

      {/* Cost grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {costItems.map(({ key, icon, label, color }) => {
          const val = costs[key];
          if (!val) return null;
          return (
            <div key={key} className="p-5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl hover:border-white/10 transition-colors">
              <div className="text-2xl mb-3">{icon}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</div>
              <div className={`font-display text-3xl font-bold ${color}`}>{formatCurrency(val)}</div>
            </div>
          );
        })}

        {/* Total */}
        <div className="sm:col-span-2 p-6 rounded-2xl border"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))', borderColor: 'rgba(249,115,22,0.3)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-bold text-white mb-1">💳 Total Estimated Cost</div>
              <div className="text-sm text-[var(--text-muted)]">
                {planner.travelers} traveler{planner.travelers > 1 ? 's' : ''} · {planner.distance}km ·{' '}
                <span className="text-accent font-medium">{formatCurrency(perPerson)}/person</span>
              </div>
            </div>
            <div className="font-display text-5xl font-bold text-accent">{formatCurrency(costs.total)}</div>
          </div>

          {/* Visual bar breakdown */}
          <div className="mt-5 h-2.5 bg-[var(--surface)] rounded-full overflow-hidden flex gap-0.5">
            {costItems.map(({ key }) => {
              const pct = costs.total ? (costs[key] / costs.total) * 100 : 0;
              if (!pct) return null;
              const colors = { fuel: '#f97316', toll: '#eab308', fare: '#38bdf8', food: '#22c55e', parking: '#a78bfa', miscellaneous: '#ec4899' };
              return <div key={key} style={{ width: `${pct}%`, background: colors[key] }} className="h-full rounded-sm transition-all duration-500" />;
            })}
          </div>
        </div>
      </div>

      <TipBox icon="💡" className="mt-6">
        These are estimates based on average rates. Actual costs may vary by route, traffic, and seasonal pricing.{' '}
        {planner.returnDate && (
          <span>Round trip estimate: <strong className="text-orange-300">{formatCurrency(costs.total * 2)}</strong></span>
        )}
      </TipBox>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={planner.prevStep}>← Back</Button>
        <Button
          onClick={saveTrip}
          loading={saving}
          variant={saved ? 'success' : 'primary'}
          size="lg"
        >
          {saved ? <><Check size={17} /> Saved!</> : user ? <><Save size={17} /> Save & Find Places</> : <>Find Places <ChevronRight size={16} /></>}
        </Button>
      </div>
    </div>
  );
}
