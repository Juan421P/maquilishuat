import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeCtx = createContext(null);

export const ACCENT_PALETTES = {
  pink: {
    label: "Rosa",
    grad: "linear-gradient(135deg,#f9a8d4,#ec4899,#9333ea)",
    vars: {
      "--pink-50": "#fff0f7", "--pink-100": "#fce4f0", "--pink-200": "#fbcfe8",
      "--pink-300": "#f9a8d4", "--pink-400": "#f472b6", "--pink-500": "#ec4899",
      "--pink-600": "#db2777", "--pink-700": "#be185d",
      "--gradient-brand":   "linear-gradient(135deg,#f9a8d4 0%,#ec4899 45%,#9333ea 100%)",
      "--gradient-sidebar": "linear-gradient(160deg,#be185d 0%,#7e22ce 100%)",
      "--shadow-glow": "0 0 0 3px rgba(244,114,182,0.20)",
    },
  },
  blue: {
    label: "Azul",
    grad: "linear-gradient(135deg,#93c5fd,#3b82f6,#1d4ed8)",
    vars: {
      "--pink-50": "#eff6ff", "--pink-100": "#dbeafe", "--pink-200": "#bfdbfe",
      "--pink-300": "#93c5fd", "--pink-400": "#60a5fa", "--pink-500": "#3b82f6",
      "--pink-600": "#2563eb", "--pink-700": "#1d4ed8",
      "--gradient-brand":   "linear-gradient(135deg,#93c5fd 0%,#3b82f6 45%,#1d4ed8 100%)",
      "--gradient-sidebar": "linear-gradient(160deg,#1e40af 0%,#1d4ed8 100%)",
      "--shadow-glow": "0 0 0 3px rgba(96,165,250,0.20)",
    },
  },
  green: {
    label: "Verde",
    grad: "linear-gradient(135deg,#86efac,#22c55e,#15803d)",
    vars: {
      "--pink-50": "#f0fdf4", "--pink-100": "#dcfce7", "--pink-200": "#bbf7d0",
      "--pink-300": "#86efac", "--pink-400": "#4ade80", "--pink-500": "#22c55e",
      "--pink-600": "#16a34a", "--pink-700": "#15803d",
      "--gradient-brand":   "linear-gradient(135deg,#86efac 0%,#22c55e 45%,#15803d 100%)",
      "--gradient-sidebar": "linear-gradient(160deg,#166534 0%,#15803d 100%)",
      "--shadow-glow": "0 0 0 3px rgba(74,222,128,0.20)",
    },
  },
  orange: {
    label: "Naranja",
    grad: "linear-gradient(135deg,#fdba74,#f97316,#ea580c)",
    vars: {
      "--pink-50": "#fff7ed", "--pink-100": "#ffedd5", "--pink-200": "#fed7aa",
      "--pink-300": "#fdba74", "--pink-400": "#fb923c", "--pink-500": "#f97316",
      "--pink-600": "#ea580c", "--pink-700": "#c2410c",
      "--gradient-brand":   "linear-gradient(135deg,#fdba74 0%,#f97316 45%,#ea580c 100%)",
      "--gradient-sidebar": "linear-gradient(160deg,#9a3412 0%,#c2410c 100%)",
      "--shadow-glow": "0 0 0 3px rgba(251,146,60,0.20)",
    },
  },
  purple: {
    label: "Violeta",
    grad: "linear-gradient(135deg,#d8b4fe,#a855f7,#7e22ce)",
    vars: {
      "--pink-50": "#faf5ff", "--pink-100": "#f3e8ff", "--pink-200": "#e9d5ff",
      "--pink-300": "#d8b4fe", "--pink-400": "#c084fc", "--pink-500": "#a855f7",
      "--pink-600": "#9333ea", "--pink-700": "#7e22ce",
      "--gradient-brand":   "linear-gradient(135deg,#d8b4fe 0%,#a855f7 45%,#7e22ce 100%)",
      "--gradient-sidebar": "linear-gradient(160deg,#581c87 0%,#7e22ce 100%)",
      "--shadow-glow": "0 0 0 3px rgba(192,132,252,0.20)",
    },
  },
  teal: {
    label: "Teal",
    grad: "linear-gradient(135deg,#99f6e4,#14b8a6,#0f766e)",
    vars: {
      "--pink-50": "#f0fdfa", "--pink-100": "#ccfbf1", "--pink-200": "#99f6e4",
      "--pink-300": "#5eead4", "--pink-400": "#2dd4bf", "--pink-500": "#14b8a6",
      "--pink-600": "#0d9488", "--pink-700": "#0f766e",
      "--gradient-brand":   "linear-gradient(135deg,#99f6e4 0%,#14b8a6 45%,#0f766e 100%)",
      "--gradient-sidebar": "linear-gradient(160deg,#134e4a 0%,#0f766e 100%)",
      "--shadow-glow": "0 0 0 3px rgba(45,212,191,0.20)",
    },
  },
};

function applyAccent(key) {
  const palette = ACCENT_PALETTES[key] || ACCENT_PALETTES.pink;
  const root = document.documentElement;
  Object.entries(palette.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("ptc_theme") || "light");
  const [accent, setAccent] = useState(() => localStorage.getItem("ptc_accent") || "pink");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ptc_theme", theme);
  }, [theme]);

  useEffect(() => {
    applyAccent(accent);
    localStorage.setItem("ptc_accent", accent);
  }, [accent]);

  const toggleTheme = useCallback(() => setTheme(t => t === "light" ? "dark" : "light"), []);
  const changeAccent = useCallback((key) => { if (ACCENT_PALETTES[key]) setAccent(key); }, []);

  // legacy toggle alias
  const toggle = toggleTheme;

  return (
    <ThemeCtx.Provider value={{ theme, accent, isDark: theme === "dark", toggleTheme, toggle, changeAccent, palettes: ACCENT_PALETTES }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};
