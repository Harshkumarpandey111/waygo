/**
 * WayGo Cost Calculator — Frontend
 * Fixed: farePerPerson double-multiplication, NaN/Infinity guard
 */
export const calculateCosts = ({
  transport, distance, travelers = 1,
  mileage = 18, fuelPrice = 96, tollCharges = 0,
  farePerPerson = 0, additionalCost = 0,
  foodBudget = {}, foodPreferences = [],
}) => {
  // ── Sanitize ─────────────────────────────────────────────
  const d    = Math.max(0, parseFloat(distance)      || 0);
  const t    = Math.max(1, parseInt(travelers)        || 1);
  const m    = Math.max(1, parseFloat(mileage)        || 18);
  const fp   = Math.max(0, parseFloat(fuelPrice)      || 96);
  const toll = Math.max(0, parseFloat(tollCharges)    || 0);
  const fpp  = Math.max(0, parseFloat(farePerPerson)  || 0);
  const addl = Math.max(0, parseFloat(additionalCost) || 0);

  const isPersonal = transport === 'car' || transport === 'bike';

  let breakdown = {
    fuel: 0, toll: 0, food: 0,
    parking: 0, fare: 0, miscellaneous: 0, total: 0,
  };

  if (isPersonal) {
    const liters        = d / m;
    breakdown.fuel      = Math.round(liters * fp);
    breakdown.toll      = Math.round(toll);

    // Food calculation
    if (foodPreferences.length > 0) {
      const foodPerPerson = foodPreferences.reduce(
        (sum, meal) => sum + (parseFloat(foodBudget[meal]) || 0), 0
      );
      breakdown.food = Math.round(foodPerPerson * t);
    } else {
      breakdown.food = Math.round((d / 100) * t * 150);
    }

    breakdown.parking       = Math.round((d / 200) * 80);
    breakdown.miscellaneous = Math.round((breakdown.fuel + breakdown.toll) * 0.1);

  } else {
    const ratesPerKm = { bus: 0.65, train: 1.3, flight: 4.5, cab: 14 };
    const rate = ratesPerKm[transport] || 1;

    // fpp = per person fare — multiply by travelers once
    const perPerson  = fpp > 0 ? fpp : Math.round(d * rate);
    breakdown.fare   = Math.round(perPerson * t);

    if (foodPreferences.length > 0) {
      const foodPerPerson = foodPreferences.reduce(
        (sum, meal) => sum + (parseFloat(foodBudget[meal]) || 0), 0
      );
      breakdown.food = Math.round(foodPerPerson * t);
    } else {
      breakdown.food = Math.round(t * 200);
    }

    if (transport === 'train') {
      breakdown.miscellaneous = Math.round(t * 100);
    }
    breakdown.miscellaneous += Math.round(addl);
  }

  breakdown.total =
    breakdown.fuel +
    breakdown.toll +
    breakdown.food +
    breakdown.parking +
    breakdown.fare +
    breakdown.miscellaneous;

  // Safety cap
  if (!isFinite(breakdown.total) || breakdown.total > 1000000) {
    breakdown.total = 0;
  }

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

export const getNearbyMapsUrl = (type, location) =>
  `https://www.google.com/maps/search/${encodeURIComponent(type + ' near ' + location)}`;