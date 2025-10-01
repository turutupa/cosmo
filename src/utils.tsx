import { Text } from "react-curse";
import { TCoordinate } from "./types";

/**
 * Generate all points along an orthogonal path between source and target.
 * The bend is at the midway horizontal position, forming an L→⎾ shape.
 */
export function getOrthogonalPathPoints(
  source: TCoordinate,
  target: TCoordinate
): TCoordinate[] {
  const { x: sx, y: sy } = source;
  const { x: tx, y: ty } = target;

  const points: TCoordinate[] = [];

  // Check relative quadrant
  const isRight = tx >= sx;
  const isBelow = ty >= sy;

  if (isRight && isBelow) {
    // Target is bottom-right, go horizontal then vertical
    const midX = sx + Math.round((tx - sx) / 2);

    // Horizontal segment
    for (let x = sx; x !== midX; x += midX > sx ? 1 : -1) {
      points.push({ x, y: sy });
    }
    points.push({ x: midX, y: sy });

    // Vertical segment
    for (let y = sy; y !== ty; y += ty > sy ? 1 : -1) {
      points.push({ x: midX, y });
    }
    points.push({ x: midX, y: ty });

    // Final horizontal to target
    for (let x = midX; x !== tx; x += tx > midX ? 1 : -1) {
      points.push({ x, y: ty });
    }
    points.push({ x: tx, y: ty });
  } else if (!isRight && isBelow) {
    // Target is bottom-left, go vertical then horizontal
    const midY = sy + Math.round((ty - sy) / 2);

    // Vertical segment
    for (let y = sy; y !== midY; y += midY > sy ? 1 : -1) {
      points.push({ x: sx, y });
    }
    points.push({ x: sx, y: midY });

    // Horizontal segment
    for (let x = sx; x !== tx; x += tx > sx ? 1 : -1) {
      points.push({ x, y: midY });
    }
    points.push({ x: tx, y: midY });

    // Vertical segment to target
    for (let y = midY; y !== ty; y += ty > midY ? 1 : -1) {
      points.push({ x: tx, y });
    }
    points.push({ x: tx, y: ty });
  } else {
    // For other cases (e.g. target above source), route vertical then horizontal by default.
    const midY = sy + Math.round((ty - sy) / 2);

    // Vertical segment
    for (let y = sy; y !== midY; y += midY > sy ? 1 : -1) {
      points.push({ x: sx, y });
    }
    points.push({ x: sx, y: midY });

    // Horizontal segment
    for (let x = sx; x !== tx; x += tx > sx ? 1 : -1) {
      points.push({ x, y: midY });
    }
    points.push({ x: tx, y: midY });

    // Vertical segment to target
    for (let y = midY; y !== ty; y += ty > midY ? 1 : -1) {
      points.push({ x: tx, y });
    }
    points.push({ x: tx, y: ty });
  }

  return points;
}

// Determines the character to represent a segment of the path.
function charForSegment(
  prev: TCoordinate | null,
  current: TCoordinate,
  next: TCoordinate | null
): string {
  const isHorizontal = (a: TCoordinate, b: TCoordinate) =>
    a.y === b.y && a.x !== b.x;
  const isVertical = (a: TCoordinate, b: TCoordinate) =>
    a.x === b.x && a.y !== b.y;

  if (!prev && next) {
    // Start point - direction towards next
    return isHorizontal(current, next) ? "─" : "│";
  }
  if (prev && !next) {
    // End point - direction coming from prev
    return isHorizontal(prev, current) ? "─" : "│";
  }
  if (prev && next) {
    const fromHoriz = isHorizontal(prev, current);
    const toHoriz = isHorizontal(current, next);
    const fromVert = isVertical(prev, current);
    const toVert = isVertical(current, next);

    // Straight line horizontal or vertical
    if (fromHoriz && toHoriz) return "─";
    if (fromVert && toVert) return "│";

    // Now the four corner cases - order is important
    // Corner decision based on directions and relative coords

    if (fromVert && toHoriz && prev.y < current.y && current.x < next.x)
      return "└";
    if (fromVert && toHoriz && prev.y < current.y && current.x > next.x)
      return "┘";
    if (fromVert && toHoriz && prev.y > current.y && current.x < next.x)
      return "┐";
    if (fromVert && toHoriz && prev.y > current.y && current.x > next.x)
      return "┌";

    if (fromHoriz && toVert && prev.x > current.x && current.y < next.y)
      return "┌";
    if (fromHoriz && toVert && prev.x < current.x && current.y < next.y)
      return "┐";
    if (fromHoriz && toVert && prev.x > current.x && current.y > next.y)
      return "┘";
    if (fromHoriz && toVert && prev.x < current.x && current.y > next.y)
      return "└";
  }

  // Fallback
  return "·";
}

