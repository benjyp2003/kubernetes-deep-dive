import LayeredExplanation from "@/components/learning/LayeredExplanation";
import CodeBlock from "@/components/learning/CodeBlock";
import ComparisonTable from "@/components/learning/ComparisonTable";

const SecurityPodSecurity = () => (
  <div className="space-y-8">
    <LayeredExplanation
      title="SecurityContext & Pod Security — OS-Level Controls"
      simple={
        <p>A SecurityContext controls what a container can do at the operating system level — whether it can run as root, access the host network, or write to the filesystem. These are your last line of defense inside the container.</p>
      }
      technical={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Key SecurityContext Fields</h4>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><strong>runAsNonRoot: true</strong> — Container runtime rejects if image runs as UID 0</li>
            <li><strong>runAsUser: 1000</strong> — Force specific UID regardless of Dockerfile USER</li>
            <li><strong>readOnlyRootFilesystem: true</strong> — Container filesystem is read-only (use emptyDir for writable paths)</li>
            <li><strong>allowPrivilegeEscalation: false</strong> — Blocks setuid/setgid binaries and ptrace</li>
            <li><strong>capabilities.drop: ["ALL"]</strong> — Removes all Linux capabilities (bind low ports, change ownership, etc.)</li>
            <li><strong>seccompProfile.type: RuntimeDefault</strong> — Restricts syscalls the container can make</li>
          </ul>
          <p className="mt-2 text-sm"><strong>Pod-level vs container-level:</strong> Pod securityContext sets defaults for all containers. Container securityContext overrides pod-level settings.</p>
        </div>
      }
      deep={
        <div className="space-y-3">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Pod Security Standards (PSS) — Namespace Enforcement</h4>
          <p className="text-sm">Three profiles, enforced at namespace level via labels:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><strong>Privileged</strong> — No restrictions. For system-level pods (CNI, storage drivers).</li>
            <li><strong>Baseline</strong> — Prevents known privilege escalations. Blocks: hostNetwork, hostPID, privileged containers, most capabilities.</li>
            <li><strong>Restricted</strong> — Hardened. Requires: runAsNonRoot, drop ALL capabilities, readOnlyRootFilesystem, seccomp profile.</li>
          </ul>
          <p className="text-sm mt-2"><strong>Three enforcement modes per namespace:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
            <li><code className="font-mono text-xs">enforce</code> — Reject pods that violate the policy</li>
            <li><code className="font-mono text-xs">audit</code> — Log violations but allow the pod</li>
            <li><code className="font-mono text-xs">warn</code> — Show warning to user but allow the pod</li>
          </ul>
        </div>
      }
    />

    <CodeBlock
      title="Production-Ready Secure Pod"
      language="yaml"
      code={`# Namespace with Pod Security enforcement
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
---
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
  namespace: production
spec:
  serviceAccountName: app-sa
  automountServiceAccountToken: false  # disable if not needed
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: myapp:1.0
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 500m
          memory: 256Mi
      volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /var/cache
  volumes:
    - name: tmp          # writable temp space
      emptyDir: {}
    - name: cache
      emptyDir: {}       # since root filesystem is read-only`}
    />

    <ComparisonTable
      title="Pod Security Standards Comparison"
      headers={["Control", "Privileged", "Baseline", "Restricted"]}
      rows={[
        { label: "hostNetwork", values: ["✅ Allowed", "❌ Blocked", "❌ Blocked"] },
        { label: "Privileged containers", values: ["✅ Allowed", "❌ Blocked", "❌ Blocked"] },
        { label: "Host ports", values: ["✅ Allowed", "❌ Blocked", "❌ Blocked"] },
        { label: "runAsNonRoot", values: ["Not required", "Not required", "✅ Required"] },
        { label: "Capabilities", values: ["Any", "Limited set", "Drop ALL, add only NET_BIND_SERVICE"] },
        { label: "Seccomp", values: ["Any", "Any", "RuntimeDefault or Localhost"] },
      ]}
    />
  </div>
);

export default SecurityPodSecurity;
