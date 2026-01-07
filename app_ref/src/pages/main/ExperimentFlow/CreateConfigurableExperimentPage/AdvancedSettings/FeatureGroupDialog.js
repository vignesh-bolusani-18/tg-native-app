import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, Grid, Divider } from "@mui/material";
import { ReactComponent as AlertIcon } from "../.././../../../assets/Icons/alert.svg";
import { StyledInput, TextFieldBox } from "../../../../../components/Search";

import { DialogActions } from "@mui/material";
import CustomButton from "../../../../../components/CustomButton";
import CustomTextInput from "../../../../../components/ConfigurableCustomInputControls/CustomTextInput2";
import CustomArrayEditor from "../../../../../components/ConfigurableCustomInputControls/CustomeArrayEditor";
import moment from "moment";
import useModule from "../../../../../hooks/useModule";
import CustomDatePicker from "../../../../../components/ConfigurableCustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../../components/ConfigurableCustomInputControls/CustomCounter";
import CustomAutocomplete from "../../../../../components/ConfigurableCustomInputControls/CustomAutoComplete";
import CustomCheck from "../../../../../components/ConfigurableCustomInputControls/CustomCheck";
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
    enrichment,
    adjust_data,
    confirmAdvanceSettingsGroup,
    datePair,
    addDates,
    exogenous_feature,
    configState,
    setAdjustmentStartDate,
  } = useModule();

  const [comRefresh, setComRefresh] = React.useState(false);

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

  const getDimensionOptions = () => {
    const nonUniquegroupsArray = ["cluster"]
      .concat(configState.scenario_plan.post_model_demand_pattern.dimensions)
      .concat(configState.data.ts_id_columns);

    console.log("dimensionsArray1 " + nonUniquegroupsArray);
    return [...new Set(nonUniquegroupsArray)];
  };

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
                case "dashboard_settings.show_forecasting_pivot_disaggregated":
                  isDisabled =
                    configState.data.ts_id_columns_disagg?.length === 0;

                  break;
              }

              console.log(
                "isdisableupdate " +
                  configState?.feature_engg?.feature_types.includes(
                    "sinusoidal"
                  )
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
                      maxRange={feature.maxRange}
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
                          : Array.isArray(feature.values)
                          ? feature.values
                          : []
                      }
                      valuesDict={feature.valuesDict}
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
                  {feature.type === "Check" && (
                    <CustomCheck
                      question={feature.label}
                      direction={feature.direction}
                      path={feature.path}
                      key={`${feature.path}-${refresh}`}
                      target={feature.target}
                      disabled={isDisabled}
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
