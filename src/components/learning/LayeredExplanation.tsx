import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Layers } from "lucide-react";

interface LayeredExplanationProps {
  title: string;
  simple: ReactNode;
  technical: ReactNode;
  deep: ReactNode;
}

const layers = [
  { key: "simple", label: "Simple", color: "bg-k8s-green/10 text-k8s-green border-k8s-green/30" },
  { key: "technical", label: "Technical", color: "bg-k8s-orange/10 text-k8s-orange border-k8s-orange/30" },
  { key: "deep", label: "Deep Dive", color: "bg-k8s-red/10 text-k8s-red border-k8s-red/30" },
] as const;

const LayeredExplanation = ({ title, simple, technical, deep }: LayeredExplanationProps) => {
  const [activeLayer, setActiveLayer] = useState<"simple" | "technical" | "deep">("simple");
  const content = { simple, technical, deep };

  return (
    <div className="k8s-card">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-lg text-foreground">{title}</h3>
      </div>
      <div className="flex gap-2 mb-4">
        {layers.map((layer) => (
          <button
            key={layer.key}
            onClick={() => setActiveLayer(layer.key)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              activeLayer === layer.key ? layer.color : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayer}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-foreground/80 leading-relaxed"
        >
          {content[activeLayer]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LayeredExplanation;
