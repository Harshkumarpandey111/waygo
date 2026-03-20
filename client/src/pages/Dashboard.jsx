import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, transportIcons, transportNames } from '../utils/calculations';
import api from '../api/axios';

// ── Animated number counter ──────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (!value) return;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{display.toLocaleString('en-IN')}{suffix}</span>;
}

// ── Mini animated road for empty state ───────────────────────
function EmptyRoad() {
  return (
    <div style={{ width: '100%', maxWidth: '320px', margin: '0 auto' }}>
      <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0a1a"/>
            <stop offset="100%" stopColor="#1a1035"/>
          </linearGradient>
        </defs>
        {/* Sky */}
        <rect width="320" height="180" fill="url(#skyGrad)"/>
        {/* Stars */}
        {[20,50,80,120,160,200,240,280,300].map((x,i) => (
          <circle key={i} cx={x} cy={15 + (i%3)*12} r="1" fill="white" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${1+i*0.3}s`} repeatCount="indefinite"/>
          </circle>
        ))}
        {/* Moon */}
        <circle cx="280" cy="25" r="14" fill="#fde68a" opacity="0.9"/>
        <circle cx="286" cy="21" r="11" fill="#1a1035"/>
        {/* Mountains */}
        <polygon points="0,120 60,60 120,120" fill="#0e0c20"/>
        <polygon points="80,120 150,55 220,120" fill="#130d25"/>
        <polygon points="180,120 250,65 320,120" fill="#0e0c20"/>
        {/* Ground */}
        <rect x="0" y="120" width="320" height="60" fill="#0d1f0a"/>
        {/* Road */}
        <rect x="0" y="130" width="320" height="50" fill="#1c1c2e"/>
        <rect x="0" y="130" width="320" height="1" fill="#f97316" opacity="0.3"/>
        {/* Road dashes */}
        <g style={{ animation: 'dashMove 1.2s linear infinite' }}>
          {[0,60,120,180,240,300].map((x,i) => (
            <rect key={i} x={x} y="153" width="40" height="3" rx="1.5" fill="#f97316" opacity="0.25"/>
          ))}
        </g>
        {/* Cute car */}
        <g style={{ animation: 'carSlide 4s linear infinite' }}>
          <rect x="20" y="134" width="55" height="12" rx="3" fill="#1e40af"/>
          <rect x="28" y="126" width="35" height="11" rx="4" fill="#1d4ed8"/>
          <rect x="31" y="128" width="13" height="7" rx="2" fill="#7dd3fc" opacity="0.8"/>
          <rect x="47" y="128" width="13" height="7" rx="2" fill="#7dd3fc" opacity="0.8"/>
          <circle cx="32" cy="146" r="5" fill="#111827"/>
          <circle cx="32" cy="146" r="2.5" fill="#374151"/>
          <circle cx="63" cy="146" r="5" fill="#111827"/>
          <circle cx="63" cy="146" r="2.5" fill="#374151"/>
          <circle cx="75" cy="138" r="3" fill="#fef3c7"/>
          <circle cx="75" cy="138" r="4" fill="#fef3c7" opacity="0.2"/>
        </g>
        {/* Map pin bouncing */}
        <g style={{ animation: 'pinBounce 1.5s ease-in-out infinite', transformOrigin: '160px 80px' }}>
          <circle cx="160" cy="72" r="12" fill="#f97316"/>
          <circle cx="160" cy="72" r="5" fill="white"/>
          <polygon points="160,90 153,78 167,78" fill="#f97316"/>
          {/* Shadow */}
          <ellipse cx="160" cy="95" rx="8" ry="3" fill="black" opacity="0.2">
            <animate attributeName="rx" values="8;5;8" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.2;0.1;0.2" dur="1.5s" repeatCount="indefinite"/>
          </ellipse>
        </g>
        <style>{`
          @keyframes dashMove { from { transform: translateX(0); } to { transform: translateX(-60px); } }
          @keyframes carSlide { from { transform: translateX(-100px); } to { transform: translateX(420px); } }
          @keyframes pinBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        `}</style>
      </svg>
    </div>
  );
}

// ── Stat card with animated entrance ─────────────────────────
function StatCard({ icon, label, value, prefix, suffix, color, delay, gradient }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        background: gradient || 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '2rem', fontWeight: 900, color }}>
        {visible && value > 0
          ? <AnimatedNumber value={value} prefix={prefix} suffix={suffix}/>
          : <span>{prefix}0{suffix}</span>
        }
      </div>
    </div>
  );
}

// ── Trip card ─────────────────────────────────────────────────
function TripCard({ trip, index, onDelete }) {
  const [visible, setVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const statusColors = {
    planned:   { bg: 'rgba(249,115,22,0.12)',  text: '#f97316',  border: 'rgba(249,115,22,0.3)'  },
    ongoing:   { bg: 'rgba(56,189,248,0.12)',   text: '#38bdf8',  border: 'rgba(56,189,248,0.3)'  },
    completed: { bg: 'rgba(34,197,94,0.12)',    text: '#22c55e',  border: 'rgba(34,197,94,0.3)'   },
    cancelled: { bg: 'rgba(239,68,68,0.12)',    text: '#ef4444',  border: 'rgba(239,68,68,0.3)'   },
  };
  const sc = statusColors[trip.status] || statusColors.planned;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this trip?')) return;
    setDeleting(true);
    try { await onDelete(trip._id); } catch { setDeleting(false); }
  };

  return (
    <div
      onClick={() => navigate(`/trips/${trip._id}`)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-20px)',
        transition: 'all 0.5s ease',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)';
        e.currentTarget.style.background = 'rgba(249,115,22,0.04)';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {/* Transport icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
      }}>
        {transportIcons[trip.transport] || '🚗'}
      </div>

      {/* Route info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{trip.origin}</span>
          <span style={{ color: '#f97316', fontSize: '0.8rem' }}>→</span>
          <span style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{trip.destination}</span>
          <span style={{
            padding: '2px 10px', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
          }}>
            {trip.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#6b7280', flexWrap: 'wrap' }}>
          <span>📍 {trip.distance} km</span>
          <span>📅 {new Date(trip.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>👥 {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Cost */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#f97316' }}>
          {formatCurrency(trip.costBreakdown?.total || 0)}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>
          {transportNames[trip.transport] || 'Trip'}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          width: '32px', height: '32px', borderRadius: '8px', border: 'none',
          background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', flexShrink: 0, opacity: deleting ? 0.5 : 1,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
      >
        🗑️
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    setTimeout(() => setHeaderVisible(true), 100);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, statsRes] = await Promise.all([
        api.get('/trips?sort=-createdAt&limit=20'),
        api.get('/trips/stats'),
      ]);
      setTrips(tripsRes.data.trips || []);
      setStats(statsRes.data.stats || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id) => {
    await api.delete(`/trips/${id}`);
    setTrips(prev => prev.filter(t => t._id !== id));
  };

  const statCards = [
    { icon: '🗺️', label: 'Total Trips',    value: stats.totalTrips    || 0, suffix: '',   color: '#f97316', delay: 100 },
    { icon: '📍', label: 'KM Traveled',    value: stats.totalDistance || 0, suffix: ' km', color: '#38bdf8', delay: 200 },
    { icon: '💰', label: 'Total Spent',    value: stats.totalSpent    || 0, prefix: '₹', color: '#22c55e', delay: 300 },
    { icon: '📊', label: 'Avg. Cost',      value: stats.avgCost       || 0, prefix: '₹', color: '#a78bfa', delay: 400 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050508 0%, #0a0a14 50%, #0d0818 100%)',
      fontFamily: "'DM Sans', sans-serif",
      paddingBottom: '4rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .font-display { font-family: 'Clash Display', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
        .shimmer-text {
          background: linear-gradient(90deg, #f97316, #fbbf24, #f97316);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .plan-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.875rem 1.75rem; border-radius: 0.875rem;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; font-weight: 700; font-size: 1rem;
          border: none; cursor: pointer;
          box-shadow: 0 8px 25px rgba(249,115,22,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .plan-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(249,115,22,0.5); }
        .plan-btn:active { transform: translateY(0); }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', animation: 'float 7s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', animation: 'float 9s ease-in-out infinite 2s' }}/>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* ── HEADER ── */}
        <div style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.6s ease',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {/* Animated avatar */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', fontWeight: 900, color: 'white',
                boxShadow: '0 0 20px rgba(249,115,22,0.4)',
                fontFamily: "'Clash Display', sans-serif",
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{greeting},</div>
                <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
                  {user?.name?.split(' ')[0]} <span style={{ animation: 'float 2s ease-in-out infinite', display: 'inline-block' }}>👋</span>
                </h1>
              </div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Your travel dashboard — {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
            </p>
          </div>

          <button className="plan-btn" onClick={() => navigate('/planner')}>
            <span style={{ fontSize: '1.1rem' }}>✈️</span>
            Plan New Trip
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          {statCards.map((s, i) => (
            <StatCard key={i} {...s}/>
          ))}
        </div>

        {/* ── TRIPS LIST ── */}
        <div style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>
              Recent Trips
            </h2>
            {trips.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: '#6b7280', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.08)' }}>
                {trips.length} trip{trips.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            /* Loading skeleton */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: '76px', borderRadius: '1rem',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease infinite',
                }}/>
              ))}
            </div>
          ) : trips.length === 0 ? (
            /* Empty state with cartoon */
            <div style={{
              textAlign: 'center', padding: '3rem 1.5rem',
              background: 'rgba(255,255,255,0.02)', borderRadius: '1.5rem',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}>
              <EmptyRoad/>
              <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: 'white', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                No trips yet!
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Plan your first trip and it'll show up here.
              </p>
              <button className="plan-btn" onClick={() => navigate('/planner')}>
                🚀 Plan My First Trip
              </button>
            </div>
          ) : (
            trips.map((trip, i) => (
              <TripCard key={trip._id} trip={trip} index={i} onDelete={deleteTrip}/>
            ))
          )}
        </div>

        {/* ── Quick actions ── */}
        {!loading && trips.length > 0 && (
          <div style={{
            marginTop: '2rem', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem',
          }}>
            {[
              { icon: '🚗', label: 'Plan a Car Trip',    onClick: () => navigate('/planner') },
              { icon: '🚆', label: 'Plan a Train Trip',  onClick: () => navigate('/planner') },
              { icon: '✈️', label: 'Plan a Flight Trip', onClick: () => navigate('/planner') },
            ].map((a, i) => (
              <button key={i} onClick={a.onClick}
                style={{
                  padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)', cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  fontSize: '0.9rem', fontWeight: 600,
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.background = 'rgba(249,115,22,0.06)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}