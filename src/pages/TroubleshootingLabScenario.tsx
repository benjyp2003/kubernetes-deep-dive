import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import { ArrowLeft, Lightbulb, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLabScenario } from "@/components/troublelab/scenarios";
import SimulatedTerminal from "@/components/troublelab/SimulatedTerminal";
import InvestigationTracker from "@/components/troublelab/InvestigationTracker";
import DiagnosisPanel from "@/components/troublelab/DiagnosisPanel";
import ResultsPanel from "@/components/troublelab/ResultsPanel";
import type { DifficultyMode, LabScore } from "@/components/troublelab/types";

const TroubleshootingLabScenario = () => {
  const { scenarioId } = useParams();
  const scenario = getLabScenario(scenarioId || "");

  const [discoveredClues, setDiscoveredClues] = useState<Set<string>>(new Set());
  const [commandsUsed, setCommandsUsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [mode, setMode] = useState<DifficultyMode>("guided");
  const [score, setScore] = useState<LabScore | null>(null);
  const startTimeRef = useRef(Date.now());

  const handleCommandRun = useCallback((command: string, cluesRevealed: string[]) => {
    setCommandsUsed(prev => prev + 1);
    if (cluesRevealed.length > 0) {
      setDiscoveredClues(prev => {
        const next = new Set(prev);
        cluesRevealed.forEach(c => next.add(c));
        return next;
      });
    }
  }, []);

  const handleHint = useCallback(() => {
    if (!scenario) return;
    const idx = Math.min(hintsUsed, scenario.hints.length - 1);
    setCurrentHint(scenario.hints[idx]);
    setHintsUsed(prev => prev + 1);
    setTimeout(() => setCurrentHint(null), 8000);
  }, [scenario, hintsUsed]);

  const handleRetry = useCallback(() => {
    setDiscoveredClues(new Set());
    setCommandsUsed(0);
    setHintsUsed(0);
    setCurrentHint(null);
    setScore(null);
    startTimeRef.current = Date.now();
  }, []);

  if (!scenario) return <Navigate to="/troubleshooting-lab" replace />;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/troubleshooting-lab" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Labs
          </Link>
          <div className="flex gap-1">
            {(["guided", "investigation", "exam"] as DifficultyMode[]).map(m => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "default" : "ghost"}
                onClick={() => setMode(m)}
                className="text-xs capitalize h-7"
              >
                {m}
              </Button>
            ))}
          </div>
        </div>

        {/* Problem description */}
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h1 className="text-lg font-display font-bold text-foreground mb-1">{scenario.icon} {scenario.title}</h1>
            <p className="text-sm text-muted-foreground mb-2">{scenario.problemDescription}</p>
            <pre className="text-xs text-muted-foreground/70 font-mono whitespace-pre-wrap">{scenario.environmentContext}</pre>
          </div>
        </div>

        {/* Hint toast */}
        {currentHint && mode !== "exam" && (
          <div className="mb-4 p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-2 animate-fade-in">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground">{currentHint}</p>
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: "500px" }}>
          {/* Terminal */}
          <div className="flex-1 flex flex-col">
            <SimulatedTerminal commands={scenario.commands} onCommandRun={handleCommandRun} />
          </div>

          {/* Right panel */}
          <div className="w-full lg:w-80 space-y-4 overflow-y-auto">
            {/* Hint button */}
            {mode === "guided" && !score && (
              <Button size="sm" variant="outline" onClick={handleHint} className="w-full text-xs">
                <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                Get Hint ({hintsUsed}/{scenario.hints.length} used)
              </Button>
            )}

            {/* Investigation clues */}
            {mode !== "exam" && (
              <div className="p-4 rounded-xl border border-border bg-card/50">
                <InvestigationTracker clues={scenario.clues} discoveredClueIds={discoveredClues} />
              </div>
            )}

            {/* Diagnosis or Results */}
            <div className="p-4 rounded-xl border border-border bg-card/50">
              {score ? (
                <ResultsPanel scenario={scenario} score={score} onRetry={handleRetry} />
              ) : (
                <DiagnosisPanel
                  scenario={scenario}
                  discoveredClueCount={discoveredClues.size}
                  commandsUsed={commandsUsed}
                  hintsUsed={hintsUsed}
                  startTime={startTimeRef.current}
                  onComplete={setScore}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TroubleshootingLabScenario;
