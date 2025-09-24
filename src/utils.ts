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

export function getPath(source: TCoordinate, target: TCoordinate) {
  const path = getOrthogonalPathPoints(source, target);
  return makePathRendering(path);
}
