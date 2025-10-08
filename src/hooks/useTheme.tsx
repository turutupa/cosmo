import fs from "fs";
import os from "os";
import path from "path";
import { useCallback, useEffect, useState } from "react";

export type TTheme = {
  white: string;
  brightWhite: string;
  black: string;
  brightBlack: string;
  gray: string;
  brightGray: string;
  green: string;
  red: string;
  yellow: string;
  cyan: string;
};

const themes: Record<Colorscheme, TTheme> = {
  aura: {
    white: "#EDECEE",
    brightWhite: "",
    black: "#15141B",
    brightBlack: "#2D2D2D",
    gray: "#6d6d6d",
    brightGray: "#AAAAAA",
    green: "#00FFC6",
    red: "#FF6767",
    yellow: "#FFCA85",
    cyan: "#A277FF",
  },
  dracula: {
    white: "#f8f8f2",
    brightWhite: "#ffffff",
    black: "#282a36",
    brightBlack: "#44475a",
    gray: "#6272a4",
    brightGray: "#bfbfbf",
    green: "#50fa7b",
    red: "#ff5555",
    yellow: "#f1fa8c",
    cyan: "#8be9fd",
  },
  atom: {
    white: "#abb2bf",
    brightWhite: "#ffffff",
    black: "#282c34",
    brightBlack: "#3e4451",
    gray: "#5c6370",
    brightGray: "#9da5b4",
    green: "#98c379",
    red: "#e06c75",
    yellow: "#e5c07b",
    cyan: "#56b6c2",
  },
  catppuccin: {
    white: "#cdd6f4",
    brightWhite: "#f5e0dc",
    black: "#11111b",
    brightBlack: "#1e1e2e",
    gray: "#9399b2",
    brightGray: "#bac2de",
    green: "#f5c2e7",
    red: "#f38ba8",
    yellow: "#f9e2af",
    cyan: "#89dceb",
  },
} as const;

export type Colorscheme = "aura" | "dracula" | "atom" | "catppuccin";

const defaultTheme: Colorscheme = "aura";

let sharedThemeState: Colorscheme = defaultTheme;
// removed persistedThemeState
const subscribers = new Set<(cs: Colorscheme) => void>();
let configLoaded = false;

function notifySubscribers() {
  subscribers.forEach((fn) => fn(sharedThemeState));
}

/**
 * Try to load colorscheme from ~/.config/cosmo.json
 * {
 *   "colorscheme": "dracula"
 * }
 */
function loadThemeFromConfig(): Colorscheme {
  try {
    const configPath = path.join(os.homedir(), ".config", "cosmo.json");
    if (!fs.existsSync(configPath)) return sharedThemeState;
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    const cs = parsed?.colorscheme;
    if (typeof cs === "string" && cs in themes) {
      if (sharedThemeState !== cs) {
        sharedThemeState = cs as Colorscheme;
        notifySubscribers();
      }
    }
  } catch {
    // silently ignore
  }
  return sharedThemeState;
}

// One-time config load
if (!configLoaded) {
  loadThemeFromConfig();
  configLoaded = true;
}

export function persistTheme(colorscheme: Colorscheme = sharedThemeState) {
  try {
    const configDir = path.join(os.homedir(), ".config");
    const configPath = path.join(configDir, "cosmo.json");
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
    let data: any = {};
    if (fs.existsSync(configPath)) {
      try {
        data = JSON.parse(fs.readFileSync(configPath, "utf8")) || {};
      } catch {
        data = {};
      }
    }
    if (data.colorscheme === colorscheme) {
      return;
    }
    data.colorscheme = colorscheme;
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // silent
  }
}

// Helper to read persisted theme without mutating in‑memory state
export function getPersistedTheme(): Colorscheme {
  try {
    const configPath = path.join(os.homedir(), ".config", "cosmo.json");
    if (!fs.existsSync(configPath)) return defaultTheme;
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    const cs = parsed?.colorscheme;
    return (
      typeof cs === "string" && cs in themes ? cs : defaultTheme
    ) as Colorscheme;
  } catch {
    return defaultTheme;
  }
}

/**
 * React hook to get and set the current theme as a singleton.
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] =
    useState<Colorscheme>(sharedThemeState);

  useEffect(() => {
    subscribers.add(setCurrentTheme);
    // sync to current shared (no reload from disk here to avoid clobbering previews)
    if (currentTheme !== sharedThemeState) setCurrentTheme(sharedThemeState);
    return () => {
      subscribers.delete(setCurrentTheme);
    };
  }, []);

  const setTheme = useCallback((colorscheme: Colorscheme) => {
    if (sharedThemeState === colorscheme) return;
    sharedThemeState = themes[colorscheme] ? colorscheme : defaultTheme;
    notifySubscribers(); // preview only
  }, []);

  // Always persist (even if same) so user explicitly confirms choice
  const saveTheme = useCallback((colorscheme: Colorscheme) => {
    sharedThemeState = themes[colorscheme] ? colorscheme : defaultTheme;
    persistTheme(sharedThemeState);
    notifySubscribers();
  }, []);

  // Ensure all components using this hook share the same state
  const theme = themes[currentTheme];

  return {
    currentTheme,
    theme,
    setTheme, // preview
    saveTheme, // persist
    themes,
    loadThemeFromConfig,
    persistTheme,
    getPersistedTheme,
  };
}
