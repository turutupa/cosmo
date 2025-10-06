import ReactCurse, {
  Banner,
  List,
  ListPos,
  Text,
  useInput,
  useSize,
} from "react-curse";
import { ESCAPE } from "./constants";
import type { TScreen } from "./types";
import { useTheme } from "./useTheme";
import { buildFrame } from "./utils";

const icons: Record<string, string> = {
  "Open file": "",
  "Export YAML": "",
  "Export JSON": "{",
  About: "",
  Keybindings: "",
  Quit: "",
};

const shortcutIcons: Record<string, string> = {
  "Open file": "o",
  "Export YAML": "y",
  "Export JSON": "u",
  About: "a",
  Keybindings: "s",
  Quit: "q",
};

const screens: Record<string, TScreen> = {
  "Open file": "openFile",
  "Export YAML": "exportYAML",
  "Export JSON": "exportJSON",
  About: "about",
  Keybindings: "keybindings",
  Quit: "",
};

type TOpeningMenuItem = {
  title: string;
  icon: string;
  index: number;
  screen: string;
  shortcut: string;
};

const OPENING_MENU: TOpeningMenuItem[] = [
  "Open file",
  "Keybindings",
  "About",
  "Quit",
].map((title, index) => ({
  title,
  icon: icons[title],
  shortcut: shortcutIcons[title],
  screen: screens[title],
  index,
}));

const OPTIONS_MENU: TOpeningMenuItem[] = [
  "Open file",
  "Export YAML",
  "Export JSON",
  "Keybindings",
  "About",
  "Quit",
].map((title, index) => ({
  title,
  icon: icons[title],
  shortcut: shortcutIcons[title],
  screen: screens[title],
  index,
}));

type Props = {
  isOpeningMenu: boolean;
  onScreenChange: (screen: TScreen) => void;
};

const Menu: React.FC<Props> = ({ isOpeningMenu, onScreenChange }) => {
  const menuOptions: TOpeningMenuItem[] = isOpeningMenu
    ? OPENING_MENU
    : OPTIONS_MENU;

  const { width: termWidth, height: termHeight } = useSize();
  const { theme } = useTheme();

  const {
    frame,
    startX,
    startY,
    contentStartX,
    bannerY,
    listY,
    backgroundHeight,
  } = buildFrame(menuOptions.length, termWidth, termHeight);
  const bannerPadding = 1;

  useInput((input: string) => {
    // Close the menu on 'Escape' or 'q' key press
    if (input === ESCAPE) {
      if (isOpeningMenu) {
        ReactCurse.exit();
      }
      onScreenChange("");
    } else if (input === "q") {
      ReactCurse.exit();
    } else if (input === "s") {
      onScreenChange("keybindings");
    } else if (input === "a") {
      onScreenChange("about");
    } else if (input === "o") {
      onScreenChange("openFile");
    } else if (input === "y" && !isOpeningMenu) {
      onScreenChange("exportYAML");
    } else if (input === "u" && !isOpeningMenu) {
      onScreenChange("exportJSON");
    }
  }, []);

  const onSubmit = ({ y }: ListPos) => {
    menuOptions[y].title === "Open file" && onScreenChange("openFile");
    menuOptions[y].title === "Export YAML" && onScreenChange("exportYAML");
    menuOptions[y].title === "Export JSON" && onScreenChange("exportJSON");
    menuOptions[y].title === "Keybindings" && onScreenChange("keybindings");
    menuOptions[y].title === "About" && onScreenChange("about");
    menuOptions[y].title === "Quit" && ReactCurse.exit();
  };

  return (
    <Text
      absolute
      x={startX}
      y={startY}
      background={theme.black}
      width={22}
      height={backgroundHeight}
    >
      {frame}

      <Text absolute x={contentStartX + bannerPadding} y={bannerY}>
        <Banner color={theme.green}>COSMO</Banner>
      </Text>
      <Text absolute x={contentStartX} y={listY}>
        <List
          data={menuOptions}
          onSubmit={onSubmit}
          renderItem={({ item, selected }) => (
            <Text color={selected ? theme.green : theme.white}>
              <Text width={3}>{item.icon}</Text>
              <Text width={17}>{item.title}</Text>
              <Text color={theme.green}>{item.shortcut}</Text>
            </Text>
          )}
        />
      </Text>
      <Text absolute x={contentStartX - 3} y={listY + menuOptions.length + 1}>
        {" "}
        Press Escape to exit menu{" "}
      </Text>
    </Text>
  );
};

export default Menu;
