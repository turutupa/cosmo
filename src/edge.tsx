import React from "react";
import { Text, useChildrenSize, useSize } from "react-curse";
import { DEFAULT_NODE_WIDTH } from "./node";
import { TCoordinate, TNode } from "./types";
import { getPath } from "./utils";

const TEXT = "█";

type Props = {
  id: string;
  source: TNode;
  target: TNode;
  cursor: TCoordinate;
  isFocused?: boolean;
};

const Edge: React.FC<Props> = ({ id, source, target, cursor, isFocused }) => {
  const { width: termWidth, height: termHeight } = useSize();

  // source node width + padding
  const { width: sw } = useChildrenSize(source.value + 4);
  // target node width + padding
  const { width: tw } = useChildrenSize(target.value + 4);

  // source coordianate (center of node)
  const sc: TCoordinate = {
    x: (source.position?.x || 0) + Math.ceil(DEFAULT_NODE_WIDTH / 2),
    y: (source.position?.y || 0) + 1,
  };
  // target coordianate (center of node)
  const tc: TCoordinate = {
    x: (target.position?.x || 0) + Math.ceil(DEFAULT_NODE_WIDTH / 2),
    y: (target.position?.y || 0) + 1,
  };

  // path from source coordinate to target coordinate
  const path = getPath(sc, tc);

  return (
    <>
      {path
        // only render points within terminal bounds
        ?.filter(({ position }) => {
          const rx = position.x - cursor.x;
          const ry = position.y - cursor.y;
          return rx >= 0 && rx <= termWidth && ry >= 0 && ry <= termHeight;
        })
        // render each point in path
        .map(({ position, char }, index) => (
          <Text
            absolute
            key={`edge-${id}-idx-${index}`}
            x={position.x - cursor.x}
            y={position.y - cursor.y}
            color={isFocused ? "Yellow" : "#6d6d6d"}
          >
            {char}
          </Text>
        )) || []}
    </>
  );
};

export default Edge;
