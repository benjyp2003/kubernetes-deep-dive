import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import OpenShiftComparison from "@/components/learning/OpenShiftComparison";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";

const Config = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Intermediate</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Configuration & Namespaces</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            ConfigMaps, Secrets, environment variables, resource quotas, LimitRanges, and namespace organization strategies.
          </p>
        </motion.div>

        <LayeredExplanation
          title="ConfigMaps and Secrets"
          simple={<p>ConfigMaps store non-sensitive settings (like database URLs or feature flags). Secrets store sensitive data (like passwords or API keys). Both let you separate configuration from your application code.</p>}
          technical={
            <div className="space-y-3">
              <p>ConfigMaps and Secrets are Kubernetes objects that store key-value pairs. They can be consumed by pods as:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Environment variables</strong> — injected into the container's env</li>
                <li><strong>Volume mounts</strong> — mounted as files in the container</li>
                <li><strong>Command arguments</strong> — used in container command/args</li>
              </ul>
              <p>Secrets are base64-encoded (not encrypted!) and have restricted access via RBAC.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Secrets are stored in etcd. In production, enable etcd encryption at rest. Secrets can be of different types: Opaque (generic), kubernetes.io/tls (TLS certs), kubernetes.io/dockerconfigjson (image pull secrets).</p>
              <p>Volume-mounted ConfigMaps/Secrets are updated automatically by kubelet when the source changes (with a delay). Environment variables are NOT updated — the pod must be restarted.</p>
            </div>
          }
        />

        <ComparisonTable
          title="Environment Variables vs Volume Mounts"
          headers={["Aspect", "Env Variables", "Volume Mount"]}
          rows={[
            { label: "Format", values: ["Key-value pairs", "Files in a directory"] },
            { label: "Auto-update", values: ["No — requires pod restart", "Yes — kubelet syncs (with delay)"] },
            { label: "Best for", values: ["Simple values (DB_HOST, PORT)", "Config files (nginx.conf, app.yaml)"] },
            { label: "Visibility", values: ["Visible in process env", "Visible as files in the container"] },
          ]}
        />

        <CodeBlock
          title="ConfigMap + Secret Usage"
          language="yaml"
          code={`# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "postgres.default.svc"
  LOG_LEVEL: "info"
  app.properties: |
    feature.x.enabled=true
    cache.ttl=300
---
# Secret
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  DATABASE_PASSWORD: "s3cret!"
  API_KEY: "abc123xyz"
---
# Pod using both
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    - name: app
      image: myapp:1.0
      env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_HOST
        - name: DB_PASS
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_PASSWORD
      volumeMounts:
        - name: config-files
          mountPath: /etc/config
  volumes:
    - name: config-files
      configMap:
        name: app-config`}
        />

        <LayeredExplanation
          title="Namespaces"
          simple={<p>Namespaces are like folders for your Kubernetes objects. They let you organize resources and control who can access what. Different teams or environments can use different namespaces.</p>}
          technical={
            <div className="space-y-3">
              <p>Namespaces provide a scope for resource names and a boundary for RBAC policies, ResourceQuotas, and LimitRanges. Default namespaces: <code className="font-mono text-xs">default</code>, <code className="font-mono text-xs">kube-system</code>, <code className="font-mono text-xs">kube-public</code>, <code className="font-mono text-xs">kube-node-lease</code>.</p>
              <p>Some resources are cluster-scoped (Nodes, PVs, ClusterRoles) and don't belong to any namespace.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Namespaces enable multitenancy patterns. Combined with RBAC, NetworkPolicies, and ResourceQuotas, they provide isolation between teams. However, namespaces alone don't provide security — you must add RBAC and network policies for true isolation.</p>
            </div>
          }
        />

        <CodeBlock
          title="ResourceQuota and LimitRange"
          language="yaml"
          code={`# ResourceQuota — limits total namespace usage
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: team-a
spec:
  hard:
    pods: "20"
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
---
# LimitRange — sets defaults per pod/container
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: team-a
spec:
  limits:
    - default:
        cpu: 500m
        memory: 256Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
      type: Container`}
        />

        <AnalogyCallout
          analogy="Namespaces are like apartments in a building"
          explanation="Each apartment (namespace) has its own space, keys (RBAC), and utility budget (ResourceQuota). Tenants can't access each other's apartments without permission. The building manager (cluster admin) oversees everything."
        />

        <OpenShiftComparison
          k8sFeature="Namespaces"
          openshiftFeature="Projects"
          description="OpenShift Projects are namespaces with extra features: default RBAC, default node selectors, network isolation, and self-service project creation/deletion via 'oc new-project'. Every Project is a namespace, but with additional metadata and defaults."
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Putting everything in the default namespace", correction: "Organize by team, environment, or application. It's hard to manage RBAC and quotas in a single namespace." },
            { mistake: "Expecting Secrets to be encrypted", correction: "Secrets are only base64-encoded. Enable etcd encryption at rest and use external secret managers for production." },
            { mistake: "Not setting resource requests/limits", correction: "Without limits, one pod can consume all node resources. Without requests, the scheduler can't make good decisions." },
          ]}
        />

        <QuizCard
          title="Config & Namespaces Quiz"
          questions={[
            {
              question: "What happens to a ConfigMap mounted as a volume when the ConfigMap is updated?",
              options: ["Nothing — requires pod restart", "The mounted files are eventually updated", "The pod crashes", "The volume is unmounted"],
              correctIndex: 1,
              explanation: "Volume-mounted ConfigMaps are synced by kubelet with a delay (default ~1 minute). Environment variables from ConfigMaps are NOT updated without a restart."
            },
            {
              question: "Which resources are NOT namespace-scoped?",
              options: ["Pods and Services", "Nodes and PersistentVolumes", "ConfigMaps and Secrets", "Deployments and ReplicaSets"],
              correctIndex: 1,
              explanation: "Nodes and PersistentVolumes are cluster-scoped resources — they exist outside of any namespace."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Config;
