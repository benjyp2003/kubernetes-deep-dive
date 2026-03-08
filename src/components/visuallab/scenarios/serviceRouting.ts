import type { Scenario } from "./types";

const serviceRouting: Scenario = {
  id: "service-routing",
  title: "Service Routing Flow",
  subtitle: "How a Service routes traffic to backend pods",
  icon: "🔀",
  category: "Networking",
  relatedPage: "/services",
  nodes: [
    { id: "client", label: "Client Pod", type: "pod", icon: "📱", description: "Pod sending a request to a Service", position: { x: 50, y: 220 } },
    { id: "service", label: "Service (ClusterIP)", type: "service", icon: "🔀", description: "Virtual IP that load-balances across pods", position: { x: 280, y: 220 } },
    { id: "kube-proxy", label: "kube-proxy", type: "network", icon: "🌐", description: "Programs iptables/IPVS rules on each node for service routing", position: { x: 280, y: 80 } },
    { id: "endpoints", label: "EndpointSlice", type: "controller", icon: "📋", description: "List of pod IPs that back the Service", position: { x: 500, y: 80 } },
    { id: "pod1", label: "Backend Pod 1", type: "pod", icon: "🫛", position: { x: 500, y: 180 } },
    { id: "pod2", label: "Backend Pod 2", type: "pod", icon: "🫛", position: { x: 500, y: 280 } },
    { id: "pod3", label: "Backend Pod 3", type: "pod", icon: "🫛", position: { x: 500, y: 380 } },
  ],
  edges: [
    { id: "e1", source: "client", target: "service", label: "request to ClusterIP" },
    { id: "e2", source: "kube-proxy", target: "service", label: "programs rules" },
    { id: "e3", source: "endpoints", target: "kube-proxy", label: "pod IPs" },
    { id: "e4", source: "service", target: "pod1", label: "forward (selected)" },
    { id: "e5", source: "service", target: "pod2", label: "forward" },
    { id: "e6", source: "service", target: "pod3", label: "forward" },
    { id: "e7", source: "pod2", target: "client", label: "response" },
  ],
  steps: [
    { title: "Client sends request to Service IP", description: "A pod sends a request to the Service's ClusterIP (e.g., 10.96.0.1:80). This is a virtual IP — no actual interface has this address.", activeNodes: ["client", "service"], activeEdges: ["e1"] },
    { title: "kube-proxy intercepts via iptables/IPVS", description: "kube-proxy has programmed iptables or IPVS rules on every node. These rules intercept traffic to the Service VIP and rewrite the destination.", activeNodes: ["kube-proxy", "service"], activeEdges: ["e2"] },
    { title: "EndpointSlice provides backend IPs", description: "The EndpointSlice controller maintains a list of healthy pod IPs that match the Service's label selector. kube-proxy uses this to build routing rules.", activeNodes: ["endpoints", "kube-proxy"], activeEdges: ["e3"] },
    { title: "Traffic forwarded to selected pod", description: "kube-proxy selects one backend pod (random or round-robin) and DNATs the packet — rewriting the destination IP from the Service VIP to the pod's actual IP.", activeNodes: ["service", "pod2"], activeEdges: ["e5"] },
    { title: "Pod processes and responds", description: "The selected backend pod processes the request and sends the response back. The source IP is rewritten back to the Service VIP (conntrack).", activeNodes: ["pod2", "client"], activeEdges: ["e7"] },
  ],
};

export default serviceRouting;
