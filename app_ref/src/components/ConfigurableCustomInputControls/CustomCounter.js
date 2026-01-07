import React, { useState, useEffect } from "react";
import { IconButton, Stack, Typography, TextField } from "@mui/material";
import { ReactComponent as Plus } from "../../assets/Icons/plus-icon.svg";
import { ReactComponent as Minus } from "../../assets/Icons/minus_icon.svg";
import useExports from "./../../hooks/useExports";
import useImpact from "../../hooks/useImpact";
import useModule from "../../hooks/useModule";

const CustomCounter = ({
  label,
  maxRange,
  minRange,
  showLabel,
  path,
  target,
  key,
  disabled,
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
  const {
    getTagFieldByPath,
    updateTagFieldByPath,
    getJoinFieldByPath,
    updateJoinDataByPath,
  } = useModule();
  const { getExportPipelineFieldByPath, updateExportPipelineFieldByPath } =
    useExports();
  const { getImpactPipelineFieldByPath, updateImpactPipelineByPath } =
    useImpact();
  const getDefault = () => {
    let defaultValue;

    if (target === "tag") {
      const value = getTagFieldByPath(path);
      defaultValue = value !== null ? value : 0;
    } else if (target === "config" && !disabled) {
      defaultValue = getConfigFieldByPath(path) || 0;
    } else if (target === "context" && !disabled) {
      defaultValue = getContextConfigFieldByPath(path) || 0;
    } else if (target === "join" && !disabled) {
      defaultValue = getJoinFieldByPath(path) || 0;
    } else if (target === "adjust" && !disabled) {
      defaultValue = getAdjustDataFieldByPath(path) || 0;
    } else if (target === "enrichment" && !disabled) {
      defaultValue = getEnrichmentFieldByPath(path) || 0;
    } else if (target === "exogenous" && !disabled) {
      defaultValue = getExogenousFeatureFieldByPath(path) || 0;
    } else if (target === "datePair" && !disabled) {
      defaultValue = getDatePairFieldByPath(path) || 0;
    } else if (target === "exports" && !disabled) {
      defaultValue = getExportPipelineFieldByPath(path) || 0;
    } else if (target === "impact" && !disabled) {
      defaultValue = getImpactPipelineFieldByPath(path) || 0;
    } else {
      defaultValue = path ? getConfigFieldByPath(path) || 0 : 0;
    }

    return defaultValue;
  };
  const [defaultValue, setDefaultValue] = useState(getDefault());
  useEffect(() => {
    setDefaultValue(getDefault());
  }, [target, path]);

  const [val, setVal] = useState(defaultValue);
  const [inputValue, setInputValue] = useState(defaultValue);

  // Function to calculate precision
  const getPrecision = (num) => {
    if (!isNaN(num) && num.toString().includes(".")) {
      return num.toString().split(".")[1].length;
    }
    return 0;
  };
  const [precision, setPrecision] = useState(getPrecision(defaultValue)); // Initialize precision

  useEffect(() => {
    setInputValue(val);
  }, [val]);

  // Handle increment
  const handleIncrement = () => {
    const incrementValue = Math.pow(10, -precision);
    const newValue = parseFloat((val + incrementValue).toFixed(precision));
    if (newValue <= maxRange) {
      if (path) {
        if (target === "tag") {
          updateTagFieldByPath(path, newValue);
        } else if (target === "config") {
          updateConfigFieldByPath(path, newValue);
        } else if (target === "context") {
          updateContextConfigFieldByPath(path, newValue);
        } else if (target === "join") {
          updateJoinDataByPath(path, newValue);
        } else if (target === "adjust" && !disabled) {
          updateAdjustDataByPath(path, newValue);
        } else if (target === "enrichment" && !disabled) {
          updateEnrichmentByPath(path, newValue);
        } else if (target === "exogenous" && !disabled) {
          updateExogenousFeatureByPath(path, newValue);
        } else if (target === "datePair" && !disabled) {
          updateDatePairByPath(path, newValue);
        } else if (target === "exports" && !disabled) {
          updateExportPipelineFieldByPath(path, newValue);
        } else if (target === "impact" && !disabled) {
          updateImpactPipelineByPath(path, newValue);
        } else {
          updateConfigFieldByPath(path, newValue);
        }
      }
      if (dependentFieldsToUpdate.length > 0) {
        dependentFieldsToUpdate.forEach(({ path, target }) => {
          if (target === "tag") {
            updateTagFieldByPath(path, newValue);
          } else if (target === "config") {
            updateConfigFieldByPath(path, newValue);
          } else if (target === "context") {
            updateContextConfigFieldByPath(path, newValue);
          } else if (target === "join") {
            updateJoinDataByPath(path, newValue);
          } else if (target === "adjust" && !disabled) {
            updateAdjustDataByPath(path, newValue);
          } else if (target === "enrichment" && !disabled) {
            updateEnrichmentByPath(path, newValue);
          } else if (target === "exogenous" && !disabled) {
            updateExogenousFeatureByPath(path, newValue);
          } else if (target === "datePair" && !disabled) {
            updateDatePairByPath(path, newValue);
          } else if (target === "exports" && !disabled) {
            updateExportPipelineFieldByPath(path, newValue);
          } else if (target === "impact" && !disabled) {
            updateImpactPipelineByPath(path, newValue);
          } else {
            updateConfigFieldByPath(path, newValue);
          }
        });
      }

      setVal(newValue);
    }
  };

  // Handle decrement
  const handleDecrement = () => {
    const decrementValue = Math.pow(10, -precision);
    const newValue = parseFloat((val - decrementValue).toFixed(precision));
    console.log(
      "handleDecrement Called",
      minRange,
      newValue,
      newValue >= minRange
    );
    if (newValue >= minRange) {
      if (path) {
        if (target === "tag") {
          console.log("Target tag");
          updateTagFieldByPath(path, newValue);
        } else if (target === "config") {
          updateConfigFieldByPath(path, newValue);
        } else if (target === "context") {
          console.log("Target", target);
          updateContextConfigFieldByPath(path, newValue);
        } else if (target === "join") {
          updateJoinDataByPath(path, newValue);
        } else if (target === "adjust" && !disabled) {
          updateAdjustDataByPath(path, newValue);
        } else if (target === "enrichment" && !disabled) {
          updateEnrichmentByPath(path, newValue);
        } else if (target === "exogenous" && !disabled) {
          updateExogenousFeatureByPath(path, newValue);
        } else if (target === "datePair" && !disabled) {
          updateDatePairByPath(path, newValue);
        } else if (target === "exports" && !disabled) {
          updateExportPipelineFieldByPath(path, newValue);
        } else if (target === "impact" && !disabled) {
          updateImpactPipelineByPath(path, newValue);
        } else {
          updateConfigFieldByPath(path, newValue);
        }
      }
      if (dependentFieldsToUpdate.length > 0) {
        dependentFieldsToUpdate.forEach(({ path, target }) => {
          if (target === "tag") {
            updateTagFieldByPath(path, newValue);
          } else if (target === "config") {
            updateConfigFieldByPath(path, newValue);
          } else if (target === "context") {
            updateContextConfigFieldByPath(path, newValue);
          } else if (target === "join") {
            updateJoinDataByPath(path, newValue);
          } else if (target === "adjust" && !disabled) {
            updateAdjustDataByPath(path, newValue);
          } else if (target === "enrichment" && !disabled) {
            updateEnrichmentByPath(path, newValue);
          } else if (target === "exogenous" && !disabled) {
            updateExogenousFeatureByPath(path, newValue);
          } else if (target === "datePair" && !disabled) {
            updateDatePairByPath(path, newValue);
          } else if (target === "exports" && !disabled) {
            updateExportPipelineFieldByPath(path, newValue);
          } else if (target === "impact" && !disabled) {
            updateImpactPipelineByPath(path, newValue);
          } else {
            updateConfigFieldByPath(path, newValue);
          }
        });
      }
      setVal(newValue);
    }
  };
  // Handle input change
  const handleInputChange = (event) => {
    const { value } = event.target;

    // Allow negative numbers, decimals, and positive numbers
    if (/^-?\d*\.?\d*$/.test(value)) {
      setInputValue(value);
      let newValue = parseFloat(value);

      if (!isNaN(newValue)) {
        const newPrecision = getPrecision(newValue); // Update precision based on input value
        setPrecision(newPrecision);

        // Ensure the value is within range (minRange, maxRange)
        if (newValue >= minRange && newValue <= maxRange) {
          newValue = parseFloat(newValue.toFixed(newPrecision));

          if (path) {
            if (target === "tag") {
              updateTagFieldByPath(path, newValue);
            } else if (target === "config") {
              updateConfigFieldByPath(path, newValue);
            } else if (target === "context") {
              updateContextConfigFieldByPath(path, newValue);
            } else if (target === "join") {
              updateJoinDataByPath(path, newValue);
            } else if (target === "adjust" && !disabled) {
              updateAdjustDataByPath(path, newValue);
            } else if (target === "enrichment" && !disabled) {
              updateEnrichmentByPath(path, newValue);
            } else if (target === "exogenous" && !disabled) {
              updateExogenousFeatureByPath(path, newValue);
            } else if (target === "datePair" && !disabled) {
              updateDatePairByPath(path, newValue);
            } else if (target === "exports" && !disabled) {
              updateExportPipelineFieldByPath(path, newValue);
            } else if (target === "impact" && !disabled) {
              updateImpactPipelineByPath(path, newValue);
            } else {
              updateConfigFieldByPath(path, newValue);
            }
          }
          if (dependentFieldsToUpdate.length > 0) {
            dependentFieldsToUpdate.forEach(({ path, target }) => {
              if (target === "tag") {
                updateTagFieldByPath(path, newValue);
              } else if (target === "config") {
                updateConfigFieldByPath(path, newValue);
              } else if (target === "context") {
                updateContextConfigFieldByPath(path, newValue);
              } else if (target === "join") {
                updateJoinDataByPath(path, newValue);
              } else if (target === "adjust" && !disabled) {
                updateAdjustDataByPath(path, newValue);
              } else if (target === "enrichment" && !disabled) {
                updateEnrichmentByPath(path, newValue);
              } else if (target === "exogenous" && !disabled) {
                updateExogenousFeatureByPath(path, newValue);
              } else if (target === "datePair" && !disabled) {
                updateDatePairByPath(path, newValue);
              } else if (target === "exports" && !disabled) {
                updateExportPipelineFieldByPath(path, newValue);
              } else if (target === "impact" && !disabled) {
                updateImpactPipelineByPath(path, newValue);
              } else {
                updateConfigFieldByPath(path, newValue);
              }
            });
          }
          setVal(newValue);
        }
      }
    }
  };

  return (
    <Stack direction="column">
      {showLabel && (
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "20px",
            textAlign: "left",
            color: "#344054",
            marginBottom: "6px",
            textTransform: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {label}
        </Typography>
      )}
      <Stack
        direction={"row"}
        justifyContent={"space-between"}
        sx={{
          padding: "7.5px 14px",
          border: "1px solid #D0D5DD",
          borderRadius: "8px",
          "&:hover": {
            border: disabled ? "1px solid #D0D5DD" : "1px solid black",
          },
        }}
        alignItems={"center"}
      >
        <TextField
          // type="number"
          disabled={disabled}
          value={inputValue}
          onChange={handleInputChange}
          inputProps={{
            min: minRange,
            max: maxRange,
            step: Math.pow(10, -precision),
            style: {
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "18px",
              textAlign: "left",
              color: "#667085",
              padding: 0,
              WebkitAppearance: "none",
              MozAppearance: "textfield",
              appearance: "none",
            },
          }}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            backgroundColor: "transparent",
          }}
        />
        <Stack direction={"row"} spacing={1}>
          <IconButton
            size="small"
            onClick={handleDecrement}
            disabled={disabled}
          >
            <Minus />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleIncrement}
            disabled={disabled}
          >
            <Plus />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CustomCounter;
