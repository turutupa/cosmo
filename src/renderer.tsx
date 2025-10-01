import React, { useCallback, useEffect, useState } from "react";
import ReactCurse, { Text, useInput, useSize } from "react-curse";
import About from "./about";
import { TScreen } from "./constants";
import Cursor from "./cursor";
import Edge from "./edge";
import Files from "./files";
import Graph from "./graph";
import Keybindings from "./keybindings";
import Menu from "./menu";
import Node from "./node";
import Search from "./search";
import StatusLine from "./statusline";
import { TNode } from "./types";

type Props = {
  graph: Graph;
  nodeWidth?: number;
};

const Renderer: React.FC<Props> = ({ graph, nodeWidth }) => {
  // init hooks
  const [counter, setCounter] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<TScreen>("");

  // term size
  const { width: termW, height: termH } = useSize();

  // initial fit to view
  useEffect(() => {
    graph.fitView();
    setCounter((prev) => prev + 1);
  }, []);

  // update term size in graph
  useEffect(() => {
    graph.setTermSize(termW, termH);
  }, [termW, termH]);

  const onScreenChange = useCallback(
    (screen: TScreen) => {
      setCurrentScreen(screen);
      setCounter((prev) => prev + 1);
    },
    [setCurrentScreen, setCounter]
  );

  // handle user input
  useInput(
    (input: string) => {
      if (currentScreen) {
        return;
      }

      if (input === "\x10\x0d" || input === "q") {
        ReactCurse.exit();
      } else if (input === "\x1b" || input === " ") {
        onScreenChange("optionsMenu");
        return;
      } else if (input === "/") {
        onScreenChange("search");
        return;
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
    },
    [graph, onScreenChange, currentScreen]
  );

  // render all nodes
  const Nodes = useCallback((): JSX.Element[] => {
    const focusedNode = graph.getFocusedNode();
    return graph.nodes.map((node, i) => (
      <Node
        {...node}
        key={`node-key-${i}`}
        cursor={graph.cursor}
        nodeWidth={nodeWidth}
        termSize={{ width: termW, height: termH }}
        isFocused={focusedNode?.id === node.id}
      />
    ));
  }, [graph, graph.cursor, nodeWidth, termW, termH]);

  // render all edges
  const Edges = useCallback((): JSX.Element[] => {
    const focusedNode = graph.getFocusedNode();
    return graph.edges.map((edge, i) => (
      <Edge
        {...edge}
        key={`edge-key-${i}`}
        source={graph.getElement(edge.source) as TNode}
        target={graph.getElement(edge.target) as TNode}
        cursor={graph.cursor}
        isFocused={
          !!focusedNode &&
          (focusedNode.id === edge.source || focusedNode.id === edge.target)
        }
      />
    ));
  }, [graph]);

  return (
    <>
      {/* render user cursor */}
      <Cursor termSize={graph.termSize} />

      {/* render nodes && edges */}
      <Text key={counter}>
        <Edges />
        <Nodes />
      </Text>

      {/* status line */}
      <StatusLine
        nodeCount={graph?.nodes?.length || 0}
        edgeCount={graph?.edges?.length || 0}
      />

      {/* search */}
      <Search
        graph={graph}
        currentScreen={currentScreen}
        onScreenChange={onScreenChange}
      />

      {/* menu */}
      {(currentScreen === "optionsMenu" || currentScreen === "openingMenu") && (
        <Menu onScreenChange={onScreenChange} isOpeningMenu={false} />
      )}

      {/* open file  */}
      {currentScreen === "openFile" && (
        <Files
          onSelect={function (filePath: string): void {}}
          onScreenChange={onScreenChange}
        />
      )}

      {/* keybindings */}
      {currentScreen === "keybindings" && (
        <Keybindings onScreenChange={onScreenChange} />
      )}

      {/* about */}
      {currentScreen === "about" && <About onScreenChange={onScreenChange} />}
    </>
  );
};

export default Renderer;
