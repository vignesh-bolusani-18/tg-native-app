import React from "react";
import { Bar } from "react-chartjs-2";
import { Box } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
    "April",
  ],
  datasets: [
    {
      label: "Active Users",
      data: [
        0.01, 0.03, 0.05, 0.02, 0.04, 0.015, 0.03, 0.045, 0.025, 0.03, 0.02,
        0.01, 0.04, 0.02, 0.03, 0.05,
      ],
      backgroundColor: function (context) {
        const value = context.dataset.data[context.dataIndex];
        if (value <= 0.02) {
          return "#5887FF";
        } else if (value <= 0.04) {
          return "#0C66E4";
        } else {
          return "#B6B9FF";
        }
      },

      // borderColor: "#000", // Border color for all bars
      // borderWidth: 2, // Border width for all bars
      barThickness: 32, // Fixed bar width
      maxBarThickness: 40, // Maximum bar width
      borderRadius: {
        topLeft: 6,
        topRight: 6,
      },
    },
  ],
};

const options = {
  plugins: {
    legend: {
      display: false, // Hides the legend
    },
  },
  responsive: true,
  scales: {
    x: {
      title: {
        display: true,
        text: "Months",
        font: {
          family: "Inter", // Set your desired font family
          size: 12, // Set your desired font size
          weight: "500", // Set your desired font weight if needed
        },
      },
      ticks: {
        font: {
          family: "Inter", // Set your desired font family
          size: 12, // Set your desired font size
          weight: "400", // Set your desired font weight if needed
        },
      },
      grid: {
        display: false, // Disable vertical grid lines
      },
    },
    y: {
      title: {
        display: true,
        text: "Active Users",
        font: {
          family: "Inter", // Set your desired font family
          size: 12, // Set your desired font size
          weight: "500", // Set your desired font weight if needed
        },
      },
      beginAtZero: true,
      ticks: {
        stepSize: 0.01,
        font: {
          family: "Inter", // Set your desired font family
          size: 12, // Set your desired font size
          weight: "400", // Set your desired font weight if needed
        },
      },
    },
  },
};

const FactorBarChart = () => {
  return (
    <Box sx={{ width: "100%", height: "auto" }}>
      <Bar data={data} options={options} />
    </Box>
  );
};

export default FactorBarChart;
