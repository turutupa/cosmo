import { Text } from "react-curse";

// const ASCII = "·";
const ASCII = "+";

type Props = {
  termSize: { width: number; height: number };
};

const Cursor: React.FC<Props> = ({ termSize }) => {
  const { width, height } = termSize;
  const x = Math.max(0, Math.floor((width - ASCII.length) / 2));
  const y = Math.max(0, Math.floor(height / 2));
  return (
    <Text absolute x={x} y={y} color="#6d6d6d">
      {ASCII}
    </Text>
  );
};

export default Cursor;
