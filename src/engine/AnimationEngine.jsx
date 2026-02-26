import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { SceneRegistry } from "../animations/registries/SceneRegistry";
import { MotionRegistry } from "../animations/registries/MotionRegistry";

const overlayRootStyle = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  color: "#1f2937"
};

const chipStyle = {
  padding: "var(--overlay-chip-pad-y, 4px) var(--overlay-chip-pad-x, 9px)",
  borderRadius: 999,
  border: "1px solid #d0d7de",
  background: "rgba(255,255,255,0.95)",
  fontSize: "var(--overlay-chip-size, 12px)",
  fontWeight: 700,
  whiteSpace: "nowrap"
};

const calloutStyle = {
  position: "absolute",
  fontSize: "var(--overlay-callout-size, 12px)",
  fontWeight: 600,
  border: "1px solid #d0d7de",
  borderRadius: 999,
  background: "rgba(255,255,255,0.94)",
  padding: "var(--overlay-callout-pad-y, 3px) var(--overlay-callout-pad-x, 8px)",
  whiteSpace: "nowrap"
};

function formatNumber(value, precision = 2) {
  if (!Number.isFinite(Number(value))) return "--";
  return Number(value).toFixed(precision);
}

function buildLiveBadges(keyLabels, metrics) {
  if (!Array.isArray(keyLabels)) return [];

  return keyLabels.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const symbol = item.symbol ?? item.metric ?? "label";

    if (item.valueText !== undefined) {
      return [
        {
          symbol,
          value: String(item.valueText),
          isStatic: true
        }
      ];
    }

    if (!item.metric) return [];

    const metricValue = Number(metrics?.[item.metric]);
    if (!Number.isFinite(metricValue)) return [];

    const precision = typeof item.precision === "number" ? item.precision : 2;
    const unit = item.unit ? ` ${item.unit}` : "";

    return [
      {
        symbol,
        value: `${formatNumber(metricValue, precision)}${unit}`,
        isStatic: false
      }
    ];
  });
}

function evaluateCheckpoint(question, metrics) {
  if (!question?.check) {
    return {
      passed: false,
      status: "pending",
      message: "No checkpoint configured for this template.",
      valueText: ""
    };
  }

  const { metric, target = 0, tolerance = 0.05, mode = "near" } = question.check;
  const value = Number(metrics?.[metric]);

  if (!Number.isFinite(value)) {
    return {
      passed: false,
      status: "pending",
      message: question.hint ?? "Interact with the model to evaluate this checkpoint.",
      valueText: ""
    };
  }

  let passed = false;
  if (mode === "positive") passed = value > 0;
  else if (mode === "negative") passed = value < 0;
  else passed = Math.abs(value - target) <= tolerance;

  return {
    passed,
    status: passed ? "pass" : "pending",
    message: passed
      ? question.success ?? "Checkpoint passed."
      : question.hint ?? "Keep adjusting controls and observing motion.",
    valueText: `${metric} = ${formatNumber(value, 3)}`
  };
}

function getSceneStateNote(scene, metrics) {
  if (scene === "spring_mass") {
    if (Math.abs(metrics.x ?? 0) < 0.01) return "Live state: x is near 0, so the block is close to equilibrium.";
    return metrics.x > 0
      ? "Live state: the block is right of equilibrium, spring is stretched, restoring force points left."
      : "Live state: the block is left of equilibrium, spring is compressed, restoring force points right.";
  }

  if (scene === "pendulum") {
    if (Math.abs(metrics.theta ?? 0) < 0.01) return "Live state: bob is crossing the mean vertical line (theta near 0).";
    return metrics.theta > 0
      ? "Live state: bob is on the +theta side of the mean line."
      : "Live state: bob is on the -theta side of the mean line.";
  }

  if (scene === "particle_shm") {
    if (Math.abs(metrics.velocity ?? 0) < 0.02) return "Live state: particle is near a turning point where velocity is small.";
    return metrics.velocity > 0
      ? "Live state: particle is moving toward +A."
      : "Live state: particle is moving toward -A.";
  }

  if (scene === "double_spring_mass") {
    if (Math.abs(metrics.x ?? 0) < 0.01) return "Live state: mass is near O, so net restoring force is near zero.";
    return metrics.x > 0
      ? "Live state: displaced right, both spring forces point left toward O."
      : "Live state: displaced left, both spring forces point right toward O.";
  }

  return "Live state: observe motion and compare with the defined labels.";
}

