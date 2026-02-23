import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";

export default function SpringMassScene({ refs }) {
  const anchorX = -1.9;
  const trackY = -0.32;
  const meanX = 0.35;
  const blockWidth = 0.52;
  const baseSpringLength = meanX - anchorX - blockWidth * 0.5;

  const springCurve = useMemo(() => {
    const turns = 10;
    const samples = 220;
    const radius = 0.11;
    const points = [];

    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const x = 0.1 + t * baseSpringLength;
      const y = Math.sin(t * turns * Math.PI * 2) * radius;
      points.push(new Vector3(x, y, 0));
    }

    return new CatmullRomCurve3(points);
  }, [baseSpringLength]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.86, -0.01]}>
        <planeGeometry args={[7, 2.8]} />
        <meshStandardMaterial color="#f5f7fa" />
      </mesh>

      <mesh position={[anchorX - 0.16, -0.06, 0]}>
        <boxGeometry args={[0.22, 1.5, 0.05]} />
        <meshStandardMaterial color="#b2bcc8" />
      </mesh>

      {Array.from({ length: 14 }).map((_, idx) => (
        <mesh key={idx} position={[anchorX - 0.22, -0.72 + idx * 0.11, 0.03]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.1, 0.012, 0.01]} />
          <meshStandardMaterial color="#8d98a4" />
        </mesh>
      ))}

      <mesh position={[0.3, trackY - 0.23, 0]}>
        <boxGeometry args={[5.3, 0.07, 0.03]} />
        <meshStandardMaterial color="#7f8994" />
      </mesh>

      <group ref={refs.spring} position={[anchorX, trackY, 0]}>
        <mesh position={[0.05, 0, 0]}>
          <boxGeometry args={[0.1, 0.024, 0.02]} />
          <meshStandardMaterial color="#4f5965" />
        </mesh>

        <mesh>
          <tubeGeometry args={[springCurve, 220, 0.02, 10, false]} />
          <meshStandardMaterial color="#2a3440" />
        </mesh>
      </group>

      <mesh position={[meanX, trackY, 0.002]}>
        <boxGeometry args={[blockWidth, 0.52, 0.05]} />
        <meshStandardMaterial color="#66c5ee" transparent opacity={0.6} />
      </mesh>

      {Array.from({ length: 10 }).map((_, idx) => (
        <mesh key={idx} position={[meanX, -0.75 + idx * 0.15, 0.03]}>
          <boxGeometry args={[0.02, 0.08, 0.01]} />
          <meshStandardMaterial color="#8a8f98" />
        </mesh>
      ))}

      <mesh ref={refs.mass} position={[meanX + 0.35, trackY, 0.004]}>
        <boxGeometry args={[blockWidth, 0.52, 0.05]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      <group ref={refs.displacementArrow} position={[meanX, 0.52, 0]}>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1, 0.028, 0.02]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[1.06, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.07, 0.17, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      <group ref={refs.forceArrow} position={[meanX + 0.35, -0.74, 0]}>
        <mesh position={[0.5, 0, 0]}>
          <boxGeometry args={[1, 0.03, 0.02]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
        <mesh position={[1.06, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.07, 0.17, 20]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
      </group>
    </group>
  );
}