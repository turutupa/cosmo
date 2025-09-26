import ELK from "elkjs/lib/elk.bundled.js";
import { DEFAULT_NODE_WIDTH, FRAME_HEIGHT } from "./node";
import { TCoordinate, TEdge, TNode } from "./types";

type Props = {
  nodes: TNode[];
  edges: TEdge[];
  termSize: { width: number; height: number };
  nodeWidth?: number;
  renderNodeId?: boolean;
};

const defaultProps: Pick<Props, "nodeWidth" | "renderNodeId"> = {
  nodeWidth: DEFAULT_NODE_WIDTH,
  renderNodeId: true,
};

export default class Graph {
  private props: Required<Props>;
  private pos: TCoordinate = { x: 0, y: 0 };
  private nodesLookup: Map<string, TNode> = new Map();
  private edgesLookup: Map<string, TEdge> = new Map();

  private constructor(props: Props) {
    this.props = {
      ...defaultProps,
      ...props,
    } as Required<Props>;
  }

  public static async create(props: Props): Promise<Graph> {
    const graph = new Graph(props);
    // auto layout nodes and edges
    if (!graph.hasCoordinates()) {
      await graph.autolayout();
    }
    // populate nodes && edges lookup
    for (const node of graph.nodes) {
      graph.nodesLookup.set(node.id, node);
    }
    for (const edge of graph.edges) {
      graph.edgesLookup.set(edge.id, edge);
    }
    return graph;
  }

  /**
   * Provided an ID it will return the associated node or edge
   * @param id
   * @returns
   */
  public getElement(id: string): TNode | TEdge {
    const node = this.nodesLookup.get(id)!;
    const edge = this.edgesLookup.get(id)!;
    return node || edge;
  }

  public get nodes() {
    return this.props.nodes;
  }

  public get edges() {
    return this.props.edges;
  }

  public get nodeWidth(): number {
    return this.props.nodeWidth;
  }

  public pan(moveX: number, moveY: number) {
    this.pos.x += moveX;
    this.pos.y += moveY;
  }

  public get cursor(): TCoordinate {
    return { x: this.pos.x, y: this.pos.y };
  }

  public get termSize() {
    return this.props.termSize;
  }

  public setTermSize(width: number, height: number) {
    this.props.termSize = { width, height };
  }

  private hasCoordinates(): boolean {
    return false;
    // return this.props.nodes.every(
    //   (node) => node.position?.x !== undefined && node.position?.y !== undefined
    // );
  }

