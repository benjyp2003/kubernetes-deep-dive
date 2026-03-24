import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";

const SecurityDebugging = () => (
  <div className="space-y-8">
    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔍 Real Security Debugging Scenarios</h3>
      <div className="space-y-6">
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 1: Forbidden Error — User Can't List Pods</h4>
          <div className="font-mono text-xs bg-muted p-3 rounded-lg mb-3">
            Error from server (Forbidden): pods is forbidden: User "dev-user" cannot list resource "pods" in API group "" in namespace "production"
          </div>
          <p className="text-sm"><strong>Debug flow:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li>Confirm the identity: <code className="font-mono text-xs">kubectl auth whoami</code> (or check kubeconfig)</li>
            <li>Check permissions: <code className="font-mono text-xs">kubectl auth can-i list pods -n production --as=dev-user</code></li>
            <li>Check RoleBindings: <code className="font-mono text-xs">kubectl get rolebindings -n production -o wide</code></li>
            <li>Check ClusterRoleBindings: <code className="font-mono text-xs">kubectl get clusterrolebindings -o wide | grep dev-user</code></li>
            <li>Inspect the Role: <code className="font-mono text-xs">kubectl describe role &lt;name&gt; -n production</code></li>
            <li><strong>Fix:</strong> Create/fix RoleBinding linking user to a Role with <code className="font-mono text-xs">list pods</code> permission</li>
          </ol>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 2: ServiceAccount Can't Read Secrets</h4>
          <div className="font-mono text-xs bg-muted p-3 rounded-lg mb-3">
            Forbidden: User "system:serviceaccount:default:app-sa" cannot get resource "secrets" in API group "" in namespace "default"
          </div>
          <p className="text-sm"><strong>Debug flow:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li>Confirm SA exists: <code className="font-mono text-xs">kubectl get sa app-sa -n default</code></li>
            <li>Check SA permissions: <code className="font-mono text-xs">kubectl auth can-i get secrets --as=system:serviceaccount:default:app-sa</code></li>
            <li>Check bindings for this SA: <code className="font-mono text-xs">kubectl get rolebindings -n default -o yaml | grep -A5 app-sa</code></li>
            <li><strong>Common cause:</strong> Role exists but binding references wrong ServiceAccount name or wrong namespace</li>
          </ol>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 3: RoleBinding in Wrong Namespace</h4>
          <p className="text-sm text-muted-foreground mb-2"><strong>Symptom:</strong> User has a Role and RoleBinding but still gets Forbidden.</p>
          <p className="text-sm"><strong>Root cause:</strong> RoleBinding was created in namespace "dev" but user is accessing namespace "staging".</p>
          <p className="text-sm mt-1"><strong>Key insight:</strong> A RoleBinding grants permissions ONLY in its own namespace. If you need access in multiple namespaces, create a RoleBinding in each, or use a ClusterRoleBinding (if cluster-wide access is appropriate).</p>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 4: ClusterRole vs Role Confusion</h4>
          <p className="text-sm text-muted-foreground mb-2"><strong>Symptom:</strong> User can list pods but can't list nodes.</p>
          <p className="text-sm"><strong>Root cause:</strong> Nodes are cluster-scoped resources. A namespace-scoped Role can never grant access to cluster-scoped resources. You need a ClusterRole + ClusterRoleBinding for nodes, PVs, namespaces, etc.</p>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 5: Pod Using Wrong ServiceAccount</h4>
          <p className="text-sm text-muted-foreground mb-2"><strong>Symptom:</strong> Application inside pod gets Forbidden accessing API.</p>
          <p className="text-sm"><strong>Debug:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
            <li>Check which SA the pod uses: <code className="font-mono text-xs">kubectl get pod &lt;name&gt; -o jsonpath='&#123;.spec.serviceAccountName&#125;'</code></li>
            <li>Often the pod uses "default" SA (which has no permissions) instead of the intended custom SA</li>
            <li><strong>Fix:</strong> Set <code className="font-mono text-xs">serviceAccountName: my-custom-sa</code> in pod spec</li>
          </ol>
        </div>
      </div>
    </div>

    <CodeBlock
      title="Essential Security Debug Commands"
      language="bash"
      code={`# Check your identity
kubectl auth whoami

# Check specific permission
kubectl auth can-i create deployments -n production

# Check as another user (impersonation)
kubectl auth can-i get pods --as=dev-user -n staging

# Check as a ServiceAccount
kubectl auth can-i get secrets \\
  --as=system:serviceaccount:myns:mysa -n myns

# List all your permissions in a namespace
kubectl auth can-i --list -n development

# Find all RoleBindings in a namespace
kubectl get rolebindings -n production -o wide

# Find all ClusterRoleBindings for a subject
kubectl get clusterrolebindings -o wide | grep dev-user

# Inspect a Role's rules
kubectl describe role pod-reader -n development

# Inspect a ClusterRole's rules
kubectl describe clusterrole cluster-admin

# Check which SA a pod uses
kubectl get pod my-pod -o jsonpath='{.spec.serviceAccountName}'

# Check if SA token is mounted
kubectl exec my-pod -- ls /var/run/secrets/kubernetes.io/serviceaccount/

# Read the SA token (for debugging only!)
kubectl exec my-pod -- cat /var/run/secrets/kubernetes.io/serviceaccount/token`}
    />

    <CommonMistakes
      mistakes={[
        { mistake: "Running containers as root", correction: "Always set runAsNonRoot: true. Root in a container can escape to the host in certain configurations (especially without seccomp/AppArmor)." },
        { mistake: "Giving cluster-admin to service accounts", correction: "Follow least privilege. Create specific Roles with only the verbs and resources needed. Use kubectl auth can-i --list to audit actual permissions." },
        { mistake: "Creating RoleBinding but forgetting the namespace", correction: "A RoleBinding only works in its namespace. If user needs access in 'prod' but binding is in 'dev', they'll still get Forbidden in 'prod'." },
        { mistake: "Not disabling automountServiceAccountToken", correction: "If a pod doesn't need API access, set automountServiceAccountToken: false. This prevents token exposure if the pod is compromised." },
        { mistake: "Using the 'default' ServiceAccount for everything", correction: "The default SA has no permissions but the token is still mounted. Create purpose-specific ServiceAccounts with minimal RBAC." },
      ]}
    />
  </div>
);

export default SecurityDebugging;
