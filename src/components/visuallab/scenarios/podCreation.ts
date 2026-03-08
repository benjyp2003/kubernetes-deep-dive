import type { Scenario } from "./types";

const podCreation: Scenario = {
  id: "pod-creation",
  title: "Pod Creation Flow",
  subtitle: "What happens when you run kubectl apply pod.yaml",
  icon: "🚀",
  category: "Core",
  relatedPage: "/objects",
  nodes: [
    { id: "user", label: "User", type: "user", icon: "👤", description: "The operator running kubectl", position: { x: 50, y: 250 } },
    { id: "kubectl", label: "kubectl", type: "user", icon: "⌨️", description: "CLI tool that sends API requests", position: { x: 200, y: 250 } },
    { id: "apiserver", label: "API Server", type: "controlplane", icon: "🎛️", description: "Central hub that validates and processes all API requests", position: { x: 400, y: 250 } },
    { id: "etcd", label: "etcd", type: "controlplane", icon: "💿", description: "Distributed key-value store — the cluster's source of truth", position: { x: 400, y: 80 } },
    { id: "scheduler", label: "Scheduler", type: "controller", icon: "📋", description: "Watches for unscheduled pods and assigns them to nodes", position: { x: 600, y: 150 } },
    { id: "kubelet", label: "kubelet", type: "worker", icon: "🖥️", description: "Agent on each node that manages pod lifecycle", position: { x: 750, y: 250 } },
    { id: "runtime", label: "Container Runtime", type: "worker", icon: "🐳", description: "CRI-compliant runtime (containerd, CRI-O) that runs containers", position: { x: 750, y: 400 } },
    { id: "pod", label: "Pod (Running)", type: "pod", icon: "🫛", description: "The smallest deployable unit, now running on the node", position: { x: 600, y: 400 } },
  ],
  edges: [
    { id: "e1", source: "user", target: "kubectl", label: "runs command" },
    { id: "e2", source: "kubectl", target: "apiserver", label: "HTTP POST" },
    { id: "e3", source: "apiserver", target: "etcd", label: "persist object" },
    { id: "e4", source: "scheduler", target: "apiserver", label: "watch & bind" },
    { id: "e5", source: "apiserver", target: "kubelet", label: "pod assigned" },
    { id: "e6", source: "kubelet", target: "runtime", label: "CRI: create" },
    { id: "e7", source: "runtime", target: "pod", label: "container starts" },
    { id: "e8", source: "pod", target: "apiserver", label: "status: Running" },
  ],
  steps: [
    { title: "User runs kubectl apply", description: "The user executes `kubectl apply -f pod.yaml`. kubectl reads the YAML file, validates basic structure, and converts it to JSON.", activeNodes: ["user", "kubectl"], activeEdges: ["e1"] },
    { title: "HTTP request to API Server", description: "kubectl sends an HTTP POST request with the JSON payload to the Kubernetes API server endpoint (e.g., /api/v1/namespaces/default/pods).", activeNodes: ["kubectl", "apiserver"], activeEdges: ["e2"] },
    { title: "API Server validates & persists", description: "The API server authenticates the request, checks RBAC authorization, runs admission controllers (mutating + validating), then stores the pod object in etcd.", activeNodes: ["apiserver", "etcd"], activeEdges: ["e3"] },
    { title: "Scheduler detects unscheduled pod", description: "The scheduler watches the API server for pods with no `nodeName`. It picks up this new pod and evaluates all nodes.", activeNodes: ["scheduler", "apiserver"], activeEdges: ["e4"] },
    { title: "Scheduler selects best node", description: "The scheduler filters nodes (resource fit, taints, affinity), scores them, selects the best one, and writes a Binding back to the API server.", activeNodes: ["scheduler", "apiserver"], activeEdges: ["e4"] },
    { title: "kubelet receives pod assignment", description: "The kubelet on the selected node watches the API server and detects a new pod assigned to its node.", activeNodes: ["apiserver", "kubelet"], activeEdges: ["e5"] },
    { title: "Container runtime creates containers", description: "kubelet calls the container runtime (containerd/CRI-O) via the CRI interface to pull images and create containers.", activeNodes: ["kubelet", "runtime"], activeEdges: ["e6"] },
    { title: "Containers start running", description: "The container runtime starts all containers in the pod. Init containers run first, then app containers.", activeNodes: ["runtime", "pod"], activeEdges: ["e7"] },
    { title: "Pod reports Running status", description: "kubelet updates the pod status to Running via the API server. The pod is now serving traffic.", activeNodes: ["pod", "apiserver"], activeEdges: ["e8"] },
  ],
};

export default podCreation;
