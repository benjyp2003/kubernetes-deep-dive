import type { Scenario } from "./types";

const schedulerDecision: Scenario = {
  id: "scheduler-decision",
  title: "Scheduler Decision Flow",
  subtitle: "How the scheduler picks the best node for a pod",
  icon: "🎯",
  category: "Core",
  relatedPage: "/scheduling",
  nodes: [
    { id: "pod", label: "Unscheduled Pod", type: "pod", icon: "🫛", description: "Pod with no nodeName — waiting for scheduler", position: { x: 50, y: 200 } },
    { id: "scheduler", label: "kube-scheduler", type: "controller", icon: "📋", description: "Watches for unscheduled pods and assigns them to nodes", position: { x: 280, y: 200 } },
    { id: "apiserver", label: "API Server", type: "controlplane", icon: "🎛️", position: { x: 280, y: 50 } },
    { id: "node1", label: "Node 1 (4 CPU, 8Gi)", type: "worker", icon: "🖥️", description: "Has resources but tainted with NoSchedule", position: { x: 550, y: 80 } },
    { id: "node2", label: "Node 2 (2 CPU, 4Gi)", type: "worker", icon: "🖥️", description: "Insufficient resources for the pod", position: { x: 550, y: 220 } },
    { id: "node3", label: "Node 3 (8 CPU, 16Gi)", type: "worker", icon: "🖥️", description: "Best fit — most available resources, no taints", position: { x: 550, y: 360 } },
  ],
  edges: [
    { id: "e1", source: "pod", target: "scheduler", label: "detected" },
    { id: "e2", source: "scheduler", target: "apiserver", label: "watch pods" },
    { id: "e3", source: "scheduler", target: "node1", label: "filter: tainted ❌" },
    { id: "e4", source: "scheduler", target: "node2", label: "filter: no resources ❌" },
    { id: "e5", source: "scheduler", target: "node3", label: "score: best fit ✅" },
    { id: "e6", source: "scheduler", target: "apiserver", label: "write Binding" },
  ],
  steps: [
    { title: "Unscheduled pod detected", description: "The scheduler watches the API server for pods with no spec.nodeName. When it finds one, it adds it to the scheduling queue.", activeNodes: ["pod", "scheduler", "apiserver"], activeEdges: ["e1", "e2"] },
    { title: "Filtering phase begins", description: "The scheduler evaluates every node against a set of filter plugins: resource requests, node selectors, taints, affinity rules, topology constraints.", activeNodes: ["scheduler", "node1", "node2", "node3"], activeEdges: ["e3", "e4", "e5"] },
    { title: "Node 1 filtered out (taint)", description: "Node 1 has a NoSchedule taint that the pod doesn't tolerate. The scheduler eliminates it from consideration.", activeNodes: ["scheduler", "node1"], activeEdges: ["e3"] },
    { title: "Node 2 filtered out (resources)", description: "Node 2 doesn't have enough CPU/memory to satisfy the pod's resource requests. It's also filtered out.", activeNodes: ["scheduler", "node2"], activeEdges: ["e4"] },
    { title: "Node 3 scores highest", description: "Node 3 passes all filters. In the scoring phase, it gets the highest score based on resource balance, image locality, and topology spread.", activeNodes: ["scheduler", "node3"], activeEdges: ["e5"] },
    { title: "Binding written to API server", description: "The scheduler creates a Binding object, setting the pod's nodeName to Node 3. The API server stores this, and the kubelet on Node 3 picks up the pod.", activeNodes: ["scheduler", "apiserver", "node3"], activeEdges: ["e6"] },
  ],
};

export default schedulerDecision;
