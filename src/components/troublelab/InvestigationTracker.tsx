import { CheckCircle, Circle, Search } from "lucide-react";
import type { LabClue } from "./types";

interface Props {
  clues: LabClue[];
  discoveredClueIds: Set<string>;
}

const InvestigationTracker = ({ clues, discoveredClueIds }: Props) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Search className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">Investigation Clues</h3>
      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
        {discoveredClueIds.size}/{clues.length}
      </span>
    </div>
    <div className="space-y-2">
      {clues.map((clue) => {
        const discovered = discoveredClueIds.has(clue.id);
        return (
          <div
            key={clue.id}
            className={`flex items-start gap-2 p-2 rounded-lg border text-xs transition-all ${
              discovered
                ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                : "bg-muted/20 border-border/50 text-muted-foreground/40"
            }`}
          >
            {discovered ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground/30 mt-0.5 shrink-0" />
            )}
            <span>{discovered ? clue.text : "???"}</span>
          </div>
        );
      })}
    </div>
  </div>
);

export default InvestigationTracker;
