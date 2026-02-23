import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SceneRegistry } from "../animations/registries/SceneRegistry";
import { MotionRegistry } from "../animations/registries/MotionRegistry";

function RuntimeAnimator({ template, params, playing, onSpringMetrics }) {
  const refs = {
    pendulumGroup: useRef(null),
    rod: useRef(null),
    bob: useRef(null),
    spring: useRef(null),
    mass: useRef(null),
    displacementArrow: useRef(null),
    forceArrow: useRef(null),
    springMetrics: useRef({ x: 0, force: 0, k: 0, meanX: 0, massX: 0 })
  };
  const lastMetricsUpdate = useRef(0);

  const SceneComponent = SceneRegistry[template.scene];
  const motion = MotionRegistry[template.motion];

  useFrame((state) => {
    if (!playing || !motion) return;

    motion({ time: state.clock.getElapsedTime(), params, refs });

    if (template.scene === "spring_mass" && onSpringMetrics) {
      const now = state.clock.elapsedTime;
      if (now - lastMetricsUpdate.current > 0.05) {
        lastMetricsUpdate.current = now;
        onSpringMetrics(refs.springMetrics.current);
      }
    }
  });

  if (!SceneComponent) return null;

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[2, 3, 3]} intensity={0.75} />
      <SceneComponent refs={refs} params={params} />
    </>
  );
}

function SpringMassOverlay({ metrics }) {
  const xText = metrics.x.toFixed(2);
  const forceText = metrics.force.toFixed(2);
  const phaseText =
    Math.abs(metrics.x) < 0.01
      ? "At mean position: spring is at natural length and net force is near zero."
      : metrics.x > 0
        ? "Block is to the right of mean: spring is stretched and restoring force points left."
        : "Block is to the left of mean: spring is compressed and restoring force points right.";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: "#1f2937"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 14,
          right: 14,
          padding: "9px 11px",
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #d0d7de",
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.38
        }}
      >
        The figure shows a block attached to a horizontal spring fixed to a wall on the left. The blue block marks the mean (equilibrium) position where the spring is neither stretched nor compressed and the net force is zero. The vertical dashed line passes through the center of this mean position. This is an ideal model with friction coefficient mu = 0, so damping is neglected.
      </div>

      <div
        style={{
          position: "absolute",
          top: "23%",
          left: "57%",
          transform: "translateX(-50%)",
          padding: "4px 8px",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 5,
          border: "1px solid #d0d7de",
          fontSize: 15,
          fontWeight: 600
        }}
      >
        displacement, x = {xText}
      </div>

      <div
        style={{
          position: "absolute",
          top: "72%",
          left: "63%",
          transform: "translateX(-50%)",
          padding: "4px 8px",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 5,
          border: "1px solid #d0d7de",
          fontSize: 15,
          fontWeight: 700,
          color: "#be123c"
        }}
      >
        restoring force, F = -kx = {forceText}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 14,
          right: 14,
          padding: "9px 11px",
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #d0d7de",
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.38
        }}
      >
        The grey block is the displaced position. The displacement x is measured from the dashed mean-position line, not the total path length. With mu = 0 there is no damping force, so the oscillation continues ideally. {phaseText}
      </div>
    </div>
  );
}

export default function AnimationEngine({ template, params, playing }) {
  const backgroundOpacity = useMemo(
    () => template?.visual?.backgroundOpacity ?? 0.2,
    [template]
  );
  const isSpringMass = template?.scene === "spring_mass";
  const [springMetrics, setSpringMetrics] = useState({ x: 0, force: 0, k: 0, meanX: 0, massX: 0 });

  if (!template) return <div>No template loaded.</div>;

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minHeight: 420,
        background: isSpringMass ? "#eef2f6" : `rgba(11, 18, 28, ${backgroundOpacity})`
      }}
    >
      <Canvas
        orthographic={isSpringMass}
        camera={
          isSpringMass
            ? { position: [0, 0, 10], zoom: 130 }
            : { position: [0, 0.7, 4], fov: 50 }
        }
      >
        <RuntimeAnimator
          template={template}
          params={params}
          playing={playing}
          onSpringMetrics={isSpringMass ? setSpringMetrics : undefined}
        />
      </Canvas>

      {isSpringMass && <SpringMassOverlay metrics={springMetrics} />}
    </div>
  );
}