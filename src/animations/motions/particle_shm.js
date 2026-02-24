export function particleMotion({ time, params, refs }) {
  if (!refs.particle.current) return;

  const amplitude = params.amplitude ?? 1.0;
  const speed = params.speed ?? 1.2;
  const phase = params.phase ?? 0;
  const axisY = -0.28;

  const x = amplitude * Math.cos(time * speed + phase);
  const velocity = -amplitude * speed * Math.sin(time * speed + phase);

  refs.particle.current.position.set(x, axisY, 0.03);

  if (refs.particleXArrow.current) {
    const size = Math.max(0.02, Math.abs(x));
    refs.particleXArrow.current.position.set(0, axisY + 0.28, 0.03);
    refs.particleXArrow.current.rotation.z = x >= 0 ? 0 : Math.PI;
    refs.particleXArrow.current.scale.set(size, 1, 1);
    refs.particleXArrow.current.visible = Math.abs(x) > 0.01;
  }

  if (refs.particleMetrics?.current) {
    refs.particleMetrics.current = {
      x,
      amplitude,
      omega: speed,
      phase,
      velocity
    };
  }
}