  private async autolayout() {
    // approx node dimensions
    const nodeWidth = this.props.nodeWidth;
    const nodeHeight = 6;

    // create elk graph
    const elk = new ELK();
    const elkGraph = {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "mrtree", // try mrtree if not rendering nicely
        "elk.direction": "DOWN",
        "elk.spacing.nodeNode": "6",
        "elk.edgeRouting": "ORTHOGONAL",
      },
      children: this.props.nodes.map((node) => ({
        id: node.id,
        width: nodeWidth,
        height: nodeHeight,
      })),
      edges: this.props.edges.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        sources: [edge.source],
        targets: [edge.target],
      })),
    };

    // compute layout
    const elkResult = await elk.layout(elkGraph);

    // overwrite the node coordinates
    for (const node of this.props.nodes) {
      const computedNode = elkResult.children?.find(
        (child) => child.id === node.id
      ) || { x: 0, y: 0 };
      const { x, y } = computedNode || { x: 0, y: 0 };
      node.position = { x: Math.round(x ?? 0), y: Math.round(y ?? 0) };
    }

    // calculate and store edge paths
    for (const edge of this.props.edges) {
      const computedEdge = elkResult.edges?.find(
        (e) => e.id === `${edge.source}-${edge.target}`
      );

      if (computedEdge?.sections?.[0]) {
        const section = computedEdge.sections[0];
        const path = [
          section.startPoint, // Start point
          ...(section.bendPoints || []), // Bend points (if any)
          section.endPoint, // End point
        ].map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) })); // Map to { x, y } format
        edge.path = path;
      } else {
        edge.path = [];
      }
    }
  }

  // Center viewport on:
  // 1. Provided focusId node (if given and positioned)
  // 2. Otherwise a root node (in-degree 0) with smallest y then x
  // 3. Otherwise smallest y/x node
  // 4. Fallback: bounding box center
  public fitView(focusId?: string) {
    const termW = this.props.termSize.width;
    const termH = this.props.termSize.height;

    // used for adjusting manually x and y axis of centered node
    const paddingX = 8;
    const paddingY = 16;

    const hasPos = (
      n: TNode | undefined | null
    ): n is TNode & { position: { x: number; y: number } } =>
      !!n &&
      !!n.position &&
      typeof n.position.x === "number" &&
      typeof n.position.y === "number";

    // 1. Explicit focus node
    if (focusId) {
      const focusNode = this.getElement(focusId) as TNode;
      if (hasPos(focusNode)) {
        this.pos = {
          x:
            focusNode.position.x -
            Math.floor(termW / 2) +
            Math.floor(this.nodeWidth / 2),
          y: focusNode.position.y - Math.floor(termH / 2),
        };
        return;
      }
      // If not found or lacks position, proceed with default strategy
    }

    // Build in-degree map
    const inDegree = new Map<string, number>();
    for (const n of this.nodes) inDegree.set(n.id, 0);
    for (const e of this.edges) {
      if (inDegree.has(e.target)) {
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      }
    }

    // Roots: nodes with in-degree 0
    const roots = this.nodes.filter((n) => inDegree.get(n.id) === 0);

    // Candidate selection:
    // 1. any root with position
    // 2. if multiple, pick smallest y then x
    // 3. if no roots (cycle), pick globally smallest y then x
    const positionalSort = (a: TNode, b: TNode) => {
      const ay = a.position?.y ?? Infinity;
      const by = b.position?.y ?? Infinity;
      if (ay !== by) return ay - by;
      const ax = a.position?.x ?? Infinity;
      const bx = b.position?.x ?? Infinity;
      return ax - bx;
    };

    let startNode: TNode | undefined = roots
      .filter(hasPos)
      .sort(positionalSort)[0];

    if (!startNode) {
      startNode = this.nodes.filter(hasPos).sort(positionalSort)[0];
    }

    if (hasPos(startNode)) {
      this.pos = {
        x: startNode.position.x - Math.floor(termW / 2) + paddingX,
        y: startNode.position.y - Math.floor(termH / 2) + paddingY,
      };
      return;
    }

    // Fallback: center on bounding box of all positioned nodes
    const positions = this.nodes
      .map((n) => n.position)
      .filter(
        (p): p is { x: number; y: number } =>
          p?.x !== undefined && p?.y !== undefined
      );

    let centerX: number;
    let centerY: number;

    if (positions.length) {
      const xs = positions.map((p) => p.x);
      const ys = positions.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      centerX = (minX + maxX) / 2;
      centerY = (minY + maxY) / 2;
    } else {
      centerX = this.nodes[0]?.position?.x ?? 0;
      centerY = this.nodes[0]?.position?.y ?? 0;
    }

    this.pos = {
      x: centerX - termW / 2 + paddingX,
      y: centerY - termH / 2 + paddingY,
    };
  }

  // Search nodes by id or value-like fields.
  // Categories:
  //  - exact: case-insensitive exact match
  //  - sliced: query is a substring (not exact)
  //  - fuzzy: Levenshtein distance <= maxDistance (default 2)
  // Returns ranked buckets plus a merged 'all' list (priority: exact > sliced > fuzzy).
  public search(
    rawQuery: string,
    options?: { limit?: number; maxDistance?: number }
  ): {
    exact: TNode[];
    sliced: { node: TNode; field: string; index: number }[];
    fuzzy: { node: TNode; field: string; distance: number }[];
    all: TNode[];
  } {
    const query = (rawQuery || "").trim().toLowerCase();
    const limit = options?.limit ?? 50;
    const maxDistance = options?.maxDistance ?? 2;

    if (!query) {
      return { exact: [], sliced: [], fuzzy: [], all: [] };
    }

    const exact: TNode[] = [];
    const sliced: { node: TNode; field: string; index: number }[] = [];
    const fuzzy: { node: TNode; field: string; distance: number }[] = [];

    // Helper to collect candidate textual fields from a node
    const getFields = (n: TNode): string[] => {
      const out: string[] = [];
      const anyNode = n as any;
      const candidates = [
        n.id,
        anyNode.value,
        anyNode.label,
        anyNode.name,
        anyNode.title,
      ];
      for (const c of candidates) {
        if (typeof c === "string") {
          const trimmed = c.trim();
          if (trimmed) out.push(trimmed);
        }
      }
      // Deduplicate while preserving order
      return [...new Set(out)];
    };

    for (const node of this.nodes) {
      const fields = getFields(node);
      let classified = false;

      // Exact & sliced
      for (const field of fields) {
        const lower = field.toLowerCase();
        if (lower === query) {
          exact.push(node);
          classified = true;
          break; // Highest priority
        }
      }
      if (classified) continue;

      let addedSlice = false;
      for (const field of fields) {
        const lower = field.toLowerCase();
        const idx = lower.indexOf(query);
        if (idx !== -1) {
          sliced.push({ node, field, index: idx });
          addedSlice = true;
          break; // Only record first sliced field
        }
      }
      if (addedSlice) continue;

      // Fuzzy
      let bestDistance = Infinity;
      let bestField: string | null = null;
      for (const field of fields) {
        const dist = Graph._levenshtein(query, field.toLowerCase());
        if (dist < bestDistance) {
          bestDistance = dist;
          bestField = field;
        }
        if (bestDistance === 1) break; // cannot get better than 1 except 0 (already excluded)
      }
      if (
        bestField !== null &&
        bestDistance <= maxDistance &&
        bestDistance > 0
      ) {
        fuzzy.push({ node, field: bestField, distance: bestDistance });
      }
    }

    // Sorting
    exact.sort((a, b) => a.id.localeCompare(b.id));

    sliced.sort((a, b) => {
      if (a.index !== b.index) return a.index - b.index;
      if (a.field.length !== b.field.length)
        return a.field.length - b.field.length;
      return a.node.id.localeCompare(b.node.id);
    });

    fuzzy.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.field.length !== b.field.length)
        return a.field.length - b.field.length;
      return a.node.id.localeCompare(b.node.id);
    });

    // Build unified list with priority and uniqueness
    const seen = new Set<string>();
    const all: TNode[] = [];
    for (const n of exact) {
      if (!seen.has(n.id)) {
        all.push(n);
        seen.add(n.id);
      }
    }
    for (const { node } of sliced) {
      if (!seen.has(node.id)) {
        all.push(node);
        seen.add(node.id);
      }
    }
    for (const { node } of fuzzy) {
      if (!seen.has(node.id)) {
        all.push(node);
        seen.add(node.id);
      }
    }

    // Apply limit to all (buckets remain full)
    const limitedAll = all.slice(0, limit);

    return {
      exact,
      sliced: sliced.filter((s) => limitedAll.includes(s.node)),
      fuzzy: fuzzy.filter((f) => limitedAll.includes(f.node)),
      all: limitedAll,
    };
  }

  // Levenshtein distance (iterative, O(min(m,n)) space)
  private static _levenshtein(a: string, b: string): number {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    if (a.length < b.length) [a, b] = [b, a]; // ensure a is longer
    let prev = new Array(b.length + 1);
    let curr = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      curr[0] = i;
      const ca = a.charCodeAt(i - 1);
      for (let j = 1; j <= b.length; j++) {
        const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(
          prev[j] + 1, // deletion
          curr[j - 1] + 1, // insertion
          prev[j - 1] + cost // substitution
        );
      }
      [prev, curr] = [curr, prev];
    }
    return prev[b.length];
  }

  public getFocusedNode(): TNode | null {
    const { width: termWidth, height: termHeight } = this.termSize;
    const centerX = Math.floor(termWidth / 2);
    const centerY = Math.floor(termHeight / 2);

    let focused: TNode | null = null;

    for (const node of this.props.nodes) {
      if (!node.position) continue;
      const relativeX = node.position.x - this.cursor.x;
      const relativeY = node.position.y - this.cursor.y;

      const inside =
        centerX >= relativeX &&
        centerX <= relativeX + this.nodeWidth + 2 &&
        centerY >= relativeY - 2 &&
        centerY <= relativeY + FRAME_HEIGHT - 2;

      if (inside) {
        focused = node;
        break; // first matching node
      }
    }
    return focused;
  }
}
