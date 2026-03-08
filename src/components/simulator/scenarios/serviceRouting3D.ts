import type { SimulatorScenario } from "../types";

const serviceRouting3D: SimulatorScenario = {
  id: "service-routing-3d",
  title: "Service Routing",
  subtitle: "How a Service routes traffic to backend pods",
  icon: "🔀",
  components: [
    { id: "client", label: "Client Pod", type: "pod", description: "A pod making a request to a service ClusterIP.", position: [-4, 0, 0] },
    { id: "service", label: "Service", type: "service", description: "Virtual IP abstraction that load-balances traffic across healthy pods.", position: [-1, 1, 0] },
    { id: "kubeproxy", label: "kube-proxy", type: "network", description: "Programs iptables/IPVS rules on each node to route service traffic.", position: [-1, -1, 1.5] },
    { id: "ep", label: "EndpointSlice", type: "dns", description: "Tracks the IP addresses of all pods matching the service selector.", position: [1.5, 2, 0] },
    { id: "pod1", label: "Backend Pod 1", type: "pod", description: "One of the healthy backend pods selected by the service.", position: [3, 0, -1.5] },
    { id: "pod2", label: "Backend Pod 2", type: "pod", description: "Another backend pod receiving load-balanced traffic.", position: [3, 0, 0] },
    { id: "pod3", label: "Backend Pod 3", type: "pod", description: "Third backend pod in the service endpoint list.", position: [3, 0, 1.5] },
  ],
  connections: [
    { id: "c1", from: "client", to: "service" },
    { id: "c2", from: "service", to: "kubeproxy" },
    { id: "c3", from: "kubeproxy", to: "pod1" },
    { id: "c4", from: "kubeproxy", to: "pod2" },
    { id: "c5", from: "kubeproxy", to: "pod3" },
    { id: "c6", from: "service", to: "ep" },
  ],
  steps: [
    { title: "Client sends request", description: "A pod sends an HTTP request to the service's ClusterIP address.", activeComponents: ["client", "service"], activeConnections: ["c1"], packets: [{ from: "client", to: "service", color: "green" }] },
    { title: "kube-proxy intercepts", description: "kube-proxy has programmed iptables/IPVS rules that intercept traffic to the service VIP.", activeComponents: ["service", "kubeproxy"], activeConnections: ["c2"], packets: [{ from: "service", to: "kubeproxy", color: "green" }] },
    { title: "EndpointSlice consulted", description: "kube-proxy knows which pods are healthy via the EndpointSlice that tracks pod IPs.", activeComponents: ["service", "ep", "kubeproxy"], activeConnections: ["c6"], packets: [{ from: "service", to: "ep", color: "blue" }] },
    { title: "Traffic forwarded to pod", description: "kube-proxy selects a backend pod (random or round-robin) and forwards the packet directly.", activeComponents: ["kubeproxy", "pod2"], activeConnections: ["c4"], packets: [{ from: "kubeproxy", to: "pod2", color: "green" }] },
    { title: "Response returned", description: "The backend pod processes the request and sends the response directly back to the client pod.", activeComponents: ["pod2", "client", "pod1", "pod3"], activeConnections: ["c3", "c4", "c5"], packets: [{ from: "kubeproxy", to: "pod1", color: "green" }, { from: "kubeproxy", to: "pod2", color: "green" }, { from: "kubeproxy", to: "pod3", color: "green" }] },
  ],
};

export default serviceRouting3D;
