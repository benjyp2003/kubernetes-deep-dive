import crashLoopBackOff from "./crashLoopBackOff";
import selectorMismatch from "./selectorMismatch";
import imagePullBackOff from "./imagePullBackOff";
import pendingPod from "./pendingPod";
import pvcPending from "./pvcPending";
import networkPolicyBlock from "./networkPolicyBlock";
import rbacForbidden from "./rbacForbidden";
import serviceAccountForbidden from "./serviceAccountForbidden";
import wrongRoleBinding from "./wrongRoleBinding";
import clusterRoleNeeded from "./clusterRoleNeeded";
import wrongServiceAccount from "./wrongServiceAccount";
import missingVerbs from "./missingVerbs";

export const labScenarios = [
  crashLoopBackOff,
  selectorMismatch,
  imagePullBackOff,
  pendingPod,
  pvcPending,
  networkPolicyBlock,
  rbacForbidden,
  serviceAccountForbidden,
  wrongRoleBinding,
  clusterRoleNeeded,
  wrongServiceAccount,
  missingVerbs,
];

export const getLabScenario = (id: string) => labScenarios.find((s) => s.id === id);
