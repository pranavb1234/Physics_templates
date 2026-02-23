import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SceneRegistry } from "../animations/registries/SceneRegistry";
import { MotionRegistry } from "../animations/registries/MotionRegistry";

function RuntimeAnimator({ template, params, playing, onSpringMetrics, onPendulumMetrics }) {
  const refs = {
    pendulumGroup: useRef(null),
    rod: useRef(null),
    bob: useRef(null),
    motionArrow: useRef(null),
    spring: useRef(null),
    mass: useRef(null),
    displacementArrow: useRef(null),
    forceArrow: useRef(null),
    springMetrics: useRef({ x: 0, force: 0, k: 0, meanX: 0, massX: 0 }),
    pendulumMetrics: useRef({ theta: 0, omega: 0 })
  };
  const lastMetricsUpdate = useRef(0);

  const SceneComponent = SceneRegistry[template.scene];
  const motion = MotionRegistry[template.motion];

  useFrame((state) => {
    if (!playing || !motion) return;

    motion({ time: state.clock.getElapsedTime(), params, refs });

    const now = state.clock.elapsedTime;
    if (now - lastMetricsUpdate.current > 0.05) {
      lastMetricsUpdate.current = now;

      if (template.scene === "spring_mass" && onSpringMetrics) {
        onSpringMetrics({ ...refs.springMetrics.current });
      }

      if (template.scene === "pendulum" && onPendulumMetrics) {
        onPendulumMetrics({ ...refs.pendulumMetrics.current });
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

function SpringMassCanvasOverlay({ metrics }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        display: "flex",
        gap: 8,
        pointerEvents: "none",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: "#1f2937"
      }}
    >
      <div
        style={{
          padding: "4px 8px",
          borderRadius: 999,
          border: "1px solid #d0d7de",
          background: "rgba(255,255,255,0.9)",
          fontSize: 13,
          fontWeight: 600
        }}
      >
        x = {metrics.x.toFixed(2)}
      </div>
      <div
        style={{
          padding: "4px 8px",
          borderRadius: 999,
          border: "1px solid #d0d7de",
          background: "rgba(255,255,255,0.9)",
          fontSize: 13,
          fontWeight: 700,
          color: "#be123c"
        }}
      >
        F = -kx = {metrics.force.toFixed(2)}
      </div>
    </div>
  );
}

function PendulumCanvasOverlay({ metrics }) {
  const theta = metrics.theta ?? 0;
  const omega = metrics.omega ?? 0;
  const thetaClamped = Math.max(-1.05, Math.min(1.05, theta));
  const showArc = Math.abs(thetaClamped) > 0.025;

  const cx = 50;
  const cy = 24;
  const radius = 12;

  const arcPath = (() => {
    const segments = 30;
    let d = "";
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const a = thetaClamped * t;
      const x = cx + radius * Math.sin(a);
      const y = cy + radius * Math.cos(a);
      d += `${i === 0 ? "M" : " L"} ${x.toFixed(3)} ${y.toFixed(3)}`;
    }
    return d;
  })();

  const labelAngle = thetaClamped * 0.5;
  const labelX = cx + (radius + 3.0) * Math.sin(labelAngle);
  const labelY = cy + (radius + 3.0) * Math.cos(labelAngle);

  const directionLabel =
    Math.abs(omega) < 0.02
      ? "Turning point"
      : omega > 0
        ? "Moving to +theta"
        : "Moving to -theta";

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
          left: 10,
          display: "flex",
          gap: 8
        }}
      >
        <div
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            border: "1px solid #d0d7de",
            background: "rgba(255,255,255,0.92)",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          {"\u03B8"} = {Math.abs(theta).toFixed(2)} rad ({Math.abs((theta * 180) / Math.PI).toFixed(1)} deg)
        </div>
        <div
          style={{
            padding: "4px 8px",
            borderRadius: 999,
            border: "1px solid #d0d7de",
            background: "rgba(255,255,255,0.92)",
            fontSize: 13,
            fontWeight: 600
          }}
        >
          {directionLabel}
        </div>
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <marker
            id="thetaArcHead"
            markerWidth="4.4"
            markerHeight="4.4"
            refX="3.7"
            refY="2.2"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L4.4,2.2 L0,4.4 Z" fill="#1f2937" />
          </marker>
        </defs>

        {showArc && (
          <>
            <path d={arcPath} stroke="rgba(255,255,255,0.75)" strokeWidth="0.92" fill="none" />
            <path
              d={arcPath}
              stroke="#1f2937"
              strokeWidth="0.34"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              markerEnd="url(#thetaArcHead)"
            />
          </>
        )}

        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x="-3.4"
            y="-2.2"
            width="6.8"
            height="4.4"
            rx="1.2"
            fill="rgba(255,255,255,0.92)"
            stroke="#d0d7de"
            strokeWidth="0.24"
          />
          <text x="0" y="1.1" textAnchor="middle" fontSize="2.7" fill="#1f2937" fontWeight="700">
            {"\u03B8"}
          </text>
        </g>
      </svg>
    </div>
  );
}

