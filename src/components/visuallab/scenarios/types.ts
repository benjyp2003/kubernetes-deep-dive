import type { K8sNodeType } from "../K8sNode";

export interface ScenarioNode {
  id: string;
  label: string;
  type: K8sNodeType;
  description?: string;
  icon?: string;
  position: { x: number; y: number };
}

export interface ScenarioEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ScenarioStep {
  title: string;
  description: string;
  activeNodes: string[];
  activeEdges: string[];
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  relatedPage: string;
  nodes: ScenarioNode[];
  edges: ScenarioEdge[];
  steps: ScenarioStep[];
}
