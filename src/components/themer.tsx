import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Banner, List, Text, useInput, useSize } from "react-curse";
import { ENTER, ESCAPE } from "../constants";
import { Colorscheme, useTheme } from "../hooks/useTheme";
import { TScreen } from "../types";
import { buildFrame } from "../utils";
import Modal from "./modal";

type Props = {
  onScreenChange: (screen: TScreen) => void;
};

const Themer: React.FC<Props> = ({ onScreenChange }) => {
  const { width: termWidth, height: termHeight } = useSize();
  const {
    theme,
    themes,
    setTheme,
    currentTheme,
    saveTheme,
    getPersistedTheme,
  } = useTheme();

  const themeNames = useMemo(
    () => Object.keys(themes) as Colorscheme[],
    [themes]
  );

  const [committedTheme, setCommittedTheme] = useState(getPersistedTheme());

  // Remember the originally persisted theme to allow reverting preview
  const originalPersistedThemeRef = useRef(committedTheme);
  const committedRef = useRef(false);

  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(0, themeNames.indexOf(committedTheme))
  );

  // Preview (hover) effect (does not change committedTheme)
  useEffect(() => {
    const name = themeNames[selectedIndex];
    if (name) {
      setTheme(name);
    }
  }, [selectedIndex, themeNames, setTheme]);

  const submitTheme = useCallback(() => {
    const name = themeNames[selectedIndex];
    if (name) {
      saveTheme(name); // persist + broadcast
      setCommittedTheme(name);
      committedRef.current = true;
      originalPersistedThemeRef.current = name;
      onScreenChange("");
    }
  }, [selectedIndex, themeNames, saveTheme]);

  // Revert preview on unmount if user did not commit
  useEffect(() => {
    return () => {
      if (!committedRef.current) {
        setTheme(originalPersistedThemeRef.current); // revert session theme
      }
    };
  }, [setTheme]);

  useInput(
    (input: string) => {
      if (input === ESCAPE) {
        onScreenChange("");
        return;
      }
      // Down: arrow, ctrl+j, ctrl+n
      if (input === "\x1b[B" || input === "\x0A" || input === "\x0E") {
        setSelectedIndex((i) => Math.min(themeNames.length - 1, i + 1));
        return;
      }
      // Up: arrow, ctrl+k, ctrl+p
      if (input === "\x1b[A" || input === "\x0B" || input === "\x10") {
        setSelectedIndex((i) => Math.max(0, i - 1));
        return;
      }
      // Enter
      if (input === ENTER) {
        submitTheme();
        return;
      }
    },
    [themeNames, submitTheme]
  );

  const modalWidth = 40;
  const contentHeight = Math.min(themeNames.length + 8, termHeight - 4);
  const { contentStartX, listY, bannerY } = buildFrame(
    contentHeight,
    termWidth,
    termHeight,
    modalWidth
  );

  const listWidth = modalWidth - 4;
  const listHeight = Math.min(themeNames.length, 12);

  return (
    <Modal pr={13} pb={6} footer={`Navigate: ↑/↓ | Enter: Select | Esc: Back`}>
      <Text absolute x={contentStartX - 3} y={bannerY + 2}>
        <Banner key={`themer-banner-${currentTheme}`} color={theme.green}>
          COLORSCHEMES
        </Banner>
      </Text>

      <Text absolute x={contentStartX + 2} y={listY + 2} color={theme.yellow}>
        Hover to preview
      </Text>

      <Text absolute x={contentStartX + 2} y={listY + 4}>
        <List
          height={listHeight}
          width={listWidth}
          key={`${selectedIndex}-${themeNames.join(",")}`}
          initialPos={{
            x: 0,
            y: selectedIndex,
            xo: 0,
            yo: 0,
            x1: 0,
            x2: 0,
          }}
          data={themeNames.map((n) => ({ name: n }))}
          onSubmit={submitTheme}
          onChange={({ y }) => setSelectedIndex(y)}
          renderItem={({ item, selected }) => {
            const active = item.name === committedTheme;
            return (
              <Text
                key={`themer-item-${item.name}-${committedTheme}`}
                width={listWidth - 2}
                color={
                  selected ? theme.black : active ? theme.green : theme.white
                }
                background={selected ? theme.green : theme.black}
              >
                {` ${item.name}${active ? " *" : ""} `}
              </Text>
            );
          }}
        />
      </Text>
    </Modal>
  );
};

export default Themer;
