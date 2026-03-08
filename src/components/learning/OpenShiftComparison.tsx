import { ReactNode } from "react";
import { motion } from "framer-motion";

interface OpenShiftComparisonProps {
  k8sFeature: string;
  openshiftFeature: string;
  description: string;
}

const OpenShiftComparison = ({ k8sFeature, openshiftFeature, description }: OpenShiftComparisonProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    className="k8s-openshift"
  >
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-bold uppercase tracking-wider text-k8s-red">OpenShift</span>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-3">
      <div className="rounded-lg border border-border p-3 bg-background/50">
        <p className="text-xs text-muted-foreground mb-1">Kubernetes</p>
        <p className="text-sm font-medium text-foreground">{k8sFeature}</p>
      </div>
      <div className="rounded-lg border border-k8s-red/20 p-3 bg-k8s-red/5">
        <p className="text-xs text-k8s-red mb-1">OpenShift</p>
        <p className="text-sm font-medium text-foreground">{openshiftFeature}</p>
      </div>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

export default OpenShiftComparison;
