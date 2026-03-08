import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { labScenarios } from "@/components/troublelab/scenarios";
import { Terminal, Shield, HardDrive, Network, Box, Settings } from "lucide-react";

const categoryConfig: Record<string, { icon: typeof Terminal; gradient: string }> = {
  pod: { icon: Box, gradient: "from-red-500/20 to-orange-500/20 border-red-500/30" },
  networking: { icon: Network, gradient: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
  storage: { icon: HardDrive, gradient: "from-orange-500/20 to-amber-500/20 border-orange-500/30" },
  config: { icon: Settings, gradient: "from-violet-500/20 to-purple-500/20 border-violet-500/30" },
  deployment: { icon: Shield, gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-400",
  intermediate: "bg-amber-500/15 text-amber-400",
  advanced: "bg-red-500/15 text-red-400",
};

const TroubleshootingLab = () => (
  <Layout>
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          <Terminal className="h-3.5 w-3.5" /> Interactive Debugging
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-3">
          Troubleshooting Lab
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Investigate real Kubernetes failures using simulated kubectl commands. Discover clues,
          identify root causes, and learn to think like a Kubernetes debugger.
        </p>
      </motion.div>

      {/* Difficulty legend */}
      <div className="flex gap-3 mb-8">
        {Object.entries(difficultyColors).map(([level, cls]) => (
          <div key={level} className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${cls}`}>
            {level}
          </div>
        ))}
      </div>

      {/* Scenario grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {labScenarios.map((s, i) => {
          const cfg = categoryConfig[s.category] || categoryConfig.pod;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/troubleshooting-lab/${s.id}`}
                className={`block h-full p-5 rounded-xl border bg-gradient-to-br transition-all hover:scale-[1.02] hover:shadow-lg ${cfg.gradient}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{s.icon}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${difficultyColors[s.difficulty]}`}>
                    {s.difficulty}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{s.problemDescription}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  <span className="capitalize">{s.category}</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">{s.clues.length} clues</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded">{s.commands.length} commands</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  </Layout>
);

export default TroubleshootingLab;
