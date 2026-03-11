const https = require('https');
const http  = require('http');

// ─────────────────────────────────────────────────────────────
//  CACHE — re-fetch every 3 hours per state
// ─────────────────────────────────────────────────────────────
const fuelCacheMap = {}; // key = stateKey, value = { data, fetchedAt }
const CACHE_TTL    = 3 * 60 * 60 * 1000;

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 8000,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Extract price after a label in HTML
function extractPrice(html, ...labels) {
  for (const label of labels) {
    // Pattern: label text followed within ~200 chars by a price number
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = html.match(new RegExp(esc + '[^<]{0,100}<[^>]+>\\s*([\\d]{2,3}\\.[\\d]{1,2})', 'i'))
           || html.match(new RegExp(esc + '[\\s\\S]{0,300}?([\\d]{2,3}\\.[\\d]{1,2})', 'i'));
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 60 && val < 160) return val;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
//  CITY → STATE
// ─────────────────────────────────────────────────────────────
const CITY_STATE = {
  amritsar:'punjab', ludhiana:'punjab', jalandhar:'punjab', patiala:'punjab', bathinda:'punjab',
  chandigarh:'chandigarh',
  delhi:'delhi', 'new delhi':'delhi', noida:'uttar-pradesh', gurgaon:'haryana', gurugram:'haryana', faridabad:'haryana',
  mumbai:'maharashtra', pune:'maharashtra', nagpur:'maharashtra', nashik:'maharashtra', aurangabad:'maharashtra',
  bangalore:'karnataka', bengaluru:'karnataka', mysore:'karnataka', hubli:'karnataka',
  chennai:'tamil-nadu', coimbatore:'tamil-nadu', madurai:'tamil-nadu', tiruchirappalli:'tamil-nadu',
  hyderabad:'telangana', warangal:'telangana',
  ahmedabad:'gujarat', surat:'gujarat', vadodara:'gujarat', rajkot:'gujarat',
  jaipur:'rajasthan', jodhpur:'rajasthan', udaipur:'rajasthan', kota:'rajasthan', ajmer:'rajasthan',
  lucknow:'uttar-pradesh', varanasi:'uttar-pradesh', agra:'uttar-pradesh', kanpur:'uttar-pradesh', meerut:'uttar-pradesh', allahabad:'uttar-pradesh',
  bhopal:'madhya-pradesh', indore:'madhya-pradesh', gwalior:'madhya-pradesh', jabalpur:'madhya-pradesh',
  kolkata:'west-bengal',
  kochi:'kerala', thiruvananthapuram:'kerala', kozhikode:'kerala', thrissur:'kerala',
  patna:'bihar', gaya:'bihar',
  ranchi:'jharkhand', jamshedpur:'jharkhand',
  bhubaneswar:'odisha', cuttack:'odisha',
  guwahati:'assam',
  shimla:'himachal-pradesh', manali:'himachal-pradesh', dharamsala:'himachal-pradesh',
  dehradun:'uttarakhand', haridwar:'uttarakhand', rishikesh:'uttarakhand',
  ambala:'haryana', hisar:'haryana', rohtak:'haryana', karnal:'haryana', panipat:'haryana',
  srinagar:'jammu-kashmir', jammu:'jammu-kashmir',
  raipur:'chhattisgarh',
  gandhinagar:'gujarat',
};

function cityToState(city) {
  if (!city) return null;
  const key = city.toLowerCase().trim().split(/[,\s]/)[0];
  return CITY_STATE[key] || null;
}

// ─────────────────────────────────────────────────────────────
//  FALLBACK PRICES — real state-wise (IOCL / Mar 2025)
// ─────────────────────────────────────────────────────────────
const STATE_PRICES = {
  'delhi':            { petrol: 94.77,  diesel: 87.67 },
  'maharashtra':      { petrol: 104.21, diesel: 90.08 },
  'karnataka':        { petrol: 102.86, diesel: 88.94 },
  'tamil-nadu':       { petrol: 100.85, diesel: 87.40 },
  'telangana':        { petrol: 107.41, diesel: 95.65 },
  'gujarat':          { petrol: 94.22,  diesel: 89.95 },
  'rajasthan':        { petrol: 104.88, diesel: 90.36 },
  'madhya-pradesh':   { petrol: 107.23, diesel: 90.87 },
  'uttar-pradesh':    { petrol: 94.65,  diesel: 87.76 },
  'west-bengal':      { petrol: 103.94, diesel: 89.98 },
  'punjab':           { petrol: 97.36,  diesel: 88.60 },
  'haryana':          { petrol: 94.89,  diesel: 87.70 },
  'chandigarh':       { petrol: 94.24,  diesel: 82.42 },
  'himachal-pradesh': { petrol: 96.12,  diesel: 83.46 },
  'uttarakhand':      { petrol: 93.52,  diesel: 86.93 },
  'kerala':           { petrol: 107.62, diesel: 96.43 },
  'bihar':            { petrol: 107.24, diesel: 94.10 },
  'jharkhand':        { petrol: 97.22,  diesel: 94.52 },
  'odisha':           { petrol: 102.79, diesel: 94.60 },
  'assam':            { petrol: 94.38,  diesel: 81.30 },
  'chhattisgarh':     { petrol: 101.33, diesel: 94.27 },
  'jammu-kashmir':    { petrol: 96.32,  diesel: 80.07 },
};

async function fetchLivePrices(city, stateKey) {
  // Try goodreturns.in — reliable, structured HTML
  const citySlug  = city.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
  const stateSlug = stateKey;

  const urlsToTry = [
    `https://www.goodreturns.in/petrol-price-in-${citySlug}.html`,
    `https://www.goodreturns.in/fuel-price/${stateSlug}.html`,
    `https://www.mypetrolprice.com/petrol-price-in-${citySlug}.aspx`,
  ];

  for (const url of urlsToTry) {
    try {
      const html   = await fetchUrl(url);
      const petrol = extractPrice(html, 'Petrol', 'petrol price', 'Petrol Price');
      const diesel = extractPrice(html, 'Diesel', 'diesel price', 'Diesel Price');
      if (petrol && diesel && petrol > 70 && diesel > 70) {
        return { petrol, diesel, source: url };
      }
    } catch { /* try next */ }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
//  PLACES DATA
// ─────────────────────────────────────────────────────────────
const placesData = {
  hotels: [
    { name: 'OYO Rooms',              type: 'Budget Hotel',       rating: 4.1, priceRange: '₹700–₹1,500/night',    category: 'Budget',    icon: '🏨', features: ['Free WiFi', 'AC Room', 'TV'] },
    { name: 'FabHotels',              type: 'Mid-range Hotel',    rating: 4.3, priceRange: '₹1,200–₹2,500/night',  category: 'Mid-range', icon: '🏩', features: ['Free WiFi', 'Breakfast', 'Parking'] },
    { name: 'Treebo Hotels',          type: 'Premium Budget',     rating: 4.4, priceRange: '₹1,500–₹3,000/night',  category: 'Mid-range', icon: '🏪', features: ['AC', 'Hot Water', 'Room Service'] },
    { name: 'Zostel Hostel',          type: 'Backpacker Hostel',  rating: 4.5, priceRange: '₹350–₹700/bed',        category: 'Budget',    icon: '🛏️', features: ['Dorm', 'Common Kitchen', 'Lounge'] },
    { name: 'Lemon Tree Hotels',      type: '3-Star Hotel',       rating: 4.4, priceRange: '₹3,500–₹6,000/night',  category: 'Premium',   icon: '🍋', features: ['Pool', 'Restaurant', 'Gym'] },
    { name: 'Marriott / Taj',         type: 'Luxury Hotel',       rating: 4.8, priceRange: '₹8,000–₹25,000/night', category: 'Luxury',    icon: '⭐', features: ['Spa', 'Multiple Restaurants', 'Butler Service'] },
  ],
  restaurants: [
    { name: 'Highway Punjabi Dhaba',  type: 'Authentic Punjabi',  rating: 4.6, priceRange: '₹100–₹300/plate',  category: 'Indian',    icon: '🍛', features: ['24hr', 'Parking', 'Veg & Non-Veg'] },
    { name: "McDonald's",             type: 'Fast Food',          rating: 4.0, priceRange: '₹150–₹350',        category: 'Fast Food', icon: '🍔', features: ['Drive-thru', 'AC', 'Kids Menu'] },
    { name: "Domino's Pizza",         type: 'Pizza Chain',        rating: 4.1, priceRange: '₹200–₹600',        category: 'Fast Food', icon: '🍕', features: ['Delivery', 'AC', 'Veg Options'] },
    { name: 'Local Thali House',      type: 'Veg Thali',          rating: 4.4, priceRange: '₹80–₹200/thali',   category: 'Indian',    icon: '🍽️', features: ['Unlimited Thali', 'Home-style'] },
    { name: 'Café Coffee Day',        type: 'Coffee & Snacks',    rating: 4.0, priceRange: '₹80–₹250',         category: 'Cafe',      icon: '☕', features: ['WiFi', 'AC', 'Light Bites'] },
    { name: "Haldiram's",             type: 'Sweets & Snacks',    rating: 4.5, priceRange: '₹50–₹300',         category: 'Snacks',    icon: '🍬', features: ['Packaged Food', 'Fresh Sweets', 'Namkeen'] },
  ],
  petrol: [
    { name: 'Indian Oil (IOC)',            type: 'Petrol & Diesel', rating: 4.2, category: 'Fuel', icon: '⛽', features: ['24hr', 'Air Fill', 'Water'] },
    { name: 'BPCL (Bharat Petroleum)',     type: 'Fuel Station',    rating: 4.1, category: 'Fuel', icon: '🛢️', features: ['ATM', 'Convenience Store', '24hr'] },
    { name: 'HPCL (Hindustan Petroleum)',  type: 'Fuel Station',    rating: 4.3, category: 'Fuel', icon: '🔋', features: ['CNG', 'EV Charging', 'Toilet'] },
    { name: 'Reliance BP',                 type: 'Premium Fuel',    rating: 4.0, category: 'Fuel', icon: '⚡', features: ['Premium Fuel', 'Loyalty Points', '24hr'] },
  ],
  shopping: [
    { name: 'D-Mart',                      type: 'Supermarket',       rating: 4.3, priceRange: 'Grocery & Essentials',         category: 'Grocery',   icon: '🛒', features: ['Open 8AM-11PM', 'Bulk Discounts'] },
    { name: 'Big Bazaar',                  type: 'Department Store',  rating: 4.0, priceRange: 'Clothing, Food, Electronics',  category: 'General',   icon: '🏬', features: ['EMI', 'Exchange Offer', 'Food Court'] },
    { name: 'Local Handicraft Market',     type: 'Souvenirs',         rating: 4.6, priceRange: '₹50–₹2,000',                  category: 'Souvenirs', icon: '🛍️', features: ['Bargaining', 'Local Art', 'Gifts'] },
    { name: 'Apollo Pharmacy',             type: 'Medical Store',     rating: 4.4, priceRange: 'Medicines & Healthcare',       category: 'Medical',   icon: '💊', features: ['24hr', 'Online Delivery', 'Lab Tests'] },
  ],
};

// ─────────────────────────────────────────────────────────────
//  ROUTE HANDLERS
// ─────────────────────────────────────────────────────────────
const getNearby = async (req, res, next) => {
  try {
    const { type = 'hotels', location = '' } = req.query;
    const data     = placesData[type] || placesData.hotels;
    const enriched = data.map((place) => ({
      ...place,
      id: Math.random().toString(36).substr(2, 9),
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' near ' + location)}`,
      distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
    }));
    res.json({ success: true, count: enriched.length, places: enriched, location });
  } catch (error) { next(error); }
};

// GET /api/places/fuel-prices?city=Ludhiana
const getFuelPrices = async (req, res, next) => {
  try {
    const city     = (req.query.city || 'Amritsar').trim();
    const stateKey = cityToState(city) || 'punjab';
    const now      = Date.now();

    // Return cached if still fresh
    const cached = fuelCacheMap[stateKey];
    if (cached && (now - cached.fetchedAt) < CACHE_TTL) {
      return res.json({ success: true, prices: cached.data, fromCache: true });
    }

    // Try live scrape
    let priceData;
    const live = await fetchLivePrices(city, stateKey).catch(() => null);

    if (live && live.petrol && live.diesel) {
      priceData = {
        petrol:      parseFloat(live.petrol.toFixed(2)),
        diesel:      parseFloat(live.diesel.toFixed(2)),
        cng:         parseFloat((live.petrol * 0.81).toFixed(2)),
        city,
        state:       stateKey,
        lastUpdated: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        isLive:      true,
        note:        `Live prices for ${city}`,
      };
    } else {
      // Reliable state fallback
      const fb = STATE_PRICES[stateKey] || STATE_PRICES['punjab'];
      priceData = {
        petrol:      fb.petrol,
        diesel:      fb.diesel,
        cng:         parseFloat((fb.petrol * 0.81).toFixed(2)),
        city,
        state:       stateKey,
        lastUpdated: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        isLive:      false,
        note:        `State average for ${stateKey.replace(/-/g, ' ')} — updated Mar 2025`,
      };
    }

    fuelCacheMap[stateKey] = { data: priceData, fetchedAt: now };
    res.json({ success: true, prices: priceData });
  } catch (error) { next(error); }
};

module.exports = { getNearby, getFuelPrices };