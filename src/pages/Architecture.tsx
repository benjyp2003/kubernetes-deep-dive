import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import ArchitectureDiagram from "@/components/learning/ArchitectureDiagram";
import FlowDiagram from "@/components/learning/FlowDiagram";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import QuizCard from "@/components/learning/QuizCard";
import OpenShiftComparison from "@/components/learning/OpenShiftComparison";

const Architecture = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-beginner mb-3 inline-block">Beginner → Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Kubernetes Architecture</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Understand every component in a Kubernetes cluster — what it does, who it talks to, and how they work together as a system.
          </p>
        </motion.div>

        <ArchitectureDiagram
          title="Cluster Architecture Overview"
          controlPlane={[
            { label: "API Server", description: "Front door for all operations. Everything talks to this." },
            { label: "etcd", description: "Key-value store. The cluster's single source of truth." },
            { label: "Scheduler", description: "Assigns unscheduled pods to nodes based on resources and constraints." },
            { label: "Controller Manager", description: "Runs reconciliation loops to maintain desired state." },
          ]}
          workerNode={[
            { label: "kubelet", description: "Node agent. Ensures pods are running as expected." },
            { label: "kube-proxy", description: "Handles network rules for Service routing." },
            { label: "Container Runtime", description: "Runs containers: containerd, CRI-O, etc." },
            { label: "Pods", description: "Your actual workloads running in containers." },
          ]}
        />

        <LayeredExplanation
          title="The API Server"
          simple={
            <p>The API Server is the "front desk" of Kubernetes. Every request — from kubectl, controllers, or the scheduler — goes through it. It's the only component that talks directly to etcd (the database).</p>
          }
          technical={
            <div className="space-y-3">
              <p>The <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kube-apiserver</code> is a REST API that validates and processes all resource operations (CRUD). It handles authentication, authorization (RBAC), admission control, and then persists objects to etcd.</p>
              <p>It also serves as the <strong>watch mechanism hub</strong> — controllers and the scheduler use long-polling watches to get notified of changes to resources they care about.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Request flow through the API server:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li><strong>Authentication</strong> — Who are you? (certificates, tokens, OIDC)</li>
                <li><strong>Authorization</strong> — Can you do this? (RBAC, ABAC, Webhook)</li>
                <li><strong>Admission Control</strong> — Should we allow/modify this? (mutating → validating webhooks)</li>
                <li><strong>Validation</strong> — Is the object well-formed?</li>
                <li><strong>Persistence</strong> — Write to etcd</li>
                <li><strong>Watch Notification</strong> — Notify watchers of the change</li>
              </ol>
            </div>
          }
        />

        <AnalogyCallout
          analogy="etcd is like the cluster's brain memory"
          explanation="Everything Kubernetes 'knows' — what pods exist, what their desired state is, what nodes are available — is stored in etcd. If etcd is lost without backup, the cluster loses all knowledge of itself. That's why etcd backup is critical in production."
        />

        <LayeredExplanation
          title="The Scheduler"
          simple={
            <p>When you create a pod, it doesn't immediately run somewhere. The Scheduler looks at all available nodes and picks the best one based on available resources, constraints, and rules you've set.</p>
          }
          technical={
            <div className="space-y-3">
              <p>The <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kube-scheduler</code> watches for pods with no <code className="font-mono text-xs">nodeName</code> set. For each unscheduled pod, it runs a two-phase process:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li><strong>Filtering</strong> — Eliminate nodes that can't run the pod (insufficient resources, taints, affinity rules)</li>
                <li><strong>Scoring</strong> — Rank remaining nodes by preference (resource balance, topology spread, etc.)</li>
              </ol>
              <p>The highest-scoring node wins, and the scheduler writes a <strong>binding</strong> to the API server.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>The scheduling cycle in detail:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li>Pod enters the scheduling queue</li>
                <li>Scheduler picks the highest-priority unscheduled pod</li>
                <li>Pre-filter plugins run (e.g., check PVC requirements)</li>
                <li>Filter plugins eliminate unfit nodes</li>
                <li>Post-filter runs if no nodes pass (e.g., preemption)</li>
                <li>Score plugins rank remaining nodes</li>
                <li>Normalize scores and pick the winner</li>
                <li>Reserve the node (optimistic binding)</li>
                <li>Run permit/pre-bind/bind/post-bind plugins</li>
                <li>Binding is sent to API server → stored in etcd</li>
              </ol>
            </div>
          }
        />

        <FlowDiagram
          title="What Happens When You Run: kubectl apply -f pod.yaml"
          steps={[
            { label: "kubectl sends HTTP request", description: "kubectl reads pod.yaml, converts it to JSON, and sends a POST/PUT request to the API server." },
            { label: "API Server authenticates & authorizes", description: "The API server checks your identity (kubeconfig credentials) and permissions (RBAC policies)." },
            { label: "Admission controllers process the request", description: "Mutating webhooks can modify the object. Validating webhooks can reject it. Built-in admission controllers also run." },
            { label: "Object is persisted to etcd", description: "The pod object is saved in etcd with status 'Pending'. No node is assigned yet." },
            { label: "Scheduler detects unscheduled pod", description: "The scheduler watches for pods with no nodeName. It runs filtering and scoring to pick the best node." },
            { label: "Scheduler binds pod to node", description: "The scheduler writes a Binding object to the API server, setting the pod's nodeName." },
            { label: "kubelet detects new pod assignment", description: "The kubelet on the chosen node watches for pods assigned to it. It sees the new pod." },
            { label: "kubelet instructs container runtime", description: "kubelet calls the container runtime (via CRI) to pull the image and start the container." },
            { label: "Container starts running", description: "The container runtime creates the container. kubelet reports status back to the API server. Pod transitions from Pending → Running." },
          ]}
        />

        <LayeredExplanation
          title="Controller Manager & Reconciliation"
          simple={
            <p>Controllers are like dedicated managers for specific tasks. The Deployment controller manages Deployments, the ReplicaSet controller manages ReplicaSets, and so on. Each one continuously checks: "Is reality matching what was requested?" If not, it takes action to fix it.</p>
          }
          technical={
            <div className="space-y-3">
              <p>The <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kube-controller-manager</code> runs many controllers as goroutines in a single process. Key controllers include:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Deployment controller</strong> — manages ReplicaSets for rolling updates</li>
                <li><strong>ReplicaSet controller</strong> — ensures correct number of pod replicas</li>
                <li><strong>Node controller</strong> — monitors node health</li>
                <li><strong>Endpoint controller</strong> — populates Endpoints for Services</li>
                <li><strong>ServiceAccount controller</strong> — creates default service accounts</li>
              </ul>
              <p>Each controller uses the <strong>watch-list</strong> pattern: watch the API server for changes, then reconcile.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>The reconciliation loop pattern:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li>Controller starts a <strong>watch</strong> on the API server for its resource type</li>
                <li>Events arrive (ADDED, MODIFIED, DELETED) and are queued</li>
                <li>A worker goroutine picks items from the queue</li>
                <li>For each item, it reads the <strong>desired state</strong> (spec) from the API server</li>
                <li>It observes the <strong>actual state</strong> of the system</li>
                <li>If there's a <strong>drift</strong>, it takes action (create/update/delete sub-resources)</li>
                <li>It updates the <strong>status</strong> subresource to reflect current state</li>
                <li>If an error occurs, the item is re-queued with exponential backoff</li>
              </ol>
              <p>This is the same pattern used by custom operators — it's the core of Kubernetes extensibility.</p>
            </div>
          }
        />

        <OpenShiftComparison
          k8sFeature="kube-controller-manager"
          openshiftFeature="OpenShift Controller Manager + Operators"
          description="OpenShift extends the controller pattern with additional controllers managed through the Cluster Version Operator (CVO) and Operator Lifecycle Manager (OLM). Platform components like the ingress controller, DNS operator, and image registry are all managed as operators."
        />

        <QuizCard
          title="Architecture Quiz"
          questions={[
            {
              question: "Which component is the ONLY one that directly reads/writes to etcd?",
              options: ["Scheduler", "Controller Manager", "API Server", "kubelet"],
              correctIndex: 2,
              explanation: "The API Server is the only component that communicates directly with etcd. All other components interact with the cluster state through the API server."
            },
            {
              question: "What does the Scheduler do when no nodes pass the filtering phase?",
              options: ["Crashes", "Assigns to a random node", "May trigger preemption", "Deletes the pod"],
              correctIndex: 2,
              explanation: "When no nodes pass filtering, the post-filter phase may trigger preemption — evicting lower-priority pods to make room for the pending pod."
            },
            {
              question: "In the reconciliation loop, what does a controller compare?",
              options: ["YAML files vs docs", "Desired state vs actual state", "Node CPU vs memory", "Old version vs new version"],
              correctIndex: 1,
              explanation: "Controllers continuously compare the desired state (spec) with the actual state of the system, and take corrective action when they differ."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Architecture;
