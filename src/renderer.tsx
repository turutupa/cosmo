import React, { useMemo, useState } from "react";
import ReactCurse, { Frame, Text, useInput } from "react-curse";
import Edge from "./edge";
import Graph from "./graph";
import Node from "./node";
import Search from "./search";
import { TNode } from "./types";

const timeNow = () => {
  return new Date().toTimeString().substring(0, 8);
};

type Props = {
  graph: Graph;
  nodeWidth?: number;
};

const Renderer: React.FC<Props> = ({ graph, nodeWidth = 10 }) => {
  const [counter, setCounter] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const nodeCount = graph.nodes.length || 0;
  const edgeCount = graph.edges.length || 0;

  const Nodes = (): JSX.Element[] => {
    return graph.nodes.map((node, i) => (
      <Node
        {...node}
        nodeWidth={nodeWidth}
        key={`node-key-${i}`}
        cursor={graph.cursor}
      />
    ));
  };

  const Edges = (): JSX.Element[] => {
    return graph.edges.map((edge, i) => (
      <Edge
        {...edge}
        key={`edge-key-${i}`}
        source={graph.getElement(edge.source) as TNode}
        target={graph.getElement(edge.target) as TNode}
        cursor={graph.cursor}
      />
    ));
  };

  // handle user input
  useInput(
    (input: string) => {
      if (showSearch) {
        return;
      }

      if (input === "\x10\x0d" || input === "q") {
        ReactCurse.exit();
      } else if (input === "j" || input === "\x1b[B") {
        graph.pan(0, 2);
      } else if (input === "k" || input === "\x1b[A") {
        graph.pan(0, -2);
      } else if (input === "h" || input === "\x1b[D") {
        graph.pan(-5, 0);
      } else if (input === "l" || input === "\x1b[C") {
        graph.pan(5, 0);
      } else if (input === "J") {
        graph.pan(0, 8);
      } else if (input === "K") {
        graph.pan(0, -8);
      } else if (input === "H") {
        graph.pan(-25, 0);
      } else if (input === "L") {
        graph.pan(25, 0);
      } else if (input === "c") {
        graph.fitView();
      } else if (input === "/") {
        setShowSearch(true);
      }
      setCounter((prev) => prev + 1);
    },
    [showSearch]
  );

  // status line with node/edge count and help
  const statusLine = useMemo(() => {
    return (
      <Text absolute x={0} y={0}>
        <Frame>
          {" "}
          Nodes: <Text bold>{nodeCount}</Text> | Edges:{" "}
          <Text bold>{edgeCount}</Text> | <Text bold>/</Text> to search |{" "}
          <Text bold>q</Text> to exit{" "}
        </Frame>
      </Text>
    );
  }, [edgeCount, nodeCount]);

  return (
    <>
      {/* render nodes && edges */}
      <Text key={counter}>
        <Edges />
        <Nodes />
      </Text>

      {/* status line */}
      {statusLine}

      {/* search "modal" */}
      {showSearch && <Search graph={graph} setShowSearch={setShowSearch} />}
    </>
  );
};

export default Renderer;
