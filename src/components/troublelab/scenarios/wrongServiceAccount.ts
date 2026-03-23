import type { LabScenario } from "../types";

const wrongServiceAccount: LabScenario = {
  id: "wrong-serviceaccount",
  title: "Pod Using Wrong ServiceAccount",
  category: "config",
  difficulty: "intermediate",
  icon: "👤",
  problemDescription: "A pod that needs to read ConfigMaps from the API is getting Forbidden errors. The team created a ServiceAccount with the right permissions, but the pod still can't access anything.",
  environmentContext: "Namespace: apps\nServiceAccount: config-reader-sa (has correct permissions)\nPod: config-loader-8d5e7f2a1-j4k6 (should use config-reader-sa)\nThe pod's deployment was copied from a template and may not specify the correct SA.",
  rootCause: "The pod is using the 'default' ServiceAccount instead of 'config-reader-sa'. The deployment spec does not specify serviceAccountName, so Kubernetes assigns the default SA which has no additional permissions.",
  fix: "Update the deployment to specify the correct ServiceAccount:\n\nspec:\n  template:\n    spec:\n      serviceAccountName: config-reader-sa",
  explanation: "When a pod does not specify a serviceAccountName, Kubernetes assigns the 'default' ServiceAccount. RBAC permissions are granted to specific ServiceAccounts, so using the wrong one means the pod won't have the expected permissions.",
  preventionTip: "Always explicitly set serviceAccountName in pod specs. Never rely on the default ServiceAccount for workloads that need API access.",
  relatedPage: "/security",
  clues: [
    { id: "c1", text: "Pod is using 'default' ServiceAccount, not 'config-reader-sa'", discoveredBy: "kubectl describe pod config-loader-8d5e7f2a1-j4k6 -n apps" },
    { id: "c2", text: "ServiceAccount 'config-reader-sa' exists with correct binding", discoveredBy: "kubectl get serviceaccount -n apps" },
    { id: "c3", text: "RoleBinding grants configmap access to config-reader-sa", discoveredBy: "kubectl describe rolebinding config-reader-binding -n apps" },
    { id: "c4", text: "Default SA has no permissions", discoveredBy: "kubectl auth can-i get configmaps --as=system:serviceaccount:apps:default -n apps" },
    { id: "c5", text: "config-reader-sa has correct permissions", discoveredBy: "kubectl auth can-i get configmaps --as=system:serviceaccount:apps:config-reader-sa -n apps" },
  ],
  commands: [
    {
      command: "kubectl get pods -n apps",
      output: `NAME                              READY   STATUS    RESTARTS   AGE
config-loader-8d5e7f2a1-j4k6     1/1     Running   2          10m`,
    },
    {
      command: "kubectl logs config-loader-8d5e7f2a1-j4k6 -n apps",
      output: `2026-03-08T15:00:00.000Z [INFO]  Config loader starting
2026-03-08T15:00:01.000Z [ERROR] Failed to get configmap 'app-config': configmaps "app-config" is forbidden: User "system:serviceaccount:apps:default" cannot get resource "configmaps" in API group "" in the namespace "apps"`,
    },
    {
      command: "kubectl describe pod config-loader-8d5e7f2a1-j4k6 -n apps",
      output: `Name:         config-loader-8d5e7f2a1-j4k6
Namespace:    apps
Service Account: default
Containers:
  config-loader:
    Image:  myregistry/config-loader:v1.0
    State:  Running
    Environment:
      NAMESPACE: apps`,
      revealsClues: ["c1"],
    },
    {
      command: "kubectl get serviceaccount -n apps",
      output: `NAME                SECRETS   AGE
config-reader-sa    0         10d
default             0         30d`,
      revealsClues: ["c2"],
    },
    {
      command: "kubectl get rolebindings -n apps",
      output: `NAME                     ROLE                    AGE
config-reader-binding    Role/config-reader      10d`,
    },
    {
      command: "kubectl describe rolebinding config-reader-binding -n apps",
      output: `Name:         config-reader-binding
Namespace:    apps
Role:
  Kind:  Role
  Name:  config-reader
Subjects:
  Kind            Name               Namespace
  ----            ----               ---------
  ServiceAccount  config-reader-sa   apps`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl describe role config-reader -n apps",
      output: `Name:         config-reader
Namespace:    apps
PolicyRule:
  Resources   Non-Resource URLs  Resource Names  Verbs
  ---------   -----------------  --------------  -----
  configmaps  []                 []              [get list watch]`,
    },
    {
      command: "kubectl auth can-i get configmaps --as=system:serviceaccount:apps:default -n apps",
      output: "no",
      revealsClues: ["c4"],
    },
    {
      command: "kubectl auth can-i get configmaps --as=system:serviceaccount:apps:config-reader-sa -n apps",
      output: "yes",
      revealsClues: ["c5"],
    },
    {
      command: "kubectl get events -n apps",
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
    "Check the pod logs to see which identity is being used",
    "Look at which ServiceAccount the pod is actually running as",
    "Compare the SA the pod uses vs the SA that has the permissions",
    "The deployment may not specify serviceAccountName",
  ],
  rootCauseOptions: [
    "The ConfigMap 'app-config' does not exist",
    "The Role is missing the 'get' verb for configmaps",
    "The pod is using the 'default' ServiceAccount instead of 'config-reader-sa'",
    "The ServiceAccount token is not mounted in the pod",
  ],
  correctRootCauseIndex: 2,
};

export default wrongServiceAccount;
