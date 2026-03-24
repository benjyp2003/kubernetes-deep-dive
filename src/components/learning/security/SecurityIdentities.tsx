import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CodeBlock from "@/components/learning/CodeBlock";

const SecurityIdentities = () => (
  <div className="space-y-8">
    <LayeredExplanation
      title="Identity Types in Kubernetes"
      simple={
        <p>Kubernetes recognizes two types of identities: <strong>Users</strong> (humans or external systems) and <strong>ServiceAccounts</strong> (identities for pods). Users are managed outside Kubernetes — there's no User object in Kubernetes. ServiceAccounts are Kubernetes objects.</p>
      }
      technical={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Three Identity Types</h4>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Users</strong> — External identities. Kubernetes doesn't store users — it trusts external identity providers (certificates, OIDC, tokens). The username comes from the certificate CN or token claim.</li>
            <li><strong>Groups</strong> — Logical groupings. Come from certificate O (Organization) field or OIDC group claims. Built-in groups: <code className="font-mono text-xs">system:authenticated</code>, <code className="font-mono text-xs">system:unauthenticated</code>, <code className="font-mono text-xs">system:masters</code> (full admin).</li>
            <li><strong>ServiceAccounts</strong> — Kubernetes-native identities. Namespace-scoped objects. Username format: <code className="font-mono text-xs">system:serviceaccount:&lt;namespace&gt;:&lt;name&gt;</code>. Belong to group <code className="font-mono text-xs">system:serviceaccounts:&lt;namespace&gt;</code>.</li>
          </ul>
        </div>
      }
      deep={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">How Authentication Actually Works</h4>
          <p className="text-sm"><strong>Client certificates:</strong> User's identity is the CN (Common Name) field. Groups come from O (Organization) fields. The API server validates against its <code className="font-mono text-xs">--client-ca-file</code>. This is how kubeadm sets up cluster admin (CN=kubernetes-admin, O=system:masters).</p>
          <p className="text-sm mt-2"><strong>Bearer tokens:</strong> Sent in the Authorization header. API server validates against configured authenticators. Static token files are insecure (deprecated). OIDC tokens are preferred for production.</p>
          <p className="text-sm mt-2"><strong>Anonymous requests:</strong> If no authenticator accepts, the request is treated as <code className="font-mono text-xs">system:anonymous</code> user in <code className="font-mono text-xs">system:unauthenticated</code> group. Usually has no permissions.</p>
        </div>
      }
    />

    <LayeredExplanation
      title="ServiceAccount Deep Dive — Token Mechanics"
      simple={
        <p>Every pod runs as a ServiceAccount. By default, it uses the "default" ServiceAccount in its namespace. The ServiceAccount's token is automatically mounted into the pod so it can authenticate to the API server.</p>
      }
      technical={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">How Pod Authentication Works</h4>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li>Pod spec specifies <code className="font-mono text-xs">serviceAccountName</code> (defaults to "default")</li>
            <li>kubelet requests a projected token from API server for this ServiceAccount</li>
            <li>Token is mounted at <code className="font-mono text-xs">/var/run/secrets/kubernetes.io/serviceaccount/token</code></li>
            <li>Along with: <code className="font-mono text-xs">ca.crt</code> (cluster CA) and <code className="font-mono text-xs">namespace</code> file</li>
            <li>When pod calls API server, it sends token in Authorization header</li>
            <li>API server validates token and extracts identity: <code className="font-mono text-xs">system:serviceaccount:&lt;ns&gt;:&lt;name&gt;</code></li>
          </ol>
        </div>
      }
      deep={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Projected Service Account Tokens (K8s 1.24+)</h4>
          <p className="text-sm">Before 1.24, ServiceAccount tokens were long-lived Secrets — created once, never expired. This was a major security risk.</p>
          <p className="text-sm mt-2"><strong>New behavior (BoundServiceAccountToken):</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><strong>Time-bound</strong> — Default expiration: 1 hour. Auto-rotated by kubelet before expiry.</li>
            <li><strong>Audience-bound</strong> — Token is valid only for the API server (audience: <code className="font-mono text-xs">https://kubernetes.default.svc</code>). Can't be used for other services.</li>
            <li><strong>Object-bound</strong> — Token is bound to the specific pod. If pod is deleted, token is immediately invalidated.</li>
            <li><strong>Not stored as Secret</strong> — Token is generated on-demand by the TokenRequest API, not stored in etcd.</li>
          </ul>
          <p className="text-sm mt-2">kubelet uses the TokenRequest API to get fresh tokens and mounts them via projected volumes. The token file is atomically updated before expiry.</p>
        </div>
      }
    />

    <FlowDiagram
      title="Pod → API Server Authentication Flow"
      steps={[
        { label: "Pod reads token file", description: "Application reads /var/run/secrets/kubernetes.io/serviceaccount/token — a JWT projected by kubelet." },
        { label: "HTTP request with Bearer token", description: "Pod sends request to API server (e.g., GET /api/v1/namespaces/default/pods) with Authorization: Bearer <token> header." },
        { label: "API server validates JWT", description: "API server verifies the token signature, checks expiration, validates audience claim, and confirms the bound pod still exists." },
        { label: "Identity extracted", description: "User: system:serviceaccount:default:my-sa. Groups: [system:serviceaccounts, system:serviceaccounts:default, system:authenticated]." },
        { label: "RBAC evaluation", description: "API server checks all RoleBindings/ClusterRoleBindings matching this ServiceAccount or its groups. Evaluates if any grant the requested verb on the requested resource." },
      ]}
    />

    <ComparisonTable
      title="User vs ServiceAccount vs Group"
      headers={["Aspect", "User", "ServiceAccount", "Group"]}
      rows={[
        { label: "Managed by", values: ["External (certs, OIDC)", "Kubernetes (API object)", "Derived from cert/OIDC claims"] },
        { label: "Stored in K8s", values: ["No — no User object", "Yes — in etcd", "No — inferred at auth time"] },
        { label: "Namespace-scoped", values: ["No", "Yes", "No"] },
        { label: "Token type", values: ["Cert or OIDC token", "Projected JWT (auto-rotated)", "N/A"] },
        { label: "Used by", values: ["Humans, CI/CD systems", "Pods, controllers", "RBAC bindings (subjects)"] },
      ]}
    />

    <CodeBlock
      title="ServiceAccount Configuration"
      language="yaml"
      code={`# Custom ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: production
automountServiceAccountToken: true  # default: true
---
# Pod using specific ServiceAccount
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  namespace: production
spec:
  serviceAccountName: app-sa  # <-- use custom SA, not 'default'
  automountServiceAccountToken: true
  containers:
    - name: app
      image: myapp:1.0
      # Token is auto-mounted at:
      # /var/run/secrets/kubernetes.io/serviceaccount/token
      # /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      # /var/run/secrets/kubernetes.io/serviceaccount/namespace`}
    />
  </div>
);

export default SecurityIdentities;
