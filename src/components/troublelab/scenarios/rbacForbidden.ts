import type { LabScenario } from "../types";

const rbacForbidden: LabScenario = {
  id: "rbac-forbidden",
  title: "RBAC Forbidden — User Cannot List Pods",
  category: "config",
  difficulty: "intermediate",
  icon: "🔐",
  problemDescription: "A developer reports they cannot list pods in the 'dev' namespace. They receive a Forbidden error when running kubectl get pods.",
  environmentContext: "Namespace: dev\nUser: dev-user (member of group 'developers')\nCluster has RBAC enabled\nA Role 'pod-reader' exists in namespace dev\nNo RoleBinding has been created yet.",
  rootCause: "There is no RoleBinding that binds the 'pod-reader' Role to user 'dev-user' or group 'developers' in the 'dev' namespace. The Role exists but is not attached to any identity.",
  fix: "Create a RoleBinding in namespace dev:\n\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata:\n  name: dev-pod-reader\n  namespace: dev\nsubjects:\n- kind: User\n  name: dev-user\n  apiGroup: rbac.authorization.k8s.io\nroleRef:\n  kind: Role\n  name: pod-reader\n  apiGroup: rbac.authorization.k8s.io",
  explanation: "Kubernetes RBAC requires both a Role (which defines permissions) and a RoleBinding (which attaches those permissions to an identity). Having a Role alone does nothing — it must be bound to a user, group, or service account via a RoleBinding.",
  preventionTip: "Always verify that Roles are bound after creation. Use 'kubectl auth can-i' to test permissions before handing off access.",
  relatedPage: "/security",
  clues: [
    { id: "c1", text: "User gets Forbidden error when listing pods", discoveredBy: "kubectl auth can-i get pods --as=dev-user -n dev" },
    { id: "c2", text: "Role 'pod-reader' exists with correct permissions", discoveredBy: "kubectl get roles -n dev" },
    { id: "c3", text: "Role has verbs: get, list, watch on pods", discoveredBy: "kubectl describe role pod-reader -n dev" },
    { id: "c4", text: "No RoleBindings exist in namespace dev", discoveredBy: "kubectl get rolebindings -n dev" },
    { id: "c5", text: "No ClusterRoleBinding references dev-user", discoveredBy: "kubectl get clusterrolebindings" },
  ],
  commands: [
    {
      command: "kubectl auth can-i get pods --as=dev-user -n dev",
      output: "no",
      revealsClues: ["c1"],
    },
    {
      command: "kubectl auth can-i list pods --as=dev-user -n dev",
      output: "no",
    },
    {
      command: "kubectl auth can-i get pods --as=dev-user -n default",
      output: "no",
    },
    {
      command: "kubectl get roles -n dev",
      output: `NAME          CREATED AT
pod-reader    2026-03-01T10:00:00Z`,
      revealsClues: ["c2"],
    },
    {
      command: "kubectl describe role pod-reader -n dev",
      output: `Name:         pod-reader
Namespace:    dev
Labels:       <none>
Annotations:  <none>
PolicyRule:
  Resources  Non-Resource URLs  Resource Names  Verbs
  ---------  -----------------  --------------  -----
  pods       []                 []              [get list watch]`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl get rolebindings -n dev",
      output: `No resources found in dev namespace.`,
      revealsClues: ["c4"],
    },
    {
      command: "kubectl get clusterroles",
      output: `NAME                                                                   CREATED AT
admin                                                                  2026-01-01T00:00:00Z
cluster-admin                                                          2026-01-01T00:00:00Z
edit                                                                   2026-01-01T00:00:00Z
view                                                                   2026-01-01T00:00:00Z
system:controller:deployment-controller                                2026-01-01T00:00:00Z`,
    },
    {
      command: "kubectl get clusterrolebindings",
      output: `NAME                                                   ROLE                                                 AGE
cluster-admin                                          ClusterRole/cluster-admin                             90d
system:controller:deployment-controller                ClusterRole/system:controller:deployment-controller   90d`,
      revealsClues: ["c5"],
    },
    {
      command: "kubectl get pods -n dev",
      output: `NAME                        READY   STATUS    RESTARTS   AGE
web-app-6b8c5d7f9-m2k4n    1/1     Running   0          1d
web-app-6b8c5d7f9-p8j3q    1/1     Running   0          1d`,
    },
    {
      command: "kubectl get serviceaccount -n dev",
      output: `NAME      SECRETS   AGE
default   0         30d`,
    },
    {
      command: "kubectl get events -n dev",
      output: `No events found.`,
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   90d   v1.29.2
worker-node-1   Ready    <none>          90d   v1.29.2`,
    },
  ],
  hints: [
    "Use 'kubectl auth can-i' to test what the user is allowed to do",
    "Check if there are any Roles defined in the namespace",
    "Look at whether any RoleBindings exist to connect the Role to the user",
    "A Role without a RoleBinding has no effect",
  ],
  rootCauseOptions: [
    "The user does not exist in the cluster",
    "The Role 'pod-reader' is missing the 'list' verb",
    "There is no RoleBinding connecting the Role to the user",
    "RBAC is not enabled on the cluster",
  ],
  correctRootCauseIndex: 2,
};

export default rbacForbidden;