function didUserInteract(template, params) {
  return Object.entries(template?.controls ?? {}).some(([name, cfg]) => {
    const current = Number(params?.[name] ?? cfg.default);
    const baseline = Number(cfg.default);
    return Math.abs(current - baseline) > 1e-4;
  });
}

function useCompactLandscape() {
  const [compactLandscape, setCompactLandscape] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(orientation: landscape) and (max-height: 620px) and (max-width: 1060px)");
    const sync = () => setCompactLandscape(mediaQuery.matches);

    sync();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", sync);
      return () => mediaQuery.removeEventListener("change", sync);
    }

    mediaQuery.addListener(sync);
    return () => mediaQuery.removeListener(sync);
  }, []);

  return compactLandscape;
}

function RuntimeAnimator({
  template,
  params,
  playing,
  onSpringMetrics,
  onPendulumMetrics,
  onParticleMetrics,
  onDoubleSpringMetrics
}) {
  const refs = {
    pendulumGroup: useRef(null),
    rod: useRef(null),
    bob: useRef(null),
    motionArrow: useRef(null),
    spring: useRef(null),
    mass: useRef(null),
    displacementArrow: useRef(null),
    forceArrow: useRef(null),
    particle: useRef(null),
    particleXArrow: useRef(null),
    doubleMass: useRef(null),
    leftSpring: useRef(null),
    rightSpring: useRef(null),
    forceLeftArrow: useRef(null),
    forceRightArrow: useRef(null),
    displacementDoubleArrow: useRef(null),
    currentGuide: useRef(null),
    springMetrics: useRef({ x: 0, force: 0, k: 0, meanX: 0, massX: 0 }),
    pendulumMetrics: useRef({ theta: 0, omega: 0 }),
    particleMetrics: useRef({ x: 0, amplitude: 1, omega: 1, phase: 0, velocity: 0 }),
    doubleSpringMetrics: useRef({ x: 0, force: 0, k: 1, massX: 0, direction: "right" })
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

      if (template.scene === "particle_shm" && onParticleMetrics) {
        onParticleMetrics({ ...refs.particleMetrics.current });
      }

      if (template.scene === "double_spring_mass" && onDoubleSpringMetrics) {
        onDoubleSpringMetrics({ ...refs.doubleSpringMetrics.current });
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
    <div className="canvas-overlay" style={overlayRootStyle}>
      {/* Top strip: key quantities */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center"
        }}
      >
        <div style={chipStyle}>F = -kx</div>
        <div style={{ ...chipStyle, color: "#2563eb" }}>x = {formatNumber(metrics.x, 2)}</div>
        <div style={{ ...chipStyle, color: "#be123c" }}>F = {formatNumber(metrics.force, 2)}</div>
      </div>

      {/* Mid band: parts of the setup */}
      <div style={{ ...calloutStyle, left: "10%", top: "30%" }}>fixed wall</div>
      <div style={{ ...calloutStyle, left: "33%", top: "30%" }}>spring (k)</div>
      <div style={{ ...calloutStyle, left: "74%", top: "30%" }}>block (mass m)</div>

      <div style={{ ...calloutStyle, left: "53%", top: "46%", transform: "translateX(-50%)" }}>
        mean position (x = 0)
      </div>

      <div style={{ ...calloutStyle, left: "48%", top: "62%", transform: "translateX(-50%)" }}>displacement x</div>
      <div
        style={{
          ...calloutStyle,
          right: "6%",
          top: "62%",
          color: "#be123c",
          border: "1px solid #f0b7c3"
        }}
      >
        restoring force F = -kx
      </div>

      {/* Bottom hint: what to watch as controls change */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 10,
          transform: "translateX(-50%)",
          fontSize: 11,
          fontWeight: 500,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #d0d7de",
          maxWidth: "86%",
          textAlign: "center"
        }}
      >
        As you adjust amplitude and speed, compare the block&apos;s motion with x and F badges at the top.
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
  const cy = 23;
  const radius = 11;

  const arcPath = (() => {
    const segments = 28;
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

  const labelAngle = thetaClamped * 0.55;
  const labelX = cx + (radius + 5.5) * Math.sin(labelAngle);
  const labelY = cy + (radius + 5.5) * Math.cos(labelAngle);

  const directionLabel =
    Math.abs(omega) < 0.02 ? "Turning point" : omega > 0 ? "Moving to +theta" : "Moving to -theta";

  return (
    <div className="canvas-overlay" style={overlayRootStyle}>
      {/* Top strip: key quantities */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center"
        }}
      >
        <div style={{ ...chipStyle, color: "#2563eb" }}>
          {"\u03B8"} = {formatNumber(theta, 2)} rad
        </div>
        <div style={chipStyle}>{directionLabel}</div>
      </div>

      {/* Mid band: parts of the setup */}
      <div style={{ ...calloutStyle, left: "50%", top: "3%", transform: "translateX(-50%)" }}>support</div>
      <div style={{ ...calloutStyle, left: "16%", top: "42%" }}>string</div>
      <div style={{ ...calloutStyle, left: "16%", top: "63%" }}>bob (mass m)</div>
      <div style={{ ...calloutStyle, left: "50%", top: "70%", transform: "translateX(-50%)" }}>
        mean position (dashed)
      </div>

      {/* Bottom hint */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 10,
          transform: "translateX(-50%)",
          fontSize: 11,
          fontWeight: 500,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #d0d7de",
          maxWidth: "86%",
          textAlign: "center"
        }}
      >
        Adjust amplitude and speed, then watch how the bob crosses the dashed mean line as {"\u03B8"} changes above.
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <marker
            id="thetaArcHead"
            markerWidth="2.2"
            markerHeight="2.2"
            refX="1.95"
            refY="1.1"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d="M0.2,0.2 L1.9,1.1 L0.2,2.0"
              fill="none"
              stroke="#1f2937"
              strokeWidth="0.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        {showArc && (
          <>
            <path d={arcPath} stroke="rgba(255,255,255,0.78)" strokeWidth="0.95" fill="none" />
            <path
              d={arcPath}
              stroke="#1f2937"
              strokeWidth="0.28"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              markerEnd="url(#thetaArcHead)"
            />
          </>
        )}

        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x="-3"
            y="-2"
            width="6"
            height="4"
            rx="1"
            fill="rgba(255,255,255,0.93)"
            stroke="#d0d7de"
            strokeWidth="0.22"
          />
          <text x="0" y="1" textAnchor="middle" fontSize="2.8" fill="#1f2937" fontWeight="700">
            {"\u03B8"}
          </text>
        </g>
      </svg>
    </div>
  );
}

