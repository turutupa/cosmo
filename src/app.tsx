import { useCallback, useEffect, useState } from "react";
import ReactCurse, { useSize } from "react-curse";
import Renderer from "./components/renderer";
import Graph from "./graph";
import { useTheme, type Colorscheme } from "./hooks/useTheme";
import type { TEdge, TNode } from "./types";

type Props = {
  nodes?: TNode[];
  edges?: TEdge[];
  nodeWidth?: number;
  nodeHeight?: number;
  file?: string;
  colorscheme?: Colorscheme;
};

const App: React.FC<Props> = ({ nodes, edges, file, colorscheme }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [graph, setGraph] = useState<Graph | undefined>(undefined);

  const { theme, setTheme } = useTheme();
  const { width: termWidth, height: termHeight } = useSize();

  const loadGraphFromNodesAndEdges = useCallback(
    async (nodes: TNode[], edges: TEdge[]) => {
      const createdGraph = await Graph.create({
        nodes,
        edges,
        termSize: { width: termWidth, height: termHeight },
      });
      setGraph(createdGraph);
    },
    [colorscheme, termWidth, termHeight]
  );

  const loadGraphFromFile = useCallback(
    async (file: string) => {
      const createdGraph = await Graph.loadFromFile(file, {
        termWidth,
        termHeight,
      });
      if (createdGraph) {
        setGraph(createdGraph);
      }
    },
    [colorscheme, termWidth, termHeight]
  );

  const loadGraph = useCallback((newGraph: Graph) => {
    setGraph(newGraph);
  }, []);

  // initialize graph on first graph / edges provided
  useEffect(() => {
    const loadGraph = async () => {
      if (colorscheme) {
        setTheme(colorscheme);
      }
      if (nodes && edges) {
        await loadGraphFromNodesAndEdges(nodes, edges);
      }
      if (file) {
        await loadGraphFromFile(file);
      }
      setIsLoading(false);
    };

    loadGraph();
  }, [colorscheme, file, nodes, edges]);

  // update terminal size in graph (for relative positioning)
  useEffect(() => {
    graph?.setTermSize(termWidth, termHeight);
  }, [termWidth, termHeight]);

  // wait for loading graph if any
  if (isLoading) {
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

export default (props?: Props) => ReactCurse.render(<App {...props} />);
