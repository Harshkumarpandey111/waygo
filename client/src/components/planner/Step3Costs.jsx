import { useEffect, useState } from 'react';
import { DollarSign, Save, ChevronRight, Check, Info } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { TipBox } from '../ui/Card';
import { calculateCosts, formatCurrency, transportIcons, transportNames } from '../../utils/calculations';
import api from '../../api/axios';

const COST_ITEMS = [
  { key: 'fuel',          icon: '⛽', label: 'Fuel Cost',           color: 'text-orange-400', barColor: '#f97316', note: 'Vehicle cost — same regardless of passengers' },
  { key: 'toll',          icon: '🛣️', label: 'Toll Charges',        color: 'text-yellow-400', barColor: '#eab308', note: 'One-time highway toll for the vehicle' },
  { key: 'fare',          icon: '🎫', label: 'Transport Fare',      color: 'text-sky-400',    barColor: '#38bdf8', note: 'Per person × travelers' },
  { key: 'food',          icon: '🍽️', label: 'Food & Beverages',   color: 'text-green-400',  barColor: '#22c55e', note: 'Per person × travelers' },
  { key: 'parking',       icon: '🅿️', label: 'Parking',            color: 'text-purple-400', barColor: '#a78bfa', note: 'Estimated parking stops' },
  { key: 'miscellaneous', icon: '🎒', label: 'Miscellaneous',       color: 'text-pink-400',   barColor: '#ec4899', note: 'Buffer / porter / other costs' },
];

