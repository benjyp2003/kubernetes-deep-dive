import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { simulatorScenarios } from "@/components/simulator/scenarios";

const categoryColors: Record<string, string> = {
  "🚀": "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  "📦": "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
  "🔀": "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  "🌐": "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
  "🔌": "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  "🌍": "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  "🔴": "from-red-500/20 to-orange-500/20 border-red-500/30",
  "💾": "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  "🎯": "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  "🛡️": "from-rose-500/20 to-red-500/20 border-rose-500/30",
};

const Simulator = () => (
  <Layout>
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
          <span>🎮</span> 3D Interactive
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-3">
          3D Cluster Simulator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Explore Kubernetes internals in an interactive 3D environment. Rotate, zoom, and watch
          events unfold inside a live cluster model.
        </p>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { color: "bg-blue-500", label: "Control Plane API" },
          { color: "bg-emerald-500", label: "Application Traffic" },
          { color: "bg-orange-500", label: "Storage Operations" },
          { color: "bg-red-500", label: "Security Enforcement" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Scenario Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {simulatorScenarios.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/simulator/${s.id}`}
              className={`block h-full p-5 rounded-xl border bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-lg ${categoryColors[s.icon] || "from-card to-card border-border"}`}
            >
              <span className="text-3xl mb-3 block">{s.icon}</span>
              <h3 className="font-display font-semibold text-foreground text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.subtitle}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="bg-muted px-1.5 py-0.5 rounded">{s.steps.length} steps</span>
                <span className="bg-muted px-1.5 py-0.5 rounded">{s.components.length} components</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </Layout>
);

export default Simulator;
