import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const MultiLayerPieChart = ({ values, colors }) => {
  const total = values.reduce((sum, val) => sum + val, 0);
  const layers = [
    { name: "Layer 1", value: values[0] },
    { name: "Layer 2", value: values[1] },
    { name: "Layer 3", value: values[2] },
  ];
  const average = (total / layers.length).toFixed(1);

  const data = layers.map((layer, index) => ({
    name: layer.name,
    value: layer.value,
    fill: colors[index] || "#1f77b4", // Default color is blue
    coloredPercentage: layer.value, // Calculate percentage for coloring
    remaining: total - layer.value,
  }));

  return (
    <PieChart width={240} height={240}>
      {data.map((entry, index) => (
        <Pie
          key={index}
          data={[
            { name: entry.name, value: entry.coloredPercentage },
            { name: "Remaining", value: 100 - entry.coloredPercentage },
          ]}
          cx={120}
          cy={120}
          startAngle={90}
          endAngle={-270}
          innerRadius={45 + 25 + index * 15}
          outerRadius={60 + 25 + index * 15}
          paddingAngle={0}
          dataKey="value"
        >
          <Cell key={`cell-${index}`} fill={entry.fill} />
          <Cell key={`cell-remaining-${index}`} fill="#F2F4F7" />
        </Pie>
      ))}
      <text
        x={130}
        y={130}
        textAnchor="middle"
        verticalAnchor="middle"
        fontSize={16}
        fill="#000"
        style={{
          fontFamily: "Inter",
          fontSize: "30px",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {average}%
      </text>
    </PieChart>
  );
};

export default MultiLayerPieChart;
