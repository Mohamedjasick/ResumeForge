import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const DARK = {
  "--rf-bg":             "#0a0a0f",
  "--rf-sidebar-bg":     "#0d0d14",
  "--rf-sidebar-border": "#1f1f2e",
  "--rf-text":           "#f0f0f0",
  "--rf-text-muted":     "#6b7280",
  "--rf-card":           "#1a1a24",
  "--card-bg":           "#111118",
  "--card-border":       "#40404c",
  "--btn-secondary-bg":     "#40404c",
  "--btn-secondary-hover":  "#4b4b59",
  "--btn-secondary-border": "#4b4b59",
  "--btn-secondary-text":   "#d8d8de",
  "--input-bg":          "#383843",
  "--input-border":      "#4b4b59",
  "--input-text":        "#ededf0",
  "--input-placeholder": "#717183",
  "--label-text":        "#b6b6c1",
  "--page-title":        "#ffffff",
  "--section-title":     "#ededf0",
  "--stat-value":        "#ffffff",
  "--shimmer-from":      "#1a1a28",
  "--shimmer-mid":       "#23233a",
  "--scrollbar-track":   "#1a1a28",
};

const WARM = {
  "--rf-bg":             "#F2EDE4",
  "--rf-sidebar-bg":     "#EDE5D8",
  "--rf-sidebar-border": "#c8b89a",
  "--rf-text":           "#2E1F0F",
  "--rf-text-muted":     "#9E8776",
  "--rf-card":           "#FFFDF8",
  "--card-bg":           "#FFFDF8",
  "--card-border":       "#ddd4c5",
  "--btn-secondary-bg":     "#ede5d8",
  "--btn-secondary-hover":  "#ddd4c5",
  "--btn-secondary-border": "#cec3b5",
  "--btn-secondary-text":   "#3d2b1a",
  "--input-bg":          "#fbf8f4",
  "--input-border":      "#cec3b5",
  "--input-text":        "#2e1f0f",
  "--input-placeholder": "#9e8776",
  "--label-text":        "#6b5240",
  "--page-title":        "#2e1f0f",
  "--section-title":     "#3d2b1a",
  "--stat-value":        "#2e1f0f",
  "--shimmer-from":      "#ede5d8",
  "--shimmer-mid":       "#f2ede4",
  "--scrollbar-track":   "#ede5d8",
};

function applyTheme(theme) {
  const root = document.documentElement;
  const vars = theme === "warm" ? WARM : DARK;

  // Apply all CSS variables to :root
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

  // Set data-theme for theme.css selectors
  root.setAttribute("data-theme", theme);

  // Body
  document.body.style.backgroundColor = vars["--rf-bg"];
  document.body.style.color = vars["--rf-text"];
  document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";

  // Sidebar
  const sidebar = document.querySelector("aside");
  if (sidebar) {
    sidebar.style.backgroundColor = vars["--rf-sidebar-bg"];
    sidebar.style.borderColor = vars["--rf-sidebar-border"];
    sidebar.style.transition = "background-color 0.3s ease";
  }

  // Main content
  const main = document.querySelector("main");
  if (main) {
    main.style.backgroundColor = vars["--rf-bg"];
    main.style.transition = "background-color 0.3s ease";
  }

  // Dynamic favicon
  const favicon = document.querySelector("link[rel='icon']");
  if (favicon) {
    favicon.href = theme === "warm" ? "/Resume_Forge_Warm.png" : "/Resume_Forge_Dark.png";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("rf-theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "warm";
  });

  // Apply on mount + theme change
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("rf-theme", theme);
  }, [theme]);

  // System theme live listener
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => applyTheme(e.matches ? "dark" : "warm");
    mq.addEventListener("change", handler);
    applyTheme(mq.matches ? "dark" : "warm");
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  // Re-apply after route changes
  useEffect(() => {
    const timer = setTimeout(() => applyTheme(theme), 50);
    return () => clearTimeout(timer);
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}