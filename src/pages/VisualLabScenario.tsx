import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getScenario } from "@/components/visuallab/scenarios";
import ClusterVisualization from "@/components/visuallab/ClusterVisualization";

const VisualLabScenario = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const scenario = scenarioId ? getScenario(scenarioId) : undefined;

  if (!scenario) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Scenario not found</h1>
          <Link to="/visual-lab" className="text-primary hover:underline">← Back to Visual Lab</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-2">
            <Link to="/visual-lab" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{scenario.icon}</span>
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">{scenario.title}</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{scenario.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Hover nodes for details</span>
            <span>•</span>
            <span>Drag to rearrange</span>
            <span>•</span>
            <span>Scroll to zoom</span>
            <span>•</span>
            <Link to={scenario.relatedPage} className="text-primary hover:underline">
              Related learning page →
            </Link>
          </div>
        </motion.div>

        <ClusterVisualization scenario={scenario} />
      </div>
    </Layout>
  );
};

export default VisualLabScenario;
