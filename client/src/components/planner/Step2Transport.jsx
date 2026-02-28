import { useState, useEffect } from 'react';
import { Car, Fuel, ChevronRight, Info } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import { TipBox } from '../ui/Card';

// ─────────────────────────────────────────────────────────────────
//  REAL INDIAN FARE DATA (based on official rates + market pricing)
// ─────────────────────────────────────────────────────────────────

const TRANSPORT_LIST = [
  { id: 'car',    icon: '🚗', name: 'Car',       desc: 'Personal vehicle',    personal: true  },
  { id: 'bike',   icon: '🏍️', name: 'Bike',      desc: 'Motorcycle / Scooter',personal: true  },
  { id: 'bus',    icon: '🚌', name: 'Bus',        desc: 'State or private bus', personal: false },
  { id: 'train',  icon: '🚆', name: 'Train',      desc: 'Indian Railways',      personal: false },
  { id: 'flight', icon: '✈️', name: 'Flight',     desc: 'Domestic air travel',  personal: false },
  { id: 'cab',    icon: '🚕', name: 'Cab / Taxi', desc: 'Ola / Uber / Local',   personal: false },
];

// ── BUS fare data ──
// Source: Average PRTC / KSRTC / MSRTC / HRTC rates
const BUS_CLASSES = [
  {
    id: 'ordinary',
    name: 'Ordinary Bus',
    desc: 'State roadways, no AC',
    ratePerKm: 0.50,
    minFare: 15,
    icon: '🚌',
    color: 'text-green-400',
    tip: 'Cheapest option. Available on most routes.',
  },
  {
    id: 'express',
    name: 'Express / Fast Passenger',
    desc: 'Fewer stops, slightly faster',
    ratePerKm: 0.65,
    minFare: 20,
    icon: '🚌',
    color: 'text-yellow-400',
    tip: 'Good balance of speed and cost.',
  },
  {
    id: 'ac_seater',
    name: 'AC Seater Bus',
    desc: 'Air-conditioned, comfortable seats',
    ratePerKm: 1.10,
    minFare: 80,
    icon: '🚌',
    color: 'text-sky-400',
    tip: 'Popular for medium distances (100–400 km).',
  },
  {
    id: 'ac_sleeper',
    name: 'AC Sleeper (Private)',
    desc: 'Overnight sleeper berths',
    ratePerKm: 1.50,
    minFare: 250,
    icon: '🛏️',
    color: 'text-purple-400',
    tip: 'Best for long overnight journeys (400+ km).',
  },
  {
    id: 'volvo',
    name: 'Volvo / Luxury Bus',
    desc: 'Multi-axle, push-back seats, premium',
    ratePerKm: 1.80,
    minFare: 300,
    icon: '🚍',
    color: 'text-accent',
    tip: 'Providers: RedBus, ZingBus, KSRTC Airavat, etc.',
  },
];

// ── TRAIN fare data ──
// Source: Indian Railways official per-km rates (2024)
// Base fare + reservation charge + superfast surcharge approx included
const TRAIN_CLASSES = [
  {
    id: 'general',
    name: 'General / Unreserved (GEN)',
    desc: 'No reservation, sit anywhere',
    ratePerKm: 0.36,
    minFare: 10,
    reservationCharge: 0,
    icon: '🚆',
    color: 'text-gray-400',
    tip: 'No booking needed. Not recommended for long routes.',
  },
  {
    id: 'sleeper',
    name: 'Sleeper Class (SL)',
    desc: 'Non-AC berth, 3-tier',
    ratePerKm: 0.48,
    minFare: 55,
    reservationCharge: 20,
    icon: '🛌',
    color: 'text-green-400',
    tip: 'Most popular class for budget travel. Book 30–60 days ahead.',
  },
  {
    id: '3ac',
    name: 'AC 3-Tier (3A)',
    desc: 'Air-conditioned 3-berth',
    ratePerKm: 1.25,
    minFare: 250,
    reservationCharge: 40,
    icon: '❄️',
    color: 'text-sky-400',
    tip: 'Best value AC option. Bedroll included.',
  },
  {
    id: '2ac',
    name: 'AC 2-Tier (2A)',
    desc: 'Air-conditioned 2-berth, more privacy',
    ratePerKm: 2.05,
    minFare: 400,
    reservationCharge: 50,
    icon: '🌟',
    color: 'text-yellow-400',
    tip: 'More comfortable and private than 3A.',
  },
  {
    id: '1ac',
    name: 'AC First Class (1A)',
    desc: 'Private cabin, premium',
    ratePerKm: 3.40,
    minFare: 700,
    reservationCharge: 60,
    icon: '👑',
    color: 'text-amber-400',
    tip: 'Highest class. Private 2/4 berth cabins.',
  },
  {
    id: 'cc',
    name: 'AC Chair Car (CC)',
    desc: 'Day train, reclining seats',
    ratePerKm: 1.00,
    minFare: 150,
    reservationCharge: 40,
    icon: '💺',
    color: 'text-purple-400',
    tip: 'Ideal for day journeys. Used in Shatabdi / Vande Bharat.',
  },
  {
    id: 'ec',
    name: 'Executive Chair Car (EC)',
    desc: 'Premium day train seating',
    ratePerKm: 2.20,
    minFare: 400,
    reservationCharge: 60,
    icon: '💎',
    color: 'text-pink-400',
    tip: 'Available on Shatabdi and premium trains.',
  },
];

