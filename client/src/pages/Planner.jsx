import { PlannerProvider, usePlanner } from '../context/PlannerContext';
import StepIndicator from '../components/planner/StepIndicator';
import Step1Route from '../components/planner/Step1Route';
import Step2Transport from '../components/planner/Step2Transport';
import Step3Costs from '../components/planner/Step3Costs';
import Step4Places from '../components/planner/Step4Places';
import Step5Summary from '../components/planner/Step5Summary';

function PlannerContent() {
  const { currentStep, setStep } = usePlanner();

  const steps = {
    1: <Step1Route />,
    2: <Step2Transport />,
    3: <Step3Costs />,
    4: <Step4Places />,
    5: <Step5Summary />,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Page title */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold mb-2">
          Plan Your <span className="text-accent">Journey</span>
        </h1>
        <p className="text-[var(--text-muted)]">Fill in the details and we'll handle the rest</p>
      </div>

      <StepIndicator currentStep={currentStep} onStepClick={setStep} />

      {/* Card container */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-[var(--shadow-card)]">
        {steps[currentStep]}
      </div>
    </div>
  );
}

export default function Planner() {
  return (
    <PlannerProvider>
      <PlannerContent />
    </PlannerProvider>
  );
}
