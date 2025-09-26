import { TEdge, TNode } from "../types";

export const nodes: TNode[] = [
  { id: "b1", value: "Root" },
  { id: "b2", value: "L1 - L" },
  { id: "b3", value: "L1 - R" },
  { id: "b4", value: "L2 - LL" },
  { id: "b5", value: "L2 - LR" },
  { id: "b6", value: "L2 - RL" },
  { id: "b7", value: "L2 - RR" },
  { id: "b8", value: "L3 - LLL" },
  { id: "b9", value: "L3 - LLR" },
  { id: "b10", value: "L3 - LRL" },
  { id: "b11", value: "L3 - LRR" },
  { id: "b12", value: "L3 - RLL" },
  { id: "b13", value: "L3 - RLR" },
  { id: "b14", value: "L3 - RRL" },
  { id: "b15", value: "L3 - RRR" },
];

export const edges: TEdge[] = [
  { id: "be1", source: "b1", target: "b2" },
  { id: "be2", source: "b1", target: "b3" },
  { id: "be3", source: "b2", target: "b4" },
  { id: "be4", source: "b2", target: "b5" },
  { id: "be5", source: "b3", target: "b6" },
  { id: "be6", source: "b3", target: "b7" },
  { id: "be7", source: "b4", target: "b8" },
  { id: "be8", source: "b4", target: "b9" },
  { id: "be9", source: "b5", target: "b10" },
  { id: "be10", source: "b5", target: "b11" },
  { id: "be11", source: "b6", target: "b12" },
  { id: "be12", source: "b6", target: "b13" },
  { id: "be13", source: "b7", target: "b14" },
  { id: "be14", source: "b7", target: "b15" },
];
