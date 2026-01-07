import * as React from "react";
import { useState } from "react";
import { useEffect } from "react";

import TableRow from "@mui/material/TableRow";
import { Box, Skeleton, Stack, Typography } from "@mui/material";

import useDashboard from "../../../hooks/useDashboard";

import useAuth from "../../../hooks/useAuth";
import useExperiment from "../../../hooks/useExperiment";
import useImpact from "../../../hooks/useImpact";
import {
  fetchCSVData,
  fetchCSVWithFilterFromS3,
  fetchParquetData,
} from "../../../utils/s3Utils";
import CustomAutocomplete from "../../../components/CustomInputControls/CustomAutoComplete";
import CustomButton from "../../../components/CustomButton";
import CustomTable from "../../../components/CustomTable";
import MetricsAnalysisGraph from "./MetricsAnalysisGraph";

const convertToNumber = (value) => {
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? value : Math.round(parsedValue * 100) / 100;
};

function formatString(input) {
  // Check if the input is an integer string
  if (/^\d+$/.test(input)) {
    return Number(input).toLocaleString(); // Add commas for integer numbers
  }

  // Check if the input is a float string
  if (/^\d*\.\d+$/.test(input)) {
    return parseFloat(input).toFixed(2); // Convert to float and fix precision to 2
  }

  // If the input contains any non-numeric character, return it as it is
  return input;
}

export default function MetricsAnalysis() {
  const {
    impactPipeline,
    currentImpactMetricsFeature,
    currentImpactMetricsValue,
    setCurrentImpactMetricsFeature,
    setCurrentImpactMetricsValue,
    clearImpactPipelineData,
    impact_pipelines_list,
  } = useImpact();

  const { userInfo, currentCompany } = useAuth();
  const metrics_data_base_path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/impact_pipelines/${impactPipeline.impactPipelineName}_${impactPipeline.impactPipelineID}`;
  const [metricsData, setMetricsData] = useState(null);
  const [metricsDataLoading, setMetricsDataLoading] = useState(false);
  //   const fileName =
  //     `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`
  //       .split(".csv")[0]
  //       .split("/")
  //       .join("_");
  //   const [currentDimensionData, setcurrentDimensionData] =
  //     useState(executiveViewData);
  const hasParquetFiles = false;

  useEffect(() => {
    const path = `${metrics_data_base_path}/${currentImpactMetricsFeature}.csv`;
    const filterData = {
      dimensionFilters: {
        feature: [currentImpactMetricsFeature],
      },
      columnFilter: [],
      selectAllColumns: true,
    };

    const fetchMetricsData = async () => {
      setMetricsDataLoading(true);
      const data = await (hasParquetFiles
        ? fetchParquetData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          })
        : fetchCSVData({
            filePath: path,
            filterData: filterData,
            paginationData: null,
            sortingData: null,
          }));
      if (data) {
        console.log("Metrics Data", data);
        setMetricsData(data);
      }
      setMetricsDataLoading(false);
    };
    fetchMetricsData();
  }, [currentImpactMetricsFeature, impact_pipelines_list]);
  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        padding={"12px 16px"}
      >
        <CustomAutocomplete
          disableClearable
          showLabel
          label="Feature"
          values={["all"]}
          selectedValues={currentImpactMetricsFeature}
          setSelectedValues={setCurrentImpactMetricsFeature}
        />
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent={"flex-end"}
          alignItems={"flex-end"}
        >
          <CustomButton
            title="Clear"
            onClick={async () => {
              setCurrentImpactMetricsFeature("all");
            }}
            backgroundColor="#FFFF"
            borderColor="#D0D5DD"
            textColor="#344054"
          />
        </Stack>
      </Stack>

      {metricsData && !metricsDataLoading ? (
        <>
          <MetricsAnalysisGraph metricsAnalysisData={metricsData} />
          <CustomTable
            // data={metricsData}
            title="Metrics Analysis"
            isFilterable={false}
          />
        </>
      ) : (
        <Stack
          sx={{ width: "100%", padding: "16px", height: "100%" }}
          spacing={2}
        >
          {/* Skeleton Loader */}
          <Skeleton variant="text" width="100%" height="400px" />
          <Skeleton variant="text" width="30%" height="40px" />
          <Stack spacing={1}>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <Stack key={rowIndex} direction="row" spacing={1}>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    variant="text"
                    width="100%"
                    height="50px"
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
