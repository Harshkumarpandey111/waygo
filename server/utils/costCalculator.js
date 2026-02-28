/**
 * Calculate full cost breakdown for a trip
 */
const calculateCosts = ({
  transport,
  distance,
  travelers = 1,
  mileage = 18,
  fuelPrice = 96,
  tollCharges = 0,
  farePerPerson = 0,
  additionalCost = 0,
}) => {
  const isPersonal = transport === 'car' || transport === 'bike';
  let breakdown = {
    fuel: 0,
    toll: 0,
    food: 0,
    parking: 0,
    fare: 0,
    accommodation: 0,
    miscellaneous: 0,
    total: 0,
  };

  if (isPersonal) {
    const liters = distance / (mileage || 18);
    breakdown.fuel = Math.round(liters * fuelPrice);
    breakdown.toll = tollCharges || 0;
    breakdown.food = Math.round((distance / 100) * travelers * 150);
    breakdown.parking = Math.round((distance / 200) * 80);
    breakdown.miscellaneous = Math.round(
      (breakdown.fuel + breakdown.toll) * 0.1
    );
  } else {
    // Public transport or cab
    const ratesPerKm = {
      bus: 0.65,
      train: 1.3,
      flight: 4.5,
      cab: 14,
    };
    const rate = ratesPerKm[transport] || 1;
    const computedFare = farePerPerson || Math.round(distance * rate);
    breakdown.fare = Math.round(computedFare * travelers);
    breakdown.food = Math.round(travelers * 200);
    if (transport === 'train') {
      breakdown.miscellaneous = Math.round(travelers * 100); // porter, etc.
    }
    breakdown.miscellaneous += additionalCost;
  }

  breakdown.total =
    breakdown.fuel +
    breakdown.toll +
    breakdown.food +
    breakdown.parking +
    breakdown.fare +
    breakdown.accommodation +
    breakdown.miscellaneous;

  return breakdown;
};

module.exports = { calculateCosts };