// ── FLIGHT fare data ──
// Source: Indian market pricing curves (IndiGo, SpiceJet, Air India averages)
// Flights have base cost + per-km. Short routes are disproportionately expensive.
const FLIGHT_CLASSES = [
  {
    id: 'economy_basic',
    name: 'Economy — Basic',
    desc: 'No seat selection, no free baggage',
    baseFare: 1800,
    ratePerKm: 3.8,
    icon: '✈️',
    color: 'text-sky-400',
    tip: 'Cheapest fare. Book 45+ days ahead for best prices.',
    providers: 'IndiGo, SpiceJet, Air Asia',
  },
  {
    id: 'economy_flexi',
    name: 'Economy — Flexible',
    desc: '15kg baggage + seat selection',
    baseFare: 2500,
    ratePerKm: 5.2,
    icon: '✈️',
    color: 'text-blue-400',
    tip: 'Good for planned trips. Includes check-in baggage.',
    providers: 'All airlines',
  },
  {
    id: 'economy_airindia',
    name: 'Economy — Full Service',
    desc: 'Free meal + 25kg baggage',
    baseFare: 3200,
    ratePerKm: 6.5,
    icon: '🛫',
    color: 'text-indigo-400',
    tip: 'Air India, Vistara. Best comfort in economy.',
    providers: 'Air India, IndiGo',
  },
  {
    id: 'business',
    name: 'Business Class',
    desc: 'Lounge + priority + wide seats',
    baseFare: 9000,
    ratePerKm: 14.0,
    icon: '🥂',
    color: 'text-amber-400',
    tip: 'Available on Air India, IndiGo Business, Vistara.',
    providers: 'Air India, IndiGo Business',
  },
];

// ── CAB fare data ──
// Source: Ola / Uber / local taxi market rates (India, 2024)
const CAB_CLASSES = [
  {
    id: 'auto',
    name: 'Auto Rickshaw',
    desc: 'Short city distances only',
    baseCharge: 25,
    ratePerKm: 13,
    icon: '🛺',
    color: 'text-yellow-400',
    tip: 'Only practical for <15 km city rides.',
    maxKm: 20,
  },
  {
    id: 'mini',
    name: 'Mini / Hatchback',
    desc: 'Ola Mini, Uber Go, Rapido Cab',
    baseCharge: 50,
    ratePerKm: 12,
    icon: '🚗',
    color: 'text-green-400',
    tip: 'Cheapest cab option. Good for city + short intercity.',
  },
  {
    id: 'sedan',
    name: 'Sedan / Prime',
    desc: 'Ola Prime, Uber Comfort',
    baseCharge: 75,
    ratePerKm: 16,
    icon: '🚕',
    color: 'text-sky-400',
    tip: 'More comfortable. AC, cleaner cars.',
  },
  {
    id: 'suv',
    name: 'SUV / XL',
    desc: 'Ola SUV, Uber XL (6-seater)',
    baseCharge: 100,
    ratePerKm: 22,
    icon: '🚙',
    color: 'text-purple-400',
    tip: 'Best for groups of 4–6. Split cost for savings.',
  },
  {
    id: 'outstation',
    name: 'Outstation Cab (One-way)',
    desc: 'Dedicated cab for long-distance',
    baseCharge: 300,
    ratePerKm: 13,
    icon: '🚖',
    color: 'text-accent',
    tip: 'Best value for intercity. Flat per-km rate, no surge.',
  },
];

