import { useCallback, useMemo, useEffect, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import K8sNode from "./K8sNode";
import type { K8sNodeData } from "./K8sNode";
import type { Scenario } from "./scenarios/types";
import VisualizationControls from "./VisualizationControls";
import StepTimeline from "./StepTimeline";

const nodeTypes = { k8sNode: K8sNode };

interface ClusterVisualizationProps {
  scenario: Scenario;
}

const ClusterVisualization = ({ scenario }: ClusterVisualizationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = scenario.steps[currentStep];

  const initialNodes: Node[] = useMemo(
    () =>
      scenario.nodes.map((n) => ({
        id: n.id,
        type: "k8sNode",
        position: n.position,
        data: {
          label: n.label,
          description: n.description,
          type: n.type,
          icon: n.icon,
          active: false,
        } satisfies K8sNodeData,
        draggable: true,
      })),
    [scenario],
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      scenario.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        type: "default",
        animated: false,
        style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1.5, opacity: 0.2 },
        labelStyle: { fill: "hsl(var(--muted-foreground))", fontSize: 10, opacity: 0 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--muted-foreground))", width: 15, height: 15 },
      })),
    [scenario],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when step changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, active: step.activeNodes.includes(n.id) },
      })),
    );

    setEdges((eds) =>
      eds.map((e) => {
        const isActive = step.activeEdges.includes(e.id);
        return {
          ...e,
          animated: isActive,
          style: {
            stroke: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            strokeWidth: isActive ? 2.5 : 1.5,
            opacity: isActive ? 1 : 0.15,
          },
          labelStyle: {
            fill: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            fontSize: 10,
            fontWeight: isActive ? 600 : 400,
            opacity: isActive ? 1 : 0,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            width: 15,
            height: 15,
          },
        };
      }),
    );
  }, [currentStep, step, setNodes, setEdges]);

  // Reset when scenario changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [scenario, initialNodes, initialEdges, setNodes, setEdges]);

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= scenario.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, scenario.steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Main visualization */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex-1 rounded-xl border border-border bg-card/30 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.3}
            maxZoom={2}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground) / 0.15)" />
            <Controls className="!bg-card !border-border !shadow-lg [&_button]:!bg-card [&_button]:!border-border [&_button]:!text-foreground [&_button:hover]:!bg-accent" />
            <MiniMap
              className="!bg-card !border-border"
              nodeColor="hsl(var(--primary) / 0.3)"
              maskColor="hsl(var(--background) / 0.8)"
            />
          </ReactFlow>
        </div>

        <VisualizationControls
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

      {/* Step timeline sidebar */}
      <div className="w-full lg:w-80 bg-card/50 border border-border rounded-xl p-4">
        <h3 className="font-display font-semibold text-sm text-foreground mb-3">Step Timeline</h3>
        <StepTimeline
          steps={scenario.steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>
    </div>
  );
};

export default ClusterVisualization;
