import CodeBlock from "@/components/learning/CodeBlock";
import FlowDiagram from "@/components/learning/FlowDiagram";
import { Link } from "react-router-dom";
import { AlertTriangle, Bug, Terminal } from "lucide-react";

const DNSDebugging = () => (
  <div className="space-y-8">
    <div className="k8s-card">
      <div className="flex items-center gap-2 mb-4">
        <Bug className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-lg text-foreground">DNS Debugging — Systematic Approach</h3>
      </div>
      <p className="text-sm text-foreground/80 mb-6">DNS failures are one of the most common causes of application failures in Kubernetes. Here's how to debug them systematically.</p>

      <FlowDiagram
        title="DNS Debug Flow"
        steps={[
          { label: "Check pod DNS config", description: "kubectl exec -it pod -- cat /etc/resolv.conf — verify nameserver points to CoreDNS IP and search domains are correct." },
          { label: "Test DNS resolution from pod", description: "kubectl exec -it pod -- nslookup my-service — does it resolve? If NXDOMAIN, the service name or namespace is wrong." },
          { label: "Check CoreDNS pods are running", description: "kubectl get pods -n kube-system -l k8s-app=kube-dns — if CoreDNS pods are CrashLoopBackOff, DNS is completely broken." },
          { label: "Check CoreDNS logs", description: "kubectl logs -n kube-system -l k8s-app=kube-dns — look for errors like SERVFAIL, plugin errors, or upstream timeout." },
          { label: "Verify the Service exists", description: "kubectl get svc my-service -n default — if the service doesn't exist, DNS can't resolve it." },
          { label: "Check EndpointSlices", description: "kubectl get endpointslices -l kubernetes.io/service-name=my-service — no endpoints means no pods match the selector." },
          { label: "Identify root cause", description: "At this point you know: is it DNS config? CoreDNS? Missing service? Missing endpoints? Fix the layer that's broken." },
        ]}
      />
    </div>

    <div className="k8s-warning">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-k8s-orange" />
        <h3 className="font-display font-semibold text-foreground">Common DNS Problems & Solutions</h3>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-semibold text-foreground">❌ "could not resolve host" / NXDOMAIN</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>• Service doesn't exist in the expected namespace</p>
            <p>• Typo in service name</p>
            <p>• Pod is using <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">dnsPolicy: Default</code> (not using CoreDNS)</p>
            <p>• Cross-namespace access without namespace qualifier</p>
            <p className="mt-2 text-foreground">✅ Fix: Verify service exists with <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kubectl get svc -A | grep my-service</code> and use full name for cross-namespace</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-semibold text-foreground">❌ DNS timeout / SERVFAIL</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>• CoreDNS pods are down or overloaded</p>
            <p>• Network policy blocking DNS traffic (port 53 UDP/TCP)</p>
            <p>• CoreDNS can't reach the API server</p>
            <p>• Forwarding loop detected (check CoreDNS logs for "Loop" detection)</p>
            <p className="mt-2 text-foreground">✅ Fix: Check CoreDNS pod health and logs. Ensure NetworkPolicies allow UDP/TCP port 53 to kube-system</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-semibold text-foreground">❌ Service resolves but connection fails</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>• DNS is fine, but no pods back the service (empty EndpointSlice)</p>
            <p>• Pod selector mismatch — labels on pods don't match service selector</p>
            <p>• Target port is wrong — service port maps to wrong container port</p>
            <p>• Pod is not ready (readiness probe failing)</p>
            <p className="mt-2 text-foreground">✅ Fix: Check <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">kubectl get endpoints my-service</code> and verify pod labels match service selector</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-semibold text-foreground">❌ Stale DNS / app connecting to old pods</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>• CoreDNS cache hasn't expired yet (up to 30s TTL)</p>
            <p>• Application-level DNS caching (Java, Go HTTP clients)</p>
            <p>• Connection pooling keeps old TCP connections alive</p>
            <p className="mt-2 text-foreground">✅ Fix: Reduce CoreDNS cache TTL, configure app DNS TTL, or use connection draining</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-semibold text-foreground">❌ High DNS latency / many DNS queries</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>• <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">ndots:5</code> causes search domain expansion — each short name generates up to 4 extra queries</p>
            <p>• External domains (e.g., <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">api.stripe.com</code>) trigger 4 failed cluster lookups before the real query</p>
            <p className="mt-2 text-foreground">✅ Fix: Use FQDNs with trailing dot in app config, or reduce ndots in pod spec</p>
          </div>
        </div>
      </div>
    </div>

    <CodeBlock
      title="Essential DNS Debug Commands"
      language="bash"
      code={`# Check pod DNS config
kubectl exec -it my-pod -- cat /etc/resolv.conf

# Test DNS resolution from inside a pod
kubectl exec -it my-pod -- nslookup my-service
kubectl exec -it my-pod -- nslookup my-service.other-namespace.svc.cluster.local

# Check CoreDNS health
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns --tail=50

# Check service and endpoints
kubectl get svc my-service
kubectl get endpoints my-service
kubectl get endpointslices -l kubernetes.io/service-name=my-service

# Run a DNS debug pod
kubectl run dnsutils --image=registry.k8s.io/e2e-test-images/jessie-dnsutils:1.3 \\
  --restart=Never -- sleep infinity
kubectl exec -it dnsutils -- dig my-service.default.svc.cluster.local

# Check CoreDNS Corefile
kubectl get configmap coredns -n kube-system -o yaml`}
    />

    <div className="k8s-card">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-lg text-foreground">Real-World DNS Insights</h3>
      </div>
      <div className="space-y-3 text-sm text-foreground/80">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="font-semibold text-foreground">DNS failures cascade</p>
          <p className="text-xs text-muted-foreground mt-1">If CoreDNS goes down, <strong>every application in the cluster</strong> loses the ability to discover other services. This makes DNS a single point of failure. Production clusters run multiple CoreDNS replicas with pod anti-affinity.</p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="font-semibold text-foreground">Service meshes amplify DNS load</p>
          <p className="text-xs text-muted-foreground mt-1">Istio, Linkerd, and similar meshes intercept DNS and add their own resolution layers. This can increase DNS query volume by 3-5x. Monitor CoreDNS metrics via its Prometheus endpoint (:9153).</p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="font-semibold text-foreground">ndots:5 is the #1 DNS performance issue</p>
          <p className="text-xs text-muted-foreground mt-1">A single <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">curl https://api.stripe.com</code> generates 5 DNS queries (4 failed cluster lookups + 1 real). At scale, this multiplier crushes CoreDNS. Use FQDNs with trailing dots for external services.</p>
        </div>
      </div>
    </div>

    <div className="k8s-card border-primary/30">
      <h3 className="font-display font-semibold text-lg text-foreground mb-3">🔗 Practice DNS Debugging</h3>
      <p className="text-sm text-muted-foreground mb-4">Test your DNS debugging skills in the Troubleshooting Lab:</p>
      <div className="flex flex-wrap gap-2">
        <Link to="/troubleshooting-lab/selector-mismatch" className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
          🔍 Service Selector Mismatch
        </Link>
        <Link to="/troubleshooting-lab/network-policy-block" className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
          🛡️ Network Policy Blocking DNS
        </Link>
      </div>
    </div>
  </div>
);

export default DNSDebugging;
