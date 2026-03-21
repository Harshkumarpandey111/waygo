import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

// ─────────────────────────────────────────────────────────────
//  PARTICLE CANVAS
// ─────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#f97316','#fb923c','#fbbf24','#38bdf8','#a78bfa'];
    const particles = Array.from({ length: 55 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.8 + 0.4,
      dx:    (Math.random() - 0.5) * 0.35,
      dy:    -(Math.random() * 0.55 + 0.15),
      alpha: Math.random() * 0.45 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        const hex = Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = p.color + hex;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10)               { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10)                 p.x = canvas.width  + 10;
        if (p.x > canvas.width  + 10)  p.x = -10;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  ROAD SCENE  — SVG cartoon, CSS-animated (no transform stacking)
// ─────────────────────────────────────────────────────────────
function RoadScene() {
  // Star positions computed once
  const stars = Array.from({ length: 35 }, (_, i) => ({
    cx:    20 + i * 35 + Math.sin(i * 2.3) * 12,
    cy:    8  + Math.abs(Math.sin(i * 1.1) * 38),
    r:     i % 4 === 0 ? 1.4 : 0.7,
    delay: `${(i * 0.17) % 3}s`,
    dur:   `${1.5 + (i % 5) * 0.4}s`,
  }));

  // Building windows
  const windows = [58,63,68,112,117,122,157,162,956,961,966,998,1048,1088,1093,1118,1123];

  return (
    <div className="road-scene-wrapper" style={{ height: '320px' }}>
      <svg
        viewBox="0 0 1200 320"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="sky"  x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#06060f"/>
            <stop offset="100%" stopColor="#150f2a"/>
          </linearGradient>
          <linearGradient id="road" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#1c1c2e"/>
            <stop offset="100%" stopColor="#0f0f1a"/>
          </linearGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="headlightBeam" cx="0%" cy="50%" r="100%">
            <stop offset="0%"   stopColor="#fef9c3" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#fef9c3" stopOpacity="0"/>
          </radialGradient>
          <filter id="softBlur">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
          <filter id="tinyBlur">
            <feGaussianBlur stdDeviation="1.5"/>
          </filter>
          {/* Clip so car / bike don't spill outside the scene */}
          <clipPath id="sceneClip">
            <rect x="0" y="0" width="1200" height="320"/>
          </clipPath>
        </defs>

        <g clipPath="url(#sceneClip)">

          {/* ── Sky ── */}
          <rect width="1200" height="320" fill="url(#sky)"/>

          {/* ── Stars ── */}
          {stars.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white">
              <animate attributeName="opacity"
                values="0.2;0.85;0.2"
                dur={s.dur} begin={s.delay} repeatCount="indefinite"/>
            </circle>
          ))}

          {/* ── Moon ── */}
          <circle cx="1095" cy="48" r="30" fill="#fde68a" opacity="0.92"/>
          <circle cx="1108" cy="41" r="24" fill="#150f2a"/>
          {/* moon glow */}
          <ellipse cx="1095" cy="48" rx="65" ry="65"
            fill="url(#moonGlow)" filter="url(#softBlur)"/>

          {/* ── City skyline ── */}
          <g fill="#120b24" opacity="0.85">
            <rect x="0"    y="182" width="42"  height="138"/>
            <rect x="26"   y="162" width="32"  height="158"/>
            <rect x="52"   y="152" width="52"  height="168"/>
            <rect x="96"   y="172" width="26"  height="148"/>
            <rect x="114"  y="157" width="36"  height="163"/>
            <rect x="145"  y="176" width="21"  height="144"/>
            <rect x="158"  y="166" width="29"  height="154"/>
            <rect x="895"  y="180" width="36"  height="140"/>
            <rect x="925"  y="160" width="29"  height="160"/>
            <rect x="950"  y="150" width="46"  height="170"/>
            <rect x="990"  y="170" width="23"  height="150"/>
            <rect x="1010" y="154" width="33"  height="166"/>
            <rect x="1040" y="174" width="19"  height="146"/>
            <rect x="1055" y="164" width="26"  height="156"/>
            <rect x="1082" y="182" width="31"  height="138"/>
            <rect x="1110" y="157" width="36"  height="163"/>
            <rect x="1145" y="172" width="26"  height="148"/>
            <rect x="1166" y="150" width="34"  height="170"/>
          </g>

          {/* ── Building windows ── */}
          {windows.map((x, i) => (
            <rect key={i} x={x} y={160 + (i % 3) * 13} width="5" height="5" fill="#fbbf24">
              <animate attributeName="opacity"
                values="0.15;0.65;0.15"
                dur={`${1.2 + i * 0.25}s`} repeatCount="indefinite"/>
            </rect>
          ))}

          {/* ── Mountains ── */}
          <polygon points="195,262 318,162 442,262" fill="#0e0c20" opacity="0.9"/>
          <polygon points="345,262 475,152 608,262"  fill="#130d25" opacity="0.9"/>
          <polygon points="595,262 718,172 842,262" fill="#0e0c20" opacity="0.9"/>
          <polygon points="748,262 868,157 992,262"  fill="#130d25" opacity="0.9"/>
          {/* snow caps */}
          <polygon points="318,162 308,182 328,182" fill="white" opacity="0.35"/>
          <polygon points="475,152 463,176 487,176" fill="white" opacity="0.35"/>
          <polygon points="718,172 708,194 728,194" fill="white" opacity="0.35"/>
          <polygon points="868,157 856,182 880,182" fill="white" opacity="0.35"/>

          {/* ── Trees ── */}
          {[178,208,238,918,948,978,1008].map((x, i) => (
            <g key={i}>
              <rect  x={x + 7}  y="246" width="6"  height="18" fill="#2d1b00"/>
              <polygon points={`${x},246 ${x+10},217 ${x+20},246`} fill="#0d3d1a"/>
              <polygon points={`${x+2},236 ${x+10},210 ${x+18},236`} fill="#0f4d1f"/>
            </g>
          ))}

          {/* ── Ground ── */}
          <rect x="0" y="262" width="1200" height="58" fill="#0d1f0a"/>
          <rect x="0" y="266" width="1200" height="4"  fill="#0f2a0c"/>

          {/* ── Road ── */}
          <rect x="0" y="270" width="1200" height="50" fill="url(#road)"/>
          <rect x="0" y="270" width="1200" height="1.5" fill="#f97316" opacity="0.25"/>
          <rect x="0" y="318" width="1200" height="1.5" fill="#f97316" opacity="0.25"/>

          {/* ── Road dashes ── */}
          <g style={{ animation: 'roadDash 1.5s linear infinite' }}>
            {[0,100,200,300,400,500,600,700,800,900,1000,1100,1200].map((x, i) => (
              <rect key={i} x={x} y="291" width="60" height="4" rx="2"
                fill="#f97316" opacity="0.2"/>
            ))}
          </g>

          {/* ══════════════════════════════════════
              CAR  — CSS translateX only, no rotation
              Wheels use their own transform-origin
          ══════════════════════════════════════ */}
          <g className="car-group">
            {/* Headlight cone */}
            <polygon
              points="192,284 310,276 310,290 192,292"
              fill="url(#headlightBeam)"
              filter="url(#softBlur)"
            />
            {/* Body */}
            <rect x="80"  y="284" width="112" height="23" rx="5" fill="#1e40af"/>
            {/* Roof */}
            <rect x="96"  y="269" width="76"  height="20" rx="6" fill="#1d4ed8"/>
            {/* Windows */}
            <rect x="101" y="272" width="28"  height="14" rx="3" fill="#7dd3fc" opacity="0.85"/>
            <rect x="135" y="272" width="28"  height="14" rx="3" fill="#7dd3fc" opacity="0.85"/>
            <line x1="133" y1="272" x2="133" y2="286" stroke="#1e3a8a" strokeWidth="1.5"/>
            {/* Front headlight */}
            <circle cx="193" cy="292" r="5"  fill="#fef3c7"/>
            <circle cx="193" cy="292" r="8"  fill="#fef3c7" opacity="0.25" filter="url(#tinyBlur)"/>
            {/* Tail light */}
            <rect x="82" y="286" width="8" height="7" rx="2" fill="#ef4444"/>
            <rect x="82" y="286" width="8" height="7" rx="2" fill="#ef4444"
              opacity="0.35" filter="url(#tinyBlur)"/>
            {/* Bumper */}
            <rect x="80"  y="304" width="14" height="3" rx="1.5" fill="#374151"/>
            <rect x="178" y="304" width="14" height="3" rx="1.5" fill="#374151"/>

            {/* Rear wheel */}
            <g style={{
              transformBox: 'fill-box',
              transformOrigin: '108px 307px',
              animation: 'none',
            }}>
              <circle cx="108" cy="307" r="10" fill="#111827"/>
              <circle cx="108" cy="307" r="5.5" fill="#374151"/>
              <circle cx="108" cy="307" r="2"   fill="#6b7280"/>
            </g>

            {/* Front wheel */}
            <g style={{
              transformBox: 'fill-box',
              transformOrigin: '164px 307px',
              animation: 'none',
            }}>
              <circle cx="164" cy="307" r="10" fill="#111827"/>
              <circle cx="164" cy="307" r="5.5" fill="#374151"/>
              <circle cx="164" cy="307" r="2"   fill="#6b7280"/>
            </g>
          </g>

          {/* ══════════════════════════════════════
              BIKE  — CSS animated, wheels separate
          ══════════════════════════════════════ */}
          <g className="bike-group">
            {/* Headlight */}
            <polygon points="76,288 132,285 132,291 76,294"
              fill="url(#headlightBeam)" filter="url(#tinyBlur)" opacity="0.7"/>
            {/* Frame */}
            <line x1="30"  y1="304" x2="65"  y2="288" stroke="#f97316" strokeWidth="2.5"/>
            <line x1="65"  y1="288" x2="76"  y2="304" stroke="#f97316" strokeWidth="2.5"/>
            <line x1="65"  y1="288" x2="56"  y2="304" stroke="#f97316" strokeWidth="2"/>
            <line x1="56"  y1="293" x2="76"  y2="293" stroke="#f97316" strokeWidth="1.8"/>
            {/* Fork & handlebar */}
            <line x1="65"  y1="288" x2="68"  y2="282" stroke="#9ca3af" strokeWidth="2"/>
            <line x1="68"  y1="282" x2="77"  y2="284" stroke="#9ca3af" strokeWidth="2"/>
            {/* Rider body */}
            <ellipse cx="64" cy="278" rx="6"  ry="7"   fill="#f97316"/>
            <rect    x="57"  y="280" width="14" height="10" rx="3" fill="#ea580c"/>
            {/* Helmet visor */}
            <path d="M60 275 Q64 270 68 275" stroke="#fbbf24" strokeWidth="2" fill="none"/>
            {/* Exhaust puff */}
            <circle cx="22" cy="300" r="3" fill="#9ca3af" opacity="0.3">
              <animate attributeName="r"       values="2;6;2"     dur="1.2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.3;0;0.3" dur="1.2s" repeatCount="indefinite"/>
            </circle>

            {/* Rear wheel */}
            <g style={{
              transformBox: 'fill-box',
              transformOrigin: '30px 304px',
              animation: 'none',
            }}>
              <circle cx="30" cy="304" r="10" fill="#1f2937" stroke="#374151" strokeWidth="2.5"/>
              <circle cx="30" cy="304" r="4"  fill="#f97316"/>
              <circle cx="30" cy="304" r="1.5" fill="#111"/>
            </g>

            {/* Front wheel */}
            <g style={{
              transformBox: 'fill-box',
              transformOrigin: '76px 304px',
              animation: 'none',
            }}>
              <circle cx="76" cy="304" r="10" fill="#1f2937" stroke="#374151" strokeWidth="2.5"/>
              <circle cx="76" cy="304" r="4"  fill="#f97316"/>
              <circle cx="76" cy="304" r="1.5" fill="#111"/>
            </g>
          </g>

          {/* ══════════════════════════════════════
              TRAIN  — moves right to left
          ══════════════════════════════════════ */}
          <g className="train-group" opacity="0.55">
            <rect x="0"   y="256" width="210" height="18" rx="4" fill="#1e3a5f"/>
            {[6,36,66,96,126,156,176].map((x, i) => (
              <rect key={i} x={x} y="259" width="24" height="10" rx="2"
                fill="#7dd3fc" opacity={0.5 + (i%2)*0.2}/>
            ))}
            {[25,75,125,175].map((x, i) => (
              <circle key={i} cx={x} cy="274" r="4" fill="#374151"/>
            ))}
            <circle cx="205" cy="248" r="5" fill="white" opacity="0.2">
              <animate attributeName="r"       values="3;11;3"     dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.2;0;0.2"  dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="198" cy="242" r="4" fill="white" opacity="0.15">
              <animate attributeName="r"       values="2;9;2"       dur="2.4s" begin="0.4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.15;0;0.15" dur="2.4s" begin="0.4s" repeatCount="indefinite"/>
            </circle>
          </g>

        </g>{/* end clipPath */}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────
function Counter({ target, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      let start = 0;
      const step  = target / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div className="font-display" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.25rem' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FEATURE CARD
// ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay, color }) {
  return (
    <div className="feature-card" style={{ animationDelay: delay }}>
      <div className={`feature-icon w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 ${color}`}>
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
      <div className="feature-card-glow"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  HOME PAGE
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const goTo = (path) => {
  window.scrollTo({ top: 0, behavior: "auto" });
  navigate(path);
};

  const features = [
    { icon: '🛣️', title: 'Smart Route Planning',    desc: 'Enter origin & destination — auto-fetch distance, route stops & famous places en route.',          color: 'bg-orange-500/15', delay: '0.1s' },
    { icon: '⛽', title: 'Live Fuel Prices',          desc: 'Real-time petrol, diesel & CNG prices for your city. State-wise data across 20+ Indian states.',    color: 'bg-yellow-500/15', delay: '0.2s' },
    { icon: '🚆', title: 'All Transport Modes',       desc: 'Car, bike, bus, train, flight or cab — class-wise fares, IRCTC rates, auto toll estimation.',      color: 'bg-sky-500/15',    delay: '0.3s' },
    { icon: '🍛', title: 'Food Budget Planner',       desc: 'Pick breakfast, lunch, dinner or snacks from a real Indian menu or enter custom amounts.',          color: 'bg-green-500/15',  delay: '0.4s' },
    { icon: '🏨', title: 'Nearby Places',             desc: 'Hotels, dhabas, petrol pumps and shopping along your route with Google Maps links.',                color: 'bg-purple-500/15', delay: '0.5s' },
    { icon: '💾', title: 'Save & Track Trips',        desc: 'Login to save plans, track past journeys, view total distance covered and money spent.',            color: 'bg-pink-500/15',   delay: '0.6s' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      overflowX: 'hidden',
      background: 'linear-gradient(135deg, #050508 0%, #0a0a14 50%, #0d0818 100%)',
    }}>

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }}/>

      {/* Particles */}
      <ParticleCanvas/>

      {/* Ambient orbs */}
      <div className="bg-orb-1"/>
      <div className="bg-orb-2"/>
      <div className="bg-orb-3"/>

      {/* ══════════ HERO ══════════ */}
      <section style={{ position: 'relative', zIndex: 10, paddingTop: '7rem', paddingBottom: 0, paddingInline: '1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

          {/* Badge */}
          <div className="animate-fadeUp" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', animationDelay: '0.1s' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 1.25rem', borderRadius: '9999px',
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
              color: '#fb923c', fontSize: '0.875rem', fontWeight: 500,
            }}>
              <span className="pulse-dot">
                <span className="pulse-ring"/>
                <span className="pulse-core"/>
              </span>
              🇮🇳 India's Smartest Travel Cost Planner
            </div>
          </div>

          {/* Headline */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="font-display animate-fadeUp"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', fontWeight: 900, letterSpacing: '-3px', lineHeight: 1.05, marginBottom: '1rem', animationDelay: '0.2s' }}>
              <span style={{ color: 'white' }}>Your Journey,</span><br/>
              <span className="shimmer-text">Perfectly Planned</span>
            </h1>
            <p className="animate-fadeUp" style={{ color: '#9ca3af', fontSize: '1.125rem', maxWidth: '38rem', margin: '0 auto', lineHeight: 1.7, animationDelay: '0.35s' }}>
              Real fuel prices, auto toll estimates, IRCTC fares, food budgets &amp; nearby places —
              everything a traveler needs in one beautiful app.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="animate-fadeUp" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', animationDelay: '0.5s' }}>
            <button
              onClick={() => user ? goTo('/planner') : goTo('/login')}
              className="glow-btn"
              style={{
                padding: '1rem 2.5rem', borderRadius: '1rem', color: 'white', fontWeight: 700,
                fontSize: '1.125rem', background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 8px 32px rgba(249,115,22,0.45)', border: 'none', cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🚀 Start Planning Free
            </button>

            {!user && (
              <button
                onClick={() => goTo('/register')}
                style={{
                  padding: '1rem 2.5rem', borderRadius: '1rem', fontWeight: 700,
                  fontSize: '1.125rem', background: 'transparent', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Create Account →
              </button>
            )}
            {user && (
              <button
                onClick={() => goTo('/dashboard')}
                style={{
                  padding: '1rem 2.5rem', borderRadius: '1rem', fontWeight: 700,
                  fontSize: '1.125rem', background: 'transparent', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.background = 'rgba(249,115,22,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'transparent'; }}
              >
                My Trips →
              </button>
            )}
          </div>

          {/* Trust tags */}
          <div className="animate-fadeUp" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontSize: '0.875rem', color: '#6b7280', animationDelay: '0.6s' }}>
            {['⚡ Instant calculations','🆓 Always free','📍 20+ Indian states'].map((b, i) => (
              <span key={i}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ROAD SCENE ══════════ */}
      <div className="animate-fadeIn" style={{ position: 'relative', zIndex: 10, marginTop: '2.5rem', animationDelay: '0.7s' }}>
        <RoadScene/>
      </div>

      {/* ══════════ STATS BAR ══════════ */}
      <div className="stats-bar" style={{ position: 'relative', zIndex: 10, padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
          <Counter target={50000} suffix="+" label="Trips Planned"/>
          <Counter target={20}    suffix="+" label="Indian States"/>
          <Counter target={6}     suffix=""  label="Transport Modes"/>
          <Counter target={99}    suffix="%" label="Cost Accuracy"/>
        </div>
      </div>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section style={{ position: 'relative', zIndex: 10, padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: '#f97316', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Simple Process</p>
            <h2 className="font-display" style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', letterSpacing: '-1px' }}>
              Plan in 3 Simple Steps
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {[
              { num: '01', icon: '📍', title: 'Enter Your Route',        desc: 'Type origin & destination. Distance auto-fetched via maps API.' },
              { num: '02', icon: '🚗', title: 'Choose Transport',         desc: 'Select car, bike, train, bus, flight or cab with class.' },
              { num: '03', icon: '💰', title: 'Get Full Cost Breakdown',  desc: 'See fuel, fare, food, toll — calculated instantly.' },
            ].map((step, i) => (
              <div key={i} className="step-card animate-fadeUp" style={{ animationDelay: `${0.1 + i * 0.15}s` }}>
                <div className="step-icon-wrap">{step.icon}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f97316', marginBottom: '0.5rem', letterSpacing: '0.15em' }}>{step.num}</div>
                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section style={{ position: 'relative', zIndex: 10, padding: '2rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: '#f97316', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>Everything Included</p>
            <h2 className="font-display" style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', letterSpacing: '-1px' }}>
              Built for Indian Travelers
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => <FeatureCard key={i} {...f}/>)}
          </div>
        </div>
      </section>

      {/* ══════════ TRANSPORT TILES ══════════ */}
      <section style={{ position: 'relative', zIndex: 10, padding: '2rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="font-display" style={{ fontSize: '1.875rem', fontWeight: 700, color: 'white', letterSpacing: '-1px', marginBottom: '0.75rem' }}>
              Every Way You Travel
            </h2>
            <p style={{ color: '#6b7280' }}>Detailed cost calculator for all 6 transport modes</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
            {[
              { icon: '🚗', name: 'Car',    color: '#f97316' },
              { icon: '🏍️', name: 'Bike',   color: '#fbbf24' },
              { icon: '🚌', name: 'Bus',    color: '#22c55e' },
              { icon: '🚆', name: 'Train',  color: '#38bdf8' },
              { icon: '✈️', name: 'Flight', color: '#a78bfa' },
              { icon: '🚕', name: 'Cab',    color: '#f43f5e' },
            ].map((t, i) => (
              <div key={i} className="transport-tile" onClick={() => goTo('/planner')}>
                <span className="transport-tile-icon">{t.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: t.color }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section style={{ position: 'relative', zIndex: 10, padding: '2rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <div className="cta-banner">
            <div className="cta-orb-1"/>
            <div className="cta-orb-2"/>
            <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🗺️</div>
            <h2 className="font-display" style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', letterSpacing: '-1px', marginBottom: '1rem' }}>
              Ready to Hit the Road?
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#9ca3af', marginBottom: '2rem' }}>
              Plan your next Indian adventure in under 2 minutes — for free.
            </p>
            <button
              onClick={() => user ? goTo('/planner') : goTo('/login')}
              style={{
                padding: '1.2rem 3rem', borderRadius: '1rem', color: 'white', fontWeight: 700,
                fontSize: '1.2rem', background: 'linear-gradient(135deg, #f97316, #dc2626)',
                boxShadow: '0 12px 40px rgba(249,115,22,0.5)', border: 'none', cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🚀 Plan My Trip Now
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#4b5563' }}>
              No credit card                   · 100% free
            </p>
          </div>
        </div>
      </section>

      
    </div>
  );
}