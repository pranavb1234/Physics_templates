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
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!labelsForChapter.includes(selectedLabel)) {
      setSelectedLabel(labelsForChapter[0] ?? "");
    }
  }, [labelsForChapter, selectedLabel]);

  useEffect(() => {
    setParams(buildInitialParams(template));
    setPlaying(true);
  }, [template]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(orientation: landscape) and (max-width: 1060px) and (max-height: 620px)");
    const sync = () => setIsLandscapeMobile(mediaQuery.matches);

    sync();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", sync);
      return () => mediaQuery.removeEventListener("change", sync);
    }

    mediaQuery.addListener(sync);
    return () => mediaQuery.removeListener(sync);
  }, []);

  useEffect(() => {
    if (!isLandscapeMobile) {
      setMobileMenuOpen(false);
    }
  }, [isLandscapeMobile]);

  const handleControlChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setParams(buildInitialParams(template));
    setPlaying(true);
  };

  const handleChapterChange = (chapter) => {
    setSelectedChapter(chapter);
  };

  const handleLabelChange = (label) => {
    setSelectedLabel(label);
    if (isLandscapeMobile) {
      setMobileMenuOpen(false);
    }
  };

  const controlsPanel = (
    <ControlPanel
      template={template}
      params={params}
      onChange={handleControlChange}
      playing={playing}
      onTogglePlay={() => setPlaying((prev) => !prev)}
      onReset={handleReset}
    />
  );

  return (
    <div className={`app-shell${isLandscapeMobile ? " is-immersive" : ""}`}>
      {!isLandscapeMobile && (
        <header className="app-header">
          <div className="header-top">
            <div>
              <div className="app-title">Physics Learning Templates</div>
              <div className="app-subtitle">
                Tap a concept, interact with controls, and verify understanding with a guided checkpoint.
              </div>
            </div>

            <div className="selector-row">
              <select value={selectedChapter} onChange={(e) => handleChapterChange(e.target.value)}>
                {chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>

              <select value={selectedLabel} onChange={(e) => handleLabelChange(e.target.value)}>
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
      )}

      {isLandscapeMobile && (
        <>
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            Menu
          </button>

          <button
            type="button"
            className={`mobile-menu-backdrop${mobileMenuOpen ? " open" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />

          <aside className={`mobile-drawer${mobileMenuOpen ? " open" : ""}`}>
            <div className="mobile-drawer-head">
              <strong>Template Menu</strong>
              <button type="button" onClick={() => setMobileMenuOpen(false)}>
                Close
              </button>
            </div>

            <div className="mobile-drawer-meta">
              {template ? `${template.chapter} / ${template.label}` : "No template selected"}
            </div>

            <div className="mobile-drawer-selectors">
              <label htmlFor="chapter-select-mobile">Chapter</label>
              <select
                id="chapter-select-mobile"
                value={selectedChapter}
                onChange={(e) => handleChapterChange(e.target.value)}
              >
                {chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>

              <label htmlFor="label-select-mobile">Template</label>
              <select
                id="label-select-mobile"
                value={selectedLabel}
                onChange={(e) => handleLabelChange(e.target.value)}
              >
                {labelsForChapter.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mobile-drawer-controls">{controlsPanel}</div>
          </aside>
        </>
      )}

      <main className={`app-main${isLandscapeMobile ? " immersive-main" : ""}`}>
        <section className="lesson-area">
          <AnimationEngine
            template={template}
            params={params}
            playing={playing}
            immersive={isLandscapeMobile}
          />
        </section>

        {!isLandscapeMobile && (
          <aside className="controls-wrap">
            {controlsPanel}
          </aside>
        )}
      </main>
    </div>
  );
}
