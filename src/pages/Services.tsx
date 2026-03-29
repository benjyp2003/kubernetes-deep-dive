import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import OpenShiftComparison from "@/components/learning/OpenShiftComparison";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";
import FlowDiagram from "@/components/learning/FlowDiagram";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import DNSWiring from "@/components/learning/dns/DNSWiring";
import CoreDNSInternals from "@/components/learning/dns/CoreDNSInternals";
import DNSServiceRelationship from "@/components/learning/dns/DNSServiceRelationship";
import DNSDebugging from "@/components/learning/dns/DNSDebugging";

const Services = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Intermediate → Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Services, DNS & Ingress</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            How pods are discovered, how traffic gets routed, how DNS works internally, and how external users reach your applications inside the cluster.
          </p>
        </motion.div>

        {/* --- Services Core --- */}
        <LayeredExplanation
          title="What is a Service?"
          simple={
            <p>Pods come and go — they get new IPs every time they restart. A Service gives your pods a <strong>stable address</strong> that never changes, so other pods (and external users) can always find them.</p>
          }
          technical={
            <div className="space-y-3">
              <p>A Service is a Kubernetes abstraction that defines a logical set of pods and a policy for accessing them. Services use <strong>label selectors</strong> to find their target pods and provide a stable virtual IP (ClusterIP) for routing.</p>
              <p>The Endpoints or EndpointSlice controller automatically maintains the list of pod IPs behind each Service.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>When a Service is created, the API server assigns it a ClusterIP from the service CIDR range. kube-proxy on every node watches for Service changes and programs iptables/IPVS rules to redirect traffic from the ClusterIP to actual pod IPs.</p>
              <p>DNS is automatically configured: <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">service-name.namespace.svc.cluster.local</code> resolves to the ClusterIP.</p>
            </div>
          }
        />

        <AnalogyCallout
          analogy="A Service is like a company's phone number"
          explanation="Employees (pods) join and leave the company, but the company phone number (Service ClusterIP) stays the same. When someone calls, the reception desk (kube-proxy) routes the call to an available employee. The caller doesn't need to know which employee is on the line."
        />

        <ComparisonTable
          title="Service Types"
          headers={["Type", "Accessible From", "Use Case"]}
          rows={[
            { label: "ClusterIP", values: ["Inside cluster only", "Internal pod-to-pod communication"] },
            { label: "NodePort", values: ["External via NodeIP:Port", "Development, simple external access"] },
            { label: "LoadBalancer", values: ["External via cloud LB", "Production external traffic (cloud)"] },
            { label: "ExternalName", values: ["DNS alias", "Pointing to external services"] },
          ]}
        />

        {/* --- DNS Deep Dive --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="k8s-section-hero">
          <span className="k8s-badge-advanced mb-3 inline-block">Deep Dive</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Kubernetes DNS — System-Level Deep Dive</h2>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            How DNS is wired into the cluster, how CoreDNS works internally, and how to debug DNS failures.
          </p>
        </motion.div>

        <DNSWiring />
        <CoreDNSInternals />
        <DNSServiceRelationship />

        {/* --- Ingress --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">External Access</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Ingress & External Traffic</h2>
        </motion.div>

        <FlowDiagram
          title="External Traffic → Ingress → Service → Pod"
          steps={[
            { label: "User sends HTTP request", description: "A user types your-app.example.com in their browser." },
            { label: "DNS resolves to Ingress Controller", description: "External DNS points to the Ingress Controller's external IP (typically a LoadBalancer)." },
            { label: "Ingress Controller receives request", description: "The controller (nginx, traefik, HAProxy) checks its rules for matching host/path." },
            { label: "Matches Ingress rule", description: "The Ingress resource defines: host=your-app.example.com → Service=web-svc:80" },
            { label: "Traffic forwarded to Service", description: "The Ingress Controller sends the request to the Service's ClusterIP." },
            { label: "kube-proxy routes to pod", description: "iptables/IPVS rules on the node forward traffic to one of the healthy pod IPs." },
            { label: "Pod processes the request", description: "The container receives the request and sends back a response through the same chain." },
          ]}
        />

        <CodeBlock
          title="Ingress YAML"
          language="yaml"
          code={`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-svc
                port:
                  number: 80`}
        />

        <OpenShiftComparison
          k8sFeature="Ingress"
          openshiftFeature="Route"
          description="OpenShift Routes predate Kubernetes Ingress and offer additional features like automatic TLS termination, blue-green deployments, and traffic splitting. Routes are managed by the OpenShift Router (HAProxy-based), while Ingress requires a separate Ingress Controller."
        />

        <CodeBlock
          title="OpenShift Route YAML"
          language="yaml"
          code={`apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: web-route
spec:
  host: myapp.example.com
  to:
    kind: Service
    name: web-svc
    weight: 100
  port:
    targetPort: 80
  tls:
    termination: edge`}
        />

        {/* --- DNS Debugging --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="k8s-section-hero">
          <span className="k8s-badge-advanced mb-3 inline-block">Debugging</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold">DNS Debugging & Real-World Issues</h2>
        </motion.div>

        <DNSDebugging />

        {/* --- Quiz --- */}
        <QuizCard
          title="Services, DNS & Ingress Quiz"
          questions={[
            {
              question: "What DNS name can a pod use to reach a Service named 'api' in the same namespace?",
              options: ["api.cluster.local", "api", "api.svc", "cluster.api"],
              correctIndex: 1,
              explanation: "Within the same namespace, pods can reach services by just their name. The full name would be api.namespace.svc.cluster.local."
            },
            {
              question: "What does a headless Service (ClusterIP: None) return in DNS?",
              options: ["Nothing", "The node IP", "Individual pod IPs", "The cluster gateway"],
              correctIndex: 2,
              explanation: "Headless services return individual pod IPs instead of a single virtual IP, enabling direct pod-to-pod communication."
            },
            {
              question: "Why does 'ndots:5' in /etc/resolv.conf impact DNS performance?",
              options: ["It limits DNS queries to 5 per second", "It causes search domain expansion — short names generate multiple queries", "It sets the DNS cache to 5 seconds", "It limits to 5 DNS servers"],
              correctIndex: 1,
              explanation: "ndots:5 means any name with fewer than 5 dots triggers search domain expansion. A query for 'api.stripe.com' (2 dots) generates 4 failed cluster lookups before the real query is sent."
            },
            {
              question: "How does CoreDNS know about Services in the cluster?",
              options: ["It reads etcd directly", "It queries the API server on every DNS request", "It uses informers to watch the API server and cache data in memory", "It polls the API server every 30 seconds"],
              correctIndex: 2,
              explanation: "CoreDNS uses the kubernetes plugin with Kubernetes informers — it does a LIST on startup and then WATCHes for changes, keeping an in-memory cache that's updated in near-real-time."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Services;
