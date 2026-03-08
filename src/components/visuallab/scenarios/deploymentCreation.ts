import type { Scenario } from "./types";

const deploymentCreation: Scenario = {
  id: "deployment-creation",
  title: "Deployment Lifecycle",
  subtitle: "Creating a Deployment and rolling update process",
  icon: "📦",
  category: "Core",
  relatedPage: "/workloads",
  nodes: [
    { id: "user", label: "User", type: "user", icon: "👤", position: { x: 50, y: 200 } },
    { id: "apiserver", label: "API Server", type: "controlplane", icon: "🎛️", position: { x: 250, y: 200 } },
    { id: "etcd", label: "etcd", type: "controlplane", icon: "💿", position: { x: 250, y: 50 } },
    { id: "deploy-ctrl", label: "Deployment Controller", type: "controller", icon: "⚙️", description: "Watches Deployments, manages ReplicaSets", position: { x: 450, y: 100 } },
    { id: "rs", label: "ReplicaSet", type: "controller", icon: "📋", description: "Ensures the desired number of pod replicas", position: { x: 450, y: 300 } },
    { id: "scheduler", label: "Scheduler", type: "controller", icon: "📋", position: { x: 650, y: 100 } },
    { id: "pod1", label: "Pod 1", type: "pod", icon: "🫛", position: { x: 600, y: 280 } },
    { id: "pod2", label: "Pod 2", type: "pod", icon: "🫛", position: { x: 700, y: 350 } },
    { id: "pod3", label: "Pod 3", type: "pod", icon: "🫛", position: { x: 800, y: 280 } },
  ],
  edges: [
    { id: "e1", source: "user", target: "apiserver", label: "create deployment" },
    { id: "e2", source: "apiserver", target: "etcd", label: "persist" },
    { id: "e3", source: "deploy-ctrl", target: "apiserver", label: "watch deployments" },
    { id: "e4", source: "deploy-ctrl", target: "rs", label: "create ReplicaSet" },
    { id: "e5", source: "rs", target: "pod1", label: "create pod" },
    { id: "e6", source: "rs", target: "pod2", label: "create pod" },
    { id: "e7", source: "rs", target: "pod3", label: "create pod" },
    { id: "e8", source: "scheduler", target: "pod1", label: "assign node" },
    { id: "e9", source: "scheduler", target: "pod2", label: "assign node" },
    { id: "e10", source: "scheduler", target: "pod3", label: "assign node" },
  ],
  steps: [
    { title: "Deployment object created", description: "User submits a Deployment manifest. API server validates it and stores it in etcd.", activeNodes: ["user", "apiserver", "etcd"], activeEdges: ["e1", "e2"] },
    { title: "Deployment controller reacts", description: "The Deployment controller watches for new/changed Deployments via the API server. It detects this new Deployment.", activeNodes: ["deploy-ctrl", "apiserver"], activeEdges: ["e3"] },
    { title: "ReplicaSet created", description: "The Deployment controller creates a ReplicaSet with the pod template and desired replica count (e.g., 3).", activeNodes: ["deploy-ctrl", "rs"], activeEdges: ["e4"] },
    { title: "ReplicaSet creates pods", description: "The ReplicaSet controller sees 0 actual pods but 3 desired. It creates 3 pod objects.", activeNodes: ["rs", "pod1", "pod2", "pod3"], activeEdges: ["e5", "e6", "e7"] },
    { title: "Scheduler assigns nodes", description: "The scheduler detects 3 unscheduled pods and assigns each to the best available node.", activeNodes: ["scheduler", "pod1", "pod2", "pod3"], activeEdges: ["e8", "e9", "e10"] },
    { title: "All pods running", description: "kubelets on each node start the containers. The Deployment shows 3/3 ready replicas.", activeNodes: ["pod1", "pod2", "pod3", "rs", "deploy-ctrl"], activeEdges: ["e5", "e6", "e7"] },
  ],
};

export default deploymentCreation;
