import React from "react";
import { Text, useChildrenSize } from "react-curse";
import { TCoordinate, TNode } from "./types";
import { getPath } from "./utils";

const TEXT = "█";

type Props = {
  id: string;
  source: TNode;
  target: TNode;
  cursor: TCoordinate;
};

const Edge: React.FC<Props> = ({ id, source, target, cursor }) => {
  const { width: sw } = useChildrenSize(source.value + 4);
  const { width: tw } = useChildrenSize(target.value + 4);
  const sc: TCoordinate = {
    x: (source.position?.x || 0) + Math.ceil(sw / 2),
    y: (source.position?.y || 0) + 1,
  };
  const tc: TCoordinate = {
    x: (target.position?.x || 0) + Math.ceil(tw / 2),
    y: (target.position?.y || 0) + 1,
  };

  const path = getPath(sc, tc);

  return (
    <>
      {path?.map(({ position, char }, index) => (
        <Text
          absolute
          key={index}
          x={position.x - cursor.x}
          y={position.y - cursor.y}
          color="White"
        >
          {char}
        </Text>
      )) || []}
    </>
  );
};

export default Edge;
