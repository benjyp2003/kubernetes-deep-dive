import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ArchitectureNodeProps {
  label: string;
  description: string;
  color?: string;
  children?: ReactNode;
}

const ArchitectureNode = ({ label, description, color = "primary" }: ArchitectureNodeProps) => (
  <div className="flex flex-col items-center text-center p-3">
    <div className={`rounded-xl border-2 border-primary/30 bg-primary/5 p-4 w-full hover:border-primary/60 transition-colors`}>
      <p className="font-display font-semibold text-sm text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  </div>
);

interface ArchitectureDiagramProps {
  title: string;
  controlPlane: { label: string; description: string }[];
  workerNode: { label: string; description: string }[];
}

const ArchitectureDiagram = ({ title, controlPlane, workerNode }: ArchitectureDiagramProps) => (
  <div className="k8s-card">
    <h3 className="font-display font-semibold text-lg text-foreground mb-6">{title}</h3>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h4 className="font-display font-semibold text-sm text-primary mb-4 text-center">Control Plane</h4>
        <div className="grid grid-cols-2 gap-2">
          {controlPlane.map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <ArchitectureNode {...node} />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-k8s-teal/20 bg-k8s-teal/5 p-4">
        <h4 className="font-display font-semibold text-sm text-k8s-teal mb-4 text-center">Worker Node</h4>
        <div className="grid grid-cols-2 gap-2">
          {workerNode.map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 + 0.3 }}
            >
              <ArchitectureNode {...node} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ArchitectureDiagram;
