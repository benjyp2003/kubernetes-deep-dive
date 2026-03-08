import { motion } from "framer-motion";

interface FlowStep {
  label: string;
  description: string;
  icon?: string;
}

interface FlowDiagramProps {
  title: string;
  steps: FlowStep[];
}

const FlowDiagram = ({ title, steps }: FlowDiagramProps) => (
  <div className="k8s-card">
    <h3 className="font-display font-semibold text-lg text-foreground mb-6">{title}</h3>
    <div className="space-y-0">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative"
        >
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-primary/20 mt-1" />
              )}
            </div>
            <div className="pb-6">
              <p className="font-display font-semibold text-sm text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default FlowDiagram;
