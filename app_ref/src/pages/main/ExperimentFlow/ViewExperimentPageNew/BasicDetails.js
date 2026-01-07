import { Box, Grid, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import CustomTextInput from "../../../../components/CustomInputControls/CustomTextInput2";
import useConfig from "../../../../hooks/useConfig";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import useExperiment from "../../../../hooks/useExperiment";
import useDashboard from "../../../../hooks/useDashboard";
import useExports from "../../../../hooks/useExports";

import useAuth from "../../../../hooks/useAuth";
import { Editor } from "@monaco-editor/react";

const BasicDetails = () => {
  const { configState } = useConfig();
  const { export_pipeline, setTransformQuery } = useExports();
  const languageOption = ["python", "sql"];
  const datasets =
    configState.data.optimization_column !== "None"
      ? ["Forecast", "Prediction Interval", "Replacement Optimization"]
      : ["Forecast", "Prediction Interval"];

  return (
    <Stack paddingBottom={"20px"}>
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "28px",
            color: "#101828",
            textAlign: "left",
          }}
        >
          Step 1: Basic Details
        </Typography>
      </Stack>

      <Stack>
        <Box
          sx={{
            padding: "0px 0px",
          }}
        >
          <Grid spacing={2} container>
            <Grid item xs={12} md={12}>
              <CustomTextInput
                label={"Pipeline name"}
                placeholder={"Enter pipeline name..."}
                target={"exports"}
                path={"name"}
                showLabel
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <CustomAutocomplete
                label={"Select Dataset"}
                showLabel
                placeholder={"Select dataset to export"}
                disableClearable
                path={"dataset"}
                target={"exports"}
                values={datasets}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack gap={"8px"}>
                <Stack
                  direction={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Box sx={{ flex: 10 }}>
                    <Typography
                      sx={{
                        color: "#344054",
                        fontFamily: "Inter",
                        fontWeight: "500",
                        fontSize: "14px",
                        lineHeight: "20px",
                      }}
                    >
                      Transformation Query
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <CustomAutocomplete
                      disableClearable
                      path={"transform_query_language"}
                      target={"exports"}
                      values={languageOption}
                    />
                  </Box>
                </Stack>
                <Box
                  sx={{
                    borderRadius: "0px",
                    border: "1px solid #EAECF0",
                    padding: "2px",
                  }}
                >
                  <Editor
                    height="250px"
                    // width='100%'
                    loading={false}
                    language={export_pipeline.transform_query_language}
                    theme="light"
                    value={export_pipeline.transform_query}
                    onChange={(value) => setTransformQuery(value)}
                    options={{
                   
                      readOnly: false,
                      padding: {
                        top: 18,
                        bottom: 18,
                        left: 18,
                        right: 18,
                      },
                      borderRadius: "8px",
                      border: "1px solid red",
                    }}
                    style={{
                      width: "80%",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      marginBottom: "20px",
                    }}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Stack>
  );
};

export default BasicDetails;
