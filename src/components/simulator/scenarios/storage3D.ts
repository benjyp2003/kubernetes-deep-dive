import type { SimulatorScenario } from "../types";

const storage3D: SimulatorScenario = {
  id: "storage-3d",
  title: "Persistent Storage Binding",
  subtitle: "How PVCs bind to PVs and mount into pods",
  icon: "💾",
  components: [
    { id: "pod", label: "Application Pod", type: "pod", description: "A pod that needs persistent storage for database files.", position: [-3, 0, 0] },
    { id: "pvc", label: "PersistentVolumeClaim", type: "storage", description: "A request for storage — specifies size, access mode, and StorageClass.", position: [0, 0, 0] },
    { id: "sc", label: "StorageClass", type: "storage", description: "Defines the provisioner and parameters for dynamic volume creation.", position: [0, 2, 1] },
    { id: "provisioner", label: "Provisioner", type: "controlplane", description: "Cloud storage provisioner (e.g., EBS, GCE PD) that creates actual storage.", position: [2, 3, 0] },
    { id: "pv", label: "PersistentVolume", type: "storage", description: "A piece of provisioned storage in the cluster, bound to the PVC.", position: [3, 0, 0] },
    { id: "disk", label: "Cloud Disk", type: "storage", description: "The actual cloud storage disk (EBS volume, GCE Persistent Disk).", position: [5, 0, 0] },
  ],
  connections: [
    { id: "c1", from: "pod", to: "pvc" },
    { id: "c2", from: "pvc", to: "sc" },
    { id: "c3", from: "sc", to: "provisioner" },
    { id: "c4", from: "provisioner", to: "pv" },
    { id: "c5", from: "pv", to: "disk" },
    { id: "c6", from: "pvc", to: "pv" },
  ],
  steps: [
    { title: "Pod requests storage", description: "The pod spec includes a `volumes` section referencing a PVC by name.", activeComponents: ["pod", "pvc"], activeConnections: ["c1"], packets: [{ from: "pod", to: "pvc", color: "orange" }] },
    { title: "PVC checks StorageClass", description: "The PVC references a StorageClass that defines how storage should be provisioned.", activeComponents: ["pvc", "sc"], activeConnections: ["c2"], packets: [{ from: "pvc", to: "sc", color: "orange" }] },
    { title: "Provisioner creates volume", description: "The storage provisioner (e.g., aws-ebs) creates an actual cloud disk.", activeComponents: ["sc", "provisioner"], activeConnections: ["c3"], packets: [{ from: "sc", to: "provisioner", color: "orange" }] },
    { title: "PV created", description: "A PersistentVolume object is created representing the provisioned storage.", activeComponents: ["provisioner", "pv", "disk"], activeConnections: ["c4", "c5"], packets: [{ from: "provisioner", to: "pv", color: "orange" }] },
    { title: "PVC binds to PV", description: "The PVC binds to the newly created PV. The storage is now reserved.", activeComponents: ["pvc", "pv"], activeConnections: ["c6"], packets: [{ from: "pvc", to: "pv", color: "orange" }] },
    { title: "Volume mounted in pod", description: "kubelet mounts the volume into the pod's filesystem at the specified mountPath. Data persists across pod restarts.", activeComponents: ["pod", "pvc", "pv", "disk"], activeConnections: ["c1", "c6", "c5"], packets: [{ from: "pod", to: "pvc", color: "orange" }] },
  ],
};

export default storage3D;
