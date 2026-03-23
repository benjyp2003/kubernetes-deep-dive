import type { LabScenario } from "../types";

const serviceAccountForbidden: LabScenario = {
  id: "serviceaccount-forbidden",
  title: "ServiceAccount Cannot Read Secrets",
  category: "config",
  difficulty: "advanced",
  icon: "🔑",
  problemDescription: "An application pod is failing to start because it cannot read a Secret from the Kubernetes API. The pod logs show a 'Forbidden' error when attempting to fetch database credentials at startup.",
  environmentContext: "Namespace: backend\nServiceAccount: app-sa\nPod: data-service-5f7a8c3d1-n9x2k (uses app-sa)\nSecret: db-credentials (exists in namespace)\nThe pod makes API calls to read the secret programmatically.",
  rootCause: "The ServiceAccount 'app-sa' has a Role bound to it, but the Role only grants 'get' and 'list' on 'configmaps', not 'secrets'. The RoleBinding exists and is correct, but the Role itself is missing the 'secrets' resource.",
  fix: "Update the Role to include secrets:\n\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  name: app-role\n  namespace: backend\nrules:\n- apiGroups: [\"\"]\n  resources: [\"configmaps\", \"secrets\"]\n  verbs: [\"get\", \"list\"]",
  explanation: "ServiceAccounts are identities for pods. When a pod needs to interact with the Kubernetes API (e.g., reading Secrets), the ServiceAccount it runs as must have the correct RBAC permissions. The Role must explicitly list the resource types the SA can access.",
  preventionTip: "Use the principle of least privilege: only grant the exact resources and verbs needed. Test with 'kubectl auth can-i' using --as=system:serviceaccount:<ns>:<sa-name>.",
  relatedPage: "/security",
  clues: [
    { id: "c1", text: "Pod logs show Forbidden error accessing secrets", discoveredBy: "kubectl logs data-service-5f7a8c3d1-n9x2k -n backend" },
    { id: "c2", text: "Pod uses ServiceAccount 'app-sa'", discoveredBy: "kubectl describe pod data-service-5f7a8c3d1-n9x2k -n backend" },
    { id: "c3", text: "ServiceAccount 'app-sa' exists", discoveredBy: "kubectl get serviceaccount -n backend" },
    { id: "c4", text: "RoleBinding binds 'app-role' to 'app-sa'", discoveredBy: "kubectl describe rolebinding app-binding -n backend" },
    { id: "c5", text: "Role 'app-role' only allows configmaps, not secrets", discoveredBy: "kubectl describe role app-role -n backend" },
    { id: "c6", text: "auth can-i confirms SA cannot get secrets", discoveredBy: "kubectl auth can-i get secrets --as=system:serviceaccount:backend:app-sa -n backend" },
  ],
  commands: [
    {
      command: "kubectl get pods -n backend",
      output: `NAME                             READY   STATUS    RESTARTS   AGE
data-service-5f7a8c3d1-n9x2k    1/1     Running   3          5m
api-gateway-4e9b2f1c7-h3j8m     1/1     Running   0          2d`,
    },
    {
      command: "kubectl logs data-service-5f7a8c3d1-n9x2k -n backend",
      output: `2026-03-08T14:22:01.123Z [INFO]  Starting data-service v3.1.0
2026-03-08T14:22:01.456Z [INFO]  Attempting to read secret 'db-credentials' from namespace 'backend'
2026-03-08T14:22:01.789Z [ERROR] Failed to read secret: secrets "db-credentials" is forbidden: User "system:serviceaccount:backend:app-sa" cannot get resource "secrets" in API group "" in the namespace "backend"
2026-03-08T14:22:01.790Z [FATAL] Cannot start without database credentials. Exiting.`,
      revealsClues: ["c1"],
    },
    {
      command: "kubectl describe pod data-service-5f7a8c3d1-n9x2k -n backend",
      output: `Name:         data-service-5f7a8c3d1-n9x2k
Namespace:    backend
Node:         worker-node-1/10.0.1.14
Status:       Running
Service Account: app-sa
Containers:
  data-service:
    Image:          myregistry/data-service:v3.1.0
    State:          Running
    Restart Count:  3
    Environment:
      APP_ENV: production
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-7k2m9 (ro)`,
      revealsClues: ["c2"],
    },
    {
      command: "kubectl get serviceaccount -n backend",
      output: `NAME      SECRETS   AGE
app-sa    0         15d
default   0         30d`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl describe serviceaccount app-sa -n backend",
      output: `Name:                app-sa
Namespace:           backend
Labels:              <none>
Annotations:         <none>
Image pull secrets:  <none>
Mountable secrets:   <none>
Tokens:              <none>`,
    },
    {
      command: "kubectl get roles -n backend",
      output: `NAME        CREATED AT
app-role    2026-02-20T10:00:00Z`,
    },
    {
      command: "kubectl describe role app-role -n backend",
      output: `Name:         app-role
Namespace:    backend
Labels:       <none>
PolicyRule:
  Resources   Non-Resource URLs  Resource Names  Verbs
  ---------   -----------------  --------------  -----
  configmaps  []                 []              [get list]`,
      revealsClues: ["c5"],
    },
    {
      command: "kubectl get rolebindings -n backend",
      output: `NAME           ROLE              AGE
app-binding    Role/app-role     15d`,
    },
    {
      command: "kubectl describe rolebinding app-binding -n backend",
      output: `Name:         app-binding
Namespace:    backend
Labels:       <none>
Role:
  Kind:  Role
  Name:  app-role
Subjects:
  Kind            Name    Namespace
  ----            ----    ---------
  ServiceAccount  app-sa  backend`,
      revealsClues: ["c4"],
    },
    {
      command: "kubectl auth can-i get secrets --as=system:serviceaccount:backend:app-sa -n backend",
      output: "no",
      revealsClues: ["c6"],
    },
    {
      command: "kubectl auth can-i get configmaps --as=system:serviceaccount:backend:app-sa -n backend",
      output: "yes",
    },
    {
      command: "kubectl get secrets -n backend",
      output: `NAME              TYPE     DATA   AGE
db-credentials    Opaque   2      30d`,
    },
    {
      command: "kubectl get events -n backend",
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
    "Check the pod logs for the exact error message",
    "Identify which ServiceAccount the pod is using",
    "Look at what permissions the Role grants — which resources are listed?",
    "Use 'kubectl auth can-i' to verify what the ServiceAccount can access",
  ],
  rootCauseOptions: [
    "The Secret 'db-credentials' does not exist",
    "The ServiceAccount token is not mounted in the pod",
    "The Role only grants access to configmaps, not secrets",
    "The RoleBinding references the wrong ServiceAccount",
  ],
  correctRootCauseIndex: 2,
};

export default serviceAccountForbidden;
