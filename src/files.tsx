import fs from "fs";
import path from "path";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Banner, List, Text, useInput, useSize } from "react-curse";
import { TScreen } from "./constants";
import { buildFrame } from "./utils";

type TEntry = {
  label: string; // shown label
  name: string; // raw name (no decorations)
  fullPath: string; // absolute path
  isDir: boolean;
  special?: "up";
};

type Props = {
  onSelect: (filePath: string) => void;
  onScreenChange: (string: TScreen) => void;
  startDir?: string;
};

const Files: React.FC<Props> = ({ onSelect, onScreenChange, startDir }) => {
  const initial = useMemo(
    () => path.resolve(startDir || process.cwd()),
    [startDir]
  );
  const [currentPath, setCurrentPath] = useState(initial);
  const [entries, setEntries] = useState<TEntry[]>([]);

  const loadDir = useCallback((dir: string) => {
    let stats: fs.Stats | undefined;
    try {
      stats = fs.statSync(dir);
    } catch {
      return;
    }
    if (!stats.isDirectory()) return;

    let dirents: fs.Dirent[] = [];
    try {
      dirents = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    const items: TEntry[] = dirents
      .map((d) => {
        const full = path.join(dir, d.name);
        return {
          label: d.isDirectory() ? d.name + "/" : d.name,
          name: d.name,
          fullPath: full,
          isDir: d.isDirectory(),
        };
      })
      .sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      });

    const root = path.parse(dir).root;
    if (dir !== root) {
      items.unshift({
        label: "..",
        name: "..",
        fullPath: path.dirname(dir),
        isDir: true,
        special: "up",
      });
    }

    setEntries(items);
  }, []);

  useEffect(() => {
    loadDir(currentPath);
  }, [currentPath, loadDir]);

  // Input handling
  useInput((input: string) => {
    if (input === "\x1b") {
      onScreenChange("");
    }
  });

  // Layout / frame (reuse style from About)
  const { width: termWidth, height: termHeight } = useSize();
  const longest =
    entries.reduce((m, e) => Math.max(m, e.label.length), currentPath.length) +
    4;
  const modalWidth = Math.min(Math.max(40, longest + 4), termWidth - 4);
  const contentHeight = entries.length + 4;
  const {
    frame,
    startX,
    startY,
    contentStartX,
    listY,
    bannerY, // bannerY unused; reuse structure for consistency
  } = buildFrame(contentHeight, termWidth, termHeight, modalWidth);

  const listX = contentStartX + 1;
  const title = "FILES";

  const bannerPadding = 10;
  const contentPadding = 0;

  return (
    <Text absolute x={startX} y={startY} background="Black">
      {/* render frame */}
      {frame}

      {/* render banner */}
      <Text absolute x={contentStartX + bannerPadding} y={bannerY}>
        <Banner color="Green">{title}</Banner>
      </Text>

      {/* render current path */}
      <Text absolute x={listX + contentPadding} y={listY}>
        {currentPath}
      </Text>

      {/* render list of files */}
      <Text absolute x={listX + contentPadding} y={listY + 2}>
        <List
          data={entries}
          renderItem={({ item, selected }) => (
            <Text
              color={selected ? "Black" : item.isDir ? "Cyan" : "White"}
              background={selected ? "Green" : undefined}
            >
              {item.label}
            </Text>
          )}
          onSubmit={({ y }) => {
            const entry = entries[y];
            if (!entry) return;
            if (entry.special === "up" || entry.isDir) {
              setCurrentPath(entry.fullPath);
              return;
            }
            onSelect(entry.fullPath);
          }}
        />
      </Text>
      <Text absolute x={listX - 4} y={listY + entries.length + 5}>
        Enter: open | Esc: close | Navigate: arrows
      </Text>
    </Text>
  );
};

export default Files;
