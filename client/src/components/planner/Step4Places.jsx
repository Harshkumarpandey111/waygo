import { useState, useEffect } from 'react';
import { Map, ExternalLink, Star } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import Button from '../ui/Button';
import { TipBox } from '../ui/Card';
import api from '../../api/axios';

const TABS = [
  { id: 'hotels', icon: '🏨', label: 'Hotels' },
  { id: 'restaurants', icon: '🍽️', label: 'Restaurants' },
  { id: 'petrol', icon: '⛽', label: 'Fuel Stations' },
  { id: 'shopping', icon: '🛍️', label: 'Shopping' },
];

export default function Step4Places() {
  const { destination, nextStep, prevStep } = usePlanner();
  const [activeTab, setActiveTab] = useState('hotels');
  const [places, setPlaces] = useState({});
  const [loading, setLoading] = useState({});

  const fetchPlaces = async (type) => {
    if (places[type]) return;
    setLoading((l) => ({ ...l, [type]: true }));
    try {
      const { data } = await api.get(`/places/nearby?type=${type}&location=${encodeURIComponent(destination)}`);
      setPlaces((p) => ({ ...p, [type]: data.places }));
    } catch {
      setPlaces((p) => ({ ...p, [type]: [] }));
    } finally {
      setLoading((l) => ({ ...l, [type]: false }));
    }
  };

  useEffect(() => { fetchPlaces('hotels'); }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchPlaces(tab);
  };

  const openInMaps = (placeName) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(placeName + ' near ' + destination)}`, '_blank');
  };

  const renderPlaces = () => {
    if (loading[activeTab]) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl shimmer" />
          ))}
        </div>
      );
    }
    const list = places[activeTab] || [];
    if (!list.length) return <p className="text-[var(--text-muted)] text-center py-12">No data available</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map((place) => (
          <button
            key={place.id}
            onClick={() => openInMaps(place.name)}
            className="p-5 text-left bg-[var(--surface2)] border border-[var(--border)] rounded-2xl hover:border-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-white text-sm flex items-center gap-2">
                  <span className="text-xl">{place.icon}</span>
                  {place.name}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5 uppercase tracking-wide">{place.type}</div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-bold text-accent flex-shrink-0">
                <Star size={10} fill="currentColor" /> {place.rating}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">💰 {place.priceRange}</span>
              <ExternalLink size={13} className="text-[var(--text-subtle)] group-hover:text-accent transition-colors" />
            </div>
            {place.features?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {place.features.slice(0, 3).map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-full text-[var(--text-muted)]">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_forwards]">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Map size={20} className="text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold">Discover Along the Way</h2>
        </div>
        <p className="text-[var(--text-muted)] text-sm ml-[52px]">Hotels, restaurants, fuel stations near <strong className="text-white">{destination}</strong></p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--surface2)] rounded-xl mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-[var(--surface)] text-white border border-[var(--border)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-white'}`}
          >
            <span className="hidden sm:inline">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {renderPlaces()}

      <TipBox icon="🔍" className="mt-6" variant="info">
        Tap any card to search for it on Google Maps near <strong>{destination}</strong>. Results are real-time from Google Maps.
      </TipBox>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={prevStep}>← Back</Button>
        <Button onClick={nextStep} size="lg">View Summary →</Button>
      </div>
    </div>
  );
}
