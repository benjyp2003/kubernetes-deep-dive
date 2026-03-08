import type { Scenario } from "./types";

const pvBinding: Scenario = {
  id: "pv-binding",
  title: "Persistent Volume Binding",
  subtitle: "How a PVC binds to a PV and gets mounted into a pod",
  icon: "💾",
  category: "Storage",
  relatedPage: "/storage",
  nodes: [
    { id: "pod", label: "Pod", type: "pod", icon: "🫛", description: "Pod requesting persistent storage via a volume mount", position: { x: 50, y: 200 } },
    { id: "pvc", label: "PVC", type: "storage", icon: "📝", description: "PersistentVolumeClaim — a request for storage (size, access mode)", position: { x: 250, y: 200 } },
    { id: "pv-ctrl", label: "PV Controller", type: "controller", icon: "⚙️", description: "Watches PVCs and matches or provisions PVs", position: { x: 250, y: 60 } },
    { id: "sc", label: "StorageClass", type: "storage", icon: "🏷️", description: "Defines the provisioner and parameters for dynamic provisioning", position: { x: 450, y: 60 } },
    { id: "provisioner", label: "Provisioner", type: "storage", icon: "🔧", description: "External provisioner (e.g., AWS EBS, GCE PD) that creates actual storage", position: { x: 650, y: 60 } },
    { id: "pv", label: "PV", type: "storage", icon: "💾", description: "PersistentVolume — the actual storage resource in the cluster", position: { x: 450, y: 200 } },
    { id: "kubelet", label: "kubelet", type: "worker", icon: "🖥️", description: "Mounts the volume into the pod's filesystem", position: { x: 650, y: 200 } },
    { id: "disk", label: "Actual Disk", type: "storage", icon: "🗄️", description: "Physical/cloud storage (EBS volume, NFS share, etc.)", position: { x: 650, y: 340 } },
  ],
  edges: [
    { id: "e1", source: "pod", target: "pvc", label: "references" },
    { id: "e2", source: "pv-ctrl", target: "pvc", label: "watches" },
    { id: "e3", source: "pv-ctrl", target: "sc", label: "reads StorageClass" },
    { id: "e4", source: "sc", target: "provisioner", label: "triggers provisioner" },
    { id: "e5", source: "provisioner", target: "pv", label: "creates PV" },
    { id: "e6", source: "pvc", target: "pv", label: "bound" },
    { id: "e7", source: "kubelet", target: "pv", label: "mount volume" },
    { id: "e8", source: "provisioner", target: "disk", label: "creates disk" },
    { id: "e9", source: "pv", target: "disk", label: "backed by" },
  ],
  steps: [
    { title: "Pod declares PVC", description: "The pod spec references a PersistentVolumeClaim by name in its volumes section. The PVC describes the desired storage (e.g., 10Gi, ReadWriteOnce).", activeNodes: ["pod", "pvc"], activeEdges: ["e1"] },
    { title: "PV controller detects PVC", description: "The PV controller watches for new PVCs. It checks if an existing PV matches the request (capacity, access mode, StorageClass).", activeNodes: ["pv-ctrl", "pvc"], activeEdges: ["e2"] },
    { title: "Dynamic provisioning triggered", description: "No matching PV exists. The PV controller reads the StorageClass to determine which provisioner to use and with what parameters.", activeNodes: ["pv-ctrl", "sc"], activeEdges: ["e3"] },
    { title: "Provisioner creates storage", description: "The external provisioner (e.g., AWS EBS CSI driver) creates an actual disk/volume in the cloud infrastructure and a corresponding PV object.", activeNodes: ["sc", "provisioner", "disk"], activeEdges: ["e4", "e8"] },
    { title: "PV created and bound", description: "The provisioner creates a PV object. The PV and PVC reference each other — both show status 'Bound'.", activeNodes: ["provisioner", "pv", "pvc"], activeEdges: ["e5", "e6"] },
    { title: "kubelet mounts volume", description: "When the pod is scheduled, the kubelet mounts the PV's backing storage into the pod's container at the specified mountPath.", activeNodes: ["kubelet", "pv", "pod"], activeEdges: ["e7", "e9"] },
  ],
};

export default pvBinding;