// Converts a path of coordinates into a rendered path with characters.
export function makePathRendering(
  path: TCoordinate[]
): { position: TCoordinate; char: string }[] {
  const result: { position: TCoordinate; char: string }[] = [];
  for (let i = 0; i < path.length; i++) {
    let prev = i > 0 ? path[i - 1] : null;
    const current = path[i];
    if (current.x === prev?.x && current.y === prev?.y) {
      prev = path[i - 2];
    }
    const next = i < path.length - 1 ? path[i + 1] : null;

    const char = charForSegment(prev, current, next);
    result.push({ position: current, char });
  }
  return result;
}

/**
 * Generates a rendering path between two coordinates.
 *
 * @param source - The starting coordinate of the path.
 * @param target - The ending coordinate of the path.
 * @returns A string representing the rendered path.
 */
export function getPath(source: TCoordinate, target: TCoordinate) {
  const path = getOrthogonalPathPoints(source, target);
  return makePathRendering(path);
}

/**
 * Builds a text-based frame with specified dimensions and content placement details.
 *
 * @param contentHeight - The height of the content to be displayed inside the frame.
 * @param termWidth - The total width of the available space.
 * @param termHeight - The total height of the available space.
 * @returns An object containing the frame's lines, starting positions, and layout details:
 * - `frameLines`: An array of strings representing the lines of the frame.
 * - `startX`: The X-coordinate where the frame starts.
 * - `startY`: The Y-coordinate where the frame starts.
 * - `contentStartX`: The X-coordinate where the content starts inside the frame.
 * - `bannerY`: The Y-coordinate of the banner section inside the frame.
 * - `listY`: The Y-coordinate where the list content starts inside the frame.
 * - `backgroundHeight`: The total height of the frame's background, including padding.
 */
export function buildFrame(
  contentHeight: number,
  termWidth: number,
  termHeight: number,
  width?: number
) {
  const maxLen = width ?? 22;
  const innerPaddingX = 8;
  const innerPaddingY = 3;
  const paddingBottom = 3;
  const bannerHeight = 3;
  const contentWidth = maxLen + innerPaddingX * 2;

  const top = `┌${"─".repeat(contentWidth)}┐`;
  const makeEmptyRow = () => `│${" ".repeat(contentWidth)}│`;
  const contentRows = Array(
    innerPaddingY * 2 + bannerHeight + contentHeight
  ).fill(makeEmptyRow());
  const bottom = `└${"─".repeat(contentWidth)}┘`;
  const frameLines = [top, ...contentRows, bottom];

  const frameHeight = innerPaddingY * 2 + contentHeight + 2; // top and bottom borders
  const frameWidth = contentWidth + 2;
  const startX = Math.max(0, Math.floor((termWidth - frameWidth) / 2));
  const startY = Math.max(0, Math.floor((termHeight - frameHeight) / 2));

  const contentStartX = startX + 1 + innerPaddingX;
  const bannerY = startY + innerPaddingY;
  const listY = bannerY + bannerHeight + 1;
  const backgroundHeight =
    bannerHeight + contentHeight + innerPaddingY + paddingBottom; // adjust for padding

  const frame = (
    <Text absolute x={startX} y={startY} block>
      {frameLines.join("\n")}
    </Text>
  );

  return {
    frame,
    frameLines,
    startX,
    startY,
    contentStartX,
    bannerY,
    listY,
    backgroundHeight,
  };
}
