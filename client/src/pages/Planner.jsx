import { useEffect, useState } from 'react';
import { PlannerProvider, usePlanner } from '../context/PlannerContext';
import Step1Route     from '../components/planner/Step1Route';
import Step2Transport from '../components/planner/Step2Transport';
import Step3Costs     from '../components/planner/Step3Costs';
import Step4Places    from '../components/planner/Step4Places';
import Step5Summary   from '../components/planner/Step5Summary';

// ── Animated step indicator ───────────────────────────────────
function StepIndicator() {
  const { currentStep } = usePlanner();

  const steps = [
    { num: 1, label: 'Route',     icon: '📍' },
    { num: 2, label: 'Transport', icon: '🚗' },
    { num: 3, label: 'Costs',     icon: '💰' },
    { num: 4, label: 'Places',    icon: '🏨' },
    { num: 5, label: 'Summary',   icon: '🗺️' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '0 1rem', overflowX: 'auto' }}>
      {steps.map((step, i) => (
        <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
          {/* Step */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
            padding: '0.5rem 0.75rem', borderRadius: '0.75rem', cursor: 'default',
            transition: 'all 0.3s ease',
            background: currentStep === step.num ? 'rgba(249,115,22,0.12)' : 'transparent',
          }}>
            {/* Circle */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: currentStep === step.num ? '1rem' : '0.85rem',
              fontWeight: 700,
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              background: currentStep > step.num
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : currentStep === step.num
                  ? 'linear-gradient(135deg, #f97316, #ea580c)'
                  : 'rgba(255,255,255,0.06)',
              border: currentStep === step.num
                ? '2px solid rgba(249,115,22,0.5)'
                : currentStep > step.num
                  ? '2px solid rgba(34,197,94,0.5)'
                  : '2px solid rgba(255,255,255,0.1)',
              boxShadow: currentStep === step.num
                ? '0 0 20px rgba(249,115,22,0.4)'
                : currentStep > step.num
                  ? '0 0 12px rgba(34,197,94,0.3)'
                  : 'none',
              color: 'white',
              transform: currentStep === step.num ? 'scale(1.1)' : 'scale(1)',
            }}>
              {currentStep > step.num ? '✓' : step.icon}
            </div>
            {/* Label */}
            <span style={{
              fontSize: '0.65rem', fontWeight: 600,
              color: currentStep === step.num ? '#f97316' : currentStep > step.num ? '#22c55e' : '#6b7280',
              transition: 'color 0.3s',
              whiteSpace: 'nowrap',
            }}>
              {step.label}
            </span>
          </div>

          {/* Connector */}
          {i < steps.length - 1 && (
            <div style={{
              width: '30px', height: '2px', margin: '0 0 18px 0', flexShrink: 0,
              background: currentStep > step.num
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : 'rgba(255,255,255,0.08)',
              transition: 'background 0.5s ease',
              borderRadius: '1px',
            }}/>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step content renderer ─────────────────────────────────────
function StepContent() {
  const { currentStep } = usePlanner();
  const [prevStep, setPrevStep] = useState(currentStep);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (currentStep !== prevStep) {
      setVisible(false);
      setTimeout(() => {
        setPrevStep(currentStep);
        setVisible(true);
      }, 200);
    }
  }, [currentStep]);

  const components = {
    1: Step1Route,
    2: Step2Transport,
    3: Step3Costs,
    4: Step4Places,
    5: Step5Summary,
  };
  const ActiveStep = components[prevStep] || Step1Route;

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.25s ease',
    }}>
      <ActiveStep/>
    </div>
  );
}

// ── Animated floating icons background ───────────────────────
function FloatingIcons() {
  const icons = ['🚗','🚆','✈️','🏍️','🚌','🚕','📍','🗺️','⛽','🏨'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {icons.map((icon, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${5 + (i * 9.5) % 90}%`,
          top: `${10 + (i * 7.3) % 80}%`,
          fontSize: `${0.8 + (i % 3) * 0.3}rem`,
          opacity: 0.04,
          animation: `floatIcon ${4 + i * 0.7}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }}>
          {icon}
        </div>
      ))}
    </div>
  );
}

// ── Inner planner (needs context) ────────────────────────────
function PlannerInner() {
  const { currentStep } = usePlanner();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const stepTitles = {
    1: { title: 'Plan Your Route',       sub: 'Where are you headed today?' },
    2: { title: 'Choose Transport',      sub: 'How are you getting there?' },
    3: { title: 'Cost Breakdown',        sub: 'Here\'s what to budget for' },
    4: { title: 'Discover Places',       sub: 'Hotels, food & fuel along the way' },
    5: { title: 'Your Journey Plan',     sub: 'Review & launch navigation' },
  };
  const current = stepTitles[currentStep];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050508 0%, #0a0a14 50%, #0d0818 100%)',
      fontFamily: "'DM Sans', sans-serif",
      paddingBottom: '4rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatIcon { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-15px) rotate(5deg)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes progressFill { from{width:0} to{width:var(--target-width)} }
        .planner-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1.5rem;
          padding: 2.5rem;
          backdrop-filter: blur(10px);
        }
        @media (max-width: 640px) {
          .planner-card { padding: 1.5rem; }
        }
      `}</style>

      <FloatingIcons/>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite 3s' }}/>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.6s ease',
          textAlign: 'center', marginBottom: '2rem',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 1rem', borderRadius: '9999px', marginBottom: '1rem',
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
            fontSize: '0.78rem', fontWeight: 600, color: '#fb923c',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', display: 'inline-block', boxShadow: '0 0 0 3px rgba(249,115,22,0.3)' }}/>
            Step {currentStep} of 5
          </div>

          <h1 style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
            fontWeight: 900, letterSpacing: '-1px',
            color: 'white', marginBottom: '0.5rem',
            transition: 'all 0.3s ease',
          }}>
            {current.title}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {current.sub}
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div style={{
          height: '3px', background: 'rgba(255,255,255,0.06)',
          borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            background: 'linear-gradient(90deg, #f97316, #fbbf24)',
            width: `${(currentStep / 5) * 100}%`,
            transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 0 8px rgba(249,115,22,0.6)',
          }}/>
        </div>

        {/* ── Step indicator ── */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s',
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '1rem',
          padding: '0.75rem',
        }}>
          <StepIndicator/>
        </div>

        {/* ── Main content card ── */}
        <div className="planner-card" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.3s',
        }}>
          <StepContent/>
        </div>

        {/* ── Bottom tip ── */}
        {currentStep === 1 && (
          <div style={{
            marginTop: '1.5rem', padding: '1rem 1.25rem',
            background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
            opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 0.5s',
          }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              <strong style={{ color: '#38bdf8' }}>Pro tip:</strong> Check Google Maps for distance before filling in. You can also use our auto-fetch feature!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export (wraps with PlannerProvider) ─────────────────
export default function Planner() {
  return (
    <PlannerProvider>
      <PlannerInner/>
    </PlannerProvider>
  );
}