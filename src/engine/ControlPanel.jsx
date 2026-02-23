export default function ControlPanel({ template, params, onChange, playing, onTogglePlay }) {
  if (!template) return null;

  const controls = template.controls ?? {};

  return (
    <div style={{ width: 300, padding: 16, background: "#111", color: "#eee", fontFamily: "sans-serif" }}>
      <h3 style={{ marginTop: 0 }}>Controls</h3>
      <button onClick={onTogglePlay} style={{ marginBottom: 12, padding: "6px 10px" }}>
        {playing ? "Pause" : "Play"}
      </button>

      {Object.entries(controls).map(([name, cfg]) => (
        <div key={name} style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>
            {name}: {Number(params[name] ?? cfg.default).toFixed(2)}
          </label>
          <input
            type="range"
            min={cfg.min}
            max={cfg.max}
            step={0.01}
            value={params[name] ?? cfg.default}
            onChange={(e) => onChange(name, Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      ))}
    </div>
  );
}
