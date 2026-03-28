import CodeBlock from "@/components/learning/CodeBlock";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";

const TaintsDeepDive = () => (
  <div className="space-y-6">
    <LayeredExplanation
      title="Taints & Tolerations — Scheduling Enforcement"
      simple={<p>Taints are "keep out" signs on nodes. Only pods that explicitly tolerate the taint can be scheduled there. This is how Kubernetes keeps regular workloads off special nodes (like GPU nodes or control-plane nodes).</p>}
      technical={
        <div className="space-y-3">
          <p>A taint has three parts: <code className="text-primary font-mono text-xs bg-primary/10 px-1 rounded">key=value:effect</code></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-semibold text-xs text-primary">NoSchedule</p>
              <p className="text-xs mt-1">New pods won't be scheduled here. Existing pods stay.</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-semibold text-xs text-primary">PreferNoSchedule</p>
              <p className="text-xs mt-1">Scheduler tries to avoid this node but will use it if no alternatives exist.</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-semibold text-xs text-primary">NoExecute</p>
              <p className="text-xs mt-1">Evicts existing pods that don't tolerate it. New pods also blocked.</p>
            </div>
          </div>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p>During scheduling, the <strong>TaintToleration plugin</strong> runs in the <strong>Filter phase</strong>:</p>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1">
            <p>1. Scheduler gets list of all nodes</p>
            <p>2. For each node, checks all taints</p>
            <p>3. For each taint, checks if pod has matching toleration</p>
            <p>4. Match requires: same key, same effect, and (value matches OR operator=Exists)</p>
            <p>5. If ANY taint is unmatched → node is filtered OUT</p>
            <p>6. Only nodes where ALL taints are tolerated pass the filter</p>
          </div>
          <p className="text-xs text-muted-foreground">For NoExecute taints, the <strong>node lifecycle controller</strong> also watches for taint changes on nodes and evicts pods that don't tolerate newly added taints. The <code>tolerationSeconds</code> field controls the grace period before eviction.</p>
        </div>
      }
    />

    <FlowDiagram
      title="Scheduler Taint Evaluation Flow"
      steps={[
        { label: "Pod Created", description: "spec.tolerations defined", icon: "🫛" },
        { label: "Scheduler Queue", description: "Pod enters scheduling queue", icon: "📋" },
        { label: "Filter: Taints", description: "Check each node's taints vs pod tolerations", icon: "🚫" },
        { label: "Nodes Filtered", description: "Untolerated nodes removed from candidates", icon: "🖥️" },
        { label: "Score Remaining", description: "Scoring phase on surviving nodes", icon: "🎯" },
        { label: "Bind", description: "Pod scheduled to highest-scoring node", icon: "✅" },
      ]}
    />

    <CodeBlock
      title="Taints & Tolerations — Full Example"
      language="yaml"
      code={`# Node taint (applied by admin):
# kubectl taint nodes gpu-node-1 gpu=true:NoSchedule

# Pod that CAN run on gpu-node-1:
apiVersion: v1
kind: Pod
metadata:
  name: ml-training
spec:
  tolerations:
    - key: "gpu"
      operator: "Equal"
      value: "true"
      effect: "NoSchedule"
  containers:
    - name: trainer
      image: ml-framework:latest
---
# Pod that CANNOT run on gpu-node-1 (no toleration):
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
    - name: nginx
      image: nginx:1.25
# This pod will NEVER be scheduled on gpu-node-1`}
    />

    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔧 Real System Usage of Taints</h3>
      <div className="space-y-3">
        {[
          { usage: "Control-plane isolation", taint: "node-role.kubernetes.io/control-plane:NoSchedule", explanation: "Added automatically by kubeadm. Prevents user workloads from running on control-plane nodes. Only system pods (with tolerations) run there." },
          { usage: "Node not ready", taint: "node.kubernetes.io/not-ready:NoExecute", explanation: "Added automatically by node lifecycle controller when a node stops responding. Evicts pods after tolerationSeconds (default 300s)." },
          { usage: "GPU node dedication", taint: "nvidia.com/gpu=true:NoSchedule", explanation: "Admin-applied to ensure only GPU workloads use expensive GPU nodes. Non-GPU pods can't be scheduled there." },
          { usage: "Maintenance mode", taint: "maintenance=true:NoExecute", explanation: "Admin drains node by adding NoExecute taint. All non-tolerating pods are evicted gracefully." },
        ].map((item, i) => (
          <div key={i} className="bg-muted/30 rounded-lg p-3">
            <p className="font-semibold text-xs text-foreground">{item.usage}</p>
            <p className="font-mono text-xs text-primary mt-1">{item.taint}</p>
            <p className="text-xs text-foreground/70 mt-1">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="k8s-card border-destructive/20">
      <h3 className="font-display font-semibold text-lg text-foreground mb-3">🐛 NoExecute & Pod Eviction — Deep Behavior</h3>
      <div className="text-sm text-foreground/80 space-y-3">
        <p>When a NoExecute taint is added to a node:</p>
        <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1">
          <p>1. Node controller detects new taint via watch</p>
          <p>2. Iterates all pods on that node</p>
          <p>3. For each pod: checks if it tolerates the new taint</p>
          <p>4. If no toleration → pod evicted immediately</p>
          <p>5. If toleration has <code>tolerationSeconds: 300</code> → pod evicted after 300s</p>
          <p>6. If toleration has no tolerationSeconds → pod stays indefinitely</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-xs"><strong>Real-world example:</strong> When a node becomes unreachable, Kubernetes automatically adds <code>node.kubernetes.io/unreachable:NoExecute</code>. The default toleration on all pods gives a 300-second grace period. After 5 minutes, pods are evicted and rescheduled elsewhere.</p>
        </div>
      </div>
    </div>
  </div>
);

export default TaintsDeepDive;
