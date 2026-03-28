import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";
import TaintsDeepDive from "@/components/learning/labels/TaintsDeepDive";

const Scheduling = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Intermediate → Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Scheduling & Placement</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            How Kubernetes decides where pods run — taints, tolerations, affinity, anti-affinity, and topology constraints.
          </p>
        </motion.div>

        <LayeredExplanation
          title="How the Scheduler Works"
          simple={
            <p>When you create a pod, Kubernetes doesn't just throw it on a random server. The Scheduler carefully picks the best node — like a hotel manager assigning rooms based on guest preferences, room availability, and special requirements.</p>
          }
          technical={
            <div className="space-y-3">
              <p>The <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kube-scheduler</code> watches for pods with no <code className="font-mono text-xs">nodeName</code>. For each pod, it runs two phases:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li><strong>Filtering</strong> — Remove nodes that can't run the pod (resources, taints, affinity)</li>
                <li><strong>Scoring</strong> — Rank remaining nodes by preference (balance, spread, priority)</li>
              </ol>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>The scheduler uses a plugin-based architecture. Filter plugins: NodeResourcesFit, NodeAffinity, TaintToleration, PodTopologySpread. Score plugins: NodeResourcesBalancedAllocation, InterPodAffinity, ImageLocality.</p>
              <p>Scheduling happens in two stages: the scheduling cycle (synchronous, picks a node) and the binding cycle (asynchronous, writes the binding to the API server).</p>
            </div>
          }
        />

        <AnalogyCallout
          analogy="Scheduling is like assigning hotel rooms"
          explanation="Guests (pods) have requirements: 'I need a room with a view' (node affinity), 'I don't want to be next to the kitchen' (anti-affinity), 'No smoking rooms' (taints/tolerations). The front desk (scheduler) checks available rooms (nodes), eliminates unsuitable ones, then picks the best match."
        />

        <ComparisonTable
          title="Placement Methods Compared"
          headers={["Method", "What It Does", "When to Use"]}
          rows={[
            { label: "nodeSelector", values: ["Simple label match", "Basic: 'run on SSD nodes'"] },
            { label: "Node Affinity", values: ["Flexible label matching with operators", "Advanced: preferred vs required placement"] },
            { label: "Taints & Tolerations", values: ["Nodes repel pods unless tolerated", "Dedicate nodes, mark unhealthy nodes"] },
            { label: "Pod Affinity", values: ["Attract pods to same topology", "Co-locate related services"] },
            { label: "Pod Anti-Affinity", values: ["Spread pods apart", "High availability across nodes/zones"] },
            { label: "Topology Spread", values: ["Even distribution across domains", "Balance replicas across zones"] },
          ]}
        />

        <LayeredExplanation
          title="Taints and Tolerations"
          simple={
            <p>A taint is like a "keep out" sign on a node. It repels all pods unless a pod has a matching toleration — a permission slip that says "I'm allowed to go there."</p>
          }
          technical={
            <div className="space-y-3">
              <p>Taints have three effects:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>NoSchedule</strong> — New pods won't be scheduled unless they tolerate the taint</li>
                <li><strong>PreferNoSchedule</strong> — Scheduler tries to avoid, but may use if no alternatives</li>
                <li><strong>NoExecute</strong> — Existing pods without toleration are evicted</li>
              </ul>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Taints are key-value pairs with an effect applied to nodes. The TaintToleration filter plugin checks during scheduling. For NoExecute, the node controller continuously monitors and evicts non-tolerating pods.</p>
              <p>Master/control plane nodes are tainted with <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">node-role.kubernetes.io/control-plane:NoSchedule</code> by default — that's why your pods don't run on master nodes.</p>
            </div>
          }
        />

        <TaintsDeepDive />

        <CodeBlock
          title="Node Affinity Example"
          language="yaml"
          code={`apiVersion: v1
kind: Pod
metadata:
  name: gpu-worker
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: gpu-type
                operator: In
                values: ["nvidia-a100", "nvidia-v100"]
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 80
          preference:
            matchExpressions:
              - key: zone
                operator: In
                values: ["us-east-1a"]
  containers:
    - name: ml-training
      image: ml-app:latest`}
        />

        <CodeBlock
          title="Pod Anti-Affinity for High Availability"
          language="yaml"
          code={`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                  - key: app
                    operator: In
                    values: ["web-app"]
              topologyKey: kubernetes.io/hostname
      containers:
        - name: web
          image: nginx:1.25`}
        />

        <FlowDiagram
          title="Scheduling Decision Flow"
          steps={[
            { label: "Pod created without nodeName", description: "A new pod enters the scheduling queue." },
            { label: "Filter: Resource check", description: "Does the node have enough CPU and memory for this pod?" },
            { label: "Filter: Taint check", description: "Does the pod tolerate all taints on the node?" },
            { label: "Filter: Affinity check", description: "Does the node match required node affinity rules?" },
            { label: "Filter: Pod topology", description: "Does placing here satisfy topology spread constraints?" },
            { label: "Score: Balance resources", description: "Prefer nodes with balanced CPU/memory usage." },
            { label: "Score: Pod affinity", description: "Prefer nodes where related pods already run." },
            { label: "Bind to highest-scoring node", description: "Scheduler writes the binding to the API server." },
          ]}
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Confusing taints with labels", correction: "Labels are metadata for selection. Taints actively repel workloads. They solve different problems." },
            { mistake: "Pod stuck in Pending with no errors", correction: "Usually means no node satisfies all constraints. Check taints, resource requests, and affinity rules." },
            { mistake: "Using nodeSelector when you need soft preferences", correction: "nodeSelector is hard — the pod won't schedule if no match. Use preferredDuringScheduling for soft preferences." },
            { mistake: "Forgetting anti-affinity for HA", correction: "Without anti-affinity, all replicas may land on one node. If that node fails, all replicas go down." },
          ]}
        />

        <QuizCard
          title="Scheduling Quiz"
          questions={[
            {
              question: "What happens when a node has a taint with effect NoExecute and a running pod doesn't tolerate it?",
              options: ["Nothing", "Pod is evicted", "Pod continues running", "Taint is removed"],
              correctIndex: 1,
              explanation: "NoExecute actively evicts existing pods that don't tolerate the taint. NoSchedule only prevents new scheduling."
            },
            {
              question: "What's the difference between nodeSelector and node affinity?",
              options: ["They're the same", "nodeSelector is soft, affinity is hard", "nodeSelector is simple hard match, affinity supports operators and preferences", "nodeSelector is deprecated"],
              correctIndex: 2,
              explanation: "nodeSelector is a simple key-value match. Node affinity supports In/NotIn/Exists operators and preferred (soft) vs required (hard) scheduling."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Scheduling;
