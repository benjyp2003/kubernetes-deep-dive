import type { SimulatorScenario } from "../types";

const scheduler3D: SimulatorScenario = {
  id: "scheduler-3d",
  title: "Scheduler Decision Process",
  subtitle: "How the scheduler evaluates and selects the best node for a pod",
  icon: "🎯",
  components: [
    { id: "pod", label: "Unscheduled Pod", type: "pod", description: "A newly created pod with no node assignment yet.", position: [-4, 2, 0] },
    { id: "scheduler", label: "Scheduler", type: "controlplane", description: "Watches for unscheduled pods and runs filtering + scoring algorithms.", position: [0, 3, 0] },
    { id: "apiserver", label: "API Server", type: "controlplane", description: "Provides node and pod information; receives the final binding.", position: [0, 1, 0] },
    { id: "nodeA", label: "Node A (8 CPU)", type: "node", description: "Worker node with 8 CPU cores and 32GB RAM. Has taint: gpu=true.", position: [3, 0, -2] },
    { id: "nodeB", label: "Node B (4 CPU)", type: "node", description: "Worker node with 4 CPU cores and 16GB RAM. No taints.", position: [3, 0, 0] },
    { id: "nodeC", label: "Node C (2 CPU)", type: "node", description: "Worker node with 2 CPU cores and 8GB RAM. Already 90% utilized.", position: [3, 0, 2] },
  ],
  connections: [
    { id: "c1", from: "pod", to: "scheduler" },
    { id: "c2", from: "scheduler", to: "apiserver" },
    { id: "c3", from: "scheduler", to: "nodeA" },
    { id: "c4", from: "scheduler", to: "nodeB" },
    { id: "c5", from: "scheduler", to: "nodeC" },
    { id: "c6", from: "apiserver", to: "nodeB" },
  ],
  steps: [
    { title: "Unscheduled pod detected", description: "The scheduler's watch loop detects a pod with no `spec.nodeName`. It enters the scheduling queue.", activeComponents: ["pod", "scheduler"], activeConnections: ["c1"], packets: [{ from: "pod", to: "scheduler", color: "blue" }] },
    { title: "Filter phase begins", description: "The scheduler evaluates all nodes against hard constraints: resource requests, taints, affinity rules, etc.", activeComponents: ["scheduler", "nodeA", "nodeB", "nodeC"], activeConnections: ["c3", "c4", "c5"], packets: [{ from: "scheduler", to: "nodeA", color: "blue" }, { from: "scheduler", to: "nodeB", color: "blue" }, { from: "scheduler", to: "nodeC", color: "blue" }] },
    { title: "Node A filtered out", description: "Node A has a taint `gpu=true` that the pod doesn't tolerate. It's removed from candidates.", activeComponents: ["scheduler", "nodeA"], activeConnections: ["c3"], packets: [{ from: "scheduler", to: "nodeA", color: "red" }] },
    { title: "Node C filtered out", description: "Node C doesn't have enough available CPU to satisfy the pod's resource request. Filtered out.", activeComponents: ["scheduler", "nodeC"], activeConnections: ["c5"], packets: [{ from: "scheduler", to: "nodeC", color: "red" }] },
    { title: "Node B selected — best score", description: "Node B passes all filters and scores highest on resource balance. The scheduler writes a Binding.", activeComponents: ["scheduler", "nodeB", "apiserver"], activeConnections: ["c4", "c2"], packets: [{ from: "scheduler", to: "nodeB", color: "green" }] },
    { title: "Pod bound to Node B", description: "The API server updates the pod's `spec.nodeName` to Node B. The kubelet on Node B picks it up.", activeComponents: ["apiserver", "nodeB", "pod"], activeConnections: ["c6"], packets: [{ from: "apiserver", to: "nodeB", color: "green" }] },
  ],
};

export default scheduler3D;
