import LayeredExplanation from "@/components/learning/LayeredExplanation";
import CodeBlock from "@/components/learning/CodeBlock";
import FlowDiagram from "@/components/learning/FlowDiagram";

const DNSWiring = () => (
  <div className="space-y-8">
    <LayeredExplanation
      title="Why DNS Exists in Kubernetes"
      simple={
        <p>Pods are temporary — every time one restarts, it gets a <strong>new IP address</strong>. DNS gives your apps a stable name to reach services, no matter which pods are running behind them.</p>
      }
      technical={
        <div className="space-y-3">
          <p>Kubernetes DNS provides <strong>service discovery</strong>: it maps human-readable service names to stable ClusterIP addresses. Without DNS, every application would need to track pod IPs manually — an impossible task in a dynamic cluster.</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><strong>Services</strong> provide a stable virtual IP (ClusterIP)</li>
            <li><strong>DNS</strong> maps names like <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service</code> → ClusterIP</li>
            <li>Pods never need to know individual pod IPs</li>
          </ul>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p>DNS is the <strong>foundation of the Kubernetes service mesh and networking model</strong>. Every controller, operator, and sidecar relies on DNS resolution. Without functioning DNS, the entire cluster's application layer breaks.</p>
          <p>The DNS subsystem is one of the first things bootstrapped after the API server and etcd. The kubelet is configured with <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">--cluster-dns</code> and <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">--cluster-domain</code> flags, which it injects into every pod's <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">/etc/resolv.conf</code>.</p>
        </div>
      }
    />

    <LayeredExplanation
      title="How DNS Is Wired Into the Cluster"
      simple={
        <p>Kubernetes runs its own DNS server called <strong>CoreDNS</strong>. Every pod is automatically configured to use it. When your app asks "where is my-service?", CoreDNS answers with the right IP.</p>
      }
      technical={
        <div className="space-y-3">
          <p>CoreDNS runs as a <strong>Deployment</strong> in the <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kube-system</code> namespace, exposed via a ClusterIP Service (typically <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">10.96.0.10</code>).</p>
          <p>Every pod's <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">/etc/resolv.conf</code> is injected by the kubelet:</p>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Kubelet DNS Injection — Internal Mechanics</p>
          <p>When kubelet creates a pod sandbox, it generates <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">/etc/resolv.conf</code> based on:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">--cluster-dns</code> flag → sets <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">nameserver</code></li>
            <li><code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">--cluster-domain</code> flag → builds <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">search</code> domains</li>
            <li>Pod's <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">dnsPolicy</code> field → controls behavior</li>
          </ul>
          <p className="mt-3 font-semibold text-foreground">Search Domain Expansion</p>
          <p>When a pod resolves <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service</code>, the resolver appends search domains in order:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li><code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service.default.svc.cluster.local</code> → <strong>match found</strong> → returns IP</li>
            <li><code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service.svc.cluster.local</code> → tried if #1 fails</li>
            <li><code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service.cluster.local</code> → tried if #2 fails</li>
            <li>Bare name → forwarded to upstream DNS</li>
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">⚠️ This means a short name like <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service</code> generates up to 4 DNS queries. Using FQDNs with a trailing dot (<code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service.default.svc.cluster.local.</code>) avoids this overhead.</p>
        </div>
      }
    />

    <CodeBlock
      title="Pod /etc/resolv.conf (injected by kubelet)"
      language="text"
      code={`nameserver 10.96.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5`}
    />

    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔬 DNS Policies</h3>
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="font-semibold text-sm text-foreground">ClusterFirst (default)</p>
          <p className="text-xs text-muted-foreground mt-1">All DNS queries go to CoreDNS first. Non-cluster names are forwarded upstream. This is what 99% of pods use.</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-semibold text-sm text-foreground">Default</p>
          <p className="text-xs text-muted-foreground mt-1">Pod inherits DNS config from the node. Does NOT use CoreDNS. Cluster services are NOT resolvable.</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-semibold text-sm text-foreground">None</p>
          <p className="text-xs text-muted-foreground mt-1">No DNS config is auto-generated. You must provide <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">dnsConfig</code> in the pod spec. Used for custom DNS setups.</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="font-semibold text-sm text-foreground">ClusterFirstWithHostNet</p>
          <p className="text-xs text-muted-foreground mt-1">For pods with <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">hostNetwork: true</code>. Forces CoreDNS usage even though the pod shares the node's network namespace.</p>
        </div>
      </div>
    </div>

    <FlowDiagram
      title="DNS Resolution — Full Internal Flow"
      steps={[
        { label: "Application calls DNS resolver", description: "Your app (e.g., curl my-service) triggers the libc resolver in the container. It reads /etc/resolv.conf to find the nameserver." },
        { label: "OS resolver sends query to CoreDNS", description: "A UDP DNS query for my-service.default.svc.cluster.local is sent to 10.96.0.10 (CoreDNS ClusterIP)." },
        { label: "kube-proxy routes to CoreDNS pod", description: "The CoreDNS ClusterIP is translated by iptables/IPVS rules to an actual CoreDNS pod IP on one of the nodes." },
        { label: "CoreDNS kubernetes plugin processes query", description: "The plugin checks its in-memory cache of Services and EndpointSlices (synced from API server via watch)." },
        { label: "Service ClusterIP returned", description: "For a normal Service: returns the ClusterIP (A record). For headless: returns individual pod IPs (multiple A records)." },
        { label: "Pod connects to ClusterIP", description: "The application sends its HTTP request to the resolved ClusterIP. kube-proxy/iptables routes it to a healthy backend pod." },
        { label: "Traffic reaches target pod", description: "The packet arrives at one of the pods behind the Service, selected via round-robin or random load balancing in iptables/IPVS." },
      ]}
    />
  </div>
);

export default DNSWiring;
