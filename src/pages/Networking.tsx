import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";
import OpenShiftComparison from "@/components/learning/OpenShiftComparison";

const Networking = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-advanced mb-3 inline-block">Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Kubernetes Networking</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            The deepest dive into how pods communicate, how services route traffic, how DNS works, and how external requests reach your applications.
          </p>
        </motion.div>

        {/* Networking Model */}
        <LayeredExplanation
          title="The Kubernetes Networking Model"
          simple={
            <p>In Kubernetes, every pod gets its own IP address — like every apartment in a building getting its own phone number. Any pod can talk to any other pod directly using its IP, no matter which node (machine) they're on. This is the "flat network" model.</p>
          }
          technical={
            <div className="space-y-3">
              <p>Kubernetes enforces three fundamental networking rules:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li><strong>Pod-to-Pod</strong>: Every pod can communicate with every other pod without NAT</li>
                <li><strong>Node-to-Pod</strong>: Every node can communicate with every pod without NAT</li>
                <li><strong>Pod's self-view</strong>: A pod sees its own IP the same way others see it</li>
              </ol>
              <p>Kubernetes doesn't implement networking itself — it delegates to a <strong>CNI plugin</strong> (Calico, Flannel, Cilium, etc.) that sets up the actual network.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>How the flat network is achieved:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                <li><strong>Same node</strong>: Pods connect through a virtual bridge (cbr0 or similar). Each pod gets a veth pair — one end in the pod's network namespace, the other on the bridge.</li>
                <li><strong>Cross node</strong>: CNI plugins use overlay networks (VXLAN), BGP routing, or cloud provider routes to connect pod CIDRs across nodes.</li>
                <li><strong>Within a pod</strong>: Containers in the same pod share a network namespace. They communicate via <code className="font-mono text-xs">localhost</code> and see the same IP.</li>
              </ul>
              <p>The pod network namespace is created by the <strong>pause container</strong> (infra container) which holds the namespace alive even if app containers restart.</p>
            </div>
          }
        />

        <AnalogyCallout
          analogy="Pod networking is like a phone system in an office building"
          explanation="Every room (pod) has a direct phone line (IP). You can call any room directly. Rooms on the same floor (node) connect through a local switch (bridge). Rooms on different floors connect through the building's trunk line (overlay/routing). Roommates (containers in the same pod) can just talk to each other directly — no phone needed (localhost)."
        />

        {/* Services */}
        <LayeredExplanation
          title="Services: Stable Access Points"
          simple={
            <p>Pod IPs change every time a pod is recreated. Services give you a stable address that always points to the right pods, even as pods come and go. It's like a company's main phone number that always connects you to someone in customer service, regardless of which specific person answers.</p>
          }
          technical={
            <div className="space-y-3">
              <p>A Service creates a <strong>virtual IP</strong> (ClusterIP) and uses label selectors to identify backend pods. The Endpoints or EndpointSlice controller maintains a list of ready pod IPs.</p>
              <p><code className="font-mono text-xs">kube-proxy</code> on every node programs iptables/IPVS rules so that traffic to the Service VIP is load-balanced across healthy endpoints.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Full request flow: Pod A → Service → Pod B:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li>Pod A sends packet to Service ClusterIP (e.g., 10.96.0.1:80)</li>
                <li>Packet hits iptables/IPVS rules on Pod A's node</li>
                <li>kube-proxy rules DNAT the packet to a random healthy endpoint (e.g., 10.244.1.5:8080)</li>
                <li>Packet is routed to the target pod's node via CNI</li>
                <li>Pod B receives the packet on port 8080</li>
                <li>Response follows the reverse path, with source NAT restoring the Service IP</li>
              </ol>
            </div>
          }
        />

        <ComparisonTable
          title="Service Types Compared"
          headers={["Type", "Accessible From", "Use Case"]}
          rows={[
            { label: "ClusterIP", values: ["Inside cluster only", "Internal service-to-service communication"] },
            { label: "NodePort", values: ["External via NodeIP:Port", "Development, testing, simple external access"] },
            { label: "LoadBalancer", values: ["External via cloud LB", "Production external traffic in cloud"] },
            { label: "ExternalName", values: ["DNS CNAME alias", "Pointing to external services outside cluster"] },
          ]}
        />

        <CodeBlock
          title="ClusterIP Service"
          language="yaml"
          code={`apiVersion: v1
kind: Service
metadata:
  name: my-backend
spec:
  selector:
    app: backend    # Finds pods with this label
  ports:
    - port: 80        # Service port
      targetPort: 8080 # Container port
  type: ClusterIP    # Default type`}
        />

        {/* DNS */}
        <LayeredExplanation
          title="DNS in Kubernetes"
          simple={
            <p>Instead of remembering IP addresses, you can use names. Inside a Kubernetes cluster, if you have a service called "my-backend" in the "production" namespace, any pod can reach it at <code className="font-mono text-xs">my-backend.production.svc.cluster.local</code>. It's like a built-in phone book.</p>
          }
          technical={
            <div className="space-y-3">
              <p>CoreDNS runs as pods in the <code className="font-mono text-xs">kube-system</code> namespace. Every pod's <code className="font-mono text-xs">/etc/resolv.conf</code> points to the CoreDNS Service IP.</p>
              <p>DNS records for services: <code className="font-mono text-xs">&lt;service&gt;.&lt;namespace&gt;.svc.cluster.local</code></p>
              <p>DNS records for pods: <code className="font-mono text-xs">&lt;pod-ip-dashed&gt;.&lt;namespace&gt;.pod.cluster.local</code></p>
              <p>Within the same namespace, you can use just the service name: <code className="font-mono text-xs">my-backend</code></p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>DNS resolution flow:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li>App code calls <code className="font-mono text-xs">my-backend:80</code></li>
                <li>libc resolver reads <code className="font-mono text-xs">/etc/resolv.conf</code> → points to CoreDNS ClusterIP</li>
                <li>Search domains are tried: <code className="font-mono text-xs">my-backend.default.svc.cluster.local</code></li>
                <li>CoreDNS queries its in-memory cache/database</li>
                <li>Returns the Service's ClusterIP as an A record</li>
                <li>App connects to the ClusterIP → kube-proxy rules route to a pod</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">Note: Headless services (clusterIP: None) return pod IPs directly, used by StatefulSets for individual pod discovery.</p>
            </div>
          }
        />

        {/* Request flows */}
        <FlowDiagram
          title="External User → Ingress → Pod"
          steps={[
            { label: "User sends HTTP request", description: "Browser requests https://myapp.example.com — DNS resolves to the cluster's external IP (load balancer)." },
            { label: "Load balancer forwards to Ingress Controller", description: "Cloud LB routes traffic to the Ingress Controller pods running inside the cluster (usually nginx, traefik, or HAProxy)." },
            { label: "Ingress Controller matches rules", description: "The controller reads Ingress resources and matches the hostname and path to a backend Service." },
            { label: "Traffic routed to Service", description: "Ingress Controller forwards the request to the matched Service's ClusterIP." },
            { label: "kube-proxy selects a pod", description: "iptables/IPVS rules on the node DNAT the packet to one of the Service's endpoint pods." },
            { label: "Pod receives and responds", description: "The application container processes the request and sends a response back through the same chain." },
          ]}
        />

        <FlowDiagram
          title="Pod-to-Pod Communication (Same Node)"
          steps={[
            { label: "Pod A sends packet", description: "Application in Pod A sends data to Pod B's IP (e.g., 10.244.0.5). The packet exits through Pod A's veth interface." },
            { label: "Virtual bridge receives packet", description: "The veth pair connects to the node's virtual bridge (cbr0). The bridge checks its MAC table." },
            { label: "Bridge forwards to Pod B", description: "Since Pod B is on the same node, the bridge sends the packet directly to Pod B's veth interface." },
            { label: "Pod B receives packet", description: "Packet enters Pod B's network namespace. Application receives data. No overlay or routing needed." },
          ]}
        />

        <FlowDiagram
          title="Pod-to-Pod Communication (Cross Node)"
          steps={[
            { label: "Pod A sends packet", description: "Packet exits Pod A's veth into the node's virtual bridge." },
            { label: "Bridge routes to node network", description: "Bridge doesn't know Pod B's MAC (different node). Packet goes to the node's routing table." },
            { label: "CNI overlay/routing takes over", description: "Depending on CNI: VXLAN encapsulates packet and sends to Node 2's IP, or BGP routes direct Pod B's subnet to Node 2." },
            { label: "Node 2 receives and decapsulates", description: "Node 2's CNI agent receives the packet, strips overlay headers, and delivers to its local bridge." },
            { label: "Bridge delivers to Pod B", description: "Local bridge forwards to Pod B's veth. Pod B receives the packet." },
          ]}
        />

        <OpenShiftComparison
          k8sFeature="Ingress"
          openshiftFeature="Route"
          description="OpenShift Routes predate Kubernetes Ingress and offer features like automatic TLS edge/reencrypt/passthrough termination, sticky sessions via cookies, and built-in HAProxy router. While OpenShift now also supports Ingress resources, Routes remain the primary and more feature-rich way to expose services externally."
        />

        {/* Network Policy */}
        <LayeredExplanation
          title="Network Policies"
          simple={
            <p>By default, every pod can talk to every other pod. Network Policies are like firewall rules that let you control which pods can communicate with which. For example: "only frontend pods can talk to backend pods."</p>
          }
          technical={
            <div className="space-y-3">
              <p>A NetworkPolicy selects pods via labels and defines allowed ingress/egress rules. Once any NetworkPolicy selects a pod, that pod becomes <strong>isolated</strong> — only explicitly allowed traffic passes.</p>
              <p>Network Policies are enforced by the CNI plugin (Calico, Cilium, etc.). Not all CNIs support them — Flannel, for example, does not.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Key behaviors:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li>Policies are <strong>additive</strong> — multiple policies on the same pod create a union of allowed traffic</li>
                <li>An empty <code className="font-mono text-xs">ingress: []</code> means deny all ingress to selected pods</li>
                <li>An empty <code className="font-mono text-xs">podSelector: {"{}"}</code> selects all pods in the namespace</li>
                <li>Namespace selectors allow cross-namespace rules</li>
                <li>Policies operate at L3/L4 (IP/port). For L7 (HTTP path), you need a service mesh or Cilium</li>
              </ul>
            </div>
          }
        />

        <CodeBlock
          title="Network Policy: Only frontend can reach backend"
          language="yaml"
          code={`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-allow-frontend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend        # Apply to backend pods
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend  # Only allow from frontend
      ports:
        - port: 8080
          protocol: TCP`}
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Thinking pod IPs are stable", correction: "Pod IPs change on every restart. Use Services for stable endpoints." },
            { mistake: "Not understanding that NetworkPolicy requires CNI support", correction: "If your CNI (like Flannel) doesn't enforce policies, creating NetworkPolicy objects does nothing." },
            { mistake: "Confusing port vs targetPort in Services", correction: "'port' is what clients connect to. 'targetPort' is the port on the pod's container. They can be different." },
            { mistake: "Using NodePort in production", correction: "NodePort exposes on every node and uses high ports (30000+). Use LoadBalancer or Ingress for production traffic." },
          ]}
        />

        <QuizCard
          title="Networking Quiz"
          questions={[
            {
              question: "What happens to pod IPs when a pod is deleted and recreated?",
              options: ["IP stays the same", "IP changes", "IP is inherited by the next pod", "Depends on the CNI"],
              correctIndex: 1,
              explanation: "Pod IPs are ephemeral. When a pod is deleted and recreated, it gets a new IP address. That's why we use Services for stable access."
            },
            {
              question: "How do containers in the SAME pod communicate?",
              options: ["Through the Service", "Via the CNI overlay", "Using localhost", "Through kube-proxy"],
              correctIndex: 2,
              explanation: "Containers in the same pod share a network namespace, so they communicate via localhost. They see the same IP and can use different ports."
            },
            {
              question: "What component programs iptables/IPVS rules for Service routing?",
              options: ["kubelet", "API Server", "kube-proxy", "CoreDNS"],
              correctIndex: 2,
              explanation: "kube-proxy runs on every node and watches the API server for Service changes, then programs iptables or IPVS rules to route traffic to backend pods."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Networking;
