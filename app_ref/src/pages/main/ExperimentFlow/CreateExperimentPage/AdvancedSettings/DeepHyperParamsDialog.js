import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CustomCounter from "../../../../../components/CustomInputControls/CustomCounter";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import CustomCheck from "../../../../../components/CustomInputControls/CustomCheck";
import CustomButton from "../../../../../components/CustomButton";
import useConfig from "../../../../../hooks/useConfig";
import TrialParamsManager from "./TrialParamsManager";
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

const StyledSectionTitle = styled(Typography)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(1),
}));

const StyledSubsectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(1),
}));

const FieldWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const renderField = (field, featureGroupTypeOptions ,featureGroup) => {
  switch (field.type) {
    case "Counter":
      return (
        <CustomCounter
          target="config"
          showLabel={true}
          label={field.label}
          path={field.path}
          placeholder={field.placeholder}
          maxRange={field.maxRange}
          minRange={field.minRange}
          key={field.path}
        />
      );
    case "AutoComplete":
      return (
        <CustomAutocomplete
          key={field.path}
          showLabel={true}
          label={field.label}
          path={field.path}
          placeholder={field.placeholder}
          isMultiSelect={field.isMultiSelect}
          values={field.label === "Feature Group Type" ? featureGroupTypeOptions(featureGroup) : field.values}
          target="config"
          formatLabel={false}
        />
      );
    case "Check":
      return (
        <CustomCheck
          question={field.label}
          direction="column"
          path={field.path}
          key={field.path}
          target="config"
        />
      );

    case "custom":
      if (field?.component === "TrialParamsManager") {
        const modelType = field.path.split(".")[2]; // Extract model type from path
        return <TrialParamsManager modelType={modelType} />;
      }
    default:
      return null;
  }
};

const renderNestedFields = (fields , featureGroupTypeOptions ,featureGroup) => {
  return Object.entries(fields).map(([key, field]) => {
    if (field.type === "section") {
      return (
        <Grid item xs={12} key={key}>
          <StyledSectionTitle variant="h6" sx={{ mb: 2, mt: 3 }}>
            {field.label}
          </StyledSectionTitle>
          <Grid container spacing={2}>
            {renderNestedFields(field.fields, featureGroupTypeOptions ,featureGroup)}
          </Grid>
        </Grid>
      );
    } else if (field.type === "subsection") {
      return (
        <Grid item xs={12} key={key}>
          <StyledSubsectionTitle variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
            {field.label}
          </StyledSubsectionTitle>
          <Grid container spacing={2}>
            {renderNestedFields(field.fields, featureGroupTypeOptions ,featureGroup)}
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid item xs={field.xs} md={field.md} key={key}>
          {renderField(field, featureGroupTypeOptions ,featureGroup)}
        </Grid>
      );
    }
  });
};

export default function DeepHyperParamsDialog({
  open,
  handleClose,
  featureGroup,
  bucket,
  refresh,
  onRestore,
}) {
  console.log("deepHyperparameter " + featureGroup);
  const {
    advanceSettingBuckets,
    confirmAdvanceSettingsGroup,

    configState,
    configHyperState,
    configStateSecond,
    featureGroupTypeOptions
  } = useConfig();

  return (
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
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 2 }} paddingX={4}>
          Model Settings
        </Typography>
        <Grid container spacing={2} paddingX={4}>
          {advanceSettingBuckets[bucket].featureGroups[
            featureGroup
          ].features.map((feature) => {
            if (feature.type === "nested") {
              return renderNestedFields(feature.fields , featureGroupTypeOptions ,featureGroup);
            } else {
              return (
                <Grid item xs={feature.xs} md={feature.md} key={feature.path}>
                  {renderField(feature)}
                </Grid>
              );
            }
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <CustomButton
          title={"Confirm"}
          onClick={async () => {
            await confirmAdvanceSettingsGroup(featureGroup);
            handleClose();
          }}
        />
      </DialogActions>
    </BootstrapDialog>
  );
}
