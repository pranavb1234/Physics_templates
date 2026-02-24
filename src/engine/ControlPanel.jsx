export default function ControlPanel({ template, params, onChange, playing, onTogglePlay }) {
  if (!template) return null;

  const controls = template.controls ?? {};

  return (
    <aside
      style={{
        width: 320,
        padding: 16,
        background: "linear-gradient(170deg, #0e1726 0%, #0b1220 100%)",
        color: "#e6edf3",
        border: "1px solid #1f2a3a",
        borderRadius: 12,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        boxShadow: "0 12px 30px rgba(0,0,0,0.22)"
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: 18 }}>Controls</h3>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          {template.chapter} / {template.label}
        </div>
      </div>

      <button
        onClick={onTogglePlay}
        style={{
          marginBottom: 14,
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #2e4056",
          color: "#e6edf3",
          background: playing ? "#13315a" : "#174f3c",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        {playing ? "Pause Animation" : "Play Animation"}
      </button>

      {Object.entries(controls).map(([name, cfg]) => (
        <section
          key={name}
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, textTransform: "capitalize" }}>
            {name}: <strong>{Number(params[name] ?? cfg.default).toFixed(2)}</strong>
          </label>
          <input
            type="range"
            min={cfg.min}
            max={cfg.max}
            step={0.01}
            value={params[name] ?? cfg.default}
            onChange={(e) => onChange(name, Number(e.target.value))}
            style={{ width: "100%", accentColor: "#1da1f2" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              opacity: 0.72,
              marginTop: 4
            }}
          >
            <span>{cfg.min}</span>
            <span>{cfg.max}</span>
          </div>
        </section>
      ))}
    </aside>
  );
}