function SpringMassInfo({ metrics }) {
  const phaseText =
    Math.abs(metrics.x) < 0.01
      ? "At mean position, spring length is natural and net force is near zero."
      : metrics.x > 0
        ? "Block is right of mean: spring is stretched, so restoring force points left."
        : "Block is left of mean: spring is compressed, so restoring force points right.";

  return (
    <div
      style={{
        borderTop: "1px solid #d0d7de",
        padding: "10px 12px",
        background: "#ffffff",
        color: "#1f2937",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        fontSize: 13,
        lineHeight: 1.4
      }}
    >
      The blue block marks the equilibrium position. Displacement x is measured from this mean position, and restoring force is F = -kx. This is the ideal case with friction coefficient mu = 0, so damping is not present. {phaseText}
    </div>
  );
}

function PendulumInfo({ metrics }) {
  const sideText =
    Math.abs(metrics.theta) < 0.01
      ? "The bob is at mean position."
      : metrics.theta > 0
        ? "The bob is on the +theta side of the mean line."
        : "The bob is on the -theta side of the mean line.";

  return (
    <div
      style={{
        borderTop: "1px solid #d0d7de",
        padding: "10px 12px",
        background: "#ffffff",
        color: "#1f2937",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        fontSize: 13,
        lineHeight: 1.4
      }}
    >
      The dashed vertical line is the mean (equilibrium) position. Angular displacement theta is measured between this line and the string at each instant. The tangential arrow near the bob updates with direction of motion. This is an ideal pendulum with mu = 0, so damping is not happening. {sideText}
    </div>
  );
}

export default function AnimationEngine({ template, params, playing }) {
  const backgroundOpacity = useMemo(
    () => template?.visual?.backgroundOpacity ?? 0.2,
    [template]
  );
  const isSpringMass = template?.scene === "spring_mass";
  const isPendulum = template?.scene === "pendulum";
  const isDiagram2D = isSpringMass || isPendulum;

  const [springMetrics, setSpringMetrics] = useState({ x: 0, force: 0, k: 0, meanX: 0, massX: 0 });
  const [pendulumMetrics, setPendulumMetrics] = useState({ theta: 0, omega: 0 });

  if (!template) return <div>No template loaded.</div>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 420,
        background: isDiagram2D ? "#eef2f6" : `rgba(11, 18, 28, ${backgroundOpacity})`
      }}
    >
      <div style={{ position: "relative", minHeight: 420 }}>
        <Canvas
          orthographic={isDiagram2D}
          camera={
            isSpringMass
              ? { position: [0, 0, 10], zoom: 130 }
              : isPendulum
                ? { position: [0, 0, 10], zoom: 148 }
                : { position: [0, 0.7, 4], fov: 50 }
          }
        >
          <RuntimeAnimator
            template={template}
            params={params}
            playing={playing}
            onSpringMetrics={isSpringMass ? setSpringMetrics : undefined}
            onPendulumMetrics={isPendulum ? setPendulumMetrics : undefined}
          />
        </Canvas>

        {isSpringMass && <SpringMassCanvasOverlay metrics={springMetrics} />}
        {isPendulum && <PendulumCanvasOverlay metrics={pendulumMetrics} />}
      </div>

      {isSpringMass && <SpringMassInfo metrics={springMetrics} />}
      {isPendulum && <PendulumInfo metrics={pendulumMetrics} />}
    </div>
  );
}
