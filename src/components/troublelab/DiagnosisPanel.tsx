import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import type { LabScenario, LabScore } from "./types";

interface Props {
  scenario: LabScenario;
  discoveredClueCount: number;
  commandsUsed: number;
  hintsUsed: number;
  startTime: number;
  onComplete: (score: LabScore) => void;
}

const DiagnosisPanel = ({ scenario, discoveredClueCount, commandsUsed, hintsUsed, startTime, onComplete }: Props) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === scenario.correctRootCauseIndex;
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);

    let total = 0;
    if (correct) total += 50;
    total += Math.min(discoveredClueCount * 5, 20);
    total += Math.max(0, 20 - hintsUsed * 5);
    total += Math.max(0, 10 - Math.max(0, commandsUsed - 5));

    setSubmitted(true);
    onComplete({ total: Math.min(total, 100), correctDiagnosis: correct, commandsUsed, relevantCommands: discoveredClueCount, hintsUsed, timeSeconds });
  };

  const correct = selectedOption === scenario.correctRootCauseIndex;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Root Cause Diagnosis</h3>
      <p className="text-xs text-muted-foreground">Based on your investigation, select the root cause:</p>

      <div className="space-y-2">
        {scenario.rootCauseOptions.map((option, i) => (
          <button
            key={i}
            disabled={submitted}
            onClick={() => setSelectedOption(i)}
            className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
              submitted
                ? i === scenario.correctRootCauseIndex
                  ? "bg-emerald-500/15 border-emerald-500/40 text-foreground"
                  : i === selectedOption
                  ? "bg-red-500/15 border-red-500/40 text-foreground"
                  : "bg-muted/10 border-border/30 text-muted-foreground/40"
                : selectedOption === i
                ? "bg-primary/10 border-primary/40 text-foreground"
                : "bg-card/50 border-border hover:bg-muted/30 text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              {submitted && i === scenario.correctRootCauseIndex && <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
              {submitted && i === selectedOption && i !== scenario.correctRootCauseIndex && <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
              <span>{option}</span>
            </div>
          </button>
        ))}
      </div>

      {!submitted && (
        <Button size="sm" onClick={handleSubmit} disabled={selectedOption === null} className="w-full">
          Submit Diagnosis
        </Button>
      )}

      {submitted && (
        <div className={`p-4 rounded-xl border ${correct ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
          <div className="flex items-center gap-2 mb-2">
            {correct ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-amber-400" />}
            <span className="text-sm font-semibold text-foreground">{correct ? "Correct!" : "Not quite"}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{scenario.rootCause}</p>
        </div>
      )}
    </div>
  );
};

export default DiagnosisPanel;
