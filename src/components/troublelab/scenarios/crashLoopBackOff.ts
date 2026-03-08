import type { LabScenario } from "./types";

const crashLoopBackOff: LabScenario = {
  id: "crashloopbackoff",
  title: "CrashLoopBackOff",
  category: "pod",
  difficulty: "beginner",
  icon: "🔴",
  problemDescription: "The backend API pod keeps restarting every few seconds. Users report that the API is unavailable.",
  environmentContext: "Namespace: production\nDeployment: backend-api (1 replica)\nService: backend-svc (ClusterIP)\nThe team just deployed a new version of the backend container image.",
  rootCause: "The container is crashing because the required environment variable DATABASE_URL is missing. The new deployment removed the env var reference to the database secret.",
  fix: "Add the DATABASE_URL environment variable back to the deployment spec, referencing the correct Secret key:\n\nenv:\n  - name: DATABASE_URL\n    valueFrom:\n      secretKeyRef:\n        name: db-credentials\n        key: connection-string",
  explanation: "CrashLoopBackOff occurs when a container starts, crashes, and Kubernetes keeps restarting it with exponential backoff delays. The application requires DATABASE_URL to connect to the database. Without it, the process exits with code 1 immediately.",
  preventionTip: "Use admission controllers or CI checks to validate that required environment variables are present before deploying. Consider using init containers to verify connectivity.",
  relatedPage: "/troubleshooting",
  clues: [
    { id: "c1", text: "Pod status is CrashLoopBackOff", discoveredBy: "kubectl get pods" },
    { id: "c2", text: "Container exit code is 1 (application error)", discoveredBy: "kubectl describe pod backend-api-7d4f8b6c9-xk2mn" },
    { id: "c3", text: "Logs show: 'Error: DATABASE_URL environment variable is required'", discoveredBy: "kubectl logs backend-api-7d4f8b6c9-xk2mn" },
    { id: "c4", text: "No DATABASE_URL env var in container spec", discoveredBy: "kubectl describe pod backend-api-7d4f8b6c9-xk2mn" },
    { id: "c5", text: "Previous deployment revision had DATABASE_URL configured", discoveredBy: "kubectl get events" },
  ],
  commands: [
    {
      command: "kubectl get pods",
      output: `NAME                            READY   STATUS             RESTARTS      AGE
backend-api-7d4f8b6c9-xk2mn    0/1     CrashLoopBackOff   7 (32s ago)   4m12s
frontend-app-5c8d7e3f1-abc12   1/1     Running            0             2d`,
      revealsClues: ["c1"],
    },
    {
      command: "kubectl describe pod backend-api-7d4f8b6c9-xk2mn",
      output: `Name:         backend-api-7d4f8b6c9-xk2mn
Namespace:    production
Node:         worker-node-2/10.0.1.15
Status:       Running
Containers:
  backend:
    Image:          myregistry/backend-api:v2.3.1
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1
      Started:      Sun, 08 Mar 2026 18:30:12 +0000
      Finished:     Sun, 08 Mar 2026 18:30:12 +0000
    Ready:          False
    Restart Count:  7
    Environment:
      APP_PORT:     8080
      LOG_LEVEL:    info
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  4m12s              default-scheduler  Successfully assigned production/backend-api-7d4f8b6c9-xk2mn to worker-node-2
  Normal   Pulled     32s (x8 over 4m)   kubelet            Container image "myregistry/backend-api:v2.3.1" already present on machine
  Normal   Created    32s (x8 over 4m)   kubelet            Created container backend
  Normal   Started    32s (x8 over 4m)   kubelet            Started container backend
  Warning  BackOff    18s (x24 over 4m)  kubelet            Back-off restarting failed container backend in pod backend-api-7d4f8b6c9-xk2mn_production`,
      revealsClues: ["c2", "c4"],
    },
    {
      command: "kubectl logs backend-api-7d4f8b6c9-xk2mn",
      output: `2026-03-08T18:30:12.341Z [ERROR] Configuration validation failed
2026-03-08T18:30:12.341Z [ERROR] Error: DATABASE_URL environment variable is required
2026-03-08T18:30:12.342Z [ERROR] Application cannot start without database connection
2026-03-08T18:30:12.342Z [INFO]  Shutting down...`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl get svc",
      output: `NAME           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
backend-svc    ClusterIP   10.96.45.122    <none>        8080/TCP   30d
frontend-svc   ClusterIP   10.96.78.201    <none>        3000/TCP   30d
kubernetes     ClusterIP   10.96.0.1       <none>        443/TCP    90d`,
    },
    {
      command: "kubectl get deployment",
      output: `NAME            READY   UP-TO-DATE   AVAILABLE   AGE
backend-api     0/1     1            0           4m
frontend-app    1/1     1            1           2d`,
    },
    {
      command: "kubectl describe deployment backend-api",
      output: `Name:                   backend-api
Namespace:              production
Replicas:               1 desired | 1 updated | 1 total | 0 available | 1 unavailable
Strategy:               RollingUpdate
Pod Template:
  Containers:
   backend:
    Image:      myregistry/backend-api:v2.3.1
    Port:       8080/TCP
    Environment:
      APP_PORT:     8080
      LOG_LEVEL:    info
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      False   MinimumReplicasUnavailable
  Progressing    False   ProgressDeadlineExceeded`,
    },
    {
      command: "kubectl get events",
      output: `LAST SEEN   TYPE      REASON              OBJECT                                MESSAGE
4m          Normal    Scheduled           pod/backend-api-7d4f8b6c9-xk2mn      Successfully assigned to worker-node-2
4m          Normal    Pulled              pod/backend-api-7d4f8b6c9-xk2mn      Container image already present
4m          Normal    Created             pod/backend-api-7d4f8b6c9-xk2mn      Created container backend
4m          Normal    Started             pod/backend-api-7d4f8b6c9-xk2mn      Started container backend
3m          Warning   BackOff             pod/backend-api-7d4f8b6c9-xk2mn      Back-off restarting failed container
5m          Normal    ScalingReplicaSet   deployment/backend-api                Scaled up replica set backend-api-7d4f8b6c9 to 1
10m         Normal    ScalingReplicaSet   deployment/backend-api                Scaled down replica set backend-api-6a3e7c2d8 to 0`,
      revealsClues: ["c5"],
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   90d   v1.29.2
worker-node-1   Ready    <none>          90d   v1.29.2
worker-node-2   Ready    <none>          90d   v1.29.2`,
    },
    {
      command: "kubectl get pods --show-labels",
      output: `NAME                            READY   STATUS             RESTARTS      AGE     LABELS
backend-api-7d4f8b6c9-xk2mn    0/1     CrashLoopBackOff   7 (32s ago)   4m12s   app=backend-api,version=v2
frontend-app-5c8d7e3f1-abc12   1/1     Running            0             2d      app=frontend,version=v1`,
    },
  ],
  hints: [
    "Start by checking the pod status with kubectl get pods",
    "Look at the container logs for error messages",
    "Check what environment variables are configured in the pod",
    "Compare the current deployment spec with what the application expects",
  ],
  rootCauseOptions: [
    "The container image is corrupted or incompatible",
    "The DATABASE_URL environment variable is missing from the deployment",
    "The node does not have enough resources to run the pod",
    "The service is misconfigured and blocking the pod",
  ],
  correctRootCauseIndex: 1,
};

export default crashLoopBackOff;
