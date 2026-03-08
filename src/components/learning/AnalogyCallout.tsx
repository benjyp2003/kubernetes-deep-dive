import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface AnalogyCalloutProps {
  analogy: string;
  explanation: string;
  icon?: ReactNode;
}

const AnalogyCallout = ({ analogy, explanation, icon }: AnalogyCalloutProps) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="k8s-analogy"
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 rounded-lg bg-primary/10 p-2">
        {icon || <Lightbulb className="h-5 w-5 text-primary" />}
      </div>
      <div>
        <p className="font-display font-semibold text-foreground">{analogy}</p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{explanation}</p>
      </div>
    </div>
  </motion.div>
);

export default AnalogyCallout;
