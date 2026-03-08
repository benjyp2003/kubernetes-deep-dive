import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import FlowDiagram from "@/components/learning/FlowDiagram";
import { BookOpen, Map, Target, Compass, Rocket, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const learningPath = [
  { label: "Foundations", description: "Understand what Kubernetes is, why it exists, and what problems it solves. Start from absolute basics.", icon: "📘", to: "/foundations" },
  { label: "Architecture", description: "Learn the control plane, worker nodes, and how all components talk to each other.", icon: "🏗️", to: "/architecture" },
  { label: "Objects & Workloads", description: "Master Pods, Deployments, ReplicaSets, StatefulSets, DaemonSets, Jobs, and more.", icon: "📦", to: "/objects" },
  { label: "YAML Mastery", description: "Learn to read, write, and understand Kubernetes manifests confidently.", icon: "📝", to: "/yaml" },
  { label: "Networking Deep Dive", description: "Understand pod IPs, Services, DNS, Ingress, Routes, and request flows.", icon: "🌐", to: "/networking" },
  { label: "Storage", description: "Volumes, PersistentVolumes, PVCs, StorageClasses, and data persistence.", icon: "💾", to: "/storage" },
  { label: "Security", description: "RBAC, ServiceAccounts, Secrets, SecurityContexts, SCCs, and pod security.", icon: "🔒", to: "/security" },
  { label: "Scheduling", description: "How pods get placed: taints, tolerations, affinity, and topology constraints.", icon: "🎯", to: "/scheduling" },
  { label: "Advanced Topics", description: "CRDs, Operators, OpenShift specifics, and cluster extensibility.", icon: "⚡", to: "/operators" },
  { label: "Troubleshooting", description: "Debug real problems: CrashLoopBackOff, Pending pods, DNS issues, and more.", icon: "🔧", to: "/troubleshooting" },
];

const studyTips = [
  { title: "Concept First", description: "Understand the 'why' before the 'how'. Every object exists to solve a problem." },
  { title: "Then Object", description: "Learn what the Kubernetes object is — its structure, fields, and purpose." },
  { title: "Then Flow", description: "Trace what happens internally when you create or interact with that object." },
  { title: "Then YAML", description: "Now write the manifest. It will make sense because you understand what each field does." },
  { title: "Then Troubleshoot", description: "Learn what goes wrong and how to reason through failures systematically." },
];

const StartHere = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-beginner mb-3 inline-block">Start Here</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Your Learning Roadmap</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            This is your guide to studying Kubernetes effectively. Follow this path from beginner to deep mastery.
          </p>
        </motion.div>

        {/* How to study */}
        <div className="k8s-card">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-lg text-foreground">How to Study This Site</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Follow this 5-step approach for every topic. Don't skip steps — each layer builds understanding.</p>
          <div className="space-y-4">
            {studyTips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Recommended Learning Path</h2>
          <div className="space-y-3">
            {learningPath.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={item.to} className="k8s-card block group hover:border-primary/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg group-hover:bg-primary/20 transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">Step {i + 1}</span>
                      </div>
                      <p className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="k8s-analogy">
          <p className="text-sm text-foreground font-medium mb-2">💡 Pro Tip</p>
          <p className="text-sm text-muted-foreground">
            Don't try to learn everything at once. Complete one section, let it sink in, then move to the next. 
            Each section builds on the previous ones. Use the glossary when you encounter unfamiliar terms.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default StartHere;
