import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";

const Operators = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-advanced mb-3 inline-block">Advanced</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">CRDs & Operators</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            How Kubernetes becomes extensible — Custom Resource Definitions, Custom Resources, and Operators that automate complex operations.
          </p>
        </motion.div>

        <LayeredExplanation
          title="What Are Custom Resources?"
          simple={<p>Kubernetes comes with built-in objects like Pods and Services. But you can also create your own custom object types — like a "Database" or "Certificate" resource. A CRD (Custom Resource Definition) tells Kubernetes about your new object type, and then you can create instances of it.</p>}
          technical={
            <div className="space-y-3">
              <p>A <strong>CRD</strong> extends the Kubernetes API by registering a new resource type. Once registered, you can use kubectl to create, read, update, and delete Custom Resources (CRs) just like built-in resources.</p>
              <p>CRDs define the schema (using OpenAPI v3), validation rules, and API versioning for the custom type.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>When a CRD is created, the API server dynamically registers a new REST endpoint. CRs are stored in etcd just like native resources. The API server handles CRUD, validation, and watch notifications — but nobody acts on CRs unless a controller/operator is watching them.</p>
              <p>CRDs can define multiple versions with conversion webhooks, subresources (status, scale), and printer columns for kubectl output.</p>
            </div>
          }
        />

        <LayeredExplanation
          title="What Is an Operator?"
          simple={<p>An Operator is like hiring a specialist to manage a specific application in your cluster. Instead of you manually running database backups, scaling, and failovers, the Operator does it automatically — it watches your custom resources and takes action.</p>}
          technical={
            <div className="space-y-3">
              <p>An Operator is a custom controller that watches Custom Resources and reconciles the actual state to match the desired state defined in the CR. It follows the same reconciliation pattern as built-in controllers.</p>
              <p>Operators encode operational knowledge (how to deploy, scale, backup, upgrade) into software, replacing manual runbooks.</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>Operators use the controller-runtime library (typically built with Kubebuilder or Operator SDK). The reconciliation loop:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                <li>Watch CR for changes via API server</li>
                <li>Read current state of managed resources</li>
                <li>Compare desired (CR spec) vs actual state</li>
                <li>Create/update/delete resources to reconcile</li>
                <li>Update CR status with current state</li>
                <li>Re-queue if needed with backoff</li>
              </ol>
            </div>
          }
        />

        <AnalogyCallout
          analogy="An Operator is like a specialized IT admin"
          explanation="Imagine hiring a database admin who lives inside your cluster. You hand them a spec ('I want a 3-node PostgreSQL cluster with daily backups') and they handle everything: provisioning, health checks, failover, backups, and upgrades. That's what a database operator does."
        />

        <FlowDiagram
          title="Operator Reconciliation Flow"
          steps={[
            { label: "User creates Custom Resource", description: "kubectl apply -f my-database.yaml — defines desired state for a PostgreSQL cluster." },
            { label: "API server stores CR in etcd", description: "The custom resource is persisted and watch notifications are sent." },
            { label: "Operator detects new CR", description: "The operator's controller receives the watch event and starts reconciliation." },
            { label: "Operator reads desired state", description: "Reads the CR spec: 3 replicas, 50Gi storage, version 15." },
            { label: "Operator creates resources", description: "Creates StatefulSets, Services, ConfigMaps, Secrets, PVCs as needed." },
            { label: "Operator monitors & heals", description: "Continuously watches managed resources. If a replica dies, it recreates it." },
            { label: "Operator updates CR status", description: "Updates the CR's status subresource: {ready: true, replicas: 3/3}." },
          ]}
        />

        <CodeBlock
          title="CRD Example"
          language="yaml"
          code={`apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: databases.example.com
spec:
  group: example.com
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                engine:
                  type: string
                  enum: ["postgres", "mysql"]
                replicas:
                  type: integer
                  minimum: 1
                storage:
                  type: string
  scope: Namespaced
  names:
    plural: databases
    singular: database
    kind: Database
    shortNames: ["db"]`}
        />

        <CodeBlock
          title="Custom Resource Instance"
          language="yaml"
          code={`apiVersion: example.com/v1
kind: Database
metadata:
  name: my-postgres
  namespace: production
spec:
  engine: postgres
  replicas: 3
  storage: 50Gi`}
        />

        <ComparisonTable
          title="CRD vs CR vs Operator"
          headers={["Concept", "What It Is", "Analogy"]}
          rows={[
            { label: "CRD", values: ["API type definition", "The blueprint class — defines what a Database object looks like"] },
            { label: "CR", values: ["Instance of a CRD", "An actual order — 'I want this specific database'"] },
            { label: "Operator", values: ["Controller that acts on CRs", "The specialist who fulfills the order"] },
          ]}
        />

        <CommonMistakes
          mistakes={[
            { mistake: "Creating CRDs without an operator", correction: "A CRD without an operator is just data storage. Nothing acts on it. You need a controller to make it useful." },
            { mistake: "Thinking operators replace Helm", correction: "Operators manage runtime lifecycle (scaling, backup, recovery). Helm manages initial deployment. They're complementary." },
            { mistake: "Building an operator for simple apps", correction: "Operators are for complex stateful apps. A simple web app doesn't need one — a Deployment is enough." },
          ]}
        />

        <QuizCard
          title="CRDs & Operators Quiz"
          questions={[
            {
              question: "What does a CRD do?",
              options: ["Creates containers", "Defines a new API resource type", "Replaces pods", "Manages networking"],
              correctIndex: 1,
              explanation: "A CRD extends the Kubernetes API by registering a new custom resource type that can be managed with kubectl."
            },
            {
              question: "What pattern does an Operator follow?",
              options: ["Request-response", "Pub-sub", "Reconciliation loop", "Batch processing"],
              correctIndex: 2,
              explanation: "Operators follow the same reconciliation loop as built-in controllers: watch → compare desired vs actual → act → update status."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Operators;
