import type { SimulatorScenario } from "../types";

const dnsResolution3D: SimulatorScenario = {
  id: "dns-resolution-3d",
  title: "DNS Resolution",
  subtitle: "How pods resolve service names to cluster IPs",
  icon: "🌐",
  components: [
    { id: "pod", label: "Client Pod", type: "pod", description: "A pod that needs to reach another service by name.", position: [-4, 0, 0] },
    { id: "coredns", label: "CoreDNS", type: "dns", description: "The cluster DNS server that resolves service names to ClusterIP addresses.", position: [0, 2, 0] },
    { id: "service", label: "Target Service", type: "service", description: "The service whose ClusterIP will be returned by DNS.", position: [3, 1, 0] },
    { id: "ep", label: "EndpointSlice", type: "dns", description: "Maps the service to actual pod IPs for traffic routing.", position: [3, -1, 1] },
    { id: "target", label: "Target Pod", type: "pod", description: "The backend pod that ultimately receives the traffic.", position: [5, 0, 0] },
  ],
  connections: [
    { id: "c1", from: "pod", to: "coredns" },
    { id: "c2", from: "coredns", to: "service" },
    { id: "c3", from: "pod", to: "service" },
    { id: "c4", from: "service", to: "ep" },
    { id: "c5", from: "service", to: "target" },
  ],
  steps: [
    { title: "Pod initiates DNS lookup", description: "The pod's application calls `my-svc.default.svc.cluster.local`. The container's /etc/resolv.conf points to CoreDNS.", activeComponents: ["pod"], activeConnections: [], packets: [] },
    { title: "DNS query to CoreDNS", description: "A UDP DNS query is sent to the CoreDNS pods running in kube-system namespace.", activeComponents: ["pod", "coredns"], activeConnections: ["c1"], packets: [{ from: "pod", to: "coredns", color: "blue" }] },
    { title: "CoreDNS resolves service", description: "CoreDNS looks up the service record and returns the ClusterIP address.", activeComponents: ["coredns", "service"], activeConnections: ["c2"], packets: [{ from: "coredns", to: "service", color: "blue" }] },
    { title: "Pod sends traffic to ClusterIP", description: "With the IP resolved, the pod sends its HTTP request to the service ClusterIP.", activeComponents: ["pod", "service"], activeConnections: ["c3"], packets: [{ from: "pod", to: "service", color: "green" }] },
    { title: "Traffic reaches target pod", description: "The service routes traffic through EndpointSlice to a healthy backend pod.", activeComponents: ["service", "ep", "target"], activeConnections: ["c4", "c5"], packets: [{ from: "service", to: "target", color: "green" }] },
  ],
};

export default dnsResolution3D;
