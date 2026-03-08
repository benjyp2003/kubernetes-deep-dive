export type ComponentType = 'controlplane' | 'node' | 'pod' | 'service' | 'ingress' | 'storage' | 'user' | 'dns' | 'network';

export interface ClusterComponent {
  id: string;
  label: string;
  type: ComponentType;
  description: string;
  position: [number, number, number];
  icon?: string;
  children?: string[];
}

export interface DataPacket {
  id: string;
  from: string;
  to: string;
  color: 'blue' | 'green' | 'orange' | 'red';
  label?: string;
  progress: number;
}

export interface SimulatorScenario {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  steps: SimulatorStep[];
  components: ClusterComponent[];
  connections: SimConnection[];
}

export interface SimulatorStep {
  title: string;
  description: string;
  activeComponents: string[];
  activeConnections: string[];
  packets: { from: string; to: string; color: DataPacket['color']; label?: string }[];
}

export interface SimConnection {
  id: string;
  from: string;
  to: string;
}
