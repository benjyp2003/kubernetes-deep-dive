import LayeredExplanation from "@/components/learning/LayeredExplanation";
import CodeBlock from "@/components/learning/CodeBlock";
import AnalogyCallout from "@/components/learning/AnalogyCallout";

const ConfigNamespaces = () => (
  <div className="space-y-8">
    <LayeredExplanation
      title="Namespaces — Isolation & Organization"
      simple={<p>Namespaces are like folders for your Kubernetes objects. They let you organize resources, control access, and set resource limits. Different teams or environments can use different namespaces.</p>}
      technical={
        <div className="space-y-3">
          <p>Namespaces provide:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Name scope</strong> — same resource name allowed in different namespaces</li>
            <li><strong>RBAC boundary</strong> — Roles and RoleBindings are namespace-scoped</li>
            <li><strong>Resource quota boundary</strong> — limit CPU, memory, object counts per namespace</li>
            <li><strong>LimitRange boundary</strong> — set default resource requests/limits per container</li>
            <li><strong>Network policy scope</strong> — NetworkPolicies select pods within a namespace</li>
          </ul>
          <p className="mt-2">Default namespaces: <code className="font-mono text-xs">default</code> (your resources), <code className="font-mono text-xs">kube-system</code> (control plane), <code className="font-mono text-xs">kube-public</code> (public info), <code className="font-mono text-xs">kube-node-lease</code> (node heartbeats).</p>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p><strong>Cluster-scoped vs namespace-scoped:</strong> Not all resources live in namespaces. Nodes, PersistentVolumes, ClusterRoles, Namespaces themselves, and StorageClasses are cluster-scoped. Use <code className="font-mono text-xs">kubectl api-resources --namespaced=false</code> to list them.</p>
          <p><strong>Namespace as a security boundary:</strong> Namespaces alone provide NO security isolation. You must combine them with RBAC (who can access), NetworkPolicies (network isolation), and ResourceQuotas (resource limits) for real multitenancy.</p>
          <p><strong>Cross-namespace access:</strong> Services can be reached across namespaces via DNS: <code className="font-mono text-xs">service-name.namespace.svc.cluster.local</code>. Without NetworkPolicies, all pods can communicate across namespaces.</p>
        </div>
      }
    />

    <CodeBlock
      title="ResourceQuota + LimitRange — Resource Governance"
      language="yaml"
      code={`# ResourceQuota — caps total namespace resource usage
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: team-a
spec:
  hard:
    pods: "20"                    # max 20 pods
    requests.cpu: "10"            # total CPU requests
    requests.memory: "20Gi"       # total memory requests
    limits.cpu: "20"              # total CPU limits
    limits.memory: "40Gi"         # total memory limits
    persistentvolumeclaims: "10"  # max PVCs
    services.loadbalancers: "2"   # max LoadBalancer services
---
# LimitRange — sets defaults and caps per container
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: team-a
spec:
  limits:
    - default:           # default limits (if not specified)
        cpu: 500m
        memory: 256Mi
      defaultRequest:    # default requests (if not specified)
        cpu: 100m
        memory: 128Mi
      max:               # maximum allowed
        cpu: "2"
        memory: 2Gi
      min:               # minimum required
        cpu: 50m
        memory: 64Mi
      type: Container`}
    />

    <AnalogyCallout
      analogy="Namespaces are like apartments in a building"
      explanation="Each apartment (namespace) has its own space, keys (RBAC), and utility budget (ResourceQuota). Tenants can't access each other's apartments without permission (RBAC). The building manager (cluster admin) oversees everything. Without locks (NetworkPolicies), tenants can still shout through the walls (network access)."
    />
  </div>
);

export default ConfigNamespaces;
