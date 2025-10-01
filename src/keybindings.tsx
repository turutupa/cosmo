import { Banner, Text, useInput, useSize } from "react-curse";
import { TScreen } from "./constants";
import { buildFrame } from "./utils";

type TKeybinding = {
  action: string;
  keys: string[];
};

const keybindingsInfo: TKeybinding[] = [
  { action: "pan left", keys: ["h", "←"] },
  { action: "pan right", keys: ["l", "→"] },
  { action: "pan up", keys: ["k", "↑"] },
  { action: "pan down", keys: ["j", "↓"] },
  { action: "pan faster", keys: ["Shift + h/j/k/l"] },
  { action: "focus graph", keys: ["c"] },
  { action: "edit node (must hover)", keys: ["e"] },
  { action: "search mode", keys: ["/"] },
  { action: "open menu", keys: ["Space", "Esc"] },
  { action: "exit", keys: ["q"] },
];

type Props = {
  onScreenChange: (screen: TScreen) => void;
};

const Keybindings: React.FC<Props> = ({ onScreenChange }) => {
  const { width: termWidth, height: termHeight } = useSize();

  const { frame, startX, startY, contentStartX, bannerY, listY } = buildFrame(
    keybindingsInfo.length + 2, // extra space for heading/description
    termWidth,
    termHeight,
    48 // a bit wider for columns
  );
  const bannerPadding = 8;
  const contentPadding = 4;

  useInput((input: string) => {
    if (input === "\x1b") {
      onScreenChange("");
    }
  });

  const actionColWidth =
    Math.max(...keybindingsInfo.map((k) => k.action.length)) + 4; // padding

  return (
    <Text absolute x={startX} y={startY} background="Black">
      {/* render frame */}
      {frame}

      {/* render banner */}
      <Banner
        color="Green"
        absolute
        x={contentStartX + bannerPadding}
        y={bannerY}
      >
        KEYBINDS
      </Banner>

      {/* render text */}
      <Text absolute x={contentStartX + contentPadding + 3} y={listY}>
        Navigation and editing shortcuts:
      </Text>

      <Text absolute x={contentStartX + contentPadding} y={listY + 2}>
        {/* render keybindings table header */}
        <Text>
          <Text
            bold
            background="Green"
            color="Black"
            width={actionColWidth}
            height={1}
          >
            Action
          </Text>
          <Text bold background="Green" color="Black" height={1} width={15}>
            Keys
          </Text>
        </Text>

        {/* render keybindings list */}
        {keybindingsInfo.map((kb, i) => (
          <Text
            key={i}
            block
            absolute
            x={contentStartX + contentPadding}
            y={listY + 3 + i}
          >
            <Text width={actionColWidth}>{kb.action}</Text>
            <Text color="Green">{kb.keys.join(", ")}</Text>
          </Text>
        ))}
      </Text>

      {/* render escape to exit */}
      <Text
        absolute
        x={contentStartX + contentPadding + 6}
        y={listY + 3 + keybindingsInfo.length + 2}
      >
        {" "}
        Press Escape to go back{" "}
      </Text>
    </Text>
  );
};

export default Keybindings;
