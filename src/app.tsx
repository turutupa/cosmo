import { useCallback, useEffect, useState } from "react";
import ReactCurse, { useSize } from "react-curse";
import Graph from "./graph";
import Renderer from "./renderer";
import { TEdge, TNode } from "./types";

type Props = {
  nodes?: TNode[];
  edges?: TEdge[];
  nodeWidth?: number;
  nodeHeight?: number;
};

const App: React.FC<Props> = ({ nodes, edges }) => {
  const [graph, setGraph] = useState<Graph | undefined>(undefined);
  const { width: termWidth, height: termHeight } = useSize();

  // initialize graph on first graph / edges provided
  useEffect(() => {
    if (!nodes || !edges) {
      return;
    }

    const initializeGraph = async () => {
      const createdGraph = await Graph.create({
        nodes,
        edges,
        termSize: { width: termWidth, height: termHeight },
      });
      setGraph(createdGraph);
    };
    initializeGraph();
  }, [nodes, edges]);

  // update terminal size in graph (for relative positioning)
  useEffect(() => {
    graph?.setTermSize(termWidth, termHeight);
  }, [termWidth, termHeight]);

  const loadGraph = useCallback((newGraph: Graph) => {
    setGraph(newGraph);
  }, []);

  // do not render if terminal size is invalid
  if (termWidth < 1 || termHeight < 1) {
    return <></>;
  }

  return (
    <Renderer
      initialScreen={graph ? "" : "openingMenu"}
      loadGraph={loadGraph}
      graph={graph}
    />
  );
};

ReactCurse.render(<App />);
