import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import CodeBlock from "@/components/learning/CodeBlock";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import CommonMistakes from "@/components/learning/CommonMistakes";
import ComparisonTable from "@/components/learning/ComparisonTable";
import QuizCard from "@/components/learning/QuizCard";

const Yaml = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-beginner mb-3 inline-block">Beginner → Intermediate</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">YAML Mastery</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Learn to read, write, and understand Kubernetes manifests. YAML is the language you use to talk to Kubernetes.
          </p>
        </motion.div>

        <LayeredExplanation
          title="Why YAML?"
          simple={
            <p>YAML is a human-readable format for writing configuration. Kubernetes uses YAML files to describe what you want — like ordering from a menu by writing down your order instead of shouting it.</p>
          }
          technical={
            <div className="space-y-3">
              <p>Kubernetes uses a <strong>declarative model</strong>. Instead of running imperative commands ("create this, then modify that"), you write YAML manifests that describe the desired state of your resources. The API server accepts these manifests and controllers reconcile reality to match.</p>
              <p>YAML is preferred over JSON because it's more readable, supports comments, and is less verbose.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>When you <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kubectl apply -f manifest.yaml</code>, kubectl converts the YAML to JSON and sends it as an HTTP request to the API server. Internally, Kubernetes always works with JSON — YAML is a human convenience layer.</p>
              <p>The API server validates the manifest against the resource's OpenAPI schema, runs admission controllers, then persists the object to etcd.</p>
            </div>
          }
        />

        <ComparisonTable
          title="Imperative vs Declarative"
          headers={["Aspect", "Imperative", "Declarative (YAML)"]}
          rows={[
            { label: "Approach", values: ["kubectl run nginx --image=nginx", "kubectl apply -f nginx.yaml"] },
            { label: "Reproducible", values: ["Hard to repeat exactly", "File can be version-controlled"] },
            { label: "Auditable", values: ["No record of what happened", "Git history shows changes"] },
            { label: "Scalable", values: ["One command at a time", "Apply entire directories"] },
            { label: "Team-friendly", values: ["Knowledge in people's heads", "Configuration as code"] },
          ]}
        />

        <div className="k8s-card">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">The 4 Required Fields</h3>
          <p className="text-sm text-muted-foreground mb-4">Every Kubernetes manifest needs these four top-level fields:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { field: "apiVersion", desc: "Which API group and version (e.g., v1, apps/v1)" },
              { field: "kind", desc: "What type of object (Pod, Deployment, Service)" },
              { field: "metadata", desc: "Name, namespace, labels, annotations" },
              { field: "spec", desc: "The desired state — what you want Kubernetes to do" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-4 bg-background/50">
                <code className="text-primary font-mono text-sm font-bold">{item.field}</code>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <CodeBlock
          title="Minimal Pod YAML"
          language="yaml"
          code={`apiVersion: v1
kind: Pod
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  containers:
    - name: web
      image: nginx:1.25
      ports:
        - containerPort: 80`}
        />

        <CodeBlock
          title="Deployment YAML (with annotations)"
          language="yaml"
          code={`apiVersion: apps/v1          # API group: apps, version: v1
kind: Deployment             # Object type
metadata:
  name: web-app              # Name of this Deployment
  namespace: production      # Where it lives
  labels:
    app: web-app             # Labels for selection
    tier: frontend
spec:
  replicas: 3                # Desired number of pods
  selector:
    matchLabels:
      app: web-app           # Must match pod template labels
  template:                  # Pod template
    metadata:
      labels:
        app: web-app         # Labels on created pods
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi`}
        />

        <CodeBlock
          title="Service YAML"
          language="yaml"
          code={`apiVersion: v1
kind: Service
metadata:
  name: web-app-svc
spec:
  selector:
    app: web-app          # Find pods with this label
  ports:
    - port: 80            # Service port
      targetPort: 80      # Container port
  type: ClusterIP         # Internal only`}
        />

        <AnalogyCallout
          analogy="YAML is like a blueprint for a building"
          explanation="You don't build a house by shouting instructions at construction workers in real time. You draw a blueprint (YAML), hand it to the construction manager (API server), and they ensure the building (cluster state) matches the blueprint. If something breaks, they refer back to the blueprint and fix it."
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Using tabs instead of spaces in YAML", correction: "YAML only allows spaces for indentation. Use 2 spaces consistently." },
            { mistake: "selector.matchLabels doesn't match template labels", correction: "The Deployment selector MUST match the pod template labels exactly, or the Deployment can't find its pods." },
            { mistake: "Forgetting apiVersion or kind", correction: "Every manifest needs apiVersion and kind. Check the API reference for correct values." },
            { mistake: "Wrong indentation level", correction: "YAML is whitespace-sensitive. A misplaced space can change the entire meaning. Use a YAML linter." },
            { mistake: "Putting spec fields under metadata", correction: "Each section has specific fields. containers goes under spec, not metadata." },
          ]}
        />

        <QuizCard
          title="YAML Quiz"
          questions={[
            {
              question: "What are the 4 required top-level fields in a Kubernetes manifest?",
              options: ["name, type, config, data", "apiVersion, kind, metadata, spec", "version, resource, labels, containers", "api, object, meta, definition"],
              correctIndex: 1,
              explanation: "Every Kubernetes manifest requires apiVersion, kind, metadata, and spec."
            },
            {
              question: "What happens if selector.matchLabels doesn't match the pod template labels in a Deployment?",
              options: ["It auto-corrects", "The Deployment can't find or manage its pods", "Labels are optional", "It creates pods without labels"],
              correctIndex: 1,
              explanation: "The selector is how the Deployment identifies which pods belong to it. A mismatch means it can't manage any pods."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Yaml;
