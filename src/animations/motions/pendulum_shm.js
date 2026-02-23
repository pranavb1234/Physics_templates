export function pendulumMotion({ time, params, refs }) {
  if (!refs.pendulumGroup.current) return;

  const amplitude = params.amplitude ?? 0.6;
  const speed = params.speed ?? 1.0;

  const phase = time * speed;
  const theta = amplitude * Math.sin(phase);
  const omega = amplitude * speed * Math.cos(phase);

  refs.pendulumGroup.current.rotation.z = theta;

  if (refs.motionArrow.current) {
    const arrowScale = 0.75 + Math.min(0.65, Math.abs(omega) * 0.45);
    refs.motionArrow.current.rotation.z = omega >= 0 ? 0 : Math.PI;
    refs.motionArrow.current.scale.set(arrowScale, 1, 1);
    refs.motionArrow.current.visible = Math.abs(omega) > 0.01;
  }

  if (refs.pendulumMetrics?.current) {
    refs.pendulumMetrics.current = { theta, omega };
  }
}