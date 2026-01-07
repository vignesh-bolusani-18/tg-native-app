import React, { useEffect, useState } from "react";
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import useExports from "../../hooks/useExports";
import useImpact from "../../hooks/useImpact";
import useModule from "../../hooks/useModule";

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
  dependentFieldsToUpdate = [],
}) => {
  const {
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
  } = useModule();
  const { getExportPipelineFieldByPath, updateExportPipelineFieldByPath } =
    useExports();
  const { getImpactPipelineFieldByPath, updateImpactPipelineByPath } =
    useImpact();
  const {
    getTagFieldByPath,
    updateTagFieldByPath,
    getJoinFieldByPath,
    updateJoinDataByPath,
  } = useModule();

  const getDefault = () => {
    let defaultValue;

    if (target === "tag") {
      const value = getTagFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "config" && !disabled) {
      const value = getConfigFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "context" && !disabled) {
      const value = getContextConfigFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "join" && !disabled) {
      const value = getJoinFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "adjust" && !disabled) {
      const value = getAdjustDataFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "enrichment" && !disabled) {
      const value = getEnrichmentFieldByPath(path)(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "exogenous" && !disabled) {
      const value = getExogenousFeatureFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "datePair" && !disabled) {
      const value = getDatePairFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "exports" && !disabled) {
      const value = getExportPipelineFieldByPath(path);
      defaultValue = value !== null ? value : true;
    } else if (target === "impact" && !disabled) {
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
  }, [path, target, key]);

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
        key={key}
        row
        aria-labelledby="custom-checks"
        name="row-radio-buttons-group"
        value={path ?(val ? "True" : "False" ): (selectedValues ? "True" : "False" )  }
        onChange={handleChange}
      >
        <FormControlLabel
          value="True"
          control={<Radio />}
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
          control={<Radio />}
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
