import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";
import FlowDiagram from "@/components/learning/FlowDiagram";
import LabelsInternalFlows from "@/components/learning/labels/LabelsInternalFlows";
import SelectorsDeepDive from "@/components/learning/labels/SelectorsDeepDive";
import AnnotationsDeepDive from "@/components/learning/labels/AnnotationsDeepDive";

import LabelsDebugging from "@/components/learning/labels/LabelsDebugging";

const Labels = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Intermediate → Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Labels, Selectors & Annotations</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            The metadata system that makes Kubernetes work — how objects find each other, how controllers enforce behavior, and how the scheduler controls placement. These four mechanisms are the glue of the entire system.
          </p>
        </motion.div>

        {/* Section 1: Labels Core */}
        <LayeredExplanation
          title="Labels — Identity & Grouping"
          simple={<p>Labels are sticky notes you put on Kubernetes objects. They're key-value pairs like <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">app: frontend</code>. Other objects use these labels to find and group things together.</p>}
          technical={
            <div className="space-y-3">
              <p>Labels are arbitrary key-value pairs in <code className="text-primary font-mono text-xs bg-primary/10 px-1 rounded">metadata.labels</code>. They are the <strong>primary mechanism</strong> for object identification in Kubernetes. Services, Deployments, NetworkPolicies, and the scheduler all use labels to find their targets.</p>
              <p>Label keys have an optional prefix (DNS subdomain, max 253 chars) and a name (max 63 chars). Values are max 63 chars. These limits exist because labels are indexed for fast lookups.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>The API Server maintains an <strong>in-memory label index</strong> for every resource type. When a controller issues a list request with a label selector, the API Server uses this index instead of scanning all objects — this is O(1) lookup, not O(n) scan.</p>
              <p>Labels are stored in etcd as part of the object's metadata. Every label change triggers a <strong>watch event</strong> to all controllers watching that resource type. Controllers then re-evaluate their selectors against the updated labels.</p>
              <p className="text-xs text-muted-foreground">This is why Kubernetes is called "declarative" — you don't tell a Service which Pods to use. You declare labels on Pods, and the system continuously matches them.</p>
            </div>
          }
        />

        <AnalogyCallout
          analogy="Labels are airport luggage tags — Annotations are the notes inside your bag — Taints are 'Staff Only' signs"
          explanation="At an airport, luggage tags (labels) are read by the sorting system (selectors) to route bags to the right flight (Service). The notes inside your bag (annotations) contain useful info but aren't used for routing. 'Staff Only' signs at gates (taints) block everyone except authorized personnel (pods with tolerations). Change a tag → your bag goes to a different flight. That's exactly what happens in Kubernetes."
        />

        <ComparisonTable
          title="Labels vs Annotations vs Taints — System Role"
          headers={["Feature", "Labels", "Annotations", "Taints"]}
          rows={[
            { label: "Purpose", values: ["Identify & select objects", "Store metadata for tools/controllers", "Repel pods from nodes"] },
            { label: "Used by selectors?", values: ["Yes — indexed for fast lookup", "No — not indexed", "No — uses tolerations"] },
            { label: "Where applied", values: ["Any object", "Any object", "Nodes only"] },
            { label: "Who reads them?", values: ["API Server, controllers, scheduler", "External tools, operators, kubectl", "Scheduler, node controller"] },
            { label: "Size limits", values: ["63 chars value, 253 prefix", "256KB total per object", "Key=value + effect"] },
            { label: "Dynamic effect", values: ["Changing labels immediately affects selectors", "Controllers must explicitly watch for changes", "New taints can evict running pods (NoExecute)"] },
          ]}
        />

        <CodeBlock
          title="Labels, Selectors & Annotations — Complete Example"
          language="yaml"
          code={`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:                          # Labels ON the Deployment object itself
    app: web-app
    tier: frontend
  annotations:                     # Annotations — controller metadata
    deployment.kubernetes.io/revision: "3"
    kubectl.kubernetes.io/last-applied-configuration: "{...}"
spec:
  selector:
    matchLabels:
      app: web-app                 # Selector: finds Pods with this label
  template:
    metadata:
      labels:
        app: web-app               # Pods get this label (must match selector)
        tier: frontend
        version: v2
      annotations:
        prometheus.io/scrape: "true"   # Prometheus reads this
        prometheus.io/port: "8080"
    spec:
      tolerations:                 # Taints this pod can handle
        - key: "dedicated"
          operator: "Equal"
          value: "frontend"
          effect: "NoSchedule"
      containers:
        - name: web
          image: nginx:1.25
---
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web-app                   # Dynamic match → EndpointSlice → routing
  ports:
    - port: 80`}
        />

        {/* Section 2: Internal Flows */}
        <LabelsInternalFlows />

        {/* Section 3: Selectors Deep Dive */}
        <SelectorsDeepDive />

        {/* Section 4: Annotations Deep Dive */}
        <AnnotationsDeepDive />

        {/* Section 5: How They All Connect */}
        <FlowDiagram
          title="How Labels, Selectors, Annotations & Taints Work Together"
          steps={[
            { label: "Labels", description: "Define object identity (app=web, tier=frontend)", icon: "🏷️" },
            { label: "Selectors", description: "Create dynamic relationships between objects", icon: "🔍" },
            { label: "Annotations", description: "Signal controllers to change behavior", icon: "📝" },
            { label: "Taints/Tolerations", description: "Control which nodes accept which pods", icon: "🚫" },
            { label: "System Behavior", description: "Routing, management, monitoring, scheduling", icon: "⚙️" },
          ]}
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Thinking Services are linked to Pods by name", correction: "Services find Pods via label selectors. Change the label → the Pod disappears from the Service's endpoints immediately." },
            { mistake: "Using annotations where labels should be used", correction: "If you need to SELECT objects by a value, use labels. Annotations cannot be used in selectors — they're not indexed." },
            { mistake: "Confusing NoSchedule with NoExecute", correction: "NoSchedule only affects NEW pods (existing stay). NoExecute evicts EXISTING pods too — much more disruptive." },
            { mistake: "Trying to change a Deployment's selector", correction: "Deployment selectors are immutable after creation. You must delete and recreate the Deployment to change its selector." },
            { mistake: "Forgetting that label changes are immediate", correction: "Removing a label from a Pod instantly removes it from any Service/NetworkPolicy that selected it. There's no delay or confirmation." },
            { mistake: "Using wrong annotation format", correction: "Annotations are controller-specific. 'true' vs true vs 'True' matters. Always check controller docs for exact format." },
          ]}
        />

        {/* Section 7: Debugging */}
        <LabelsDebugging />

        {/* Section 8: Quiz */}
        <QuizCard
          title="Labels, Selectors, Annotations & Taints — Deep Quiz"
          questions={[
            {
              question: "A Service has selector {app: api} but no Pods have that label. What happens?",
              options: ["Service returns 503 errors", "Service has 0 endpoints — connection refused", "Service creates Pods automatically", "Kubernetes warns but routes to all Pods"],
              correctIndex: 1,
              explanation: "The EndpointSlice controller finds no Pods matching the selector, so the Service has zero endpoints. Any traffic to the ClusterIP gets 'Connection refused' because there's nowhere to route it."
            },
            {
              question: "You remove the label 'app=web' from a running Pod. What happens to the Pod?",
              options: ["Pod is deleted", "Pod keeps running but is removed from its Service and ReplicaSet creates a replacement", "Nothing changes", "Pod restarts"],
              correctIndex: 1,
              explanation: "The Pod keeps running (labels don't affect pod lifecycle). But the ReplicaSet loses track of it (selector no longer matches), creates a replacement, and the Service removes it from endpoints."
            },
            {
              question: "What's the key difference between NoSchedule and NoExecute taints?",
              options: ["NoSchedule is permanent, NoExecute is temporary", "NoSchedule affects new pods only, NoExecute also evicts existing pods", "NoSchedule is for nodes, NoExecute is for pods", "They are identical"],
              correctIndex: 1,
              explanation: "NoSchedule only prevents NEW pods from being scheduled. NoExecute actively evicts pods already running on the node if they don't tolerate the taint."
            },
            {
              question: "Can you filter objects by annotations using kubectl?",
              options: ["Yes, with -l flag", "Yes, with --annotation flag", "No — annotations are not indexed for selection", "Only for Pods"],
              correctIndex: 2,
              explanation: "Annotations are NOT indexed by the API Server. You cannot use them in selectors or filter by them in list queries. Only labels are indexed for selection."
            },
            {
              question: "A node has taint 'gpu=true:NoSchedule'. A pod has toleration {key: gpu, operator: Exists, effect: NoSchedule}. Can it schedule?",
              options: ["No — value must match", "Yes — Exists operator matches any value", "Only if the pod requests GPU resources", "Only with PreferNoSchedule"],
              correctIndex: 1,
              explanation: "The Exists operator matches any taint with the matching key and effect, regardless of value. This is useful when you want to tolerate all taints with a specific key."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Labels;
