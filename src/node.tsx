import React from "react";
import { Block, Frame, Text, useSize } from "react-curse";
import { TCoordinate, TNode } from "./types";

const FRAME_HEIGHT = 3; // top border + content + bottom
const ID_OFFSET = 2; // ID frame sits 2 rows above value frame
const WIDTH_PADDING = 4; // padding for frame width
const MAX_TEXT_LENGTH = 6; // max length for id or value text
const SLICE_LENGTH = 5; // length to slice text to if too long

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
  const { width: termWidth, height: termHeight } = useSize();

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

  // node width based on longest text + padding
  const padding = 4;
  const width = Math.max(idText.length, valueText.length) + padding;

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
        <Frame width={width}>
          <Block width={width} align="center">
            {valueText}
          </Block>
        </Frame>
      </Text>

      {/* render id frame - goes below so it overwrites value frame */}
      {!renderOnlyValues && (
        <Text
          absolute
          x={relativeX}
          y={relativeY - ID_OFFSET}
          width={width + WIDTH_PADDING}
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
