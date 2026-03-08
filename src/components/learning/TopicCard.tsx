import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface TopicCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  level: "beginner" | "intermediate" | "advanced";
  delay?: number;
}

const levelBadge = {
  beginner: "k8s-badge-beginner",
  intermediate: "k8s-badge-intermediate",
  advanced: "k8s-badge-advanced",
};

const TopicCard = ({ title, description, icon: Icon, to, level, delay = 0 }: TopicCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.4 }}
  >
    <Link to={to} className="block k8s-card group h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className={levelBadge[level]}>{level}</span>
      </div>
      <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Link>
  </motion.div>
);

export default TopicCard;
