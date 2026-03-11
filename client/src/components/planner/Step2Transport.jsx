import { useState, useEffect, useRef } from 'react';
import { Car, ChevronRight, Loader2, Info, Utensils } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import { TipBox } from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';
import api from '../../api/axios';

// ─────────────────────────────────────────────────────────────
//  FARE DATA
// ─────────────────────────────────────────────────────────────
const BUS_CLASSES = [
  { id: 'ordinary',   name: 'Ordinary Bus',        desc: 'State roadways, no AC',        ratePerKm: 0.50, minFare: 15,  res: 0,  icon: '🚌', color: 'text-green-400'  },
  { id: 'express',    name: 'Express / Fast',       desc: 'Fewer stops, slightly faster', ratePerKm: 0.65, minFare: 20,  res: 0,  icon: '🚌', color: 'text-yellow-400' },
  { id: 'ac_seater',  name: 'AC Seater',            desc: 'Air-conditioned seats',        ratePerKm: 1.10, minFare: 80,  res: 0,  icon: '🚌', color: 'text-sky-400'    },
  { id: 'ac_sleeper', name: 'AC Sleeper (Private)', desc: 'Overnight berth',              ratePerKm: 1.50, minFare: 250, res: 0,  icon: '🛏️', color: 'text-purple-400' },
  { id: 'volvo',      name: 'Volvo / Luxury',       desc: 'Premium multi-axle',           ratePerKm: 1.80, minFare: 300, res: 0,  icon: '🚍', color: 'text-accent'     },
];
const TRAIN_CLASSES = [
  { id: 'general',  name: 'General (GEN)',       desc: 'No reservation',         ratePerKm: 0.36, minFare: 10,  res: 0,  icon: '🚆', color: 'text-gray-400'   },
  { id: 'sleeper',  name: 'Sleeper (SL)',         desc: 'Non-AC berth',           ratePerKm: 0.48, minFare: 55,  res: 20, icon: '🛌', color: 'text-green-400'  },
  { id: '3ac',      name: 'AC 3-Tier (3A)',       desc: 'AC berth, most popular', ratePerKm: 1.25, minFare: 250, res: 40, icon: '❄️', color: 'text-sky-400'    },
  { id: '2ac',      name: 'AC 2-Tier (2A)',       desc: 'More comfort & privacy', ratePerKm: 2.05, minFare: 400, res: 50, icon: '🌟', color: 'text-yellow-400' },
  { id: '1ac',      name: 'AC First Class (1A)',  desc: 'Private cabin, luxury',  ratePerKm: 3.40, minFare: 700, res: 60, icon: '👑', color: 'text-amber-400'  },
  { id: 'cc',       name: 'Chair Car (CC)',        desc: 'Day train, Shatabdi',    ratePerKm: 1.00, minFare: 150, res: 40, icon: '💺', color: 'text-purple-400' },
  { id: 'ec',       name: 'Executive Chair (EC)', desc: 'Premium day seating',    ratePerKm: 2.20, minFare: 400, res: 60, icon: '💎', color: 'text-pink-400'   },
];
const FLIGHT_CLASSES = [
  { id: 'eco_basic', name: 'Economy Basic',    desc: 'No baggage, no seat select', baseFare: 1800, ratePerKm: 3.8, icon: '✈️', color: 'text-sky-400'    },
  { id: 'eco_flexi', name: 'Economy Flexible', desc: '15kg baggage + seat select', baseFare: 2500, ratePerKm: 5.2, icon: '✈️', color: 'text-blue-400'   },
  { id: 'eco_full',  name: 'Full Service Eco', desc: 'Meal + 25kg (Air India)',    baseFare: 3200, ratePerKm: 6.5, icon: '🛫', color: 'text-indigo-400' },
  { id: 'business',  name: 'Business Class',   desc: 'Lounge + wide seats',        baseFare: 9000, ratePerKm: 14,  icon: '🥂', color: 'text-amber-400'  },
];
const CAB_CLASSES = [
  { id: 'auto',       name: 'Auto Rickshaw',    desc: 'Short city rides only',     base: 25,  ratePerKm: 13, icon: '🛺', color: 'text-yellow-400' },
  { id: 'mini',       name: 'Mini / Hatchback', desc: 'Ola Mini, Uber Go',         base: 50,  ratePerKm: 12, icon: '🚗', color: 'text-green-400'  },
  { id: 'sedan',      name: 'Sedan / Prime',    desc: 'Ola Prime, Uber Comfort',   base: 75,  ratePerKm: 16, icon: '🚕', color: 'text-sky-400'    },
  { id: 'suv',        name: 'SUV / XL',         desc: 'Ola SUV, Uber XL (6-seat)', base: 100, ratePerKm: 22, icon: '🚙', color: 'text-purple-400' },
  { id: 'outstation', name: 'Outstation Cab',   desc: 'Dedicated intercity cab',   base: 300, ratePerKm: 13, icon: '🚖', color: 'text-accent'     },
];

