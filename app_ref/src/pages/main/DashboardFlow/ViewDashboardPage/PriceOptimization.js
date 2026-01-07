import { Box, Card, Grid, Skeleton, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import useDashboard from "../../../../hooks/useDashboard";

import CustomTable from "../../../../components/TanStackCustomTable";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import CustomButton from "../../../../components/CustomButton";
import useAuth from "../../../../hooks/useAuth";
import useExperiment from "../../../../hooks/useExperiment";
import { PriceOptimizationCards } from "./FocusView/ExecutiveCards";
import NMetricCard from "../../../../components/Metric Cards/NMetricCard";
import { parse } from "date-fns";
import FilterBlock from "../../../../components/FilterBlock";
import { setPriceOptimizationData } from "../../../../redux/slices/dashboardSlice";
const titleStyle = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "28px",
  textAlign: "left",
  color: "#101828",
  textTransform: "none",
};
const BoxComponent = ({ data }) => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        // boxShadow: "none",
        backgroundColor: "#FFFFFF",
        height: "100%",
        "& .MuiCard-root": {
          padding: 0,
        },
        "& .MuiCardContent-root": {
          paddingBottom: "0px",
        },
        boxShadow: "0px 2px 2px #1018280D",

        // "&:hover": {
        //   boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        //   transform: "translateY(-2px)",
        //   transition: "all 0.3s ease-in-out",
        // },
      }}
    >
      <NMetricCard data={data} />
    </Card>
  );
};

