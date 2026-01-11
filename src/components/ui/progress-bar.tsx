
'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = totalSteps > 0 ? (currentStep / (totalSteps -1)) * 100 : 0;

  return (
    <div className="w-full">
        <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-primary">Onboarding Progress</span>
            <span className="text-sm font-medium text-primary">{Math.min(currentStep + 1, totalSteps)} / {totalSteps}</span>
        </div>
      <div className="w-full bg-secondary rounded-full h-2.5">
        <div
          className={cn(
            'bg-primary h-2.5 rounded-full transition-all duration-500 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