function ParticleCanvasOverlay({ metrics }) {
  return (
    <div className="canvas-overlay" style={overlayRootStyle}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          maxWidth: "88%"
        }}
      >
        <div style={chipStyle}>x(t) = A cos({"\u03C9"}t + {"\u03C6"})</div>
        <div style={{ ...chipStyle, color: "#2563eb" }}>x = {formatNumber(metrics.x, 2)}</div>
        <div style={chipStyle}>A = {formatNumber(metrics.amplitude, 2)}</div>
      </div>

      <div style={{ ...calloutStyle, left: "50%", top: "7%", transform: "translateX(-50%)" }}>displacement x (from O)</div>
      <div style={{ ...calloutStyle, left: "50%", top: "82%", transform: "translateX(-50%)" }}>
        x = 0 at mean position (O)
      </div>

      <div
        style={{
          position: "absolute",
          left: "10%",
          top: "58%",
          transform: "translateX(-50%)",
          fontSize: "var(--overlay-limit-size, 28px)",
          fontWeight: 700,
          color: "#344150"
        }}
      >
        -A
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "58%",
          transform: "translateX(-50%)",
          fontSize: "var(--overlay-origin-size, 34px)",
          fontWeight: 700,
          color: "#344150"
        }}
      >
        O
      </div>
      <div
        style={{
          position: "absolute",
          left: "90%",
          top: "58%",
          transform: "translateX(-50%)",
          fontSize: "var(--overlay-limit-size, 28px)",
          fontWeight: 700,
          color: "#344150"
        }}
      >
        +A
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 10,
          transform: "translateX(-50%)",
          fontSize: 11,
          fontWeight: 500,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #d0d7de",
          maxWidth: "86%",
          textAlign: "center"
        }}
      >
        Change A, speed or phase and relate the particle&apos;s position along the axis to x and A shown above.
      </div>
    </div>
  );
}

