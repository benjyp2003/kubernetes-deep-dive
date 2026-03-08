import crashLoopBackOff from "./crashLoopBackOff";
import selectorMismatch from "./selectorMismatch";
import imagePullBackOff from "./imagePullBackOff";
import pendingPod from "./pendingPod";
import pvcPending from "./pvcPending";
import networkPolicyBlock from "./networkPolicyBlock";

export const labScenarios = [
  crashLoopBackOff,
  selectorMismatch,
  imagePullBackOff,
  pendingPod,
  pvcPending,
  networkPolicyBlock,
];

export const getLabScenario = (id: string) => labScenarios.find((s) => s.id === id);
