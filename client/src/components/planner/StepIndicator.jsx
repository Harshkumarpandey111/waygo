import { Check } from 'lucide-react';

const steps = [
  { num: 1, label: 'Route' },
  { num: 2, label: 'Transport' },
  { num: 3, label: 'Costs' },
  { num: 4, label: 'Places' },
  { num: 5, label: 'Summary' },
];

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, i) => {
        const isDone = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <div key={step.num} className="flex items-center">
            <button
              onClick={() => isDone && onStepClick(step.num)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200
                ${isActive ? 'bg-[var(--surface2)] border border-[var(--border)]' : ''}
                ${isDone ? 'cursor-pointer hover:bg-[var(--surface2)]' : 'cursor-default'}
                ${!isActive && !isDone ? 'opacity-35' : ''}
              `}
            >
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                transition-all duration-300
                ${isActive ? 'bg-accent text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]' : ''}
                ${isDone ? 'bg-success text-white' : ''}
                ${!isActive && !isDone ? 'bg-[var(--surface3)] border border-[var(--border)] text-[var(--text-muted)]' : ''}
              `}>
                {isDone ? <Check size={12} strokeWidth={3} /> : step.num}
              </div>
              <span className={`text-sm font-medium hidden sm:block
                ${isActive ? 'text-white' : isDone ? 'text-[var(--text-muted)]' : 'text-[var(--text-subtle)]'}
              `}>
                {step.label}
              </span>
            </button>

            {i < steps.length - 1 && (
              <div className={`w-8 md:w-12 h-px transition-colors duration-300 mx-1
                ${currentStep > step.num ? 'bg-success/50' : 'bg-[var(--border)]'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}
