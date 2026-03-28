import CodeBlock from "@/components/learning/CodeBlock";
import LayeredExplanation from "@/components/learning/LayeredExplanation";

const SelectorsDeepDive = () => (
  <div className="space-y-6">
    <LayeredExplanation
      title="Selectors — The Relationship Engine"
      simple={<p>Selectors are how Kubernetes objects find each other. A Service uses a selector to find Pods. A Deployment uses a selector to manage Pods. Without selectors, objects would be isolated islands.</p>}
      technical={
        <div className="space-y-3">
          <p>Selectors define <strong>dynamic, continuously-evaluated relationships</strong> between objects. There are two types:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-semibold text-xs text-primary mb-1">Equality-based</p>
              <p className="text-xs font-mono">app = web, tier != backend</p>
              <p className="text-xs mt-1">Used by: Services, ReplicationControllers</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-semibold text-xs text-primary mb-1">Set-based</p>
              <p className="text-xs font-mono">app in (web, api), tier notin (test), partition</p>
              <p className="text-xs mt-1">Used by: Deployments, ReplicaSets, Jobs, NetworkPolicies</p>
            </div>
          </div>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p>Internally, the API Server maintains a <strong>label index</strong> for efficient selector evaluation. When a controller lists objects with a selector, the API Server doesn't scan all objects — it uses the index.</p>
          <p>Controllers use <strong>informers</strong> (local caches + watch streams) to track objects matching selectors. When a label changes:</p>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1">
            <p>1. API Server sends watch event to all informers</p>
            <p>2. Each controller re-evaluates if the object still matches its selector</p>
            <p>3. If match status changed → controller reconciles</p>
            <p>4. This happens within milliseconds of the label change</p>
          </div>
          <p className="text-xs text-muted-foreground">This is why Kubernetes feels "reactive" — controllers continuously reconcile based on selector matches, not explicit references.</p>
        </div>
      }
    />

    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">Selector Matching Rules</h3>
      <div className="space-y-3 text-sm text-foreground/80">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-foreground">Expression</th>
                <th className="text-left py-2 pr-4 text-foreground">Meaning</th>
                <th className="text-left py-2 text-foreground">Matches</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                { expr: "app=web", meaning: "Equality", matches: "Pods with app=web exactly" },
                { expr: "app!=web", meaning: "Inequality", matches: "Pods WITHOUT app=web" },
                { expr: "app in (web,api)", meaning: "Set membership", matches: "Pods with app=web OR app=api" },
                { expr: "app notin (test)", meaning: "Set exclusion", matches: "Pods where app is NOT test" },
                { expr: "partition", meaning: "Existence", matches: "Pods that HAVE a 'partition' label (any value)" },
                { expr: "!partition", meaning: "Non-existence", matches: "Pods that do NOT have 'partition' label" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-primary">{row.expr}</td>
                  <td className="py-2 pr-4 text-foreground/70">{row.meaning}</td>
                  <td className="py-2 text-foreground/70">{row.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CodeBlock
      title="matchExpressions — Advanced Selector Syntax"
      language="yaml"
      code={`# Deployment using set-based selectors
apiVersion: apps/v1
kind: Deployment
spec:
  selector:
    matchLabels:
      app: web                    # AND
    matchExpressions:
      - key: environment
        operator: In
        values: [production, staging]   # environment IN (production, staging)
      - key: version
        operator: NotIn
        values: [canary]                # AND version NOT IN (canary)
      - key: team
        operator: Exists                # AND 'team' label exists
  # All conditions are ANDed together
  # Pod must match ALL of them to be selected`}
    />

    <div className="k8s-card border-destructive/20">
      <h3 className="font-display font-semibold text-lg text-foreground mb-3">⚠️ Immutable Selectors</h3>
      <div className="text-sm text-foreground/80 space-y-2">
        <p>Deployment and ReplicaSet selectors are <strong>immutable after creation</strong>. You cannot change <code className="text-primary font-mono text-xs bg-primary/10 px-1 rounded">spec.selector</code> on an existing Deployment.</p>
        <p className="text-xs text-muted-foreground">This is by design — changing a selector would orphan existing Pods and create chaos. To change selectors, you must delete and recreate the Deployment.</p>
      </div>
    </div>
  </div>
);

export default SelectorsDeepDive;
