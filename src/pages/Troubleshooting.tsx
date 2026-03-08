import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { AlertTriangle, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

interface TroubleshootEntry {
  symptom: string;
  meaning: string;
  causes: string[];
  inspect: string[];
  reasoning: string;
}

const issues: TroubleshootEntry[] = [
  {
    symptom: "Pod stuck in Pending",
    meaning: "The pod has been accepted by the cluster but hasn't been scheduled to a node yet.",
    causes: [
      "Insufficient CPU or memory on any node",
      "Taints on nodes with no matching toleration",
      "Node affinity/selector matches no nodes",
      "PVC cannot bind (no matching PV or StorageClass)",
      "ResourceQuota exceeded in namespace",
    ],
    inspect: [
      "Check pod events: kubectl describe pod <name>",
      "Check node resources: kubectl describe nodes",
      "Check PVC status if using persistent storage",
      "Check ResourceQuota: kubectl get resourcequota -n <ns>",
    ],
    reasoning: "Start with describe pod — the Events section usually tells you exactly why. If it says 'insufficient cpu', check node capacity. If it says 'no nodes match', check your affinity rules or taints.",
  },
  {
    symptom: "CrashLoopBackOff",
    meaning: "The container starts, crashes, and Kubernetes keeps restarting it with increasing backoff delays.",
    causes: [
      "Application error / exception on startup",
      "Missing environment variable or config",
      "Wrong command or entrypoint",
      "File or dependency not found in the image",
      "Liveness probe failing immediately",
      "OOMKilled — container exceeding memory limits",
    ],
    inspect: [
      "Check container logs: kubectl logs <pod> --previous",
      "Check pod events: kubectl describe pod <name>",
      "Look for OOMKilled in pod status",
      "Verify environment variables and ConfigMap/Secret mounts",
    ],
    reasoning: "CrashLoopBackOff means the container starts and then dies. Always check logs first. If logs are empty, the crash happens before the app writes anything — check the command/entrypoint. If you see OOMKilled, increase memory limits.",
  },
  {
    symptom: "ImagePullBackOff / ErrImagePull",
    meaning: "Kubernetes cannot pull the container image from the registry.",
    causes: [
      "Image name or tag is wrong",
      "Image doesn't exist in the registry",
      "Private registry requires authentication (missing imagePullSecret)",
      "Network issues between node and registry",
      "Registry rate limiting (Docker Hub free tier)",
    ],
    inspect: [
      "Check the exact image name and tag in the pod spec",
      "Verify the image exists: docker pull <image> locally",
      "Check imagePullSecrets in the pod or ServiceAccount",
      "Check pod events for specific error messages",
    ],
    reasoning: "This is almost always a typo in the image name, a missing tag, or missing registry credentials. Start by verifying the image exists and is accessible.",
  },
  {
    symptom: "Service not routing traffic",
    meaning: "Requests to the Service IP or name get no response or connection refused.",
    causes: [
      "Selector labels don't match pod labels",
      "Pods are not Ready (failing readiness probe)",
      "Wrong port or targetPort configuration",
      "No endpoints behind the Service",
      "NetworkPolicy blocking traffic",
    ],
    inspect: [
      "Check endpoints: kubectl get endpoints <service>",
      "Compare service selector with pod labels",
      "Check pod readiness: kubectl get pods",
      "Check service ports vs container ports",
      "Check NetworkPolicies in the namespace",
    ],
    reasoning: "The #1 cause is selector mismatch. If 'kubectl get endpoints <svc>' shows no IPs, the selector isn't matching any pods. Compare the selector with actual pod labels character by character.",
  },
  {
    symptom: "DNS resolution failing",
    meaning: "Pods cannot resolve service names or external domains.",
    causes: [
      "CoreDNS pods not running or unhealthy",
      "CoreDNS Service IP not matching /etc/resolv.conf",
      "Network policy blocking DNS traffic (port 53)",
      "Pod's dnsPolicy set incorrectly",
    ],
    inspect: [
      "Check CoreDNS pods: kubectl get pods -n kube-system -l k8s-app=kube-dns",
      "Check resolv.conf: kubectl exec <pod> -- cat /etc/resolv.conf",
      "Test DNS: kubectl exec <pod> -- nslookup kubernetes.default",
      "Check CoreDNS logs for errors",
    ],
    reasoning: "If no pods can resolve DNS, CoreDNS is likely down. If specific pods can't resolve, check their dnsPolicy and whether NetworkPolicies are blocking UDP port 53.",
  },
  {
    symptom: "PVC stuck in Pending",
    meaning: "A PersistentVolumeClaim cannot bind to a PersistentVolume.",
    causes: [
      "No PV matches the request (size, access mode, storage class)",
      "StorageClass doesn't exist or has no provisioner",
      "Dynamic provisioner is failing (cloud provider issues)",
      "PV exists but is bound to another PVC",
    ],
    inspect: [
      "Check PVC events: kubectl describe pvc <name>",
      "List PVs: kubectl get pv",
      "Check StorageClass exists: kubectl get sc",
      "Check provisioner logs if using dynamic provisioning",
    ],
    reasoning: "If using dynamic provisioning, check the StorageClass and its provisioner. If using static PVs, make sure a PV exists with matching size, access mode, and storageClassName.",
  },
  {
    symptom: "Permission denied (RBAC)",
    meaning: "The user or ServiceAccount doesn't have permission for the requested operation.",
    causes: [
      "Missing Role or ClusterRole",
      "Missing RoleBinding or ClusterRoleBinding",
      "Wrong namespace in RoleBinding",
      "ServiceAccount not specified in pod",
      "Token expired or invalid",
    ],
    inspect: [
      "Check auth: kubectl auth can-i <verb> <resource> --as=<user>",
      "List roles: kubectl get roles,rolebindings -n <ns>",
      "Check pod's ServiceAccount",
      "Check the exact error message for resource/verb",
    ],
    reasoning: "The error message usually says exactly which verb and resource is denied. Create a Role with that specific permission and bind it to the user/SA.",
  },
];

const Troubleshooting = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = issues.filter((issue) =>
    issue.symptom.toLowerCase().includes(search.toLowerCase()) ||
    issue.meaning.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Practical</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Troubleshooting</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Learn to reason through common Kubernetes failures. Each issue includes causes, what to inspect, and how to think about the problem.
          </p>
        </motion.div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((issue) => (
            <motion.div
              key={issue.symptom}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="k8s-card cursor-pointer"
              onClick={() => setExpanded(expanded === issue.symptom ? null : issue.symptom)}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-k8s-orange shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">{issue.symptom}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{issue.meaning}</p>
                </div>
                <span className="text-muted-foreground text-xs">{expanded === issue.symptom ? "▲" : "▼"}</span>
              </div>
              {expanded === issue.symptom && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-4 border-t border-border pt-4">
                  <div>
                    <h4 className="font-display font-semibold text-sm text-foreground mb-2">Likely Causes</h4>
                    <ul className="space-y-1">
                      {issue.causes.map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-k8s-orange mt-0.5">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-foreground mb-2">What to Inspect</h4>
                    <ul className="space-y-1">
                      {issue.inspect.map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">→</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="k8s-analogy">
                    <h4 className="font-display font-semibold text-sm text-foreground mb-1">How to Reason</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{issue.reasoning}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Troubleshooting;
