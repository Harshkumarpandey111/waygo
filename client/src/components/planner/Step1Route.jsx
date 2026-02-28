import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Users, Calendar, ArrowRight, Loader2, CheckCircle, AlertCircle, Route } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { TipBox } from '../ui/Card';

// ─── Auto distance fetcher using OpenRouteService (FREE, no credit card) ───
// Sign up at https://openrouteservice.org/dev/#/signup to get a free API key
// Free tier: 2000 requests/day — more than enough
const ORS_API_KEY = 'YOUR_ORS_API_KEY_HERE'; // 👈 Replace with your free key

async function getDistance(from, to) {
  try {
    // Step 1: Geocode both cities to get lat/lng
    const geocode = async (city) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (!data.length) throw new Error(`City not found: ${city}`);
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name };
    };

    const [fromCoords, toCoords] = await Promise.all([geocode(from), geocode(to)]);

    // Step 2: Get driving distance using OSRM (100% free, no API key needed)
    const osrmRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromCoords.lon},${fromCoords.lat};${toCoords.lon},${toCoords.lat}?overview=false`
    );
    const osrmData = await osrmRes.json();

    if (osrmData.code !== 'Ok' || !osrmData.routes?.length) {
      throw new Error('Could not calculate route');
    }

    const distanceKm = Math.round(osrmData.routes[0].distance / 1000);
    const durationMin = Math.round(osrmData.routes[0].duration / 60);

    return {
      distance: distanceKm,
      duration: durationMin,
      fromDisplay: fromCoords.display.split(',').slice(0, 2).join(',').trim(),
      toDisplay: toCoords.display.split(',').slice(0, 2).join(',').trim(),
    };
  } catch (err) {
    throw new Error(err.message || 'Failed to fetch distance');
  }
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export default function Step1Route() {
  const {
    origin, destination, distance, travelDate, returnDate, travelers,
    updateField, nextStep,
  } = usePlanner();

  const [errors, setErrors] = useState({});
  const [fetchState, setFetchState] = useState('idle'); // idle | loading | success | error
  const [fetchError, setFetchError] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const debounceRef = useRef(null);

  // Auto-fetch distance when both origin and destination are filled
  useEffect(() => {
    if (!origin.trim() || !destination.trim()) {
      setFetchState('idle');
      setRouteInfo(null);
      return;
    }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) return;

    // Debounce — wait 1.2s after user stops typing
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setFetchState('loading');
      setFetchError('');
      try {
        const result = await getDistance(origin.trim(), destination.trim());
        updateField('distance', String(result.distance));
        setRouteInfo(result);
        setFetchState('success');
        // Clear distance error if it was set
        setErrors((e) => ({ ...e, distance: undefined }));
      } catch (err) {
        setFetchState('error');
        setFetchError(err.message);
        setRouteInfo(null);
      }
    }, 1200);

    return () => clearTimeout(debounceRef.current);
  }, [origin, destination]);

  const validate = () => {
    const e = {};
    if (!origin.trim()) e.origin = 'Origin city is required';
    if (!destination.trim()) e.destination = 'Destination city is required';
    if (!distance || parseFloat(distance) <= 0) e.distance = 'Distance is required — enter city names above to auto-fetch';
    if (!travelDate) e.travelDate = 'Travel date is required';
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      e.destination = 'Origin and destination cannot be the same';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) nextStep();
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_forwards]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <MapPin size={20} className="text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold">Plan Your Route</h2>
        </div>
        <p className="text-[var(--text-muted)] text-sm ml-[52px]">
          Enter your cities — distance is fetched <strong className="text-white">automatically</strong> 🚀
        </p>
      </div>

      {/* Origin → Destination */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-4 p-5 bg-[var(--surface2)] rounded-2xl border border-[var(--border)]">
        {/* From */}
        <div className="flex-1">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> From
          </div>
          <input
            className={`w-full bg-[var(--surface)] border rounded-xl px-4 py-3 text-white text-base font-semibold outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] placeholder:font-normal
              ${errors.origin
                ? 'border-red-500 focus:border-red-500'
                : 'border-[var(--border)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]'
              }`}
            placeholder="e.g. Ludhiana"
            value={origin}
            onChange={(e) => updateField('origin', e.target.value)}
          />
          {errors.origin && <p className="text-red-400 text-xs mt-1">{errors.origin}</p>}
        </div>

        {/* Arrow */}
        <div className="flex sm:flex-col items-center justify-center gap-1 py-1 sm:pt-8">
          <div className="w-8 h-px sm:w-px sm:h-4 bg-[var(--border)]"></div>
          <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
            <ArrowRight size={16} className="text-accent" />
          </div>
          <div className="w-8 h-px sm:w-px sm:h-4 bg-[var(--border)]"></div>
        </div>

        {/* To */}
        <div className="flex-1">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-400 rounded-full inline-block"></span> To
          </div>
          <input
            className={`w-full bg-[var(--surface)] border rounded-xl px-4 py-3 text-white text-base font-semibold outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] placeholder:font-normal
              ${errors.destination
                ? 'border-red-500 focus:border-red-500'
                : 'border-[var(--border)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]'
              }`}
            placeholder="e.g. Delhi"
            value={destination}
            onChange={(e) => updateField('destination', e.target.value)}
          />
          {errors.destination && <p className="text-red-400 text-xs mt-1">{errors.destination}</p>}
        </div>
      </div>

      {/* ── Auto Distance Result Box ── */}
      <div className="mb-6">
        {fetchState === 'loading' && (
          <div className="flex items-center gap-3 p-4 bg-[var(--surface2)] border border-[var(--border)] rounded-xl">
            <Loader2 size={18} className="text-accent animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Calculating route distance...</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Fetching from live map data</p>
            </div>
          </div>
        )}

        {fetchState === 'success' && routeInfo && (
          <div className="flex items-center gap-4 p-4 bg-green-500/8 border border-green-500/25 rounded-xl">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {origin} → {destination}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-center">
                <div className="font-display text-xl font-bold text-accent">{routeInfo.distance} km</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Distance</div>
              </div>
              <div className="w-px h-8 bg-[var(--border)]"></div>
              <div className="text-center">
                <div className="font-display text-xl font-bold text-info">{formatDuration(routeInfo.duration)}</div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Drive Time</div>
              </div>
            </div>
          </div>
        )}

        {fetchState === 'error' && (
          <div className="flex items-start gap-3 p-4 bg-red-500/8 border border-red-500/25 rounded-xl">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Could not auto-detect distance</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{fetchError}. Please enter distance manually below.</p>
            </div>
          </div>
        )}

        {fetchState === 'idle' && (
          <div className="flex items-center gap-3 p-4 bg-[var(--surface2)] border border-dashed border-[var(--border)] rounded-xl">
            <Route size={16} className="text-[var(--text-muted)] flex-shrink-0" />
            <p className="text-xs text-[var(--text-muted)]">
              Enter both city names above — distance will be auto-calculated from live map data
            </p>
          </div>
        )}
      </div>

      {/* Manual distance override + other fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Distance — auto-filled but editable */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] flex items-center gap-2">
            Distance (km)
            {fetchState === 'success' && (
              <span className="text-[10px] text-green-400 font-normal normal-case tracking-normal border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded-full">
                Auto-filled ✓
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="Auto-calculated from cities above"
              min="1"
              value={distance}
              onChange={(e) => updateField('distance', e.target.value)}
              className={`w-full bg-[var(--surface2)] border rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all duration-200 placeholder:text-[var(--text-muted)]
                ${fetchState === 'success'
                  ? 'border-green-500/40 bg-green-500/5'
                  : errors.distance
                  ? 'border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]'
                }`}
            />
            {fetchState === 'loading' && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin" />
            )}
            {fetchState === 'success' && (
              <CheckCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
            )}
          </div>
          {errors.distance && <p className="text-red-400 text-xs">{errors.distance}</p>}
          <p className="text-[10px] text-[var(--text-muted)]">You can edit this if needed</p>
        </div>

        <Input
          label="Number of Travelers"
          id="travelers"
          type="number"
          placeholder="1"
          min="1"
          max="50"
          value={travelers}
          onChange={(e) => updateField('travelers', e.target.value)}
          icon={<Users size={15} />}
        />

        <Input
          label="Travel Date"
          id="travelDate"
          type="date"
          value={travelDate}
          onChange={(e) => updateField('travelDate', e.target.value)}
          error={errors.travelDate}
          icon={<Calendar size={15} />}
          min={new Date().toISOString().split('T')[0]}
        />

        <Input
          label="Return Date (optional)"
          id="returnDate"
          type="date"
          value={returnDate}
          onChange={(e) => updateField('returnDate', e.target.value)}
          icon={<Calendar size={15} />}
          min={travelDate || new Date().toISOString().split('T')[0]}
        />
      </div>

      <TipBox icon="🗺️" className="mt-6" variant="info">
        Distance is auto-fetched using <strong>real road routing</strong> (not straight-line). You can still manually edit it if needed.
      </TipBox>

      <div className="flex justify-end mt-8">
        <Button onClick={handleNext} size="lg">
          <Navigation size={17} />
          Choose Transport
        </Button>
      </div>
    </div>
  );
}