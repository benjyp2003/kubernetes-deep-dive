import type { SimulatorScenario } from "../types";

const podCreation3D: SimulatorScenario = {
  id: "pod-creation-3d",
  title: "Pod Creation Flow",
  subtitle: "What happens when you run kubectl apply pod.yaml",
  icon: "🚀",
  components: [
    { id: "user", label: "User", type: "user", description: "The operator running kubectl commands against the cluster.", position: [-5, 0, 0] },
    { id: "kubectl", label: "kubectl", type: "user", description: "CLI tool that converts commands into API requests and sends them to the API server.", position: [-3, 0, 0] },
    { id: "apiserver", label: "API Server", type: "controlplane", description: "The front door to Kubernetes. Validates requests, runs admission controllers, and persists objects to etcd.", position: [0, 2, 0] },
    { id: "etcd", label: "etcd", type: "controlplane", description: "Distributed key-value store that holds the entire cluster state. The single source of truth.", position: [0, 4, -1] },
    { id: "scheduler", label: "Scheduler", type: "controlplane", description: "Watches for pods with no assigned node. Filters and scores nodes to find the best fit.", position: [2, 3, 1] },
    { id: "nodeA", label: "Node A", type: "node", description: "A worker machine running kubelet that can host pods.", position: [3, 0, -1] },
    { id: "kubelet", label: "kubelet", type: "pod", description: "The agent on each node that manages pod lifecycle and reports status.", position: [3, 0.5, 1] },
    { id: "runtime", label: "Container Runtime", type: "pod", description: "CRI-compliant runtime (containerd/CRI-O) that actually creates and runs containers.", position: [4.5, -0.5, 0] },
    { id: "pod", label: "Pod (Running)", type: "pod", description: "The smallest deployable unit, now running on the node.", position: [3, -1.2, 0] },
  ],
  connections: [
    { id: "c1", from: "user", to: "kubectl" },
    { id: "c2", from: "kubectl", to: "apiserver" },
    { id: "c3", from: "apiserver", to: "etcd" },
    { id: "c4", from: "scheduler", to: "apiserver" },
    { id: "c5", from: "apiserver", to: "kubelet" },
    { id: "c6", from: "kubelet", to: "runtime" },
    { id: "c7", from: "runtime", to: "pod" },
    { id: "c8", from: "pod", to: "apiserver" },
  ],
  steps: [
    {
      title: "User runs kubectl apply",
      description: "The user executes `kubectl apply -f pod.yaml`. kubectl reads the manifest and prepares an HTTP POST request.",
      activeComponents: ["user", "kubectl"],
      activeConnections: ["c1"],
      packets: [{ from: "user", to: "kubectl", color: "blue", label: "YAML" }],
    },
    {
      title: "Request sent to API Server",
      description: "kubectl sends the JSON payload to the API server's REST endpoint. The request includes authentication credentials.",
      activeComponents: ["kubectl", "apiserver"],
      activeConnections: ["c2"],
      packets: [{ from: "kubectl", to: "apiserver", color: "blue", label: "POST" }],
    },
    {
      title: "Validation & persistence to etcd",
      description: "API server authenticates, checks RBAC, runs admission controllers, then writes the pod object to etcd.",
      activeComponents: ["apiserver", "etcd"],
      activeConnections: ["c3"],
      packets: [{ from: "apiserver", to: "etcd", color: "blue", label: "store" }],
    },
    {
      title: "Scheduler detects unscheduled pod",
      description: "The scheduler watches the API server and finds a pod with no `nodeName`. It begins evaluating nodes.",
      activeComponents: ["scheduler", "apiserver"],
      activeConnections: ["c4"],
      packets: [{ from: "scheduler", to: "apiserver", color: "blue", label: "watch" }],
    },
    {
      title: "Scheduler binds pod to node",
      description: "After filtering and scoring nodes, the scheduler writes a Binding object back to the API server, assigning the pod to Node A.",
      activeComponents: ["scheduler", "apiserver", "nodeA"],
      activeConnections: ["c4"],
      packets: [{ from: "scheduler", to: "apiserver", color: "blue", label: "bind" }],
    },
    {
      title: "kubelet receives assignment",
      description: "The kubelet on Node A watches the API server and sees a new pod assigned to its node.",
      activeComponents: ["apiserver", "kubelet", "nodeA"],
      activeConnections: ["c5"],
      packets: [{ from: "apiserver", to: "kubelet", color: "green", label: "assign" }],
    },
    {
      title: "Container runtime creates containers",
      description: "kubelet calls the container runtime via CRI to pull images and create containers inside the pod.",
      activeComponents: ["kubelet", "runtime"],
      activeConnections: ["c6"],
      packets: [{ from: "kubelet", to: "runtime", color: "green", label: "CRI" }],
    },
    {
      title: "Pod is now running",
      description: "Containers start, readiness probes pass, and kubelet updates the pod status to Running via the API server.",
      activeComponents: ["runtime", "pod", "apiserver"],
      activeConnections: ["c7", "c8"],
      packets: [
        { from: "runtime", to: "pod", color: "green", label: "start" },
        { from: "pod", to: "apiserver", color: "blue", label: "Running" },
      ],
    },
  ],
};

export default podCreation3D;
