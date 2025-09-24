import { useEffect, useState } from "react";
import ReactCurse, { useSize } from "react-curse";
import Graph from "./graph";
import { edges, nodes } from "./mock/graph";
import Renderer from "./renderer";
import { TImportDto } from "./types";

type Props = {
  importDto: TImportDto;
};

const App: React.FC<Props> = ({ importDto }) => {
  const { nodes, edges } = importDto;
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

  return <Renderer graph={graph} />;
};

ReactCurse.render(<App importDto={{ nodes, edges }} />);
