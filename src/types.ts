export type TImportDto = {
  nodes: TNode[];
  edges: TEdge[];
  nodeWidth?: number;
  nodeHeight?: number;
};

export type TNode = {
  id: string;
  value: string;
  position?: TCoordinate;
};

export type TEdge = {
  id: string;
  source: string;
  target: string;
  path?: TCoordinate[];
};

export type TCoordinate = {
  x: number;
  y: number;
};
