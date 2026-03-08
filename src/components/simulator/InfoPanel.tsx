import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClusterComponent } from "./types";

const typeLabels: Record<string, string> = {
  controlplane: "Control Plane",
  node: "Worker Node",
  pod: "Pod",
  service: "Service",
  ingress: "Ingress / Gateway",
  storage: "Storage",
  user: "External",
  dns: "DNS",
  network: "Network",
};

const typeColors: Record<string, string> = {
  controlplane: "bg-blue-500/20 text-blue-400",
  node: "bg-indigo-500/20 text-indigo-400",
  pod: "bg-cyan-500/20 text-cyan-400",
  service: "bg-emerald-500/20 text-emerald-400",
  ingress: "bg-amber-500/20 text-amber-400",
  storage: "bg-orange-500/20 text-orange-400",
  user: "bg-violet-500/20 text-violet-400",
  dns: "bg-teal-500/20 text-teal-400",
  network: "bg-cyan-500/20 text-cyan-400",
};

interface Props {
  component: ClusterComponent | null;
  onClose: () => void;
}

const InfoPanel = ({ component, onClose }: Props) => {
  if (!component) return null;

  return (
    <div className="absolute top-4 right-4 w-72 bg-card/95 backdrop-blur-lg border border-border rounded-xl p-4 z-10 shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColors[component.type]}`}>
            {typeLabels[component.type]}
          </span>
          <h3 className="text-sm font-semibold text-foreground mt-2">{component.label}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{component.description}</p>
    </div>
  );
};

export default InfoPanel;
