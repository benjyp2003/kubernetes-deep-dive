import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import OpenShiftComparison from "@/components/learning/OpenShiftComparison";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";
import FlowDiagram from "@/components/learning/FlowDiagram";
import ConfigInternalFlows from "@/components/learning/config/ConfigInternalFlows";
import ConfigSecretsDeepDive from "@/components/learning/config/ConfigSecretsDeepDive";
import ConfigNamespaces from "@/components/learning/config/ConfigNamespaces";
import ConfigDebugging from "@/components/learning/config/ConfigDebugging";

const Config = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Intermediate → Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Configuration & Namespaces</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Deep dive into ConfigMaps, Secrets, environment variables, volume mounts — how configuration flows from etcd to your container, and how Kubernetes enforces it at every layer.
          </p>
        </motion.div>

        {/* Layer 1: What & Why */}
        <LayeredExplanation
          title="ConfigMaps vs Secrets — Purpose & Differences"
          simple={<p>ConfigMaps store non-sensitive settings (database URLs, feature flags). Secrets store sensitive data (passwords, API keys, TLS certificates). Both separate configuration from application code so you can change settings without rebuilding images.</p>}
          technical={
            <div className="space-y-3">
              <p>Both are Kubernetes API objects stored in etcd. Key differences:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>ConfigMap</strong> — stored as plain text in etcd. No special handling.</li>
                <li><strong>Secret</strong> — stored as base64-encoded data. Subject to RBAC restrictions, optional encryption at rest, and size limit of 1MB.</li>
                <li><strong>base64 ≠ encryption</strong> — base64 is encoding (reversible by anyone). It exists so binary data (TLS certs, keys) can be stored in JSON/YAML.</li>
              </ul>
              <p>Both can be consumed as environment variables, volume mounts, or command arguments.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p><strong>Why base64 and not encryption?</strong> Kubernetes stores all objects in etcd as JSON. Binary data (like TLS certificates) can't be embedded in JSON directly — base64 encodes binary to text. Encryption is a separate concern handled by etcd encryption at rest (EncryptionConfiguration).</p>
              <p><strong>Secret types</strong> control validation: <code className="font-mono text-xs">Opaque</code> (generic), <code className="font-mono text-xs">kubernetes.io/tls</code> (requires tls.crt + tls.key), <code className="font-mono text-xs">kubernetes.io/dockerconfigjson</code> (image pull), <code className="font-mono text-xs">kubernetes.io/service-account-token</code> (auto-generated SA tokens).</p>
              <p><strong>Immutable ConfigMaps/Secrets</strong> (field: <code className="font-mono text-xs">immutable: true</code>) prevent modifications and reduce API server load since kubelet stops watching them.</p>
            </div>
          }
        />

        <AnalogyCallout
          analogy="ConfigMap = public bulletin board, Secret = locked filing cabinet"
          explanation="Both store information for your apps. ConfigMaps are like a bulletin board anyone can read — settings, URLs, feature flags. Secrets are like a locked cabinet — only authorized people (RBAC) can open it, and the contents are encoded (base64) to handle binary data. But the lock (RBAC) is what provides security, not the encoding."
        />

        {/* Internal Flows — the deep system-level section */}
        <ConfigInternalFlows />

        <ComparisonTable
          title="Environment Variables vs Volume Mounts — Deep Comparison"
          headers={["Aspect", "Env Variables", "Volume Mount"]}
          rows={[
            { label: "Injection time", values: ["Container start only", "Continuous (kubelet syncs)"] },
            { label: "Auto-update", values: ["❌ Never — requires pod restart", "✅ Yes — kubelet syncs (~60-120s delay)"] },
            { label: "Mechanism", values: ["Passed to container runtime via OCI spec", "kubelet writes files to node, mounts into container"] },
            { label: "Best for", values: ["Simple values (DB_HOST, PORT)", "Config files (nginx.conf, app.yaml)"] },
            { label: "Security", values: ["Visible in /proc/1/environ, may leak in logs", "File permissions can be set, less exposure"] },
            { label: "Subpath mount", values: ["N/A", "Single file mount possible, but breaks auto-update"] },
          ]}
        />

        <CodeBlock
          title="ConfigMap + Secret — Complete Usage Pattern"
          language="yaml"
          code={`# ConfigMap with both key-value and file data
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  DATABASE_HOST: "postgres.default.svc.cluster.local"
  LOG_LEVEL: "info"
  app.properties: |
    feature.x.enabled=true
    cache.ttl=300
    max.connections=50
---
# Secret with stringData (auto-encoded to base64)
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
stringData:          # <-- stringData accepts plain text
  DATABASE_PASSWORD: "s3cret!"
  API_KEY: "abc123xyz"
# After creation, 'data' field shows base64:
# data:
#   DATABASE_PASSWORD: czNjcmV0IQ==
---
# Pod consuming both via env vars AND volume mounts
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    - name: app
      image: myapp:1.0
      env:
        # Single key from ConfigMap
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_HOST
        # Single key from Secret
        - name: DB_PASS
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_PASSWORD
        # ALL keys from ConfigMap as env vars
      envFrom:
        - configMapRef:
            name: app-config
      volumeMounts:
        # Mount ConfigMap as files
        - name: config-volume
          mountPath: /etc/config
          readOnly: true
        # Mount Secret as files
        - name: secret-volume
          mountPath: /etc/secrets
          readOnly: true
  volumes:
    - name: config-volume
      configMap:
        name: app-config
        # Optional: specific keys + file permissions
        items:
          - key: app.properties
            path: app.properties
            mode: 0644
    - name: secret-volume
      secret:
        secretName: app-secrets
        defaultMode: 0400  # Restrictive permissions`}
        />

        {/* Secrets Deep Dive */}
        <ConfigSecretsDeepDive />

        {/* Namespaces */}
        <ConfigNamespaces />

        <OpenShiftComparison
          k8sFeature="Namespaces + ConfigMaps/Secrets"
          openshiftFeature="Projects + DeploymentConfig env injection"
          description="OpenShift Projects wrap namespaces with default RBAC and network isolation. OpenShift also supports 'oc set env' for quick ConfigMap/Secret injection into DeploymentConfigs. OpenShift's integrated image registry uses Secrets for pull credentials automatically."
        />

        {/* Debugging */}
        <ConfigDebugging />

        <QuizCard
          title="Configuration Deep Dive Quiz"
          questions={[
            {
              question: "A ConfigMap mounted as a volume is updated. What happens?",
              options: [
                "Nothing — requires pod restart",
                "kubelet eventually syncs the new data (60-120s delay)",
                "The pod crashes and restarts automatically",
                "The container runtime hot-reloads the config",
              ],
              correctIndex: 1,
              explanation: "kubelet periodically checks for ConfigMap changes and updates mounted volumes. The delay is configurable (--sync-frequency). Note: subPath mounts do NOT receive updates."
            },
            {
              question: "Why are Secrets base64-encoded instead of encrypted?",
              options: [
                "base64 is a form of encryption",
                "To save storage space in etcd",
                "To allow binary data (certs, keys) to be stored in JSON/YAML",
                "For backward compatibility with Docker",
              ],
              correctIndex: 2,
              explanation: "base64 is encoding, not encryption. It converts binary data to text so it can be stored in JSON/YAML (which are text formats). Encryption is handled separately via etcd encryption at rest."
            },
            {
              question: "Why is mounting Secrets as files safer than env vars?",
              options: [
                "Files are encrypted, env vars are not",
                "Env vars appear in /proc/1/environ and may leak in logs, crash dumps, or child processes",
                "Volume mounts are faster",
                "Files are only readable by root",
              ],
              correctIndex: 1,
              explanation: "Environment variables are visible in /proc/1/environ (readable by anyone with access to the container), can leak in logs (env dump), crash reports, and are inherited by child processes. Files can have restrictive permissions (0400) and don't leak through these channels."
            },
            {
              question: "Which resources are NOT namespace-scoped?",
              options: ["Pods and Services", "Nodes and PersistentVolumes", "ConfigMaps and Secrets", "Deployments and ReplicaSets"],
              correctIndex: 1,
              explanation: "Nodes and PersistentVolumes are cluster-scoped — they exist outside any namespace. Use 'kubectl api-resources --namespaced=false' to see all cluster-scoped resources."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Config;
