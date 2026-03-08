import type { LabScenario } from "./types";

const networkPolicyBlock: LabScenario = {
  id: "network-policy-block",
  title: "NetworkPolicy Blocking Traffic",
  category: "networking",
  difficulty: "advanced",
  icon: "🛡️",
  problemDescription: "The monitoring system cannot scrape metrics from the application pods. The Prometheus pod gets 'connection timed out' when trying to reach app pods on port 9090.",
  environmentContext: "Namespace: app-ns (has NetworkPolicies)\nNamespace: monitoring (Prometheus)\nThe app team recently applied a NetworkPolicy to restrict ingress to their namespace.",
  rootCause: "A NetworkPolicy in app-ns only allows ingress from pods with label 'app: frontend' in the same namespace. The Prometheus pod in the monitoring namespace doesn't match this policy, so its traffic is denied.",
  fix: "Add a NetworkPolicy rule that allows ingress from the monitoring namespace:\n\ningress:\n  - from:\n    - namespaceSelector:\n        matchLabels:\n          name: monitoring\n    ports:\n    - port: 9090",
  explanation: "Once any NetworkPolicy selects a pod, that pod becomes isolated and only traffic explicitly allowed by policies is permitted. The existing policy only allowed same-namespace frontend traffic, blocking cross-namespace monitoring.",
  preventionTip: "When applying NetworkPolicies, always consider monitoring and observability tools that need cross-namespace access. Document required traffic flows before writing policies.",
  relatedPage: "/security",
  clues: [
    { id: "c1", text: "App pods are running and healthy", discoveredBy: "kubectl get pods" },
    { id: "c2", text: "A NetworkPolicy exists restricting ingress to app-ns", discoveredBy: "kubectl get networkpolicy" },
    { id: "c3", text: "Policy only allows ingress from label 'app: frontend' in same namespace", discoveredBy: "kubectl describe networkpolicy app-ingress" },
    { id: "c4", text: "Prometheus is in a different namespace (monitoring)", discoveredBy: "kubectl get pods --show-labels" },
  ],
  commands: [
    {
      command: "kubectl get pods",
      output: `NAME                       READY   STATUS    RESTARTS   AGE
app-server-6c7d8e9f0-a1b   1/1     Running   0          3h
app-server-6c7d8e9f0-c2d   1/1     Running   0          3h
frontend-5a4b3c2d1-e5f     1/1     Running   0          3h`,
      revealsClues: ["c1"],
    },
    {
      command: "kubectl get networkpolicy",
      output: `NAME           POD-SELECTOR     AGE
app-ingress    app=app-server   1h`,
      revealsClues: ["c2"],
    },
    {
      command: "kubectl describe networkpolicy app-ingress",
      output: `Name:         app-ingress
Namespace:    app-ns
PodSelector:  app=app-server
PolicyTypes:  Ingress
Ingress:
  From:
    PodSelector:
      matchLabels:
        app: frontend
  Ports:
    Port: 8080/TCP`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl get svc",
      output: `NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)             AGE
app-svc      ClusterIP   10.96.40.50    <none>        8080/TCP,9090/TCP   3h
kubernetes   ClusterIP   10.96.0.1      <none>        443/TCP             60d`,
    },
    {
      command: "kubectl get endpoints",
      output: `NAME         ENDPOINTS                                               AGE
app-svc      10.244.1.5:8080,10.244.2.6:8080,10.244.1.5:9090 + 1   3h`,
    },
    {
      command: "kubectl get pods --show-labels",
      output: `NAME                       READY   STATUS    RESTARTS   AGE   LABELS
app-server-6c7d8e9f0-a1b   1/1     Running   0          3h    app=app-server
app-server-6c7d8e9f0-c2d   1/1     Running   0          3h    app=app-server
frontend-5a4b3c2d1-e5f     1/1     Running   0          3h    app=frontend

Note: Prometheus pod is in namespace 'monitoring' with label 'app=prometheus'`,
      revealsClues: ["c4"],
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   90d   v1.29.2
worker-node-1   Ready    <none>          90d   v1.29.2
worker-node-2   Ready    <none>          90d   v1.29.2`,
    },
    {
      command: "kubectl get events",
      output: `LAST SEEN   TYPE     REASON    OBJECT                          MESSAGE
3h          Normal   Pulled    pod/app-server-6c7d8e9f0-a1b    Container image already present
3h          Normal   Started   pod/app-server-6c7d8e9f0-a1b    Started container app-server`,
    },
    {
      command: "kubectl get ingress",
      output: `No resources found in app-ns namespace.`,
    },
  ],
  hints: [
    "The pods are running fine — this is a connectivity issue",
    "Check if any NetworkPolicies exist in the namespace",
    "Look at what traffic the NetworkPolicy allows",
    "Consider where Prometheus is running relative to the policy",
  ],
  rootCauseOptions: [
    "The service doesn't expose port 9090",
    "DNS cannot resolve the service from another namespace",
    "The NetworkPolicy only allows ingress from 'app: frontend' pods, blocking Prometheus in another namespace",
    "Prometheus is using the wrong scrape endpoint",
  ],
  correctRootCauseIndex: 2,
};

export default networkPolicyBlock;
