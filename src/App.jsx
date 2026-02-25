import { useEffect, useMemo, useState } from "react";
import AnimationEngine from "./engine/AnimationEngine";
import ControlPanel from "./engine/ControlPanel";
import { getAllTemplates, loadTemplate } from "./engine/TemplateLoader";

function buildInitialParams(template) {
  const entries = Object.entries(template?.controls ?? {}).map(([key, cfg]) => [key, cfg.default]);
  return Object.fromEntries(entries);
}

function getFirstLabel(templates, chapter) {
  const labels = Object.keys(templates?.[chapter] ?? {});
  return labels[0] ?? "";
}

export default function App() {
  const templates = useMemo(() => getAllTemplates(), []);
  const chapters = useMemo(() => Object.keys(templates), [templates]);

  const initialChapter = chapters[0] ?? "";
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [selectedLabel, setSelectedLabel] = useState(() => getFirstLabel(templates, initialChapter));

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
    setPlaying(true);
  }, [template]);

  const handleControlChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setParams(buildInitialParams(template));
    setPlaying(true);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-top">
          <div>
            <div className="app-title">Physics Learning Templates</div>
            <div className="app-subtitle">
              Tap a concept, interact with controls, and verify understanding with a guided checkpoint.
            </div>
          </div>

          <div className="selector-row">
            <select value={selectedChapter} onChange={(e) => setSelectedChapter(e.target.value)}>
              {chapters.map((chapter) => (
                <option key={chapter} value={chapter}>
                  {chapter}
                </option>
              ))}
            </select>

            <select value={selectedLabel} onChange={(e) => setSelectedLabel(e.target.value)}>
              {labelsForChapter.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="selection-meta">
          {template ? `${template.chapter} / ${template.label}` : "No template selected"}
        </div>
      </header>

      <main className="app-main">
        <section className="lesson-area">
          <AnimationEngine template={template} params={params} playing={playing} />
        </section>

        <aside className="controls-wrap">
          <ControlPanel
            template={template}
            params={params}
            onChange={handleControlChange}
            playing={playing}
            onTogglePlay={() => setPlaying((prev) => !prev)}
            onReset={handleReset}
          />
        </aside>
      </main>
    </div>
  );
}
