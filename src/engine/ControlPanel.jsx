import { useEffect, useMemo, useState } from "react";

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

function SliderControl({ name, cfg, value, onChange }) {
  return (
    <section className="control-group">
      <div className="control-header">
        <label htmlFor={`ctrl-${name}`}>{toLabel(name)}</label>
        <strong>{Number(value ?? cfg.default).toFixed(2)}</strong>
      </div>

      <input
        id={`ctrl-${name}`}
        type="range"
        min={cfg.min}
        max={cfg.max}
        step={sliderStep(cfg)}
        value={value ?? cfg.default}
        onChange={(e) => onChange(name, Number(e.target.value))}
      />

      <div className="control-limits">
        <span>{cfg.min}</span>
        <span>{cfg.max}</span>
      </div>
    </section>
  );
}

export default function ControlPanel({
  template,
  params,
  onChange,
  playing,
  onTogglePlay,
  onReset
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setShowAdvanced(false);
  }, [template?.id]);

  if (!template) return null;

  const controls = template.controls ?? {};
  const controlEntries = Object.entries(controls);

  const primaryKeys = useMemo(() => {
    const configured = template?.ui?.primaryControls ?? [];
    const filtered = configured.filter((name) => Object.prototype.hasOwnProperty.call(controls, name));
    if (filtered.length > 0) return filtered;
    return controlEntries.slice(0, 2).map(([name]) => name);
  }, [template, controls, controlEntries]);

  const primaryEntries = controlEntries.filter(([name]) => primaryKeys.includes(name));
  const advancedEntries = controlEntries.filter(([name]) => !primaryKeys.includes(name));

  return (
    <aside className="control-panel">
      <div className="control-intro">
        <h3>Controls</h3>
        <p>
          {template.chapter} / {template.label}
        </p>
      </div>

      <div className="control-actions">
        <button type="button" className="control-button primary" onClick={onTogglePlay}>
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className="control-button" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="control-section-title">Primary controls</div>
      {primaryEntries.map(([name, cfg]) => (
        <SliderControl
          key={name}
          name={name}
          cfg={cfg}
          value={params[name]}
          onChange={onChange}
        />
      ))}

      {advancedEntries.length > 0 && (
        <>
          <button
            type="button"
            className="control-toggle"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            {showAdvanced ? "Hide advanced controls" : "Show advanced controls"}
          </button>

          {showAdvanced && (
            <div>
              <div className="control-section-title">Advanced controls</div>
              {advancedEntries.map(([name, cfg]) => (
                <SliderControl
                  key={name}
                  name={name}
                  cfg={cfg}
                  value={params[name]}
                  onChange={onChange}
                />
              ))}
            </div>
          )}
        </>
      )}
    </aside>
  );
}
