import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type K8sNodeType = "user" | "controlplane" | "worker" | "pod" | "service" | "controller" | "storage" | "network" | "security";

export interface K8sNodeData {
  label: string;
  description?: string;
  type: K8sNodeType;
  active?: boolean;
  icon?: string;
}

const typeStyles: Record<K8sNodeType, { bg: string; border: string; icon: string; shape: string }> = {
  user: { bg: "bg-muted/80", border: "border-muted-foreground/40", icon: "👤", shape: "rounded-xl" },
  controlplane: { bg: "bg-primary/15", border: "border-primary/50", icon: "🎛️", shape: "rounded-xl" },
  worker: { bg: "bg-accent/30", border: "border-accent-foreground/30", icon: "🖥️", shape: "rounded-xl" },
  pod: { bg: "bg-[hsl(var(--k8s-teal))]/15", border: "border-[hsl(var(--k8s-teal))]/50", icon: "🫛", shape: "rounded-full" },
  service: { bg: "bg-[hsl(var(--k8s-purple))]/15", border: "border-[hsl(var(--k8s-purple))]/50", icon: "🔀", shape: "rounded-xl" },
  controller: { bg: "bg-[hsl(var(--k8s-amber))]/15", border: "border-[hsl(var(--k8s-amber))]/50", icon: "⚙️", shape: "rotate-45 rounded-lg" },
  storage: { bg: "bg-[hsl(var(--k8s-amber))]/15", border: "border-[hsl(var(--k8s-amber))]/50", icon: "💾", shape: "rounded-xl" },
  network: { bg: "bg-[hsl(var(--k8s-cyan))]/15", border: "border-[hsl(var(--k8s-cyan))]/50", icon: "🌐", shape: "rounded-xl" },
  security: { bg: "bg-destructive/15", border: "border-destructive/50", icon: "🛡️", shape: "rounded-xl" },
};

const activeGlow: Record<K8sNodeType, string> = {
  user: "shadow-[0_0_20px_hsl(var(--muted-foreground)/0.3)]",
  controlplane: "shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
  worker: "shadow-[0_0_20px_hsl(var(--accent-foreground)/0.3)]",
  pod: "shadow-[0_0_20px_hsl(var(--k8s-teal)/0.4)]",
  service: "shadow-[0_0_20px_hsl(var(--k8s-purple)/0.4)]",
  controller: "shadow-[0_0_20px_hsl(var(--k8s-amber)/0.4)]",
  storage: "shadow-[0_0_20px_hsl(var(--k8s-amber)/0.4)]",
  network: "shadow-[0_0_20px_hsl(var(--k8s-cyan)/0.4)]",
  security: "shadow-[0_0_20px_hsl(var(--destructive)/0.4)]",
};

function K8sNode({ data }: NodeProps) {
  const nodeData = data as unknown as K8sNodeData;
  const style = typeStyles[nodeData.type];
  const isActive = nodeData.active;
  const isController = nodeData.type === "controller";

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="!bg-primary/50 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary/50 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} className="!bg-primary/50 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-primary/50 !w-2 !h-2 !border-0" />

      <div className={cn(
        "px-4 py-3 border-2 backdrop-blur-sm transition-all duration-500 min-w-[120px] text-center",
        style.bg, style.border,
        isController ? "rounded-xl" : style.shape,
        isActive && activeGlow[nodeData.type],
        isActive ? "scale-110 border-opacity-100" : "opacity-60 scale-100",
      )}>
        <div className="text-lg mb-1">{nodeData.icon || style.icon}</div>
        <div className="font-display font-semibold text-xs text-foreground whitespace-nowrap">{nodeData.label}</div>
      </div>

      {nodeData.description && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 bg-popover border border-border rounded-lg p-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-lg">
          {nodeData.description}
        </div>
      )}
    </div>
  );
}

export default memo(K8sNode);
