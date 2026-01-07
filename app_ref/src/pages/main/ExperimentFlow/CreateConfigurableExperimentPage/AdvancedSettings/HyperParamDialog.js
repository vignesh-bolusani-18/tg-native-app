import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, Grid, Divider, TextField, Box, Paper } from "@mui/material";


import { DialogActions } from "@mui/material";
import CustomButton from "../../../../../components/CustomButton";
import useModule from "../../../../../hooks/useModule";
import CustomTextInput from "../../../../../components/ConfigurableCustomInputControls/CustomTextInput2";
import CustomArrayEditor from "../../../../../components/ConfigurableCustomInputControls/CustomeArrayEditor";
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  border: "1px solid",
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
  color: "#344054",
  fontFamily: "Inter",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "20px",
  marginBottom: theme.spacing(1),
}));

const StyledValue = styled(Typography)(({ theme }) => ({
  padding: "10px 14px",
  border: "1px solid #D0D5DD",
  borderRadius: 8,
  backgroundColor: theme.palette.background.default,
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "18px",
  color: "#667085",
  width: "100%",
  minHeight: "40px",
  display: "flex",
  alignItems: "center",
}));

export default function HyperParamsDialog({
  open,
  handleClose,
  featureGroup,
  bucket,
  refresh,
  onRestore,
}) {
  const {
    advanceSettingBuckets,
    confirmAdvanceSettingsGroup,

    configState,
  } = useModule();
  const configHyperState = configState.training.models;

  const [comRefresh, setComRefresh] = React.useState(false);

  const HyperParamState =
    configHyperState[
      advanceSettingBuckets[bucket].featureGroups[featureGroup]?.title
    ].hyperparams;

  console.log(
    "featureDialog " +
      bucket +
      " " +
      featureGroup +
      " " +
      JSON.stringify(
        advanceSettingBuckets[bucket].featureGroups[featureGroup].title
      )
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

  console.log(
    "paramtype " + configState.training.models.Xgboost.hyperparams.n_estimators
  );

  React.useEffect(() => {
    setComRefresh(!comRefresh);
  }, []);

  
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
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "30px",
              color: "#101828",
              textAlign: "left",
            }}
            paddingX = {4}
            paddingY = {2}
          >
            Model Settings
          </Typography>
          <Grid container spacing={2} paddingX={4} paddingY={2}>
            {advanceSettingBuckets[bucket].featureGroups[
              featureGroup
            ].features.map((feature) => {
              console.log("hypertypes " + feature.path);

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
          </Grid>

          <Divider />
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "30px",
              color: "#101828",
              textAlign: "left",
            }}
            paddingX = {4}
            paddingY = {2}
          >
            HyperParameters Settings
          </Typography>
          <Box marginTop={2}>
            {advanceSettingBuckets[bucket].featureGroups[
              featureGroup
            ].features.map((feature, index) => {
              const module = feature.path.split(".").pop();

              if (feature.type === "hyperparameter") {
                return (
                  <Box
                    key={`${featureGroup}-${index}`}
                    sx={{ mb: 3 }}
                    paddingX={4}
                  >
                    {/* <Typography variant="h8" sx={{ fontWeight: 500, color: 'secondry.main' }}>
                    {module}
                  </Typography> */}

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <StyledLabel variant="subtitle2">
                            {module}
                          </StyledLabel>
                          <StyledValue variant="body1">
                            {HyperParamState[module]?.type || "Not specified"}
                          </StyledValue>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        {HyperParamState[module]?.type === "choice" && (
                          <CustomArrayEditor
                            target={feature.target}
                            showLabel={feature.showLabel}
                            label="Parameters"
                            path={`${feature.path}.params`}
                            placeholder={feature.placeholder}
                            disabled={feature.isFixed}
                          />
                        )}

                        {HyperParamState[module]?.type === "loguniform" && (
                          <Stack direction="row" sx={{ width: "100%" }}>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <CustomCounter
                                  target={feature.target}
                                  showLabel={feature.showLabel}
                                  label="Min"
                                  path={`${feature.path}.params[0]`}
                                  placeholder={feature.placeholder}
                                  maxRange={100}
                                  minRange={0}
                                  key={`${feature.path}-${refresh}`}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <CustomCounter
                                  target={feature.target}
                                  showLabel={feature.showLabel}
                                  label="Max"
                                  path={`${feature.path}.params[1]`}
                                  placeholder={feature.placeholder}
                                  maxRange={100}
                                  minRange={0}
                                  key={`${feature.path}-${refresh}`}
                                />
                              </Grid>
                            </Grid>
                          </Stack>
                        )}
                        {HyperParamState[module]?.type === "quniform" && (
                          <Stack direction="row" spacing={2}>
                            <CustomCounter
                              target={feature.target}
                              showLabel={feature.showLabel}
                              label="Min"
                              path={`${feature.path}.params[0]`}
                              placeholder={feature.placeholder}
                              maxRange={999}
                              minRange={0}
                              key={`${feature.path}-${refresh}`}
                            />
                            <CustomCounter
                              target={feature.target}
                              showLabel={feature.showLabel}
                              label="Max"
                              path={`${feature.path}.params[1]`}
                              placeholder={feature.placeholder}
                              maxRange={999}
                              minRange={0}
                              key={`${feature.path}-${refresh}`}
                            />
                            <CustomCounter
                              target={feature.target}
                              showLabel={feature.showLabel}
                              label="Step"
                              path={`${feature.path}.params[2]`}
                              placeholder={feature.placeholder}
                              maxRange={999}
                              minRange={0}
                              key={`${feature.path}-${refresh}`}
                            />
                          </Stack>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                );
              }
              return null;
            })}
          </Box>
        </DialogContent>

        <DialogActions>
          <CustomButton
            title={
              advanceSettingBuckets[bucket]?.featureGroups[featureGroup]
                ?.btnTitle
            }
            onClick={async () => {
              await handleClose();
              await confirmAdvanceSettingsGroup(`HyperParameter-${featureGroup}`); // Ensure async is handled
            }}
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
