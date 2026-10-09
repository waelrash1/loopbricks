// One entry per reference in ~/claude/design; tokens live in src/themes.css under [data-theme="<id>"].
// swatch = [canvas, action colour] for the picker dot.
export const THEMES = [
  { id: "officevibe", label: "Officevibe", swatch: ["#f9f8f6", "#2545ff"] },
  { id: "apollo", label: "Apollo", swatch: ["#ccc9c6", "#ebf212"] },
  { id: "ditto", label: "Ditto", swatch: ["#eff2e5", "#ffe228"] },
  { id: "hero", label: "Employment Hero", swatch: ["#f9f5ff", "#7622d7"] },
  { id: "hubspot", label: "HubSpot", swatch: ["#f8f5ee", "#ff4800"] },
  { id: "slack", label: "Slack", swatch: ["#f9f0ff", "#611f69"] },
  { id: "wiza", label: "Wiza", swatch: ["#edecff", "#26114a"] },
] as const;

const KEY = "sd-theme";

export function storedTheme(): string {
  try {
    const t = localStorage.getItem(KEY);
    if (THEMES.some((x) => x.id === t)) return t!;
  } catch {
    /* storage blocked: fall through to the default */
  }
  return THEMES[0].id;
}

export function applyTheme(id: string) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* not persisted, still applied */
  }
}
