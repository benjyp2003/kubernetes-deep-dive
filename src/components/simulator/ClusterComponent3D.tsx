// 3D Kubernetes cluster component
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { ComponentType } from "./types";

const typeColors: Record<ComponentType, string> = {
  controlplane: "#3b82f6",
  node: "#6366f1",
  pod: "#06b6d4",
  service: "#10b981",
  ingress: "#f59e0b",
  storage: "#f97316",
  user: "#8b5cf6",
  dns: "#14b8a6",
  network: "#22d3ee",
};

const typeShapes: Record<ComponentType, 'box' | 'sphere' | 'cylinder' | 'octahedron'> = {
  controlplane: 'box',
  node: 'box',
  pod: 'sphere',
  service: 'octahedron',
  ingress: 'cylinder',
  storage: 'cylinder',
  user: 'sphere',
  dns: 'octahedron',
  network: 'sphere',
};

const typeSizes: Record<ComponentType, [number, number, number]> = {
  controlplane: [2.4, 0.8, 1.6],
  node: [2, 1.4, 1.6],
  pod: [0.4, 0.4, 0.4],
  service: [0.5, 0.5, 0.5],
  ingress: [0.8, 0.3, 0.8],
  storage: [0.6, 0.5, 0.6],
  user: [0.5, 0.5, 0.5],
  dns: [0.4, 0.4, 0.4],
  network: [0.3, 0.3, 0.3],
};

interface Props {
  id: string;
  label: string;
  type: ComponentType;
  description: string;
  position: [number, number, number];
  active: boolean;
  onClick: (id: string) => void;
}

const ClusterComponent3D = ({ id, label, type, description, position, active, onClick }: Props) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = typeColors[type];
  const shape = typeShapes[type];
  const size = typeSizes[type];

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = active ? 1.08 : hovered ? 1.04 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), delta * 6);

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = active ? 0.25 + Math.sin(Date.now() * 0.004) * 0.1 : 0;
    }
  });

  const renderShape = () => {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[size[0], 24, 24]} />;
      case 'cylinder':
        return <cylinderGeometry args={[size[0] * 0.5, size[0] * 0.5, size[1], 16]} />;
      case 'octahedron':
        return <octahedronGeometry args={[size[0]]} />;
      default:
        return <boxGeometry args={[size[0], size[1], size[2]]} />;
    }
  };

  const renderGlowShape = () => {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[size[0] * 1.4, 16, 16]} />;
      case 'cylinder':
        return <cylinderGeometry args={[size[0] * 0.8, size[0] * 0.8, size[1] * 1.5, 16]} />;
      case 'octahedron':
        return <octahedronGeometry args={[size[0] * 1.4]} />;
      default:
        return <boxGeometry args={[size[0] * 1.3, size[1] * 1.5, size[2] * 1.3]} />;
    }
  };

  return (
    <group position={position}>
      {/* Glow */}
      <mesh ref={glowRef}>
        {renderGlowShape()}
        <meshBasicMaterial color={color} transparent opacity={0} side={THREE.BackSide} />
      </mesh>

      {/* Main shape */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        {renderShape()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.4 : hovered ? 0.2 : 0.05}
          roughness={0.3}
          metalness={0.6}
          transparent
          opacity={active ? 1 : 0.7}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, (shape === 'box' ? size[1] / 2 : size[0]) + 0.3, 0]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="bottom"
        font="https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDjQSkFtoMM3T6r8E7mPbF4Cw.woff2"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>

      {/* Tooltip on hover */}
      {hovered && (
        <Html position={[0, (shape === 'box' ? size[1] / 2 : size[0]) + 0.7, 0]} center distanceFactor={8}>
          <div className="bg-card/95 backdrop-blur border border-border rounded-lg px-3 py-2 max-w-[200px] pointer-events-none">
            <p className="text-xs text-foreground font-medium">{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
          </div>
        </Html>
      )}
    </group>
  );
};

export default ClusterComponent3D;
