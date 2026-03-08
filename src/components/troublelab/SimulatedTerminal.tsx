import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import type { LabCommand } from "./types";

interface Props {
  commands: LabCommand[];
  onCommandRun: (command: string, cluesRevealed: string[]) => void;
}

const SimulatedTerminal = ({ commands, onCommandRun }: Props) => {
  const [history, setHistory] = useState<{ input: string; output: string }[]>([]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const supportedCommands = commands.map(c => c.command);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setCmdHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    // Find matching command
    const match = commands.find(c => {
      // exact match
      if (c.command === trimmed) return true;
      // partial match for commands with specific pod/resource names
      const cmdBase = c.command.split(" ").slice(0, 3).join(" ");
      const inputBase = trimmed.split(" ").slice(0, 3).join(" ");
      return cmdBase === inputBase;
    });

    if (match) {
      setHistory(prev => [...prev, { input: trimmed, output: match.output }]);
      onCommandRun(match.command, match.revealsClues || []);
    } else if (trimmed === "help") {
      setHistory(prev => [...prev, {
        input: trimmed,
        output: `Available commands in this lab:\n${supportedCommands.map(c => `  ${c}`).join("\n")}\n\nType any command above to investigate the cluster.`,
      }]);
    } else if (trimmed === "clear") {
      setHistory([]);
    } else {
      setHistory(prev => [...prev, {
        input: trimmed,
        output: `command not available in this lab scenario.\n\nType 'help' to see available commands.`,
      }]);
    }

    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = Math.min(historyIndex + 1, cmdHistory.length - 1);
        setHistoryIndex(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setInput(cmdHistory[newIdx]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = supportedCommands.find(c => c.startsWith(trimmed(input)));
      if (match) setInput(match);
    }
  };

  const trimmed = (s: string) => s.trim();

  return (
    <div
      className="bg-[hsl(220,25%,5%)] rounded-xl border border-border overflow-hidden flex flex-col h-full"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(220,25%,8%)] border-b border-border">
        <TerminalIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-mono">kubectl terminal</span>
        <div className="ml-auto flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3 min-h-[200px]">
        <div className="text-muted-foreground">
          Welcome to the Kubernetes Troubleshooting Lab.{"\n"}
          Type <span className="text-primary">help</span> to see available commands or start investigating.
        </div>

        {history.map((entry, i) => (
          <div key={i}>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">$</span>
              <span className="text-foreground">{entry.input}</span>
            </div>
            <pre className="text-muted-foreground whitespace-pre-wrap mt-1 leading-relaxed">{entry.output}</pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-border bg-[hsl(220,25%,6%)]">
        <span className="text-emerald-400 font-mono text-xs">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-foreground font-mono text-xs outline-none placeholder:text-muted-foreground/40"
          placeholder="kubectl get pods"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default SimulatedTerminal;
