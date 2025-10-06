import Cosmo from "../src/app";
import { TEdge, TNode } from "../src/types";

const app = async () => {
  const nodes: TNode[] = [
    { id: "b1", value: "Root" },
    { id: "b2", value: "L1 - L" },
    { id: "b3", value: "L1 - R" },
  ];

  const edges: TEdge[] = [
    { id: "be1", source: "b1", target: "b2" },
    { id: "be2", source: "b1", target: "b3" },
  ];

  Cosmo({ nodes, edges });
};

app();
