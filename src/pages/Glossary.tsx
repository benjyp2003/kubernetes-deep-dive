import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search } from "lucide-react";

interface GlossaryEntry {
  term: string;
  short: string;
  detailed: string;
  category: string;
}

const glossary: GlossaryEntry[] = [
  { term: "Pod", short: "Smallest deployable unit in Kubernetes, wrapping one or more containers.", detailed: "A Pod is a group of one or more containers with shared storage and network. Containers in a pod share an IP address and can communicate via localhost. Pods are ephemeral — they can be killed and recreated at any time.", category: "Core" },
  { term: "Node", short: "A machine (physical or virtual) that runs pods.", detailed: "Nodes are the worker machines in Kubernetes. Each node runs a kubelet agent, a container runtime, and kube-proxy. The control plane manages which pods run on which nodes.", category: "Core" },
  { term: "Cluster", short: "A set of nodes managed by a Kubernetes control plane.", detailed: "A cluster consists of at least one control plane and one or more worker nodes. The control plane makes scheduling decisions and runs controllers that manage the desired state.", category: "Core" },
  { term: "Control Plane", short: "The brain of the cluster — API server, scheduler, controller manager, etcd.", detailed: "The control plane components make global decisions about the cluster. The API server handles all API requests, etcd stores state, the scheduler places pods, and the controller manager runs reconciliation loops.", category: "Architecture" },
  { term: "API Server", short: "The front-end REST API for all Kubernetes operations.", detailed: "kube-apiserver validates and processes all CRUD operations on resources. It handles authentication, authorization, admission control, and stores objects in etcd. All other components communicate through it.", category: "Architecture" },
  { term: "etcd", short: "Distributed key-value store that holds all cluster state.", detailed: "etcd is the single source of truth for Kubernetes. It stores all resource objects and their state. Only the API server communicates directly with etcd. etcd uses the Raft consensus algorithm for distributed consistency.", category: "Architecture" },
  { term: "Scheduler", short: "Assigns unscheduled pods to suitable nodes.", detailed: "The scheduler watches for pods with no nodeName, then runs filtering (eliminate unfit nodes) and scoring (rank remaining) to pick the best node. It considers resources, affinity, taints, and topology.", category: "Architecture" },
  { term: "kubelet", short: "Node agent that ensures containers are running in pods.", detailed: "The kubelet runs on every node. It watches the API server for pods assigned to its node, then instructs the container runtime (via CRI) to start containers. It also reports pod and node status back.", category: "Architecture" },
  { term: "kube-proxy", short: "Network proxy that implements Service routing on each node.", detailed: "kube-proxy watches Services and Endpoints, then programs iptables or IPVS rules to route traffic from Service VIPs to backend pod IPs. It enables the Service abstraction.", category: "Networking" },
  { term: "Service", short: "Stable network endpoint that load-balances traffic to pods.", detailed: "A Service provides a stable ClusterIP and DNS name for a set of pods selected by labels. Traffic is distributed across healthy backend pods. Types: ClusterIP, NodePort, LoadBalancer, ExternalName.", category: "Networking" },
  { term: "Ingress", short: "HTTP/HTTPS routing rules for external traffic entering the cluster.", detailed: "Ingress resources define rules for routing external HTTP(S) traffic to internal Services based on hostname and path. An Ingress Controller (nginx, traefik, etc.) implements these rules.", category: "Networking" },
  { term: "Route", short: "(OpenShift) Similar to Ingress but with additional features like TLS termination modes.", detailed: "OpenShift Routes predate Ingress and support edge, reencrypt, and passthrough TLS termination. They use HAProxy by default and offer features like sticky sessions and weighted backends.", category: "OpenShift" },
  { term: "CNI", short: "Container Network Interface — plugin standard for pod networking.", detailed: "CNI plugins (Calico, Flannel, Cilium, etc.) implement the flat pod network. They assign IPs to pods and set up routing between nodes. The plugin choice affects features like NetworkPolicy support.", category: "Networking" },
  { term: "CRI", short: "Container Runtime Interface — standard for container runtimes.", detailed: "CRI defines the interface between kubelet and container runtimes. Implementations include containerd and CRI-O. Docker support was removed in K8s 1.24 (but containerd still runs Docker images).", category: "Architecture" },
  { term: "CSI", short: "Container Storage Interface — standard for storage plugins.", detailed: "CSI allows storage vendors to write plugins that work with Kubernetes without modifying core code. It enables dynamic provisioning, snapshots, and resize of persistent volumes.", category: "Storage" },
  { term: "Deployment", short: "Manages ReplicaSets for declarative pod updates and rollbacks.", detailed: "Deployments create ReplicaSets which create Pods. On update, a new ReplicaSet is created and pods are gradually shifted (rolling update). Old ReplicaSets are kept for rollback.", category: "Workloads" },
  { term: "StatefulSet", short: "Manages stateful applications with stable identity and persistent storage.", detailed: "StatefulSets provide ordered pod creation/deletion, stable DNS names (pod-0, pod-1), and per-pod PVCs that persist across restarts. Used for databases, message queues, etc.", category: "Workloads" },
  { term: "DaemonSet", short: "Ensures a pod runs on every (or selected) node.", detailed: "DaemonSets automatically add a pod to new nodes and remove from deleted nodes. Common uses: logging agents (fluentd), monitoring (node-exporter), network plugins (calico-node).", category: "Workloads" },
  { term: "ConfigMap", short: "Stores non-sensitive configuration data as key-value pairs.", detailed: "ConfigMaps decouple configuration from container images. Data can be consumed as environment variables or mounted as files. Changes to mounted ConfigMaps are eventually reflected in pods.", category: "Configuration" },
  { term: "Secret", short: "Stores sensitive data like passwords and tokens (base64 encoded).", detailed: "Secrets are similar to ConfigMaps but for sensitive data. By default, Secrets are only base64-encoded, NOT encrypted. Enable encryption at rest for production security. Can be mounted as files or env vars.", category: "Security" },
  { term: "PersistentVolume (PV)", short: "A piece of storage provisioned in the cluster.", detailed: "PVs are cluster-level resources representing physical storage. They can be provisioned statically (admin creates) or dynamically (via StorageClass). PVs have a lifecycle independent of pods.", category: "Storage" },
  { term: "PersistentVolumeClaim (PVC)", short: "A request for storage by a user/pod.", detailed: "PVCs are namespace-scoped requests for storage. They specify size and access mode. Kubernetes binds a PVC to a matching PV. Pods reference PVCs in their volume mounts.", category: "Storage" },
  { term: "Namespace", short: "Virtual cluster partition for resource isolation and organization.", detailed: "Namespaces divide a cluster into virtual sub-clusters. They provide scope for names (same name can exist in different namespaces) and are the boundary for RBAC, ResourceQuota, and NetworkPolicy.", category: "Core" },
  { term: "RBAC", short: "Role-Based Access Control — who can do what in the cluster.", detailed: "RBAC uses Roles (namespace) and ClusterRoles (cluster-wide) to define permissions, and RoleBindings/ClusterRoleBindings to grant them to users, groups, or ServiceAccounts.", category: "Security" },
  { term: "SCC", short: "(OpenShift) Security Context Constraints — controls what pods can do.", detailed: "SCCs are OpenShift's mechanism for controlling pod security privileges. They define which Linux capabilities, user IDs, SELinux contexts, and volume types a pod can use. More granular than standard Pod Security Standards.", category: "OpenShift" },
  { term: "Taint", short: "A property on a node that repels pods unless they tolerate it.", detailed: "Taints prevent pods from being scheduled on a node unless the pod has a matching toleration. Format: key=value:effect. Effects: NoSchedule, PreferNoSchedule, NoExecute.", category: "Scheduling" },
  { term: "Toleration", short: "Allows a pod to be scheduled on a tainted node.", detailed: "Tolerations are set on pods to match node taints. A pod with a toleration for a taint can (but isn't required to) schedule on that node. Tolerations don't guarantee scheduling — they just remove the restriction.", category: "Scheduling" },
  { term: "Label", short: "Key-value pair attached to objects for identification and selection.", detailed: "Labels are the primary grouping mechanism in Kubernetes. Services use label selectors to find pods. Deployments use selectors to manage ReplicaSets. Labels are used for filtering in kubectl queries.", category: "Core" },
  { term: "Selector", short: "A query that finds objects by their labels.", detailed: "Selectors come in two forms: equality-based (app=web) and set-based (tier in (frontend, backend)). They're used by Services, Deployments, ReplicaSets, and other controllers to identify managed resources.", category: "Core" },
  { term: "Annotation", short: "Key-value pair for non-identifying metadata.", detailed: "Annotations store arbitrary metadata not used for selection. Common uses: build info, git commit SHA, monitoring config, ingress controller settings. Unlike labels, annotations can contain large values.", category: "Core" },
  { term: "CRD", short: "Custom Resource Definition — extends the Kubernetes API with new resource types.", detailed: "CRDs allow you to define new object types in Kubernetes. Once created, users can create instances (Custom Resources) just like built-in resources. CRDs + controllers = the Operator pattern.", category: "Extensibility" },
  { term: "Operator", short: "A controller that manages a custom resource, encoding operational knowledge.", detailed: "Operators automate the management of complex applications by watching Custom Resources and reconciling state. They encode human operational knowledge — backup procedures, scaling logic, failure recovery — as code.", category: "Extensibility" },
];

const categories = [...new Set(glossary.map((e) => e.category))];

const Glossary = () => {
  const [search, setSearch] = useState("");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = glossary.filter((entry) => {
    const matchesSearch = entry.term.toLowerCase().includes(search.toLowerCase()) ||
      entry.short.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || entry.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Glossary</h1>
          <p className="mt-3 text-sidebar-foreground/70">
            Quick reference for every Kubernetes and OpenShift term. Click any term to expand its detailed explanation.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                !selectedCategory ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms list */}
        <div className="space-y-2">
          {filtered.map((entry) => (
            <motion.div
              key={entry.term}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="k8s-card py-3 px-5 cursor-pointer"
              onClick={() => setExpandedTerm(expandedTerm === entry.term ? null : entry.term)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-sm text-foreground">{entry.term}</h3>
                    <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{entry.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{entry.short}</p>
                </div>
                <span className="text-muted-foreground text-xs mt-1">{expandedTerm === entry.term ? "▲" : "▼"}</span>
              </div>
              {expandedTerm === entry.term && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-border"
                >
                  <p className="text-sm text-foreground/80 leading-relaxed">{entry.detailed}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No terms found matching "{search}"</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Glossary;
