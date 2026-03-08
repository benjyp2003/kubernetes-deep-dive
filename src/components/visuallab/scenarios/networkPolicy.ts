import type { Scenario } from "./types";

const networkPolicy: Scenario = {
  id: "network-policy",
  title: "Network Policy Enforcement",
  subtitle: "How NetworkPolicies isolate pod traffic and enforce multitenancy",
  icon: "🛡️",
  category: "Security",
  relatedPage: "/security",
  nodes: [
    { id: "ns-a", label: "Namespace: frontend", type: "network", icon: "📁", description: "Namespace containing frontend pods", position: { x: 100, y: 50 } },
    { id: "pod-a1", label: "Frontend Pod", type: "pod", icon: "🫛", description: "Pod in frontend namespace trying to reach backend", position: { x: 100, y: 200 } },
    { id: "policy", label: "NetworkPolicy", type: "security", icon: "🛡️", description: "Policy on backend namespace allowing only frontend pods on port 8080", position: { x: 370, y: 200 } },
    { id: "ns-b", label: "Namespace: backend", type: "network", icon: "📁", description: "Namespace containing backend pods with ingress policy", position: { x: 600, y: 50 } },
    { id: "pod-b1", label: "Backend Pod", type: "pod", icon: "🫛", description: "Pod protected by NetworkPolicy", position: { x: 600, y: 200 } },
    { id: "pod-c1", label: "Rogue Pod", type: "pod", icon: "💀", description: "Pod in a different namespace trying unauthorized access", position: { x: 100, y: 380 } },
    { id: "cni", label: "CNI Plugin", type: "network", icon: "🌐", description: "Calico/Cilium enforces NetworkPolicy rules at the node level", position: { x: 370, y: 380 } },
  ],
  edges: [
    { id: "e1", source: "pod-a1", target: "policy", label: "allowed ✅" },
    { id: "e2", source: "policy", target: "pod-b1", label: "pass to pod" },
    { id: "e3", source: "pod-c1", target: "policy", label: "denied ❌" },
    { id: "e4", source: "cni", target: "policy", label: "enforces rules" },
    { id: "e5", source: "pod-a1", target: "ns-a" },
    { id: "e6", source: "pod-b1", target: "ns-b" },
  ],
  steps: [
    { title: "NetworkPolicy applied to backend", description: "A NetworkPolicy is created in the backend namespace. It specifies: allow ingress only from pods in namespace 'frontend' on port 8080. All other ingress is denied by default.", activeNodes: ["policy", "ns-b", "pod-b1"], activeEdges: ["e6"] },
    { title: "CNI plugin reads policy", description: "The CNI plugin (Calico, Cilium) watches for NetworkPolicy objects and programs eBPF/iptables rules on each node to enforce them.", activeNodes: ["cni", "policy"], activeEdges: ["e4"] },
    { title: "Frontend pod sends allowed request", description: "A pod in the 'frontend' namespace sends a request to the backend pod on port 8080. The CNI evaluates this against the NetworkPolicy.", activeNodes: ["pod-a1", "ns-a", "policy"], activeEdges: ["e1", "e5"] },
    { title: "Request allowed through", description: "The source namespace and port match the policy's ingress rules. The CNI allows the packet through. Traffic reaches the backend pod.", activeNodes: ["policy", "pod-b1"], activeEdges: ["e2"] },
    { title: "Rogue pod sends unauthorized request", description: "A pod from an unauthorized namespace tries to reach the backend pod. The CNI evaluates the request against the NetworkPolicy.", activeNodes: ["pod-c1", "policy"], activeEdges: ["e3"] },
    { title: "Request denied", description: "The source namespace doesn't match any allow rule. The CNI drops the packet. The rogue pod receives a connection timeout or reset.", activeNodes: ["policy", "cni"], activeEdges: ["e3", "e4"] },
  ],
};

export default networkPolicy;
