import type { Scenario } from "./types";

const podNetworking: Scenario = {
  id: "pod-networking",
  title: "Pod-to-Pod Networking",
  subtitle: "How pods communicate across nodes via the CNI overlay",
  icon: "🌐",
  category: "Networking",
  relatedPage: "/networking",
  nodes: [
    { id: "nodeA", label: "Node A", type: "worker", icon: "🖥️", position: { x: 100, y: 50 } },
    { id: "podA", label: "Pod A (10.244.1.5)", type: "pod", icon: "🫛", description: "Sending pod on Node A", position: { x: 100, y: 200 } },
    { id: "vethA", label: "veth pair", type: "network", icon: "🔌", description: "Virtual ethernet connecting pod to node bridge", position: { x: 100, y: 340 } },
    { id: "cni", label: "CNI Overlay Network", type: "network", icon: "🌐", description: "VXLAN/Geneve tunnel encapsulates packets between nodes", position: { x: 400, y: 340 } },
    { id: "nodeB", label: "Node B", type: "worker", icon: "🖥️", position: { x: 700, y: 50 } },
    { id: "vethB", label: "veth pair", type: "network", icon: "🔌", description: "Virtual ethernet on destination node", position: { x: 700, y: 340 } },
    { id: "podB", label: "Pod B (10.244.2.8)", type: "pod", icon: "🫛", description: "Destination pod on Node B", position: { x: 700, y: 200 } },
  ],
  edges: [
    { id: "e1", source: "podA", target: "vethA", label: "packet out" },
    { id: "e2", source: "vethA", target: "cni", label: "encapsulate (VXLAN)" },
    { id: "e3", source: "cni", target: "vethB", label: "decapsulate" },
    { id: "e4", source: "vethB", target: "podB", label: "deliver" },
    { id: "e5", source: "podA", target: "nodeA" },
    { id: "e6", source: "podB", target: "nodeB" },
  ],
  steps: [
    { title: "Pod A sends a packet", description: "Pod A (10.244.1.5) sends a packet to Pod B (10.244.2.8). The packet leaves the pod's network namespace through its veth pair.", activeNodes: ["podA", "nodeA"], activeEdges: ["e5"] },
    { title: "Packet reaches node bridge", description: "The veth pair connects the pod namespace to the node's bridge (cbr0/cni0). The node's routing table determines the packet must leave the node.", activeNodes: ["podA", "vethA"], activeEdges: ["e1"] },
    { title: "CNI overlay encapsulates", description: "The CNI plugin (Flannel/Calico/Cilium) encapsulates the packet in a VXLAN or Geneve tunnel. The outer packet is addressed to Node B's IP.", activeNodes: ["vethA", "cni"], activeEdges: ["e2"] },
    { title: "Packet traverses network", description: "The encapsulated packet travels over the physical/cloud network from Node A to Node B. This is regular L3 routing.", activeNodes: ["cni"], activeEdges: ["e2", "e3"] },
    { title: "Node B decapsulates", description: "Node B's CNI agent receives the VXLAN packet, strips the outer headers, revealing the original pod-to-pod packet.", activeNodes: ["cni", "vethB"], activeEdges: ["e3"] },
    { title: "Pod B receives packet", description: "The decapsulated packet is delivered to Pod B's network namespace via its veth pair. Pod B processes the request and can respond via the same path.", activeNodes: ["vethB", "podB", "nodeB"], activeEdges: ["e4", "e6"] },
  ],
};

export default podNetworking;
