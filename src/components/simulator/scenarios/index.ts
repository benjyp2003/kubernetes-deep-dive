import podCreation3D from "./podCreation3D";
import deployment3D from "./deployment3D";
import serviceRouting3D from "./serviceRouting3D";
import dnsResolution3D from "./dnsResolution3D";
import networkPolicy3D from "./networkPolicy3D";
import ingress3D from "./ingress3D";
import storage3D from "./storage3D";
import scheduler3D from "./scheduler3D";
import podNetworking3D from "./podNetworking3D";
import openshiftRoute3D from "./openshiftRoute3D";

export const simulatorScenarios = [
  podCreation3D,
  deployment3D,
  serviceRouting3D,
  dnsResolution3D,
  podNetworking3D,
  ingress3D,
  openshiftRoute3D,
  storage3D,
  scheduler3D,
  networkPolicy3D,
];

export const getSimulatorScenario = (id: string) =>
  simulatorScenarios.find((s) => s.id === id);
