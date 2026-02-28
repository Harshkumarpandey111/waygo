import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, MapPin, Calendar, TrendingUp, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Badge, StatCard } from '../components/ui/Card';
import { formatCurrency, transportIcons, transportNames } from '../utils/calculations';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsRes, statsRes] = await Promise.all([
        api.get('/trips?sort=-createdAt&limit=20'),
        api.get('/trips/stats'),
      ]);
      setTrips(tripsRes.data.trips);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id) => {
    if (!confirm('Delete this trip?')) return;
    setDeleting(id);
    try {
      await api.delete(`/trips/${id}`);
      setTrips((t) => t.filter((trip) => trip._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const statusColors = {
    planned: 'accent',
    ongoing: 'info',
    completed: 'success',
    cancelled: 'default',
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Your travel dashboard</p>
        </div>
        <Link to="/planner">
          <Button>
            <PlusCircle size={16} />
            Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard icon="🗺️" label="Total Trips" value={stats?.totalTrips || 0} color="accent" />
        <StatCard icon="📏" label="km Traveled" value={`${Math.round(stats?.totalDistance || 0).toLocaleString()}`} color="info" />
        <StatCard icon="💰" label="Total Spent" value={formatCurrency(stats?.totalSpent || 0)} color="success" />
        <StatCard icon="📊" label="Avg. Cost" value={formatCurrency(stats?.avgCost || 0)} color="purple" sub="per trip" />
      </div>

      {/* Trips list */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold">Recent Trips</h2>
        <span className="text-sm text-[var(--text-muted)]">{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-[var(--surface)] border border-[var(--border)] rounded-3xl">
          <div className="text-5xl mb-4">🗺️</div>
          <h3 className="font-display text-xl font-bold mb-2">No trips yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">Plan your first journey and it'll appear here.</p>
          <Link to="/planner"><Button>Plan Your First Trip</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="flex items-center gap-4 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:border-white/10 transition-all duration-200"
            >
              {/* Transport icon */}
              <div className="w-12 h-12 bg-[var(--surface2)] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {transportIcons[trip.transport]}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-display font-bold text-white text-sm">{trip.origin}</span>
                  <span className="text-[var(--text-muted)]">→</span>
                  <span className="font-display font-bold text-white text-sm">{trip.destination}</span>
                  <Badge variant={statusColors[trip.status]}>{trip.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={11} />{trip.distance} km</span>
                  <span className="flex items-center gap-1"><Calendar size={11} />{new Date(trip.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>👥 {trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Cost */}
              <div className="text-right flex-shrink-0">
                <div className="font-display text-lg font-bold text-accent">
                  {formatCurrency(trip.costBreakdown?.total || 0)}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{transportNames[trip.transport]}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/${encodeURIComponent(trip.origin)}/${encodeURIComponent(trip.destination)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--surface2)] hover:bg-orange-500/15 hover:text-accent transition-colors text-[var(--text-muted)]"
                >
                  <Navigation size={13} />
                </a>
                <button
                  onClick={() => deleteTrip(trip._id)}
                  disabled={deleting === trip._id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--surface2)] hover:bg-red-500/15 hover:text-red-400 transition-colors text-[var(--text-muted)] disabled:opacity-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
