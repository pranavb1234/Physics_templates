export default function ParticleShmScene({ refs }) {
  const axisY = -0.28;
  const axisHalfLength = 1.55;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, -0.01]}>
        <planeGeometry args={[5.4, 3.7]} />
        <meshStandardMaterial color="#f4f6f8" />
      </mesh>

      <mesh position={[0, axisY, 0]}>
        <boxGeometry args={[axisHalfLength * 2, 0.02, 0.01]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <mesh position={[-axisHalfLength, axisY, 0.01]}>
        <boxGeometry args={[0.02, 0.14, 0.01]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[axisHalfLength, axisY, 0.01]}>
        <boxGeometry args={[0.02, 0.14, 0.01]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, axisY, 0.01]}>
        <boxGeometry args={[0.02, 0.12, 0.01]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <mesh ref={refs.particle} position={[0, axisY, 0.03]}>
        <sphereGeometry args={[0.16, 36, 36]} />
        <meshStandardMaterial color="#17a2d6" />
      </mesh>

      <group ref={refs.particleXArrow} position={[0, axisY + 0.28, 0.03]}>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.022, 0.01]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0.62, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.04, 0.09, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>

      <group position={[0, axisY - 0.33, 0.03]}>
        <mesh>
          <boxGeometry args={[axisHalfLength * 1.35, 0.024, 0.01]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[axisHalfLength * 0.7, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.045, 0.1, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[-axisHalfLength * 0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.045, 0.1, 20]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
    </group>
  );
}