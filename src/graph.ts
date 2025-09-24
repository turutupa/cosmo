import ELK from "elkjs/lib/elk.bundled.js";
import { TCoordinate, TEdge, TNode } from "./types";

type Props = {
  nodes: TNode[];
  edges: TEdge[];
  termSize: { width: number; height: number };
  nodeWidth?: number;
  renderNodeId?: boolean;
};

const defaultProps: Pick<Props, "nodeWidth" | "renderNodeId"> = {
  nodeWidth: 10,
  renderNodeId: true,
};

class Graph {
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
    const nodeWidth = 10;
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

    this.fitView();
  }

  // Center viewport on the "Start" node if present; otherwise fall back to centering the whole graph.
  public fitView() {
    const termW = this.props.termSize.width;
    const termH = this.props.termSize.height;
    // used for adjusting manually x and y axis of centered node
    const paddingX = 6;
    const paddingY = 8;

    const hasPos = (
      n: TNode | undefined | null
    ): n is TNode & { position: { x: number; y: number } } =>
      !!n &&
      !!n.position &&
      typeof n.position.x === "number" &&
      typeof n.position.y === "number";

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
        x: startNode.position.x - termW / 2 + paddingX,
        y: startNode.position.y - termH / 2 + paddingY,
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
}

export default Graph;
