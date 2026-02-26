import { useEffect, useMemo, useState } from "react";
import RangeControl from "../ui/controls/RangeControl";

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
  const advancedSectionId = "advanced-controls";

  return (
    <aside className="control-panel">
      <div className="control-intro">
        <div className="control-title">Controls</div>
        <div className="control-meta">
          {template.chapter} / {template.label}
        </div>
      </div>

      <div className="control-actions">
        <button
          type="button"
          className={`control-button ${playing ? "is-active" : ""}`}
          onClick={onTogglePlay}
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" className="control-button secondary" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="control-section-title">Primary controls</div>
      {primaryEntries.map(([name, cfg]) => (
        <RangeControl
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
            aria-expanded={showAdvanced}
            aria-controls={advancedSectionId}
          >
            {showAdvanced ? "Hide advanced controls" : "Show advanced controls"}
          </button>

          {showAdvanced && (
            <div id={advancedSectionId}>
              <div className="control-section-title">Advanced controls</div>
              {advancedEntries.map(([name, cfg]) => (
                <RangeControl
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
