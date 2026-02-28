export const calculateCosts = ({
  transport, distance, travelers = 1,
  mileage = 18, fuelPrice = 96, tollCharges = 0,
  farePerPerson = 0, additionalCost = 0,
}) => {
  const d = parseFloat(distance) || 0;
  const t = parseInt(travelers) || 1;
  const isPersonal = transport === 'car' || transport === 'bike';

  let breakdown = { fuel: 0, toll: 0, food: 0, parking: 0, fare: 0, miscellaneous: 0, total: 0 };

  if (isPersonal) {
    const m = parseFloat(mileage) || 18;
    const fp = parseFloat(fuelPrice) || 96;
    const toll = parseFloat(tollCharges) || 0;
    const liters = d / m;
    breakdown.fuel = Math.round(liters * fp);
    breakdown.toll = toll;
    breakdown.food = Math.round((d / 100) * t * 150);
    breakdown.parking = Math.round((d / 200) * 80);
    breakdown.miscellaneous = Math.round((breakdown.fuel + breakdown.toll) * 0.1);
  } else {
    const ratesPerKm = { bus: 0.65, train: 1.3, flight: 4.5, cab: 14 };
    const rate = ratesPerKm[transport] || 1;
    const fp = parseFloat(farePerPerson) || Math.round(d * rate);
    breakdown.fare = Math.round(fp * t);
    breakdown.food = Math.round(t * 200);
    if (transport === 'train') breakdown.miscellaneous = Math.round(t * 100);
    breakdown.miscellaneous += parseFloat(additionalCost) || 0;
  }

  breakdown.total = Object.values(breakdown).reduce((a, b) => a + b, 0) - breakdown.total;
  // Recalculate total properly
  breakdown.total = breakdown.fuel + breakdown.toll + breakdown.food +
    breakdown.parking + breakdown.fare + breakdown.miscellaneous;

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
