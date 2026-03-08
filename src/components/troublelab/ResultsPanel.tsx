import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Clock, Terminal, Lightbulb, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LabScenario, LabScore } from "./types";

interface Props {
  scenario: LabScenario;
  score: LabScore;
  onRetry: () => void;
}

const ResultsPanel = ({ scenario, score, onRetry }: Props) => (
  <div className="space-y-6">
    {/* Score card */}
    <div className="text-center p-6 rounded-xl border border-border bg-card/50">
      <Trophy className={`h-8 w-8 mx-auto mb-2 ${score.total >= 80 ? "text-amber-400" : score.total >= 50 ? "text-muted-foreground" : "text-red-400"}`} />
      <div className="text-4xl font-display font-bold text-foreground">{score.total}<span className="text-lg text-muted-foreground">/100</span></div>
      <p className="text-xs text-muted-foreground mt-1">
        {score.total >= 90 ? "Excellent diagnosis!" : score.total >= 70 ? "Good work!" : score.total >= 50 ? "Room for improvement" : "Keep practicing"}
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-2">
      {[
        { icon: Terminal, label: "Commands", value: score.commandsUsed },
        { icon: Lightbulb, label: "Hints", value: score.hintsUsed },
        { icon: Clock, label: "Time", value: `${Math.floor(score.timeSeconds / 60)}m${score.timeSeconds % 60}s` },
      ].map(({ icon: Icon, label, value }) => (
        <div key={label} className="text-center p-2 rounded-lg bg-muted/20 border border-border/50">
          <Icon className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
          <div className="text-sm font-semibold text-foreground">{value}</div>
          <div className="text-[10px] text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>

    {/* Explanation */}
    <div className="space-y-3">
      <div className="p-3 rounded-lg border border-border bg-card/30">
        <h4 className="text-xs font-semibold text-foreground mb-1">🔍 Root Cause</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{scenario.rootCause}</p>
      </div>
      <div className="p-3 rounded-lg border border-border bg-card/30">
        <h4 className="text-xs font-semibold text-foreground mb-1">🔧 Fix</h4>
        <pre className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">{scenario.fix}</pre>
      </div>
      <div className="p-3 rounded-lg border border-border bg-card/30">
        <h4 className="text-xs font-semibold text-foreground mb-1">📖 Why It Happened</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{scenario.explanation}</p>
      </div>
      <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
        <h4 className="text-xs font-semibold text-foreground mb-1">💡 Prevention Tip</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{scenario.preventionTip}</p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={onRetry} className="flex-1">
        Retry Lab
      </Button>
      <Button size="sm" asChild className="flex-1">
        <Link to={scenario.relatedPage}>
          <BookOpen className="h-3.5 w-3.5 mr-1" /> Learn More <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  </div>
);

export default ResultsPanel;
