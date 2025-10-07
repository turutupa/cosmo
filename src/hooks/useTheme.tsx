import { useCallback, useState } from "react";

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

const themes: Record<string, TTheme> = {
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
};

export type Colorscheme = keyof typeof themes;

const defaultTheme: Colorscheme = "aura";

let sharedThemeState: Colorscheme = defaultTheme;
let sharedSetTheme: ((colorscheme: Colorscheme) => void) | null = null;

/**
 * React hook to get and set the current theme as a singleton.
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] =
    useState<Colorscheme>(sharedThemeState);

  const setTheme = useCallback((colorscheme: Colorscheme) => {
    if (themes[colorscheme]) {
      sharedThemeState = colorscheme;
    } else {
      sharedThemeState = defaultTheme;
    }
    sharedSetTheme?.(sharedThemeState);
  }, []);

  // Ensure all components using this hook share the same state
  sharedSetTheme = setCurrentTheme;

  const theme = themes[currentTheme];

  return { theme, currentTheme, setTheme, themes };
}
