import React, { useState } from "react";
import ReactCurse, { Frame, Text, useInput } from "react-curse";
import Edge from "./edge";
import Graph from "./graph";
import Node from "./node";
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

  useInput((input: string) => {
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
    }
    setCounter((prev) => prev + 1);
  });

  return (
    <>
      {/* render nodes && edges */}
      <Text key={counter}>
        <Edges />
        <Nodes />
      </Text>

      {/* status line */}
      <Text absolute x={0} y={0}>
        <Frame>
          Number of nodes: <Text bold>{nodeCount}</Text> | Number of edges:{" "}
          <Text bold>{edgeCount}</Text> | Press <Text bold>h</Text> for help
        </Frame>
      </Text>
    </>
  );
};

export default Renderer;
