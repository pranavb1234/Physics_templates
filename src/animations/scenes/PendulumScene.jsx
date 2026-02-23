export default function PendulumScene({ refs }) {
  const pivotY = 1.22;
  const length = 1.62;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, -0.02]}>
        <planeGeometry args={[5.2, 4.1]} />
        <meshStandardMaterial color="#f3f5f8" />
      </mesh>

      <mesh position={[0, 1.56, 0]}>
        <boxGeometry args={[3.6, 0.06, 0.04]} />
        <meshStandardMaterial color="#707983" />
      </mesh>

      {Array.from({ length: 21 }).map((_, idx) => (
        <mesh key={idx} position={[-1.7 + idx * 0.17, 1.65, 0.02]} rotation={[0, 0, -0.58]}>
          <boxGeometry args={[0.12, 0.012, 0.01]} />
          <meshStandardMaterial color="#8d96a0" />
        </mesh>
      ))}

      {Array.from({ length: 13 }).map((_, idx) => (
        <mesh key={idx} position={[0, pivotY - 0.08 - idx * 0.13, 0.01]}>
          <boxGeometry args={[0.016, 0.065, 0.01]} />
          <meshStandardMaterial color="#8f96a0" />
        </mesh>
      ))}

      <mesh position={[0, pivotY - length, 0.01]}>
        <sphereGeometry args={[0.078, 26, 26]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <group ref={refs.pendulumGroup} position={[0, pivotY, 0]}>
        <mesh ref={refs.rod} position={[0, -length * 0.5, 0.01]}>
          <boxGeometry args={[0.03, length, 0.02]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>

        <mesh ref={refs.bob} position={[0, -length, 0.02]}>
          <sphereGeometry args={[0.095, 28, 28]} />
          <meshStandardMaterial color="#111827" />
        </mesh>

        <group ref={refs.motionArrow} position={[0, -length + 0.24, 0.03]}>
          <mesh position={[0.21, 0, 0]}>
            <boxGeometry args={[0.42, 0.028, 0.02]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0.45, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.055, 0.12, 20]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
      </group>

      <mesh position={[0, pivotY, 0.02]}>
        <sphereGeometry args={[0.045, 22, 22]} />
        <meshStandardMaterial color="#3b4450" />
      </mesh>

      <group position={[0, -0.78, 0]}>
        <mesh>
          <boxGeometry args={[1.05, 0.018, 0.01]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0.58, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.11, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[-0.58, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.05, 0.11, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
    </group>
  );
}