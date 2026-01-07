import React from "react";
import { Typography, Box, Stack, Grid } from "@mui/material";
import useExperiment from "../../../../hooks/useExperiment";
import { useEffect } from "react";
import useConfig from "../../../../hooks/useConfig";
import useModule from "../../../../hooks/useModule";

const textLgMedium = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "28px",
  textAlign: "left",
  color: "#101828",
};

const label = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
};
const value = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  textAlign: "left",
  color: "#475467",
};

const ExpRunDetails = () => {
  const { configState } = useModule();
  useEffect(() => {
    console.log("configState", configState);
  }, []);

  const experimentDetails = [
    {
      label: "Module name:",
      value: `${configState?.common?.module_name}`,
      fullWidth: false,
    },
    {
      label: "Usecase name:",
      value: `${configState?.project_setup?.usecase_name}`,
      fullWidth: true,
    },
    {
      label: "Project name:",
      value: `${configState?.project_setup?.project_name}`,
      fullWidth: false,
    },
    {
      label: "Job id:",
      value: `${configState?.common?.job_id}`,
      fullWidth: true,
    },
  ];

  const businessData = [
    {
      label: "Timestamp Column:",
      value: `${configState?.data?.timestamp_column}`,
    },
    {
      label: "Frequency:",
      value: `${configState?.data?.frequency}`,
    },
    {
      label: "Forecast granularity (level):",
      value: `${configState?.data?.ts_id_columns}`,
    },
    {
      label: "Prediction start date:",
      value: `${configState?.etl?.prediction_start_date}`,
    },
    {
      label: "Prediction end date:",
      value: `${configState?.etl?.prediction_end_date}`,
    },
    {
      label: "Optimization history(days):",
      value: `${configState?.etl?.optimization_period}`,
    },
    {
      label: "Optimization for(days):",
      value: `${configState?.etl?.optimization_forecast_period}`,
    },
    {
      label: "Optimization gap(epsilon):",
      value: `${configState?.scenario_plan?.epsilon}`,
    },
    { label: "Discrete optimization field:", value: "None" },
    {
      label: "Aggregation method:",
      value: `${JSON.stringify(
        configState?.data?.aggregation_method,
        null,
        2
      )}`,
    },
    {
      label: "Fillna methods:",
      value: `${JSON.stringify(configState?.data?.fillna_method, null, 2)}`,
    },

    {
      label: "Extra dimensions:",
      value: `${JSON.stringify(
        configState?.scenario_plan?.post_model_demand_pattern,
        null,
        2
      )}`,
    },
  ];

  return (
    <>
      <Box padding="12px 16px 12px 16px">
        <Typography
          sx={{ ...textLgMedium, textAlign: "left", paddingBottom: "16px" }}
        >
          Experiment Details
        </Typography>
        <Grid container spacing={2}>
          {experimentDetails.map((item, index) => (
            <Grid item xs={12} md={item.fullWidth ? 8 : 4} key={index}>
              <Stack>
                <Typography sx={label}>{item.label}</Typography>
                <Typography sx={value}>{item.value}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    {/*   <Box padding="12px 16px 12px 16px">
        <Typography
          sx={{ ...textLgMedium, textAlign: "left", paddingBottom: "16px" }}
        >
          Business Context Details
        </Typography>
        <Grid container spacing={2}>
          {businessData.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Stack>
                <Typography sx={label}>{item.label}</Typography>
                <Typography sx={value}>{item.value}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box> */}
    </>
  );
};

export default ExpRunDetails;