const DashPriceOptimization = () => {
  const {
    priceOptimizationData,
    priceOptimizationFilterData,
    PriceCurrentDimension,
    setCurrentPriceDimension,
    PriceCurrentValue,
    setCurrentPriceValue,
    InvPriceFilterData,
    loadPriceOptimizationData,
    experimentBasePath,
    tablesFilterData,
    setFilterData,
    loadPriceMetricsData,
    priceMetricsData,
    executiveViewData,
    filterData: filterDataProp,
    updateFilterDataDimension,
  } = useDashboard();
  const { userInfo, currentCompany } = useAuth();
  const [filtersApplied, setFiltersApplied] = useState([]);
  const [priceOptDimensionToFilter, setPriceOptDimensionToFilter] = useState(
    Object.keys(InvPriceFilterData).filter((key) => key !== "all") || []
  );

  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };
  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }

    return dimension;
  };
  const get_metrics = () => {
    const isNew = priceMetricsData !== null && priceMetricsData !== undefined;
    if (isNew) {
      const Forecast_Per_Day = parseFloat(
        priceMetricsData["Forecast_Per_Day"]
      ).toFixed(2);

      const Forecast_Per_Day_value = parseFloat(
        priceMetricsData["Forecast_Per_Day_value"]
      ).toFixed(2);

      const elasticity_flag = parseInt(priceMetricsData["elasticity_flag"]);
      const Forecast_Per_Day_elastic = parseFloat(
        priceMetricsData["Forecast_Per_Day_elastic"]
      ).toFixed(2);

      const Forecast_Per_Day_value_elastic = parseFloat(
        priceMetricsData["Forecast_Per_Day_value_elastic"]
      ).toFixed(2);
      const current_revenue = parseFloat(
        priceMetricsData["current_revenue_per_day"] ??
          priceMetricsData["current_revenue"]
      ).toFixed(2);
      const current_margin = parseFloat(
        priceMetricsData["current_margin"]
      ).toFixed(2);

      const strategic_forecast_per_day = parseFloat(
        priceMetricsData["strategic_forecast_per_day"]
      ).toFixed(2);

      const strategic_margin = parseFloat(
        priceMetricsData["strategic_margin_per_day"] ??
          priceMetricsData["strategic_margin"]
      ).toFixed(2);
      const strategic_revenue = parseFloat(
        priceMetricsData["strategic_revenue_per_day"] ??
          priceMetricsData["strategic_revenue"]
      ).toFixed(2);
      const tactical_forecast_per_day = parseFloat(
        priceMetricsData["tactical_forecast_per_day"]
      ).toFixed(2);

      const tactical_margin = parseFloat(
        priceMetricsData["tactical_margin_per_day"] ??
          priceMetricsData["tactical_margin"]
      ).toFixed(2);
      const tactical_revenue = parseFloat(
        priceMetricsData["tactical_revenue_per_day"] ??
          priceMetricsData["tactical_revenue"]
      ).toFixed(2);
      const total_combinations = parseFloat(
        executiveViewData["total_combinations"]
      ).toFixed(2);

      const by_combinations = elasticity_flag / total_combinations;
      const by_units = Forecast_Per_Day_elastic / Forecast_Per_Day;
      const by_value = Forecast_Per_Day_value_elastic / Forecast_Per_Day_value;
      const strategic_FPD =
        (strategic_forecast_per_day - Forecast_Per_Day) / Forecast_Per_Day;
      const strategic_Margin =
        (strategic_margin - current_margin) / current_margin;
      const strategic_Revenue =
        (strategic_revenue - current_revenue) / current_revenue;
      console.log("T_R:", tactical_revenue);
      const isTactical = tactical_revenue > 0.0;
      console.log("isTactical", isTactical);
      if (isTactical) {
        const tactical_FPD =
          (tactical_forecast_per_day - Forecast_Per_Day) / Forecast_Per_Day;
        const tactical_Margin =
          (tactical_margin - current_margin) / current_margin;
        const tactical_Revenue =
          (tactical_revenue - current_revenue) / current_revenue;

        return {
          by_combinations,
          by_units,
          by_value,
          strategic_FPD,
          strategic_Margin,
          strategic_Revenue,
          tactical_FPD,
          tactical_Margin,
          tactical_Revenue,
          isNew,
          isTactical,
        };
      }
      return {
        by_combinations,
        by_units,
        by_value,
        strategic_FPD,
        strategic_Margin,
        strategic_Revenue,
        isNew,
        isTactical,
      };
    }
    return { isNew };
  };
  const [boxContent, setBoxContent] = useState([]);
  const scenario_planner_data_fileName =
    `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`
      .split(".csv")[0]
      .split("/")
      .join("_");
  const { hasParquetFiles } = useExperiment();
  useEffect(() => {
    const dict = { Cluster: "cluster" };
    const changable = ["Cluster"];
    const convert = (dimension) => {
      if (changable.includes(dimension)) {
        return dict[dimension];
      }
      return dimension;
    };
    const fetchData = async () => {
      /*  await loadPriceOptimizationData(
        `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`,
        experiment_config,
        {
          dimensionFilters: {
            [convert(PriceCurrentDimension)]: [PriceCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      ); */
      await loadPriceMetricsData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/price_card_metrics.csv`,

        {
          dimensionFilters: {
            feature: [convert(PriceCurrentDimension)],
            value: [PriceCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );
    };
    fetchData();
  }, []);
  useEffect(() => {
    setBoxContent(PriceOptimizationCards(get_metrics()));
  }, [priceMetricsData, executiveViewData]);
  const { experiment_config } = useExperiment();
  const [filterData, setfilterData] = useState(InvPriceFilterData);
  useEffect(() => {
    if (InvPriceFilterData) {
      setfilterData(InvPriceFilterData);
    }
  }, []);

  const [values, setvalues] = useState(filterData[PriceCurrentDimension]);
  console.log(
    "Number of items in priceOptimizationData:",
    priceOptimizationData
  );
  useEffect(() => {
    setvalues(filterData[PriceCurrentDimension]);
    setCurrentPriceValue(filterData[PriceCurrentDimension][0]);
  }, [PriceCurrentDimension]);
  
  useEffect(() => {
    const dict = { Cluster: "cluster" };
    const changable = ["Cluster"];
    const convert = (dimension) => {
      if (changable.includes(dimension)) {
        return dict[dimension];
      }
      return dimension;
    };
    const fetchPriceOptimizationData = async () => {
      await loadPriceMetricsData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/price_card_metrics.csv`,
        {
          dimensionFilters: {
            feature: [convert(PriceCurrentDimension)],
            value: [PriceCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );
      const dict = { Forecast_Granularity: "ts_id", Cluster: "cluster" };
      const changable = ["Forecast_Granularity", "Cluster"];
      const dimension = changable.includes(PriceCurrentDimension)
        ? dict[PriceCurrentDimension]
        : PriceCurrentDimension;
      const filterData = {
        dimensionFilters: {
          [dimension]: [PriceCurrentValue],
        },
        columnFilter:
          tablesFilterData[`${scenario_planner_data_fileName}`]?.["Default"]
            ?.filterData?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData[`${scenario_planner_data_fileName}`]?.["Default"]
            ?.filterData?.selectAllColumns ?? true,
      };

      const allFilterData = {
        dimensionFilters: {},
        columnFilter:
          tablesFilterData[`${scenario_planner_data_fileName}`]?.["Default"]
            ?.filterData?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData[`${scenario_planner_data_fileName}`]?.["Default"]
            ?.filterData?.selectAllColumns ?? true,
      };

      await setFilterData(
        PriceCurrentValue === "all" ? allFilterData : filterData,
        "Elasticity Detailed View",
        `${scenario_planner_data_fileName}`,
        "Default"
      );

      // Ensure tablesFilterData[`${scenario_planner_data_fileName}`] exists before accessing its "Default" property
      if (
        tablesFilterData[`${scenario_planner_data_fileName}`]?.["Default"]
          ?.filterData
      ) {
        // await loadPriceOptimizationData(
        //   `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`,
        //   experiment_config,
        //   tablesFilterData[`${scenario_planner_data_fileName}`]["Default"]
        //     .filterData,
        //   userInfo.userID
        // );
      } else {
        console.error(
          'tablesFilterData[`${scenario_planner_data_fileName}`]["Default"].filterData is undefined'
        );
        // Handle error accordingly (e.g., show a message, fallback data, etc.)
      }
    };
    fetchPriceOptimizationData();
  }, [PriceCurrentValue]);

  useEffect(() => {
    const fileName = scenario_planner_data_fileName;
    console.log("tablesFilterData", tablesFilterData);
    console.log("fileName", fileName);
    const filtersData = {
      dimensionFilters:
        tablesFilterData[fileName]?.["Default"]?.filterData?.dimensionFilters ??
        {},
      frozenColumns:
        tablesFilterData[fileName]?.["Default"]?.filterData?.frozenColumns ??
        [],
      columnFilter:
        tablesFilterData[fileName]?.["Default"]?.filterData?.columnFilter ?? [],
      selectAllColumns:
        tablesFilterData[fileName]?.["Default"]?.filterData?.selectAllColumns ??
        true,
    };
    console.log("filtersData", filtersData);
    const dimensionFilters = filtersData.dimensionFilters;
    console.log("dimensionFilters", dimensionFilters);
    const tempData = Object.entries(dimensionFilters)
      .filter(([key, value]) => Array.isArray(value) && value.length > 0)
      .map(([key]) => (key === "cluster" ? "Cluster" : key));

    if (dimensionFilters) {
      let filtersArray = [];
      Object.keys(dimensionFilters).forEach((key) => {
        filtersArray = filtersArray.concat(dimensionFilters[key]);
      });
      setFiltersApplied(filtersArray);

      console.log("Filters Applied:", filtersArray);
    }
  }, [tablesFilterData]);

  useEffect(() => {
    const columnFilter =
      tablesFilterData[`${scenario_planner_data_fileName}`]?.["Default"]
        ?.filterData?.columnFilter ?? [];

    setPriceOptDimensionToFilter((prev) =>
      prev.filter((dim) => columnFilter.includes(convert(dim)))
    );
  }, [
    tablesFilterData[`${scenario_planner_data_fileName}`]?.["Default"]
      ?.filterData?.columnFilter,
  ]);

  const handleClearFilter = async () => {
    setCurrentPriceDimension("all");
  };
  return (
    <Box fullwidth sx={{ width: "100%" }}>
      {/* <CustomTable data={priceOptimizationData} /> */}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        padding={"12px 16px"}
        gap={2}
      >
        <CustomAutocomplete
          disableClearable
          showLabel
          label="Dimension"
          placeholder="select option.."
          values={Object.keys(filterData)}
          // isMultiSelect={true}
          selectedValues={PriceCurrentDimension}
          setSelectedValues={setCurrentPriceDimension}
        />
        <CustomAutocomplete
          disableClearable
          showLabel
          label="Value"
          placeholder="select option.."
          values={values}
          // isMultiSelect={true}
          selectedValues={PriceCurrentValue}
          setSelectedValues={setCurrentPriceValue}
        />

        <Stack
          direction={"row"}
          spacing={2}
          justifyContent={"flex-end"}
          alignItems={"flex-end"}
          // border={"1px solid"}
        >
          <CustomButton
            title="Clear"
            onClick={() => {
              handleClearFilter();
            }}
            backgroundColor="#FFFF"
            borderColor="#D0D5DD"
            textColor="#344054"
          />
        </Stack>
      </Stack>
      {boxContent.length > 0 ? (
        <Grid container spacing={3} padding={"12px 16px 12px 16px"}>
          {boxContent.map((box, index) => {
            return (
              <Grid item xs={12} md={12 / boxContent.length} key={index}>
                <BoxComponent data={box} />
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Grid container spacing={3} padding={"12px 16px 12px 16px"}>
          <Grid item xs={12} md={12 / 3}>
            <Skeleton variant="rectangle" height={"150px"} />
          </Grid>
          <Grid item xs={12} md={12 / 3}>
            <Skeleton variant="rectangle" height={"150px"} />
          </Grid>
          <Grid item xs={12} md={12 / 3}>
            <Skeleton variant="rectangle" height={"150px"} />
          </Grid>
        </Grid>
      )}
      {/*  {priceOptimizationData !== null ? ( */}

      <FilterBlock
        filtersApplied={filtersApplied}
        dimensionsToFilter={priceOptDimensionToFilter} // or SnOPDimensionsToFilter
        setDimensionsToFilter={setPriceOptDimensionToFilter} // or setSnOPDimensionsToFilter
        dimensionOptions={Object.keys(filterData)}
        fileName={scenario_planner_data_fileName}
        reportName="Elasticity Detailed View" // or your specific report name
        filterOptions={filterData}
        filterData={filterDataProp}
        path={`${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`}
      />
      <CustomTable
        // data={priceOptimizationData}
        title="Elasticity Detailed View"
      />
      {/*   ) : (
        <Stack
          sx={{ width: "100%", padding: "16px", height: "100%" }}
          spacing={2}
        >
         
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
      )} */}
    </Box>
  );
};

export default DashPriceOptimization;
