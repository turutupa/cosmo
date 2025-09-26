import React, { useCallback, useEffect, useState } from "react";
import { Input, ListTable, Text, useInput, useSize } from "react-curse";
import Graph from "./graph";
import { TNode } from "./types";

// component width constraints
const MAX_COMPONENT_WIDTH = 60;
const SIDE_PADDING = 1; // one cell each side when terminal is narrow

type Props = {
  graph: Graph;
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
};

const Search: React.FC<Props> = ({ graph, showSearch, setShowSearch }) => {
  const [searchResults, setSearchResults] = useState<TNode[]>([]);
  const [searchIsFocused, setSearchIsFocused] = useState(true);
  const [focusedResultIndex, setFocusedResultIndex] = useState(0);
  const { width, height } = useSize();

  // on search opened, focus input
  useEffect(() => {
    if (showSearch) {
      setSearchIsFocused(true);
    }
  }, [showSearch]);

  const availableWidth = Math.max(0, width - SIDE_PADDING * 2);
  const componentWidth = Math.min(MAX_COMPONENT_WIDTH, availableWidth);
  const containerX = Math.max(
    SIDE_PADDING,
    Math.floor((width - componentWidth) / 2)
  );

  // For (commented) ListTable column sizing
  const head = ["id", "value"];
  const columnCount = head.length;
  const columnWidth = Math.max(1, Math.floor(componentWidth / columnCount));

  const items = searchResults.map((node) => [
    node.id,
    node.value.trimStart().trimEnd(),
  ]);

  // handle text input changes
  const onInputChange = useCallback(
    (value: string) => {
      if (value === "") {
        setSearchResults(graph.nodes);
        return;
      }
      const results = graph.search(value);
      setSearchResults(results.all);
    },
    [graph, setSearchResults]
  );

  // handle text input submission
  const onSubmit = useCallback(() => {
    const node = searchResults[focusedResultIndex];
    if (node && node.position) {
      graph.fitView(node.id);
    }
    setShowSearch(false);
  }, [graph, searchResults, focusedResultIndex, setShowSearch]);

  const onListTableChange = useCallback(({ y }: { y: number }) => {
    setFocusedResultIndex(y);
  }, []);

  // handle focus switching between input and results
  useInput(
    (input: string) => {
      // Handle arrow down or tab
      if (
        input === "\t" || // Tab
        input === "\x0e" || // Ctrl + N
        input === "\x0a" // Ctrl + J
      ) {
        setSearchIsFocused(false);
      } else if (
        input === "\x1b[Z" || // Shift + Tab
        input === "\x10" || // Ctrl + P
        input === "\x0b" // Ctrl + K
      ) {
        setSearchIsFocused(true);
      } else if (input === "\x1b") {
        // Escape
        setShowSearch(false);
      }
    },
    [searchIsFocused, setShowSearch]
  );

  if (!showSearch) {
    return <></>;
  }

  return (
    <>
      <Text
        absolute
        x={containerX}
        y={Math.floor((height - 10) / 2)}
        background="Black"
      >
        {/* render text input */}
        <Input
          onCancel={() => setShowSearch(false)}
          onChange={onInputChange}
          onSubmit={onSubmit}
          background="#404040"
          height={1}
          width={componentWidth} // changed from fixed 15
          focus={searchIsFocused}
        />
      </Text>

      {/* render results table */}
      <Text
        absolute
        x={containerX}
        y={Math.floor((height - 10) / 2) + 1}
        background={"BrightBlack"}
        height={Math.min(15, Math.max(0, height - 12))}
        width={componentWidth}
      >
        <ListTable
          onSubmit={onSubmit}
          onChange={onListTableChange}
          focus={!searchIsFocused}
          head={head}
          data={items}
          initialPos={{
            x: 0,
            y: focusedResultIndex,
            xo: 0,
            yo: 0,
            x1: 0,
            x2: 0,
          }}
          // table headers
          renderHead={({ item, index, y, x }) =>
            item.map((i, key) => (
              <Text key={key} width={columnWidth} background="#202020" bold>
                {i}
              </Text>
            ))
          }
          // table rows
          renderItem={({ item, y, index }) =>
            item.map((text, key) => (
              <Text
                key={key}
                background={y === index ? "Green" : undefined}
                color={y === index ? "Black" : undefined}
                width={columnWidth}
              >
                {text}
              </Text>
            ))
          }
          width={componentWidth}
        />
      </Text>
    </>
  );
};

export default Search;
