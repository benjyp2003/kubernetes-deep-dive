import type { LabScenario } from "../types";

const wrongRoleBinding: LabScenario = {
  id: "wrong-rolebinding",
  title: "RoleBinding References Wrong Namespace",
  category: "config",
  difficulty: "advanced",
  icon: "🔗",
  problemDescription: "A QA engineer cannot create deployments in the 'staging' namespace despite being told they have 'edit' access. They receive a Forbidden error.",
  environmentContext: "Namespace: staging, dev\nUser: qa-user\nClusterRole: edit (built-in)\nA RoleBinding was created but may be in the wrong namespace.",
  rootCause: "The RoleBinding 'qa-edit-binding' was accidentally created in the 'dev' namespace instead of 'staging'. RoleBindings are namespace-scoped, so a binding in 'dev' only grants access in 'dev', not in 'staging'.",
  fix: "Create the RoleBinding in the correct namespace:\n\nkubectl create rolebinding qa-edit-binding \\\n  --clusterrole=edit \\\n  --user=qa-user \\\n  -n staging",
  explanation: "RoleBindings are namespace-scoped. A RoleBinding in namespace 'dev' that references a ClusterRole only grants permissions within 'dev'. To grant access in 'staging', the RoleBinding must exist in 'staging'. This is a common mistake when setting up multi-namespace access.",
  preventionTip: "Always double-check the namespace when creating RoleBindings. Use 'kubectl auth can-i' to verify permissions in the target namespace after creating bindings.",
  relatedPage: "/security",
  clues: [
    { id: "c1", text: "qa-user cannot create deployments in staging", discoveredBy: "kubectl auth can-i create deployments --as=qa-user -n staging" },
    { id: "c2", text: "qa-user CAN create deployments in dev", discoveredBy: "kubectl auth can-i create deployments --as=qa-user -n dev" },
    { id: "c3", text: "No RoleBinding exists in staging namespace", discoveredBy: "kubectl get rolebindings -n staging" },
    { id: "c4", text: "RoleBinding exists in dev namespace for qa-user", discoveredBy: "kubectl get rolebindings -n dev" },
    { id: "c5", text: "The binding in dev references ClusterRole/edit for qa-user", discoveredBy: "kubectl describe rolebinding qa-edit-binding -n dev" },
  ],
  commands: [
    {
      command: "kubectl auth can-i create deployments --as=qa-user -n staging",
      output: "no",
      revealsClues: ["c1"],
    },
    {
      command: "kubectl auth can-i create deployments --as=qa-user -n dev",
      output: "yes",
      revealsClues: ["c2"],
    },
    {
      command: "kubectl auth can-i get pods --as=qa-user -n staging",
      output: "no",
    },
    {
      command: "kubectl get rolebindings -n staging",
      output: `No resources found in staging namespace.`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl get rolebindings -n dev",
      output: `NAME                ROLE                  AGE
qa-edit-binding     ClusterRole/edit      5d`,
      revealsClues: ["c4"],
    },
    {
      command: "kubectl describe rolebinding qa-edit-binding -n dev",
      output: `Name:         qa-edit-binding
Namespace:    dev
Labels:       <none>
Role:
  Kind:  ClusterRole
  Name:  edit
Subjects:
  Kind  Name      API Group
  ----  ----      ---------
  User  qa-user   rbac.authorization.k8s.io`,
      revealsClues: ["c5"],
    },
    {
      command: "kubectl get roles -n staging",
      output: `No resources found in staging namespace.`,
    },
    {
      command: "kubectl get clusterrolebindings",
      output: `NAME                                                   ROLE                                                 AGE
cluster-admin                                          ClusterRole/cluster-admin                             90d`,
    },
    {
      command: "kubectl get pods -n staging",
      output: `NAME                          READY   STATUS    RESTARTS   AGE
staging-api-8c4d7e2f1-k3m9   1/1     Running   0          3d
staging-web-3a7b9c1d5-p2q8   1/1     Running   0          3d`,
    },
    {
      command: "kubectl get serviceaccount -n staging",
      output: `NAME      SECRETS   AGE
default   0         30d`,
    },
    {
      command: "kubectl get events -n staging",
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
    "Test the user's permissions with 'kubectl auth can-i' in the staging namespace",
    "Also test the same permissions in other namespaces — does it work elsewhere?",
    "Check where the RoleBinding actually exists",
    "RoleBindings are namespace-scoped — they only grant access in their own namespace",
  ],
  rootCauseOptions: [
    "The ClusterRole 'edit' does not include deployment permissions",
    "The RoleBinding was created in the 'dev' namespace instead of 'staging'",
    "The qa-user identity does not exist in the cluster",
    "RBAC authorization mode is not enabled",
  ],
  correctRootCauseIndex: 1,
};

export default wrongRoleBinding;
