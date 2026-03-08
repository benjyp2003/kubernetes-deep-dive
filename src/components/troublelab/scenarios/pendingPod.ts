import type { LabScenario } from "../types";

const pendingPod: LabScenario = {
  id: "pending-pod",
  title: "Pod Stuck in Pending",
  category: "pod",
  difficulty: "intermediate",
  icon: "⏳",
  problemDescription: "A new pod has been in Pending state for 10 minutes. The deployment cannot progress.",
  environmentContext: "Namespace: production\nDeployment: ml-model (1 replica)\nThe pod requests 8Gi memory and 4 CPU cores.\nCluster has 2 worker nodes.",
  rootCause: "The pod requests 8Gi memory and 4 CPU but no node has sufficient available resources. Worker-node-1 has 2Gi free and worker-node-2 has 3Gi free.",
  fix: "Either reduce the resource requests, add more nodes to the cluster, or free up resources by scaling down other workloads.",
  explanation: "A pod stays Pending when the scheduler cannot find a node that satisfies its requirements. This includes CPU/memory requests, node selectors, taints/tolerations, and affinity rules.",
  preventionTip: "Monitor cluster resource utilization. Set up ResourceQuotas and LimitRanges. Use cluster autoscaler to automatically add nodes when resources are exhausted.",
  relatedPage: "/scheduling",
  clues: [
    { id: "c1", text: "Pod is in Pending state with no node assigned", discoveredBy: "kubectl get pods" },
    { id: "c2", text: "Events show: 'Insufficient memory' on both nodes", discoveredBy: "kubectl describe pod ml-model-5f8a9c3d2-mn7kl" },
    { id: "c3", text: "Pod requests 8Gi memory and 4 CPU", discoveredBy: "kubectl describe pod ml-model-5f8a9c3d2-mn7kl" },
    { id: "c4", text: "Nodes have limited available resources", discoveredBy: "kubectl get nodes" },
  ],
  commands: [
    {
      command: "kubectl get pods",
      output: `NAME                        READY   STATUS    RESTARTS   AGE
ml-model-5f8a9c3d2-mn7kl   0/1     Pending   0          10m
web-app-7c6d5e4f3-abc12    1/1     Running   0          2d
web-app-7c6d5e4f3-def34    1/1     Running   0          2d
cache-redis-0               1/1     Running   0          5d`,
      revealsClues: ["c1"],
    },
    {
      command: "kubectl describe pod ml-model-5f8a9c3d2-mn7kl",
      output: `Name:         ml-model-5f8a9c3d2-mn7kl
Namespace:    production
Node:         <none>
Status:       Pending
Containers:
  model-server:
    Image:   myregistry/ml-model:latest
    Requests:
      cpu:     4
      memory:  8Gi
    Limits:
      cpu:     4
      memory:  8Gi
Events:
  Type     Reason            Age                From               Message
  ----     ------            ----               ----               -------
  Warning  FailedScheduling  2m (x8 over 10m)   default-scheduler  0/2 nodes are available: 1 Insufficient memory, 1 Insufficient memory. preemption: 0/2 nodes are available: 2 No preemption victims found for incoming pod.`,
      revealsClues: ["c2", "c3"],
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   90d   v1.29.2
worker-node-1   Ready    <none>          90d   v1.29.2
worker-node-2   Ready    <none>          90d   v1.29.2`,
      revealsClues: ["c4"],
    },
    {
      command: "kubectl get events",
      output: `LAST SEEN   TYPE      REASON             OBJECT                                MESSAGE
10m         Normal    Scheduled          pod/web-app-7c6d5e4f3-abc12           Assigned to worker-node-1
10m         Warning   FailedScheduling   pod/ml-model-5f8a9c3d2-mn7kl         0/2 nodes are available: Insufficient memory`,
    },
    {
      command: "kubectl get deployment",
      output: `NAME       READY   UP-TO-DATE   AVAILABLE   AGE
ml-model   0/1     1            0           10m
web-app    2/2     2            2           2d`,
    },
    {
      command: "kubectl get svc",
      output: `NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
ml-svc       ClusterIP   10.96.80.10    <none>        8080/TCP   10m
kubernetes   ClusterIP   10.96.0.1      <none>        443/TCP    90d`,
    },
  ],
  hints: [
    "Check if the pod has been assigned to a node",
    "Look at the pod events for scheduling failures",
    "Check the resource requests versus what's available",
  ],
  rootCauseOptions: [
    "The container image cannot be pulled",
    "No node has enough resources (CPU/memory) for the pod's requests",
    "The pod has a node affinity rule that no node satisfies",
    "The scheduler is not running",
  ],
  correctRootCauseIndex: 1,
};

export default pendingPod;
