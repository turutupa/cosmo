import React, { useCallback, useEffect, useState } from "react";
import { Block, Input, ListTable, Text, useInput, useSize } from "react-curse";
import { DEFAULT_HIGHLIGHT_COLOR } from "./constants";
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

  // component width and position calculations
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

  // table items from search results
  const items: string[][] = searchResults.map((node) => [
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
      // Escape closes search
      if (input === "\x1b") {
        setShowSearch(false);
        return;
      }

      // Ctrl+J / Ctrl+N / Arrow Down : move down results while staying in input
      if (input === "\x0a" || input === "\x0e" || input === "\x1b[B") {
        setFocusedResultIndex((prev) =>
          Math.min(searchResults.length - 1, prev + 1)
        );
        setSearchIsFocused(true);
        return;
      }

      // Ctrl+K / Ctrl+P / Arrow Up : move up results while staying in input
      if (input === "\x0b" || input === "\x10" || input === "\x1b[A") {
        setFocusedResultIndex((prev) => Math.max(0, prev - 1));
        setSearchIsFocused(true);
        return;
      }

      // Tab moves focus to the table
      if (input === "\t") {
        setSearchIsFocused(false);
        return;
      }

      // Shift+Tab returns focus to input
      if (input === "\x1b[Z") {
        setSearchIsFocused(true);
        return;
      }
    },
    [searchResults.length, setShowSearch]
  );

  if (!showSearch) {
    return <></>;
  }

  const baseY = Math.floor((height - 10) / 2);
  const tableHeight = Math.min(16, Math.max(0, height - 12)); // rows incl. header
  const statusY = baseY + 1 + tableHeight; // one below table

  return (
    <>
      <Text absolute x={containerX} y={baseY} background="Black">
        {/* render text input */}
        <Input
          onCancel={() => setShowSearch(false)}
          onChange={onInputChange}
          onSubmit={onSubmit}
          background="#404040"
          height={1}
          width={componentWidth}
          focus={searchIsFocused}
        />
      </Text>

      {/* render results table */}
      <Text
        absolute
        x={containerX}
        y={baseY + 1}
        background={"BrightBlack"}
        height={tableHeight}
        width={componentWidth}
      >
        <ListTable
          onSubmit={onSubmit}
          onChange={onListTableChange}
          focus={!searchIsFocused}
          head={head}
          data={items.slice(0, 15)}
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
                background={y === index ? DEFAULT_HIGHLIGHT_COLOR : undefined}
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

      {/* status / help line */}
      <Text
        absolute
        x={containerX}
        y={statusY}
        width={componentWidth}
        height={1}
        background="#101010"
        color="#f2f2f2"
      >
        <Block align="center" width={componentWidth}>
          ↑/↓ or ctrl+n/ctrl+p | Enter to select | Esc close
        </Block>
      </Text>
    </>
  );
};

export default Search;
