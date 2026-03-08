import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Box, ArrowRight } from "lucide-react";
import CodeBlock from "@/components/learning/CodeBlock";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";

const objectCategories = [
  {
    category: "Core Workloads",
    items: [
      { name: "Pod", desc: "Smallest deployable unit. Wraps one or more containers.", level: "beginner" },
      { name: "ReplicaSet", desc: "Ensures a specific number of pod replicas run at all times.", level: "beginner" },
      { name: "Deployment", desc: "Manages ReplicaSets for declarative updates and rollbacks.", level: "beginner" },
      { name: "StatefulSet", desc: "Like Deployment but with stable identity and persistent storage.", level: "intermediate" },
      { name: "DaemonSet", desc: "Ensures a pod runs on every (or selected) node.", level: "intermediate" },
      { name: "Job", desc: "Runs a task to completion, then stops.", level: "beginner" },
      { name: "CronJob", desc: "Runs Jobs on a schedule (like cron).", level: "beginner" },
    ],
  },
  {
    category: "Networking",
    items: [
      { name: "Service", desc: "Stable endpoint that load-balances traffic to pods.", level: "beginner" },
      { name: "Endpoints", desc: "List of IP:port pairs backing a Service.", level: "intermediate" },
      { name: "EndpointSlice", desc: "Scalable replacement for Endpoints.", level: "advanced" },
      { name: "Ingress", desc: "HTTP/HTTPS routing rules for external traffic.", level: "intermediate" },
      { name: "NetworkPolicy", desc: "Firewall rules controlling pod-to-pod traffic.", level: "advanced" },
    ],
  },
  {
    category: "Configuration",
    items: [
      { name: "ConfigMap", desc: "Stores non-sensitive configuration as key-value pairs.", level: "beginner" },
      { name: "Secret", desc: "Stores sensitive data (base64 encoded, not encrypted by default).", level: "beginner" },
      { name: "Namespace", desc: "Virtual cluster partition for resource isolation.", level: "beginner" },
      { name: "ResourceQuota", desc: "Limits total resources consumed in a namespace.", level: "intermediate" },
      { name: "LimitRange", desc: "Default and max resource limits for pods in a namespace.", level: "intermediate" },
    ],
  },
  {
    category: "Storage",
    items: [
      { name: "PersistentVolume (PV)", desc: "A piece of storage provisioned in the cluster.", level: "intermediate" },
      { name: "PersistentVolumeClaim (PVC)", desc: "A request for storage by a pod.", level: "intermediate" },
      { name: "StorageClass", desc: "Defines types of storage for dynamic provisioning.", level: "intermediate" },
    ],
  },
  {
    category: "Security & Access",
    items: [
      { name: "ServiceAccount", desc: "Identity for pods to authenticate with the API server.", level: "intermediate" },
      { name: "Role", desc: "Permissions within a single namespace.", level: "intermediate" },
      { name: "ClusterRole", desc: "Cluster-wide permissions.", level: "intermediate" },
      { name: "RoleBinding", desc: "Grants a Role to a user/group/SA in a namespace.", level: "intermediate" },
      { name: "ClusterRoleBinding", desc: "Grants a ClusterRole cluster-wide.", level: "intermediate" },
    ],
  },
  {
    category: "Extensibility",
    items: [
      { name: "CustomResourceDefinition", desc: "Defines a new API resource type in Kubernetes.", level: "advanced" },
      { name: "Custom Resource", desc: "An instance of a CRD — your custom object.", level: "advanced" },
    ],
  },
];

const levelColors: Record<string, string> = {
  beginner: "k8s-badge-beginner",
  intermediate: "k8s-badge-intermediate",
  advanced: "k8s-badge-advanced",
};

const Objects = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">All Levels</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Kubernetes Objects</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Every resource in Kubernetes is an API object. Understand what each one does, why it exists, and how they connect together.
          </p>
        </motion.div>

        <LayeredExplanation
          title="What Are Kubernetes Objects?"
          simple={
            <p>Objects are "records of intent" — you create them to tell Kubernetes what you want. A Deployment object says "I want 3 copies of my app running." Kubernetes reads this and works to make it happen.</p>
          }
          technical={
            <div className="space-y-3">
              <p>Every Kubernetes object has: <strong>apiVersion</strong> (API group/version), <strong>kind</strong> (type), <strong>metadata</strong> (name, namespace, labels), and <strong>spec</strong> (desired state). The system adds <strong>status</strong> (actual state).</p>
              <p>Objects are persisted in etcd via the API server. Controllers watch for changes and reconcile actual state with desired state.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>The object lifecycle:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li>User submits object (YAML/JSON) to API server</li>
                <li>API server validates, runs admission controllers</li>
                <li>Object is persisted to etcd with a <code className="font-mono text-xs">resourceVersion</code></li>
                <li>Relevant controller is notified via watch</li>
                <li>Controller reconciles, creates sub-resources</li>
                <li>Status is updated as the system converges</li>
                <li>On deletion, finalizers may delay removal for cleanup</li>
              </ol>
            </div>
          }
        />

        <AnalogyCallout
          analogy="Objects are like work orders in a factory"
          explanation="You submit a work order (object) specifying what you want built (spec). The factory floor (cluster) has specialized teams (controllers) that read these orders and make them happen. The order's status gets updated as work progresses."
        />

        <CodeBlock
          title="Anatomy of a Kubernetes Object"
          language="yaml"
          code={`apiVersion: apps/v1          # API group and version
kind: Deployment              # Type of object
metadata:                     # Identity & organization
  name: my-app
  namespace: production
  labels:
    app: my-app
    tier: frontend
spec:                         # Desired state (you define this)
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
        - name: app
          image: my-app:v2
status:                       # Actual state (system manages this)
  readyReplicas: 3
  availableReplicas: 3`}
        />

        {/* Object catalog */}
        {objectCategories.map((cat, ci) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ci * 0.05 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-4">{cat.category}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {cat.items.map((item) => (
                <div key={item.name} className="k8s-card py-4 px-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-display font-semibold text-sm text-foreground">{item.name}</h3>
                    <span className={levelColors[item.level]}>{item.level}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <ComparisonTable
          title="Key Object Relationships"
          headers={["Parent", "Creates/Manages", "Purpose"]}
          rows={[
            { label: "Deployment", values: ["ReplicaSet", "Rolling updates, rollback history"] },
            { label: "ReplicaSet", values: ["Pods", "Maintain desired replica count"] },
            { label: "StatefulSet", values: ["Pods + PVCs", "Ordered pods with stable identity"] },
            { label: "DaemonSet", values: ["Pods (one per node)", "System daemons on every node"] },
            { label: "CronJob", values: ["Jobs", "Scheduled task execution"] },
            { label: "Service", values: ["Endpoints/EndpointSlice", "Stable networking abstraction"] },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Objects;
