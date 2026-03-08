import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import ComparisonTable from "@/components/learning/ComparisonTable";
import FlowDiagram from "@/components/learning/FlowDiagram";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";

const Workloads = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Intermediate</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Workloads & Controllers</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Understand every workload type — Deployments, StatefulSets, DaemonSets, Jobs — when to use each, and how they behave during updates, failures, and scaling.
          </p>
        </motion.div>

        <LayeredExplanation
          title="Deployment"
          simple={<p>A Deployment is the most common way to run stateless applications. You tell it "I want 3 copies of my web server," and it handles creating, updating, and restarting those copies.</p>}
          technical={
            <div className="space-y-3">
              <p>A Deployment manages ReplicaSets, which in turn manage Pods. When you update a Deployment (e.g., new image version), it creates a <strong>new ReplicaSet</strong> and gradually shifts pods from old → new (rolling update).</p>
              <p>Key features: rolling updates, rollback via <code className="font-mono text-xs">revision history</code>, scaling, and pause/resume.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Rolling update mechanics:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li>New ReplicaSet is created with updated pod template</li>
                <li>New RS scales up by <code className="font-mono text-xs">maxSurge</code> pods</li>
                <li>Old RS scales down by <code className="font-mono text-xs">maxUnavailable</code> pods</li>
                <li>Process repeats until all pods are on the new version</li>
                <li>Old RS is kept (scaled to 0) for rollback capability</li>
              </ol>
              <p><code className="font-mono text-xs">revisionHistoryLimit</code> controls how many old ReplicaSets to keep.</p>
            </div>
          }
        />

        <CodeBlock
          title="Deployment with Rolling Update"
          language="yaml"
          code={`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # Max extra pods during update
      maxUnavailable: 0     # Zero downtime
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - containerPort: 80`}
        />

        <FlowDiagram
          title="Rolling Update Flow"
          steps={[
            { label: "You update the image tag", description: "Change image from nginx:1.24 to nginx:1.25 via kubectl set image or editing the YAML." },
            { label: "New ReplicaSet created", description: "Deployment controller creates ReplicaSet-v2 with the new pod template." },
            { label: "New pod starts", description: "RS-v2 scales up by 1 (maxSurge). New pod pulls image and starts." },
            { label: "Readiness check passes", description: "Once the new pod passes readiness probes, it's considered ready." },
            { label: "Old pod terminates", description: "RS-v1 scales down by 1. Old pod receives SIGTERM and shuts down gracefully." },
            { label: "Repeat until complete", description: "Process continues until all pods are running the new version. RS-v1 has 0 replicas." },
          ]}
        />

        <LayeredExplanation
          title="StatefulSet"
          simple={<p>StatefulSet is for applications that need stable identity — like databases. Each pod gets a permanent name (my-db-0, my-db-1, my-db-2) and its own persistent storage that survives restarts.</p>}
          technical={
            <div className="space-y-3">
              <p>StatefulSets provide:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Stable pod names</strong>: Predictable ordinal naming (pod-0, pod-1, pod-2)</li>
                <li><strong>Stable DNS</strong>: Each pod gets a DNS record via headless Service</li>
                <li><strong>Stable storage</strong>: PVCs are created per-pod and persist across restarts</li>
                <li><strong>Ordered operations</strong>: Pods are created/deleted in order (0→1→2 / 2→1→0)</li>
              </ul>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>StatefulSet controller behavior:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li>Each pod is created sequentially — pod-1 only starts after pod-0 is Ready</li>
                <li>On delete, pods are removed in reverse order</li>
                <li>PVCs are NOT deleted when the StatefulSet is deleted (data safety)</li>
                <li>Updates default to <code className="font-mono text-xs">RollingUpdate</code> in reverse ordinal order</li>
                <li>Headless Service (clusterIP: None) creates per-pod DNS: <code className="font-mono text-xs">pod-0.my-svc.ns.svc.cluster.local</code></li>
              </ul>
            </div>
          }
        />

        <AnalogyCallout
          analogy="Deployment vs StatefulSet: Cattle vs Pets"
          explanation="Deployment pods are like cattle — interchangeable, numbered, replaceable. If one dies, you get a new one and don't care about its name. StatefulSet pods are like pets — each has a name, its own stuff (storage), and needs to be treated individually. A database is a pet; a web server is cattle."
        />

        <ComparisonTable
          title="Workload Controllers Compared"
          headers={["Feature", "Deployment", "StatefulSet", "DaemonSet", "Job"]}
          rows={[
            { label: "Use case", values: ["Stateless apps", "Stateful apps", "Node agents", "Batch tasks"] },
            { label: "Pod naming", values: ["Random hash", "Ordinal (0,1,2)", "Per-node", "Random hash"] },
            { label: "Scaling", values: ["Any count", "Ordered scale", "One per node", "Parallelism"] },
            { label: "Storage", values: ["Shared/none", "Per-pod PVC", "Usually hostPath", "Ephemeral"] },
            { label: "Updates", values: ["Rolling", "Rolling (ordered)", "Rolling", "N/A"] },
            { label: "Completion", values: ["Runs forever", "Runs forever", "Runs forever", "Runs to completion"] },
          ]}
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Using Deployment for databases", correction: "Databases need stable storage and identity. Use StatefulSet with persistent volumes." },
            { mistake: "Creating pods directly", correction: "Always use a controller (Deployment, Job, etc.). Direct pods aren't restarted if a node fails." },
            { mistake: "Ignoring update strategy", correction: "The default RollingUpdate works for most cases, but set maxUnavailable: 0 for zero-downtime updates." },
            { mistake: "Expecting CronJob to run exactly on time", correction: "CronJobs may miss schedules. Set startingDeadlineSeconds and concurrencyPolicy appropriately." },
          ]}
        />

        <QuizCard
          title="Workloads Quiz"
          questions={[
            {
              question: "What creates and manages Pods in a Deployment?",
              options: ["The Deployment directly", "ReplicaSet", "kubelet", "Scheduler"],
              correctIndex: 1,
              explanation: "Deployments manage ReplicaSets, and ReplicaSets manage Pods. The Deployment controller creates a new ReplicaSet for each update."
            },
            {
              question: "What happens to PVCs when you delete a StatefulSet?",
              options: ["They're deleted too", "They're retained", "They're scaled down", "Depends on reclaim policy"],
              correctIndex: 1,
              explanation: "PVCs created by a StatefulSet are NOT deleted when the StatefulSet is deleted. This is a safety feature to prevent accidental data loss."
            },
            {
              question: "Which controller ensures exactly one pod runs on every node?",
              options: ["Deployment", "ReplicaSet", "DaemonSet", "StatefulSet"],
              correctIndex: 2,
              explanation: "DaemonSet ensures one pod per node (or selected nodes). Common uses: log collectors, monitoring agents, network plugins."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Workloads;
