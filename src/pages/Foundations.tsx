import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import QuizCard from "@/components/learning/QuizCard";
import OpenShiftComparison from "@/components/learning/OpenShiftComparison";
import FlowDiagram from "@/components/learning/FlowDiagram";
import { BookOpen, Container, Boxes, Cog } from "lucide-react";

const Foundations = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Section Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-beginner mb-3 inline-block">Beginner</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Kubernetes Foundations</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Before diving into commands and YAML, understand what Kubernetes is, why it was created, and what problems it actually solves.
          </p>
        </motion.div>

        {/* What is Kubernetes */}
        <LayeredExplanation
          title="What is Kubernetes?"
          simple={
            <p>Kubernetes is a system that manages your applications running inside containers. It decides where they run, restarts them if they crash, and scales them when needed. Think of it as an autopilot for your software.</p>
          }
          technical={
            <div className="space-y-3">
              <p>Kubernetes (K8s) is an open-source container orchestration platform originally designed by Google and now maintained by the CNCF. It automates the deployment, scaling, and management of containerized applications across a cluster of machines.</p>
              <p>It uses a <strong>declarative model</strong>: you tell Kubernetes what state you want (e.g., "run 3 copies of my web server"), and it continuously works to maintain that state.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Kubernetes operates on a <strong>control loop architecture</strong>. The system consists of a control plane (API server, etcd, scheduler, controller manager) and worker nodes (kubelet, kube-proxy, container runtime).</p>
              <p>When you submit a desired state through the API server, it's stored in etcd. Controllers continuously watch for differences between desired and actual state, and take action to reconcile them. This is the <strong>reconciliation loop</strong> — the heart of Kubernetes.</p>
              <p>The scheduler assigns pods to nodes based on resource availability, constraints, and policies. The kubelet on each node watches for assigned pods and ensures containers are running via the Container Runtime Interface (CRI).</p>
            </div>
          }
        />

        <AnalogyCallout
          analogy="Kubernetes is like an airport operations center"
          explanation="Planes (containers) need gates (nodes), fuel (resources), runways (networking), and constant coordination. The operations center (control plane) ensures everything runs smoothly — reassigning gates when planes are delayed, calling in more staff when it's busy, and handling emergencies automatically."
        />

        {/* Why Kubernetes */}
        <LayeredExplanation
          title="Why Was Kubernetes Created?"
          simple={
            <p>Before Kubernetes, companies had to manually manage their servers and applications. When something crashed at 3 AM, someone had to wake up and fix it. Kubernetes automates all of that — it's the difference between manually driving a car and having a self-driving system.</p>
          }
          technical={
            <div className="space-y-3">
              <p>Kubernetes was born from Google's internal system called <strong>Borg</strong>, which managed billions of containers across Google's data centers. In 2014, Google open-sourced the ideas behind Borg as Kubernetes.</p>
              <p>The key problems it solves:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Service discovery</strong> — applications find each other automatically</li>
                <li><strong>Self-healing</strong> — crashed containers restart automatically</li>
                <li><strong>Horizontal scaling</strong> — add more copies when demand increases</li>
                <li><strong>Rolling updates</strong> — deploy new versions with zero downtime</li>
                <li><strong>Resource management</strong> — efficient use of CPU and memory</li>
              </ul>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Google's Borg system ran ~2 billion containers per week. The lessons learned — desired state management, label-based scheduling, API-driven operations — became Kubernetes's foundation.</p>
              <p>Key architectural decisions from Borg:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Declarative over imperative — state reconciliation, not sequential scripts</li>
                <li>Labels over fixed naming — flexible grouping and selection</li>
                <li>API-first design — everything is an API resource</li>
                <li>Controller pattern — independent controllers watching and reconciling</li>
              </ul>
            </div>
          }
        />

        {/* Journey visual */}
        <FlowDiagram
          title="The Journey: App → Container → Pod → Cluster"
          steps={[
            { label: "Application Code", description: "You write your app — a web server, API, database, worker, etc." },
            { label: "Container Image", description: "Package the app into a container image (Dockerfile → docker build). This creates a portable, isolated unit." },
            { label: "Pod", description: "Kubernetes runs containers inside Pods — the smallest deployable unit. A pod can have one or more containers sharing network and storage." },
            { label: "Node", description: "Pods run on Nodes — machines (physical or virtual) in your cluster. Each node has a kubelet agent managing its pods." },
            { label: "Cluster", description: "Multiple nodes form a Cluster. The control plane manages the cluster, and Kubernetes orchestrates everything across all nodes." },
          ]}
        />

        {/* Comparison */}
        <ComparisonTable
          title="Docker Alone vs. Kubernetes"
          headers={["Aspect", "Docker Only", "Kubernetes"]}
          rows={[
            { label: "Container restart", values: ["Manual or basic restart policy", "Automatic self-healing"] },
            { label: "Scaling", values: ["Manual docker run", "Declarative replica count"] },
            { label: "Load balancing", values: ["External setup needed", "Built-in Services"] },
            { label: "Updates", values: ["Stop → pull → start", "Rolling updates with zero downtime"] },
            { label: "Multi-host", values: ["Docker Swarm or manual", "Native cluster support"] },
            { label: "Service discovery", values: ["Container links or networks", "Built-in DNS & Services"] },
            { label: "Config management", values: ["Env vars or files", "ConfigMaps & Secrets"] },
          ]}
        />

        {/* When to use */}
        <div className="k8s-card">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">When Should You Use Kubernetes?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-display font-semibold text-sm text-k8s-green mb-3">✅ Good fit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Microservices architecture</li>
                <li>• Apps that need high availability</li>
                <li>• Teams deploying frequently</li>
                <li>• Multi-environment deployments</li>
                <li>• Apps that need horizontal scaling</li>
                <li>• Platform teams serving developers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm text-k8s-red mb-3">❌ Probably overkill</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Simple single-server apps</li>
                <li>• Small team with 1–2 services</li>
                <li>• Quick prototypes or MVPs</li>
                <li>• Static websites</li>
                <li>• When you don't have ops capacity</li>
                <li>• When a PaaS would be simpler</li>
              </ul>
            </div>
          </div>
        </div>

        <CommonMistakes
          mistakes={[
            { mistake: "Thinking Kubernetes replaces Docker", correction: "Kubernetes orchestrates containers. You still need a container runtime — Docker, containerd, or CRI-O." },
            { mistake: "Using Kubernetes for a single small app", correction: "Kubernetes adds operational complexity. If you have a simple app, a PaaS or single VM may be better." },
            { mistake: "Confusing containers with VMs", correction: "Containers share the host OS kernel. VMs run their own OS. Containers are lighter and faster to start." },
          ]}
        />

        <OpenShiftComparison
          k8sFeature="Vanilla Kubernetes"
          openshiftFeature="OpenShift Container Platform"
          description="OpenShift is Red Hat's enterprise Kubernetes distribution. It adds developer tooling, built-in CI/CD, stricter security defaults (SCCs), a web console, and opinionated defaults. Think of it as 'Kubernetes with batteries included and guardrails added.'"
        />

        <QuizCard
          title="Foundations Quiz"
          questions={[
            {
              question: "What is the primary model Kubernetes uses to manage applications?",
              options: ["Imperative commands", "Declarative desired state", "Event-driven scripts", "Manual configuration"],
              correctIndex: 1,
              explanation: "Kubernetes uses a declarative model. You describe the desired state, and controllers work to make reality match that state through reconciliation loops."
            },
            {
              question: "Which Google system inspired Kubernetes?",
              options: ["MapReduce", "Borg", "Spanner", "BigTable"],
              correctIndex: 1,
              explanation: "Kubernetes was directly inspired by Google's internal Borg system, which managed billions of containers across Google's data centers."
            },
            {
              question: "What is the smallest deployable unit in Kubernetes?",
              options: ["Container", "Pod", "Node", "Deployment"],
              correctIndex: 1,
              explanation: "A Pod is the smallest deployable unit. It wraps one or more containers that share networking and storage. You don't deploy containers directly — you deploy Pods."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Foundations;
