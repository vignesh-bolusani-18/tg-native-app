import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, Grid, Divider, Tooltip, Chip, Box } from "@mui/material";
import { ReactComponent as AlertIcon } from "../.././../../../assets/Icons/alert.svg";
import { StyledInput, TextFieldBox } from "../../../../../components/Search";
import useConfig from "../../../../../hooks/useConfig";
import CustomDatePicker from "../../../../../components/CustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../../components/CustomInputControls/CustomCounter";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import CustomCheck from "../../../../../components/CustomInputControls/CustomCheck";
import { DialogActions } from "@mui/material";
import CustomButton from "../../../../../components/CustomButton";
import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput2";
import CustomArrayEditor from "../../../../../components/CustomInputControls/CustomeArrayEditor";
import moment from "moment";
import { ThemeContext } from "../../../../../theme/config/ThemeContext";
import useExperiment from "../../../../../hooks/useExperiment";
import CustomAutoCompleteObject from "../../../../../components/CustomInputControls/CustomAutoCompleteObject";
import useAuth from "../../../../../hooks/useAuth";
import {
  fetchCSVData,
  fetchCSVFromS3,
  fetchParquetData,
} from "../../../../../utils/s3Utils";
import ForecastDataReferenceTable from "../../../../../components/ForecastDataReferenceTable";
import ExperimentsHistoryTable from "../../../../../components/ExperimentsHistoryTable";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    // padding: theme.spacing(2),
    padding: 0,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: " 1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
};
const StyledSubsectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
}));

