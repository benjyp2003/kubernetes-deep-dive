import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";

const ConfigSecretsDeepDive = () => (
  <div className="space-y-8">
    <LayeredExplanation
      title="Secrets — Security Deep Dive"
      simple={
        <p>Secrets store sensitive data like passwords and certificates. They're base64-encoded (not encrypted!) and protected by RBAC access control. For real security, you need encryption at rest and careful access management.</p>
      }
      technical={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Three Layers of Secret Protection</h4>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>In transit</strong> — All API server communication uses TLS. Secrets are encrypted on the wire between kubectl → API server and API server → etcd.</li>
            <li><strong>At rest in etcd</strong> — By default, Secrets are stored as base64 in etcd (readable by anyone with etcd access). With <code className="font-mono text-xs">EncryptionConfiguration</code>, you can enable AES-CBC, AES-GCM, or KMS encryption.</li>
            <li><strong>Access control</strong> — RBAC controls who can read/write Secrets. A user with <code className="font-mono text-xs">get</code> permission on Secrets can read all secrets in that namespace.</li>
          </ul>
        </div>
      }
      deep={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">How Secrets Are Exposed to Pods</h4>
          <p className="text-sm"><strong>Volume mounts (preferred):</strong> kubelet writes secret data to a tmpfs (in-memory filesystem) on the node. The data never touches disk. File permissions default to 0644 but should be set to 0400.</p>
          <p className="text-sm mt-2"><strong>Environment variables (risky):</strong> The secret value is passed to the container runtime and set as a process env var. Risks:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><code className="font-mono text-xs">/proc/1/environ</code> — readable by anyone with exec access to the container</li>
            <li>Logging — <code className="font-mono text-xs">env</code> command or application error logs may dump all env vars</li>
            <li>Child processes inherit all parent env vars</li>
            <li>Crash dumps and core files may contain env var data</li>
          </ul>
          <p className="text-sm mt-2"><strong>tmpfs detail:</strong> When a Secret is mounted as a volume, kubelet stores it in memory (tmpfs). If the node is compromised, the attacker needs root access to read /proc or the tmpfs mount point. On node reboot, tmpfs data is gone.</p>
        </div>
      }
    />

    <FlowDiagram
      title="Secret Lifecycle — From Creation to Container"
      steps={[
        { label: "User creates Secret", description: "kubectl apply sends Secret to API server. stringData values are automatically base64-encoded to data field." },
        { label: "API server validates and stores", description: "RBAC check: does user have create permission? Admission controllers run. Stored in etcd (encrypted if EncryptionConfiguration is set)." },
        { label: "Pod references Secret", description: "Pod spec includes secretKeyRef (env var) or secret volume. kubelet resolves the Secret before starting the container." },
        { label: "kubelet fetches from API server", description: "kubelet calls API server to get the Secret. RBAC check: kubelet's node authorization allows it only for Secrets referenced by pods on its node." },
        { label: "Injected into container", description: "Env var: passed to container runtime at start. Volume: written to tmpfs on node, mounted read-only into container." },
      ]}
    />

    <ComparisonTable
      title="Secret Storage Security Levels"
      headers={["Level", "Protection", "Risk"]}
      rows={[
        { label: "Default (no encryption)", values: ["base64 in etcd, TLS in transit", "Anyone with etcd access reads all secrets"] },
        { label: "EncryptionConfiguration", values: ["AES-CBC/GCM encryption at rest", "Key management is your responsibility"] },
        { label: "KMS provider", values: ["Keys managed by external KMS (AWS, GCP, Azure)", "Most secure, adds latency for key operations"] },
        { label: "External secrets (Vault)", values: ["Secrets never stored in etcd", "Requires additional infrastructure"] },
      ]}
    />

    <CommonMistakes
      mistakes={[
        { mistake: "Thinking base64 = encrypted", correction: "base64 is encoding (anyone can decode). Enable etcd encryption at rest for actual protection: EncryptionConfiguration with aescbc or kms provider." },
        { mistake: "Using env vars for secrets in production", correction: "Env vars leak via /proc, logs, crash dumps, and child processes. Mount secrets as files with mode 0400 instead." },
        { mistake: "Granting 'get secrets' broadly", correction: "A user with 'get' on secrets can read ALL secrets in that namespace. Use specific resource names in RBAC rules when possible." },
        { mistake: "Not rotating secrets", correction: "Once a secret is exposed, it remains valid forever unless rotated. Implement secret rotation with projected service account tokens or external secret managers." },
      ]}
    />
  </div>
);

export default ConfigSecretsDeepDive;
