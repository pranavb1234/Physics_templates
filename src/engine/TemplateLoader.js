const modules = import.meta.glob("../templates/**/*.json", { eager: true });

const templatesByChapter = Object.values(modules).reduce((acc, mod) => {
  const template = mod.default ?? mod;
  if (!acc[template.chapter]) {
    acc[template.chapter] = {};
  }
  acc[template.chapter][template.label] = template;
  return acc;
}, {});

export function loadTemplate(chapter, label) {
  return templatesByChapter?.[chapter]?.[label] ?? null;
}

export function getAllTemplates() {
  return templatesByChapter;
}