export default function Step3Costs() {
  const planner = usePlanner();
  const { user } = useAuth();
  const [saving, setSaving]  = useState(false);
  const [saved, setSaved]    = useState(false);

  const costs = calculateCosts({
    transport:       planner.transport,
    distance:        planner.distance,
    travelers:       planner.travelers,
    mileage:         planner.vehicleDetails.mileage,
    fuelPrice:       planner.vehicleDetails.fuelPrice,
    tollCharges:     planner.vehicleDetails.tollCharges,
    farePerPerson:   planner.publicTransport.farePerPerson,
    additionalCost:  planner.additionalCost,
    foodPreferences: planner.foodPreferences,
    foodBudget:      planner.foodBudget,
  });

  useEffect(() => { planner.setCosts(costs); }, []);

  const isPersonal    = planner.transport === 'car' || planner.transport === 'bike';
  const travelersNum  = parseInt(planner.travelers) || 1;
  const perPerson     = Math.round(costs.total / travelersNum);

  const saveTrip = async () => {
    if (!user) { planner.nextStep(); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/trips', {
        origin:          planner.origin,
        destination:     planner.destination,
        distance:        parseFloat(planner.distance),
        travelDate:      planner.travelDate,
        returnDate:      planner.returnDate || null,
        travelers:       parseInt(planner.travelers),
        transport:       planner.transport,
        vehicleDetails:  planner.vehicleDetails,
        publicTransport: planner.publicTransport,
        additionalCost:  parseFloat(planner.additionalCost) || 0,
        notes:           '',
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

  return (
    <div className="animate-[fadeUp_0.4s_ease_forwards]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <DollarSign size={20} className="text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold">Cost Breakdown</h2>
        </div>
        <p className="text-[var(--text-muted)] text-sm ml-[52px]">
          {transportIcons[planner.transport]} {transportNames[planner.transport]} ·{' '}
          {planner.origin} → {planner.destination} · {planner.distance} km · {travelersNum} traveler{travelersNum > 1 ? 's' : ''}
        </p>
      </div>

      {/* Cost cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COST_ITEMS.map(({ key, icon, label, color, note }) => {
          const val = costs[key];
          if (!val) return null;
          return (
            <div key={key} className="p-5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl hover:border-white/10 transition-colors">
              <div className="text-2xl mb-3">{icon}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</div>
              <div className={`font-display text-3xl font-bold ${color}`}>{formatCurrency(val)}</div>
              {/* Clarify what's per-person vs fixed */}
              {note && (
                <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-muted)]">
                  <Info size={10} /> {note}
                </div>
              )}
            </div>
          );
        })}

        {/* Total card */}
        <div className="sm:col-span-2 p-6 rounded-2xl border"
          style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.12),rgba(249,115,22,0.04))', borderColor: 'rgba(249,115,22,0.3)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="font-display text-lg font-bold text-white mb-1">💳 Total Estimated Cost</div>
              <div className="text-sm text-[var(--text-muted)]">
                {travelersNum} traveler{travelersNum > 1 ? 's' : ''} · {planner.distance} km ·{' '}
                <span className="text-accent font-medium">{formatCurrency(perPerson)} / person</span>
              </div>
              {/* Cost split explanation */}
              {isPersonal && travelersNum > 1 && (
                <div className="mt-3 p-3 bg-orange-500/8 border border-orange-500/20 rounded-xl text-xs text-orange-300 flex items-start gap-2">
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Note:</strong> Fuel ({formatCurrency(costs.fuel)}) + Toll ({formatCurrency(costs.toll)}) are fixed vehicle costs.
                    Food ({formatCurrency(costs.food)}) is split × {travelersNum} people.
                    Per person cost = {formatCurrency(perPerson)}.
                  </span>
                </div>
              )}
            </div>
            <div className="font-display text-5xl font-bold text-accent">{formatCurrency(costs.total)}</div>
          </div>

          {/* Visual bar */}
          <div className="mt-5 h-2.5 bg-[var(--surface)] rounded-full overflow-hidden flex gap-0.5">
            {COST_ITEMS.map(({ key, barColor }) => {
              const pct = costs.total ? (costs[key] / costs.total) * 100 : 0;
              if (!pct) return null;
              return <div key={key} style={{ width: `${pct}%`, background: barColor }} className="h-full rounded-sm transition-all duration-500" />;
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {COST_ITEMS.filter(({ key }) => costs[key] > 0).map(({ key, icon, label, barColor }) => (
              <div key={key} className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <span style={{ background: barColor }} className="w-2 h-2 rounded-full inline-block flex-shrink-0" />
                {label}: {formatCurrency(costs[key])}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Food summary if selected */}
      {planner.foodPreferences?.length > 0 && (
        <div className="mt-4 p-4 bg-green-500/5 border border-green-500/15 rounded-xl">
          <div className="text-sm font-semibold text-white mb-2">🍽️ Food breakdown</div>
          <div className="flex flex-wrap gap-2">
            {planner.foodPreferences.map(mealId => {
              const icons = { breakfast:'🌅', lunch:'☀️', dinner:'🌙', snacks:'🍿', tea:'☕' };
              const amount = parseFloat(planner.foodBudget?.[mealId]) || 0;
              return (
                <div key={mealId} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface2)] rounded-full text-xs">
                  {icons[mealId]} {mealId.charAt(0).toUpperCase()+mealId.slice(1)}:
                  <span className="text-green-400 font-semibold">{formatCurrency(amount)}/person</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-2">
            × {travelersNum} traveler{travelersNum > 1 ? 's' : ''} = <strong className="text-green-400">{formatCurrency(costs.food)} total food</strong>
          </div>
        </div>
      )}

      {planner.returnDate && (
        <TipBox icon="🔁" className="mt-4" variant="accent">
          Return trip estimate: <strong className="text-orange-300">{formatCurrency(costs.total * 2)}</strong>
        </TipBox>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={planner.prevStep}>← Back</Button>
        <Button onClick={saveTrip} loading={saving} variant={saved ? 'success' : 'primary'} size="lg">
          {saved
            ? <><Check size={17} /> Saved!</>
            : user
            ? <><Save size={17} /> Save & Find Places</>
            : <>Find Places <ChevronRight size={16} /></>}
        </Button>
      </div>
    </div>
  );
}