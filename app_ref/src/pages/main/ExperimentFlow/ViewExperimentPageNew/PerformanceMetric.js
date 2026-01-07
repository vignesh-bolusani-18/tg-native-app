import React, { useContext } from "react";
import { Box, Typography, Grid, Stack } from "@mui/material";
import { ThemeContext } from "../../../../theme/config/ThemeContext";

const titleText = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "28px",
  textAlign: "left",
  color: "#101828",
  textTransform: "none",
  paddingBottom: "16px",
};

const subtitleText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
  // paddingBottom:'8px',
};
const nameText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  textAlign: "left",
  color: "#475467",
  textTransform: "none",
};

const modelPerformanceData = [
  { subtitle: "Metric", names: ["Model Name", "Training WMAPE", "Test WMAPE"] },
  { subtitle: "Metric", names: ["K-best", "0.0323", "0.0323"] },
  { subtitle: "Metric", names: ["-", "Lower is better", "Lower is better"] },
];
const TrainingData = [
  { subtitle: "Metric", names: ["Model Name", "Training WMAPE", "Test WMAPE"] },
  { subtitle: "Metric", names: ["Xgboost", "0.0323", "0.0323"] },
  { subtitle: "Metric", names: ["-", "Lower is better", "Lower is better"] },
];
const MetricData = [
  { subtitle: "Metric", names: ["Model Name", "Training WMAPE", "Test WMAPE"] },
  { subtitle: "Metric", names: ["MLP", "0.0323", "0.0323"] },
  { subtitle: "Metric", names: ["-", "Lower is better", "Lower is better"] },
];

const ModelPerformanceSection = ({ title, data }) => (
  <Box padding="12px 16px 12px 16px">
    <Typography sx={titleText}>{title}</Typography>
    <Grid container spacing={3}>
      {data.map((item, index) => (
        <Grid item xs={12} md={4} key={index}>
          <Typography sx={subtitleText}>{item.subtitle}</Typography>
          <Stack direction="column" spacing={1}>
            {item.names.map((name, i) => (
              <Typography key={i} sx={nameText}>
                {name}
              </Typography>
            ))}
          </Stack>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const PerformanceMetric = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div>
      <ModelPerformanceSection
        title="Model Performance"
        data={modelPerformanceData}
      />
      <ModelPerformanceSection title="Training" data={TrainingData} />
      <ModelPerformanceSection title="Metric" data={MetricData} />
    </div>
  );
};

export default PerformanceMetric;
