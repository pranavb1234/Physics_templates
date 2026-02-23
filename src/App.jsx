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
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f8f9fa" }}>
      <header style={{ padding: "14px 18px", borderBottom: "1px solid #1f2a3a", fontFamily: "sans-serif" }}>
        <strong>Physics Template Animation System</strong>
        <div style={{ opacity: 0.75, marginTop: 4, fontSize: 14 }}>
          Chapter: {template?.chapter} | Label: {template?.label}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            style={{ padding: "5px 8px" }}
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
            style={{ padding: "5px 8px" }}
          >
            {labelsForChapter.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main style={{ display: "flex", gap: 12, padding: 12 }}>
        <AnimationEngine template={template} params={params} playing={playing} />
        <ControlPanel
          template={template}
          params={params}
          onChange={handleControlChange}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
        />
      </main>
    </div>
  );
}