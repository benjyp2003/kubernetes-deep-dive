import LayeredExplanation from "@/components/learning/LayeredExplanation";
import CodeBlock from "@/components/learning/CodeBlock";
import ComparisonTable from "@/components/learning/ComparisonTable";

const CoreDNSInternals = () => (
  <div className="space-y-8">
    <LayeredExplanation
      title="CoreDNS Internal Architecture"
      simple={
        <p>CoreDNS is a <strong>plugin-based DNS server</strong>. It uses a chain of plugins to receive a DNS query, look up the answer, cache it, and return it. The most important plugin for Kubernetes is the <strong>kubernetes</strong> plugin.</p>
      }
      technical={
        <div className="space-y-3">
          <p>CoreDNS processes queries through a <strong>plugin chain</strong> defined in its Corefile (stored as a ConfigMap in kube-system). Key plugins:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><strong>kubernetes</strong> — resolves cluster service/pod names using API server data</li>
            <li><strong>cache</strong> — caches DNS responses to reduce API server load</li>
            <li><strong>forward</strong> — forwards non-cluster queries to upstream DNS (e.g., 8.8.8.8)</li>
            <li><strong>errors</strong> — logs errors for debugging</li>
            <li><strong>health / ready</strong> — health and readiness endpoints</li>
          </ul>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Kubernetes Plugin — Deep Internals</p>
          <p>The <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kubernetes</code> plugin establishes a <strong>watch connection</strong> to the API server and maintains an <strong>in-memory cache</strong> of:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li>All Service objects (name → ClusterIP mapping)</li>
            <li>All EndpointSlice objects (service → pod IPs mapping)</li>
            <li>All Namespace objects</li>
          </ul>
          <p className="mt-2">When a DNS query arrives, the plugin does a <strong>local memory lookup</strong> — it does NOT query the API server on every request. The watch stream keeps the cache up-to-date in near-real-time.</p>
          <p className="mt-2 font-semibold text-foreground">Watch Mechanics</p>
          <p>CoreDNS uses <strong>Kubernetes informers</strong> (shared informer pattern) — the same mechanism used by controllers. On startup, it does a LIST to populate the cache, then a WATCH for incremental updates. This means:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li>New services are resolvable within seconds of creation</li>
            <li>Deleted services stop resolving after cache expiry</li>
            <li>If the API server connection drops, CoreDNS serves stale data until reconnected</li>
          </ul>
        </div>
      }
    />

    <CodeBlock
      title="CoreDNS Corefile (ConfigMap in kube-system)"
      language="text"
      code={`.:53 {
    errors
    health {
        lameduck 5s
    }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
        ttl 30
    }
    prometheus :9153
    forward . /etc/resolv.conf {
        max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}`}
    />

    <ComparisonTable
      title="CoreDNS Plugin Chain"
      headers={["Plugin", "Purpose", "When It Runs"]}
      rows={[
        { label: "kubernetes", values: ["Resolves cluster DNS names", "For *.svc.cluster.local queries"] },
        { label: "cache", values: ["Caches DNS responses", "Before forwarding, after resolution"] },
        { label: "forward", values: ["Forwards to upstream DNS", "For non-cluster domains (e.g., google.com)"] },
        { label: "loop", values: ["Detects forwarding loops", "Startup — shuts down if loop detected"] },
        { label: "loadbalance", values: ["Shuffles A records", "Randomizes pod IP order for headless services"] },
        { label: "health/ready", values: ["Liveness/readiness probes", "Continuous — used by kubelet health checks"] },
      ]}
    />

    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔬 DNS Caching & TTL Behavior</h3>
      <div className="space-y-3 text-sm text-foreground/80">
        <p>CoreDNS caches responses based on the <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">cache</code> plugin configuration (default: 30 seconds). This has critical implications:</p>
        <div className="rounded-lg border border-border p-4 space-y-2">
          <p className="font-semibold text-foreground">TTL = 30s means:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-xs text-muted-foreground">
            <li>A Service deleted 1 second ago may still resolve for up to 29 more seconds</li>
            <li>A new EndpointSlice may not be reflected in DNS responses immediately</li>
            <li>Headless service pod list changes are delayed by up to TTL</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border p-4 space-y-2">
          <p className="font-semibold text-foreground">Application-Level Caching</p>
          <p className="text-xs text-muted-foreground">Many HTTP clients and language runtimes (Java, Go) cache DNS results <strong>beyond</strong> the TTL. This means even after CoreDNS returns updated IPs, your application might still use old ones. Java's <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">InetAddress</code> caches DNS indefinitely by default!</p>
        </div>
        <div className="rounded-lg border border-border p-4 space-y-2">
          <p className="font-semibold text-foreground">ndots:5 Impact</p>
          <p className="text-xs text-muted-foreground">The default <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">ndots:5</code> means any name with fewer than 5 dots triggers search domain expansion. A query for <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">api.example.com</code> (2 dots) generates 4 DNS queries before the actual name is tried. This multiplies DNS traffic significantly.</p>
        </div>
      </div>
    </div>
  </div>
);

export default CoreDNSInternals;
