import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { scenarios } from "@/components/visuallab/scenarios";

const categoryColors: Record<string, string> = {
  Core: "bg-primary/15 text-primary border-primary/30",
  Networking: "bg-[hsl(var(--k8s-cyan))]/15 text-[hsl(var(--k8s-cyan))] border-[hsl(var(--k8s-cyan))]/30",
  Storage: "bg-[hsl(var(--k8s-amber))]/15 text-[hsl(var(--k8s-amber))] border-[hsl(var(--k8s-amber))]/30",
  Security: "bg-destructive/15 text-destructive border-destructive/30",
  OpenShift: "bg-[hsl(var(--k8s-purple))]/15 text-[hsl(var(--k8s-purple))] border-[hsl(var(--k8s-purple))]/30",
};

const VisualLab = () => (
  <Layout>
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
        <span className="k8s-badge-advanced mb-3 inline-block">Interactive</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Visual Lab</h1>
        <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
          Watch Kubernetes processes unfold step-by-step. Explore how components communicate, 
          how traffic flows, and how the control plane orchestrates everything.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/visual-lab/${s.id}`}
              className="block k8s-card hover:border-primary/40 transition-all group h-full"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${categoryColors[s.category] || ""}`}>
                      {s.category}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.subtitle}</p>
                  <p className="text-xs text-primary/70 mt-2 font-mono">{s.steps.length} steps →</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </Layout>
);

export default VisualLab;
