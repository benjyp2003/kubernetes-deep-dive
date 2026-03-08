import type { Scenario } from "./types";

const ingressTraffic: Scenario = {
  id: "ingress-traffic",
  title: "External Traffic via Ingress",
  subtitle: "How external HTTP requests reach your application through Ingress",
  icon: "🌍",
  category: "Networking",
  relatedPage: "/services",
  nodes: [
    { id: "user", label: "External User", type: "user", icon: "🌍", description: "User accessing app.example.com from outside the cluster", position: { x: 50, y: 200 } },
    { id: "dns", label: "External DNS", type: "network", icon: "🔍", description: "Resolves app.example.com to the Ingress Controller's external IP", position: { x: 50, y: 60 } },
    { id: "lb", label: "Load Balancer", type: "network", icon: "⚖️", description: "Cloud load balancer exposing the Ingress Controller", position: { x: 250, y: 200 } },
    { id: "ingress-ctrl", label: "Ingress Controller", type: "controlplane", icon: "🚪", description: "nginx/traefik — reads Ingress rules, routes traffic", position: { x: 450, y: 200 } },
    { id: "ingress-obj", label: "Ingress Resource", type: "controller", icon: "📋", description: "Defines host/path routing rules", position: { x: 450, y: 60 } },
    { id: "service", label: "Service", type: "service", icon: "🔀", position: { x: 650, y: 200 } },
    { id: "pod1", label: "App Pod 1", type: "pod", icon: "🫛", position: { x: 800, y: 150 } },
    { id: "pod2", label: "App Pod 2", type: "pod", icon: "🫛", position: { x: 800, y: 280 } },
  ],
  edges: [
    { id: "e1", source: "user", target: "dns", label: "DNS lookup" },
    { id: "e2", source: "user", target: "lb", label: "HTTPS request" },
    { id: "e3", source: "lb", target: "ingress-ctrl", label: "forward" },
    { id: "e4", source: "ingress-obj", target: "ingress-ctrl", label: "routing rules" },
    { id: "e5", source: "ingress-ctrl", target: "service", label: "matched route" },
    { id: "e6", source: "service", target: "pod1", label: "route to pod" },
    { id: "e7", source: "service", target: "pod2", label: "route to pod" },
  ],
  steps: [
    { title: "User enters URL", description: "External user navigates to app.example.com. The browser performs a DNS lookup to resolve the hostname.", activeNodes: ["user", "dns"], activeEdges: ["e1"] },
    { title: "Request hits load balancer", description: "DNS resolves to the cloud load balancer's public IP. The HTTPS request is sent to the load balancer.", activeNodes: ["user", "lb"], activeEdges: ["e2"] },
    { title: "Load balancer forwards to Ingress Controller", description: "The load balancer forwards traffic to the Ingress Controller pods (nginx, traefik, or HAProxy) running inside the cluster.", activeNodes: ["lb", "ingress-ctrl"], activeEdges: ["e3"] },
    { title: "Ingress rules evaluated", description: "The Ingress Controller reads Ingress resources from the API server. It matches the request's Host header and path against defined rules.", activeNodes: ["ingress-ctrl", "ingress-obj"], activeEdges: ["e4"] },
    { title: "Traffic routed to Service", description: "The matching Ingress rule specifies a backend Service. The Ingress Controller forwards the request to that Service's ClusterIP.", activeNodes: ["ingress-ctrl", "service"], activeEdges: ["e5"] },
    { title: "Service routes to pod", description: "The Service load-balances the request to one of its healthy backend pods. The pod processes the request and returns a response through the full chain.", activeNodes: ["service", "pod1"], activeEdges: ["e6"] },
  ],
};

export default ingressTraffic;
