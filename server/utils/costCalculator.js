/**
 * WayGo Cost Calculator — Server Side
 * Fixed: farePerPerson double-multiplication, NaN/Infinity guard
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
  // ── Sanitize all inputs ──────────────────────────────────
  const d    = Math.max(0, parseFloat(distance)      || 0);
  const t    = Math.max(1, parseInt(travelers)        || 1);
  const m    = Math.max(1, parseFloat(mileage)        || 18);
  const fp   = Math.max(0, parseFloat(fuelPrice)      || 96);
  const toll = Math.max(0, parseFloat(tollCharges)    || 0);
  const fpp  = Math.max(0, parseFloat(farePerPerson)  || 0);
  const addl = Math.max(0, parseFloat(additionalCost) || 0);

  const isPersonal = transport === 'car' || transport === 'bike';

  let breakdown = {
    fuel:          0,
    toll:          0,
    food:          0,
    parking:       0,
    fare:          0,
    accommodation: 0,
    miscellaneous: 0,
    total:         0,
  };

  if (isPersonal) {
    // Fuel + toll are VEHICLE costs (not per person)
    const liters       = d / m;
    breakdown.fuel     = Math.round(liters * fp);
    breakdown.toll     = Math.round(toll);
    // Food IS per person
    breakdown.food     = Math.round((d / 100) * t * 150);
    breakdown.parking  = Math.round((d / 200) * 80);
    breakdown.miscellaneous = Math.round((breakdown.fuel + breakdown.toll) * 0.1);

  } else {
    // Public transport / cab
    const ratesPerKm = { bus: 0.65, train: 1.3, flight: 4.5, cab: 14 };
    const rate = ratesPerKm[transport] || 1;

    // fpp = fare PER PERSON (not total) — multiply by travelers here
    const perPerson  = fpp > 0 ? fpp : Math.round(d * rate);
    breakdown.fare   = Math.round(perPerson * t);
    breakdown.food   = Math.round(t * 200);

    if (transport === 'train') {
      breakdown.miscellaneous = Math.round(t * 100); // porter etc.
    }
    breakdown.miscellaneous += Math.round(addl);
  }

  // ── Total ────────────────────────────────────────────────
  breakdown.total =
    breakdown.fuel +
    breakdown.toll +
    breakdown.food +
    breakdown.parking +
    breakdown.fare +
    breakdown.accommodation +
    breakdown.miscellaneous;

  // ── Safety: cap at a reasonable max (₹10 lakh per trip) ──
  if (!isFinite(breakdown.total) || breakdown.total > 1000000) {
    breakdown.total = 0;
  }

  return breakdown;
};

module.exports = { calculateCosts };