function DoubleSpringCanvasOverlay({ metrics }) {
  return (
    <div className="canvas-overlay" style={overlayRootStyle}>
      <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ ...chipStyle, color: "#2563eb" }}>x = {formatNumber(metrics.x, 2)}</div>
        <div style={{ ...chipStyle, color: "#be123c" }}>Fnet = -2kx = {formatNumber(metrics.force, 2)}</div>
      </div>

      <div style={{ ...calloutStyle, left: "15%", top: "23%" }}>left spring (k)</div>
      <div style={{ ...calloutStyle, right: "13%", top: "23%" }}>right spring (k)</div>
      <div style={{ ...calloutStyle, left: "50%", top: "19%", transform: "translateX(-50%)" }}>block (mass m)</div>
      <div style={{ ...calloutStyle, left: "50%", top: "60%", transform: "translateX(-50%)" }}>O (equilibrium)</div>
      <div style={{ ...calloutStyle, left: "50%", top: "83%", transform: "translateX(-50%)" }}>displacement x</div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 10,
          transform: "translateX(-50%)",
          fontSize: 11,
          fontWeight: 500,
          padding: "4px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid #d0d7de",
          maxWidth: "86%",
          textAlign: "center"
        }}
      >
        Explore how changing amplitude, k or phase affects x and the combined restoring force Fnet at the top.
      </div>
    </div>
  );
}

function LessonSteps({ currentStep }) {
  const steps = ["Observe", "Interact", "Explain", "Check"];

  return (
    <div className="lesson-steps">
      {steps.map((step, index) => (
        <div key={step} className={`lesson-step ${index <= currentStep ? "is-active" : ""}`}>
          {step}
        </div>
      ))}
    </div>
  );
}