// ─────────────────────────────────────────────────────────────────
//  FARE CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────────

function calcBusFare(classData, distance) {
  return Math.max(classData.minFare, Math.round(classData.ratePerKm * distance));
}

function calcTrainFare(classData, distance) {
  const base = Math.max(classData.minFare, Math.round(classData.ratePerKm * distance));
  // Add reservation charge + ~5% fuel surcharge
  const surcharge = Math.round(base * 0.05);
  return base + classData.reservationCharge + surcharge;
}

function calcFlightFare(classData, distance) {
  // Short routes (<500km) are disproportionately expensive
  const distanceFactor = distance < 300 ? 1.6 : distance < 600 ? 1.3 : distance < 1000 ? 1.1 : 1.0;
  return Math.round((classData.baseFare + classData.ratePerKm * distance) * distanceFactor);
}

function calcCabFare(classData, distance) {
  return classData.baseCharge + Math.round(classData.ratePerKm * distance);
}

function getFareForClass(transport, classId, distance) {
  const d = parseFloat(distance) || 0;
  if (!d) return 0;
  if (transport === 'bus') {
    const c = BUS_CLASSES.find((x) => x.id === classId);
    return c ? calcBusFare(c, d) : 0;
  }
  if (transport === 'train') {
    const c = TRAIN_CLASSES.find((x) => x.id === classId);
    return c ? calcTrainFare(c, d) : 0;
  }
  if (transport === 'flight') {
    const c = FLIGHT_CLASSES.find((x) => x.id === classId);
    return c ? calcFlightFare(c, d) : 0;
  }
  if (transport === 'cab') {
    const c = CAB_CLASSES.find((x) => x.id === classId);
    return c ? calcCabFare(c, d) : 0;
  }
  return 0;
}

function getClassList(transport) {
  if (transport === 'bus') return BUS_CLASSES;
  if (transport === 'train') return TRAIN_CLASSES;
  if (transport === 'flight') return FLIGHT_CLASSES;
  if (transport === 'cab') return CAB_CLASSES;
  return [];
}

function formatCurrency(n) {
  return `₹${Math.round(n || 0).toLocaleString('en-IN')}`;
}

