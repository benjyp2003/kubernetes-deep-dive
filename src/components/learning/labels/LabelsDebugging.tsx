const LabelsDebugging = () => (
  <div className="space-y-6">
    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔍 Debugging Labels, Selectors & Taints</h3>
      <div className="space-y-4">
        {[
          {
            scenario: "Service has no endpoints",
            symptoms: "curl to Service ClusterIP returns 'Connection refused'. kubectl get endpoints shows <none>.",
            commands: [
              "kubectl get endpoints <svc-name>",
              "kubectl describe svc <svc-name>  # check Selector field",
              "kubectl get pods --show-labels  # check pod labels",
              "kubectl get pods -l <selector>  # test selector directly",
            ],
            rootCause: "Service selector doesn't match any pod labels. Common after renaming labels or copy-paste errors.",
            fix: "Update service selector OR pod template labels to match.",
          },
          {
            scenario: "Pod stuck in Pending — taint related",
            symptoms: "Pod stays Pending. Events show '0/N nodes are available: N node(s) had untolerated taint'.",
            commands: [
              "kubectl describe pod <name>  # check Events section",
              "kubectl get nodes -o json | jq '.items[].spec.taints'",
              "kubectl describe node <name>  # check Taints field",
            ],
            rootCause: "All nodes have taints that the pod doesn't tolerate. No valid scheduling target.",
            fix: "Add toleration to pod spec, or remove taint from a node.",
          },
          {
            scenario: "Deployment not managing pods",
            symptoms: "Pods exist but Deployment shows 0 ready. Scaling has no effect.",
            commands: [
              "kubectl get deployment <name> -o yaml  # check spec.selector",
              "kubectl get rs --show-labels  # check ReplicaSet labels",
              "kubectl get pods --show-labels  # compare with selector",
            ],
            rootCause: "Deployment selector and pod template labels diverged (usually from manual pod edits).",
            fix: "Ensure pod template labels match deployment selector exactly.",
          },
          {
            scenario: "NetworkPolicy not blocking traffic",
            symptoms: "Expected traffic to be blocked but pods can still communicate.",
            commands: [
              "kubectl get netpol -o yaml  # check podSelector",
              "kubectl get pods --show-labels  # verify target pods match",
              "kubectl get pods -n <ns> -l <selector>  # test selector",
            ],
            rootCause: "NetworkPolicy podSelector doesn't match the intended pods. Or the policy namespace is wrong.",
            fix: "Fix the podSelector labels to match target pods.",
          },
        ].map((item, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3">
            <p className="font-semibold text-sm text-foreground">{item.scenario}</p>
            <p className="text-xs text-foreground/60">{item.symptoms}</p>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-primary">Debug commands:</p>
              {item.commands.map((cmd, j) => (
                <p key={j} className="font-mono text-xs text-foreground/70 bg-muted/30 px-2 py-1 rounded">{cmd}</p>
              ))}
            </div>
            <p className="text-xs"><span className="font-semibold text-destructive">Root cause:</span> {item.rootCause}</p>
            <p className="text-xs"><span className="font-semibold text-primary">Fix:</span> {item.fix}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="k8s-card bg-primary/5 border-primary/20">
      <h3 className="font-display font-semibold text-lg text-foreground mb-3">🧪 Practice in Troubleshooting Lab</h3>
      <p className="text-sm text-foreground/80 mb-3">Put these debugging skills to the test with interactive scenarios:</p>
      <div className="space-y-2">
        {[
          { title: "Service Selector Mismatch", id: "selector-mismatch", desc: "Service can't find pods — investigate why endpoints are empty" },
          { title: "Pending Pod (Taint)", id: "pending-pod", desc: "Pod won't schedule — discover the untolerated taint" },
          { title: "Network Policy Block", id: "network-policy-block", desc: "Traffic blocked unexpectedly — trace the label selectors" },
        ].map((lab) => (
          <a key={lab.id} href={`/troubleshooting-lab/${lab.id}`} className="block bg-background rounded-lg p-3 border border-border hover:border-primary/50 transition-colors">
            <p className="text-sm font-semibold text-foreground">{lab.title}</p>
            <p className="text-xs text-foreground/60">{lab.desc}</p>
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default LabelsDebugging;
