import { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface CommonMistakeProps {
  mistakes: { mistake: string; correction: string }[];
}

const CommonMistakes = ({ mistakes }: CommonMistakeProps) => (
  <div className="k8s-warning">
    <div className="flex items-center gap-2 mb-4">
      <AlertTriangle className="h-5 w-5 text-k8s-orange" />
      <h3 className="font-display font-semibold text-foreground">Common Mistakes</h3>
    </div>
    <div className="space-y-3">
      {mistakes.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <p className="text-sm font-medium text-foreground">❌ {m.mistake}</p>
          <p className="text-sm text-muted-foreground mt-1">✅ {m.correction}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default CommonMistakes;
