import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import ComparisonTable from "@/components/learning/ComparisonTable";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";

const OpenShift = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Intermediate</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">OpenShift Platform</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            What Red Hat OpenShift adds on top of Kubernetes — Routes, Projects, SCCs, ImageStreams, and enterprise platform differences.
          </p>
        </motion.div>

        <LayeredExplanation
          title="What Is OpenShift?"
          simple={<p>OpenShift is Kubernetes with extra tools and security built in. It's like buying a car that comes fully equipped — navigation, safety features, leather seats — rather than a base model you have to customize yourself.</p>}
          technical={
            <div className="space-y-3">
              <p>OpenShift Container Platform (OCP) is Red Hat's enterprise Kubernetes distribution. It adds:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Routes</strong> — Built-in ingress with TLS, blue-green, A/B testing</li>
                <li><strong>Projects</strong> — Enhanced namespaces with RBAC defaults</li>
                <li><strong>SCCs</strong> — Security Context Constraints for pod security</li>
                <li><strong>Web Console</strong> — Full-featured GUI for developers and admins</li>
                <li><strong>Builds & ImageStreams</strong> — Source-to-image (S2I) build system</li>
                <li><strong>OLM</strong> — Operator Lifecycle Manager for marketplace</li>
              </ul>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>OpenShift uses a fully operator-driven architecture. Every platform component (DNS, ingress, registry, monitoring) is managed by an operator and orchestrated by the Cluster Version Operator (CVO). This makes upgrades atomic and declarative.</p>
              <p>OpenShift runs on Red Hat CoreOS (RHCOS) for control plane nodes, providing immutable infrastructure with transactional OS updates via rpm-ostree.</p>
            </div>
          }
        />

        <ComparisonTable
          title="Kubernetes vs OpenShift"
          headers={["Feature", "Kubernetes", "OpenShift"]}
          rows={[
            { label: "External access", values: ["Ingress (needs controller)", "Routes (built-in, HAProxy)"] },
            { label: "Namespaces", values: ["Namespaces", "Projects (namespaces + defaults)"] },
            { label: "Pod security", values: ["PSA/PSS", "SCCs (more granular)"] },
            { label: "CLI", values: ["kubectl", "oc (superset of kubectl)"] },
            { label: "Web UI", values: ["Dashboard (basic)", "Console (full-featured)"] },
            { label: "Builds", values: ["External CI/CD", "Built-in S2I, Buildah"] },
            { label: "Registry", values: ["External", "Integrated registry"] },
            { label: "Default security", values: ["Permissive", "Restricted by default"] },
            { label: "Updates", values: ["Manual", "Operator-managed OTA"] },
          ]}
        />

        <AnalogyCallout
          analogy="Kubernetes is Android, OpenShift is a Samsung Galaxy"
          explanation="Android (Kubernetes) is the open-source core. Samsung Galaxy (OpenShift) takes that core and adds its own UI, security features, app store, and enterprise support. You can do everything Android does, plus more. The trade-off: it's more opinionated and sometimes you can't customize as freely."
        />

        <LayeredExplanation
          title="Security Context Constraints (SCCs)"
          simple={<p>SCCs are OpenShift's way of controlling what containers are allowed to do. By default, OpenShift is much stricter than vanilla Kubernetes — containers can't run as root, can't access the host network, and can't use privileged mode.</p>}
          technical={
            <div className="space-y-3">
              <p>Built-in SCCs from most to least restrictive:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li><strong>restricted</strong> — Default. No root, no host resources, limited capabilities</li>
                <li><strong>nonroot</strong> — Like restricted but allows some flexibility</li>
                <li><strong>anyuid</strong> — Allows running as any user ID</li>
                <li><strong>hostnetwork</strong> — Allows host networking</li>
                <li><strong>privileged</strong> — Full access (system pods only)</li>
              </ul>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>SCCs are evaluated during admission. The admission controller checks which SCCs the pod's ServiceAccount has access to (via RBAC), sorts them from most to least restrictive, and uses the first one that validates the pod's security requirements.</p>
              <p>SCCs control: runAsUser strategy, SELinux context, fsGroup, supplemental groups, volumes allowed, capabilities, host network/PID/IPC access, and read-only root filesystem.</p>
            </div>
          }
        />

        <CodeBlock
          title="OpenShift Route vs Kubernetes Ingress"
          language="yaml"
          code={`# OpenShift Route
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: web-route
spec:
  host: app.example.com
  to:
    kind: Service
    name: web-svc
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
---
# Equivalent Kubernetes Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts: ["app.example.com"]
      secretName: app-tls
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-svc
                port:
                  number: 80`}
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Assuming kubectl commands work the same in OpenShift", correction: "Most do, but use 'oc' for OpenShift-specific features like projects, routes, and builds." },
            { mistake: "Running containers as root on OpenShift", correction: "OpenShift uses the restricted SCC by default. Build images that run as non-root or request a specific SCC." },
            { mistake: "Using Ingress on OpenShift without understanding Routes", correction: "OpenShift supports both, but Routes are native and offer more features. Ingress works but may need extra configuration." },
            { mistake: "Creating namespaces with kubectl instead of oc new-project", correction: "Projects include default RBAC and annotations. Using raw namespaces misses these defaults." },
          ]}
        />

        <QuizCard
          title="OpenShift Quiz"
          questions={[
            {
              question: "What is the default SCC applied to pods in OpenShift?",
              options: ["privileged", "anyuid", "restricted", "nonroot"],
              correctIndex: 2,
              explanation: "The 'restricted' SCC is applied by default, preventing root containers, host access, and privileged operations."
            },
            {
              question: "What is the relationship between Projects and Namespaces in OpenShift?",
              options: ["They're unrelated", "A Project is a namespace with extra metadata and defaults", "A Namespace is a type of Project", "Projects replaced Namespaces"],
              correctIndex: 1,
              explanation: "Every Project is a Namespace under the hood, but with additional default RBAC, annotations, and self-service capabilities."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default OpenShift;
