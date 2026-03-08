import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const packetColors = {
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f97316",
  red: "#ef4444",
};

interface Props {
  from: [number, number, number];
  to: [number, number, number];
  color: keyof typeof packetColors;
  active: boolean;
  showPacket: boolean;
}

const DataFlow = ({ from, to, color, active, showPacket }: Props) => {
  const packetRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += Math.abs(end.x - start.x) * 0.15 + 0.3;

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(30);
  }, [from, to]);

  const lineGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  useFrame(() => {
    if (!packetRef.current || !showPacket) return;
    const t = (Date.now() * 0.001) % 1;
    const idx = Math.floor(t * (points.length - 1));
    const next = Math.min(idx + 1, points.length - 1);
    const frac = t * (points.length - 1) - idx;
    const pos = new THREE.Vector3().lerpVectors(points[idx], points[next], frac);
    packetRef.current.position.copy(pos);
  });

  const col = packetColors[color];

  return (
    <group>
      <line ref={lineRef as any} geometry={lineGeo}>
        <lineBasicMaterial
          color={col}
          transparent
          opacity={active ? 0.6 : 0.08}
          linewidth={1}
        />
      </line>

      {showPacket && active && (
        <mesh ref={packetRef}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={col} />
        </mesh>
      )}
    </group>
  );
};

export default DataFlow;