export default function FeatureGroupDialog({
  open,
  handleClose,
  featureGroup,
  bucket,
  refresh,
  onRestore,
}) {
  const {
    advanceSettingBuckets,
    advanceSettingBucketFilledFlags,
    enrichment,
    adjust_data,
    confirmContextGroup,
    confirmAdvanceSettingsGroup,
    datePair,
    addDates,
    addExogenousFeature,
    exogenous_feature,
    configState,
    configStateSecond,
    setAdjustmentStartDate,
    forecastDataReferenceItem,
    setForecastDataReferenceItemExpPath,
    setForecastDataReferenceItemForecastType,
    setForecastDataReferenceItemColumnTag,
    resetForecastDataReferenceItem,
    addForecastDataReferenceItem,
    removeForecastDataReferenceItem,
    experimentsHistoryItem,
    setExperimentsHistoryExpPath,
    setExperimentsHistoryDateTag,
    resetExperimentsHistoryItem,
    addExperimentsHistoryItem,
    removeExperimentsHistoryItem,
  } = useConfig();

  const [comRefresh, setComRefresh] = React.useState(false);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);

  console.log(
    "featureDialog " +
      bucket +
      " " +
      featureGroup +
      " " +
      typeof configState.feature_engg.feature_types
  );
  function formatDate(inputDate) {
    // Parse the input string as a Date object
    const date = new Date(inputDate);

    // Specify options for formatting
    const options = { year: "numeric", month: "long", day: "2-digit" };

    // Format the date as "MMMM, dd, yyyy"
    return date.toLocaleDateString("en-US", options);
  }
  const [columnOptions, setColumnOptions] = React.useState([]);
  React.useEffect(() => {
    const fetchColumnOptions = async () => {
      const options = await getColumnOptions();
      setColumnOptions(options);
    };
    fetchColumnOptions();
  }, [forecastDataReferenceItem.exp_path]);
  const getDateTagOptions = async (exp_path, target_path) => {
    try {
      const data = await fetchCSVData({
        filePath: `${exp_path}/${target_path}`,
        filterData: null,
        paginationData: { batchNo: 1, batchSize: 1 },
        sortingData: null,
      });
      const allCols = Object.keys(data);
      console.log("All Columns", allCols);
      // Extract strings matching " YYYY-MM-DD " format and return unique dates
      // Regex explanation: matches any substring like " YYYY-MM-DD " (with spaces)
      // Modified regex to match YYYY-MM-DD anywhere in the string, regardless of surrounding content
      // datePattern matches any substring within a string that is in the form "YYYY-MM-DD"
      // - "YYYY" is any four digits (year)
      // - "MM" is any two digits (month, 01-12)
      // - "DD" is any two digits (day, 01-31)
      // This regex will also match if there is other text before or after the date.
      // For example, it matches "2024-06-11" in:
      //   "2024-06-11"
      //   "foo-2024-06-11-bar"
      //   "date:2024-06-11T00:00:00"
      //   "abc2024-06-11"
      //   "2024-06-11xyz"
      // It only matches the "YYYY-MM-DD" part, regardless of prefixes or suffixes.
      const datePattern = /\d{4}-\d{2}-\d{2}/g;
      const matchingDates = allCols.flatMap((col) => {
        const matches = col.match(datePattern);
        return matches ? matches : [];
      });

      console.log("Matching Dates", matchingDates);

      // Get unique dates
      // Extract just date patterns (YYYY-MM-DD) from matchingDates/strings; collect unique values
      const uniqueDates = Array.from(
        new Set(
          matchingDates.flatMap((str) => {
            const allMatches = str.match(/\d{4}-\d{2}-\d{2}/g);
            return allMatches ? allMatches : [];
          })
        )
      );
      console.log("Date Tag Options", uniqueDates);
      return uniqueDates;
    } catch (error) {
      console.error("Error fetching date tag options:", error);
      return [];
    }
  };
  const getColumnOptions = async () => {
    if (forecastDataReferenceItem.exp_path === null) {
      console.log("Values", []);
      return [];
    }
    try {
      const data = await fetchCSVData({
        filePath: `${forecastDataReferenceItem.exp_path}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
        filterData: null,
        paginationData: { batchNo: 1, batchSize: 1 },
        sortingData: null,
      });
      console.log("Values Fetched", Object.keys(data));
      return Object.keys(data);
    } catch (error) {
      console.error("Error fetching column options:", error);
      console.log("Values", []);
      return [];
    }
  };

  const getDimensionOptions = () => {
    const nonUniquegroupsArray = ["cluster"]
      .concat(configState.scenario_plan.post_model_demand_pattern.dimensions)
      .concat(configState.data.ts_id_columns);

    console.log("dimensionsArray1 " + nonUniquegroupsArray);
    return [...new Set(nonUniquegroupsArray)];
  };

  // Helper function to parse experiment status
  const parseExperimentStatus = (experiment) => {
    try {
      const statusObj = JSON.parse(experiment.experimentStatus);
      return statusObj.status;
    } catch (e) {
      return experiment.experimentStatus;
    }
  };

  // Function to get styles based on status
  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
      case "Running":
        return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
      case "Failed":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Terminated":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Initiating...":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
      case "Executing":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing
      case "Initiated":
        return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started
      case "Terminating":
        return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
      case "On Hold":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused
      case "Retrying...":
        return { color: "#EA580C", backgroundColor: "#FFEDD5" }; // Orange: Retrying
      case "Executed":
        return { color: "#1D4ED8", backgroundColor: "#DBEAFE" }; // Dark Blue
      case "Launching...":
        return { color: "#0EA5E9", backgroundColor: "#E0F2FE" }; // Light Blue
      case "DataProcessCompleted":
        return { color: "#059669", backgroundColor: "#D1FAE5" }; // Teal Green
      case "Scheduled":
        return { color: "#7C3AED", backgroundColor: "#F3E8FF" }; // Purple: Scheduled
      default:
        return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Unknown
    }
  };
  function formatYearMonth(dateString) {
    // Split the string to extract date part
    const datePart = dateString.split(" at ")[0];

    // Create a new Date object with the date part
    const date = new Date(datePart);

    // Check if the date is valid
    if (isNaN(date)) {
      throw new Error("Invalid date format");
    }

    // Extract year and month
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Concatenate year and month
    console.log("Run Date", `${year}${month}`);
    return `${year}${month}`;
  }
  const { theme } = React.useContext(ThemeContext);
  const { experiments_list } = useExperiment();
  const { currentCompany } = useAuth();

  // Get completed experiments for selection
  const experimentOptions = React.useMemo(() => {
    console.log("Calculating experiment options");
    const options = [
      ...new Set(
        experiments_list
          .filter(
            (experiment) =>
              !experiment.inTrash &&
              parseExperimentStatus(experiment) === "Completed" &&
              [
                "demand-planning",
                "inventory-optimization",
                "pricing-promotion-optimization",
              ].includes(experiment.experimentModuleName)
          )
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map(
            (experiment) =>
              `accounts/${currentCompany.companyName}_${
                currentCompany.companyID
              }/data_bucket/${
                experiment.experimentModuleName
              }/${formatYearMonth(experiment.createdAt)}/${
                experiment.experimentID
              }`
          )
      ),
    ];
    console.log("Available experiment options:", options);
    return options;
  }, [experiments_list]);

  // Dictionary mapping ID to experiment object
  const experimentObjectDict = Object.fromEntries(
    experiments_list
      .filter(
        (experiment) =>
          !experiment.inTrash &&
          parseExperimentStatus(experiment) === "Completed" &&
          [
            "demand-planning",
            "inventory-optimization",
            "pricing-promotion-optimization",
          ].includes(experiment.experimentModuleName)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((experiment) => [experiment.experimentID, experiment])
  );

  // Dictionary mapping ID to experiment for display
  const experimentValuesDict = Object.fromEntries(
    experiments_list
      .filter(
        (experiment) =>
          !experiment.inTrash &&
          parseExperimentStatus(experiment) === "Completed" &&
          [
            "demand-planning",
            "inventory-optimization",
            "pricing-promotion-optimization",
          ].includes(experiment.experimentModuleName)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((experiment) => [
        `accounts/${currentCompany.companyName}_${
          currentCompany.companyID
        }/data_bucket/${experiment.experimentModuleName}/${formatYearMonth(
          experiment.createdAt
        )}/${experiment.experimentID}`,
        `${experiment.experimentName} (${experiment.experimentID.slice(
          0,
          3
        )}...${experiment.experimentID.slice(-3)})`,
      ])
  );

  // Create custom components for experiment options
  const experimentComponentDict = Object.fromEntries(
    experiments_list
      .filter(
        (experiment) =>
          !experiment.inTrash &&
          parseExperimentStatus(experiment) === "Completed" &&
          [
            "demand-planning",
            "inventory-optimization",
            "pricing-promotion-optimization",
          ].includes(experiment.experimentModuleName)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((experiment) => [
        `accounts/${currentCompany.companyName}_${
          currentCompany.companyID
        }/data_bucket/${experiment.experimentModuleName}/${formatYearMonth(
          experiment.createdAt
        )}/${experiment.experimentID}`,
        () => (
          <Stack
            direction={"row"}
            alignItems={"center"}
            sx={{ width: "100%", padding: "4px" }}
          >
            <Stack spacing={0.1} width={"30%"}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "18px",
                  textAlign: "left",
                  color: theme.palette.text.modalHeading,
                }}
              >
                {experiment.experimentName}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "#475467",
                  textAlign: "left",
                }}
              >
                {experiment.experimentID}
              </Typography>
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-start"}
              width={"20%"}
            >
              <Chip
                label={experiment.experimentModuleName}
                size="small"
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  lineHeight: "18px",
                  textAlign: "initial",
                  color: "#027A48",
                  backgroundColor: "#ECFDF3",
                }}
              />
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              width={"50%"}
            >
              <Stack spacing={0.1}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "18px",
                    textAlign: "left",
                    color: theme.palette.text.modalHeading,
                  }}
                >
                  Created At
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "left",
                  }}
                >
                  {experiment.createdAt}
                </Typography>
              </Stack>
              <Stack spacing={0.1}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "18px",
                    textAlign: "left",
                    color: theme.palette.text.modalHeading,
                  }}
                >
                  Updated At
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "left",
                  }}
                >
                  {experiment.updatedAt}
                </Typography>
              </Stack>
              <Tooltip title="Completed Experiment">
                <Chip
                  label={parseExperimentStatus(experiment)}
                  size="small"
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 500,
                    lineHeight: "18px",
                    textAlign: "initial",
                    ...getStatusStyles(parseExperimentStatus(experiment)),
                  }}
                />
              </Tooltip>
            </Stack>
          </Stack>
        ),
      ])
  );

  const renderFeatureDates = () => {
    return (
      exogenous_feature.start_dt.length > 0 && (
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <Typography
              sx={{
                color: "#344054",
                fontFamily: "Inter",
                fontWeight: "500",
                fontSize: "14px",
                lineHeight: "20px",
              }}
            >
              Date Ranges
            </Typography>
            <Stack spacing={1} direction={"row"}>
              <Stack>
                {exogenous_feature.start_dt.map((date, index) => {
                  return (
                    <Typography
                      key={`start-date-${index}`} // Ensure you add a unique key for each child
                      sx={{
                        color: "#344054",
                        fontFamily: "Inter",
                        fontWeight: "500",
                        fontSize: "12px",
                        lineHeight: "20px",
                      }}
                    >
                      {formatDate(date)} -
                    </Typography>
                  );
                })}
              </Stack>
              <Stack>
                {exogenous_feature.end_dt.map((date, index) => {
                  return (
                    <Typography
                      key={`end-date-${index}`} // Ensure you add a unique key for each child
                      sx={{
                        color: "#344054",
                        fontFamily: "Inter",
                        fontWeight: "500",
                        fontSize: "12px",
                        lineHeight: "20px",
                      }}
                    >
                      {formatDate(date)}
                    </Typography>
                  );
                })}
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      )
    );
  };

  const getMaxRange = (featurePath, defaultMaxRange) => {
    switch (featurePath) {
      case "scenario_plan.demand_alignment_report.zero_sales_lag":
        return (
          configState?.scenario_plan?.historical_horizon_snop || defaultMaxRange
        );
      case "scenario_plan.demand_alignment_report.zero_forecast_horizon":
        return configState?.data?.forecast_horizon || defaultMaxRange;
      default:
        return defaultMaxRange;
    }
  };

  const handleChangeFRSValue = (value, path) => {
    switch (path) {
      case "exp_path":
        setForecastDataReferenceItemExpPath(value);
        break;
      case "forecast_type":
        setForecastDataReferenceItemForecastType(value);
        break;
      case "column_tag":
        setForecastDataReferenceItemColumnTag(value);
        break;
    }
  };

  const handleChangeAHSValue = (value, path) => {
    switch (path) {
      case "exp_path":
        setExperimentsHistoryExpPath(value);
        break;
      case "date_tag":
        setExperimentsHistoryDateTag(value);
        break;
    }
  };

  const isConfirmButtonEnabled = () => {
    switch (featureGroup) {
      case "APA":
        return (
          adjust_data.kwargs.date_range[1] &&
          (adjust_data.kwargs.adjustment_type === "cut_history" ||
            adjust_data.kwargs.date_range[0]) &&
          (adjust_data.kwargs.dimension === "None" ||
            (adjust_data.kwargs.dimension !== "None" &&
              adjust_data.kwargs.value !== null))
        );
      case "APE":
        return (
          enrichment.kwargs.date_range[0] &&
          enrichment.kwargs.date_range[1] &&
          (enrichment.kwargs.dimension === "None" ||
            (enrichment.kwargs.dimension !== "None" &&
              enrichment.kwargs.value !== null))
        );

      case "GS":
        return configState.scenario_plan.file_type.length !== 0;
      default:
        return true;
    }
  };

  React.useEffect(() => {
    console.log("datePair changed:", datePair);
    setComRefresh(!comRefresh);
  }, [datePair, exogenous_feature.start_dt]);
  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            padding: "20px 26px 19px 26px",
            borderBottom: "1px solid #EAECF0",
          }}
          id="customized-dialog-title"
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
            {advanceSettingBuckets[bucket].featureGroups[featureGroup].title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={async () => {
              await handleClose();
            }}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#667085",
              padding: "8px",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {featureGroup === "FRS" && (
            <Box>
              {/* Fixed Inputs Section */}
              <Grid container spacing={2} padding={4}>
                {advanceSettingBuckets[bucket].featureGroups[
                  featureGroup
                ].features.map((feature) => {
                  let isDisabled = false;

                  switch (feature.path) {
                    case "column_tag":
                      isDisabled = forecastDataReferenceItem.exp_path === null;
                      break;

                    default:
                      break;
                  }

                  return (
                    <Grid
                      item
                      xs={feature.xs}
                      md={feature.md}
                      alignItems={"center"}
                      justifyContent={"center"}
                      key={`${feature.path}-${comRefresh}`}
                    >
                      {feature.type === "AutoComplete" && (
                        <CustomAutocomplete
                          key={`${feature.path}-${refresh}`}
                          showLabel={feature.showLabel}
                          label={feature.label}
                          selectedValues={
                            forecastDataReferenceItem[feature.path]
                          }
                          setSelectedValues={(value) =>
                            handleChangeFRSValue(value, feature.path)
                          }
                          placeholder={feature.placeholder}
                          isMultiSelect={feature.isMultiSelect}
                          getValueOptions={
                            feature.values === "date_columns"
                              ? async () =>
                                  await getDateTagOptions(
                                    forecastDataReferenceItem.exp_path,
                                    feature.target_file
                                  )
                              : null
                          }
                          values={
                            feature.values === "date_columns"
                              ? []
                              : feature.values === "experiments_list"
                              ? experimentOptions
                              : Array.isArray(feature.values)
                              ? feature.values
                              : []
                          }
                          valuesDict={
                            feature.values === "experiments_list"
                              ? experimentValuesDict
                              : feature.valuesDict
                          }
                          optionComponentDict={
                            feature.values === "experiments_list"
                              ? experimentComponentDict
                              : feature.optionComponentDict
                          }
                          dateFormat={feature.dateFormat}
                          target={feature.target}
                          disabled={isDisabled}
                          conflictCheck={
                            feature.conflictCheck === undefined
                              ? false
                              : feature.conflictCheck
                          }
                          formatLabel={false}
                        />
                      )}
                    </Grid>
                  );
                })}
              </Grid>

              {/* Scrollable References Section */}
              {configState?.dashboard_settings?.forecast_data_reference
                ?.length > 0 && (
                <Box sx={{ px: 4, pb: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <StyledSubsectionTitle variant="subtitle1" sx={{ mb: 2 }}>
                    Forecast Data References
                  </StyledSubsectionTitle>
                  <ForecastDataReferenceTable
                    forecastDataReferences={
                      configState.dashboard_settings.forecast_data_reference
                    }
                    onRemoveReference={(index) => {
                      removeForecastDataReferenceItem(index);
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
          {featureGroup === "AHS" && (
            <Box>
              {/* Fixed Inputs Section */}
              <Grid container spacing={2} padding={4}>
                {advanceSettingBuckets[bucket].featureGroups[
                  featureGroup
                ].features.map((feature) => {
                  let isDisabled = false;

                  switch (feature.path) {
                    case "date_tag":
                      isDisabled = experimentsHistoryItem.exp_path === null;
                      break;

                    default:
                      break;
                  }

                  return (
                    <Grid
                      item
                      xs={feature.xs}
                      md={feature.md}
                      alignItems={"center"}
                      justifyContent={"center"}
                      key={`${feature.path}-${comRefresh}`}
                    >
                      {feature.type === "AutoComplete" && (
                        <CustomAutocomplete
                          key={`${feature.path}-${refresh}`}
                          showLabel={feature.showLabel}
                          label={feature.label}
                          selectedValues={experimentsHistoryItem[feature.path]}
                          setSelectedValues={(value) =>
                            handleChangeAHSValue(value, feature.path)
                          }
                          placeholder={feature.placeholder}
                          isMultiSelect={feature.isMultiSelect}
                          getValueOptions={
                            feature.values === "date_columns"
                              ? async () =>
                                  await getDateTagOptions(
                                    experimentsHistoryItem.exp_path,
                                    feature.target_file
                                  )
                              : null
                          }
                          values={
                            feature.values === "date_columns"
                              ? []
                              : feature.values === "experiments_list"
                              ? experimentOptions
                              : Array.isArray(feature.values)
                              ? feature.values
                              : []
                          }
                          valuesDict={
                            feature.values === "experiments_list"
                              ? experimentValuesDict
                              : feature.valuesDict
                          }
                          optionComponentDict={
                            feature.values === "experiments_list"
                              ? experimentComponentDict
                              : feature.optionComponentDict
                          }
                          dateFormat={feature.dateFormat}
                          target={feature.target}
                          disabled={isDisabled}
                          conflictCheck={
                            feature.conflictCheck === undefined
                              ? false
                              : feature.conflictCheck
                          }
                          formatLabel={false}
                        />
                      )}
                    </Grid>
                  );
                })}
              </Grid>

              {/* Scrollable References Section */}
              {configState?.agent_settings?.experiments_history?.length > 0 && (
                <Box sx={{ px: 4, pb: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  <StyledSubsectionTitle variant="subtitle1" sx={{ mb: 2 }}>
                    Experiments History
                  </StyledSubsectionTitle>
                  <ExperimentsHistoryTable
                    experimentsHistory={
                      configState.agent_settings.experiments_history
                    }
                    onRemoveExperiment={(index) => {
                      removeExperimentsHistoryItem(index);
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
          {!["FRS", "AHS"].includes(featureGroup) && (
            <Grid container spacing={2} padding={4}>
              {advanceSettingBuckets[bucket].featureGroups[
                featureGroup
              ].features.map((feature) => {
                let isDisabled = false;

                switch (feature.path) {
                  case "kwargs.adjustment_value":
                    console.log("isdisableupdate " + isDisabled);
                    isDisabled =
                      adjust_data.kwargs.adjustment_type === "cut_history";
                    break;

                  case "kwargs.date_range[0]":
                    isDisabled =
                      adjust_data.kwargs.adjustment_type === "cut_history";
                    break;

                  case "kwargs.time_steps":
                    isDisabled = adjust_data.kwargs.adjustment_type !== "YoY";
                    break;

                  case "kwargs.future_history":
                    isDisabled = adjust_data.kwargs.adjustment_type !== "YoY";
                    break;
                  case "kwargs.enrichment_value":
                    isDisabled = enrichment.kwargs.enrichment_type !== "uplift";
                    break;
                  case "feature_engg.sinusoidal_freq_max_count":
                    isDisabled =
                      !configState?.feature_engg?.feature_types.includes(
                        "sinusoidal"
                      );
                    break;
                  case "dashboard_settings.show_forecasting_pivot_disaggregated":
                    isDisabled =
                      configState.data.ts_id_columns_disagg?.length === 0;
                    break;
                  case "agent_settings.forecast_type_for_reward":
                    isDisabled = configState.stacking.rl_agents === false;
                    break;
                  case "agent_settings.forecast_deviation":
                    isDisabled = configState.stacking.rl_agents === false;
                    break;
                  case "agent_settings.accuracy_by_test_horizon":
                    isDisabled = configState.stacking.rl_agents === false;
                    break;
                  case "agent_settings.accuracy_by_n_horizon":
                    isDisabled = configState.stacking.rl_agents === false;
                    break;
                  case "agent_settings.test_horizon":
                    isDisabled =
                      configState.agent_settings.accuracy_by_test_horizon ===
                        false || configState.stacking.rl_agents === false;
                    break;
                  case "agent_settings.past_accuracy_horizon":
                    isDisabled =
                      configState.agent_settings.accuracy_by_n_horizon ===
                        false || configState.stacking.rl_agents === false;
                    break;

                  case "agent_settings.enable_rl_agent_forecast":
                    isDisabled = configState.stacking.rl_agents === false;
                    break;

                  case "agent_settings.rl_agent_forecast_granularity":
                    isDisabled =
                      configState.agent_settings.enable_rl_agent_forecast ===
                        false || configState.stacking.rl_agents === false;
                    break;

                  case "agent_settings.rl_agent_forecast_eligible_actions":
                    isDisabled =
                      configState.agent_settings.enable_rl_agent_forecast ===
                        false || configState.stacking.rl_agents === false;
                    break;

                  case "agent_settings.rl_agent_forecast_start_date":
                    isDisabled =
                      configState.agent_settings.enable_rl_agent_forecast ===
                        false || configState.stacking.rl_agents === false;
                    break;

                  case "agent_settings.rl_agent_forecast_end_date":
                    isDisabled =
                      configState.agent_settings.enable_rl_agent_forecast ===
                        false || configState.stacking.rl_agents === false;
                    break;
                  case "scenario_plan.demand_alignment_report.dimensions_for_accuracy":
                    isDisabled =
                      configState.scenario_plan.demand_alignment_report
                        .calc_dimensions_accuracy === false;

                  default:
                    break;
                }

                console.log(
                  "isdisableupdate " +
                    configState.agent_settings.enable_rl_agent_forecast
                );

                return (
                  <Grid
                    item
                    xs={feature.xs}
                    md={feature.md}
                    alignItems={"center"}
                    justifyContent={"center"}
                    key={`${feature.path}-${comRefresh}`}
                  >
                    {feature.type === "DatePicker" && (
                      <CustomDatePicker
                        showLabel={feature.showLabel}
                        label={feature.label}
                        path={feature?.path}
                        key={`${feature?.path}-${comRefresh}`}
                        target={feature?.target}
                        disabled={isDisabled}
                      />
                    )}

                    {feature.type === "Counter" && (
                      <CustomCounter
                        target={feature.target}
                        showLabel={feature.showLabel}
                        label={feature.label}
                        path={feature.path}
                        placeholder={feature.placeholder}
                        maxRange={getMaxRange(
                          feature.path,

                          feature.maxRange
                        )}
                        minRange={feature.minRange}
                        key={`${feature.path}-${refresh}`}
                        disabled={isDisabled}
                      />
                    )}
                    {feature.type === "AutoComplete" && (
                      <CustomAutocomplete
                        key={`${feature.path}-${refresh}`}
                        showLabel={feature.showLabel}
                        label={feature.label}
                        path={feature.path}
                        placeholder={feature.placeholder}
                        isMultiSelect={feature.isMultiSelect}
                        values={
                          feature.values === "dimensionOptions"
                            ? getDimensionOptions()
                            : feature.values === "experiments_list"
                            ? experimentOptions
                            : Array.isArray(feature.values)
                            ? feature.values
                            : []
                        }
                        valuesDict={
                          feature.values === "experiments_list"
                            ? experimentValuesDict
                            : feature.valuesDict
                        }
                        optionComponentDict={
                          feature.values === "experiments_list"
                            ? experimentComponentDict
                            : feature.optionComponentDict
                        }
                        dateFormat={feature.dateFormat}
                        target={feature.target}
                        disabled={isDisabled}
                        conflictCheck={
                          feature.conflictCheck === undefined
                            ? false
                            : feature.conflictCheck
                        }
                        formatLabel={false}
                      />
                    )}
                    {/* {feature.type === "AutoCompleteObject" && (
                    <CustomAutoCompleteObject
                      showLabel
                      label="Select Experiment"
                      placeholder="Select an experiment to attach"
                      values={experimentOptions}
                      selectedValues={{
                        Experiment: selectedExperiment
                          ? [selectedExperiment.experimentID]
                          : [],
                        ExperimentObject: selectedExperiment
                          ? [selectedExperiment]
                          : [],
                      }}
                      setSelectedValues={(value) => {
                        console.log("Selected value:", value);
                        if (value?.ExperimentObject?.[0]) {
                          setSelectedExperiment(value.ExperimentObject[0]);
                        } else {
                          setSelectedExperiment(null);
                        }
                      }}
                      valuesDict={experimentValuesDict}
                      objectDict={experimentObjectDict}
                      optionComponentDict={experimentComponentDict}
                      isMultiSelect={false}
                      target="Experiment"
                      path="selectedExperiment"
                      excludedOptions={excludedExperiments}
                    />
                  )} */}
                    {feature.type === "Check" && (
                     <CustomCheck
  question={feature.label}
  direction={feature.direction}
  path={feature.path}
  refreshKey={`${feature.path}-${refresh}`}
  target={feature.target}
  disabled={isDisabled}
  exclusiveWith={[
    {
      path: "agent_settings.accuracy_by_test_horizon",
      target: "config",
      value: configState.agent_settings.accuracy_by_test_horizon,
    },
    {
      path: "agent_settings.accuracy_by_n_horizon",
      target: "config",
      value: configState.agent_settings.accuracy_by_n_horizon,
    },
  ]}
  exclusiveUpdate = {feature.path === "agent_settings.accuracy_by_test_horizon" || feature.path === "agent_settings.accuracy_by_n_horizon"}
/>

                    )}

                    {feature.type === "TextInput" && (
                      <CustomTextInput
                        showLabel={feature.showLabel}
                        placeholder={feature.placeholder}
                        label={feature.label}
                        required
                        path={feature.path}
                        target={feature.target}
                      />
                    )}

                    {feature.type === "ArrayEditor" && (
                      <CustomArrayEditor
                        showLabel={feature.showLabel}
                        placeholder={feature.placeholder}
                        label={feature.label}
                        required
                        path={feature.path}
                        target={feature.target}
                      />
                    )}
                  </Grid>
                );
              })}
              {featureGroup === "AEF" && renderFeatureDates()}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          {featureGroup === "AEF" ? (
            <>
              <CustomButton
                title={"Add Dates"}
                outlined
                onClick={addDates}
                disabled={!datePair.start_dt || !datePair.end_dt}
              />
              <CustomButton
                title={"Add Feature"}
                onClick={async () => {
                  await confirmAdvanceSettingsGroup(featureGroup);
                  handleClose();
                }}
                disabled={
                  !exogenous_feature.new_column ||
                  exogenous_feature.start_dt.length === 0
                }
              />
            </>
          ) : featureGroup === "FRS" ? (
            <>
              <CustomButton
                title={"Add Reference"}
                outlined
                onClick={addForecastDataReferenceItem}
                disabled={
                  !forecastDataReferenceItem.exp_path ||
                  !forecastDataReferenceItem.forecast_type ||
                  !forecastDataReferenceItem.column_tag
                }
              />
              <CustomButton
                title={"Confirm"}
                onClick={async () => {
                  await confirmAdvanceSettingsGroup(featureGroup);
                  handleClose();
                }}
                disabled={
                  configState.dashboard_settings?.forecast_data_reference
                    ?.length === 0
                }
              />
            </>
          ) : featureGroup === "AHS" ? (
            <>
              <CustomButton
                title={"Add Experiment"}
                outlined
                onClick={addExperimentsHistoryItem}
                disabled={
                  !experimentsHistoryItem.exp_path ||
                  !experimentsHistoryItem.date_tag
                }
              />
              <CustomButton
                title={"Confirm"}
                onClick={async () => {
                  await confirmAdvanceSettingsGroup(featureGroup);
                  handleClose();
                }}
                disabled={
                  configState.agent_settings?.experiments_history?.length === 0
                }
              />
            </>
          ) : (
            <CustomButton
              title={
                advanceSettingBuckets[bucket]?.featureGroups[featureGroup]
                  ?.btnTitle || "Confirm"
              }
              onClick={async () => {
                // Add the conditional logic to set adjustment start date
                if (
                  featureGroup === "APA" &&
                  adjust_data.kwargs.adjustment_type === "cut_history"
                ) {
                  setAdjustmentStartDate(
                    moment.utc("1990-01-01", "YYYY-MM-DD").format("YYYY-MM-DD")
                  );
                }

                // Then proceed with the original onClick logic
                await handleClose();
                await confirmAdvanceSettingsGroup(featureGroup); // Ensure async is handled
              }}
              disabled={!isConfirmButtonEnabled()}
            />
          )}
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
