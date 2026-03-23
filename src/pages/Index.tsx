import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen, Server, Box, Layers, Network, HardDrive, Shield, Target,
  FileCode, Globe, Puzzle, AlertTriangle, ArrowRight, Zap, Eye, Brain,
  Compass, ChevronRight, Settings, Bug, FlaskConical, Gamepad2, Hammer
} from "lucide-react";
import TopicCard from "@/components/learning/TopicCard";
import Layout from "@/components/Layout";

const topics = [
  { title: "Foundations", description: "What is Kubernetes, why it exists, and the problems it solves", icon: BookOpen, to: "/foundations", level: "beginner" as const },
  { title: "Architecture", description: "Control plane, worker nodes, API server, etcd, and how they communicate", icon: Server, to: "/architecture", level: "beginner" as const },
  { title: "Objects", description: "Pods, Deployments, Services, ConfigMaps, Secrets, and every K8s resource", icon: Box, to: "/objects", level: "intermediate" as const },
  { title: "Workloads", description: "Deployments, StatefulSets, DaemonSets, Jobs — when and why to use each", icon: Layers, to: "/workloads", level: "intermediate" as const },
  { title: "Networking", description: "Pod networking, Services, DNS, Ingress, Routes, and deep request flows", icon: Network, to: "/networking", level: "advanced" as const },
  { title: "Storage", description: "Volumes, PV, PVC, StorageClass, and persistent data patterns", icon: HardDrive, to: "/storage", level: "intermediate" as const },
  { title: "Security", description: "RBAC, ServiceAccounts, Secrets, Pod Security, SCC, and hardening", icon: Shield, to: "/security", level: "advanced" as const },
  { title: "Scheduling", description: "How pods get placed: taints, tolerations, affinity, and topology", icon: Target, to: "/scheduling", level: "intermediate" as const },
  { title: "YAML Mastery", description: "Understanding manifests, required fields, patterns, and common mistakes", icon: FileCode, to: "/yaml", level: "beginner" as const },
  { title: "Services & DNS", description: "Service types, DNS resolution, Ingress controllers, and Routes", icon: Globe, to: "/services", level: "advanced" as const },
  { title: "CRDs & Operators", description: "Custom resources, operator pattern, and extending Kubernetes", icon: Puzzle, to: "/operators", level: "advanced" as const },
  { title: "Troubleshooting", description: "Debug CrashLoopBackOff, pending pods, DNS issues, and more", icon: AlertTriangle, to: "/troubleshooting", level: "intermediate" as const },
];

const learningPath = [
  { step: "1", label: "Concepts", desc: "Understand what and why" },
  { step: "2", label: "Objects", desc: "Learn the building blocks" },
  { step: "3", label: "Flows", desc: "See how things connect" },
  { step: "4", label: "YAML", desc: "Write real manifests" },
  { step: "5", label: "Debug", desc: "Reason through problems" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="k8s-section-hero mx-4 mt-4 md:mx-6 md:mt-6">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="k8s-badge-beginner mb-4 inline-block">Free Learning Platform</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              Learn Kubernetes
              <br />
              <span className="k8s-gradient-text">the Deep but Easy Way</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-sidebar-foreground/80 max-w-xl leading-relaxed">
              From absolute beginner to deep internal understanding. Visual explanations,
              real flows, system thinking — not just memorizing terms.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/foundations"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Learning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/architecture"
                className="inline-flex items-center gap-2 rounded-lg border border-sidebar-foreground/20 px-5 py-2.5 text-sm font-medium text-sidebar-foreground/90 hover:bg-sidebar-accent/20 transition-colors"
              >
                Explore Architecture
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why this site */}
      <section className="px-4 md:px-6 py-12">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
            Why Kubernetes Feels Hard
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto">
            And how this site makes it click
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Eye, title: "Visual First", desc: "Every concept comes with diagrams, flow maps, and architecture visuals. See the system, don't just read about it." },
              { icon: Brain, title: "3-Layer Depth", desc: "Simple → Technical → Deep Dive. Switch between layers based on your current understanding." },
              { icon: Zap, title: "Connected Thinking", desc: "Every topic links to related concepts. Understand how pods, services, DNS, and networking all fit together." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="k8s-card text-center"
              >
                <div className="mx-auto mb-3 inline-flex rounded-xl bg-primary/10 p-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Learning Path */}
      <section className="px-4 md:px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
            How to Study This Site
          </h2>
          <p className="text-center text-muted-foreground mb-8">Follow this progression for best results</p>
          <div className="flex flex-wrap justify-center gap-3">
            {learningPath.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="k8s-card flex items-center gap-3 py-3 px-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                {i < learningPath.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Labs */}
      <section className="px-4 md:px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
            Interactive Practice Labs
          </h2>
          <p className="text-center text-muted-foreground mb-8">Hands-on environments to deepen your understanding</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Bug, title: "Troubleshooting Lab", desc: "Debug realistic Kubernetes failures using simulated kubectl commands.", to: "/troubleshooting-lab", color: "text-destructive", bg: "bg-destructive/10" },
              { icon: FlaskConical, title: "Visual Lab", desc: "Watch Kubernetes processes unfold step-by-step with interactive diagrams.", to: "/visual-lab", color: "text-primary", bg: "bg-primary/10" },
              { icon: Gamepad2, title: "3D Simulator", desc: "Explore cluster architecture in an interactive 3D environment.", to: "/simulator", color: "text-[hsl(var(--k8s-cyan))]", bg: "bg-[hsl(var(--k8s-cyan))]/10" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={item.to} className="k8s-card block group hover:border-primary/40 transition-all h-full text-center">
                  <div className={`mx-auto mb-3 inline-flex rounded-xl ${item.bg} p-3`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  <p className="mt-3 text-xs text-primary font-medium">Explore →</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="px-4 md:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
            Explore All Topics
          </h2>
          <p className="text-center text-muted-foreground mb-8">Each section goes from basics to deep internals</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {topics.map((topic, i) => (
              <TopicCard key={topic.title} {...topic} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
