export function doubleSpringMotion({ time, params, refs }) {
  if (!refs.doubleMass.current || !refs.leftSpring.current || !refs.rightSpring.current) return;

  const amplitude = params.amplitude ?? 0.35;
  const speed = params.speed ?? 1.2;
  const phase = params.phase ?? 0;
  const k = params.k ?? 1.0;

  const massHalf = 0.36;
  const leftAnchor = -1.76;
  const rightAnchor = 1.76;
  const massY = -0.04;
  const restLength = 1.4;

  const x = amplitude * Math.sin(time * speed + phase);
  const massX = x;
  const force = -2 * k * x;

  refs.doubleMass.current.position.set(massX, massY, 0.04);

  const leftLength = Math.max(0.2, (massX - massHalf - leftAnchor) / restLength);
  const rightLength = Math.max(0.2, (rightAnchor - (massX + massHalf)) / restLength);

  refs.leftSpring.current.position.set(leftAnchor, massY, 0);
  refs.leftSpring.current.scale.set(leftLength, 1, 1);

  refs.rightSpring.current.position.set(massX + massHalf, massY, 0);
  refs.rightSpring.current.scale.set(rightLength, 1, 1);

  if (refs.forceLeftArrow.current) {
    const forceScale = Math.max(0.15, Math.abs(force) * 0.18);
    refs.forceLeftArrow.current.position.set(massX - 0.24, 0.3, 0.05);
    refs.forceLeftArrow.current.rotation.z = force >= 0 ? 0 : Math.PI;
    refs.forceLeftArrow.current.scale.set(forceScale, 1, 1);
  }

  if (refs.forceRightArrow.current) {
    const forceScale = Math.max(0.15, Math.abs(force) * 0.18);
    refs.forceRightArrow.current.position.set(massX + 0.24, 0.3, 0.05);
    refs.forceRightArrow.current.rotation.z = force >= 0 ? 0 : Math.PI;
    refs.forceRightArrow.current.scale.set(forceScale, 1, 1);
  }

  if (refs.displacementDoubleArrow.current) {
    refs.displacementDoubleArrow.current.position.set(massX * 0.5, -0.95, 0.05);
    refs.displacementDoubleArrow.current.scale.set(Math.max(0.05, Math.abs(x)), 1, 1);
    refs.displacementDoubleArrow.current.visible = Math.abs(x) > 0.01;
  }

  if (refs.currentGuide.current) {
    refs.currentGuide.current.position.set(massX, -0.58, 0.04);
    refs.currentGuide.current.visible = Math.abs(x) > 0.01;
  }

  if (refs.doubleSpringMetrics?.current) {
    refs.doubleSpringMetrics.current = {
      x,
      force,
      k,
      massX,
      direction: x >= 0 ? "right" : "left"
    };
  }
}
