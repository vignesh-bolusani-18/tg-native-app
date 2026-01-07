import React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useDashboard from "../../../../hooks/useDashboard";
import { format, parseISO, subDays } from "date-fns";

const extractKeys = (data) => {
  const keysToExtract = ["transactiondate", "actual", "pred"];

  // Determine the length of the arrays for the keys you want to extract
  const length = data[keysToExtract[0]].length;

  // Initialize an array to hold the extracted data
  const extractedData = [];

  // Loop through each index of the arrays
  for (let i = 0; i < length; i++) {
    // Create an object to store the values for this index
    const dataPoint = {};

    // Loop through each key you want to extract
    keysToExtract.forEach((key) => {
      if (key === "actual" || key === "pred") {
        // Convert ts_actual and ts_pred to integers
        dataPoint[key] = parseInt(data[key][i], 10);
      } else {
        // Keep transactiondate as is
        dataPoint[key] = data[key][i];
      }
    });
    // console.log("datapoint", dataPoint);
    // Add the data point to the extracted data array
    extractedData.push(dataPoint);
  }
  // console.log("chart data",extractedData);

  // Return the extracted data
  return extractedData;
};

// Transform the data to ensure non-overlapping categories
const transformData = (series) => {
  const dataMap = new Map();

  series.forEach((s, seriesIndex) => {
    s.data.forEach((d, dataIndex) => {
      const transactiondate = `${d.transactiondate}-${seriesIndex}`;
      dataMap.set(transactiondate, { transactiondate, [s.name]: d.value });
    });
  });

  const transformedData = Array.from(dataMap.values());
  console.log(transformedData);
  return transformedData;
};

const MyAreaChart = () => {
  const { demandForecastingData } = useDashboard();
  // console.log(demandForecastingData);

  const transformedData = extractKeys(demandForecastingData);
  // console.log(transformedData);
  const series1 = transformedData
    .filter((item) => item.actual !== 0)
    .map((item) => ({
      transactiondate: item.transactiondate,
      value: item.actual,
    }));

  const series2 = transformedData
    .filter((item) => item.pred !== 0)
    .map((item) => ({
      transactiondate: item.transactiondate,
      value: item.pred,
    }));
  // console.log(series1);
  // console.log(series2);
  const series = [
    {
      name: "Series 1",
      data: series1,
    },
    {
      name: "Series 2",
      data: series2,
    },
  ];
  // console.log(series);
  const data = transformData(series);
  //      console.log(data);
  // //       console.log("chart data",transformedData);
  // //       const series1 = transformedData.map(item => ({
  // //         transactiondate: item.transactiondate,
  // //        series1: item.ts_actual,
  // //        series2: item.ts_pred,
  // //       }));
  //   console.log(data);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
      >
        <defs>
          <linearGradient id="colorSeries1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0C66E4" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#0C66E4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSeries2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B692F6" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#B692F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="transactiondate"
          stroke="#FFFFFF00"
          tick={{
            fill: "#475467",
            fontSize: 12,
            fontWeight: 400,
            fontFamily: "Inter",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="Series 1"
          stroke="#0C66E4"
          fill="url(#colorSeries1)"
        />
        <Area
          type="monotone"
          dataKey="Series 2"
          stroke="#B692F6"
          fill="url(#colorSeries2)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MyAreaChart;
