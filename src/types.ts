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

export type TSearchResult = {
  exact: TNode[];
  sliced: {
    node: TNode;
    field: string;
    index: number;
  }[];
  fuzzy: {
    node: TNode;
    field: string;
    distance: number;
  }[];
  all: TNode[];
};
