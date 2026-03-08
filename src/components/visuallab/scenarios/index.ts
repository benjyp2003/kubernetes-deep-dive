import podCreation from "./podCreation";
import deploymentCreation from "./deploymentCreation";
import serviceRouting from "./serviceRouting";
import dnsResolution from "./dnsResolution";
import podNetworking from "./podNetworking";
import ingressTraffic from "./ingressTraffic";
import openshiftRoute from "./openshiftRoute";
import pvBinding from "./pvBinding";
import schedulerDecision from "./schedulerDecision";
import networkPolicy from "./networkPolicy";

export const scenarios = [
  podCreation,
  deploymentCreation,
  serviceRouting,
  dnsResolution,
  podNetworking,
  ingressTraffic,
  openshiftRoute,
  pvBinding,
  schedulerDecision,
  networkPolicy,
];

export const getScenario = (id: string) => scenarios.find((s) => s.id === id);
