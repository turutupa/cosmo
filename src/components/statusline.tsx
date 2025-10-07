import { Frame, Text } from "react-curse";
import { useTheme } from "../hooks/useTheme";

type TStatusLineItem = {
  label: string;
  value?: string | number;
  color?: string;
};

type Props = {
  nodeCount: number;
  edgeCount: number;
};

const StatusLine: React.FC<Props> = ({ nodeCount, edgeCount }) => {
  const { theme } = useTheme();
  const statusLineItems: TStatusLineItem[] = [
    { label: "Nodes:", value: nodeCount, color: "Green" },
    { label: "Edges:", value: edgeCount, color: "Green" },
  ];

  return (
    <Text absolute x={0} y={0} background={theme.black}>
      <Frame>
        {statusLineItems.map((item, index) => (
          <Text key={index}>
            {" "}
            {item.label}{" "}
            {item.value && <Text color={item.color}>{item.value}</Text>}{" "}
          </Text>
        ))}
      </Frame>
    </Text>
  );
};

export default StatusLine;
