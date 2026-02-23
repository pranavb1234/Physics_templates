export function pendulumMotion({ time, params, refs }) {
  if (!refs.pendulumGroup.current) return;

  const amplitude = params.amplitude ?? 0.6;
  const speed = params.speed ?? 1.0;

  refs.pendulumGroup.current.rotation.z = amplitude * Math.sin(time * speed);
}
