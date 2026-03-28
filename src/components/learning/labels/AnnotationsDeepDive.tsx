import CodeBlock from "@/components/learning/CodeBlock";
import LayeredExplanation from "@/components/learning/LayeredExplanation";

const AnnotationsDeepDive = () => (
  <div className="space-y-6">
    <LayeredExplanation
      title="Annotations — The Controller Communication Channel"
      simple={<p>Annotations are notes attached to Kubernetes objects. Unlike labels, they aren't used for finding objects — they're used to store information that tools and controllers read to change behavior.</p>}
      technical={
        <div className="space-y-3">
          <p>Annotations serve as a <strong>metadata communication channel</strong> between users, tools, and controllers. They can store much larger data than labels (up to 256KB total) and support any characters.</p>
          <p>Key difference from labels: annotations are <strong>NOT indexed</strong> by the API Server. You cannot filter or select objects by annotations — they're read directly from the object's metadata.</p>
        </div>
      }
      deep={
        <div className="space-y-3">
          <p>Internally, annotations are stored in the same <code className="text-primary font-mono text-xs bg-primary/10 px-1 rounded">metadata.annotations</code> map in etcd. Controllers that care about annotations set up <strong>informers</strong> that watch for object changes, then read annotations from the cached object.</p>
          <p>This means annotations trigger the same watch events as any metadata change — a controller watching Ingress objects will be notified when an annotation changes, even though it can't filter by annotation in its list/watch query.</p>
          <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs space-y-1">
            <p>1. User sets annotation on Ingress object</p>
            <p>2. API Server stores updated object → etcd</p>
            <p>3. Watch event sent to all Ingress watchers</p>
            <p>4. Ingress controller receives event, reads annotations</p>
            <p>5. Controller reconfigures nginx/HAProxy/envoy accordingly</p>
          </div>
        </div>
      }
    />

    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔧 Annotations Used by Kubernetes Internally</h3>
      <div className="space-y-3">
        {[
          { annotation: "kubectl.kubernetes.io/last-applied-configuration", usedBy: "kubectl apply", purpose: "Stores the last applied YAML so kubectl can compute three-way merge diffs. This is how kubectl knows what you changed vs what the server changed." },
          { annotation: "deployment.kubernetes.io/revision", usedBy: "Deployment controller", purpose: "Tracks ReplicaSet revision numbers for rollback support. Each new rollout increments this number." },
          { annotation: "kubernetes.io/change-cause", usedBy: "kubectl rollout history", purpose: "Records why a rollout happened. Set via --record flag (deprecated) or manually." },
          { annotation: "nginx.ingress.kubernetes.io/rewrite-target", usedBy: "NGINX Ingress controller", purpose: "Tells the ingress controller to rewrite the URL path before forwarding to the backend. This is pure controller-specific behavior — Kubernetes core ignores it." },
          { annotation: "prometheus.io/scrape: 'true'", usedBy: "Prometheus operator", purpose: "Tells Prometheus to scrape metrics from this Pod/Service. The Prometheus operator watches for this annotation." },
        ].map((item, i) => (
          <div key={i} className="bg-muted/30 rounded-lg p-3">
            <p className="font-mono text-xs text-primary break-all">{item.annotation}</p>
            <p className="text-xs text-foreground/60 mt-1">Used by: <strong>{item.usedBy}</strong></p>
            <p className="text-xs text-foreground/80 mt-1">{item.purpose}</p>
          </div>
        ))}
      </div>
    </div>

    <CodeBlock
      title="kubectl apply — Three-Way Merge via Annotations"
      language="yaml"
      code={`# When you run: kubectl apply -f deployment.yaml
# kubectl does this internally:

# 1. Reads last-applied-configuration annotation from live object
# 2. Compares: your file vs last-applied vs live object
# 3. Computes a strategic merge patch
# 4. Sends PATCH request to API Server

# The annotation stores your ENTIRE last-applied manifest:
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"apps/v1","kind":"Deployment",...}

# This is why 'kubectl apply' and 'kubectl create' behave differently
# 'create' doesn't set this annotation → future 'apply' may behave unexpectedly`}
    />

    <div className="k8s-card border-destructive/20">
      <h3 className="font-display font-semibold text-lg text-foreground mb-3">🐛 Debugging: When Annotations Go Wrong</h3>
      <div className="space-y-3 text-sm text-foreground/80">
        {[
          { problem: "Ingress not routing correctly", cause: "Missing or typo in ingress controller annotation. The controller silently ignores unknown annotations.", debug: "kubectl describe ingress <name> — check annotations match controller docs exactly" },
          { problem: "kubectl apply shows unexpected diffs", cause: "Corrupted or missing last-applied-configuration annotation", debug: "kubectl get <resource> -o jsonpath='{.metadata.annotations}' — check if last-applied is present and valid" },
          { problem: "Operator not reacting to changes", cause: "Operator expects specific annotation format (e.g., 'true' vs true)", debug: "Check operator logs + docs for exact annotation format requirements" },
        ].map((item, i) => (
          <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
            <p className="font-semibold text-xs text-destructive">{item.problem}</p>
            <p className="text-xs text-foreground/60 mt-1">Cause: {item.cause}</p>
            <p className="text-xs text-foreground/80 mt-1">Debug: <code className="font-mono text-primary bg-primary/10 px-1 rounded">{item.debug}</code></p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AnnotationsDeepDive;
