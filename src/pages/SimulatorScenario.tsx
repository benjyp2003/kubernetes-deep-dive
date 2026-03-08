import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/Layout";
import { ArrowLeft } from "lucide-react";
import { getSimulatorScenario } from "@/components/simulator/scenarios";
import SimulatorScene from "@/components/simulator/SimulatorScene";
import SimulatorControls from "@/components/simulator/SimulatorControls";
import InfoPanel from "@/components/simulator/InfoPanel";
import type { ClusterComponent } from "@/components/simulator/types";

const SimulatorScenario = () => {
  const { scenarioId } = useParams();
  const scenario = getSimulatorScenario(scenarioId || "");

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedComponent, setSelectedComponent] = useState<ClusterComponent | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setSelectedComponent(null);
  }, [scenarioId]);

  useEffect(() => {
    if (isPlaying && scenario) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= scenario.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, scenario]);

  const handleComponentClick = useCallback((id: string) => {
    if (!scenario) return;
    const comp = scenario.components.find((c) => c.id === id);
    setSelectedComponent(comp || null);
  }, [scenario]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  if (!scenario) return <Navigate to="/simulator" replace />;

  const step = scenario.steps[currentStep];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link to="/simulator" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Simulator
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{scenario.icon}</span>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{scenario.title}</h1>
            <p className="text-sm text-muted-foreground">{scenario.subtitle}</p>
          </div>
        </div>

        {/* Main area */}
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-260px)] min-h-[500px]">
          {/* 3D Canvas */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex-1 rounded-xl border border-border bg-background/50 overflow-hidden relative">
              <SimulatorScene
                scenario={scenario}
                currentStep={currentStep}
                onComponentClick={handleComponentClick}
              />
              <InfoPanel component={selectedComponent} onClose={() => setSelectedComponent(null)} />

              {/* Packet legend */}
              <div className="absolute bottom-3 left-3 flex gap-3">
                {[
                  { color: "bg-blue-500", label: "API" },
                  { color: "bg-emerald-500", label: "Traffic" },
                  { color: "bg-orange-500", label: "Storage" },
                  { color: "bg-red-500", label: "Denied" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-card/80 backdrop-blur px-2 py-1 rounded-md border border-border">
                    <div className={`h-2 w-2 rounded-full ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            <SimulatorControls
              currentStep={currentStep}
              totalSteps={scenario.steps.length}
              isPlaying={isPlaying}
              speed={speed}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onStepForward={() => setCurrentStep((p) => Math.min(p + 1, scenario.steps.length - 1))}
              onStepBackward={() => setCurrentStep((p) => Math.max(p - 1, 0))}
              onReset={handleReset}
              onSpeedChange={setSpeed}
            />
          </div>

          {/* Step timeline */}
          <div className="w-full lg:w-80 bg-card/50 border border-border rounded-xl p-4 overflow-y-auto">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Step Timeline</h3>
            <div className="space-y-2">
              {scenario.steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    i === currentStep
                      ? "bg-primary/10 border-primary/40 shadow-sm"
                      : i < currentStep
                      ? "bg-muted/30 border-border/50 opacity-60"
                      : "bg-card/30 border-border/30 opacity-40 hover:opacity-70"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      i === currentStep ? "bg-primary text-primary-foreground" : i < currentStep ? "bg-muted-foreground/30 text-muted-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium text-foreground">{s.title}</span>
                  </div>
                  {i === currentStep && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed ml-7">{s.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimulatorScenario;
