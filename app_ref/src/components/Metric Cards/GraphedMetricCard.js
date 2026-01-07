import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  BarChart,
  Bar,
} from "recharts";

const GraphedMetricCard = ({ data, GraphComponent, graphComponentProps }) => {
  return (
    <Box
      sx={{
        borderRadius: "8px",
        padding: "24px",
        gap: "24px",
        border: "1px solid #EAECF0",
        boxShadow: "0px 1px 2px 0px #1018280D",
        backgroundColor: "#FFFFFF",
        height: "100%",
      }}
    >
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "16px",
          fontWeight: 600,
          lineHeight: "24px",
          textAlign: "left",
          color: "#101828",
        }}
      >
        {data.title}
      </Typography>
     {GraphComponent}
      <Stack direction={"row"} sx={{ gap: "16px" }}></Stack>
    </Box>
  );
};

export default GraphedMetricCard;
