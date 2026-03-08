import type { LabScenario } from "./types";

const pvcPending: LabScenario = {
  id: "pvc-pending",
  title: "PVC Stuck in Pending",
  category: "storage",
  difficulty: "intermediate",
  icon: "💾",
  problemDescription: "A StatefulSet pod is stuck in Pending because its PersistentVolumeClaim cannot be bound.",
  environmentContext: "Namespace: databases\nStatefulSet: postgres (1 replica)\nPVC: data-postgres-0 (requesting 50Gi, ReadWriteOnce)\nNo StorageClass is set as default in the cluster.",
  rootCause: "The PVC references StorageClass 'fast-ssd' which does not exist in the cluster. Available StorageClasses are 'standard' and 'premium'.",
  fix: "Either create the 'fast-ssd' StorageClass or update the PVC/StatefulSet to use an existing StorageClass like 'standard' or 'premium'.",
  explanation: "A PVC stays Pending when no PersistentVolume matches its requirements or when dynamic provisioning fails. This can happen if the StorageClass doesn't exist, the provisioner is down, or there are no PVs with matching criteria.",
  preventionTip: "Document available StorageClasses. Use a default StorageClass. Validate manifests against cluster capabilities before deploying.",
  relatedPage: "/storage",
  clues: [
    { id: "c1", text: "Pod is Pending because PVC is not bound", discoveredBy: "kubectl get pods" },
    { id: "c2", text: "PVC is in Pending state", discoveredBy: "kubectl get pvc" },
    { id: "c3", text: "PVC references StorageClass 'fast-ssd' which doesn't exist", discoveredBy: "kubectl describe pvc data-postgres-0" },
  ],
  commands: [
    {
      command: "kubectl get pods",
      output: `NAME         READY   STATUS    RESTARTS   AGE
postgres-0   0/1     Pending   0          15m`,
      revealsClues: ["c1"],
    },
    {
      command: "kubectl describe pod postgres-0",
      output: `Name:         postgres-0
Namespace:    databases
Node:         <none>
Status:       Pending
Volumes:
  data:
    Type:       PersistentVolumeClaim (a reference to a PVC)
    ClaimName:  data-postgres-0
Events:
  Type     Reason            Age   From               Message
  ----     ------            ----  ----               -------
  Warning  FailedScheduling  15m   default-scheduler  0/2 nodes are available: pod has unbound immediate PersistentVolumeClaims.`,
    },
    {
      command: "kubectl get pvc",
      output: `NAME               STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
data-postgres-0    Pending                                        fast-ssd       15m`,
      revealsClues: ["c2"],
    },
    {
      command: "kubectl describe pvc data-postgres-0",
      output: `Name:          data-postgres-0
Namespace:     databases
StorageClass:  fast-ssd
Status:        Pending
Volume:        
Labels:        app=postgres
Capacity:      
Access Modes:  
Events:
  Type     Reason              Age                From                         Message
  ----     ------              ----               ----                         -------
  Warning  ProvisioningFailed  1m (x15 over 15m)  persistentvolume-controller  storageclass.storage.k8s.io "fast-ssd" not found`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl get events",
      output: `LAST SEEN   TYPE      REASON               OBJECT                       MESSAGE
15m         Warning   FailedScheduling     pod/postgres-0               unbound PersistentVolumeClaims
1m          Warning   ProvisioningFailed   pvc/data-postgres-0          storageclass "fast-ssd" not found`,
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   60d   v1.29.2
worker-node-1   Ready    <none>          60d   v1.29.2`,
    },
    {
      command: "kubectl get deployment",
      output: `No resources found in databases namespace.`,
    },
    {
      command: "kubectl get svc",
      output: `NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
postgres     ClusterIP   None           <none>        5432/TCP   15m
kubernetes   ClusterIP   10.96.0.1      <none>        443/TCP    60d`,
    },
  ],
  hints: [
    "Check the PVC status — is it Bound?",
    "Describe the PVC to see why provisioning failed",
    "Check which StorageClasses are available in the cluster",
  ],
  rootCauseOptions: [
    "The PV is too small for the PVC request",
    "The StorageClass 'fast-ssd' does not exist in the cluster",
    "The node doesn't have a local disk available",
    "The PVC access mode is incompatible",
  ],
  correctRootCauseIndex: 1,
};

export default pvcPending;
