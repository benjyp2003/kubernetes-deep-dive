import FlowDiagram from "@/components/learning/FlowDiagram";

const LabelsInternalFlows = () => (
  <div className="space-y-6">
    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔄 How Services Find Pods — Internal Flow</h3>
      <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
        <p>Kubernetes does <strong>NOT</strong> link Services to Pods by name or reference. It uses <strong>dynamic label matching</strong> via the EndpointSlice controller.</p>
        <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1">
          <p className="text-primary font-semibold">Step-by-step internal flow:</p>
          <p>1. Service created with <code>selector: app=web</code></p>
          <p>2. API Server stores Service in etcd</p>
          <p>3. <strong>EndpointSlice controller</strong> watches for Service changes</p>
          <p>4. Controller queries API Server: "find all Pods matching <code>app=web</code>"</p>
          <p>5. API Server uses label index to return matching Pods</p>
          <p>6. Controller creates/updates EndpointSlice with Pod IPs + ports</p>
          <p>7. kube-proxy watches EndpointSlices → updates iptables/IPVS rules</p>
          <p>8. Traffic to Service ClusterIP gets routed to matched Pod IPs</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="font-semibold text-primary text-xs mb-1">🔬 Critical insight:</p>
          <p className="text-xs">When you change a Pod's labels, the EndpointSlice controller <strong>immediately re-evaluates</strong> the match. If the label no longer matches, the Pod is removed from the EndpointSlice within seconds — traffic stops flowing to it. This is how rolling updates work: old pods lose matching labels as new pods gain them.</p>
        </div>
      </div>
    </div>

    <FlowDiagram
      title="Service → Pod Label Matching Pipeline"
      steps={[
        { label: "Service", description: "selector: {app: web}", icon: "🔌" },
        { label: "API Server", description: "Stores Service, notifies watchers", icon: "🎛️" },
        { label: "EndpointSlice Controller", description: "Watches Services & Pods, matches labels", icon: "🔄" },
        { label: "EndpointSlice", description: "Contains IPs of matching Pods", icon: "📋" },
        { label: "kube-proxy", description: "Watches EndpointSlices → iptables rules", icon: "🔀" },
        { label: "Pod receives traffic", description: "Only if labels match selector", icon: "🫛" },
      ]}
    />

    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔄 How Deployments Manage Pods — Label Ownership</h3>
      <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
        <p>Deployments don't "own" Pods by name. They use <strong>label selectors</strong> and <strong>ownerReferences</strong> together:</p>
        <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1">
          <p>1. Deployment defines <code>spec.selector.matchLabels</code></p>
          <p>2. Deployment controller creates ReplicaSet with same selector</p>
          <p>3. ReplicaSet creates Pods with matching labels + ownerReference</p>
          <p>4. ReplicaSet controller watches Pods matching its selector</p>
          <p>5. If a Pod's labels are changed → ReplicaSet loses track of it</p>
          <p>6. ReplicaSet creates a replacement Pod (sees count is below desired)</p>
        </div>
        <div className="border border-destructive/20 rounded-lg p-3 bg-destructive/5">
          <p className="font-semibold text-destructive text-xs mb-1">⚠️ Real debugging trap:</p>
          <p className="text-xs">If you manually change a Pod's labels to not match its Deployment's selector, the ReplicaSet will create a <em>new</em> Pod while the orphaned Pod keeps running. You now have an extra unmanaged Pod. This is actually a useful debugging technique — remove a Pod from a ReplicaSet to inspect it without it being killed.</p>
        </div>
      </div>
    </div>

    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔄 How NetworkPolicies Use Labels</h3>
      <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
        <p>NetworkPolicies use <strong>two levels of label selectors</strong>:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="font-semibold text-xs text-primary mb-1">podSelector</p>
            <p className="text-xs">Selects which Pods the policy applies TO. If a Pod's labels change and no longer match, the NetworkPolicy stops protecting it.</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="font-semibold text-xs text-primary mb-1">ingress/egress selectors</p>
            <p className="text-xs">Selects which Pods are ALLOWED to communicate. Uses podSelector and namespaceSelector within rules.</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">The CNI plugin (Calico, Cilium, etc.) watches NetworkPolicy objects and Pod labels to build firewall rules. Label changes trigger immediate rule recalculation.</p>
      </div>
    </div>
  </div>
);

export default LabelsInternalFlows;
