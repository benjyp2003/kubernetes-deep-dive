import type { Scenario } from "./types";

const openshiftRoute: Scenario = {
  id: "openshift-route",
  title: "OpenShift Route Flow",
  subtitle: "How external traffic reaches apps via OpenShift's HAProxy Router",
  icon: "🔴",
  category: "OpenShift",
  relatedPage: "/openshift",
  nodes: [
    { id: "user", label: "External User", type: "user", icon: "🌍", position: { x: 50, y: 200 } },
    { id: "router", label: "HAProxy Router", type: "controlplane", icon: "🔴", description: "OpenShift's built-in router that handles Route objects — replaces Ingress Controller", position: { x: 280, y: 200 } },
    { id: "route", label: "Route Object", type: "controller", icon: "📋", description: "OpenShift-native resource defining host, path, TLS termination", position: { x: 280, y: 60 } },
    { id: "tls", label: "TLS Termination", type: "security", icon: "🔒", description: "Edge, passthrough, or re-encrypt TLS handling", position: { x: 450, y: 60 } },
    { id: "service", label: "Service", type: "service", icon: "🔀", position: { x: 500, y: 200 } },
    { id: "pod1", label: "App Pod", type: "pod", icon: "🫛", position: { x: 680, y: 150 } },
    { id: "pod2", label: "App Pod", type: "pod", icon: "🫛", position: { x: 680, y: 280 } },
  ],
  edges: [
    { id: "e1", source: "user", target: "router", label: "HTTPS request" },
    { id: "e2", source: "route", target: "router", label: "routing config" },
    { id: "e3", source: "router", target: "tls", label: "TLS handling" },
    { id: "e4", source: "router", target: "service", label: "forward" },
    { id: "e5", source: "service", target: "pod1", label: "route" },
    { id: "e6", source: "service", target: "pod2", label: "route" },
  ],
  steps: [
    { title: "External request arrives", description: "User sends HTTPS request to the application. DNS points to the OpenShift router's external IP.", activeNodes: ["user", "router"], activeEdges: ["e1"] },
    { title: "Router reads Route object", description: "The HAProxy router watches Route objects via the API server. It matches the incoming hostname and path to a Route.", activeNodes: ["router", "route"], activeEdges: ["e2"] },
    { title: "TLS termination applied", description: "The Route specifies TLS termination type: edge (terminate at router), passthrough (forward encrypted), or re-encrypt (decrypt + re-encrypt).", activeNodes: ["router", "tls"], activeEdges: ["e3"] },
    { title: "Traffic forwarded to Service", description: "After TLS handling, the router forwards the request to the backend Service specified in the Route.", activeNodes: ["router", "service"], activeEdges: ["e4"] },
    { title: "Pod serves the request", description: "The Service routes to a healthy backend pod. The response flows back through the router to the user.", activeNodes: ["service", "pod1"], activeEdges: ["e5"] },
  ],
};

export default openshiftRoute;
