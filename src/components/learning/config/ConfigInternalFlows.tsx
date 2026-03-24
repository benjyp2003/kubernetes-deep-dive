import FlowDiagram from "@/components/learning/FlowDiagram";
import LayeredExplanation from "@/components/learning/LayeredExplanation";

const ConfigInternalFlows = () => (
  <div className="space-y-8">
    <FlowDiagram
      title="Internal Flow: Creating a ConfigMap (kubectl apply)"
      steps={[
        { label: "kubectl sends request to API Server", description: "kubectl serializes the ConfigMap YAML to JSON and sends an HTTP POST/PUT to /api/v1/namespaces/{ns}/configmaps. Authentication (certificate/token) is verified." },
        { label: "API Server validates the object", description: "Admission controllers run (mutating then validating). The object is validated against the ConfigMap schema. Resource quotas are checked." },
        { label: "Stored in etcd", description: "The ConfigMap is persisted in etcd under the key /registry/configmaps/{namespace}/{name}. etcd assigns a resourceVersion (monotonically increasing integer)." },
        { label: "Watch events fire", description: "Any component watching ConfigMaps (kubelet, controllers) receives a WATCH event from the API server with the new/updated object and its resourceVersion." },
        { label: "kubelet receives update", description: "If any pod on this node references this ConfigMap, kubelet's configmap manager detects the change and schedules a volume update." },
      ]}
    />

    <LayeredExplanation
      title="How ConfigMaps Reach Containers — Internal Mechanics"
      simple={
        <p>When a pod uses a ConfigMap, Kubernetes injects the data into the container either as environment variables (set once at startup) or as files (updated periodically).</p>
      }
      technical={
        <div className="space-y-4">
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-2">Path A: Environment Variables</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
              <li>Pod spec references ConfigMap key via <code className="font-mono text-xs">configMapKeyRef</code> or <code className="font-mono text-xs">envFrom</code></li>
              <li>kubelet resolves the ConfigMap from API server <strong>before</strong> starting the container</li>
              <li>Values are passed to the container runtime (containerd/CRI-O) as part of the OCI container spec</li>
              <li>The runtime sets them as process environment variables</li>
              <li><strong>These never change</strong> — they're baked into the process at start time</li>
            </ol>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-2">Path B: Volume Mounts</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
              <li>kubelet creates a <code className="font-mono text-xs">tmpfs</code> volume on the node</li>
              <li>Fetches ConfigMap data from API server and writes files to the tmpfs</li>
              <li>Uses atomic symlink swap: data is written to a timestamped directory, then <code className="font-mono text-xs">..data</code> symlink is atomically updated</li>
              <li>Container sees the files at the mountPath</li>
              <li>kubelet's sync loop checks for changes every <code className="font-mono text-xs">--sync-frequency</code> (default 60s) + ConfigMap cache TTL</li>
            </ol>
          </div>
        </div>
      }
      deep={
        <div className="space-y-4">
          <h4 className="font-display font-semibold text-sm text-foreground mb-2">kubelet ConfigMap Manager — Internal Details</h4>
          <div className="space-y-2 text-sm">
            <p>kubelet has a <strong>configMapManager</strong> that supports two modes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Watch mode</strong> (default in newer K8s) — opens a WATCH stream to API server for referenced ConfigMaps. Near-real-time updates.</li>
              <li><strong>Cache/TTL mode</strong> — caches ConfigMap data with a TTL. Re-fetches from API server when cache expires.</li>
              <li><strong>Get mode</strong> — fetches from API server on every sync loop. Most accurate but highest API server load.</li>
            </ul>
            <p className="mt-3"><strong>Atomic symlink mechanism:</strong></p>
            <div className="font-mono text-xs bg-muted p-3 rounded-lg mt-2 space-y-1">
              <p>/etc/config/</p>
              <p>├── ..data → ..2024_01_15_10_30_00.123456789</p>
              <p>├── ..2024_01_15_10_30_00.123456789/</p>
              <p>│   ├── DATABASE_HOST</p>
              <p>│   └── app.properties</p>
              <p>├── DATABASE_HOST → ..data/DATABASE_HOST</p>
              <p>└── app.properties → ..data/app.properties</p>
            </div>
            <p className="mt-2">When data changes, kubelet writes a <strong>new timestamped directory</strong>, then atomically swaps the <code className="font-mono text-xs">..data</code> symlink. Applications reading these files see a consistent snapshot.</p>
            <p className="mt-2"><strong>⚠️ subPath mounts</strong> bypass this mechanism — they're a direct bind mount, so they <strong>never receive updates</strong>.</p>
          </div>
        </div>
      }
    />

    <FlowDiagram
      title="Volume Mount Update Flow (When ConfigMap Changes)"
      steps={[
        { label: "ConfigMap updated in etcd", description: "User runs kubectl apply with new data. API server stores the new version in etcd with a new resourceVersion." },
        { label: "kubelet detects change", description: "Via WATCH stream or cache TTL expiry, kubelet's configMapManager detects the ConfigMap has a new resourceVersion." },
        { label: "kubelet writes new data", description: "Creates a new timestamped directory on the node with the updated file contents." },
        { label: "Atomic symlink swap", description: "The ..data symlink is atomically updated to point to the new directory. Old directory is cleaned up." },
        { label: "Application sees new files", description: "Next time the application reads the mounted files, it gets the new data. The app must re-read — there's no notification to the process." },
      ]}
    />
  </div>
);

export default ConfigInternalFlows;
