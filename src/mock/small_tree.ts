import { TEdge, TNode } from "../types";

export const nodes: TNode[] = [
  { id: "b1", value: "Root" },
  { id: "b2", value: "L1 - L" },
  { id: "b3", value: "L1 - R" },
];

export const edges: TEdge[] = [
  { id: "be1", source: "b1", target: "b2" },
  { id: "be2", source: "b1", target: "b3" },
];
