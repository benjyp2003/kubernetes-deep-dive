import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import LayeredExplanation from "@/components/learning/LayeredExplanation";
import FlowDiagram from "@/components/learning/FlowDiagram";
import AnalogyCallout from "@/components/learning/AnalogyCallout";
import ComparisonTable from "@/components/learning/ComparisonTable";
import CommonMistakes from "@/components/learning/CommonMistakes";
import CodeBlock from "@/components/learning/CodeBlock";
import QuizCard from "@/components/learning/QuizCard";

const Storage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="k8s-section-hero">
          <span className="k8s-badge-intermediate mb-3 inline-block">Intermediate</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Storage in Kubernetes</h1>
          <p className="mt-3 text-sidebar-foreground/70 max-w-lg">
            Understand how data survives pod restarts, the relationship between PVs and PVCs, and how to persist data in a container world.
          </p>
        </motion.div>

        <LayeredExplanation
          title="Why Containers Need Storage"
          simple={
            <p>By default, anything a container writes to disk disappears when the container restarts. It's like writing notes on a whiteboard that gets erased every night. Kubernetes volumes let you save data to a permanent place.</p>
          }
          technical={
            <div className="space-y-3">
              <p>Container filesystems are <strong>ephemeral</strong> — they use a copy-on-write layer that's lost when the container stops. Kubernetes <strong>Volumes</strong> provide a way to mount external storage into pods, allowing data to persist beyond container lifecycles.</p>
              <p>Volume types range from node-local (emptyDir, hostPath) to network-attached (NFS, cloud disks) to Kubernetes-managed (PersistentVolumes).</p>
            </div>
          }
          deep={
            <div className="space-y-3">
              <p>The Container Storage Interface (CSI) is the standard plugin system for storage in Kubernetes. CSI drivers run as pods in the cluster and handle provisioning, attaching, and mounting volumes. The kubelet coordinates with CSI drivers through gRPC calls during pod startup.</p>
              <p>Volume lifecycle: Provisioning → Attaching (to node) → Mounting (into pod) → Using → Unmounting → Detaching → Deleting/Retaining.</p>
            </div>
          }
        />

        <AnalogyCallout
          analogy="PV and PVC are like parking spots and parking permits"
          explanation="A PersistentVolume (PV) is an actual parking spot in the lot — it exists whether or not anyone uses it. A PersistentVolumeClaim (PVC) is a parking permit — you request a spot of a certain size, and the system assigns you one that fits. You don't choose the exact spot; you just say what you need."
        />

        <ComparisonTable
          title="Volume Types Comparison"
          headers={["Volume Type", "Persists?", "Use Case"]}
          rows={[
            { label: "emptyDir", values: ["No (pod lifetime only)", "Temp scratch space, shared between containers in a pod"] },
            { label: "hostPath", values: ["Yes (node-local)", "Development only — data tied to specific node. Dangerous in production"] },
            { label: "configMap/secret", values: ["No (read from API)", "Injecting configuration files into containers"] },
            { label: "PersistentVolume", values: ["Yes (cluster-scoped)", "Databases, file uploads, any persistent data"] },
            { label: "CSI volumes", values: ["Yes", "Cloud provider disks (EBS, GCE PD, Azure Disk)"] },
          ]}
        />

        <FlowDiagram
          title="Dynamic Provisioning: PVC → StorageClass → PV"
          steps={[
            { label: "Developer creates PVC", description: "A PersistentVolumeClaim requests storage: '10Gi of fast SSD storage'." },
            { label: "StorageClass picks provisioner", description: "The PVC references a StorageClass that defines which CSI driver and parameters to use." },
            { label: "Provisioner creates actual storage", description: "The CSI driver creates a real disk (e.g., AWS EBS volume, GCE persistent disk)." },
            { label: "PV is automatically created", description: "Kubernetes creates a PersistentVolume object representing the newly provisioned disk." },
            { label: "PVC binds to PV", description: "The PVC and PV are bound together. The PVC now references a specific piece of storage." },
            { label: "Pod mounts the PVC", description: "When a pod references the PVC, kubelet mounts the volume into the container at the specified path." },
          ]}
        />

        <CodeBlock
          title="PVC + Pod YAML"
          language="yaml"
          code={`# PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: database-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
---
# Pod using the PVC
apiVersion: v1
kind: Pod
metadata:
  name: postgres
spec:
  containers:
    - name: db
      image: postgres:15
      volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: database-storage`}
        />

        <div className="k8s-card">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">Access Modes</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { mode: "ReadWriteOnce (RWO)", desc: "Mounted read-write by a single node. Most common for databases." },
              { mode: "ReadOnlyMany (ROX)", desc: "Mounted read-only by many nodes. Good for shared configs." },
              { mode: "ReadWriteMany (RWX)", desc: "Mounted read-write by many nodes. Requires NFS or similar." },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-4 bg-background/50">
                <code className="text-primary font-mono text-xs font-bold">{item.mode}</code>
                <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="k8s-card">
          <h3 className="font-display font-semibold text-lg text-foreground mb-4">Reclaim Policies</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { policy: "Retain", desc: "PV is kept after PVC deletion. Admin must manually clean up. Safest for important data." },
              { policy: "Delete", desc: "PV and underlying storage are deleted when PVC is removed. Default for dynamic provisioning." },
              { policy: "Recycle (deprecated)", desc: "Basic scrub (rm -rf) and re-use. Deprecated in favor of dynamic provisioning." },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-4 bg-background/50">
                <code className="text-primary font-mono text-xs font-bold">{item.policy}</code>
                <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <CommonMistakes
          mistakes={[
            { mistake: "Using hostPath in production", correction: "hostPath ties data to a specific node. If the pod moves, data is lost. Use PersistentVolumes with network storage." },
            { mistake: "Forgetting that emptyDir dies with the pod", correction: "emptyDir is only useful for scratch space within a pod's lifetime. Not for persistent data." },
            { mistake: "PVC stuck in Pending", correction: "Usually means no PV matches or no StorageClass provisioner is configured. Check storage class and capacity." },
            { mistake: "Using RWX when RWO is sufficient", correction: "RWX requires special storage backends (NFS, CephFS). Most databases only need RWO." },
          ]}
        />

        <QuizCard
          title="Storage Quiz"
          questions={[
            {
              question: "What happens to data in an emptyDir volume when the pod is deleted?",
              options: ["It persists on the node", "It's lost permanently", "It moves to a PV", "It's backed up automatically"],
              correctIndex: 1,
              explanation: "emptyDir exists only for the lifetime of the pod. When the pod is deleted, the data is gone."
            },
            {
              question: "What is the purpose of a StorageClass?",
              options: ["To classify storage by color", "To define dynamic provisioning parameters", "To encrypt volumes", "To schedule storage pods"],
              correctIndex: 1,
              explanation: "StorageClass defines how PVs are dynamically provisioned — which provisioner to use, what parameters (SSD vs HDD, replication), and reclaim policy."
            },
          ]}
        />
      </div>
    </Layout>
  );
};

export default Storage;
