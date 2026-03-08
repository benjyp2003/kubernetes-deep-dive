import type { SimulatorScenario } from "../types";

const networkPolicy3D: SimulatorScenario = {
  id: "network-policy-3d",
  title: "Network Policy Enforcement",
  subtitle: "How network policies allow or deny traffic between pods",
  icon: "🛡️",
  components: [
    { id: "podA", label: "Pod A (frontend)", type: "pod", description: "Frontend pod trying to reach the backend.", position: [-4, 0, -1] },
    { id: "podB", label: "Pod B (backend)", type: "pod", description: "Backend pod protected by a NetworkPolicy.", position: [3, 0, -1] },
    { id: "podC", label: "Pod C (attacker)", type: "pod", description: "An unauthorized pod trying to access the backend.", position: [-4, 0, 2] },
    { id: "policy", label: "NetworkPolicy", type: "network", description: "Defines ingress rules: only pods with label 'role=frontend' can reach the backend on port 8080.", position: [0, 2, 0] },
    { id: "cni", label: "CNI Plugin", type: "network", description: "The network plugin (Calico, Cilium) that enforces the NetworkPolicy rules at the kernel level.", position: [0, -1, 0] },
  ],
  connections: [
    { id: "c1", from: "podA", to: "policy" },
    { id: "c2", from: "policy", to: "podB" },
    { id: "c3", from: "podC", to: "policy" },
    { id: "c4", from: "policy", to: "cni" },
    { id: "c5", from: "podA", to: "podB" },
  ],
  steps: [
    { title: "NetworkPolicy applied", description: "A NetworkPolicy is created that only allows ingress to Pod B from pods with label `role=frontend`.", activeComponents: ["policy", "cni"], activeConnections: ["c4"], packets: [{ from: "policy", to: "cni", color: "blue" }] },
    { title: "Pod A sends request", description: "Pod A (labeled `role=frontend`) tries to connect to Pod B on port 8080.", activeComponents: ["podA", "policy"], activeConnections: ["c1"], packets: [{ from: "podA", to: "policy", color: "green" }] },
    { title: "Traffic ALLOWED ✅", description: "The CNI plugin checks the policy, matches Pod A's labels, and allows the traffic through.", activeComponents: ["podA", "policy", "podB"], activeConnections: ["c1", "c2", "c5"], packets: [{ from: "podA", to: "podB", color: "green" }] },
    { title: "Pod C sends request", description: "Pod C (no frontend label) attempts to connect to Pod B.", activeComponents: ["podC", "policy"], activeConnections: ["c3"], packets: [{ from: "podC", to: "policy", color: "red" }] },
    { title: "Traffic DENIED ❌", description: "The CNI plugin evaluates the policy, finds no matching rule for Pod C, and drops the packet.", activeComponents: ["podC", "policy", "cni"], activeConnections: ["c3", "c4"], packets: [{ from: "podC", to: "policy", color: "red" }] },
  ],
};

export default networkPolicy3D;
