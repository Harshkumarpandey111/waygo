// ─────────────────────────────────────────────────────────────
//  COST CALCULATION ENGINE
//  Key rules:
//  - Car/Bike: fuel + toll = FIXED cost (same whether 1 or 5 people)
//  - Food/beverage = per person × travelers (everyone eats)
//  - Public transport fare = per person × travelers
// ─────────────────────────────────────────────────────────────

export const calculateCosts = ({
  transport,
  distance,
  travelers = 1,
  // personal vehicle
  mileage = 18,
  fuelPrice = 96,
  tollCharges = 0,
  // public transport
  farePerPerson = 0,
  additionalCost = 0,
  // food
  foodPreferences = [],
  foodBudget = {},
}) => {
  const d   = parseFloat(distance)    || 0;
  const t   = parseInt(travelers)     || 1;
  const isPersonal = transport === 'car' || transport === 'bike';

  let breakdown = {
    fuel: 0,
    toll: 0,
    food: 0,
    parking: 0,
    fare: 0,
    miscellaneous: 0,
    total: 0,
  };

  // ── PERSONAL VEHICLE (car / bike) ──────────────────────────
  if (isPersonal) {
    const m   = parseFloat(mileage)    || 18;
    const fp  = parseFloat(fuelPrice)  || 96;
    const tol = parseFloat(tollCharges) || 0;
    const liters = d / m;

    // Fuel & toll: ONE cost for the whole vehicle, NOT per person
    breakdown.fuel    = Math.round(liters * fp);
    breakdown.toll    = tol;

    // Parking: flat per stop, not per person
    breakdown.parking = Math.round((d / 200) * 80);

    // Misc: 10% buffer on vehicle costs only
    breakdown.miscellaneous = Math.round((breakdown.fuel + breakdown.toll) * 0.1);

  // ── PUBLIC TRANSPORT (bus / train / flight / cab) ──────────
  } else {
    const fp  = parseFloat(farePerPerson) || 0;
    // Fare is per person
    breakdown.fare          = Math.round(fp * t);
    // Additional cost (porter, auto, etc.) — entered by user
    breakdown.miscellaneous = parseFloat(additionalCost) || 0;
  }

  // ── FOOD — applies to ALL transport types ──────────────────
  // If user selected food preferences, use their custom budget
  if (foodPreferences.length > 0 && Object.keys(foodBudget).length > 0) {
    const totalFoodPerPerson = foodPreferences.reduce((sum, meal) => {
      return sum + (parseFloat(foodBudget[meal]) || 0);
    }, 0);
    breakdown.food = Math.round(totalFoodPerPerson * t);
  } else {
    // Fallback: default estimate based on distance
    const defaultPerPerson = Math.round((d / 100) * 120);
    breakdown.food = Math.round(defaultPerPerson * t);
  }

  breakdown.total =
    breakdown.fuel +
    breakdown.toll +
    breakdown.food +
    breakdown.parking +
    breakdown.fare +
    breakdown.miscellaneous;

  return breakdown;
};

export const formatCurrency = (amount) =>
  `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

export const transportIcons = {
  car: '🚗', bike: '🏍️', bus: '🚌', train: '🚆', flight: '✈️', cab: '🚕',
};

export const transportNames = {
  car: 'Car', bike: 'Bike', bus: 'Bus', train: 'Train', flight: 'Flight', cab: 'Cab / Taxi',
};

export const getGoogleMapsUrl = (origin, destination) => {
  if (!origin || !destination) return '#';
  return `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`;
};

export const getNearbyMapsUrl = (type, location) => {
  return `https://www.google.com/maps/search/${encodeURIComponent(type + ' near ' + location)}`;
};