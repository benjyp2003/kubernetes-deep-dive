import type { LabScenario } from "../types";

const missingVerbs: LabScenario = {
  id: "missing-verbs",
  title: "Role Missing Required Verbs",
  category: "config",
  difficulty: "intermediate",
  icon: "📝",
  problemDescription: "A CI/CD pipeline ServiceAccount can read deployments but cannot create or update them. The pipeline fails during the deploy step with a Forbidden error.",
  environmentContext: "Namespace: ci\nServiceAccount: deploy-bot\nRole: deploy-role (exists)\nRoleBinding: deploy-binding (exists)\nThe pipeline needs to create and update deployments.",
  rootCause: "The Role 'deploy-role' only has 'get' and 'list' verbs for deployments. It is missing 'create', 'update', and 'patch' which are needed for the CI/CD pipeline to deploy.",
  fix: "Update the Role to include the missing verbs:\n\nrules:\n- apiGroups: [\"apps\"]\n  resources: [\"deployments\"]\n  verbs: [\"get\", \"list\", \"create\", \"update\", \"patch\"]",
  explanation: "RBAC verbs define what actions are allowed on resources. 'get' and 'list' are read-only. To modify resources, you need verbs like 'create', 'update', 'patch', and 'delete'. Each verb must be explicitly granted.",
  preventionTip: "When creating Roles for CI/CD, map out all the operations the pipeline performs and ensure each verb is included. Test with 'kubectl auth can-i' for each operation.",
  relatedPage: "/security",
  clues: [
    { id: "c1", text: "SA can get deployments but cannot create them", discoveredBy: "kubectl auth can-i create deployments --as=system:serviceaccount:ci:deploy-bot -n ci" },
    { id: "c2", text: "SA can list deployments (read access works)", discoveredBy: "kubectl auth can-i list deployments --as=system:serviceaccount:ci:deploy-bot -n ci" },
    { id: "c3", text: "Role only has get and list verbs", discoveredBy: "kubectl describe role deploy-role -n ci" },
    { id: "c4", text: "RoleBinding correctly binds deploy-bot to deploy-role", discoveredBy: "kubectl describe rolebinding deploy-binding -n ci" },
  ],
  commands: [
    {
      command: "kubectl auth can-i create deployments --as=system:serviceaccount:ci:deploy-bot -n ci",
      output: "no",
      revealsClues: ["c1"],
    },
    {
      command: "kubectl auth can-i list deployments --as=system:serviceaccount:ci:deploy-bot -n ci",
      output: "yes",
      revealsClues: ["c2"],
    },
    {
      command: "kubectl auth can-i update deployments --as=system:serviceaccount:ci:deploy-bot -n ci",
      output: "no",
    },
    {
      command: "kubectl auth can-i get deployments --as=system:serviceaccount:ci:deploy-bot -n ci",
      output: "yes",
    },
    {
      command: "kubectl get roles -n ci",
      output: `NAME          CREATED AT
deploy-role   2026-02-25T08:00:00Z`,
    },
    {
      command: "kubectl describe role deploy-role -n ci",
      output: `Name:         deploy-role
Namespace:    ci
PolicyRule:
  Resources    Non-Resource URLs  Resource Names  Verbs
  ---------    -----------------  --------------  -----
  deployments  []                 []              [get list]`,
      revealsClues: ["c3"],
    },
    {
      command: "kubectl get rolebindings -n ci",
      output: `NAME             ROLE                AGE
deploy-binding   Role/deploy-role    10d`,
    },
    {
      command: "kubectl describe rolebinding deploy-binding -n ci",
      output: `Name:         deploy-binding
Namespace:    ci
Role:
  Kind:  Role
  Name:  deploy-role
Subjects:
  Kind            Name         Namespace
  ----            ----         ---------
  ServiceAccount  deploy-bot   ci`,
      revealsClues: ["c4"],
    },
    {
      command: "kubectl get serviceaccount -n ci",
      output: `NAME         SECRETS   AGE
default      0         30d
deploy-bot   0         10d`,
    },
    {
      command: "kubectl get pods -n ci",
      output: `NAME                            READY   STATUS      RESTARTS   AGE
pipeline-runner-a1b2c3d4        0/1     Error       0          2m`,
    },
    {
      command: "kubectl logs pipeline-runner-a1b2c3d4 -n ci",
      output: `Step 1/3: Fetching current deployment... OK
Step 2/3: Creating new deployment revision...
Error: deployments.apps is forbidden: User "system:serviceaccount:ci:deploy-bot" cannot create resource "deployments" in API group "apps" in the namespace "ci"
Pipeline failed.`,
    },
    {
      command: "kubectl get events -n ci",
      output: `LAST SEEN   TYPE      REASON    OBJECT                        MESSAGE
2m          Normal    Started   pod/pipeline-runner-a1b2c3d4   Started container pipeline`,
    },
    {
      command: "kubectl get nodes",
      output: `NAME            STATUS   ROLES           AGE   VERSION
control-plane   Ready    control-plane   90d   v1.29.2
worker-node-1   Ready    <none>          90d   v1.29.2`,
    },
  ],
  hints: [
    "Check which verbs the pipeline needs — it creates and updates deployments",
    "Use 'kubectl auth can-i' to test specific verbs",
    "Look at the Role definition to see which verbs are granted",
    "Compare the verbs the pipeline needs vs what the Role allows",
  ],
  rootCauseOptions: [
    "The RoleBinding is in the wrong namespace",
    "The ServiceAccount 'deploy-bot' does not exist",
    "The Role only grants 'get' and 'list' verbs, missing 'create' and 'update'",
    "The apiGroup in the Role is incorrect",
  ],
  correctRootCauseIndex: 2,
};

export default missingVerbs;
