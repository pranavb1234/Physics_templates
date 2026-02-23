export default function PendulumScene({ refs }) {
  return (
    <group>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      <group ref={refs.pendulumGroup} position={[0, 1.5, 0]}>
        <mesh ref={refs.rod} position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.6, 16]} />
          <meshStandardMaterial color="#93a1a1" />
        </mesh>
        <mesh ref={refs.bob} position={[0, -1.6, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial color="#f39c12" />
        </mesh>
      </group>
    </group>
  );
}
