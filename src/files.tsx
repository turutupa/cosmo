import fs from "fs";
import path from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Banner,
  Input,
  List,
  ListPos,
  Text,
  useInput,
  useSize,
} from "react-curse";
import { ESCAPE } from "./constants";
import { TScreen } from "./types";
import { buildFrame } from "./utils";

type TEntry = {
  label: string; // shown label
  name: string; // raw name (no decorations)
  fullPath: string; // absolute path
  isDir: boolean;
  special?: "up";
};

type Props = {
  onSelect: (filePath: string) => void | Promise<void>; // allow async
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
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [focus, setFocus] = useState<"list" | "search">("list");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const ignoreEscapeOnce = useRef(false);

  // Derived filtered entries
  const filteredEntries = useMemo(() => {
    if (!searchMode || !searchText.trim()) return entries;
    const up = entries.find((e) => e.special === "up");
    const rest = entries.filter(
      (e) =>
        e.special !== "up" &&
        e.name.toLowerCase().includes(searchText.toLowerCase())
    );
    return up ? [up, ...rest] : rest;
  }, [entries, searchMode, searchText]);

  // Keep selectedIndex in range when entries/filter results change
  useEffect(() => {
    setSelectedIndex((i) =>
      filteredEntries.length === 0
        ? 0
        : Math.min(filteredEntries.length - 1, Math.max(0, i))
    );
  }, [filteredEntries]);

  // Auto-exit filter mode if focus leaves filter (requirement)
  useEffect(() => {
    if (focus !== "search" && searchMode) {
      setSearchMode(false);
      setSearchText("");
    }
  }, [focus, searchMode]);

  // load dirs
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
      onScreenChange("");
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
    setError(null);
  }, []);

  useEffect(() => {
    loadDir(currentPath);
  }, [currentPath, loadDir]);

  const onFileSubmission = useCallback(
    async ({ y }: ListPos) => {
      const list = filteredEntries;
      const entry = list[y];
      if (!entry) return;
      if (entry.special === "up" || entry.isDir) {
        setCurrentPath(entry.fullPath);
        setError(null);
        return;
      }
      const ext = path.extname(entry.fullPath).toLowerCase();
      if (![".json", ".yaml", ".yml"].includes(ext)) {
        setError("Supported files: .json, .yaml or .yml");
        return;
      }
      setError(null);
      try {
        await onSelect(entry.fullPath);
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : typeof e === "string"
            ? e
            : "Unknown error while loading file";
        setError(msg);
      }
    },
    [filteredEntries, onSelect]
  );

  const onSearchSubmit = useCallback(() => {
    if (filteredEntries.length === 0) {
      setFocus("list");
      return;
    }
    onFileSubmission({ y: selectedIndex } as ListPos);
    setFocus("list");
  }, [filteredEntries, selectedIndex, onFileSubmission]);

  // Input handling (focus + ctrl navigation in filter mode)
  useInput(
    (input: string) => {
      if (searchMode && input === ESCAPE) {
        // Escape leaves filter (exits filtering mode via effect)
        ignoreEscapeOnce.current = true; // suppress closing
        setFocus("list");
        return;
      }

      if (focus === "search") {
        // Escape leaves filter (exits filtering mode via effect)
        if (input === "\x1b") {
          ignoreEscapeOnce.current = true; // suppress closing
          setFocus("list");
          return;
        }

        // Arrow key navigation while filtering
        if (input === "\x1b[B") {
          // Down arrow
          setSelectedIndex((i) =>
            filteredEntries.length === 0
              ? 0
              : Math.min(filteredEntries.length - 1, i + 1)
          );
          return;
        }
        if (input === "\x1b[A") {
          // Up arrow
          setSelectedIndex((i) => Math.max(0, i - 1));
          return;
        }

        // Control navigation while filtering:
        // ctrl+j (0x0A) or ctrl+n (0x0E) -> down
        if (input === "\x0A" || input === "\x0E") {
          setSelectedIndex((i) =>
            filteredEntries.length === 0
              ? 0
              : Math.min(filteredEntries.length - 1, i + 1)
          );
          return;
        }

        // ctrl+k (0x0B) or ctrl+p (0x10) -> up
        if (input === "\x0B" || input === "\x10") {
          setSelectedIndex((i) => Math.max(0, i - 1));
          return;
        }
        return;
      }

      // focus === "list"
      if (input === "/") {
        if (!searchMode) {
          setError("");
          setSearchMode(true);
          setSearchText("");
          setSearchInputKey((k) => k + 1);
        }
        setFocus("search");
        return;
      }
      if (input === ESCAPE) {
        if (ignoreEscapeOnce.current) {
          ignoreEscapeOnce.current = false; // consume this one
          return;
        }
        onScreenChange("");
      }
    },
    [focus, searchMode, filteredEntries, onScreenChange]
  );

  // Layout / frame (reuse style from About)
  const { width: termWidth, height: termHeight } = useSize();
  const longest =
    entries.reduce((m, e) => Math.max(m, e.label.length), currentPath.length) +
    4;
  const modalWidth = Math.min(Math.max(40, longest + 4), termWidth - 4);
  const contentHeight = 16; // hard-coded: 20 list + 4 other
  const {
    frame,
    startX,
    startY,
    contentStartX,
    listY,
    bannerY, // bannerY unused; reuse structure for consistency
    backgroundHeight,
  } = buildFrame(contentHeight, termWidth, termHeight, modalWidth);

  const listX = contentStartX + 1;
  const listWidth = 40;
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
      <Text absolute x={listX} y={listY + 1} color="Yellow">
        {currentPath}
      </Text>

      {/* render list of files */}
      <Text absolute x={listX + contentPadding} y={listY + 3}>
        <List
          key={`${JSON.stringify(
            filteredEntries.map((e) => e.fullPath)
          )}-${selectedIndex}`}
          height={13}
          width={listWidth}
          focus={focus === "list"}
          // Re-seed selection each render so manual selectedIndex reflects
          initialPos={{
            x: 0,
            y: selectedIndex,
            xo: 0,
            yo: 0,
            x1: 0,
            x2: 0,
          }}
          scrollbar
          scrollbarBackground={"Black"}
          scrollbarColor={"#AAAAAA"}
          data={filteredEntries}
          renderItem={({ item, selected }) => (
            <Text
              color={selected ? "Black" : item.isDir ? "Cyan" : "White"}
              background={selected ? "Green" : undefined}
            >
              {item.label}
            </Text>
          )}
          onSubmit={onFileSubmission}
        />
      </Text>

      {/* filter input */}
      {searchMode && (
        <Text absolute x={listX} y={backgroundHeight + 14} color="Yellow">
          <Input
            key={`filter-input-${searchInputKey}`}
            width={listWidth}
            height={1}
            background="#303030"
            initialValue={searchText}
            onChange={setSearchText}
            onSubmit={onSearchSubmit}
            onCancel={() => {
              ignoreEscapeOnce.current = true;
              setFocus("list");
            }}
            focus={focus === "search"}
          />
        </Text>
      )}

      {/* render errors */}
      {error && (
        <Text
          absolute
          x={listX + contentPadding}
          y={backgroundHeight + 14}
          color="Red"
        >
          {error}
        </Text>
      )}
      <Text absolute x={listX - 6} y={backgroundHeight + 16}>
        {` Search: / | Navigate: Ctrl+n/p ↑/↓ | Esc: Go Back `}
      </Text>
    </Text>
  );
};

export default Files;
