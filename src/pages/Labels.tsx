import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";

const Labels = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-beginner mb-3 inline-block">Beginner → Intermediate</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Labels, Selectors & Taints</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            The metadata system that makes Kubernetes work — how objects find each other, how services route traffic, and how nodes control placement.
          </p>
        </motion.div>

        <LayeredExplanation
          title="Labels"
          simple={<p>Labels are sticky notes you put on Kubernetes objects. They're key-value pairs like <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">app: frontend</code>. Other objects use these labels to find and group things together.</p>}
          technical={
            <div className="space-y-3">
              <p>Labels are arbitrary key-value pairs attached to objects. They are used by <strong>selectors</strong> to identify sets of objects. Services find pods via selectors. Deployments manage ReplicaSets via selectors. Labels are the glue that connects Kubernetes objects.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Labels are stored in the object's metadata and indexed by the API server for efficient querying. Label selectors support equality-based (=, !=) and set-based (in, notin, exists) matching. The API server uses these for filtering in list/watch operations.</p>
            </div>
          }
        />

        <ComparisonTable
          title="Labels vs Annotations vs Taints"
          headers={["Feature", "Labels", "Annotations", "Taints"]}
          rows={[
            { label: "Purpose", values: ["Identify & select objects", "Store non-identifying metadata", "Repel pods from nodes"] },
            { label: "Used by selectors?", values: ["Yes", "No", "No (use tolerations)"] },
            { label: "Where applied", values: ["Any object", "Any object", "Nodes only"] },
            { label: "Example use", values: ["Service → Pod matching", "Build info, tool configs", "Dedicate GPU nodes"] },
            { label: "Size limits", values: ["63 chars value, 253 prefix", "256KB total", "Key-value + effect"] },
          ]}
        />

        <AnalogyCallout
          analogy="Labels are like tags on luggage"
          explanation="At an airport, luggage tags (labels) help the sorting system (selectors) route your bags to the right flight (service). Annotations are like the notes inside your bag — useful info but not used for routing. Taints are like 'staff only' signs at gates — only authorized personnel (tolerated pods) can enter."
        />

        <CodeBlock
          title="Labels and Selectors in Action"
          language="yaml"
          code={`# Deployment with labels
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app         # Label on the Deployment itself
    tier: frontend
spec:
  selector:
    matchLabels:
      app: web-app       # Selector: find pods with this label
  template:
    metadata:
      labels:
        app: web-app     # Pods get this label
        tier: frontend
        version: v2
    spec:
      containers:
        - name: web
          image: nginx:1.25
---
# Service that finds pods by label
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web-app         # Routes traffic to pods with app=web-app
  ports:
    - port: 80`}
        />

        <div className="k8s-card">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">How Selectors Connect Objects</h3>
          <div className="space-y-4">
            {[
              { from: "Service", to: "Pods", via: "spec.selector matches pod labels", example: "Service selector {app: web} → finds pods with label app=web" },
              { from: "Deployment", to: "ReplicaSet", via: "spec.selector.matchLabels", example: "Deployment manages ReplicaSets matching its selector" },
              { from: "ReplicaSet", to: "Pods", via: "spec.selector.matchLabels", example: "ReplicaSet owns pods matching its selector" },
              { from: "NetworkPolicy", to: "Pods", via: "spec.podSelector", example: "Policy applies to pods matching the selector" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">{item.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">{item.to}</span>
                <span className="text-muted-foreground text-xs flex-1">via {item.via}</span>
              </div>
            ))}
          </div>
        </div>

        <CommonMistakes
          mistakes={[
            { mistake: "Confusing labels with annotations", correction: "Labels are for selection and identification. Annotations are for metadata that doesn't affect selection." },
            { mistake: "Service selector doesn't match any pods", correction: "If labels don't match exactly, the Service has zero endpoints and traffic goes nowhere." },
            { mistake: "Thinking taints work like negative labels", correction: "Taints actively repel pods. Labels just describe objects. Taints need tolerations to allow scheduling." },
          ]}
        />

        <QuizCard
          title="Labels & Selectors Quiz"
          questions={[
            {
              question: "A Service has selector {app: api}. Which pods will receive traffic?",
              options: ["All pods in the namespace", "Pods with label app=api", "Pods named 'api'", "Pods in the 'api' deployment"],
              correctIndex: 1,
              explanation: "Services use label selectors to find target pods. Only pods with the exact matching label app=api will be included in the Service's endpoints."
            },
            {
              question: "Can annotations be used in selectors?",
              options: ["Yes, same as labels", "No, annotations are not indexed for selection", "Only in Services", "Only in NetworkPolicies"],
              correctIndex: 1,
              explanation: "Annotations cannot be used in selectors. They store non-identifying metadata like build info or tool configurations."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Labels;
