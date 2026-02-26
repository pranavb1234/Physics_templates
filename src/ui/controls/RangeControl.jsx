import React, { useId, useMemo } from "react";

function toLabel(name) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function sliderStep(cfg) {
  if (typeof cfg.step === "number") return cfg.step;
  const range = Number(cfg.max) - Number(cfg.min);
  if (range >= 4) return 0.05;
  return 0.01;
}

function precisionFromStep(step) {
  const stepNum = Number(step);
  if (!Number.isFinite(stepNum) || stepNum <= 0) return 2;
  if (stepNum >= 1) return 0;
  if (stepNum >= 0.1) return 1;
  return 2;
}

function formatNumber(value, precision) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "--";
  return num.toFixed(precision);
}

export default function RangeControl({ name, cfg, value, onChange }) {
  const fallbackValue = value ?? cfg.default;
  const step = useMemo(() => sliderStep(cfg), [cfg]);
  const precision = useMemo(() => precisionFromStep(step), [step]);
  const reactId = useId();
  const inputId = `ctrl-${name}-${reactId}`;
  const hintId = `ctrl-hint-${name}-${reactId}`;

  return (
    <section className="control-group" aria-label={toLabel(name)}>
      <div className="control-header">
        <label className="control-label" htmlFor={inputId}>
          {toLabel(name)}
        </label>
        <output className="control-value u-tabular" htmlFor={inputId}>
          {formatNumber(fallbackValue, precision)}
        </output>
      </div>

      <input
        id={inputId}
        className="control-range"
        type="range"
        min={cfg.min}
        max={cfg.max}
        step={step}
        value={fallbackValue}
        onChange={(e) => onChange(name, Number(e.target.value))}
        aria-describedby={hintId}
      />

      <div className="control-limits u-tabular" id={hintId}>
        <span>{formatNumber(cfg.min, precision)}</span>
        <span>{formatNumber(cfg.max, precision)}</span>
      </div>
    </section>
  );
}

