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

  const handleChapterChange = (chapter) => {
    setSelectedChapter(chapter);
  };

  const handleLabelChange = (label) => {
    setSelectedLabel(label);
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

  const prettyTemplateLabel = template?.label === "spring_mass"
    ? "Spring Mass System"
    : template?.label === "pendulum"
      ? "Simple Pendulum"
      : template?.label === "particle_shm"
        ? "Particle SHM"
        : template?.label === "double_spring_mass"
          ? "Double Spring System"
          : template?.label ?? "";

  return (
    <>
      <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span className="material-icons-round text-xl">science</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">
                PhysLab <span className="text-primary">Pro</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Interactive Simulations</p>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
          <nav className="hidden md:flex gap-1 text-sm font-medium">
            <button className="px-3 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50 transition-colors">
              Mechanics
            </button>
            <button className="px-3 py-1.5 rounded-md bg-primary/10 text-primary dark:bg-primary/20">
              Oscillations
            </button>
            <button className="px-3 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50 transition-colors">
              Waves
            </button>
            <button className="px-3 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50 transition-colors">
              Thermodynamics
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            onClick={() => document.documentElement.classList.toggle("dark")}
          >
            <span className="material-icons-round text-xl">dark_mode</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Alex Student</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Grade 11 • AP Physics</p>
            </div>
            <div className="h-9 w-9 bg-gradient-to-tr from-primary to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex-col hidden lg:flex">
          <div className="p-4 border-b border-border-light dark:border-border-dark">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              Current Topic
            </label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                value={selectedChapter}
                onChange={(e) => handleChapterChange(e.target.value)}
              >
                {chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <span className="material-icons-round text-sm">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {labelsForChapter.map((label) => {
              const isActive = label === selectedLabel;
              const pretty =
                label === "spring_mass"
                  ? "Spring Mass System"
                  : label === "pendulum"
                    ? "Simple Pendulum"
                    : label === "particle_shm"
                      ? "Particle SHM"
                      : label === "double_spring_mass"
                        ? "Energy Exchange"
                        : label;

              const icon =
                label === "spring_mass"
                  ? "settings_ethernet"
                  : label === "pendulum"
                    ? "schedule"
                    : label === "particle_shm"
                      ? "show_chart"
                      : "energy_savings_leaf";

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleLabelChange(label)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span className="material-icons-round text-sm">{icon}</span>
                  {pretty}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-border-light dark:border-border-dark">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Progress</span>
              <span className="text-xs font-bold text-primary">75%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full w-3/4 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
        </aside>

        {/* Main content + controls */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Lesson / simulation area */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-100 dark:bg-[#0B1120] relative">
            <div className="px-8 pt-6 pb-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span>Oscillations</span>
                <span className="material-icons-round text-[10px]">chevron_right</span>
                <span className="text-primary font-medium">{prettyTemplateLabel}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {template?.objective ? template.objective.split(".")[0] : prettyTemplateLabel}
              </h2>
              {template?.objective && (
                <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-3xl text-sm">
                  {template.objective}
                </p>
              )}
            </div>

            {/* Observe / Interact / Explain / Check tabs – static for now */}
            <div className="px-8 mt-4">
              <div className="inline-flex bg-white dark:bg-surface-dark p-1 rounded-lg border border-border-light dark:border-border-dark shadow-sm">
                <button className="px-4 py-1.5 rounded-md bg-primary text-white text-sm font-medium shadow-sm">
                  Observe
                </button>
                <button className="px-4 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  Interact
                </button>
                <button className="px-4 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  Explain
                </button>
                <button className="px-4 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  Check
                </button>
              </div>
            </div>

            {/* Simulation card – embed existing engine */}
            <div className="flex-1 p-6 md:p-8 flex flex-col">
              <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft border border-border-light dark:border-border-dark flex-1 relative overflow-hidden flex flex-col">
                <div className="flex-1 relative min-h-[360px]">
                  <AnimationEngine template={template} params={params} playing={playing} />
                </div>
              </div>
            </div>
          </div>

          {/* Right controls column */}
          <div className="w-full md:w-80 bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark flex flex-col z-10 shadow-xl overflow-y-auto">
            <div className="p-6 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Simulation Controls
              </h3>
              {controlsPanel}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
