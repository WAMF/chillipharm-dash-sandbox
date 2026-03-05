'use client';

const STEP_LABELS = ['Select Assets', 'Submit to QC', 'QC Review', 'Complete'];

interface WorkflowStepperProps {
    currentStep: number;
    allComplete?: boolean;
}

function CheckIcon() {
    return (
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    );
}

export function WorkflowStepper({ currentStep, allComplete = false }: WorkflowStepperProps) {
    return (
        <nav aria-label="Task progress" className="mb-8">
            <ol className="flex items-center">
                {STEP_LABELS.map((label, index) => {
                    const isCompleted = allComplete || index < currentStep;
                    const isCurrent = !allComplete && index === currentStep;
                    const isFuture = !allComplete && index > currentStep;
                    const isLast = index === STEP_LABELS.length - 1;

                    return (
                        <li
                            key={label}
                            className={`flex items-center ${isLast ? '' : 'flex-1'}`}
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                        isCompleted
                                            ? 'bg-chilli-red text-white'
                                            : isCurrent
                                              ? 'bg-chilli-red text-white ring-4 ring-chilli-red/20'
                                              : 'border-2 border-neutral-300 bg-white text-neutral-400'
                                    }`}
                                >
                                    {isCompleted ? <CheckIcon /> : index + 1}
                                </div>
                                <span
                                    className={`mt-2 text-xs whitespace-nowrap ${
                                        isCompleted
                                            ? 'font-medium text-chilli-red'
                                            : isCurrent
                                              ? 'font-semibold text-neutral-900'
                                              : 'text-neutral-400'
                                    }`}
                                >
                                    {label}
                                </span>
                            </div>
                            {!isLast && (
                                <div
                                    className={`mx-2 h-0.5 flex-1 transition-colors ${
                                        isFuture ? 'bg-neutral-200' : 'bg-chilli-red'
                                    }`}
                                    style={{ marginBottom: '1.5rem' }}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
