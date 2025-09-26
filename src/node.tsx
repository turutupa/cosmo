import React from "react";
import { Block, Frame, Text } from "react-curse";
import { DEFAULT_HIGHLIGHT_COLOR } from "./constants";
import { TCoordinate, TNode } from "./types";

export const DEFAULT_NODE_WIDTH = 16;
export const FRAME_HEIGHT = 5; // top border + content + bottom
const ID_OFFSET = 2; // ID frame sits 2 rows above value frame
const MAX_TEXT_LENGTH = 14; // max length for id or value text
const SLICE_LENGTH = 12; // length to slice text to if too long

type Props = {
  cursor: TCoordinate;
  nodeWidth?: number;
  renderOnlyValues?: boolean;
  termSize: { width: number; height: number };
  isFocused?: boolean;
} & TNode;

const Node: React.FC<Props> = ({
  id,
  value,
  renderOnlyValues = false,
  position,
  cursor,
  isFocused,
  nodeWidth = DEFAULT_NODE_WIDTH,
  termSize: { width: termWidth, height: termHeight },
}) => {
  const { x, y } = position || { x: 0, y: 0 };

  const trimmedId = id.trimStart().trimEnd();
  const trimmedValue = value.trimStart().trimEnd();
  const idText =
    trimmedId.length >= MAX_TEXT_LENGTH
      ? trimmedId.slice(0, SLICE_LENGTH) + ".."
      : trimmedId;
  const valueText =
    trimmedValue.length >= MAX_TEXT_LENGTH
      ? trimmedValue.slice(0, SLICE_LENGTH) + ".."
      : trimmedValue;

  // position relative to cursor
  const relativeX = x - cursor.x;
  const relativeY = y - cursor.y;

  // don't render if outside terminal bounds
  if (
    relativeX <= 0 ||
    relativeX >= termWidth ||
    relativeY <= 0 ||
    relativeY >= termHeight
  ) {
    return <></>;
  }

  // ID frame (if shown) must also fit fully
  if (!renderOnlyValues) {
    const idY = relativeY - ID_OFFSET;
    if (idY < 0 || idY + FRAME_HEIGHT > termHeight) {
      return <></>;
    }
  }

  return (
    <>
      {/* render value frame */}
      <Text absolute x={relativeX} y={relativeY}>
        <Frame
          width={nodeWidth}
          color={isFocused ? DEFAULT_HIGHLIGHT_COLOR : undefined}
        >
          <Block width={nodeWidth} align="center">
            {valueText}
          </Block>
        </Frame>
      </Text>

      {/* render id frame - goes below so it overwrites value frame */}
      {!renderOnlyValues && (
        <Text absolute x={relativeX} y={relativeY - ID_OFFSET} bold>
          <>
            <Frame
              width={nodeWidth}
              color={isFocused ? DEFAULT_HIGHLIGHT_COLOR : undefined}
            >
              <Block width={nodeWidth} align="center">
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
