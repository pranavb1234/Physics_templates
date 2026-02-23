export function springMotion({ time, params, refs }) {
  if (!refs.mass.current || !refs.spring.current) return;

  const amplitude = params.amplitude ?? 0.35;
  const speed = params.speed ?? 1.0;

  const anchorX = -1.9;
  const meanX = 0.35;
  const trackY = -0.32;
  const baseSpringLength = meanX - anchorX - 0.26;
  const k = 2.2;

  // SHM about the mean position: x is positive and negative over time.
  const x = amplitude * Math.sin(time * speed);
  const massX = meanX + x;
  const force = -k * x;

  refs.mass.current.position.set(massX, trackY, 0.004);

  const currentLength = baseSpringLength + x;
  refs.spring.current.position.set(anchorX, trackY, 0);
  refs.spring.current.scale.set(Math.max(0.3, currentLength / baseSpringLength), 1, 1);

  if (refs.displacementArrow.current) {
    const size = Math.max(0.04, Math.abs(x));
    refs.displacementArrow.current.position.set(meanX, 0.52, 0);
    refs.displacementArrow.current.rotation.z = x >= 0 ? 0 : Math.PI;
    refs.displacementArrow.current.scale.set(size, 1, 1);
  }

  if (refs.forceArrow.current) {
    const size = Math.max(0.04, Math.abs(force) * 0.2);
    refs.forceArrow.current.position.set(massX, -0.74, 0);
    refs.forceArrow.current.rotation.z = force >= 0 ? 0 : Math.PI;
    refs.forceArrow.current.scale.set(size, 1, 1);
  }

  if (refs.springMetrics?.current) {
    refs.springMetrics.current = { x, force, k, meanX, massX };
  }
}