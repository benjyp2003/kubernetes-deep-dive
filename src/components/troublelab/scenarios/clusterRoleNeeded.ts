import type { LabScenario } from "../types";

const clusterRoleNeeded: LabScenario = {
  id: "clusterrole-needed",
  title: "Namespace Role vs Cluster-Wide Access",
  category: "config",
  difficulty: "advanced",
  icon: "🌐",
  problemDescription: "A monitoring agent needs to list pods across ALL namespaces but can only see pods in the 'monitoring' namespace. The dashboard shows incomplete data.",
  environmentContext: "Namespace: monitoring\nServiceAccount: monitor-sa\nRole: monitor-role (in namespace monitoring)\nRoleBinding: monitor-binding (in namespace monitoring)\nThe monitoring agent needs cluster-wide pod visibility.",
  rootCause: "The monitoring agent uses a namespace-scoped Role and RoleBinding in 'monitoring', which only grants access within that namespace. To list pods across all namespaces, a ClusterRole and ClusterRoleBinding are needed.",
  fix: "Create a ClusterRole and ClusterRoleBinding:\n\napiVersion: rbac.authorization.k8s.io/v1\nkind: ClusterRole\nmetadata:\n  name: cluster-pod-reader\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"get\", \"list\", \"watch\"]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: ClusterRoleBinding\nmetadata:\n  name: monitor-cluster-binding\nsubjects:\n- kind: ServiceAccount\n  name: monitor-sa\n  namespace: monitoring\nroleRef:\n  kind: ClusterRole\n  name: cluster-pod-reader\n  apiGroup: rbac.authorization.k8s.io",
  explanation: "Kubernetes has two scope levels for RBAC: namespace-scoped (Role/RoleBinding) and cluster-scoped (ClusterRole/ClusterRoleBinding). A Role only grants access within its namespace. For cross-namespace access, you must use ClusterRole + ClusterRoleBinding.",
  preventionTip: "When designing monitoring or cross-namespace tools, plan for ClusterRole + ClusterRoleBinding from the start. Document which workloads need cluster-wide access.",
  relatedPage: "/security",
  clues: [
    { id: "c1", text: "SA can list pods in monitoring namespace", discoveredBy: "kubectl auth can-i list pods --as=system:serviceaccount:monitoring:monitor-sa -n monitoring" },
    { id: "c2", text: "SA cannot list pods in default namespace", discoveredBy: "kubectl auth can-i list pods --as=system:serviceaccount:monitoring:monitor-sa -n default" },
    { id: "c3", text: "Only a namespace Role exists, not a ClusterRole", discoveredBy: "kubectl get roles -n monitoring" },
    { id: "c4", text: "RoleBinding is namespace-scoped to monitoring", discoveredBy: "kubectl describe rolebinding monitor-binding -n monitoring" },
    { id: "c5", text: "No ClusterRoleBinding for monitor-sa exists", discoveredBy: "kubectl get clusterrolebindings" },
  ],
  commands: [
    {
      command: "kubectl auth can-i list pods --as=system:serviceaccount:monitoring:monitor-sa -n monitoring",
      output: "yes",
      revealsClues: ["c1"],
    },
    {
      command: "kubectl auth can-i list pods --as=system:serviceaccount:monitoring:monitor-sa -n default",
      output: "no",
      revealsClues: ["c2"],
    },
    {
      command: "kubectl auth can-i list pods --as=system:serviceaccount:monitoring:monitor-sa -n kube-system",
      output: "no",
    },
    {
      command: "kubectl get roles -n monitoring",
      output: `NAME            CREATED AT
monitor-role    2026-02-15T10:00:00Z`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl describe role monitor-role -n monitoring",
      output: `Name:         monitor-role
Namespace:    monitoring
PolicyRule:
  Resources  Non-Resource URLs  Resource Names  Verbs
  ---------  -----------------  --------------  -----
  pods       []                 []              [get list watch]`,
    },
    {
      command: "kubectl get rolebindings -n monitoring",
      output: `NAME               ROLE                 AGE
monitor-binding    Role/monitor-role    20d`,
    },
    {
      command: "kubectl describe rolebinding monitor-binding -n monitoring",
      output: `Name:         monitor-binding
Namespace:    monitoring
Role:
  Kind:  Role
  Name:  monitor-role
Subjects:
  Kind            Name         Namespace
  ----            ----         ---------
  ServiceAccount  monitor-sa   monitoring`,
      revealsClues: ["c4"],
    },
    {
      command: "kubectl get clusterrolebindings",
      output: `NAME                                                   ROLE                                                 AGE
cluster-admin                                          ClusterRole/cluster-admin                             90d
system:controller:deployment-controller                ClusterRole/system:controller:deployment-controller   90d`,
      revealsClues: ["c5"],
    },
    {
      command: "kubectl get serviceaccount -n monitoring",
      output: `NAME         SECRETS   AGE
default      0         30d
monitor-sa   0         20d`,
    },
    {
      command: "kubectl get pods -n monitoring",
      output: `NAME                              READY   STATUS    RESTARTS   AGE
monitor-agent-7c3d8e4f2-x5k9m    1/1     Running   0          2d`,
    },
    {
      command: "kubectl logs monitor-agent-7c3d8e4f2-x5k9m -n monitoring",
      output: `2026-03-08T10:00:00.000Z [INFO]  Monitor agent v2.0 starting
2026-03-08T10:00:01.000Z [INFO]  Listing pods in namespace 'monitoring': OK (2 pods found)
2026-03-08T10:00:02.000Z [WARN]  Listing pods in namespace 'default': FORBIDDEN
2026-03-08T10:00:03.000Z [WARN]  Listing pods in namespace 'kube-system': FORBIDDEN
2026-03-08T10:00:04.000Z [WARN]  Cluster-wide pod listing failed. Dashboard will show partial data.`,
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   90d   v1.29.2
worker-node-1   Ready    <none>          90d   v1.29.2`,
    },
  ],
  hints: [
    "Check whether the SA can access pods in namespaces OTHER than monitoring",
    "Look at whether the permissions are namespace-scoped or cluster-scoped",
    "A Role grants access only within its namespace",
    "For cross-namespace access, you need a ClusterRole and ClusterRoleBinding",
  ],
  rootCauseOptions: [
    "The ServiceAccount token is expired",
    "The Role only grants access in the monitoring namespace, not cluster-wide",
    "The pods in other namespaces have restrictive labels",
    "The API server is rejecting requests from the monitoring namespace",
  ],
  correctRootCauseIndex: 1,
};

export default clusterRoleNeeded;
