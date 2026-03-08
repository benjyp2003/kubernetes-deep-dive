import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
}

interface StepTimelineProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

const StepTimeline = ({ steps, currentStep, onStepClick }: StepTimelineProps) => (
  <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
    {steps.map((step, i) => (
      <button
        key={i}
        onClick={() => onStepClick(i)}
        className={cn(
          "w-full text-left flex gap-3 items-start p-3 rounded-lg transition-all duration-300 border",
          i === currentStep
            ? "bg-primary/10 border-primary/30"
            : i < currentStep
              ? "bg-card/50 border-border/50 opacity-70"
              : "bg-transparent border-transparent opacity-40 hover:opacity-60",
        )}
      >
        <div className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5 transition-colors",
          i === currentStep ? "bg-primary text-primary-foreground" :
          i < currentStep ? "bg-muted text-muted-foreground" : "bg-muted/50 text-muted-foreground/50",
        )}>
          {i + 1}
        </div>
        <div>
          <p className={cn("font-display font-semibold text-sm", i === currentStep ? "text-foreground" : "text-muted-foreground")}>
            {step.title}
          </p>
          {i === currentStep && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
          )}
        </div>
      </button>
    ))}
  </div>
);

export default StepTimeline;