export default function AnimationEngine({ template, params, playing, immersive = false }) {
  const backgroundOpacity = useMemo(
    () => template?.visual?.backgroundOpacity ?? 0.2,
    [template]
  );

  const isSpringMass = template?.scene === "spring_mass";
  const isPendulum = template?.scene === "pendulum";
  const isParticle = template?.scene === "particle_shm";
  const isDoubleSpring = template?.scene === "double_spring_mass";
  const isDiagram2D = isSpringMass || isPendulum || isParticle || isDoubleSpring;
  const compactLandscape = useCompactLandscape();

  const [springMetrics, setSpringMetrics] = useState({ x: 0, force: 0, k: 0, meanX: 0, massX: 0 });
  const [pendulumMetrics, setPendulumMetrics] = useState({ theta: 0, omega: 0 });
  const [particleMetrics, setParticleMetrics] = useState({
    x: 0,
    amplitude: 1,
    omega: 1,
    phase: 0,
    velocity: 0
  });
  const [doubleSpringMetrics, setDoubleSpringMetrics] = useState({
    x: 0,
    force: 0,
    k: 1,
    massX: 0,
    direction: "right"
  });
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    setDetailsOpen(!compactLandscape);
  }, [template?.id, compactLandscape]);

  if (!template) return <div className="lesson-shell">No template loaded.</div>;

  const sceneMetrics = isSpringMass
    ? springMetrics
    : isPendulum
      ? pendulumMetrics
      : isParticle
        ? particleMetrics
        : isDoubleSpring
          ? doubleSpringMetrics
          : {};

  const liveBadges = buildLiveBadges(template.keyLabels, sceneMetrics);
  const checkpoint = Array.isArray(template.checkpointQuestions) ? template.checkpointQuestions[0] : null;
  const checkpointResult = evaluateCheckpoint(checkpoint, sceneMetrics);
  const interactionHappened = didUserInteract(template, params);
  const showDetails = (!compactLandscape || detailsOpen) && !immersive;

  let currentStep = 0;
  if (interactionHappened) currentStep = 1;
  if (interactionHappened && template.explainBottom) currentStep = 2;
  if (checkpoint && checkpointResult.passed) currentStep = 3;

  const canvasElement = (
    <div
      className={`lesson-canvas-wrap${immersive ? " immersive-canvas-wrap" : ""}`}
      style={{
        background: isDiagram2D ? "#eef2f6" : `rgba(11, 18, 28, ${backgroundOpacity})`
      }}
    >
      <Canvas
        orthographic={isDiagram2D}
        dpr={compactLandscape ? [1, 1.4] : [1, 2]}
        camera={
          isSpringMass
            ? { position: [0, -0.22, 10], zoom: compactLandscape ? 116 : 126 }
            : isPendulum
              ? { position: [0, 0, 10], zoom: compactLandscape ? 136 : 148 }
              : isParticle
                ? { position: [0, 0, 10], zoom: compactLandscape ? 142 : 155 }
                : isDoubleSpring
                  ? { position: [0, -0.05, 10], zoom: compactLandscape ? 138 : 150 }
                  : { position: [0, 0.7, 4], fov: 50 }
        }
      >
        <RuntimeAnimator
          template={template}
          params={params}
          playing={playing}
          onSpringMetrics={isSpringMass ? setSpringMetrics : undefined}
          onPendulumMetrics={isPendulum ? setPendulumMetrics : undefined}
          onParticleMetrics={isParticle ? setParticleMetrics : undefined}
          onDoubleSpringMetrics={isDoubleSpring ? setDoubleSpringMetrics : undefined}
        />
      </Canvas>

      {isSpringMass && <SpringMassCanvasOverlay metrics={springMetrics} />}
      {isPendulum && <PendulumCanvasOverlay metrics={pendulumMetrics} />}
      {isParticle && <ParticleCanvasOverlay metrics={particleMetrics} />}
      {isDoubleSpring && <DoubleSpringCanvasOverlay metrics={doubleSpringMetrics} />}
    </div>
  );

  if (immersive) {
    return <div className="lesson-shell immersive-canvas-shell">{canvasElement}</div>;
  }

  return (
    <div className={`lesson-shell${compactLandscape ? " is-compact-landscape" : ""}`}>
      <div className="lesson-head">
        <div className="lesson-kicker">What this teaches</div>
        <div className="lesson-objective">
          {template.objective ?? `Understand the ${template.label} template through motion and labels.`}
        </div>
        <LessonSteps currentStep={currentStep} />
      </div>

      {compactLandscape && (
        <div className="lesson-mobile-toggle-wrap">
          <button
            type="button"
            className="lesson-mobile-toggle"
            onClick={() => setDetailsOpen((prev) => !prev)}
          >
            {detailsOpen ? "Hide lesson notes" : "Show lesson notes"}
          </button>
        </div>
      )}

      {showDetails && template.explainTop && <div className="lesson-note">{template.explainTop}</div>}

      {canvasElement}

      {showDetails && (
        <>
          <div className="lesson-panels">
            <section className="lesson-card">
              <h3>Live concept values</h3>

              {liveBadges.length > 0 ? (
                <div className="lesson-badges">
                  {liveBadges.map((badge) => (
                    <div
                      key={`${badge.symbol}-${badge.value}`}
                      className={`lesson-badge ${badge.isStatic ? "is-static" : ""}`}
                    >
                      <span className="lesson-badge-symbol">{badge.symbol}</span>
                      <span className="lesson-badge-value">{badge.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="lesson-muted">No live badges configured.</div>
              )}

              {Array.isArray(template.keyLabels) && template.keyLabels.length > 0 && (
                <div className="lesson-legend">
                  {template.keyLabels.map((item) => (
                    <div className="lesson-legend-item" key={`${item.symbol}-${item.description}`}>
                      <strong>{item.symbol}</strong>
                      <span>{item.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="lesson-card">
              <h3>Guided check</h3>
              <p>{checkpoint?.prompt ?? "Checkpoint not configured in this template."}</p>

              <div className={`lesson-check-status ${checkpointResult.status === "pass" ? "pass" : "pending"}`}>
                {checkpointResult.message}
              </div>

              {checkpointResult.valueText && <div className="lesson-check-metric">{checkpointResult.valueText}</div>}

              <div className="lesson-live-note">{getSceneStateNote(template.scene, sceneMetrics)}</div>
            </section>
          </div>

          {template.explainBottom && <div className="lesson-note secondary">{template.explainBottom}</div>}

          {Array.isArray(template.takeaway) && template.takeaway.length > 0 && (
            <section className="lesson-takeaway">
              <h3>Takeaway</h3>
              <ul>
                {template.takeaway.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
