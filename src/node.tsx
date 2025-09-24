import React from "react";
import { Block, Frame, Text } from "react-curse";
import { TCoordinate, TNode } from "./types";

type Props = {
  cursor: TCoordinate;
  nodeWidth: number;
  renderOnlyValues?: boolean;
} & TNode;

const Node: React.FC<Props> = ({
  id,
  value,
  renderOnlyValues = false,
  position,
  cursor,
}) => {
  const { x, y } = position || { x: 0, y: 0 };
  const idText = id.length >= 6 ? id.slice(0, 5) + ".." : id;
  const valueText = value.length >= 6 ? value.slice(0, 5) + ".." : id;
  const width = Math.max(idText.length, valueText.length) + 4;

  return (
    <>
      <Text absolute x={x - cursor.x} y={y - cursor.y}>
        <Frame width={width}>
          <Block width={width} align="center">
            {valueText}
          </Block>
        </Frame>
      </Text>

      {!renderOnlyValues && (
        <Text
          absolute
          x={x - cursor.x}
          y={y - 2 - cursor.y}
          width={width + 4}
          bold
        >
          <>
            <Frame width={width}>
              <Block width={width} align="center">
                {idText}
              </Block>
            </Frame>
          </>
        </Text>
      )}
    </>
  );
};

export default Node;
