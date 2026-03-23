import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Server, Box, Users, Shield, Network, HardDrive, Rocket, Lock,
  CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, Layers
} from "lucide-react";

interface Stage {
  id: string;
  title: string;
  icon: typeof Server;
  description: string;
  tasks: Task[];
  conceptExplanation: string;
}

interface Task {
  id: string;
  label: string;
  description: string;
  yamlExample: string;
  validationHint: string;
}

const stages: Stage[] = [
  {
    id: "cluster-init",
    title: "Cluster Initialization",
    icon: Server,
    description: "Configure the control plane components that form the foundation of your cluster.",
    conceptExplanation: "A Kubernetes cluster starts with the control plane: the API Server (gateway for all operations), etcd (persistent key-value store), the Scheduler (assigns pods to nodes), and the Controller Manager (maintains desired state). Worker nodes run the kubelet agent to register with the control plane.",
    tasks: [
      {
        id: "apiserver",
        label: "Start API Server",
        description: "The API Server is the front door to the cluster. All kubectl commands go through it.",
        yamlExample: `# API Server configuration (conceptual)
apiVersion: v1
kind: Pod
metadata:
  name: kube-apiserver
  namespace: kube-system
spec:
  containers:
  - name: kube-apiserver
    image: registry.k8s.io/kube-apiserver:v1.29.2
    command:
    - kube-apiserver
    - --etcd-servers=https://127.0.0.1:2379
    - --service-cluster-ip-range=10.96.0.0/12
    - --authorization-mode=Node,RBAC`,
        validationHint: "API Server serves as the central management entity",
      },
      {
        id: "etcd",
        label: "Initialize etcd",
        description: "etcd stores all cluster state. Without it, the cluster has no memory.",
        yamlExample: `# etcd configuration (conceptual)
apiVersion: v1
kind: Pod
metadata:
  name: etcd
  namespace: kube-system
spec:
  containers:
  - name: etcd
    image: registry.k8s.io/etcd:3.5.10
    command:
    - etcd
    - --data-dir=/var/lib/etcd
    - --listen-client-urls=https://127.0.0.1:2379`,
        validationHint: "etcd is the source of truth for cluster state",
      },
      {
        id: "scheduler",
        label: "Start Scheduler",
        description: "The Scheduler watches for unscheduled pods and assigns them to nodes.",
        yamlExample: `# Scheduler assigns pods to nodes based on:
# - Resource requests (CPU, memory)
# - Node affinity/anti-affinity
# - Taints and tolerations
# - Pod topology spread constraints`,
        validationHint: "Scheduler decides WHERE pods run",
      },
      {
        id: "nodes",
        label: "Register Worker Nodes",
        description: "Worker nodes run the kubelet and register with the API server to receive workloads.",
        yamlExample: `# On each worker node, kubelet starts and registers:
# kubelet --kubeconfig=/etc/kubernetes/kubelet.conf

# Verify nodes:
kubectl get nodes
# NAME            STATUS   ROLES           AGE   VERSION
# control-plane   Ready    control-plane   1m    v1.29.2
# worker-node-1   Ready    <none>          30s   v1.29.2
# worker-node-2   Ready    <none>          30s   v1.29.2`,
        validationHint: "Nodes must be Ready to receive workloads",
      },
    ],
  },
  {
    id: "namespaces",
    title: "Namespaces & Organization",
    icon: Layers,
    description: "Create namespaces to organize workloads and enforce boundaries.",
    conceptExplanation: "Namespaces provide logical isolation within a cluster. They allow teams to organize resources, apply resource quotas, and scope RBAC policies. Common patterns include per-environment (dev/staging/prod) or per-team namespaces.",
    tasks: [
      {
        id: "create-ns",
        label: "Create Namespaces",
        description: "Create dev, staging, and prod namespaces for workload isolation.",
        yamlExample: `apiVersion: v1
kind: Namespace
metadata:
  name: dev
  labels:
    environment: development
---
apiVersion: v1
kind: Namespace
metadata:
  name: staging
  labels:
    environment: staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: prod
  labels:
    environment: production`,
        validationHint: "Each environment gets its own namespace",
      },
      {
        id: "resource-quotas",
        label: "Apply Resource Quotas",
        description: "Limit resource consumption per namespace to prevent noisy neighbors.",
        yamlExample: `apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"`,
        validationHint: "Quotas prevent any single namespace from consuming all cluster resources",
      },
    ],
  },
  {
    id: "identities",
    title: "Users & Identities",
    icon: Users,
    description: "Configure users, groups, and service accounts for cluster access.",
    conceptExplanation: "Kubernetes has no built-in user database. Users are authenticated externally (certificates, OIDC, etc). ServiceAccounts are Kubernetes-native identities for pods. Groups organize users for RBAC policies.",
    tasks: [
      {
        id: "create-sa",
        label: "Create ServiceAccounts",
        description: "Create service accounts for applications that need API access.",
        yamlExample: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: dev
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ci-deploy-bot
  namespace: dev`,
        validationHint: "ServiceAccounts are the identity pods use to talk to the API",
      },
      {
        id: "user-cert",
        label: "Configure User Authentication",
        description: "Users authenticate via client certificates, tokens, or OIDC providers.",
        yamlExample: `# Generate a client certificate for a developer:
# 1. Generate key
openssl genrsa -out dev-user.key 2048

# 2. Create CSR
openssl req -new -key dev-user.key \\
  -out dev-user.csr -subj "/CN=dev-user/O=developers"

# 3. Sign with cluster CA
# The O= field becomes the group in Kubernetes
# CN= becomes the username`,
        validationHint: "The CN in the certificate becomes the Kubernetes username",
      },
    ],
  },
  {
    id: "rbac",
    title: "RBAC Configuration",
    icon: Shield,
    description: "Create Roles, ClusterRoles, and Bindings to control access.",
    conceptExplanation: "RBAC (Role-Based Access Control) connects identities to permissions. A Role defines WHAT actions are allowed on WHICH resources. A RoleBinding connects WHO to the Role. Roles are namespace-scoped; ClusterRoles are cluster-wide.",
    tasks: [
      {
        id: "create-role",
        label: "Create Roles",
        description: "Define what actions are allowed on which resources within a namespace.",
        yamlExample: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dev-deployer
  namespace: dev
rules:
- apiGroups: ["", "apps"]
  resources: ["pods", "deployments", "services"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list"]`,
        validationHint: "Roles define permissions within a namespace",
      },
      {
        id: "create-binding",
        label: "Create RoleBindings",
        description: "Bind roles to users, groups, or service accounts.",
        yamlExample: `apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-deployer-binding
  namespace: dev
subjects:
- kind: User
  name: dev-user
  apiGroup: rbac.authorization.k8s.io
- kind: Group
  name: developers
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: dev-deployer
  apiGroup: rbac.authorization.k8s.io`,
        validationHint: "RoleBindings connect identities to roles",
      },
      {
        id: "verify-rbac",
        label: "Verify Permissions",
        description: "Test that RBAC is correctly configured using auth can-i.",
        yamlExample: `# Test as the user:
kubectl auth can-i get pods --as=dev-user -n dev
# yes

kubectl auth can-i delete pods --as=dev-user -n dev
# no (not in the allowed verbs)

kubectl auth can-i get pods --as=dev-user -n prod
# no (Role is only in dev namespace)`,
        validationHint: "Always verify RBAC with 'kubectl auth can-i'",
      },
    ],
  },
  {
    id: "networking",
    title: "Networking Setup",
    icon: Network,
    description: "Configure pod networking with CNI and network policies.",
    conceptExplanation: "Kubernetes networking requires a CNI (Container Network Interface) plugin to enable pod-to-pod communication. By default, all pods can communicate with each other. NetworkPolicies act as firewalls to restrict traffic between pods.",
    tasks: [
      {
        id: "cni",
        label: "Install CNI Plugin",
        description: "Deploy a CNI plugin to enable pod networking across the cluster.",
        yamlExample: `# Install Calico CNI (example):
kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml

# Calico provides:
# - Pod-to-pod networking
# - NetworkPolicy enforcement
# - IP address management (IPAM)

# Verify:
kubectl get pods -n kube-system -l k8s-app=calico-node
# All calico-node pods should be Running`,
        validationHint: "CNI enables the flat pod network that Kubernetes requires",
      },
      {
        id: "netpol",
        label: "Apply Network Policies",
        description: "Create network policies to restrict traffic between namespaces.",
        yamlExample: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-from-other-namespaces
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector: {}  # Only allow from same namespace`,
        validationHint: "NetworkPolicies are like firewall rules for pods",
      },
    ],
  },
  {
    id: "storage",
    title: "Storage Setup",
    icon: HardDrive,
    description: "Configure StorageClasses, PersistentVolumes, and dynamic provisioning.",
    conceptExplanation: "Kubernetes storage uses a layered model: StorageClasses define types of storage, PersistentVolumes (PV) represent actual storage, and PersistentVolumeClaims (PVC) are requests for storage by pods. Dynamic provisioning automatically creates PVs from StorageClasses.",
    tasks: [
      {
        id: "storageclass",
        label: "Create StorageClass",
        description: "Define a StorageClass for dynamic volume provisioning.",
        yamlExample: `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iopsPerGB: "50"
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer`,
        validationHint: "StorageClasses define the 'type' of storage available",
      },
      {
        id: "pvc",
        label: "Create PersistentVolumeClaim",
        description: "Request storage for a workload using a PVC.",
        yamlExample: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
  namespace: dev
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 10Gi`,
        validationHint: "PVCs request storage; the StorageClass dynamically provisions it",
      },
    ],
  },
  {
    id: "deploy-app",
    title: "Deploy Application",
    icon: Rocket,
    description: "Deploy a workload, expose it via a Service, and configure Ingress.",
    conceptExplanation: "Deploying an application involves creating a Deployment (manages pods), a Service (provides stable networking), and optionally an Ingress (external access). The Deployment ensures the desired number of replicas are running.",
    tasks: [
      {
        id: "deployment",
        label: "Create Deployment",
        description: "Deploy the application with proper resource requests and the correct ServiceAccount.",
        yamlExample: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: dev
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      serviceAccountName: app-service-account
      containers:
      - name: web
        image: myregistry/web-app:v1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 256Mi`,
        validationHint: "Always specify serviceAccountName, resources, and labels",
      },
      {
        id: "service",
        label: "Expose with Service",
        description: "Create a Service to provide stable networking for the deployment.",
        yamlExample: `apiVersion: v1
kind: Service
metadata:
  name: web-app-svc
  namespace: dev
spec:
  selector:
    app: web-app    # Must match pod labels!
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP`,
        validationHint: "Service selector MUST match the pod labels exactly",
      },
      {
        id: "ingress",
        label: "Configure Ingress",
        description: "Set up external access to the application via Ingress.",
        yamlExample: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app-ingress
  namespace: dev
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app-svc
            port:
              number: 80`,
        validationHint: "Ingress routes external traffic to internal Services",
      },
    ],
  },
  {
    id: "secure-cluster",
    title: "Secure the Cluster",
    icon: Lock,
    description: "Apply security policies, restrict access, and harden the cluster.",
    conceptExplanation: "Cluster security is a multi-layered effort: RBAC controls who can do what, NetworkPolicies control network traffic, Pod Security Standards control what pods can do (privileged, host networking, etc), and auditing tracks all API calls.",
    tasks: [
      {
        id: "pod-security",
        label: "Apply Pod Security Standards",
        description: "Enforce security standards at the namespace level.",
        yamlExample: `# Label namespace to enforce Pod Security Standards:
apiVersion: v1
kind: Namespace
metadata:
  name: prod
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/audit: restricted

# 'restricted' prevents:
# - Privileged containers
# - Host networking/PID/IPC
# - Running as root
# - Privilege escalation`,
        validationHint: "Pod Security Standards prevent dangerous pod configurations",
      },
      {
        id: "audit-rbac",
        label: "Audit RBAC Configuration",
        description: "Review and validate all RBAC policies for least-privilege access.",
        yamlExample: `# Check who has cluster-admin:
kubectl get clusterrolebindings -o json | \\
  jq '.items[] | select(.roleRef.name=="cluster-admin") | .subjects'

# Verify no overly broad roles:
kubectl auth can-i --list --as=dev-user -n prod

# Check ServiceAccount permissions:
kubectl auth can-i --list \\
  --as=system:serviceaccount:dev:app-service-account -n dev`,
        validationHint: "Regularly audit who has access to what",
      },
    ],
  },
];

const ClusterBuilder = () => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [mode, setMode] = useState<"guided" | "semi-guided" | "free">("guided");

  const stage = stages[currentStageIdx];
  const stageProgress = stage.tasks.filter(t => completedTasks.has(t.id)).length / stage.tasks.length;
  const totalTasks = stages.reduce((sum, s) => sum + s.tasks.length, 0);
  const totalCompleted = stages.reduce((sum, s) => sum + s.tasks.filter(t => completedTasks.has(t.id)).length, 0);

  const toggleTask = useCallback((taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const activeTask = stage.tasks.find(t => t.id === selectedTask);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
            <Server className="h-3.5 w-3.5" /> Cluster Builder
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">
            🏗️ Kubernetes Cluster Builder Lab
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Build a Kubernetes environment from zero. Configure control plane, namespaces, RBAC,
            networking, and storage step-by-step — like a real platform engineer.
          </p>
        </motion.div>

        {/* Mode selector + progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1">
            {(["guided", "semi-guided", "free"] as const).map(m => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "default" : "ghost"}
                onClick={() => setMode(m)}
                className="text-xs capitalize h-7"
              >
                {m.replace("-", " ")}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{totalCompleted}/{totalTasks} tasks</span>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(totalCompleted / totalTasks) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stage navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {stages.map((s, i) => {
            const Icon = s.icon;
            const done = s.tasks.every(t => completedTasks.has(t.id));
            const active = i === currentStageIdx;
            return (
              <button
                key={s.id}
                onClick={() => { setCurrentStageIdx(i); setSelectedTask(null); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Stage {i + 1}:</span> {s.title}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Stage info + tasks */}
          <div className="flex-1 space-y-4">
            <Card className="p-5 border-border bg-card/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stage.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-foreground">
                    Stage {currentStageIdx + 1}: {stage.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${stageProgress * 100}%` }}
                />
              </div>

              {/* Concept explanation */}
              {mode === "guided" && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed mb-4">
                  💡 {stage.conceptExplanation}
                </div>
              )}

              {/* Task list */}
              <div className="space-y-2">
                {stage.tasks.map((task) => {
                  const done = completedTasks.has(task.id);
                  const isSelected = selectedTask === task.id;
                  return (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(isSelected ? null : task.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : done
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          done ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"
                        }`}>
                          {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`text-sm font-medium ${done ? "text-emerald-400" : "text-foreground"}`}>
                          {task.label}
                        </span>
                        <ArrowRight className={`h-3.5 w-3.5 ml-auto transition-transform ${isSelected ? "rotate-90" : ""} text-muted-foreground`} />
                      </div>
                      {mode !== "free" && (
                        <p className="text-xs text-muted-foreground mt-1 ml-7">{task.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentStageIdx === 0}
                onClick={() => { setCurrentStageIdx(i => i - 1); setSelectedTask(null); }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous Stage
              </Button>
              <Button
                size="sm"
                disabled={currentStageIdx === stages.length - 1}
                onClick={() => { setCurrentStageIdx(i => i + 1); setSelectedTask(null); }}
              >
                Next Stage <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Right: YAML / details panel */}
          <div className="w-full lg:w-[420px]">
            {activeTask ? (
              <motion.div
                key={activeTask.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Card className="p-5 border-border bg-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-foreground text-sm">{activeTask.label}</h3>
                    <Badge variant={completedTasks.has(activeTask.id) ? "default" : "outline"} className="text-[10px]">
                      {completedTasks.has(activeTask.id) ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{activeTask.description}</p>

                  {/* YAML example */}
                  {(mode === "guided" || mode === "semi-guided") && (
                    <div className="rounded-lg overflow-hidden border border-border">
                      <div className="px-3 py-1.5 bg-muted/50 text-[10px] text-muted-foreground uppercase tracking-wider">
                        YAML / Configuration
                      </div>
                      <pre className="p-3 bg-[hsl(220,25%,5%)] text-xs font-mono text-emerald-400/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {activeTask.yamlExample}
                      </pre>
                    </div>
                  )}

                  {mode === "guided" && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400">
                      💡 {activeTask.validationHint}
                    </div>
                  )}

                  <Button
                    className="w-full mt-4"
                    size="sm"
                    variant={completedTasks.has(activeTask.id) ? "outline" : "default"}
                    onClick={() => toggleTask(activeTask.id)}
                  >
                    {completedTasks.has(activeTask.id) ? "Mark Incomplete" : "Mark Complete"}
                  </Button>
                </Card>

                {/* Auth flow diagram for RBAC stage */}
                {stage.id === "rbac" && (
                  <Card className="p-4 border-border bg-card/50">
                    <h4 className="text-xs font-semibold text-foreground mb-3">🔐 RBAC Access Flow</h4>
                    <div className="space-y-2 text-xs font-mono">
                      {[
                        { label: "User / ServiceAccount", color: "text-blue-400" },
                        { label: "→ Authentication (who?)", color: "text-cyan-400" },
                        { label: "→ Authorization / RBAC", color: "text-amber-400" },
                        { label: "→ Role + RoleBinding", color: "text-purple-400" },
                        { label: "→ Resource Access", color: "text-emerald-400" },
                        { label: "→ ✅ Allowed or ❌ Forbidden", color: "text-foreground" },
                      ].map((step, i) => (
                        <div key={i} className={`${step.color} pl-${i * 2}`}>
                          {step.label}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            ) : (
              <Card className="p-8 border-border bg-card/50 text-center">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-sm text-muted-foreground">Select a task to see its configuration and YAML examples.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClusterBuilder;
