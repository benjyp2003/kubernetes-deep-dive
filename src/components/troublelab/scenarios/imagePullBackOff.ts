import type { LabScenario } from "../types";

const imagePullBackOff: LabScenario = {
  id: "image-pull-backoff",
  title: "ImagePullBackOff",
  category: "pod",
  difficulty: "beginner",
  icon: "📦",
  problemDescription: "A newly deployed application pod is stuck and never becomes Ready. The deployment shows 0 available replicas.",
  environmentContext: "Namespace: staging\nDeployment: payment-service (1 replica)\nThe team updated the container image tag for a new release.",
  rootCause: "The container image tag 'v3.0.1' does not exist in the registry. The correct tag is 'v3.0.0'. The image reference has a typo.",
  fix: "Correct the image tag in the deployment:\n\nimage: myregistry/payment-service:v3.0.0",
  explanation: "ImagePullBackOff occurs when the kubelet cannot pull the specified container image. This can happen due to wrong image name/tag, missing registry credentials, or network issues reaching the registry.",
  preventionTip: "Use image digest references in production for immutable deployments. Implement CI/CD pipelines that verify image existence before deploying.",
  relatedPage: "/troubleshooting",
  clues: [
    { id: "c1", text: "Pod status is ImagePullBackOff", discoveredBy: "kubectl get pods" },
    { id: "c2", text: "Failed to pull image 'myregistry/payment-service:v3.0.1': not found", discoveredBy: "kubectl describe pod payment-service-8b5c9d7e1-qr4st" },
    { id: "c3", text: "Events show repeated image pull failures", discoveredBy: "kubectl get events" },
  ],
  commands: [
    {
      command: "kubectl get pods",
      output: `NAME                               READY   STATUS             RESTARTS   AGE
payment-service-8b5c9d7e1-qr4st   0/1     ImagePullBackOff   0          6m`,
      revealsClues: ["c1"],
    },
    {
      command: "kubectl describe pod payment-service-8b5c9d7e1-qr4st",
      output: `Name:         payment-service-8b5c9d7e1-qr4st
Namespace:    staging
Containers:
  payment:
    Image:          myregistry/payment-service:v3.0.1
    State:          Waiting
      Reason:       ImagePullBackOff
    Ready:          False
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  6m                 default-scheduler  Successfully assigned staging/payment-service-8b5c9d7e1-qr4st to worker-node-1
  Normal   Pulling    4m (x3 over 6m)    kubelet            Pulling image "myregistry/payment-service:v3.0.1"
  Warning  Failed     4m (x3 over 6m)    kubelet            Failed to pull image "myregistry/payment-service:v3.0.1": rpc error: code = NotFound desc = failed to pull and unpack image: not found
  Warning  Failed     4m (x3 over 6m)    kubelet            Error: ErrImagePull
  Normal   BackOff    30s (x18 over 6m)  kubelet            Back-off pulling image "myregistry/payment-service:v3.0.1"`,
      revealsClues: ["c2"],
    },
    {
      command: "kubectl logs payment-service-8b5c9d7e1-qr4st",
      output: `Error from server: container "payment" in pod "payment-service-8b5c9d7e1-qr4st" is waiting to start: image can't be pulled`,
    },
    {
      command: "kubectl get deployment",
      output: `NAME              READY   UP-TO-DATE   AVAILABLE   AGE
payment-service   0/1     1            0           6m`,
    },
    {
      command: "kubectl get events",
      output: `LAST SEEN   TYPE      REASON      OBJECT                                    MESSAGE
6m          Normal    Scheduled   pod/payment-service-8b5c9d7e1-qr4st      Assigned to worker-node-1
5m          Warning   Failed      pod/payment-service-8b5c9d7e1-qr4st      Failed to pull image "myregistry/payment-service:v3.0.1": not found
30s         Normal    BackOff     pod/payment-service-8b5c9d7e1-qr4st      Back-off pulling image`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   60d   v1.29.2
worker-node-1   Ready    <none>          60d   v1.29.2`,
    },
    {
      command: "kubectl get svc",
      output: `NAME              TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
payment-svc       ClusterIP   10.96.55.100   <none>        8080/TCP   30d
kubernetes        ClusterIP   10.96.0.1      <none>        443/TCP    60d`,
    },
  ],
  hints: [
    "Check the pod status — what state is it in?",
    "Describe the pod to see detailed events",
    "Look at the image name and tag carefully",
  ],
  rootCauseOptions: [
    "The node doesn't have enough resources to run the pod",
    "The container image tag 'v3.0.1' does not exist in the registry",
    "The registry requires authentication and credentials are missing",
    "The container is crashing on startup",
  ],
  correctRootCauseIndex: 1,
};

export default imagePullBackOff;
