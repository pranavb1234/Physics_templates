import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";

export default function DoubleSpringMassScene({ refs }) {
  const massHalf = 0.36;
  const leftAnchor = -1.76;
  const rightAnchor = 1.76;
  const massY = -0.04;
  const restSpringLength = 1.4;

  const springCurve = useMemo(() => {
    const turns = 9;
    const samples = 220;
    const radius = 0.09;
    const start = 0.08;
    const points = [];

    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const x = start + t * restSpringLength;
      const y = Math.sin(t * turns * Math.PI * 2) * radius;
      points.push(new Vector3(x, y, 0));
    }

    return new CatmullRomCurve3(points);
  }, [restSpringLength]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, -0.01]}>
        <planeGeometry args={[5.8, 3.7]} />
        <meshStandardMaterial color="#f4f6f8" />
      </mesh>

      <mesh position={[0, -0.74, 0]}>
        <boxGeometry args={[4.4, 0.12, 0.05]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      <mesh position={[-2.02, -0.02, 0]}>
        <boxGeometry args={[0.16, 1.44, 0.05]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      <mesh position={[2.02, -0.02, 0]}>
        <boxGeometry args={[0.16, 1.44, 0.05]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      <mesh position={[0, -0.34, 0.02]}>
        <boxGeometry args={[3.84, 0.03, 0.03]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>

      <group ref={refs.leftSpring} position={[leftAnchor, massY, 0]}>
        <mesh position={[0.04, 0, 0]}>
          <boxGeometry args={[0.08, 0.02, 0.02]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh>
          <tubeGeometry args={[springCurve, 220, 0.02, 10, false]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      <group ref={refs.rightSpring} position={[massHalf, massY, 0]}>
        <mesh>
          <tubeGeometry args={[springCurve, 220, 0.02, 10, false]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[restSpringLength + 0.12, 0, 0]}>
          <boxGeometry args={[0.08, 0.02, 0.02]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      <mesh ref={refs.doubleMass} position={[0, massY, 0.04]}>
        <boxGeometry args={[0.72, 0.56, 0.08]} />
        <meshStandardMaterial color="#79bdd9" />
      </mesh>

      {Array.from({ length: 12 }).map((_, idx) => (
        <mesh key={idx} position={[0, 0.44 - idx * 0.1, 0.04]}>
          <boxGeometry args={[0.018, 0.06, 0.01]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      ))}

      <group ref={refs.currentGuide} position={[0, -0.58, 0.04]}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <mesh key={idx} position={[0, -idx * 0.1, 0]}>
            <boxGeometry args={[0.016, 0.06, 0.01]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        ))}
      </group>

      <mesh position={[0, -0.72, 0.05]}>
        <sphereGeometry args={[0.03, 20, 20]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <group ref={refs.forceLeftArrow} position={[-0.24, 0.3, 0.05]}>
        <mesh position={[0.16, 0, 0]}>
          <boxGeometry args={[0.32, 0.02, 0.01]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0.34, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.045, 0.1, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      <group ref={refs.forceRightArrow} position={[0.24, 0.3, 0.05]}>
        <mesh position={[0.16, 0, 0]}>
          <boxGeometry args={[0.32, 0.02, 0.01]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0.34, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.045, 0.1, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      <group ref={refs.displacementDoubleArrow} position={[0, -0.95, 0.05]}>
        <mesh>
          <boxGeometry args={[1, 0.022, 0.01]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0.52, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.042, 0.1, 20]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[-0.52, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.042, 0.1, 20]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>
    </group>
  );
}
