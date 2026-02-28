// @desc    Get nearby places (hotels, restaurants, petrol pumps, etc.)
// @route   GET /api/places/nearby
// @access  Public

const placesData = {
  hotels: [
    { name: 'OYO Rooms', type: 'Budget Hotel', rating: 4.1, priceRange: '₹700–₹1,500/night', category: 'Budget', icon: '🏨', features: ['Free WiFi', 'AC Room', 'TV'] },
    { name: 'FabHotels', type: 'Mid-range Hotel', rating: 4.3, priceRange: '₹1,200–₹2,500/night', category: 'Mid-range', icon: '🏩', features: ['Free WiFi', 'Breakfast', 'Parking'] },
    { name: 'Treebo Hotels', type: 'Premium Budget', rating: 4.4, priceRange: '₹1,500–₹3,000/night', category: 'Mid-range', icon: '🏪', features: ['AC', 'Hot Water', 'Room Service'] },
    { name: 'Zostel Hostel', type: 'Backpacker Hostel', rating: 4.5, priceRange: '₹350–₹700/bed', category: 'Budget', icon: '🛏️', features: ['Dorm', 'Common Kitchen', 'Lounge'] },
    { name: 'Lemon Tree Hotels', type: '3-Star Hotel', rating: 4.4, priceRange: '₹3,500–₹6,000/night', category: 'Premium', icon: '🍋', features: ['Pool', 'Restaurant', 'Gym'] },
    { name: 'Marriott / Taj', type: 'Luxury Hotel', rating: 4.8, priceRange: '₹8,000–₹25,000/night', category: 'Luxury', icon: '⭐', features: ['Spa', 'Multiple Restaurants', 'Butler Service'] },
  ],
  restaurants: [
    { name: 'Highway Punjabi Dhaba', type: 'Authentic Punjabi', rating: 4.6, priceRange: '₹100–₹300/plate', category: 'Indian', icon: '🍛', features: ['24hr', 'Parking', 'Veg & Non-Veg'] },
    { name: 'McDonald\'s', type: 'Fast Food', rating: 4.0, priceRange: '₹150–₹350', category: 'Fast Food', icon: '🍔', features: ['Drive-thru', 'AC', 'Kids Menu'] },
    { name: 'Domino\'s Pizza', type: 'Pizza Chain', rating: 4.1, priceRange: '₹200–₹600', category: 'Fast Food', icon: '🍕', features: ['Delivery', 'AC', 'Veg Options'] },
    { name: 'Local Thali House', type: 'Veg & Non-veg Thali', rating: 4.4, priceRange: '₹80–₹200/thali', category: 'Indian', icon: '🍽️', features: ['Unlimited Thali', 'Home-style'] },
    { name: 'Café Coffee Day', type: 'Coffee & Snacks', rating: 4.0, priceRange: '₹80–₹250', category: 'Cafe', icon: '☕', features: ['WiFi', 'AC', 'Light Bites'] },
    { name: 'Haldiram\'s', type: 'Sweets & Snacks', rating: 4.5, priceRange: '₹50–₹300', category: 'Snacks', icon: '🍬', features: ['Packaged Food', 'Fresh Sweets', 'Namkeen'] },
  ],
  petrol: [
    { name: 'Indian Oil (IOC)', type: 'Petrol & Diesel', rating: 4.2, priceRange: 'Petrol: ~₹96/L | Diesel: ~₹89/L', category: 'Fuel', icon: '⛽', features: ['24hr', 'Air Fill', 'Water'] },
    { name: 'BPCL (Bharat Petroleum)', type: 'Fuel Station', rating: 4.1, priceRange: 'Speed Petrol available', category: 'Fuel', icon: '🛢️', features: ['ATM', 'Convenience Store', '24hr'] },
    { name: 'HPCL (Hindustan Petroleum)', type: 'Fuel Station', rating: 4.3, priceRange: 'CNG available', category: 'Fuel', icon: '🔋', features: ['CNG', 'EV Charging', 'Toilet'] },
    { name: 'Reliance BP', type: 'Premium Fuel', rating: 4.0, priceRange: 'Power Petrol: ~₹101/L', category: 'Fuel', icon: '⚡', features: ['Premium Fuel', 'Loyalty Points', '24hr'] },
  ],
  shopping: [
    { name: 'D-Mart', type: 'Supermarket', rating: 4.3, priceRange: 'Grocery & Essentials', category: 'Grocery', icon: '🛒', features: ['Open 8AM-11PM', 'Bulk Discounts'] },
    { name: 'Big Bazaar', type: 'Department Store', rating: 4.0, priceRange: 'Clothing, Food, Electronics', category: 'General', icon: '🏬', features: ['EMI', 'Exchange Offer', 'Food Court'] },
    { name: 'Local Handicraft Market', type: 'Souvenirs', rating: 4.6, priceRange: '₹50–₹2,000', category: 'Souvenirs', icon: '🛍️', features: ['Bargaining', 'Local Art', 'Gifts'] },
    { name: 'Apollo Pharmacy', type: 'Medical Store', rating: 4.4, priceRange: 'Medicines & Healthcare', category: 'Medical', icon: '💊', features: ['24hr', 'Online Delivery', 'Lab Tests'] },
  ],
};

const getNearby = async (req, res, next) => {
  try {
    const { type = 'hotels', location = '' } = req.query;
    const data = placesData[type] || placesData.hotels;

    // Simulate Google Maps links
    const enriched = data.map((place) => ({
      ...place,
      id: Math.random().toString(36).substr(2, 9),
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' near ' + location)}`,
      distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
    }));

    res.json({ success: true, count: enriched.length, places: enriched, location });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current fuel prices
// @route   GET /api/places/fuel-prices
// @access  Public
const getFuelPrices = async (req, res, next) => {
  try {
    const prices = {
      petrol: 96.72,
      diesel: 89.62,
      cng: 79.5,
      lpg: 909.5,
      lastUpdated: new Date().toISOString(),
      note: 'Approximate prices for Punjab, India. Prices vary by city.',
    };
    res.json({ success: true, prices });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNearby, getFuelPrices };
