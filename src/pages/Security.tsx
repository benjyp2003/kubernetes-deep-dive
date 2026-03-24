import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import OpenShiftComparison from "@/components/learning/OpenShiftComparison";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";
import SecurityIdentities from "@/components/learning/security/SecurityIdentities";
import SecurityRBACDeepDive from "@/components/learning/security/SecurityRBACDeepDive";
import SecurityPodSecurity from "@/components/learning/security/SecurityPodSecurity";
import SecurityDebugging from "@/components/learning/security/SecurityDebugging";

const Security = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-advanced mb-3 inline-block">Intermediate → Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Kubernetes Security</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Deep dive into Authentication, Authorization, RBAC, ServiceAccounts, SecurityContexts, and Pod Security — how Kubernetes decides who can do what, and how to debug it.
          </p>
        </motion.div>

        {/* Security Layers Overview */}
        <LayeredExplanation
          title="The Three Gates — AuthN, AuthZ, Admission"
          simple={
            <p>Every request to Kubernetes passes through three security gates: Authentication (who are you?), Authorization (are you allowed?), and Admission Control (should we modify or reject this?). If any gate says no, the request is denied.</p>
          }
          technical={
            <div className="space-y-3">
              <p>The API server processes every request through this pipeline:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Authentication (AuthN)</strong> — Verifies identity. Supports: X.509 client certificates, bearer tokens, OIDC tokens, ServiceAccount tokens, webhook token authentication. Multiple authenticators run in sequence — first match wins.</li>
                <li><strong>Authorization (AuthZ)</strong> — Checks permissions. RBAC is the standard mode. Others: ABAC, Webhook, Node authorization. Evaluates: user/group, verb, resource, namespace.</li>
                <li><strong>Admission Control</strong> — Mutating webhooks modify the request (add defaults, inject sidecars). Validating webhooks reject invalid requests. Built-in controllers: LimitRanger, ResourceQuota, PodSecurity.</li>
              </ul>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p><strong>Critical concept: no explicit deny in RBAC.</strong> Kubernetes RBAC is purely additive — you can only grant permissions, never deny them. If no Role/ClusterRole grants a permission, it's denied by default. This is different from AWS IAM which has explicit deny rules.</p>
              <p><strong>Authorization modes</strong> are configured on the API server with <code className="font-mono text-xs">--authorization-mode=Node,RBAC</code>. Node authorization restricts kubelets to only access resources for pods scheduled on their node. Multiple modes are evaluated in order — first decision (allow or deny) wins.</p>
              <p><strong>Admission controllers</strong> run AFTER authorization. Even if RBAC allows a request, admission can reject it (e.g., PodSecurity rejecting a privileged pod in a restricted namespace).</p>
            </div>
          }
        />

        <FlowDiagram
          title="Complete API Request Security Flow"
          steps={[
            { label: "Client sends HTTPS request", description: "kubectl reads kubeconfig for API server URL, client certificate/token. Sends request over TLS. Example: GET /api/v1/namespaces/dev/pods" },
            { label: "TLS termination", description: "API server validates client's TLS certificate against its CA bundle. If using bearer token, certificate step is skipped for identity (but TLS still encrypts the connection)." },
            { label: "Authentication — 'Who are you?'", description: "API server runs each authenticator in order: client cert → bearer token → OIDC → ServiceAccount. First authenticator that accepts sets the user identity (username, UID, groups). If none accept → 401 Unauthorized." },
            { label: "Authorization — 'Can you do this?'", description: "RBAC evaluator checks all RoleBindings/ClusterRoleBindings that match the user/group. For each binding, checks if the referenced Role/ClusterRole grants the requested verb on the requested resource in the requested namespace. No match → 403 Forbidden." },
            { label: "Mutating Admission", description: "Mutating webhooks run in order. They can modify the request (inject sidecar containers, add labels, set defaults). The object may look different after this stage." },
            { label: "Object Schema Validation", description: "API server validates the (potentially mutated) object against its OpenAPI schema. Invalid fields or missing required fields → rejected." },
            { label: "Validating Admission", description: "Validating webhooks run in parallel. They can reject but NOT modify. Examples: OPA Gatekeeper, Pod Security Admission." },
            { label: "Persisted to etcd", description: "Object is serialized and stored in etcd. A resourceVersion is assigned. Watch events are sent to all watchers." },
          ]}
        />

        <AnalogyCallout
          analogy="API security is like airport security"
          explanation="Authentication = checking your passport (who are you?). Authorization = checking your boarding pass (are you allowed on this flight?). Admission = security screening (does your baggage comply with rules?). You must pass ALL three. Even with a valid passport and boarding pass, prohibited items get rejected at screening."
        />

        {/* Identity Deep Dive */}
        <SecurityIdentities />

        {/* RBAC Deep Dive */}
        <SecurityRBACDeepDive />

        {/* Pod Security */}
        <SecurityPodSecurity />

        <OpenShiftComparison
          k8sFeature="Pod Security Standards (PSA)"
          openshiftFeature="Security Context Constraints (SCC)"
          description="OpenShift uses SCCs instead of PSA. SCCs predate PSA and offer more granular control: they can restrict volume types, host networking, SELinux contexts, and fsGroup ranges. The 'restricted' SCC is applied by default, making OpenShift more secure out of the box. SCCs are matched by priority and assigned to pods via ServiceAccount annotations."
        />

        {/* Debugging */}
        <SecurityDebugging />

        <QuizCard
          title="Security Deep Dive Quiz"
          questions={[
            {
              question: "What is the correct order of API request security checks?",
              options: ["Admission → Auth → RBAC", "Authentication → Authorization → Admission", "RBAC → Admission → Auth", "Admission → RBAC → Authentication"],
              correctIndex: 1,
              explanation: "Every request goes through Authentication (who?), Authorization/RBAC (allowed?), then Admission Control (modify/reject?). This order is critical — admission runs AFTER authorization."
            },
            {
              question: "Why does RBAC have no explicit deny rules?",
              options: ["It's a bug", "Deny-by-default: everything is denied unless explicitly allowed", "Kubernetes doesn't support deny", "RBAC only works with allow rules for performance"],
              correctIndex: 1,
              explanation: "RBAC is purely additive. All permissions are denied by default. Roles can only GRANT permissions. If no rule grants access, the request is denied. This simplifies policy evaluation — no conflict resolution needed."
            },
            {
              question: "What does 'kubectl auth can-i create deployments --as=dev-user -n prod' do?",
              options: [
                "Creates a deployment as dev-user",
                "Checks if dev-user can create deployments in prod namespace by querying API server's authorization",
                "Logs in as dev-user",
                "Creates a role for dev-user",
              ],
              correctIndex: 1,
              explanation: "kubectl auth can-i sends a SubjectAccessReview to the API server, which evaluates RBAC rules for the specified user, verb, resource, and namespace. It returns yes/no without actually performing the action."
            },
            {
              question: "A pod's ServiceAccount token is mounted at /var/run/secrets. What changed in Kubernetes 1.24+?",
              options: [
                "Tokens are no longer mounted",
                "Tokens are now projected (time-bound, audience-bound) instead of long-lived secrets",
                "ServiceAccounts were removed",
                "Tokens are encrypted",
              ],
              correctIndex: 1,
              explanation: "Kubernetes 1.24+ uses projected service account tokens (BoundServiceAccountToken). These are time-limited (1h default, auto-rotated), audience-bound, and not stored as Secret objects. Much more secure than the old long-lived tokens."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Security;