function calcFare(transport, cls, distance) {
  const d = parseFloat(distance) || 0;
  if (!d || !cls) return 0;
  if (transport === 'bus')    return Math.max(cls.minFare, Math.round(cls.ratePerKm * d));
  if (transport === 'train') {
    const base = Math.max(cls.minFare, Math.round(cls.ratePerKm * d));
    return base + (cls.res || 0) + Math.round(base * 0.05);
  }
  if (transport === 'flight') {
    const f = d < 300 ? 1.6 : d < 600 ? 1.3 : d < 1000 ? 1.1 : 1.0;
    return Math.round((cls.baseFare + cls.ratePerKm * d) * f);
  }
  if (transport === 'cab') return cls.base + Math.round(cls.ratePerKm * d);
  return 0;
}

function getClasses(t) {
  if (t === 'bus')    return BUS_CLASSES;
  if (t === 'train')  return TRAIN_CLASSES;
  if (t === 'flight') return FLIGHT_CLASSES;
  if (t === 'cab')    return CAB_CLASSES;
  return [];
}

// ─────────────────────────────────────────────────────────────
//  FOOD DATA
// ─────────────────────────────────────────────────────────────
const MEAL_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast',    icon: '🌅', time: 'Morning'   },
  { id: 'lunch',     label: 'Lunch',        icon: '☀️', time: 'Afternoon' },
  { id: 'dinner',    label: 'Dinner',       icon: '🌙', time: 'Evening'   },
  { id: 'snacks',    label: 'Snacks',       icon: '🍿', time: 'Anytime'   },
  { id: 'tea',       label: 'Tea / Coffee', icon: '☕', time: 'Anytime'   },
];
const FOOD_MENU = {
  breakfast: [
    { item: 'Poha / Upma',            price: 50  },
    { item: 'Paratha + Chai',         price: 80  },
    { item: 'Idli Sambar (2 pcs)',    price: 60  },
    { item: 'Bread Omelette',         price: 70  },
    { item: 'Hotel Buffet Breakfast', price: 180 },
  ],
  lunch: [
    { item: 'Veg Thali (Dhaba)',   price: 120 },
    { item: 'Non-Veg Thali',       price: 180 },
    { item: 'Dal Rice + Sabzi',    price: 100 },
    { item: 'Restaurant Lunch',    price: 250 },
    { item: 'Fast Food (McD/KFC)', price: 200 },
  ],
  dinner: [
    { item: 'Dhaba Dinner',    price: 150 },
    { item: 'Veg Thali',       price: 130 },
    { item: 'Non-Veg Dinner',  price: 220 },
    { item: 'Hotel Dinner',    price: 350 },
    { item: 'Biryani',         price: 180 },
  ],
  snacks: [
    { item: 'Samosa + Chai',       price: 30 },
    { item: 'Chips + Cold Drink',  price: 50 },
    { item: 'Fruit / Biscuits',    price: 40 },
    { item: 'Highway Bhel / Puri', price: 60 },
    { item: 'Packaged Snacks',     price: 80 },
  ],
  tea: [
    { item: 'Cutting Chai',        price: 15  },
    { item: 'Tea / Coffee (Cafe)', price: 60  },
    { item: 'Cold Coffee / Shake', price: 100 },
    { item: 'Nimbu Pani / Lassi',  price: 40  },
  ],
};

// ─────────────────────────────────────────────────────────────
//  AUTO TOLL ESTIMATE
// ─────────────────────────────────────────────────────────────
async function estimateToll(origin, destination, distance) {
  try {
    const geo = async (city) => {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', India')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const d = await r.json();
      if (!d || !d.length) throw new Error('not found');
      return [parseFloat(d[0].lon), parseFloat(d[0].lat)];
    };
    await Promise.all([geo(origin), geo(destination)]);
    const dist     = parseFloat(distance) || 0;
    const tolledKm = dist * 0.65;
    const rate     = dist > 400 ? 2.0 : dist > 200 ? 1.8 : dist > 100 ? 1.5 : 1.2;
    return Math.round((tolledKm * rate) / 10) * 10;
  } catch {
    const dist = parseFloat(distance) || 0;
    return Math.round((dist * 0.65 * 1.6) / 10) * 10;
  }
}

