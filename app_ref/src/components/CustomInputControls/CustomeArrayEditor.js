import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../theme/config/ThemeContext";
import {
  Box,
  FormControl,
  Typography,
  styled,
  TextField,
  Chip,
} from "@mui/material";
import { ReactComponent as TagCloseIcon } from "../../assets/Icons/x.svg";
import useConfig from "../../hooks/useConfig";
import useExperiment from "../../hooks/useExperiment";
import useDashboard from "../../hooks/useDashboard";
import useImpact from "../../hooks/useImpact";

const BootstrapInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: 8,
    position: "relative",
    backgroundColor: theme.palette.background.default,
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "18px",
    textAlign: "left",
    color: "#667085",
    padding: "3px 14px",
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    alignItems: "center",
    minHeight: "40px",

    "&.Mui-focused": {
      borderColor: "#D0D5DD",
    },
    "&:hover": {
      borderColor: "#D0D5DD",
    },
    "& .MuiInputBase-input": {
      padding: "2px 6px",
      height: "24px",
      boxSizing: "border-box",
      width: "auto",
      flexGrow: 1,
      minWidth: "50px",
      
      "&::placeholder": {
        fontFamily: "Inter",
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: "18px",
        textAlign: "left",
        color: "#667085",
        opacity: "1",
      },
    },
  },
}));

const CustomArrayEditor = ({
  key,
  label,
  isMultiSelect = true,
  selectedValues,
  setSelectedValues,
  placeholder,
  showLabel,
  path,
  disabled,
  target,
  disableClearable,
  conflictCheck = false,
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
    SetHasConflict,
  } = useConfig();
  const {
    updateTagFieldByPath,
    getTagFieldByPath,
    getJoinFieldByPath,
    updateJoinDataByPath,
  } = useExperiment();
  const { getImpactPipelineFieldByPath, updateImpactPipelineByPath } =
    useImpact();
  const [hasConflict, setHasConflict] = useState(false);
  const { updateFilterByPath, getFilterDataByPath } = useDashboard();
  const [inputValue, setInputValue] = useState("");

  const getDefault = () => {
    let defaultValue;

    if (target === "tag") {
      defaultValue = getTagFieldByPath(path);
    } else if (target === "config" && !disabled) {
      defaultValue = getConfigFieldByPath(path);
    } else if (target === "context" && !disabled) {
      defaultValue = getContextConfigFieldByPath(path);
    } else if (target === "join" && !disabled) {
      defaultValue = getJoinFieldByPath(path);
    } else if (target === "adjust" && !disabled) {
      defaultValue = getAdjustDataFieldByPath(path);
    } else if (target === "filter" && !disabled) {
      defaultValue = getFilterDataByPath(path);
    } else if (target === "enrichment" && !disabled) {
      defaultValue = getEnrichmentFieldByPath(path);
    } else if (target === "exogenous" && !disabled) {
      defaultValue = getExogenousFeatureFieldByPath(path);
    } else if (target === "datePair" && !disabled) {
      defaultValue = getDatePairFieldByPath(path);
    } else if (target === "impact" && !disabled) {
      defaultValue = getImpactPipelineFieldByPath(path);
    }

    return defaultValue || [];
  };

  const [selectedVal, setSelectedVal] = useState(getDefault());

  useEffect(() => {
    setSelectedVal(getDefault());
  }, [path, target, contextConfig, key]);

  const updateValue = (newValue) => {
    if (target === "tag" && !disabled) {
      updateTagFieldByPath(path, newValue);
    } else if (target === "config" && !disabled) {
      updateConfigFieldByPath(path, newValue);
    } else if (target === "context" && !disabled) {
      updateContextConfigFieldByPath(path, newValue);
    } else if (target === "join" && !disabled) {
      updateJoinDataByPath(path, newValue);
    } else if (target === "adjust" && !disabled) {
      updateAdjustDataByPath(path, newValue);
    } else if (target === "filter" && !disabled) {
      updateFilterByPath(path, newValue);
    } else if (target === "enrichment" && !disabled) {
      updateEnrichmentByPath(path, newValue);
    } else if (target === "exogenous" && !disabled) {
      updateExogenousFeatureByPath(path, newValue);
    } else if (target === "datePair" && !disabled) {
      updateDatePairByPath(path, newValue);
    } else if (target === "impact" && !disabled) {
      updateImpactPipelineByPath(path, newValue);
    }
 if (dependentFieldsToUpdate.length > 0) {
   dependentFieldsToUpdate.forEach(({ path, target }) => {
     if (target === "tag" && !disabled) {
       updateTagFieldByPath(path, newValue);
     } else if (target === "config" && !disabled) {
       updateConfigFieldByPath(path, newValue);
     } else if (target === "context" && !disabled) {
       updateContextConfigFieldByPath(path, newValue);
     } else if (target === "join" && !disabled) {
       updateJoinDataByPath(path, newValue);
     } else if (target === "adjust" && !disabled) {
       updateAdjustDataByPath(path, newValue);
     } else if (target === "filter" && !disabled) {
       updateFilterByPath(path, newValue);
     } else if (target === "enrichment" && !disabled) {
       updateEnrichmentByPath(path, newValue);
     } else if (target === "exogenous" && !disabled) {
       updateExogenousFeatureByPath(path, newValue);
     } else if (target === "datePair" && !disabled) {
       updateDatePairByPath(path, newValue);
     } else if (target === "impact" && !disabled) {
       updateImpactPipelineByPath(path, newValue);
     }
   });
 }
    setSelectedVal(newValue);

    if (!path || path === undefined) {
      setSelectedValues(newValue);
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      const newValue = inputValue.trim();
      const currentValues = !path || path === undefined ? selectedValues : selectedVal;
      
      if (!currentValues.includes(newValue)) {
        const updatedValues = [...currentValues, newValue];
        updateValue(updatedValues);
      }
      
      setInputValue('');
    }
  };

  const handleTagClose = (valueToRemove) => {
    const currentValues = !path || path === undefined ? selectedValues : selectedVal;
    const updatedValues = currentValues.filter(value => value !== valueToRemove);
    updateValue(updatedValues);
  };

  const renderInput = () => {
    const currentValues = !path || path === undefined ? selectedValues : selectedVal;
    
    return (
      <BootstrapInput
        disabled={disabled}
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={currentValues.length === 0 ? placeholder : ''}
        size="small"
        InputProps={{
          startAdornment: currentValues.map((value) => (
            <Chip
              key={value}
              label={value}
              deleteIcon={<TagCloseIcon />}
              onDelete={() => handleTagClose(value)}
              sx={{
                height: "30px",
                padding: "0px 6px 0px 8px",
                backgroundColor: "#F2F4F7",
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
                color: "#344054",
                "& .MuiChip-deleteIcon": {
                  color: "#344054",
                  width: "16px",
                  height: "16px",
                },
                margin: "2px",
              }}
            />
          )),
        }}
      />
    );
  };

  return (
    <FormControl fullWidth sx={{ opacity: disabled ? 0.3 : 1 }} key={key}>
      {showLabel && (
        <Typography
          sx={{
            color: hasConflict && conflictCheck ? "red" : "#344054",
            fontFamily: "Inter",
            fontWeight: "500",
            fontSize: "14px",
            lineHeight: "20px",
            marginBottom: "6px",
            textTransform: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {label}
        </Typography>
      )}
      {renderInput()}
    </FormControl>
  );
};

export default CustomArrayEditor;