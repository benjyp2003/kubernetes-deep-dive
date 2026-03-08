import type { LabScenario } from "../types";

const selectorMismatch: LabScenario = {
  id: "selector-mismatch",
  title: "Service Selector Mismatch",
  category: "networking",
  difficulty: "beginner",
  icon: "🔌",
  problemDescription: "The frontend application reports 'Connection refused' when trying to reach the backend service. The backend pods appear to be running fine.",
  environmentContext: "Namespace: default\nService: backend-svc (ClusterIP:8080)\nDeployment: backend (3 replicas)\nAll pods show Running status but the service returns no results.",
  rootCause: "The service selector uses label 'app: backend-api' but the pods have label 'app: backend'. The labels don't match, so the service has zero endpoints.",
  fix: "Update the service selector to match the pod labels:\n\nselector:\n  app: backend\n\nOr update the pod template labels to match the service selector.",
  explanation: "Services in Kubernetes use label selectors to find their backend pods. When the selector doesn't match any pod labels, the service has zero Endpoints and all traffic to the service ClusterIP fails with 'Connection refused'.",
  preventionTip: "Always verify service selectors match pod labels after changes. Use 'kubectl get endpoints' as a quick check — empty endpoints means a selector mismatch.",
  relatedPage: "/services",
  clues: [
    { id: "c1", text: "All backend pods are Running and Ready", discoveredBy: "kubectl get pods" },
    { id: "c2", text: "Service backend-svc has selector 'app: backend-api'", discoveredBy: "kubectl describe svc backend-svc" },
    { id: "c3", text: "Service has 0 endpoints", discoveredBy: "kubectl get endpoints backend-svc" },
    { id: "c4", text: "Pods have label 'app: backend' (not 'backend-api')", discoveredBy: "kubectl get pods --show-labels" },
  ],
  commands: [
    {
      command: "kubectl get pods",
      output: `NAME                       READY   STATUS    RESTARTS   AGE
backend-6d5f8c7b9-abc12   1/1     Running   0          1h
backend-6d5f8c7b9-def34   1/1     Running   0          1h
backend-6d5f8c7b9-ghi56   1/1     Running   0          1h
frontend-8f4e2a1c3-xyz99  1/1     Running   0          2h`,
      revealsClues: ["c1"],
    },
    {
      command: "kubectl get svc",
      output: `NAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
backend-svc   ClusterIP   10.96.32.100   <none>        8080/TCP   5d
frontend-svc  ClusterIP   10.96.32.101   <none>        3000/TCP   5d
kubernetes    ClusterIP   10.96.0.1      <none>        443/TCP    30d`,
    },
    {
      command: "kubectl describe svc backend-svc",
      output: `Name:              backend-svc
Namespace:         default
Labels:            <none>
Selector:          app=backend-api
Type:              ClusterIP
IP:                10.96.32.100
Port:              http  8080/TCP
TargetPort:        8080/TCP
Endpoints:         <none>
Session Affinity:  None`,
      revealsClues: ["c2", "c3"],
    },
    {
      command: "kubectl get endpoints backend-svc",
      output: `NAME          ENDPOINTS   AGE
backend-svc   <none>      5d`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl get pods --show-labels",
      output: `NAME                       READY   STATUS    RESTARTS   AGE   LABELS
backend-6d5f8c7b9-abc12   1/1     Running   0          1h    app=backend,pod-template-hash=6d5f8c7b9
backend-6d5f8c7b9-def34   1/1     Running   0          1h    app=backend,pod-template-hash=6d5f8c7b9
backend-6d5f8c7b9-ghi56   1/1     Running   0          1h    app=backend,pod-template-hash=6d5f8c7b9
frontend-8f4e2a1c3-xyz99  1/1     Running   0          2h    app=frontend,pod-template-hash=8f4e2a1c3`,
      revealsClues: ["c4"],
    },
    {
      command: "kubectl describe pod backend-6d5f8c7b9-abc12",
      output: `Name:         backend-6d5f8c7b9-abc12
Namespace:    default
Node:         worker-node-1/10.0.1.14
Labels:       app=backend
              pod-template-hash=6d5f8c7b9
Status:       Running
Containers:
  backend:
    Image:   myregistry/backend:v1.2.0
    Port:    8080/TCP
    State:   Running
      Started: Sun, 08 Mar 2026 17:00:00 +0000
    Ready:   True`,
    },
    {
      command: "kubectl logs backend-6d5f8c7b9-abc12",
      output: `2026-03-08T17:00:01.123Z [INFO] Backend server started on port 8080
2026-03-08T17:00:01.125Z [INFO] Connected to database successfully
2026-03-08T17:00:01.126Z [INFO] Ready to accept connections`,
    },
    {
      command: "kubectl get deployment",
      output: `NAME       READY   UP-TO-DATE   AVAILABLE   AGE
backend    3/3     3            3           5d
frontend   1/1     1            1           5d`,
    },
    {
      command: "kubectl describe deployment backend",
      output: `Name:                   backend
Namespace:              default
Selector:               app=backend
Replicas:               3 desired | 3 updated | 3 total | 3 available
Pod Template:
  Labels:  app=backend
  Containers:
   backend:
    Image:        myregistry/backend:v1.2.0
    Port:         8080/TCP`,
    },
    {
      command: "kubectl get events",
      output: `LAST SEEN   TYPE     REASON    OBJECT                          MESSAGE
1h          Normal   Pulled    pod/backend-6d5f8c7b9-abc12     Container image already present
1h          Normal   Created   pod/backend-6d5f8c7b9-abc12     Created container backend
1h          Normal   Started   pod/backend-6d5f8c7b9-abc12     Started container backend`,
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   30d   v1.29.2
worker-node-1   Ready    <none>          30d   v1.29.2
worker-node-2   Ready    <none>          30d   v1.29.2`,
    },
  ],
  hints: [
    "The pods are running — the problem is not with the pods themselves",
    "Check if the service has any endpoints",
    "Compare the service selector with the pod labels",
    "A service with zero endpoints means no pods match its selector",
  ],
  rootCauseOptions: [
    "The backend pods are not listening on the correct port",
    "The service selector 'app: backend-api' doesn't match pod label 'app: backend'",
    "NetworkPolicy is blocking traffic between frontend and backend",
    "DNS is not resolving the service name correctly",
  ],
  correctRootCauseIndex: 1,
};

export default selectorMismatch;
