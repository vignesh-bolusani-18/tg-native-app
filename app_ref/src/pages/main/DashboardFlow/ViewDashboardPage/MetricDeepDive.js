import * as React from "react";
import { useState } from "react";
import { useEffect } from "react";

import TableRow from "@mui/material/TableRow";
import { Box, Stack, Typography } from "@mui/material";

import CustomButton from "../../../../components/CustomButton";
import useDashboard from "../../../../hooks/useDashboard";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import CustomTable from "../../../../components/TanStackCustomTable";
import useAuth from "../../../../hooks/useAuth";
import useExperiment from "../../../../hooks/useExperiment";

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

export default function DashSalesView() {
  const {
    executiveViewData,
    currentDimension,
    setCurrentDimension,
    loadExecutiveViewData,
    experimentBasePath,
    dimensionFilterData,
    tablesFilterData,
    setFilterData,
  } = useDashboard();
  const { hasParquetFiles } = useExperiment();
  const { userInfo, currentCompany } = useAuth();
  const fileName =
    `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`
      .split(".csv")[0]
      .split("/")
      .join("_");
  const [currentDimensionData, setcurrentDimensionData] =
    useState(executiveViewData);

  useEffect(() => {
    setcurrentDimensionData(executiveViewData);
  }, [executiveViewData]);
  useEffect(() => {
    const fetchExecutiveViewData = async () => {
      await loadExecutiveViewData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`,
        {
          dimensionFilters: {
            feature: [currentDimension],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );
    };
    fetchExecutiveViewData();
    const filterData = {
      dimensionFilters: {
        feature: [currentDimension],
      },
      columnFilter:
        tablesFilterData[`${fileName}`]?.["Default"]?.filterData
          ?.columnFilter ?? [],
      selectAllColumns:
        tablesFilterData[`${fileName}`]?.["Default"]?.filterData
          ?.selectAllColumns ?? true,
    };
    setFilterData(filterData, "Metrics Deep Dive", fileName, "Default");
  }, [currentDimension]);
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
          label="Dimension"
          values={Object.keys(dimensionFilterData)}
          selectedValues={currentDimension}
          setSelectedValues={setCurrentDimension}
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
              setCurrentDimension("all");
            }}
            backgroundColor="#FFFF"
            borderColor="#D0D5DD"
            textColor="#344054"
          />
          {/* <CustomButton
            title="Download"
            onClick={() => {}}
            backgroundColor="#0C66E4"
            borderColor="#0C66E4"
            textColor="#FFF"
          /> */}
        </Stack>
      </Stack>

      <CustomTable
        //data={executiveViewData}
        title="Metrics Deep dive"
        isFilterable={false}
      />
    </Box>
  );
}
