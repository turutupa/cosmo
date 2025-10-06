import { Banner, Text, useInput, useSize } from "react-curse";
import type { TScreen } from "./types";
import { useTheme } from "./useTheme";
import { buildFrame } from "./utils";

type Props = {
  onScreenChange: (screen: TScreen) => void;
};

const aboutLines: string[] = [
  "Cosmo started as a small tool to see code graphs late at night.     ",
  "Following pointers in a log was slow; the shape kept slipping away. ",
  "I wanted the structure on one calm canvas I could pan and scan.     ",
  "So Cosmo draws data as clean ASCII space you can move through.      ",
  "",
  "Right now it focuses on clear viewing: sharp text, smooth pan,      ",
  "no clutter, little lag. It tries to make big graphs feel light.     ",
  "You can explore trees, call maps, weird compiler shapes, anything.  ",
  "Each one becomes a little constellation you can walk.               ",
  "",
  "Next comes richer editing, search layers, semantic zoom, export.    ",
  " • Ideas welcome: open an issue if something would help your flow.  ",
  " • Goal stays simple: low friction, honest view, keep you curious.  ",
  "",
  "Enjoy the map of your thoughts; wander and let patterns show.       ",
];

const About: React.FC<Props> = ({ onScreenChange }) => {
  const { theme } = useTheme();
  const { width: termWidth, height: termHeight } = useSize();

  const contentHeight = aboutLines.length + 2; // padding under banner
  const { frame, startX, startY, contentStartX, bannerY, listY } = buildFrame(
    contentHeight,
    termWidth,
    termHeight,
    68
  );

  const contentPadding = 0;
  const bannerPadding = 24;

  useInput((input: string) => {
    if (input === "\x1b") {
      onScreenChange("");
    }
  });

  return (
    <Text absolute x={startX} y={startY} background={theme.black}>
      {/* render frame */}
      {frame}

      {/* render banner */}
      <Banner
        color={theme.green}
        absolute
        x={contentStartX + bannerPadding}
        y={bannerY}
      >
        COSMO
      </Banner>

      {/* render about text */}
      {aboutLines.map((line, i) => {
        const key = `about-line-${i}`;
        const x = contentStartX + contentPadding;
        const y = listY + i + 1;
        const trimmed = line.trimStart();

        // handle special line
        if (trimmed.startsWith("•") && line.includes(":")) {
          const colonIdx = line.indexOf(":");
          const prefix = line.slice(0, colonIdx + 1);
          const suffix = line.slice(colonIdx + 1);
          return (
            <Text absolute x={x} y={y} key={key}>
              <Text color={theme.green}>{prefix}</Text>
              <Text>{suffix}</Text>
            </Text>
          );
        }

        // render normal line
        return (
          <Text absolute x={x} y={y} key={key}>
            {line}
          </Text>
        );
      })}

      {/* render escape to exit */}
      <Text
        absolute
        x={contentStartX + contentPadding + 22}
        y={listY + aboutLines.length + 5}
      >
        {" "}
        Press Escape to go back{" "}
      </Text>
    </Text>
  );
};

export default About;
