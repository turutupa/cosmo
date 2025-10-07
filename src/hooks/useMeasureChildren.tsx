import React, { ReactNode, useMemo } from "react";

// Heuristic measurement for react-curse <Text> trees.
// Assumptions:
// - Only <Text> contributes visible characters.
// - Props: absolute, x, y determine placement; otherwise treat as flowing at (0,0).
// - Strings / numbers are rendered verbatim; newlines split vertically.
// Limitations: does not account for styling width changes, wide Unicode, truncation, wrapping inside Text.
export function useMeasureChildren(children: ReactNode): {
  width: number;
  height: number;
} {
  return useMemo(() => computeChildrenBoundingBox(children), [children]);
}

function computeChildrenBoundingBox(node: ReactNode): {
  width: number;
  height: number;
} {
  const lines = new Map<number, string>(); // y -> line content
  let minY = Infinity;
  let maxY = -Infinity;
  // removed maxWidth; new char extents tracking instead
  let minCharX = Infinity;
  let maxCharX = -Infinity;

  function placeTextAt(x: number, y: number, content: string) {
    const split = content.split("\n");
    split.forEach((line, i) => {
      const cy = y + i;
      minY = Math.min(minY, cy);
      maxY = Math.max(maxY, cy);
      const existing = lines.get(cy) || "";
      const neededPad = x - existing.length;
      const padded =
        neededPad > 0 ? existing + " ".repeat(neededPad) : existing;
      let merged = padded.slice(0, x) + line;
      if (merged.length < padded.length) {
        merged = merged + padded.slice(merged.length);
      }
      lines.set(cy, merged);

      // Track only real (non-trailing-space) glyph extents for width
      const visible = line.replace(/\s+$/u, "");
      if (visible.length > 0) {
        minCharX = Math.min(minCharX, x);
        maxCharX = Math.max(maxCharX, x + visible.length - 1);
      }
    });
  }

  function walk(child: ReactNode, offsetX: number, offsetY: number) {
    if (child == null || typeof child === "boolean") return;
    if (typeof child === "string" || typeof child === "number") {
      placeTextAt(offsetX, offsetY, String(child));
      return;
    }
    if (Array.isArray(child)) {
      child.forEach((c) => walk(c, offsetX, offsetY));
      return;
    }
    if (React.isValidElement(child)) {
      const props: any = child.props || {};
      let nextX = offsetX;
      let nextY = offsetY;
      if (props.absolute) {
        nextX = props.x ?? 0;
        nextY = props.y ?? 0;
      }
      walk(props.children, nextX, nextY);
    }
  }

  walk(node, 0, 0);

  if (maxY === -Infinity) {
    return { width: 0, height: 0 };
  }

  const height = maxY - minY + 1;
  const width = maxCharX === -Infinity ? 0 : maxCharX - minCharX + 1;

  return { width, height };
}