// ─────────────────────────────────────────────────────────────
//  ROUTE STOPS DATABASE
// ─────────────────────────────────────────────────────────────
const ROUTE_STOPS_DB = [
  { from: ['amritsar'],            to: ['delhi','new delhi'],  stops: ['Jalandhar', 'Ludhiana', 'Ambala', 'Panipat', 'Sonipat'] },
  { from: ['ludhiana'],            to: ['delhi','new delhi'],  stops: ['Ambala', 'Karnal', 'Panipat', 'Sonipat'] },
  { from: ['chandigarh'],          to: ['delhi','new delhi'],  stops: ['Ambala', 'Karnal', 'Panipat'] },
  { from: ['amritsar'],            to: ['chandigarh'],         stops: ['Jalandhar', 'Phagwara', 'Ludhiana', 'Ropar'] },
  { from: ['amritsar'],            to: ['ludhiana'],           stops: ['Jalandhar', 'Phagwara'] },
  { from: ['delhi','new delhi'],   to: ['jaipur'],             stops: ['Gurgaon', 'Manesar', 'Shahjahanpur', 'Behror', 'Kotputli'] },
  { from: ['delhi','new delhi'],   to: ['agra'],               stops: ['Faridabad', 'Palwal', 'Hodal', 'Mathura'] },
  { from: ['delhi','new delhi'],   to: ['mumbai'],             stops: ['Jaipur', 'Ajmer', 'Udaipur', 'Ahmedabad', 'Vadodara', 'Surat'] },
  { from: ['delhi','new delhi'],   to: ['varanasi'],           stops: ['Agra', 'Kanpur', 'Allahabad'] },
  { from: ['delhi','new delhi'],   to: ['chandigarh'],         stops: ['Panipat', 'Ambala'] },
  { from: ['delhi','new delhi'],   to: ['haridwar'],           stops: ['Meerut', 'Muzaffarnagar', 'Roorkee'] },
  { from: ['delhi','new delhi'],   to: ['shimla'],             stops: ['Panipat', 'Ambala', 'Chandigarh', 'Kalka', 'Solan'] },
  { from: ['delhi','new delhi'],   to: ['dehradun'],           stops: ['Meerut', 'Muzaffarnagar', 'Roorkee', 'Haridwar'] },
  { from: ['mumbai'],              to: ['pune'],               stops: ['Khopoli', 'Lonavala', 'Khandala'] },
  { from: ['mumbai'],              to: ['goa'],                stops: ['Pune', 'Satara', 'Kolhapur', 'Belgaum'] },
  { from: ['mumbai'],              to: ['ahmedabad'],          stops: ['Surat', 'Bharuch', 'Anand', 'Vadodara'] },
  { from: ['bangalore','bengaluru'], to: ['chennai'],          stops: ['Hosur', 'Krishnagiri', 'Vellore'] },
  { from: ['bangalore','bengaluru'], to: ['hyderabad'],        stops: ['Kolar', 'Anantapur', 'Kurnool'] },
  { from: ['bangalore','bengaluru'], to: ['mysore','mysuru'],  stops: ['Channapatna', 'Maddur', 'Mandya'] },
  { from: ['chennai'],             to: ['hyderabad'],          stops: ['Nellore', 'Ongole', 'Tirupati'] },
  { from: ['jaipur'],              to: ['jodhpur'],            stops: ['Ajmer', 'Nagaur'] },
  { from: ['jaipur'],              to: ['udaipur'],            stops: ['Ajmer', 'Bhilwara', 'Chittorgarh'] },
  { from: ['ahmedabad'],           to: ['surat'],              stops: ['Anand', 'Vadodara', 'Bharuch'] },
  { from: ['haridwar'],            to: ['dehradun'],           stops: ['Rishikesh'] },
];

