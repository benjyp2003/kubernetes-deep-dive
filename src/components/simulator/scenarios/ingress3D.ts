import type { SimulatorScenario } from "../types";

const ingress3D: SimulatorScenario = {
  id: "ingress-3d",
  title: "External Traffic via Ingress",
  subtitle: "How HTTP traffic from users reaches pods through an Ingress controller",
  icon: "🌍",
  components: [
    { id: "user", label: "External User", type: "user", description: "A user accessing the application via a browser.", position: [-5, 0, 0] },
    { id: "lb", label: "Load Balancer", type: "ingress", description: "Cloud load balancer that forwards external traffic to the Ingress controller.", position: [-2.5, 1, 0] },
    { id: "ingress", label: "Ingress Controller", type: "ingress", description: "NGINX/Traefik controller that evaluates Ingress rules and routes HTTP requests.", position: [0, 2, 0] },
    { id: "svcA", label: "Service A (/api)", type: "service", description: "Service handling API requests on the /api path.", position: [3, 1, -1.5] },
    { id: "svcB", label: "Service B (/web)", type: "service", description: "Service handling web frontend requests on the /web path.", position: [3, 1, 1.5] },
    { id: "podA", label: "API Pod", type: "pod", description: "Backend API pod serving JSON responses.", position: [5, 0, -1.5] },
    { id: "podB", label: "Web Pod", type: "pod", description: "Frontend web pod serving the UI.", position: [5, 0, 1.5] },
  ],
  connections: [
    { id: "c1", from: "user", to: "lb" },
    { id: "c2", from: "lb", to: "ingress" },
    { id: "c3", from: "ingress", to: "svcA" },
    { id: "c4", from: "ingress", to: "svcB" },
    { id: "c5", from: "svcA", to: "podA" },
    { id: "c6", from: "svcB", to: "podB" },
  ],
  steps: [
    { title: "User sends HTTP request", description: "A user types `app.example.com/api/data` in their browser. DNS resolves to the cloud load balancer IP.", activeComponents: ["user"], activeConnections: [], packets: [] },
    { title: "Load balancer forwards", description: "The cloud load balancer receives the request and forwards it to the Ingress controller.", activeComponents: ["user", "lb"], activeConnections: ["c1"], packets: [{ from: "user", to: "lb", color: "green" }] },
    { title: "Ingress evaluates rules", description: "The Ingress controller matches the path /api to Service A based on the Ingress resource rules.", activeComponents: ["lb", "ingress"], activeConnections: ["c2"], packets: [{ from: "lb", to: "ingress", color: "green" }] },
    { title: "Routed to Service A", description: "The Ingress controller forwards the request to Service A, which handles the /api path.", activeComponents: ["ingress", "svcA"], activeConnections: ["c3"], packets: [{ from: "ingress", to: "svcA", color: "green" }] },
    { title: "Service routes to pod", description: "Service A load-balances the request to one of its backend API pods.", activeComponents: ["svcA", "podA"], activeConnections: ["c5"], packets: [{ from: "svcA", to: "podA", color: "green" }] },
    { title: "Full path complete", description: "The API pod processes the request and sends the response back through the same chain to the user.", activeComponents: ["user", "lb", "ingress", "svcA", "podA"], activeConnections: ["c1", "c2", "c3", "c5"], packets: [{ from: "user", to: "lb", color: "green" }, { from: "ingress", to: "svcA", color: "green" }] },
  ],
};

export default ingress3D;
