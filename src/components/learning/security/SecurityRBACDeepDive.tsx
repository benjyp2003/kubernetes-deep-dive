import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CodeBlock from "@/components/learning/CodeBlock";
import AnalogyCallout from "@/components/learning/AnalogyCallout";

const SecurityRBACDeepDive = () => (
  <div className="space-y-8">
    <LayeredExplanation
      title="RBAC — How Authorization Actually Works"
      simple={
        <p>RBAC (Role-Based Access Control) determines what actions users and pods can perform. You create Roles (what permissions) and RoleBindings (who gets them). If there's no rule granting access, the request is denied.</p>
      }
      technical={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Four RBAC Objects</h4>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Role</strong> — Set of permissions (verbs on resources) in a <strong>single namespace</strong></li>
            <li><strong>ClusterRole</strong> — Permissions across the <strong>entire cluster</strong> or cluster-scoped resources (nodes, PVs)</li>
            <li><strong>RoleBinding</strong> — Grants a Role (or ClusterRole) to subjects <strong>in a namespace</strong></li>
            <li><strong>ClusterRoleBinding</strong> — Grants a ClusterRole to subjects <strong>cluster-wide</strong></li>
          </ul>
          <p className="mt-2 text-sm"><strong>Key pattern:</strong> A ClusterRole + RoleBinding = reusable permissions scoped to a namespace. This is how you create a "pod-reader" ClusterRole and grant it per-namespace.</p>
        </div>
      }
      deep={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">RBAC Matching Algorithm</h4>
          <p className="text-sm">When the API server receives a request, the RBAC authorizer:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li>Extracts: <strong>user</strong>, <strong>groups</strong>, <strong>verb</strong> (get/list/create/update/delete/watch), <strong>resource</strong> (pods/services), <strong>namespace</strong>, <strong>API group</strong></li>
            <li>Scans ALL ClusterRoleBindings — checks if any references a ClusterRole that grants the verb+resource, AND the subject matches the user/group</li>
            <li>If namespace-scoped request, scans ALL RoleBindings in that namespace — checks if any grants the verb+resource</li>
            <li><strong>First allow wins</strong> — if ANY binding grants access, the request is allowed</li>
            <li>If no binding matches → <strong>403 Forbidden</strong></li>
          </ol>
          <p className="text-sm mt-2"><strong>No ordering, no priority, no deny.</strong> RBAC rules are unordered. All bindings are evaluated. There's no way to deny a permission that another role grants. This means: be careful with ClusterRoleBindings — they grant access everywhere.</p>
          <p className="text-sm mt-2"><strong>Wildcard rules:</strong> <code className="font-mono text-xs">"*"</code> in verbs, resources, or apiGroups matches everything. The built-in <code className="font-mono text-xs">cluster-admin</code> ClusterRole uses <code className="font-mono text-xs">{"{'*'}"}</code> everywhere — full access to everything.</p>
        </div>
      }
    />

    <FlowDiagram
      title="RBAC Evaluation — Internal Flow"
      steps={[
        { label: "Request attributes extracted", description: "API server extracts: user=jane, groups=[developers], verb=get, resource=pods, namespace=dev, apiGroup=''" },
        { label: "Check ClusterRoleBindings", description: "Scan all ClusterRoleBindings. For each: does the subject match 'jane' or group 'developers'? If yes, does the referenced ClusterRole grant 'get' on 'pods'? Match → ALLOW." },
        { label: "Check RoleBindings in namespace 'dev'", description: "Scan all RoleBindings in 'dev' namespace. Same matching logic. If the binding references a Role OR ClusterRole that grants the permission → ALLOW." },
        { label: "No match found", description: "No binding grants the permission → 403 Forbidden: User 'jane' cannot get pods in namespace 'dev'." },
      ]}
    />

    <ComparisonTable
      title="Role vs ClusterRole — When to Use"
      headers={["Aspect", "Role + RoleBinding", "ClusterRole + RoleBinding", "ClusterRole + ClusterRoleBinding"]}
      rows={[
        { label: "Scope", values: ["Single namespace", "Single namespace (reusable template)", "All namespaces + cluster resources"] },
        { label: "Use case", values: ["Team access in one namespace", "Same permissions replicated across namespaces", "Cluster admin, node access, PV management"] },
        { label: "Risk level", values: ["Low — contained", "Low — namespace-scoped", "HIGH — cluster-wide access"] },
        { label: "Example", values: ["Dev team reads pods in 'dev'", "'pod-reader' role used in dev, staging, prod", "Cluster admin, monitoring systems"] },
      ]}
    />

    <CodeBlock
      title="RBAC — Complete Examples"
      language="yaml"
      code={`# Namespace-scoped Role: read pods and logs
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: development
rules:
  - apiGroups: [""]           # "" = core API group
    resources: ["pods", "pods/log"]
    verbs: ["get", "watch", "list"]
  - apiGroups: ["apps"]       # apps API group
    resources: ["deployments"]
    verbs: ["get", "list"]
---
# RoleBinding: grant to user AND group
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-dev
  namespace: development
subjects:
  - kind: User
    name: jane
    apiGroup: rbac.authorization.k8s.io
  - kind: Group
    name: developers
    apiGroup: rbac.authorization.k8s.io
  - kind: ServiceAccount
    name: monitoring-sa
    namespace: monitoring     # SA namespace must be specified
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
---
# ClusterRole for cluster-wide resources
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-viewer
rules:
  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["persistentvolumes"]
    verbs: ["get", "list"]
---
# ClusterRoleBinding: grant cluster-wide
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: global-node-viewer
subjects:
  - kind: Group
    name: platform-team
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: node-viewer
  apiGroup: rbac.authorization.k8s.io`}
    />

    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔍 kubectl auth can-i — The Essential Debug Tool</h3>
      <div className="space-y-4">
        <p className="text-sm text-foreground/80">
          <code className="font-mono text-xs">kubectl auth can-i</code> sends a <strong>SubjectAccessReview</strong> to the API server. The API server evaluates RBAC rules and returns yes/no. This is the single most important command for debugging RBAC issues.
        </p>
        <CodeBlock
          title="kubectl auth can-i — Examples"
          language="bash"
          code={`# Can I list pods in the dev namespace?
kubectl auth can-i list pods -n dev
# Output: yes

# Can a specific user create deployments?
kubectl auth can-i create deployments --as=jane -n production
# Output: no

# Can a ServiceAccount get secrets?
kubectl auth can-i get secrets \\
  --as=system:serviceaccount:default:app-sa -n default
# Output: no

# List ALL permissions for current user in a namespace
kubectl auth can-i --list -n development
# Output:
# Resources   Non-Resource URLs   Resource Names   Verbs
# pods        []                  []               [get list watch]
# services    []                  []               [get list]

# Check cluster-scoped permission
kubectl auth can-i list nodes
# Output: yes (if you're cluster-admin)

# Impersonate a group
kubectl auth can-i create pods --as=jane \\
  --as-group=developers -n staging`}
        />
        <p className="text-sm text-muted-foreground">
          <strong>Internally:</strong> This creates a SubjectAccessReview resource, sends it to the API server, which evaluates all RBAC rules for the specified user/group/verb/resource/namespace combination and returns the result. No actual action is performed.
        </p>
      </div>
    </div>

    <AnalogyCallout
      analogy="RBAC is like a corporate key card system"
      explanation="A Role is a set of door permissions: 'can open labs 1-3, can access meeting rooms.' A RoleBinding is programming a specific key card with those permissions. A ClusterRole is a template that can be programmed onto cards for any building (namespace). A ClusterRoleBinding gives access to ALL buildings. No explicit 'deny' — if the card doesn't have the permission, the door stays locked."
    />
  </div>
);

export default SecurityRBACDeepDive;