function getRouteStops(from, to) {
  if (!from || !to) return [];
  try {
    const f = from.toLowerCase().trim().split(/[,\s]/)[0] || '';
    const t = to.toLowerCase().trim().split(/[,\s]/)[0] || '';
    for (const entry of ROUTE_STOPS_DB) {
      const fMatch = entry.from.some(x => f.includes(x) || x.includes(f));
      const tMatch = entry.to.some(x => t.includes(x) || x.includes(t));
      if (fMatch && tMatch) return entry.stops;
      const fRev = entry.to.some(x => f.includes(x) || x.includes(f));
      const tRev = entry.from.some(x => t.includes(x) || x.includes(t));
      if (fRev && tRev) return [...entry.stops].reverse();
    }
  } catch { /* safe */ }
  return [];
}

// ─────────────────────────────────────────────────────────────
//  TRANSPORT LIST
// ─────────────────────────────────────────────────────────────
const ALL_TRANSPORTS = [
  { id: 'car',    icon: '🚗', name: 'Car',        desc: 'Personal vehicle',     personal: true  },
  { id: 'bike',   icon: '🏍️', name: 'Bike',       desc: 'Motorcycle / Scooter', personal: true  },
  { id: 'bus',    icon: '🚌', name: 'Bus',         desc: 'State or private bus', personal: false },
  { id: 'train',  icon: '🚆', name: 'Train',       desc: 'Indian Railways',      personal: false },
  { id: 'flight', icon: '✈️', name: 'Flight',      desc: 'Domestic air travel',  personal: false },
  { id: 'cab',    icon: '🚕', name: 'Cab / Taxi',  desc: 'Ola / Uber / Local',   personal: false },
];

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Step2Transport() {
  const ctx = usePlanner();
  const {
    transport = '',
    vehicleDetails = {},
    publicTransport = {},
    additionalCost = '',
    distance = '',
    travelers = 1,
    origin = '',
    destination = '',
    foodPreferences,
    foodBudget,
    updateField,
    updateVehicle,
    updatePublic,
    setFoodPrefs,
    setFoodBudget,
    nextStep,
    prevStep,
  } = ctx;

  // Safe arrays/objects — prevents crashes if context not ready
  const safeFoodPrefs  = Array.isArray(foodPreferences) ? foodPreferences : [];
  const safeFoodBudget = (foodBudget && typeof foodBudget === 'object') ? foodBudget : {};

  const [errors, setErrors]             = useState({});
  const [subPage, setSubPage]           = useState('transport');
  const [fuelLoading, setFuelLoading]   = useState(false);
  const [fuelFetched, setFuelFetched]   = useState(false);
  const [fuelInfo, setFuelInfo]         = useState(null);
  const fuelFetchedRef                  = useRef(false);
  const [tollFetching, setTollFetching] = useState(false);
  const [tollFetched, setTollFetched]   = useState(false);
  const tollDoneRef                     = useRef(false);
  const [routeStops, setRouteStops]     = useState([]);

  const dist         = parseFloat(distance)   || 0;
  const travelersNum = parseInt(travelers)    || 1;
  const isPersonal   = transport === 'car' || transport === 'bike';

  // Compute route stops
  useEffect(() => {
    try {
      setRouteStops(getRouteStops(origin, destination));
    } catch { setRouteStops([]); }
  }, [origin, destination]);

  // Fetch live fuel prices (info only — not auto-filled)
  useEffect(() => {
    if (!isPersonal || fuelFetchedRef.current) return;
    fuelFetchedRef.current = true;
    setFuelLoading(true);
    api.get(`/places/fuel-prices?city=${encodeURIComponent(origin || 'Amritsar')}`)
      .then(({ data }) => {
        if (data && data.success && data.prices) {
          setFuelInfo(data.prices);
          setFuelFetched(true);
        }
      })
      .catch(() => {})
      .finally(() => setFuelLoading(false));
  }, [isPersonal]);

  // Reset on transport change
  useEffect(() => {
    fuelFetchedRef.current = false;
    setFuelFetched(false);
    setFuelInfo(null);
    tollDoneRef.current = false;
    setTollFetched(false);
  }, [transport]);

  // Auto toll for car
  useEffect(() => {
    if (transport !== 'car' || !origin || !destination || !dist || tollDoneRef.current) return;
    tollDoneRef.current = true;
    setTollFetching(true);
    estimateToll(origin, destination, dist)
      .then(toll => { updateVehicle({ tollCharges: String(toll) }); setTollFetched(true); })
      .catch(() => {})
      .finally(() => setTollFetching(false));
  }, [transport, origin, destination, dist]);

  // Derived values
  const safeVehicle      = vehicleDetails || {};
  const safePublic       = publicTransport || {};
  const selectedCls      = getClasses(transport).find(c => c.id === (safePublic.fareClass || '')) || null;
  const farePerPerson    = selectedCls ? calcFare(transport, selectedCls, dist) : parseFloat(safePublic.farePerPerson) || 0;
  const fuelCalc         = (() => {
    const m  = parseFloat(safeVehicle.mileage)   || 0;
    const fp = parseFloat(safeVehicle.fuelPrice) || 0;
    if (!isPersonal || !m || !fp || !dist) return null;
    return { liters: (dist / m).toFixed(1), cost: Math.round((dist / m) * fp) };
  })();
  const foodTotal = safeFoodPrefs.reduce((s, id) => s + (parseFloat(safeFoodBudget[id]) || 0), 0) * travelersNum;

  // Handlers
  const selectTransport = (id) => {
    updateField('transport', id);
    updatePublic({ fareClass: '', farePerPerson: '' });
    setSubPage('details');
  };

  const toggleMeal = (id) => {
    setFoodPrefs(safeFoodPrefs.includes(id) ? safeFoodPrefs.filter(x => x !== id) : [...safeFoodPrefs, id]);
  };

  const goToFood = () => {
    const e = {};
    if (isPersonal && !safeVehicle.mileage)    e.mileage   = 'Enter your vehicle mileage';
    if (isPersonal && !safeVehicle.fuelPrice)  e.fuelPrice = 'Enter fuel price';
    if (!isPersonal && !safePublic.fareClass)   e.fareClass = 'Select a class / category';
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    if (!isPersonal && selectedCls) updatePublic({ farePerPerson: String(farePerPerson) });
    setSubPage('food');
  };

  // ════════════════════════════════════════════════════════════
  //  PAGE 1 — Transport selection
  // ════════════════════════════════════════════════════════════
  if (subPage === 'transport') {
    return (
      <div className="animate-[fadeUp_0.4s_ease_forwards]">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <Car size={20} className="text-accent" />
            </div>
            <h2 className="font-display text-2xl font-bold">How are you travelling?</h2>
          </div>
          <p className="text-[var(--text-muted)] text-sm ml-[52px]">Pick your mode — we'll show relevant inputs next.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ALL_TRANSPORTS.map((t) => (
            <button key={t.id} type="button" onClick={() => selectTransport(t.id)}
              className="group relative p-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface2)]
                hover:border-accent/60 hover:bg-orange-500/5 hover:-translate-y-1
                hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] transition-all duration-200 text-left">
              <div className="text-4xl mb-4">{t.icon}</div>
              <div className="font-display font-bold text-base text-white mb-1">{t.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{t.desc}</div>
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full border border-[var(--border)]
                group-hover:border-accent group-hover:bg-accent/10 transition-all flex items-center justify-center">
                <ChevronRight size={12} className="text-[var(--text-muted)] group-hover:text-accent" />
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-start mt-8">
          <Button variant="outline" onClick={prevStep}>← Back</Button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  PAGE 2 — Transport details
  // ════════════════════════════════════════════════════════════
  if (subPage === 'details') {
    const tObj = ALL_TRANSPORTS.find(t => t.id === transport);
    return (
      <div className="animate-[fadeUp_0.4s_ease_forwards]">
        <div className="mb-6">
          <button onClick={() => setSubPage('transport')}
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white mb-4 transition-colors">
            ← Change transport
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-xl">{tObj?.icon}</div>
            <div>
              <h2 className="font-display text-2xl font-bold">{tObj?.name} Details</h2>
              <p className="text-[var(--text-muted)] text-sm">{dist} km · {travelersNum} traveler{travelersNum > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Route stops info — non-interactive */}
        {routeStops.length > 0 && (
          <div className="mb-5 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
            <p className="text-[11px] text-[var(--text-muted)] mb-2 flex items-center gap-1">
              <Info size={11} /> Major stops on <strong className="text-white">{origin}</strong> → <strong className="text-white">{destination}</strong>
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs font-semibold text-accent">{origin}</span>
              {routeStops.map((stop, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-[var(--text-muted)] text-xs">›</span>
                  <span className="text-xs text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{stop}</span>
                </span>
              ))}
              <span className="text-[var(--text-muted)] text-xs">›</span>
              <span className="text-xs font-semibold text-accent">{destination}</span>
            </div>
          </div>
        )}

        {/* ── CAR ── */}
        {transport === 'car' && (
          <div className="space-y-5">
            <div className="p-5 bg-orange-500/5 border border-orange-500/15 rounded-2xl">
              <h3 className="font-display font-bold text-base mb-4">⛽ Fuel Details</h3>

              {/* Fuel price reference — info only, NOT clickable */}
              {fuelLoading && (
                <div className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl mb-4 text-sm text-[var(--text-muted)]">
                  <Loader2 size={13} className="animate-spin flex-shrink-0" />
                  Fetching today's fuel prices for {origin || 'your city'}...
                </div>
              )}
              {fuelFetched && fuelInfo && (
                <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl mb-4">
                  <p className="text-[11px] text-[var(--text-muted)] mb-2 flex items-center gap-1">
                    <Info size={11} className="flex-shrink-0" />
                    {fuelInfo.isLive ? '🟢 Live' : '🟡 State avg'} prices in <strong className="text-white ml-1">{fuelInfo.city || origin}</strong>
                    <span className="ml-1">— for reference only</span>
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm"><span className="text-[var(--text-muted)]">Petrol:</span> <strong className="text-white">₹{fuelInfo.petrol}/L</strong></span>
                    <span className="text-sm"><span className="text-[var(--text-muted)]">Diesel:</span> <strong className="text-white">₹{fuelInfo.diesel}/L</strong></span>
                    <span className="text-sm"><span className="text-[var(--text-muted)]">CNG:</span> <strong className="text-white">₹{fuelInfo.cng}/L</strong></span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Enter your fuel price manually below ↓</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Car Mileage (km/L)" type="number" placeholder="Enter your car's mileage" min="1"
                  value={safeVehicle.mileage || ''}
                  onChange={e => updateVehicle({ mileage: e.target.value })}
                  error={errors.mileage} />
                <Select label="Fuel Type" value={safeVehicle.fuelType || ''}
                  onChange={e => updateVehicle({ fuelType: e.target.value })}>
                  <option value="">-- Select fuel type --</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                </Select>
                <Input label="Fuel Price (₹/L)" type="number" placeholder="Enter fuel price" min="1"
                  value={safeVehicle.fuelPrice || ''}
                  onChange={e => updateVehicle({ fuelPrice: e.target.value })}
                  error={errors.fuelPrice} />
              </div>

              {fuelCalc && (
                <div className="mt-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">⛽ {fuelCalc.liters} litres needed</span>
                    <span className="font-display text-xl font-bold text-accent">{formatCurrency(fuelCalc.cost)}</span>
                  </div>
                  <div className="h-2 bg-[var(--surface2)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-orange-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (parseFloat(fuelCalc.liters) / 60) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    💡 Fuel is a vehicle cost — same whether 1 or {travelersNum} people travel.
                  </p>
                </div>
              )}
            </div>

            {/* Toll */}
            <div className="p-5 bg-yellow-500/5 border border-yellow-500/15 rounded-2xl">
              <h3 className="font-display font-bold text-base flex items-center gap-2 mb-1">
                🛣️ Toll Charges
                {tollFetching && <Loader2 size={14} className="animate-spin text-yellow-400" />}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                {tollFetching
                  ? 'Estimating toll from route data...'
                  : tollFetched
                  ? `Auto-estimated ₹${safeVehicle.tollCharges} for ${dist} km. Edit if you know exact amount.`
                  : 'Estimated based on highway distance.'}
              </p>
              <Input label="Toll Charges (₹)" type="number" placeholder="Enter toll amount" min="0"
                value={safeVehicle.tollCharges || ''}
                onChange={e => updateVehicle({ tollCharges: e.target.value })} />
              <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1">
                <Info size={11} /> Toll is one-time for the vehicle, not per passenger.
              </p>
            </div>
          </div>
        )}

        {/* ── BIKE ── */}
        {transport === 'bike' && (
          <div className="space-y-5">
            <div className="p-5 bg-orange-500/5 border border-orange-500/15 rounded-2xl">
              <h3 className="font-display font-bold text-base mb-4">⛽ Fuel Details</h3>

              {fuelLoading && (
                <div className="flex items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl mb-4 text-sm text-[var(--text-muted)]">
                  <Loader2 size={13} className="animate-spin flex-shrink-0" />
                  Fetching today's fuel prices for {origin || 'your city'}...
                </div>
              )}
              {fuelFetched && fuelInfo && (
                <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl mb-4">
                  <p className="text-[11px] text-[var(--text-muted)] mb-2 flex items-center gap-1">
                    <Info size={11} className="flex-shrink-0" />
                    {fuelInfo.isLive ? '🟢 Live' : '🟡 State avg'} prices in <strong className="text-white ml-1">{fuelInfo.city || origin}</strong> — for reference only
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm"><span className="text-[var(--text-muted)]">Petrol:</span> <strong className="text-white">₹{fuelInfo.petrol}/L</strong></span>
                    <span className="text-sm"><span className="text-[var(--text-muted)]">Diesel:</span> <strong className="text-white">₹{fuelInfo.diesel}/L</strong></span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Enter your fuel price manually below ↓</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Bike Mileage (km/L)" type="number" placeholder="Enter your bike's mileage" min="1"
                  value={safeVehicle.mileage || ''}
                  onChange={e => updateVehicle({ mileage: e.target.value })}
                  error={errors.mileage} />
                <Input label="Fuel Price (₹/L)" type="number" placeholder="Enter fuel price" min="1"
                  value={safeVehicle.fuelPrice || ''}
                  onChange={e => updateVehicle({ fuelPrice: e.target.value })}
                  error={errors.fuelPrice} />
              </div>

              {fuelCalc && (
                <div className="mt-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">⛽ {fuelCalc.liters} litres needed</span>
                    <span className="font-display text-xl font-bold text-accent">{formatCurrency(fuelCalc.cost)}</span>
                  </div>
                </div>
              )}
            </div>
            <TipBox icon="🏍️" variant="accent">
              Bikes are usually toll-free on most Indian highways. Add toll below only if your route has one.
            </TipBox>
            <Input label="Toll (if any) (₹)" type="number" placeholder="Enter toll amount (leave blank if none)" min="0"
              value={safeVehicle.tollCharges || ''}
              onChange={e => updateVehicle({ tollCharges: e.target.value })} />
          </div>
        )}

        {/* ── BUS / TRAIN / FLIGHT / CAB ── */}
        {['bus', 'train', 'flight', 'cab'].includes(transport) && (
          <div className="p-5 bg-sky-500/5 border border-sky-500/15 rounded-2xl space-y-5">
            <div>
              <h3 className="font-display font-bold text-base mb-1">🎫 Select Your Class</h3>
              <p className="text-xs text-[var(--text-muted)] mb-5">
                Fare auto-calculated · {dist} km · {travelersNum} traveler{travelersNum > 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getClasses(transport).map((cls) => {
                  const fare  = calcFare(transport, cls, dist);
                  const isSel = (safePublic.fareClass || '') === cls.id;
                  return (
                    <button key={cls.id} type="button"
                      onClick={() => updatePublic({ fareClass: cls.id, farePerPerson: String(fare) })}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5
                        ${isSel ? 'border-sky-500 bg-sky-500/8 shadow-[0_0_0_1px_rgba(56,189,248,0.4)]'
                                : 'border-[var(--border)] bg-[var(--surface)] hover:border-sky-500/40'}`}>
                      {isSel && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">✓</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{cls.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-white">{cls.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">{cls.desc}</div>
                        </div>
                      </div>
                      {dist > 0 && (
                        <div className="mt-2 pt-2 border-t border-[var(--border)]">
                          <span className={`font-display text-lg font-bold ${cls.color}`}>{formatCurrency(fare)}</span>
                          <span className="text-xs text-[var(--text-muted)] ml-1">/ person</span>
                          {travelersNum > 1 && (
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">
                              {formatCurrency(fare * travelersNum)} total for {travelersNum}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.fareClass && <p className="text-red-400 text-xs mt-3">{errors.fareClass}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={transport === 'train' ? 'Train Name (optional)' : transport === 'flight' ? 'Flight No. (optional)' : 'Operator (optional)'}
                type="text"
                placeholder={transport === 'train' ? 'e.g. Shatabdi Express' : transport === 'flight' ? 'e.g. IndiGo 6E-204' : transport === 'bus' ? 'e.g. PRTC Volvo' : 'e.g. Ola Outstation'}
                value={safePublic.provider || ''}
                onChange={e => updatePublic({ provider: e.target.value })} />
              <Input label="Additional Cost (₹) — porter, auto, etc." type="number"
                placeholder="Enter any extra costs" min="0"
                value={additionalCost || ''}
                onChange={e => updateField('additionalCost', e.target.value)} />
            </div>

            {selectedCls && dist > 0 && (
              <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-sky-500/20">
                <div>
                  <div className="text-sm font-semibold text-white">{selectedCls.name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{travelersNum} × {formatCurrency(farePerPerson)}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-bold text-info">{formatCurrency(farePerPerson * travelersNum)}</div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Total Fare</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setSubPage('transport')}>← Back</Button>
          <Button onClick={goToFood} size="lg">
            <Utensils size={16} /> Add Food & Drinks →
          </Button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  PAGE 3 — Food
  // ════════════════════════════════════════════════════════════
  if (subPage === 'food') {
    return (
      <div className="animate-[fadeUp_0.4s_ease_forwards]">
        <div className="mb-8">
          <button onClick={() => setSubPage('details')}
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white mb-4 transition-colors">
            ← Back to transport details
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
              <Utensils size={20} className="text-green-400" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">Food & Beverages</h2>
              <p className="text-[var(--text-muted)] text-sm">Which meals will you have on this trip?</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {MEAL_OPTIONS.map((meal) => {
            const isSel = safeFoodPrefs.includes(meal.id);
            return (
              <button key={meal.id} type="button" onClick={() => toggleMeal(meal.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:-translate-y-0.5
                  ${isSel ? 'border-green-500 bg-green-500/10 shadow-[0_0_0_1px_rgba(34,197,94,0.3)]'
                           : 'border-[var(--border)] bg-[var(--surface2)] hover:border-green-500/40'}`}>
                <div className="text-2xl mb-1">{meal.icon}</div>
                <div className="text-sm font-semibold text-white">{meal.label}</div>
                <div className="text-xs text-[var(--text-muted)]">{meal.time}</div>
                {isSel && <div className="mt-1 text-xs text-green-400 font-semibold">✓ Added</div>}
              </button>
            );
          })}
        </div>

        {safeFoodPrefs.length > 0 && (
          <div className="space-y-5">
            {safeFoodPrefs.map((mealId) => {
              const meal    = MEAL_OPTIONS.find(m => m.id === mealId);
              if (!meal) return null;
              const menu    = FOOD_MENU[mealId] || [];
              const current = parseFloat(safeFoodBudget[mealId]) || 0;
              return (
                <div key={mealId} className="p-5 bg-[var(--surface2)] border border-[var(--border)] rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meal.icon}</span>
                      <span className="font-display font-bold text-base text-white">{meal.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-bold text-green-400">
                        {current ? formatCurrency(current) : '—'}
                        <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ person</span>
                      </div>
                      {travelersNum > 1 && current > 0 && (
                        <div className="text-xs text-[var(--text-muted)]">{formatCurrency(current * travelersNum)} total</div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-3">Pick an option or enter your own amount:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {menu.map((item) => {
                      const isSel = parseFloat(safeFoodBudget[mealId]) === item.price;
                      return (
                        <button key={item.item} type="button"
                          onClick={() => setFoodBudget({ [mealId]: item.price })}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all
                            ${isSel ? 'border-green-500 bg-green-500/8' : 'border-[var(--border)] bg-[var(--surface)] hover:border-green-500/40'}`}>
                          <span className="text-sm text-white">{item.item}</span>
                          <span className={`text-sm font-bold ml-2 flex-shrink-0 ${isSel ? 'text-green-400' : 'text-[var(--text-muted)]'}`}>
                            ₹{item.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <Input label="Or enter your own amount (₹/person)" type="number"
                    placeholder="Enter custom amount per person" min="0"
                    value={safeFoodBudget[mealId] || ''}
                    onChange={e => setFoodBudget({ [mealId]: e.target.value })} />
                </div>
              );
            })}

            <div className="flex items-center justify-between p-4 bg-green-500/8 border border-green-500/20 rounded-xl">
              <div>
                <div className="font-semibold text-white">🍽️ Total Food Budget</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {travelersNum} traveler{travelersNum > 1 ? 's' : ''} · {safeFoodPrefs.length} meal type{safeFoodPrefs.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="font-display text-2xl font-bold text-green-400">{formatCurrency(foodTotal)}</div>
            </div>
          </div>
        )}

        {safeFoodPrefs.length === 0 && (
          <TipBox icon="🍽️" variant="success">
            You can skip this — a default food estimate will be used based on trip distance.
          </TipBox>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setSubPage('details')}>← Back</Button>
          <Button onClick={() => nextStep()} size="lg">
            Calculate Costs <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}