// ─────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function Step2Transport() {
  const {
    transport, vehicleDetails, publicTransport, additionalCost,
    distance, travelers,
    updateField, updateVehicle, updatePublic,
    nextStep, prevStep,
  } = usePlanner();

  const [errors, setErrors] = useState({});
  const [fuelCalc, setFuelCalc] = useState(null);
  const [selectedClassData, setSelectedClassData] = useState(null);

  const isPersonal = transport === 'car' || transport === 'bike';
  const dist = parseFloat(distance) || 0;
  const travelersCount = parseInt(travelers) || 1;

  // ── Live fuel calculation for personal vehicles ──
  useEffect(() => {
    if (isPersonal && vehicleDetails.mileage && vehicleDetails.fuelPrice && dist) {
      const m = parseFloat(vehicleDetails.mileage);
      const fp = parseFloat(vehicleDetails.fuelPrice);
      if (m > 0 && fp > 0) {
        const liters = dist / m;
        setFuelCalc({
          liters: liters.toFixed(1),
          cost: Math.round(liters * fp),
        });
      }
    } else {
      setFuelCalc(null);
    }
  }, [vehicleDetails.mileage, vehicleDetails.fuelPrice, dist, isPersonal]);

  // ── Auto-update fare when class changes ──
  useEffect(() => {
    if (!transport || isPersonal || !publicTransport.fareClass) return;
    const classList = getClassList(transport);
    const found = classList.find((c) => c.id === publicTransport.fareClass);
    setSelectedClassData(found || null);
    if (found) {
      const fare = getFareForClass(transport, found.id, dist);
      updatePublic({ farePerPerson: String(fare) });
    }
  }, [publicTransport.fareClass, transport, dist]);

  // ── When transport changes, reset class ──
  useEffect(() => {
    if (!isPersonal) {
      updatePublic({ fareClass: '', farePerPerson: '' });
      setSelectedClassData(null);
    }
  }, [transport]);

  const validate = () => {
    const e = {};
    if (!transport) e.transport = 'Please select a transport type';
    if (isPersonal && !vehicleDetails.mileage) e.mileage = 'Enter your vehicle mileage';
    if (!isPersonal && transport && !publicTransport.fareClass) {
      e.fareClass = 'Please select a class / category';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) nextStep();
  };

  const farePerPerson = parseFloat(publicTransport.farePerPerson) || 0;
  const totalFare = farePerPerson * travelersCount;

  return (
    <div className="animate-[fadeUp_0.4s_ease_forwards]">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Car size={20} className="text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold">Choose Transport</h2>
        </div>
        <p className="text-[var(--text-muted)] text-sm ml-[52px]">
          Select how you're travelling — fares are <strong className="text-white">auto-calculated</strong> based on real Indian rates.
        </p>
      </div>

      {/* Transport grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-2">
        {TRANSPORT_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => updateField('transport', t.id)}
            className={`
              relative p-5 rounded-2xl border-2 text-left transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-lg
              ${transport === t.id
                ? 'border-accent bg-orange-500/8 shadow-[0_0_0_1px_var(--accent),0_8px_30px_rgba(249,115,22,0.15)]'
                : 'border-[var(--border)] bg-[var(--surface2)] hover:border-orange-500/30'
              }
            `}
          >
            {transport === t.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">✓</span>
              </div>
            )}
            <div className="text-3xl mb-3">{t.icon}</div>
            <div className="font-semibold text-sm text-white">{t.name}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>
      {errors.transport && <p className="text-red-400 text-xs mt-2">{errors.transport}</p>}

      {/* ── Personal Vehicle Section ── */}
      {isPersonal && (
        <div className="mt-6 p-6 bg-orange-500/5 border border-orange-500/15 rounded-2xl animate-[fadeUp_0.3s_ease_forwards]">
          <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
            <Fuel size={16} className="text-accent" /> Vehicle Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Mileage (km/L)"
              type="number"
              placeholder={transport === 'bike' ? '40' : '18'}
              min="1"
              value={vehicleDetails.mileage}
              onChange={(e) => updateVehicle({ mileage: e.target.value })}
              error={errors.mileage}
            />
            <Input
              label="Fuel Price (₹/L)"
              type="number"
              placeholder="96"
              min="1"
              value={vehicleDetails.fuelPrice}
              onChange={(e) => updateVehicle({ fuelPrice: e.target.value })}
            />
            <Input
              label="Toll Charges (₹)"
              type="number"
              placeholder="0"
              min="0"
              value={vehicleDetails.tollCharges}
              onChange={(e) => updateVehicle({ tollCharges: e.target.value })}
            />
          </div>
          <div className="mt-4">
            <Select
              label="Fuel Type"
              value={vehicleDetails.fuelType}
              onChange={(e) => updateVehicle({ fuelType: e.target.value })}
            >
              <option value="Petrol">Petrol (~₹96/L)</option>
              <option value="Diesel">Diesel (~₹89/L)</option>
              <option value="CNG">CNG (~₹79/L)</option>
              <option value="Electric">Electric (₹1.5–2/km)</option>
            </Select>
          </div>

          {/* Live fuel gauge */}
          {fuelCalc && (
            <div className="mt-5 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">⛽ Live Fuel Estimate</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--text-muted)]">{fuelCalc.liters} litres needed</span>
                  <span className="font-display text-lg font-bold text-accent">{formatCurrency(fuelCalc.cost)}</span>
                </div>
              </div>
              <div className="h-2 bg-[var(--surface2)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (fuelCalc.liters / 60) * 100)}%` }}
                />
              </div>
              {vehicleDetails.tollCharges > 0 && (
                <div className="mt-3 text-sm text-[var(--text-muted)]">
                  + {formatCurrency(vehicleDetails.tollCharges)} toll → Total vehicle cost:{' '}
                  <strong className="text-accent">
                    {formatCurrency(fuelCalc.cost + parseFloat(vehicleDetails.tollCharges))}
                  </strong>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Public Transport Section ── */}
      {!isPersonal && transport && (
        <div className="mt-6 p-6 bg-sky-500/5 border border-sky-500/15 rounded-2xl animate-[fadeUp_0.3s_ease_forwards]">
          <h3 className="font-display font-bold text-base mb-1 flex items-center gap-2">
            🎫 Select Class / Category
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">
            Fare is auto-calculated using real Indian {transport === 'train' ? 'Railways' : transport === 'bus' ? 'bus' : transport === 'flight' ? 'aviation' : 'cab'} rates for {dist} km.
          </p>

          {/* Class cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {getClassList(transport).map((cls) => {
              const fare = getFareForClass(transport, cls.id, dist);
              const isSelected = publicTransport.fareClass === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => updatePublic({ fareClass: cls.id })}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200
                    hover:-translate-y-0.5
                    ${isSelected
                      ? 'border-sky-500 bg-sky-500/8 shadow-[0_0_0_1px_rgba(56,189,248,0.5)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-sky-500/40'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cls.icon}</span>
                      <div>
                        <div className="font-semibold text-sm text-white">{cls.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{cls.desc}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      {dist > 0 && (
                        <div className={`font-display text-lg font-bold ${cls.color}`}>
                          {formatCurrency(fare)}
                          <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ person</span>
                        </div>
                      )}
                      {travelersCount > 1 && dist > 0 && (
                        <div className="text-xs text-[var(--text-muted)]">
                          {formatCurrency(fare * travelersCount)} total for {travelersCount} travelers
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && cls.tip && (
                    <div className="mt-3 pt-3 border-t border-sky-500/20 flex items-start gap-2">
                      <Info size={12} className="text-sky-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-sky-300">{cls.tip}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {errors.fareClass && <p className="text-red-400 text-xs mb-4">{errors.fareClass}</p>}

          {/* Provider + additional costs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Train / Bus / Flight name (optional)"
              type="text"
              placeholder={
                transport === 'train' ? 'e.g. Shatabdi Express'
                : transport === 'bus' ? 'e.g. PRTC Volvo'
                : transport === 'flight' ? 'e.g. IndiGo 6E-204'
                : 'e.g. Ola Outstation'
              }
              value={publicTransport.provider}
              onChange={(e) => updatePublic({ provider: e.target.value })}
            />
            <Input
              label="Additional Costs (₹)"
              type="number"
              placeholder="Porter, auto, food, etc."
              min="0"
              value={additionalCost}
              onChange={(e) => updateField('additionalCost', e.target.value)}
            />
          </div>

          {/* Override fare */}
          <div className="mt-4">
            <Input
              label="Override Fare Per Person (₹) — optional"
              type="number"
              placeholder={farePerPerson ? `Auto: ${formatCurrency(farePerPerson)}` : 'Leave blank to use auto-estimate'}
              min="0"
              value={publicTransport.farePerPerson}
              onChange={(e) => updatePublic({ farePerPerson: e.target.value })}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
              <Info size={11} />
              Fill this only if you know the exact fare. Otherwise the auto-estimate above is used.
            </p>
          </div>

          {/* Total fare summary */}
          {selectedClassData && dist > 0 && (
            <div className="mt-5 flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <div>
                <div className="text-sm font-semibold text-white">{selectedClassData.name}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {travelersCount} traveler{travelersCount > 1 ? 's' : ''} × {formatCurrency(farePerPerson)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold text-info">{formatCurrency(totalFare)}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Total Fare</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      {!isPersonal && transport && (
        <TipBox icon="💡" className="mt-4" variant="accent">
          Fares are calculated using <strong>official Indian {transport === 'train' ? 'Railways per-km rates' : transport === 'bus' ? 'state roadways rates' : transport === 'flight' ? 'average domestic airfare curves' : 'cab market rates'}</strong> for {dist} km. Actual prices may vary by operator, season, and availability.
        </TipBox>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={prevStep}>← Back</Button>
        <Button onClick={handleNext} size="lg">
          Calculate Costs <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}