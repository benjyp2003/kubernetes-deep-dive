import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Props {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (s: number) => void;
}

const SimulatorControls = ({
  currentStep, totalSteps, isPlaying, speed,
  onPlay, onPause, onStepForward, onStepBackward, onReset, onSpeedChange,
}: Props) => (
  <div className="flex items-center gap-2 bg-card/90 backdrop-blur border border-border rounded-xl px-4 py-2.5">
    <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8">
      <RotateCcw className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={onStepBackward} disabled={currentStep <= 0} className="h-8 w-8">
      <SkipBack className="h-4 w-4" />
    </Button>
    <Button variant="default" size="icon" onClick={isPlaying ? onPause : onPlay} className="h-9 w-9">
      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
    </Button>
    <Button variant="ghost" size="icon" onClick={onStepForward} disabled={currentStep >= totalSteps - 1} className="h-8 w-8">
      <SkipForward className="h-4 w-4" />
    </Button>
    <div className="h-5 w-px bg-border mx-1" />
    <span className="text-xs text-muted-foreground font-mono min-w-[56px]">
      {currentStep + 1}/{totalSteps}
    </span>
    <div className="h-5 w-px bg-border mx-1" />
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Speed</span>
      <Slider value={[speed]} onValueChange={([v]) => onSpeedChange(v)} min={0.5} max={3} step={0.5} className="w-16" />
      <span className="text-xs text-muted-foreground font-mono w-6">{speed}x</span>
    </div>
  </div>
);

export default SimulatorControls;
