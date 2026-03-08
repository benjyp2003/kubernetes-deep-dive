import type { SimulatorScenario } from "../types";

const openshiftRoute3D: SimulatorScenario = {
  id: "openshift-route-3d",
  title: "OpenShift Route Flow",
  subtitle: "How traffic enters an OpenShift cluster through HAProxy router",
  icon: "🔴",
  components: [
    { id: "user", label: "External User", type: "user", description: "A user accessing the application via HTTPS.", position: [-5, 0, 0] },
    { id: "router", label: "HAProxy Router", type: "ingress", description: "OpenShift's default router that handles Route objects and TLS termination.", position: [-1, 2, 0] },
    { id: "route", label: "Route Object", type: "service", description: "OpenShift Route defining hostname, path, TLS config, and target service.", position: [-1, 0, 1.5] },
    { id: "service", label: "Service", type: "service", description: "ClusterIP service that load-balances across backend pods.", position: [2, 1, 0] },
    { id: "pod1", label: "App Pod 1", type: "pod", description: "First application pod serving traffic.", position: [4, 0, -1] },
    { id: "pod2", label: "App Pod 2", type: "pod", description: "Second application pod for high availability.", position: [4, 0, 1] },
  ],
  connections: [
    { id: "c1", from: "user", to: "router" },
    { id: "c2", from: "router", to: "route" },
    { id: "c3", from: "router", to: "service" },
    { id: "c4", from: "service", to: "pod1" },
    { id: "c5", from: "service", to: "pod2" },
  ],
  steps: [
    { title: "User sends HTTPS request", description: "The user navigates to `app.example.com`. DNS resolves to the OpenShift router's external IP.", activeComponents: ["user"], activeConnections: [], packets: [] },
    { title: "Router receives request", description: "The HAProxy router pod receives the request and terminates TLS (edge termination).", activeComponents: ["user", "router"], activeConnections: ["c1"], packets: [{ from: "user", to: "router", color: "green" }] },
    { title: "Route rules evaluated", description: "The router matches the hostname to a Route object and identifies the target service.", activeComponents: ["router", "route"], activeConnections: ["c2"], packets: [{ from: "router", to: "route", color: "blue" }] },
    { title: "Traffic to Service", description: "The router forwards decrypted traffic to the backing service.", activeComponents: ["router", "service"], activeConnections: ["c3"], packets: [{ from: "router", to: "service", color: "green" }] },
    { title: "Pod receives request", description: "The service load-balances to a healthy pod which processes the request.", activeComponents: ["service", "pod1", "pod2"], activeConnections: ["c4", "c5"], packets: [{ from: "service", to: "pod1", color: "green" }, { from: "service", to: "pod2", color: "green" }] },
  ],
};

export default openshiftRoute3D;
