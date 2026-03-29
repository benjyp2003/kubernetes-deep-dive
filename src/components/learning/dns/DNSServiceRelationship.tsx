import LayeredExplanation from "@/components/learning/LayeredExplanation";
import CodeBlock from "@/components/learning/CodeBlock";
import ComparisonTable from "@/components/learning/ComparisonTable";
import AnalogyCallout from "@/components/learning/AnalogyCallout";

const DNSServiceRelationship = () => (
  <div className="space-y-8">
    <LayeredExplanation
      title="DNS + Services — The Complete Relationship"
      simple={
        <p>Every Service you create automatically gets a DNS name. When your pod says "connect to my-service", DNS returns the Service's ClusterIP. The Service then routes traffic to the actual pods.</p>
      }
      technical={
        <div className="space-y-3">
          <p>DNS naming convention follows a strict hierarchy:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><strong>Full name:</strong> <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service.my-namespace.svc.cluster.local</code></li>
            <li><strong>Cross-namespace:</strong> <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service.other-namespace</code></li>
            <li><strong>Same namespace (short):</strong> <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">my-service</code></li>
          </ul>
          <p className="mt-2">DNS record types depend on service type:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><strong>ClusterIP Service:</strong> A record → single ClusterIP</li>
            <li><strong>Headless Service:</strong> A record → multiple pod IPs</li>
            <li><strong>ExternalName Service:</strong> CNAME record → external domain</li>
            <li><strong>SRV records:</strong> available for named ports</li>
          </ul>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p className="font-semibold text-foreground">EndpointSlice ↔ CoreDNS Sync</p>
          <p>When a Service is created with a selector, the EndpointSlice controller watches for pods matching that selector and creates EndpointSlice objects. CoreDNS watches these EndpointSlices via its kubernetes plugin informer.</p>
          <p className="mt-2 font-semibold text-foreground">The Data Pipeline:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li>Pod labels change or pod is created/deleted</li>
            <li>EndpointSlice controller detects the change (via pod watch)</li>
            <li>EndpointSlice object is created/updated in etcd</li>
            <li>CoreDNS informer receives the watch event</li>
            <li>CoreDNS updates its in-memory DNS records</li>
            <li>Next DNS query returns the updated data</li>
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">⚠️ There are multiple layers of eventual consistency here. Changes propagate in seconds, but are NOT instant. Race conditions are possible during rapid pod scaling.</p>
        </div>
      }
    />

    <LayeredExplanation
      title="Headless Services — Deep Dive"
      simple={
        <p>A headless service has no ClusterIP. Instead of returning one virtual IP, DNS returns the <strong>actual IPs of every pod</strong> behind the service. This is how StatefulSets give each pod a stable DNS name.</p>
      }
      technical={
        <div className="space-y-3">
          <p>Setting <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">clusterIP: None</code> creates a headless service. DNS behavior changes:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li>DNS A record returns <strong>all pod IPs</strong> (not a single VIP)</li>
            <li>No kube-proxy rules are created (no iptables/IPVS entries)</li>
            <li>Client does its own load balancing</li>
          </ul>
          <p className="mt-2">With StatefulSets, each pod gets a unique DNS name:</p>
          <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded block mt-1">pod-0.my-service.default.svc.cluster.local</code>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Why Headless Services Exist</p>
          <p>Some applications need to know about <strong>all peers</strong> (e.g., database clusters, Kafka, etcd). A regular ClusterIP hides individual pods behind a single VIP. Headless services expose them all.</p>
          <p className="mt-2 font-semibold text-foreground">CoreDNS loadbalance Plugin</p>
          <p>For headless services, CoreDNS uses the <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">loadbalance</code> plugin to shuffle the order of returned A records. This provides basic client-side round-robin, since most DNS clients connect to the first IP in the response.</p>
        </div>
      }
    />

    <CodeBlock
      title="Headless Service YAML"
      language="yaml"
      code={`apiVersion: v1
kind: Service
metadata:
  name: db-headless
spec:
  clusterIP: None          # ← headless
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
---
# DNS returns:
# db-headless.default.svc.cluster.local → [10.244.1.5, 10.244.2.8, 10.244.3.2]
# 
# With StatefulSet:
# postgres-0.db-headless.default.svc.cluster.local → 10.244.1.5
# postgres-1.db-headless.default.svc.cluster.local → 10.244.2.8`}
    />

    <ComparisonTable
      title="ClusterIP vs Headless Service — DNS Behavior"
      headers={["Aspect", "ClusterIP Service", "Headless Service"]}
      rows={[
        { label: "DNS response", values: ["Single A record (ClusterIP)", "Multiple A records (all pod IPs)"] },
        { label: "kube-proxy rules", values: ["Yes — iptables/IPVS created", "No — no proxy rules"] },
        { label: "Load balancing", values: ["kube-proxy (kernel-level)", "Client-side (DNS round-robin)"] },
        { label: "Pod discovery", values: ["Pods hidden behind VIP", "All pod IPs exposed"] },
        { label: "StatefulSet support", values: ["No per-pod DNS names", "Each pod gets unique DNS"] },
        { label: "Use case", values: ["Most services (web, API)", "Databases, peer discovery"] },
      ]}
    />

    <AnalogyCallout
      analogy="ClusterIP = company main phone number. Headless = a directory listing every employee's direct number."
      explanation="With ClusterIP, callers dial one number and the reception (kube-proxy) connects them to an available person. With headless, callers get every employee's direct line and choose who to call — essential when you need to talk to a specific person (like a database primary)."
    />
  </div>
);

export default DNSServiceRelationship;
