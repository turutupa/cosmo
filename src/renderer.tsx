import React, { useCallback, useEffect, useState } from "react";
import ReactCurse, { Text, useInput, useSize } from "react-curse";
import About from "./about";
import { ESCAPE } from "./constants";
import Cursor from "./cursor";
import Edge from "./edge";
import Export from "./export";
import Files from "./files";
import Graph from "./graph";
import Keybindings from "./keybindings";
import Menu from "./menu";
import Node from "./node";
import Search from "./search";
import StatusLine from "./statusline";
import { TNode, TScreen } from "./types";

type Props = {
  initialScreen: TScreen;
  graph?: Graph;
  nodeWidth?: number;
  loadGraph: (graph: Graph) => void;
};

const Renderer: React.FC<Props> = ({
  initialScreen,
  nodeWidth,
  graph,
  loadGraph,
}) => {
  // init hooks
  const [counter, setCounter] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<TScreen>(initialScreen);

  // term size
  const { width: termWidth, height: termHeight } = useSize();

  // initial fit to view
  useEffect(() => {
    if (!graph) {
      return;
    }
    graph.fitView();
    setCounter((prev) => prev + 1);
  }, []);

  // update term size in graph
  useEffect(() => {
    graph?.setTermSize(termWidth, termHeight);
  }, [termWidth, termHeight]);

  const onScreenChange = useCallback(
    (screen: TScreen) => {
      // handle no graph case, then redirect to opening menu
      if (screen === "" && !graph) {
        setCurrentScreen("openingMenu");
        return;
      }
      setCurrentScreen(screen);
      setCounter((prev) => prev + 1);
    },
    [setCurrentScreen, setCounter, graph]
  );

  const onFileSelect = useCallback(
    async (filePath: string) => {
      const newGraph = await Graph.loadFromFile(filePath, {
        termWidth,
        termHeight,
      });
      if (!newGraph) {
        return;
      }
      loadGraph(newGraph);
      newGraph.fitView();
      setCounter((prev) => prev + 1);
      // forcing current screen to be empty
      setCurrentScreen("");
    },
    [graph]
  );

  const onExport = useCallback(
    async (filename: string) => {
      if (!filename) return;
      const lower = filename.toLowerCase();
      try {
        if (lower.endsWith(".json")) {
          await graph?.exportToJSON(filename);
        } else if (lower.endsWith(".yaml") || lower.endsWith(".yml")) {
          await graph?.exportToYAML(filename);
        }
      } catch (e) {
        // optionally handle/log error
      }
    },
    [graph]
  );

  // handle user input
  useInput(
    (input: string) => {
      if (currentScreen) {
        return;
      }

      if (input === "\x10\x0d" || input === "q") {
        ReactCurse.exit();
      } else if (input === ESCAPE || input === " ") {
        onScreenChange("optionsMenu");
        return;
      } else if (input === "/") {
        onScreenChange("search");
        return;
      } else if (input === "j" || input === "\x1b[B") {
        graph?.pan(0, 2);
      } else if (input === "k" || input === "\x1b[A") {
        graph?.pan(0, -2);
      } else if (input === "h" || input === "\x1b[D") {
        graph?.pan(-5, 0);
      } else if (input === "l" || input === "\x1b[C") {
        graph?.pan(5, 0);
      } else if (input === "J") {
        graph?.pan(0, 8);
      } else if (input === "K") {
        graph?.pan(0, -8);
      } else if (input === "H") {
        graph?.pan(-25, 0);
      } else if (input === "L") {
        graph?.pan(25, 0);
      } else if (input === "c") {
        graph?.fitView();
      }
      setCounter((prev) => prev + 1);
    },
    [graph, onScreenChange, currentScreen]
  );

  // render all nodes
  const Nodes = useCallback((): JSX.Element[] => {
    const focusedNode = graph?.getFocusedNode();
    return (
      graph?.nodes.map((node, i) => (
        <Node
          {...node}
          key={`node-key-${i}`}
          cursor={graph.cursor}
          nodeWidth={nodeWidth}
          termSize={{ width: termWidth, height: termHeight }}
          isFocused={focusedNode?.id === node.id}
        />
      )) || []
    );
  }, [graph, graph?.cursor, nodeWidth, termWidth, termHeight]);

  // render all edges
  const Edges = useCallback((): JSX.Element[] => {
    const focusedNode = graph?.getFocusedNode();
    return (
      graph?.edges.map((edge, i) => (
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
      )) || []
    );
  }, [graph]);

  return (
    <>
      {/* render user cursor */}
      <Cursor termSize={graph?.termSize || { width: 0, height: 0 }} />

      {/* render nodes && edges */}
      {graph && (
        <Text key={counter}>
          <Edges />
          <Nodes />
        </Text>
      )}

      {/* status line */}
      {graph && (
        <StatusLine
          nodeCount={graph?.nodes?.length || 0}
          edgeCount={graph?.edges?.length || 0}
        />
      )}

      {/* search */}
      {graph && currentScreen === "search" && (
        <Search
          graph={graph || ({} as Graph)}
          currentScreen={currentScreen}
          onScreenChange={onScreenChange}
        />
      )}

      {/* menu */}
      {(currentScreen === "optionsMenu" || currentScreen === "openingMenu") && (
        <Menu onScreenChange={onScreenChange} isOpeningMenu={!graph} />
      )}

      {/* export */}
      {(currentScreen === "exportJSON" || currentScreen === "exportYAML") && (
        <Export
          format={"exportJSON" === currentScreen ? "json" : "yaml"}
          onScreenChange={onScreenChange}
          currentDir={process.cwd() + "/"}
          onExport={onExport}
        />
      )}

      {/* open file  */}
      {currentScreen === "openFile" && (
        <Files onSelect={onFileSelect} onScreenChange={onScreenChange} />
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
