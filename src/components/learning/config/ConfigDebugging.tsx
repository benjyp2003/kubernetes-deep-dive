import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";

const ConfigDebugging = () => (
  <div className="space-y-8">
    <div className="k8s-card">
      <h3 className="font-display font-semibold text-lg text-foreground mb-4">🔍 Real Debugging Scenarios</h3>
      <div className="space-y-6">
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 1: Pod Not Seeing Updated Config</h4>
          <p className="text-sm text-muted-foreground mb-2"><strong>Symptom:</strong> You updated a ConfigMap but the pod still shows old values.</p>
          <div className="text-sm space-y-2">
            <p><strong>Debug steps:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check if config is used as <strong>env var</strong> — requires pod restart, env vars are immutable</li>
              <li>Check if using <strong>subPath mount</strong> — subPath mounts never receive updates</li>
              <li>Check kubelet sync frequency — default delay is 60-120 seconds</li>
              <li>Check if ConfigMap is <strong>immutable: true</strong> — won't accept updates</li>
              <li>Verify the app re-reads files — the filesystem updates but the app must notice</li>
            </ul>
          </div>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 2: Secret Key Missing</h4>
          <p className="text-sm text-muted-foreground mb-2"><strong>Symptom:</strong> Pod fails to start with <code className="font-mono text-xs">CreateContainerConfigError</code></p>
          <p className="text-sm"><strong>Cause:</strong> Pod references a Secret key that doesn't exist. Kubernetes blocks container creation.</p>
          <p className="text-sm mt-1"><strong>Fix:</strong> Check <code className="font-mono text-xs">kubectl describe pod</code> for the exact error. Verify the Secret exists and has the expected key with <code className="font-mono text-xs">kubectl get secret &lt;name&gt; -o jsonpath='&#123;.data&#125;'</code></p>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 3: Wrong Mount Path</h4>
          <p className="text-sm text-muted-foreground mb-2"><strong>Symptom:</strong> Application can't find config file</p>
          <p className="text-sm"><strong>Cause:</strong> Volume mounted to wrong path, or ConfigMap key name doesn't match expected filename.</p>
          <p className="text-sm mt-1"><strong>Debug:</strong> Exec into the pod and check: <code className="font-mono text-xs">kubectl exec -it pod -- ls -la /etc/config/</code></p>
        </div>

        <div className="border border-border rounded-lg p-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">Scenario 4: Permission Denied Reading Secret File</h4>
          <p className="text-sm text-muted-foreground mb-2"><strong>Symptom:</strong> Application crashes reading mounted Secret</p>
          <p className="text-sm"><strong>Cause:</strong> Secret volume has restrictive permissions (defaultMode: 0400) but container runs as different user.</p>
          <p className="text-sm mt-1"><strong>Fix:</strong> Set <code className="font-mono text-xs">defaultMode</code> appropriately, or ensure <code className="font-mono text-xs">fsGroup</code> in SecurityContext matches.</p>
        </div>
      </div>
    </div>

    <CodeBlock
      title="Essential Debug Commands for Config Issues"
      language="bash"
      code={`# Check if ConfigMap/Secret exists and view data
kubectl get configmap app-config -o yaml
kubectl get secret app-secrets -o jsonpath='{.data}' | jq

# Decode a base64 secret value
kubectl get secret app-secrets -o jsonpath='{.data.DATABASE_PASSWORD}' | base64 -d

# Check pod events for config errors
kubectl describe pod my-app | grep -A5 "Events"

# Check what env vars are set in a running container
kubectl exec my-app -- env | grep DB_

# Check mounted config files
kubectl exec my-app -- ls -la /etc/config/
kubectl exec my-app -- cat /etc/config/app.properties

# Check if ConfigMap is immutable
kubectl get configmap app-config -o jsonpath='{.immutable}'

# Watch for ConfigMap changes in real time
kubectl get configmap app-config -w`}
    />

    <CommonMistakes
      mistakes={[
        { mistake: "Putting everything in the default namespace", correction: "Organize by team, environment, or application. It's impossible to manage RBAC and quotas effectively in a single namespace." },
        { mistake: "Not setting resource requests/limits", correction: "Without limits, one pod can consume all node resources. Without requests, the scheduler can't make good placement decisions. LimitRanges enforce defaults." },
        { mistake: "Expecting env vars to auto-update", correction: "Environment variables are set ONCE at container start. They NEVER update. Use volume mounts for config that needs to change without restarts." },
        { mistake: "Using subPath and expecting updates", correction: "subPath volume mounts create a direct bind mount that bypasses kubelet's atomic symlink mechanism. The file will never be updated." },
      ]}
    />
  </div>
);

export default ConfigDebugging;
