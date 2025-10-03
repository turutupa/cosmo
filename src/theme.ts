type TTheme = {
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

/**
 * Static theme manager exposing current theme colors and allowing
 * theme selection with fallback to default.
 */
class Theme {
  private static defaultTheme = "aura";
  private static currentTheme: keyof typeof this.themes = this.defaultTheme;
  private static themes: { [key: string]: TTheme } = {
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
    atomOne: {
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
    catpuccinMocha: {
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

  public static get theme(): TTheme {
    return this.themes[this.currentTheme];
  }

  public static setTheme(theme: keyof typeof this.themes) {
    const selectedTheme = this.themes[theme];
    if (selectedTheme) {
      this.currentTheme = theme;
    } else {
      this.currentTheme = this.defaultTheme;
    }
  }
}

const theme = Theme.theme;
const setTheme = Theme.setTheme;

export { setTheme, theme };
