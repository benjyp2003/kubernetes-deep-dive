import type { Scenario } from "./types";

const dnsResolution: Scenario = {
  id: "dns-resolution",
  title: "DNS Resolution Flow",
  subtitle: "How service names resolve to ClusterIPs inside the cluster",
  icon: "🔍",
  category: "Networking",
  relatedPage: "/services",
  nodes: [
    { id: "pod", label: "App Pod", type: "pod", icon: "📱", description: "Pod making a DNS query for a service name", position: { x: 50, y: 200 } },
    { id: "resolv", label: "/etc/resolv.conf", type: "network", icon: "📄", description: "kubelet injects the CoreDNS ClusterIP as the nameserver", position: { x: 230, y: 200 } },
    { id: "coredns", label: "CoreDNS", type: "controlplane", icon: "🔍", description: "Cluster DNS server that resolves service names to ClusterIPs", position: { x: 430, y: 200 } },
    { id: "apiserver", label: "API Server", type: "controlplane", icon: "🎛️", description: "CoreDNS watches Services and Endpoints via the API server", position: { x: 430, y: 60 } },
    { id: "service", label: "Target Service", type: "service", icon: "🔀", description: "The Service whose ClusterIP is returned", position: { x: 650, y: 200 } },
    { id: "target-pod", label: "Target Pod", type: "pod", icon: "🫛", position: { x: 650, y: 350 } },
  ],
  edges: [
    { id: "e1", source: "pod", target: "resolv", label: "lookup my-svc" },
    { id: "e2", source: "resolv", target: "coredns", label: "DNS query" },
    { id: "e3", source: "coredns", target: "apiserver", label: "watch services" },
    { id: "e4", source: "coredns", target: "resolv", label: "ClusterIP response" },
    { id: "e5", source: "pod", target: "service", label: "connect to ClusterIP" },
    { id: "e6", source: "service", target: "target-pod", label: "route to pod" },
  ],
  steps: [
    { title: "Pod looks up service name", description: "The application in the pod calls `my-svc.default.svc.cluster.local`. The OS reads /etc/resolv.conf to find the DNS server.", activeNodes: ["pod", "resolv"], activeEdges: ["e1"] },
    { title: "DNS query sent to CoreDNS", description: "The query goes to the CoreDNS pod (typically at 10.96.0.10). CoreDNS is deployed as a Deployment in kube-system namespace.", activeNodes: ["resolv", "coredns"], activeEdges: ["e2"] },
    { title: "CoreDNS resolves the name", description: "CoreDNS watches the API server for Service objects. It maintains an in-memory map of service names to ClusterIPs and returns the matching A record.", activeNodes: ["coredns", "apiserver"], activeEdges: ["e3"] },
    { title: "ClusterIP returned to pod", description: "CoreDNS responds with the Service's ClusterIP (e.g., 10.96.45.12). The pod's resolver caches this briefly.", activeNodes: ["coredns", "resolv", "pod"], activeEdges: ["e4"] },
    { title: "Pod connects to ClusterIP", description: "The pod sends its actual request to the resolved ClusterIP. From here, kube-proxy / iptables handles routing to a backend pod.", activeNodes: ["pod", "service"], activeEdges: ["e5"] },
    { title: "Traffic reaches target pod", description: "The Service routes the request to one of its backend pods via kube-proxy rules. The full DNS → Service → Pod chain is complete.", activeNodes: ["service", "target-pod"], activeEdges: ["e6"] },
  ],
};

export default dnsResolution;
