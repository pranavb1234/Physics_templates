import { useEffect, useMemo, useState } from "react";
import AnimationEngine from "./engine/AnimationEngine";
import ControlPanel from "./engine/ControlPanel";
import { getAllTemplates, loadTemplate } from "./engine/TemplateLoader";

function buildInitialParams(template) {
  const entries = Object.entries(template?.controls ?? {}).map(([key, cfg]) => [key, cfg.default]);
  return Object.fromEntries(entries);
}

export default function App() {
  const templates = useMemo(() => getAllTemplates(), []);
  const chapters = useMemo(() => Object.keys(templates), [templates]);

  const [selectedChapter, setSelectedChapter] = useState("oscillations");
  const [selectedLabel, setSelectedLabel] = useState("pendulum");
  const template = useMemo(
    () => loadTemplate(selectedChapter, selectedLabel),
    [selectedChapter, selectedLabel]
  );

  const labelsForChapter = useMemo(
    () => Object.keys(templates?.[selectedChapter] ?? {}),
    [templates, selectedChapter]
  );
  const [params, setParams] = useState(() => buildInitialParams(template));
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!labelsForChapter.includes(selectedLabel)) {
      setSelectedLabel(labelsForChapter[0] ?? "");
    }
  }, [labelsForChapter, selectedLabel]);

  useEffect(() => {
    setParams(buildInitialParams(template));
  }, [template]);

  const handleControlChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 0%, #142b47 0%, #0b1220 55%)",
        color: "#f8f9fa"
      }}
    >
      <header
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #1f2a3a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "rgba(8, 14, 26, 0.88)",
          backdropFilter: "blur(4px)",
          position: "sticky",
          top: 0,
          zIndex: 2
        }}
      >
        <strong style={{ fontSize: 18 }}>Physics Template Animation System</strong>
        <div style={{ opacity: 0.8, marginTop: 4, fontSize: 14 }}>
          Chapter: {template?.chapter} | Label: {template?.label}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            style={{
              padding: "7px 10px",
              borderRadius: 8,
              border: "1px solid #2f4159",
              background: "#0f1b2e",
              color: "#e6edf3"
            }}
          >
            {chapters.map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            style={{
              padding: "7px 10px",
              borderRadius: 8,
              border: "1px solid #2f4159",
              background: "#0f1b2e",
              color: "#e6edf3"
            }}
          >
            {labelsForChapter.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main style={{ display: "flex", gap: 14, padding: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 700px", minWidth: 0 }}>
          <AnimationEngine template={template} params={params} playing={playing} />
        </div>

        <div style={{ flex: "0 0 auto" }}>
          <ControlPanel
            template={template}
            params={params}
            onChange={handleControlChange}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
          />
        </div>
      </main>
    </div>
  );
}