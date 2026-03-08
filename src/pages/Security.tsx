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

const Security = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-advanced mb-3 inline-block">Intermediate → Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Kubernetes Security</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            RBAC, ServiceAccounts, Secrets, SecurityContexts, Pod Security Standards, and OpenShift SCCs — securing your cluster at every layer.
          </p>
        </motion.div>

        <LayeredExplanation
          title="Security Layers in Kubernetes"
          simple={
            <p>Kubernetes security works in layers, like a building: the outer wall (cluster network), locked doors (authentication), keycards (authorization), and security cameras (audit logging). Each layer adds protection.</p>
          }
          technical={
            <div className="space-y-3">
              <p>Kubernetes security operates at multiple levels:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Transport Security</strong> — TLS encryption for all API communication</li>
                <li><strong>Authentication</strong> — Certificates, tokens, OIDC</li>
                <li><strong>Authorization</strong> — RBAC (Role-Based Access Control)</li>
                <li><strong>Admission Control</strong> — Validating and mutating webhooks</li>
                <li><strong>Pod Security</strong> — Security contexts, capabilities, privilege restrictions</li>
                <li><strong>Network Security</strong> — NetworkPolicies for pod-to-pod communication</li>
                <li><strong>Secret Management</strong> — Managing sensitive data</li>
              </ul>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Every API request passes through: Authentication → Authorization → Admission Control. If any stage rejects the request, it's denied.</p>
              <p>RBAC uses four objects: <strong>Role</strong> (namespace-scoped permissions), <strong>ClusterRole</strong> (cluster-wide permissions), <strong>RoleBinding</strong> (grants Role to subjects in a namespace), and <strong>ClusterRoleBinding</strong> (grants ClusterRole cluster-wide).</p>
            </div>
          }
        />

        <AnalogyCallout
          analogy="RBAC is like a corporate access card system"
          explanation="A Role is like a set of permissions: 'can access floors 1-3, can open meeting rooms.' A RoleBinding is giving that access card to a specific person. A ClusterRole is like a master permission set, and a ClusterRoleBinding is a badge that works across all buildings."
        />

        <FlowDiagram
          title="API Request Security Flow"
          steps={[
            { label: "Request arrives at API server", description: "Client sends HTTPS request with credentials (certificate, bearer token, or OIDC token)." },
            { label: "Authentication", description: "API server verifies identity: 'Who are you?' Multiple authenticators run in sequence." },
            { label: "Authorization (RBAC)", description: "'Are you allowed to do this?' Checks Role/ClusterRole bindings for the authenticated user." },
            { label: "Admission Control", description: "Mutating webhooks may modify the request. Validating webhooks may reject it." },
            { label: "Object validation", description: "API server validates the object against its schema." },
            { label: "Persisted to etcd", description: "If everything passes, the object is stored." },
          ]}
        />

        <ComparisonTable
          title="Role vs ClusterRole"
          headers={["Aspect", "Role", "ClusterRole"]}
          rows={[
            { label: "Scope", values: ["Single namespace", "Cluster-wide or any namespace"] },
            { label: "Use case", values: ["Grant access within a namespace", "Admin access, or reusable across namespaces"] },
            { label: "Binding", values: ["RoleBinding", "RoleBinding (scoped) or ClusterRoleBinding (global)"] },
            { label: "Example", values: ["Read pods in 'dev' namespace", "Read nodes across entire cluster"] },
          ]}
        />

        <CodeBlock
          title="RBAC Example: Read-only Namespace Access"
          language="yaml"
          code={`# Role: what permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: development
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "watch", "list"]
---
# RoleBinding: who gets the permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: development
subjects:
  - kind: User
    name: jane
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io`}
        />

        <LayeredExplanation
          title="SecurityContext & Pod Security"
          simple={
            <p>A SecurityContext lets you control what a container is allowed to do at the OS level — like whether it can run as root, access the host network, or write to the filesystem.</p>
          }
          technical={
            <div className="space-y-3">
              <p>Key SecurityContext fields:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li><strong>runAsNonRoot: true</strong> — Prevents running as root user</li>
                <li><strong>readOnlyRootFilesystem: true</strong> — Makes container filesystem read-only</li>
                <li><strong>allowPrivilegeEscalation: false</strong> — Blocks privilege escalation</li>
                <li><strong>capabilities.drop: ["ALL"]</strong> — Removes all Linux capabilities</li>
              </ul>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Pod Security Standards (PSS) define three profiles:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li><strong>Privileged</strong> — No restrictions (system pods)</li>
                <li><strong>Baseline</strong> — Prevents known privilege escalations</li>
                <li><strong>Restricted</strong> — Heavily restricted, follows security best practices</li>
              </ul>
              <p>These are enforced via Pod Security Admission (PSA) at the namespace level using labels.</p>
            </div>
          }
        />

        <CodeBlock
          title="Secure Pod Example"
          language="yaml"
          code={`apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
    - name: app
      image: myapp:1.0
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
      resources:
        limits:
          cpu: 500m
          memory: 256Mi`}
        />

        <OpenShiftComparison
          k8sFeature="Pod Security Standards (PSA)"
          openshiftFeature="Security Context Constraints (SCC)"
          description="OpenShift uses SCCs instead of PSA. SCCs predate PSA and offer more granular control: they can restrict volume types, host networking, SELinux contexts, and more. The 'restricted' SCC is applied by default in OpenShift, making it more secure out of the box than vanilla Kubernetes."
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Running containers as root", correction: "Always set runAsNonRoot: true. Root in a container can escalate to root on the host in certain scenarios." },
            { mistake: "Storing secrets in ConfigMaps", correction: "Secrets are base64-encoded (not encrypted!) but have access control. Never put passwords in ConfigMaps." },
            { mistake: "Giving cluster-admin to all service accounts", correction: "Follow least privilege. Create specific Roles with only the permissions needed." },
            { mistake: "Not setting resource limits", correction: "Without limits, a compromised container can consume all node resources. Always set CPU and memory limits." },
          ]}
        />

        <QuizCard
          title="Security Quiz"
          questions={[
            {
              question: "What is the correct order of API request security checks?",
              options: ["Admission → Auth → RBAC", "Authentication → Authorization → Admission", "RBAC → Admission → Auth", "Admission → RBAC → Authentication"],
              correctIndex: 1,
              explanation: "Every request goes through Authentication (who?), Authorization/RBAC (allowed?), then Admission Control (should we modify/reject?)."
            },
            {
              question: "What does 'capabilities.drop: [\"ALL\"]' do?",
              options: ["Drops all network connections", "Removes all Linux kernel capabilities from the container", "Deletes all files", "Stops all processes"],
              correctIndex: 1,
              explanation: "Linux capabilities are fine-grained root permissions. Dropping ALL removes privileges like binding to low ports, changing file ownership, etc."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Security;
