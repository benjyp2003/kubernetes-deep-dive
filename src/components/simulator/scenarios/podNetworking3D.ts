import type { SimulatorScenario } from "../types";

const podNetworking3D: SimulatorScenario = {
  id: "pod-networking-3d",
  title: "Pod-to-Pod Networking",
  subtitle: "How pods communicate across nodes via the CNI overlay network",
  icon: "🔌",
  components: [
    { id: "nodeA", label: "Node A", type: "node", description: "Worker node hosting Pod A.", position: [-3, 0, 0] },
    { id: "podA", label: "Pod A", type: "pod", description: "Source pod sending a request to Pod B on another node.", position: [-3, 1.5, 0] },
    { id: "cniA", label: "CNI (veth/bridge)", type: "network", description: "Virtual ethernet pair and bridge created by the CNI plugin on Node A.", position: [-1, 0, 0] },
    { id: "overlay", label: "Overlay Network", type: "network", description: "VXLAN/Geneve tunnel that encapsulates pod traffic for cross-node delivery.", position: [0, -1, 0] },
    { id: "cniB", label: "CNI (veth/bridge)", type: "network", description: "Virtual ethernet pair and bridge on Node B that delivers packets to pods.", position: [1, 0, 0] },
    { id: "nodeB", label: "Node B", type: "node", description: "Worker node hosting Pod B.", position: [3, 0, 0] },
    { id: "podB", label: "Pod B", type: "pod", description: "Destination pod receiving the request.", position: [3, 1.5, 0] },
  ],
  connections: [
    { id: "c1", from: "podA", to: "cniA" },
    { id: "c2", from: "cniA", to: "overlay" },
    { id: "c3", from: "overlay", to: "cniB" },
    { id: "c4", from: "cniB", to: "podB" },
  ],
  steps: [
    { title: "Pod A sends packet", description: "Pod A sends a TCP packet to Pod B's IP address. The packet exits the pod's network namespace via a veth pair.", activeComponents: ["podA", "nodeA"], activeConnections: [], packets: [] },
    { title: "Packet hits CNI bridge", description: "The CNI plugin's bridge on Node A receives the packet. It checks routing tables and determines Pod B is on another node.", activeComponents: ["podA", "cniA"], activeConnections: ["c1"], packets: [{ from: "podA", to: "cniA", color: "green" }] },
    { title: "Overlay encapsulation", description: "The packet is encapsulated in a VXLAN/Geneve header and sent as a UDP packet to Node B's physical IP.", activeComponents: ["cniA", "overlay"], activeConnections: ["c2"], packets: [{ from: "cniA", to: "overlay", color: "green" }] },
    { title: "Packet arrives at Node B", description: "Node B receives the UDP packet, the overlay driver decapsulates it, revealing the original pod-to-pod packet.", activeComponents: ["overlay", "cniB"], activeConnections: ["c3"], packets: [{ from: "overlay", to: "cniB", color: "green" }] },
    { title: "Delivered to Pod B", description: "The CNI bridge on Node B forwards the decapsulated packet to Pod B via its veth pair. Communication complete.", activeComponents: ["cniB", "podB", "nodeB"], activeConnections: ["c4"], packets: [{ from: "cniB", to: "podB", color: "green" }] },
  ],
};

export default podNetworking3D;
