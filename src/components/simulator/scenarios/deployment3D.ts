import type { SimulatorScenario } from "../types";

const deployment3D: SimulatorScenario = {
  id: "deployment-3d",
  title: "Deployment Lifecycle",
  subtitle: "How a Deployment creates and manages ReplicaSets and Pods",
  icon: "📦",
  components: [
    { id: "user", label: "User", type: "user", description: "Creates a Deployment manifest and applies it.", position: [-5, 0, 0] },
    { id: "apiserver", label: "API Server", type: "controlplane", description: "Receives the Deployment object and stores it.", position: [0, 2.5, 0] },
    { id: "ctrlmgr", label: "Controller Manager", type: "controlplane", description: "Runs the Deployment controller that watches for Deployment objects.", position: [-2, 3.5, 1] },
    { id: "deploy", label: "Deployment", type: "service", description: "Declarative object describing desired pod state, replicas, and update strategy.", position: [-1, 1, 0] },
    { id: "rs", label: "ReplicaSet", type: "service", description: "Ensures the specified number of pod replicas are running.", position: [1.5, 0, 0] },
    { id: "scheduler", label: "Scheduler", type: "controlplane", description: "Assigns pods to nodes based on resource fit and constraints.", position: [2, 3.5, -1] },
    { id: "pod1", label: "Pod 1", type: "pod", description: "First replica managed by the ReplicaSet.", position: [3, -1.5, -1.5] },
    { id: "pod2", label: "Pod 2", type: "pod", description: "Second replica managed by the ReplicaSet.", position: [3, -1.5, 0] },
    { id: "pod3", label: "Pod 3", type: "pod", description: "Third replica managed by the ReplicaSet.", position: [3, -1.5, 1.5] },
  ],
  connections: [
    { id: "c1", from: "user", to: "apiserver" },
    { id: "c2", from: "ctrlmgr", to: "apiserver" },
    { id: "c3", from: "apiserver", to: "deploy" },
    { id: "c4", from: "deploy", to: "rs" },
    { id: "c5", from: "rs", to: "pod1" },
    { id: "c6", from: "rs", to: "pod2" },
    { id: "c7", from: "rs", to: "pod3" },
    { id: "c8", from: "scheduler", to: "apiserver" },
  ],
  steps: [
    { title: "User creates Deployment", description: "The user applies a Deployment manifest. The API server validates and stores the object.", activeComponents: ["user", "apiserver"], activeConnections: ["c1"], packets: [{ from: "user", to: "apiserver", color: "blue" }] },
    { title: "Deployment controller activates", description: "The Deployment controller inside Controller Manager detects the new Deployment via its watch loop.", activeComponents: ["ctrlmgr", "apiserver", "deploy"], activeConnections: ["c2", "c3"], packets: [{ from: "ctrlmgr", to: "apiserver", color: "blue" }] },
    { title: "ReplicaSet created", description: "The Deployment controller creates a ReplicaSet with the desired number of replicas.", activeComponents: ["deploy", "rs"], activeConnections: ["c4"], packets: [{ from: "deploy", to: "rs", color: "blue" }] },
    { title: "Pods created by ReplicaSet", description: "The ReplicaSet controller creates 3 pod objects. They are unscheduled initially.", activeComponents: ["rs", "pod1", "pod2", "pod3"], activeConnections: ["c5", "c6", "c7"], packets: [{ from: "rs", to: "pod1", color: "green" }, { from: "rs", to: "pod2", color: "green" }, { from: "rs", to: "pod3", color: "green" }] },
    { title: "Scheduler assigns nodes", description: "The scheduler detects unscheduled pods and assigns each to a suitable node.", activeComponents: ["scheduler", "apiserver", "pod1", "pod2", "pod3"], activeConnections: ["c8"], packets: [{ from: "scheduler", to: "apiserver", color: "blue" }] },
    { title: "All pods running", description: "kubelets on each node start the containers. All 3 replicas become Running.", activeComponents: ["pod1", "pod2", "pod3", "deploy", "rs"], activeConnections: ["c5", "c6", "c7"], packets: [{ from: "rs", to: "pod1", color: "green" }, { from: "rs", to: "pod2", color: "green" }, { from: "rs", to: "pod3", color: "green" }] },
  ],
};

export default deployment3D;
