import fs from "fs";
import React, { useCallback, useEffect, useState } from "react";
import { Banner, Input, Text, useInput, useSize } from "react-curse";
import { ESCAPE } from "./constants";
import type { TScreen } from "./types";
import { useTheme } from "./useTheme";
import { buildFrame } from "./utils";

type Props = {
  format: "yaml" | "json";
  onScreenChange: (s: TScreen) => void;
  currentDir: string;
  onExport: (filename: string) => void;
};

const MAX_WIDTH = 60;

const Export: React.FC<Props> = ({
  format,
  onScreenChange,
  currentDir,
  onExport,
}) => {
  const { theme } = useTheme();
  const { width: termWidth, height: termHeight } = useSize();

  const [filename, setFilename] = useState(currentDir);
  const [error, setError] = useState<string>("");
  const [counter, setCounter] = useState(0); // used for resetting Input
  const [confirming, setConfirming] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // reset filename if default changes
  // this is a hacky solution to react-curse clearing my input on submission
  useEffect(() => {
    setCounter((prev) => prev + 1);
  }, [filename, setCounter]);

  const frameInnerWidth = Math.max(20, Math.min(MAX_WIDTH, termWidth - 4)) - 2;
  const contentHeight = 2;
  const {
    frame,
    startX,
    startY,
    contentStartX,
    bannerY,
    listY, // reuse for vertical placement
  } = buildFrame(contentHeight, termWidth, termHeight, MAX_WIDTH);

  const onSubmit = useCallback(
    (targetPath: string) => {
      const trimmed = targetPath.trim();
      const preserveFiname = () => {
        setFilename(trimmed);
        setCounter((prev) => prev + 1);
      };

      if (!trimmed) {
        setError("Filename is required");
        preserveFiname();
        return;
      }

      try {
        // If it ends with a path separator, definitely a directory intent
        if (/[\/\\]$/.test(trimmed)) {
          setError("Provided name is a directory");
          preserveFiname();
          return;
        }
        if (fs.existsSync(trimmed) && fs.statSync(trimmed).isDirectory()) {
          setError("Path points to an existing directory");
          preserveFiname();
          return;
        }
      } catch (e) {
        // Non-fatal; proceed if fs not available
      }

      // Build final export path (avoid double extension if user already typed it)
      const finalPath = trimmed.endsWith("." + format)
        ? trimmed
        : trimmed + "." + format;

      // Overwrite check
      try {
        if (fs.existsSync(finalPath) && fs.statSync(finalPath).isFile()) {
          setError("");
          setConfirming(true);
          setPendingPath(finalPath);
          return;
        }
      } catch (_) {
        // ignore
      }

      setError("");
      onExport(finalPath);
      onScreenChange("");
    },
    [format, currentDir, onExport, setFilename, setCounter]
  );

  // Esc + confirmation key handling
  useInput(
    (input: string) => {
      if (input === ESCAPE) {
        if (confirming) {
          setConfirming(false);
          setPendingPath(null);
          setCounter((p) => p + 1); // reset input
          return;
        }
        onScreenChange("");
        return;
      }
      if (confirming) {
        const lower = input.toLowerCase();
        if (lower === "n") {
          setConfirming(false);
          setPendingPath(null);
          setCounter((p) => p + 1);
        } else if (lower === "y" && pendingPath) {
          onExport(pendingPath);
          onScreenChange("");
        }
      }
    },
    [onScreenChange, confirming, pendingPath, onExport]
  );

  const label = "Export as";
  const overwriteLabel = "This file already exists. Overwrite?";
  const inputWidth = Math.max(4, frameInnerWidth - 4);

  const bannerPadding = 18;

  const helpText = confirming
    ? " y overwrite | n cancel | Esc back "
    : " Enter to export | Esc cancel ";

  return (
    <Text absolute x={startX} y={startY} background={theme.black}>
      {frame}

      <Banner
        absolute
        x={contentStartX + bannerPadding}
        y={bannerY}
        color={theme.green}
      >
        EXPORT
      </Banner>

      {!confirming && (
        <>
          {/* filename label */}
          <Text absolute x={contentStartX} y={listY} color={theme.yellow}>
            {label}
          </Text>

          {/* input */}
          <Text absolute x={contentStartX} y={listY + 1}>
            <Input
              key={`export-input-${counter}`}
              width={inputWidth}
              height={1}
              background="#303030"
              initialValue={filename}
              onChange={setFilename}
              onSubmit={onSubmit}
              onCancel={() => onScreenChange("")}
              focus
            />
            <Text absolute x={contentStartX + inputWidth} y={listY + 1}>
              .{format}
            </Text>
          </Text>
        </>
      )}

      {confirming && (
        <>
          <Text
            absolute
            x={
              startX + Math.max(0, Math.floor((76 - overwriteLabel.length) / 2))
            }
            y={listY}
            color={theme.yellow}
          >
            {overwriteLabel}
          </Text>
          {/* Centered overwrite choice buttons (total width = 10 + 2 + 10 = 22) */}
          <Text
            absolute
            x={startX + Math.floor((76 - 22) / 2)}
            y={listY + 2}
            width={10}
            height={1}
            color={theme.white}
            background={theme.brightBlack}
          >
            {"  No (n)  "}
          </Text>
          <Text
            absolute
            x={startX + Math.floor((76 - 22) / 2) + 12} // 10 width + 2 space gap
            y={listY + 2}
            width={10}
            height={1}
            color={theme.black}
            background={theme.green}
          >
            {"  Yes (y) "}
          </Text>
        </>
      )}

      {error && !confirming && (
        <Text
          absolute
          // Center within total frame width of 76
          x={startX + Math.max(0, Math.floor((76 - error.length) / 2))}
          y={listY + 3}
          color={theme.red}
        >
          {error}
        </Text>
      )}

      {/* help line */}
      <Text absolute x={contentStartX + 14} y={listY + 5}>
        {helpText}
      </Text>
    </Text>
  );
};

export default Export;
