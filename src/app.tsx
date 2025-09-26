import { useEffect, useState } from "react";
import ReactCurse, { useSize } from "react-curse";
import Graph from "./graph";
import Renderer from "./renderer";
import { TEdge, TNode } from "./types";

import { edges, nodes } from "./mock/graph";

type Props = {
  nodes: TNode[];
  edges: TEdge[];
  nodeWidth?: number;
  nodeHeight?: number;
};

const App: React.FC<Props> = ({ nodes, edges, nodeWidth, nodeHeight }) => {
  const [graph, setGraph] = useState<Graph | null>(null);
  const { width, height } = useSize();

  // initialize graph on first graph / edges provided
  useEffect(() => {
    const initializeGraph = async () => {
      const createdGraph = await Graph.create({
        nodes,
        edges,
        termSize: { width, height },
      });
      setGraph(createdGraph);
    };
    initializeGraph();
  }, [nodes, edges]);

  // adjust terminal size in graph (for relative positioning)
  useEffect(() => {
    graph?.setTermSize(width, height);
  }, [width, height]);

  if (!graph) {
    return <></>;
  }

  if (width < 1 || height < 1) {
    return <></>;
  }

  return <Renderer graph={graph} />;
};

ReactCurse.render(<App nodes={nodes} edges={edges} />);
