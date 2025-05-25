import * as React from "react";
import Svg, { Rect, Text } from "react-native-svg";
const SvgFavicon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 32 32"
    {...props}
  >
    <Rect width={32} height={32} fill="#4F46E5" rx={8} />
    <Text
      x="50%"
      y="50%"
      fill="#fff"
      dy=".3em"
      fontFamily="Arial"
      fontSize={20}
      fontWeight="bold"
      textAnchor="middle"
    >
      {"T"}
    </Text>
  </Svg>
);
export default SvgFavicon;
