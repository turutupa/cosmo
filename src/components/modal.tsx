import React, { ReactNode, useRef } from "react";
import { Text, useSize } from "react-curse";
import { useMeasureChildren } from "../hooks/useMeasureChildren";
import { useTheme } from "../hooks/useTheme";

type Props = {
  children: ReactNode;
  footer?: string;
  pt?: number;
  pb?: number;
  pl?: number;
  pr?: number;
  size?: "sm" | "md" | "lg" | "xl" | "fullscreen";
  background?: string;
  hideBorders?: boolean;
};

const sizePresets: Record<
  NonNullable<Props["size"]>,
  { vertical: number; horizontal: number }
> = {
  sm: { vertical: 2, horizontal: 16 },
  md: { vertical: 4, horizontal: 20 },
  lg: { vertical: 6, horizontal: 24 },
  xl: { vertical: 8, horizontal: 32 },
  fullscreen: { vertical: 0, horizontal: 0 },
};

const Modal: React.FC<Props> = ({
  children,
  footer,
  pt = 0,
  pb = 0,
  pl = 0,
  pr = 0,
  size = "md",
  background,
  hideBorders = false,
}) => {
  const { theme } = useTheme();
  const { width: termWidth, height: termHeight } = useSize();
  const initialChildrenRef = useRef(children);
  const { width: childWidth, height: childHeight } = useMeasureChildren(
    initialChildrenRef.current
  );

  const preset = sizePresets[size];

  // Split preset aggregate padding into per-side base values
  const baseVertical = preset.vertical;
  const baseHorizontal = preset.horizontal;
  const baseTop = Math.floor(baseVertical / 2);
  const baseBottom = baseVertical - baseTop;
  const baseLeft = Math.floor(baseHorizontal / 2);
  const baseRight = baseHorizontal - baseLeft;

  // Apply additive adjustments (clamped to >= 0)
  const padTop = baseTop + pt;
  const padBottom = baseBottom + pb;
  const padLeft = baseLeft + pl;
  const padRight = baseRight + pr;

  // Width/height include frame borders (2) plus padding plus child size
  let modalWidth = childWidth + padLeft + padRight + 2;
  let modalHeight = childHeight + padTop + padBottom + 2;

  // positioning
  let x = Math.floor((termWidth - modalWidth) / 2);
  let y = Math.floor((termHeight - modalHeight) / 2);

  const isFullscreen = size === "fullscreen";
  if (isFullscreen) {
    // Override geometry to occupy the whole terminal
    x = 0;
    y = 0;
    modalWidth = termWidth;
    modalHeight = termHeight;
  }

  // frame (omit in fullscreen)
  const frame = isFullscreen ? null : buildFrame(x, y, modalWidth, modalHeight);

  // footer positioning
  let footerNode: React.ReactNode = null;
  if (footer) {
    if (isFullscreen) {
      const bottomPadding = 1;
      const availableWidth = termWidth;
      let renderFooter = ` ${footer} `;
      if (renderFooter.length > availableWidth) {
        renderFooter = renderFooter.slice(0, availableWidth);
      }
      const footerY = termHeight - 1 - bottomPadding;
      const footerX = Math.max(
        0,
        Math.floor((availableWidth - renderFooter.length) / 2)
      );
      footerNode = (
        <Text
          absolute
          x={footerX}
          y={footerY}
          background={theme.green}
          color={theme.black}
        >
          {renderFooter}
        </Text>
      );
    } else {
      const innerWidth = modalWidth - 2;
      let renderFooter = ` ${footer} `;
      if (renderFooter.length > innerWidth) {
        renderFooter = renderFooter.slice(0, innerWidth);
      }
      const footerY = y + modalHeight - 1;
      const footerX =
        x + 1 + Math.max(0, Math.floor((innerWidth - renderFooter.length) / 2));
      footerNode = (
        <Text
          absolute
          x={footerX}
          y={footerY}
          background={theme.green}
          color={theme.black}
        >
          {renderFooter}
        </Text>
      );
    }
  }

  return (
    <Text
      absolute
      x={x}
      y={y}
      background={background ?? theme.black}
      width={modalWidth}
      height={modalHeight - 1}
    >
      {isFullscreen && (
        <Text
          absolute
          x={0}
          y={0}
          height={termHeight}
          width={termWidth}
          background={theme.black}
        ></Text>
      )}

      {/* render frame */}
      {!hideBorders && frame}

      {/* content area (now honors per-side padding) */}
      {children}

      {/* footer */}
      {footerNode}
    </Text>
  );
};

function buildFrame(x: number, y: number, width: number, height: number) {
  const frame: React.ReactNode[] = [];
  // Top border
  frame.push(
    <Text key="top" absolute x={x} y={y}>
      {"┌" + "─".repeat(width - 2) + "┐"}
    </Text>
  );
  // Middle rows (sides only)
  for (let i = 1; i < height - 1; i++) {
    frame.push(
      <Text key={`side-${i}`} absolute x={x} y={y + i}>
        {"│" + " ".repeat(width - 2) + "│"}
      </Text>
    );
  }
  // Bottom border
  frame.push(
    <Text key="bottom" absolute x={x} y={y + height - 1}>
      {"└" + "─".repeat(width - 2) + "┘"}
    </Text>
  );
  return frame;
}

export default Modal;
