import React, { useEffect, useState } from "react";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import useConfig from "../../hooks/useConfig";
import useExperiment from "../../hooks/useExperiment";
import useExports from "../../hooks/useExports";
import useImpact from "../../hooks/useImpact";

const CustomCheck = ({
  question,
  direction,
  path,
  alignCenter,
  target,
  disabled,
  selectedValues,
  setSelectedValues,
  key,
  refreshKey,
  dependentFieldsToUpdate = [],
  exclusiveWith = [],
  exclusiveUpdate = false,
}) => {
  const {
    configState,
    getConfigFieldByPath,
    updateConfigFieldByPath,
    getContextConfigFieldByPath,
    updateContextConfigFieldByPath,
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
    getTagFieldByPath,
    updateTagFieldByPath,
    getJoinFieldByPath,
    updateJoinDataByPath,
  } = useExperiment();

  const getDefault = () => {
    let defaultValue;

    if (target === "tag") {
      const value = getTagFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "config") {
      const value = getConfigFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "context") {
      const value = getContextConfigFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "join") {
      const value = getJoinFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "adjust") {
      const value = getAdjustDataFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "enrichment") {
      const value = getEnrichmentFieldByPath(path)(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "exogenous") {
      const value = getExogenousFeatureFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "datePair") {
      const value = getDatePairFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "exports") {
      const value = getExportPipelineFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "impact") {
      const value = getImpactPipelineFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else {
      // const value = getConfigFieldByPath(path);
      defaultValue = true;
    }

    return defaultValue;
  };

  const [val, setVal] = useState(path ? getDefault() : true);
  useEffect(() => {
    setVal(getDefault());
  }, [path, target, configState]);

  const updateByTarget = (path, target, value) => {
    if (target === "tag") updateTagFieldByPath(path, value);
    else if (target === "config") updateConfigFieldByPath(path, value);
    else if (target === "context") updateContextConfigFieldByPath(path, value);
    else if (target === "join") updateJoinDataByPath(path, value);
    else if (target === "adjust") updateAdjustDataByPath(path, value);
    else if (target === "enrichment") updateEnrichmentByPath(path, value);
    else if (target === "exogenous") updateExogenousFeatureByPath(path, value);
    else if (target === "datePair") updateDatePairByPath(path, value);
    else if (target === "exports") updateExportPipelineFieldByPath(path, value);
    else if (target === "impact") updateImpactPipelineByPath(path, value);
    else updateConfigFieldByPath(path, value);
  };

  const handleChange = (event) => {
    setVal(event.target.value === "True");
    if (path) {
      if (target === "tag" && !disabled) {
        updateTagFieldByPath(path, event.target.value === "True");
      } else if (target === "config" && !disabled) {
        updateConfigFieldByPath(path, event.target.value === "True");
      } else if (target === "context" && !disabled) {
        updateContextConfigFieldByPath(path, event.target.value === "True");
      } else if (target === "join" && !disabled) {
        updateJoinDataByPath(path, event.target.value === "True");
      } else if (target === "adjust" && !disabled) {
        updateAdjustDataByPath(path, event.target.value === "True");
      } else if (target === "enrichment" && !disabled) {
        updateEnrichmentByPath(path, event.target.value === "True");
      } else if (target === "exogenous" && !disabled) {
        updateExogenousFeatureByPath(path, event.target.value === "True");
      } else if (target === "datePair" && !disabled) {
        updateDatePairByPath(path, event.target.value === "True");
      } else if (target === "exports" && !disabled) {
        updateExportPipelineFieldByPath(path, event.target.value === "True");
      } else if (target === "impact" && !disabled) {
        updateImpactPipelineByPath(path, event.target.value === "True");
      } else {
        updateConfigFieldByPath(path, event.target.value === "True");
      }
    }
    if (dependentFieldsToUpdate.length > 0) {
      dependentFieldsToUpdate.forEach(({ path, target }) => {
        if (target === "tag" && !disabled) {
          updateTagFieldByPath(path, event.target.value === "True");
        } else if (target === "config" && !disabled) {
          updateConfigFieldByPath(path, event.target.value === "True");
        } else if (target === "context" && !disabled) {
          updateContextConfigFieldByPath(path, event.target.value === "True");
        } else if (target === "join" && !disabled) {
          updateJoinDataByPath(path, event.target.value === "True");
        } else if (target === "adjust" && !disabled) {
          updateAdjustDataByPath(path, event.target.value === "True");
        } else if (target === "enrichment" && !disabled) {
          updateEnrichmentByPath(path, event.target.value === "True");
        } else if (target === "exogenous" && !disabled) {
          updateExogenousFeatureByPath(path, event.target.value === "True");
        } else if (target === "datePair" && !disabled) {
          updateDatePairByPath(path, event.target.value === "True");
        } else if (target === "exports" && !disabled) {
          updateExportPipelineFieldByPath(path, event.target.value === "True");
        } else if (target === "impact" && !disabled) {
          updateImpactPipelineByPath(path, event.target.value === "True");
        } else {
          updateConfigFieldByPath(path, event.target.value === "True");
        }
      });
    }
    const checked = event.target.value === "True";
    if (exclusiveUpdate && checked && exclusiveWith?.length && !disabled) {
      exclusiveWith.forEach((item) => {
        if (item.path !== path && item.value === true) {
          updateByTarget(item.path, item.target, false);
        }
      });
    }

    if (!path || path === undefined) {
      setSelectedValues(event.target.value === "True");
    }
  };

  const isRow = direction === "row";

  return (
    <Stack
      direction={direction}
      spacing={isRow ? 2 : 1}
      alignItems={isRow || alignCenter ? "center" : "flex-start"}
      padding={"2px"}
      sx={{
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          textAlign: "left",
          color: "#475467",
          textTransform: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {question}
      </Typography>
      <RadioGroup
        key={refreshKey}
        row
        aria-labelledby="custom-checks"
        name="row-radio-buttons-group"
        value={
          path ? (val ? "True" : "False") : selectedValues ? "True" : "False"
        }
        onChange={handleChange}
      >
        <FormControlLabel
          value="True"
          control={<Radio disabled={disabled} />}
          label={
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "24px",
                color: "#344054",
              }}
            >
              True
            </Typography>
          }
        />
        <FormControlLabel
          value="False"
          control={<Radio disabled={disabled} />}
          label={
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "24px",
                color: "#344054",
              }}
            >
              False
            </Typography>
          }
        />
      </RadioGroup>
    </Stack>
  );
};

export default CustomCheck;
