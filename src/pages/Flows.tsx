import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import FlowDiagram from "@/components/learning/FlowDiagram";
import AnalogyCallout from "@/components/learning/AnalogyCallout";

const flows = [
  {
    title: "🚀 What Happens When You: kubectl apply -f deployment.yaml",
    steps: [
      { label: "kubectl parses the YAML", description: "kubectl reads the file, validates basic structure, converts YAML to JSON." },
      { label: "HTTP request sent to API server", description: "kubectl sends a POST/PUT request with the JSON payload to the API server endpoint." },
      { label: "Authentication & Authorization", description: "API server checks credentials (kubeconfig) and RBAC permissions." },
      { label: "Admission controllers run", description: "Mutating webhooks modify the object (add defaults). Validating webhooks check policies." },
      { label: "Deployment stored in etcd", description: "The Deployment object is persisted. Watch events are sent to controllers." },
      { label: "Deployment controller creates ReplicaSet", description: "The Deployment controller detects the new Deployment and creates a ReplicaSet with the pod template." },
      { label: "ReplicaSet controller creates Pods", description: "The ReplicaSet controller sees 0 pods but spec says 3 — it creates 3 pod objects." },
      { label: "Scheduler assigns nodes", description: "For each pod without a nodeName, the scheduler picks the best node." },
      { label: "kubelet starts containers", description: "Each node's kubelet detects assigned pods, pulls images, and starts containers via CRI." },
      { label: "Pods report Running status", description: "kubelet updates pod status. Deployment shows 3/3 ready." },
    ],
  },
  {
    title: "🌐 What Happens When: External Traffic Reaches Your App via Ingress",
    steps: [
      { label: "User enters URL in browser", description: "Browser resolves app.example.com to the Ingress Controller's external IP via DNS." },
      { label: "Request hits Ingress Controller", description: "The Ingress Controller (nginx/traefik) is typically exposed via a LoadBalancer Service." },
      { label: "Ingress rules are evaluated", description: "Controller checks host and path rules defined in Ingress resources." },
      { label: "Traffic forwarded to Service", description: "The matching Ingress rule specifies which Service to send traffic to." },
      { label: "kube-proxy routes to pod", description: "The Service's iptables/IPVS rules on the node load-balance to a healthy pod IP." },
      { label: "Pod processes request", description: "The container handles the HTTP request and returns a response." },
      { label: "Response travels back", description: "Response follows the reverse path: pod → kube-proxy → Ingress Controller → user." },
    ],
  },
  {
    title: "📦 What Happens When: A Pod Gets Scheduled",
    steps: [
      { label: "Pod object appears with no nodeName", description: "A controller or user creates a pod. It has spec but no nodeName — it's 'unscheduled'." },
      { label: "Scheduler picks up the pod", description: "kube-scheduler watches for unscheduled pods and adds this one to its queue." },
      { label: "Filtering phase", description: "Nodes that can't run the pod are eliminated: insufficient CPU/memory, taints, affinity mismatches." },
      { label: "Scoring phase", description: "Remaining nodes are scored: resource balance, topology spread, image locality, affinity preferences." },
      { label: "Node selected", description: "The highest-scoring node wins. Ties are broken randomly." },
      { label: "Binding written", description: "Scheduler sends a Binding object to API server, setting pod's nodeName." },
      { label: "kubelet takes over", description: "The kubelet on the selected node detects the pod and begins container creation." },
    ],
  },
  {
    title: "💾 What Happens When: A PVC Binds to a PV",
    steps: [
      { label: "PVC created with storage request", description: "Developer creates a PVC asking for 10Gi of ReadWriteOnce storage." },
      { label: "PV controller checks for matches", description: "The PV controller looks for an available PV that satisfies the PVC's requirements." },
      { label: "Static: existing PV found", description: "If a pre-created PV matches (capacity, access mode, storage class), it's bound." },
      { label: "Dynamic: StorageClass creates PV", description: "If no match exists, the StorageClass provisioner creates a new PV (e.g., AWS EBS volume)." },
      { label: "PVC and PV are bound", description: "Both objects reference each other. PVC status changes to Bound." },
      { label: "Pod references PVC", description: "When a pod uses this PVC, kubelet mounts the volume into the container." },
    ],
  },
  {
    title: "🔄 What Happens When: A Deployment Scales Up",
    steps: [
      { label: "Replica count updated", description: "User or HPA changes Deployment spec.replicas from 3 to 5." },
      { label: "Deployment controller detects change", description: "The controller compares desired replicas (5) with current ReplicaSet replicas (3)." },
      { label: "ReplicaSet updated", description: "Deployment controller updates the ReplicaSet's spec.replicas to 5." },
      { label: "ReplicaSet controller creates pods", description: "ReplicaSet sees 3 actual pods but needs 5. Creates 2 new pod objects." },
      { label: "Scheduler assigns nodes", description: "The 2 new pods enter the scheduling queue and get assigned to nodes." },
      { label: "kubelet starts containers", description: "Pods transition: Pending → ContainerCreating → Running." },
      { label: "Endpoints updated", description: "New pod IPs are added to the Service's EndpointSlice. Traffic starts flowing to them." },
    ],
  },
  {
    title: "💀 What Happens When: A Pod Crashes (Self-Healing)",
    steps: [
      { label: "Container exits with error", description: "The main process in the container crashes (exit code non-zero)." },
      { label: "kubelet detects container exit", description: "kubelet monitors all containers and notices the failure." },
      { label: "Restart policy evaluated", description: "Default restartPolicy is Always. kubelet will restart the container." },
      { label: "Container restarted with backoff", description: "First restart is immediate. Subsequent restarts use exponential backoff (10s, 20s, 40s... up to 5min)." },
      { label: "If pod is deleted entirely", description: "ReplicaSet controller detects actual pods < desired. Creates a new pod object." },
      { label: "New pod scheduled and started", description: "The replacement pod goes through the normal scheduling and startup flow." },
      { label: "Service endpoints updated", description: "The failed pod IP is removed and the new pod IP is added to the Service." },
    ],
  },
];

const Flows = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-beginner mb-3 inline-block">All Levels</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Interactive Flows</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Step-by-step walkthroughs of what actually happens inside the cluster for common operations. Trace the exact path from user action to system response.
          </p>
        </motion.div>

        <AnalogyCallout
          analogy="These flows are like X-ray vision for your cluster"
          explanation="Most tutorials show you the 'what'. These flows show you the 'how' — every handoff, every component interaction, every state change. Understanding these flows is what separates surface-level knowledge from deep systems understanding."
        />

        {flows.map((flow, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <FlowDiagram title={flow.title} steps={flow.steps} />
          </motion.div>
        ))}
      </div>
    </Layout>
  );
};

export default Flows;
