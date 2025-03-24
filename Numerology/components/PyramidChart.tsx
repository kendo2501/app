import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Polyline, Circle, Text as SvgText, Line } from "react-native-svg";

interface PyramidData {
  year: number;
  number: number;
}

interface PyramidChartProps {
  data: PyramidData[];
}

const PyramidChart: React.FC<PyramidChartProps> = ({ data }) => {
  const width = 300;
  const height = 200;
  const padding = 40;

  if (data.length === 0) {
    return (
      <View style={styles.noData}>
        <SvgText fill="gray">Chưa có dữ liệu</SvgText>
      </View>
    );
  }

  const minYear = Math.min(...data.map((item) => item.year));
  const maxYear = Math.max(...data.map((item) => item.year));
  const minNumber = Math.min(...data.map((item) => item.number));
  const maxNumber = Math.max(...data.map((item) => item.number));

  const getX = (year: number) =>
    padding + ((year - minYear) / (maxYear - minYear)) * (width - 2 * padding);
  const getY = (number: number) =>
    height - padding - ((number - minNumber) / (maxNumber - minNumber)) * (height - 2 * padding);

  const points = data.map((item) => `${getX(item.year)},${getY(item.number)}`).join(" ");

  return (
    <View style={styles.container}>
      <Svg width={width} height={height + 40}>
        <Polyline points={points} fill="none" stroke="blue" strokeWidth="2" />

        <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="black" strokeWidth="2" />

        {data.map((item, index) => (
          <React.Fragment key={index}>
            <Circle cx={getX(item.year)} cy={getY(item.number)} r="4" fill="red" />
            <SvgText x={getX(item.year)} y={getY(item.number) - 10} fill="black" fontSize="12" textAnchor="middle">
              {item.number}
            </SvgText>
            
            {index % 2 === 0 && ( // Hiển thị năm cách nhau một bước
              <SvgText
                x={getX(item.year)}
                y={height - padding + 20}
                fill="black"
                fontSize="10"
                textAnchor="middle"
                transform={`rotate(-45, ${getX(item.year)}, ${height - padding + 20})`} // Xoay 45 độ
              >
                {item.year}
              </SvgText>
            )}
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 10 },
  noData: { justifyContent: "center", alignItems: "center", height: 200 },
});

export default PyramidChart;
