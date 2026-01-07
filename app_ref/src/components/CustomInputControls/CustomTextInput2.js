// src/components/CustomInputControls/CustomTextInput.js

import React, { useContext, useState } from "react";
import { Stack, Typography, InputAdornment, IconButton } from "@mui/material";
import { StyledInputBase, TextFieldBox } from "../Search";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { ERROR } from "../../theme/custmizations/colors";
import useExperiment from "../../hooks/useExperiment";
import useConfig from "../../hooks/useConfig";
import useExports from "../../hooks/useExports";
import useImpact from "../../hooks/useImpact";

const CustomTextInput = ({
  type = "text",
  placeholder,
  showLabel,
  label,
  startAdornment,
  endAdornment,
  disabled = false,
  target,
  path,
  required,
  helperText = "This field is required",
  dependentFieldsToUpdate = [],
}) => {
  const { theme } = useContext(ThemeContext);
  const {
    updateConfigFieldByPath,
    getConfigFieldByPath,
    getContextConfigFieldByPath,
    updateContextConfigFieldByPath,
    contextConfig,
    getAdjustDataFieldByPath,
    getEnrichmentFieldByPath,
    getExogenousFeatureFieldByPath,
    getDatePairFieldByPath,
    updateAdjustDataByPath,
    updateEnrichmentByPath,
    updateExogenousFeatureByPath,
    updateDatePairByPath,
  } = useConfig();
  const { getExportPipelineFieldByPath, updateExportPipelineFieldByPath } =
    useExports();
  const { getImpactPipelineFieldByPath, updateImpactPipelineByPath } =
    useImpact();
  const {
    updateTagFieldByPath,
    getTagFieldByPath,
    getJoinFieldByPath,
    updateJoinDataByPath,
  } = useExperiment();

  const getDefault = () => {
    let defaultValue;

    if (target === "tag") {
      const value = getTagFieldByPath(path);
      defaultValue = value !== null ? value : "";
    } else if (target === "config" && !disabled) {
      defaultValue = getConfigFieldByPath(path) || "";
    } else if (target === "context" && !disabled) {
      defaultValue = getContextConfigFieldByPath(path) || "";
      console.log("Found Default value", defaultValue);
    } else if (target === "join" && !disabled) {
      defaultValue = getJoinFieldByPath(path) || "";
    } else if (target === "adjust" && !disabled) {
      defaultValue = getAdjustDataFieldByPath(path) || "";
    } else if (target === "enrichment" && !disabled) {
      defaultValue = getEnrichmentFieldByPath(path) || "";
    } else if (target === "exogenous" && !disabled) {
      defaultValue = getExogenousFeatureFieldByPath(path) || "";
    } else if (target === "datePair" && !disabled) {
      defaultValue = getDatePairFieldByPath(path) || "";
    } else if (target === "exports" && !disabled) {
      defaultValue = getExportPipelineFieldByPath(path) || "";
    } else if (target === "impact" && !disabled) {
      defaultValue = getImpactPipelineFieldByPath(path) || "";
    } else {
      defaultValue = path ? getConfigFieldByPath(path) || null : "";
    }

    return defaultValue;
  };

  const [defaultValue, setDefaultValue] = useState(path ? getDefault() : "");
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(false);


  const handleChange = (value) => {
    setValue(value);
    if (required && value.trim() === "") {
      setError(true);
      if (target === "tag") {
        updateTagFieldByPath(path, null);
      } else if (target === "config") {
        updateConfigFieldByPath(path, null);
      } else if (target === "context") {
        updateContextConfigFieldByPath(path, null);
      } else if (target === "join") {
        updateJoinDataByPath(path, null);
      } else if (target === "adjust" && !disabled) {
        updateAdjustDataByPath(path, null);
      } else if (target === "enrichment" && !disabled) {
        updateEnrichmentByPath(path, null);
      } else if (target === "exogenous" && !disabled) {
        updateExogenousFeatureByPath(path, getDefault());
      } else if (target === "datePair" && !disabled) {
        updateDatePairByPath(path, null);
      } else if (target === "exports" && !disabled) {
        updateExportPipelineFieldByPath(path, null);
      } else if (target === "impact" && !disabled) {
        updateImpactPipelineByPath(path, null);
      } else {
        updateConfigFieldByPath(path, null);
      }
      if (dependentFieldsToUpdate.length > 0) {
        dependentFieldsToUpdate.forEach(({ path, target }) => {
          if (target === "tag") {
            updateTagFieldByPath(path, null);
          } else if (target === "config") {
            updateConfigFieldByPath(path, null);
          } else if (target === "context") {
            updateContextConfigFieldByPath(path, null);
          } else if (target === "join") {
            updateJoinDataByPath(path, null);
          } else if (target === "adjust" && !disabled) {
            updateAdjustDataByPath(path, null);
          } else if (target === "enrichment" && !disabled) {
            updateEnrichmentByPath(path, null);
          } else if (target === "exogenous" && !disabled) {
            updateExogenousFeatureByPath(path, getDefault());
          } else if (target === "datePair" && !disabled) {
            updateDatePairByPath(path, null);
          } else if (target === "exports" && !disabled) {
            updateExportPipelineFieldByPath(path, null);
          } else if (target === "impact" && !disabled) {
            updateImpactPipelineByPath(path, null);
          } else {
            updateConfigFieldByPath(path, null);
          }
        });
      }
    } else {
      setError(false);
      if (target === "tag") {
        updateTagFieldByPath(path, value);
      } else if (target === "config") {
        updateConfigFieldByPath(path, value);
      } else if (target === "context") {
        updateContextConfigFieldByPath(path, value);
      } else if (target === "join") {
        updateJoinDataByPath(path, value);
      } else if (target === "adjust" && !disabled) {
        updateAdjustDataByPath(path, value);
      } else if (target === "enrichment" && !disabled) {
        updateEnrichmentByPath(path, value);
      } else if (target === "exogenous" && !disabled) {
        updateExogenousFeatureByPath(path, value);
      } else if (target === "datePair" && !disabled) {
        updateDatePairByPath(path, value);
      } else if (target === "exports" && !disabled) {
        updateExportPipelineFieldByPath(path, value);
      } else if (target === "impact" && !disabled) {
        updateImpactPipelineByPath(path, value);
      } else {
        updateConfigFieldByPath(path, value);
      }
      if (dependentFieldsToUpdate.length > 0) {
        dependentFieldsToUpdate.forEach(({ path, target }) => {
          if (target === "tag") {
            updateTagFieldByPath(path, value);
          } else if (target === "config") {
            updateConfigFieldByPath(path, value);
          } else if (target === "context") {
            updateContextConfigFieldByPath(path, value);
          } else if (target === "join") {
            updateJoinDataByPath(path, value);
          } else if (target === "adjust" && !disabled) {
            updateAdjustDataByPath(path, value);
          } else if (target === "enrichment" && !disabled) {
            updateEnrichmentByPath(path, value);
          } else if (target === "exogenous" && !disabled) {
            updateExogenousFeatureByPath(path, value);
          } else if (target === "datePair" && !disabled) {
            updateDatePairByPath(path, value);
          } else if (target === "exports" && !disabled) {
            updateExportPipelineFieldByPath(path, value);
          } else if (target === "impact" && !disabled) {
            updateImpactPipelineByPath(path, value);
          } else {
            updateConfigFieldByPath(path, value);
          }
        });
      }
    }
  };

  return (
    <Stack>
      {showLabel && (
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "20px",
            textAlign: "left",
            color: "#344054",
            textTransform: "none",
            marginBottom: "6px",
          }}
        >
          {label}
        </Typography>
      )}

      <StyledInputBase
        type={type}
        value={value}
        onChange={(event) => {
          handleChange(event.target.value);
        }}
        placeholder={placeholder}
        inputProps={{ "aria-label": "experiment-title", readOnly: disabled }}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        disabled={disabled}
        sx={{
          position: "relative",
          borderRadius: "8px",
          border: "1px solid #D0D5DD",
          opacity: disabled ? 0.5 : 1,
          width: "100%",
          [theme.breakpoints.up("sm")]: {
            width: "auto",
          },
          "& .MuiInputBase-input": {
            paddingLeft: "14px",
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "18px",
            textAlign: "left",
            color: "#667085",
            textTransform: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: theme.transitions.create("width"),

            width: "100%",
            "&:-webkit-autofill": {
              "-webkit-box-shadow": "0 0 0 1000px white inset",
              boxShadow: "0 0 0 1000px white inset",
            },
            "&:-webkit-autofill:hover": {
              "-webkit-box-shadow": "0 0 0 1000px white inset",
              boxShadow: "0 0 0 1000px white inset",
            },
            "&:-webkit-autofill:focus": {
              "-webkit-box-shadow": "0 0 0 1000px white inset",
              boxShadow: "0 0 0 1000px white inset",
            },
            "&:-webkit-autofill:active": {
              "-webkit-box-shadow": "0 0 0 1000px white inset",
              boxShadow: "0 0 0 1000px white inset",
            },
          },
        }}
      />
      {error && (
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: "500",
            lineHeight: "14px",
            // textAlign: "center",
            color: ERROR[500],
            paddingTop: "2px",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Stack>
  );
};

export default CustomTextInput;
