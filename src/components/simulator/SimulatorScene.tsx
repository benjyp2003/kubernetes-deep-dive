import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, PerspectiveCamera } from "@react-three/drei";
import ClusterComponent3D from "./ClusterComponent3D";
import DataFlow from "./DataFlow";
import type { SimulatorScenario } from "./types";

interface Props {
  scenario: SimulatorScenario;
  currentStep: number;
  onComponentClick: (id: string) => void;
}

const SimulatorScene = ({ scenario, currentStep, onComponentClick }: Props) => {
  const step = scenario.steps[currentStep];

  const getPosition = (id: string): [number, number, number] => {
    const comp = scenario.components.find(c => c.id === id);
    return comp?.position ?? [0, 0, 0];
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
    <Canvas
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
      dpr={[1, 1.5]}
    >
      <PerspectiveCamera makeDefault position={[0, 4, 10]} fov={50} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 1.8}
      />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
      <pointLight position={[-3, 5, -3]} intensity={0.4} color="#06b6d4" />
      <pointLight position={[3, 2, 3]} intensity={0.3} color="#8b5cf6" />

      {/* Background */}
      <Stars radius={50} depth={50} count={1000} factor={3} fade speed={0.5} />

      {/* Grid */}
      <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} position={[0, -2, 0]} />

      {/* Connections */}
      {scenario.connections.map((conn) => (
        <DataFlow
          key={conn.id}
          from={getPosition(conn.from)}
          to={getPosition(conn.to)}
          color={step.packets.find(p => p.from === conn.from && p.to === conn.to)?.color ?? "blue"}
          active={step.activeConnections.includes(conn.id)}
          showPacket={step.activeConnections.includes(conn.id)}
        />
      ))}

      {/* Components */}
      {scenario.components.map((comp) => (
        <ClusterComponent3D
          key={comp.id}
          id={comp.id}
          label={comp.label}
          type={comp.type}
          description={comp.description}
          position={comp.position}
          active={step.activeComponents.includes(comp.id)}
          onClick={onComponentClick}
        />
      ))}
    </Canvas>
    </div>
  );
};

export default SimulatorScene;
