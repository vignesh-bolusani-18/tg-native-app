"use client";

import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../theme/config/ThemeContext";
import {
  Box,
  FormControl,
  Typography,
  styled,
  TextField,
  Autocomplete,
  Chip,
} from "@mui/material";
import { ReactComponent as openMenuIcon } from "../../assets/Icons/chevron-down.svg";
import { ReactComponent as TagCloseIcon } from "../../assets/Icons/x.svg";
import useConfig from "../../hooks/useConfig";
import useExperiment from "../../hooks/useExperiment";
import {
  formatDate,
  reverseFormatDate,
} from "../../utils/Formating/dateFormating";
import useDashboard from "../../hooks/useDashboard";
import useExports from "../../hooks/useExports";
import useImpact from "../../hooks/useImpact";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { format, parseISO } from "date-fns";

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

    "&.Mui-focused": {
      borderColor: "#D0D5DD",
    },
    "&:hover": {
      borderColor: "#D0D5DD",
    },
    "& .MuiInputBase-input::placeholder": {
      padding: "2px 6px 2px 6px",
      fontFamily: "Inter",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "18px",
      textAlign: "left",
      color: "#667085",
      opacity: "1",
    },
  },
}));

const StyledOpenMenuIcon = styled(openMenuIcon)(({ theme }) => ({}));

const CustomAutocomplete = ({
  key,
  label,
  values: preDefinedValues = [],
  isMultiSelect,
  selectedValues,
  setSelectedValues,
  placeholder,
  showLabel,
  path,
  disabled,
  target,
  dateFormat,
  disableClearable,
  valuesDict = {},
  optionComponentDict = {},
  conflictCheck = false,
  isUserFilled = false,
  defaultValueByUser = null,
  changeLambda = null,
  dependentFieldsToUpdate = [],
  formatLabel = true,
  labelColor = null,
  labelSx = null,
  sx = null,
  maxHeight = null,
  showFormattedLabel = false,
  getValueOptions = null,
  ...props
}) => {
  const { theme } = useContext(ThemeContext);
  const [values, setValues] = useState(preDefinedValues);
  useEffect(() => {
    if (getValueOptions) {
      Promise.resolve(getValueOptions()).then((options) => {
        console.log("Options resolved", options);
        setValues(options);
      });
    }
  }, [getValueOptions]);
  useEffect(() => {
    setValues(preDefinedValues);
  }, [preDefinedValues]);

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
    configState,
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
  const [hasConflict, setHasConflict] = useState(false);
  const { updateFilterByPath, getFilterDataByPath, filterData } =
    useDashboard();
  console.log("Values in CustomAutocomplete", values);
  const mapToDisplayValue = (value) => {
    return valuesDict[value] || value; // Map value to display label using valuesDict
  };
  function convertNumberToString(value) {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toString();
    } else {
      return value;
    }
  }
  const mapToInternalValue = (label) => {
    const foundKey = Object.keys(valuesDict).find(
      (key) => valuesDict[key] === label
    );
    return foundKey || label; // Map label back to internal value using valuesDict
  };

  const formatKey = (key) => {
    const dateRegex = /\d{4}-\d{2}-\d{2}/;

    // Find any date pattern in the key
    const dateMatch = key.match(dateRegex);

    if (dateMatch) {
      const date = dateMatch[0];
      const formattedDate = format(parseISO(date), "MMM dd, yyyy");
      // Replace the date pattern with formatted date while keeping rest of the key
      return key
        .replace(date, formattedDate)
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
    }

    return key
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  const formatDisplayLabel = (value) => {
    if (!value || !formatLabel) return value;

    // Convert string to display format
    let displayValue = value.toString();

    // Handle cases like "site_ID" to "Site ID"
    displayValue = displayValue.replace(
      /_([a-zA-Z])/g,
      (match, letter) => ` ${letter.toUpperCase()}`
    );

    // Handle cases with dots like ". one two" to "One Two"
    displayValue = displayValue.replace(/^\.\s*/, "");

    // Capitalize first letter of each word
    displayValue = displayValue
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return formatKey(displayValue);
  };

  const getOptionLabel = (option) => {
    // If a custom getOptionLabel is provided, use it
    if (props.getOptionLabel) {
      return props.getOptionLabel(option);
    }

    // Get the original value from valuesDict if it exists
    const originalValue = valuesDict[option] || option.toString();

    // Format the display label
    return formatDisplayLabel(originalValue);
  };

  const getDefault = () => {
    let defaultValue;

    if (target === "tag") {
      const value = getTagFieldByPath(path);
      if (value === null) {
        const pathParts = path.split(/[.[\]]/).filter(Boolean);
        if (
          pathParts.length > 1 &&
          pathParts[pathParts.length - 2] === "fillNA"
        ) {
          defaultValue = "None";
        } else {
          defaultValue = isMultiSelect ? [] : "";
        }
      } else {
        defaultValue = value;
      }
    } else if (target === "config" && !disabled) {
      defaultValue = getConfigFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "join" && !disabled) {
      defaultValue = getJoinFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "context" && !disabled) {
      defaultValue =
        getContextConfigFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "join" && !disabled) {
      defaultValue = getJoinFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "adjust" && !disabled) {
      defaultValue =
        getAdjustDataFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "filter" && !disabled) {
      defaultValue = getFilterDataByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "enrichment" && !disabled) {
      defaultValue =
        getEnrichmentFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "exogenous" && !disabled) {
      defaultValue =
        getExogenousFeatureFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "datePair" && !disabled) {
      defaultValue = getDatePairFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "exports" && !disabled) {
      defaultValue =
        getExportPipelineFieldByPath(path) || (isMultiSelect ? [] : "");
    } else if (target === "impact" && !disabled) {
      defaultValue =
        getImpactPipelineFieldByPath(path) || (isMultiSelect ? [] : "");
    } else {
      defaultValue = isMultiSelect
        ? selectedValues
          ? selectedValues
          : []
        : "";
    }

    if (dateFormat) {
      defaultValue = reverseFormatDate(defaultValue);
    }
    console.log("Default Value", defaultValue);

    if (Array.isArray(defaultValue)) {
      if (defaultValue.length === 0 && defaultValueByUser) {
        return defaultValueByUser;
      } else {
        return defaultValue.map(mapToDisplayValue);
      }
    }

    if (defaultValue === "" && defaultValueByUser) {
      return defaultValueByUser;
    }

    return convertNumberToString(mapToDisplayValue(defaultValue));
  };

  const [selectedVal, setSelectedVal] = useState(getDefault());

  useEffect(() => {
    setSelectedVal(getDefault());
    console.log("Changed the values");
  }, [path, target, contextConfig, configState, key, filterData]);
  useEffect(() => {
    console.log("Selected Value is", selectedVal);
    setHasConflict(false);
    if (isMultiSelect) {
      selectedVal.forEach((value) => {
        if (!values.includes(value) && value !== "None" && value !== null) {
          setHasConflict(true);
          SetHasConflict(true);
        }
      });
    } else {
      if (
        !values.includes(selectedVal) &&
        selectedVal !== "None" &&
        selectedVal !== null
      ) {
        setHasConflict(true);
        SetHasConflict(true);
      }
    }
  }, [selectedVal]);

  const handleChange = (event, value) => {
    console.log("Value", value);
    const internalValue = isMultiSelect
      ? value.map(mapToInternalValue)
      : mapToInternalValue(value);
    console.log("Internal Value", internalValue);
    const formattedValue = dateFormat
      ? formatDate(internalValue)
      : internalValue;

    if (target === "tag" && !disabled) {
      const pathParts = path.split(/[.[\]]/).filter(Boolean);
      if (
        !(
          formattedValue === "None" &&
          pathParts.length > 1 &&
          pathParts[pathParts.length - 2] === "fillNA"
        )
      ) {
        updateTagFieldByPath(path, formattedValue);
      }
    } else if (target === "config" && !disabled) {
      updateConfigFieldByPath(path, formattedValue);
    } else if (target === "context" && !disabled) {
      updateContextConfigFieldByPath(path, formattedValue);
    } else if (target === "join" && !disabled) {
      updateJoinDataByPath(path, formattedValue);
    } else if (target === "adjust" && !disabled) {
      updateAdjustDataByPath(path, formattedValue);
    } else if (target === "filter" && !disabled) {
      updateFilterByPath(path, formattedValue);
    } else if (target === "enrichment" && !disabled) {
      updateEnrichmentByPath(path, formattedValue);
    } else if (target === "exogenous" && !disabled) {
      updateExogenousFeatureByPath(path, formattedValue);
    } else if (target === "datePair" && !disabled) {
      updateDatePairByPath(path, formattedValue);
    } else if (target === "exports" && !disabled) {
      updateExportPipelineFieldByPath(path, formattedValue);
    } else if (target === "impact" && !disabled) {
      updateImpactPipelineByPath(path, formattedValue);
    }
    if (dependentFieldsToUpdate.length > 0) {
      dependentFieldsToUpdate.forEach(({ path, target }) => {
        if (target === "tag" && !disabled) {
          const pathParts = path.split(/[.[\]]/).filter(Boolean);
          if (
            !(
              formattedValue === "None" &&
              pathParts.length > 1 &&
              pathParts[pathParts.length - 2] === "fillNA"
            )
          ) {
            updateTagFieldByPath(path, formattedValue);
          }
        } else if (target === "config" && !disabled) {
          updateConfigFieldByPath(path, formattedValue);
        } else if (target === "context" && !disabled) {
          updateContextConfigFieldByPath(path, formattedValue);
        } else if (target === "join" && !disabled) {
          updateJoinDataByPath(path, formattedValue);
        } else if (target === "adjust" && !disabled) {
          updateAdjustDataByPath(path, formattedValue);
        } else if (target === "filter" && !disabled) {
          updateFilterByPath(path, formattedValue);
        } else if (target === "enrichment" && !disabled) {
          updateEnrichmentByPath(path, formattedValue);
        } else if (target === "exogenous" && !disabled) {
          updateExogenousFeatureByPath(path, formattedValue);
        } else if (target === "datePair" && !disabled) {
          updateDatePairByPath(path, formattedValue);
        } else if (target === "exports" && !disabled) {
          updateExportPipelineFieldByPath(path, formattedValue);
        } else if (target === "impact" && !disabled) {
          updateImpactPipelineByPath(path, formattedValue);
        }
      });
    }
    setSelectedVal(value);

    if (!path || path === undefined) {
      setSelectedValues(formattedValue);
    }
    if (changeLambda) {
      changeLambda();
    }
  };

  const handleTagClose = (value) => {
    const newSelectedVal = isMultiSelect
      ? selectedVal.filter((item) => item !== value)
      : "";

    setSelectedVal(newSelectedVal);

    if (!path || path === undefined) {
      setSelectedValues(newSelectedVal);
    }

    handleChange(null, newSelectedVal);
  };

  // Add custom filter function
  const filterOptions = createFilterOptions({
    matchFrom: "any",
    ignoreCase: true,
    stringify: (option) => {
      // Get both the original value (ID) and its display label (name)
      const displayLabel = valuesDict[option] || "";
      const originalValue = option.toString();

      // Return both the ID and name for searching
      return `${originalValue} ${displayLabel}`;
    },
    trim: true,
  });

  const formatLabelFunction = (label) => {
    if (!label || typeof label !== "string") return label;

    // Replace underscores with spaces
    let formatted = label.replace(/_/g, " ");

    // Convert to title case
    formatted = formatted
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return formatted;
  };

  return (
    <FormControl fullWidth sx={{ opacity: disabled ? 0.3 : 1 }} key={key}>
      {showLabel && (
        <Typography
          sx={{
            color: labelColor
              ? labelColor // warning orange
              : hasConflict && conflictCheck
              ? "red"
              : "#344054",
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
            ...labelSx,
          }}
        >
          {showFormattedLabel ? formatLabelFunction(label) : label}
        </Typography>
      )}
      <Autocomplete
        disabled={disabled}
        multiple={isMultiSelect}
        options={values.map(mapToDisplayValue)}
        value={!path || path === undefined ? selectedValues : selectedVal}
        onChange={handleChange}
        disableClearable={disableClearable}
        freeSolo={false}
        popupIcon={<StyledOpenMenuIcon />}
        getOptionLabel={getOptionLabel}
        disableCloseOnSelect={isMultiSelect}
        ListboxProps={{
          sx: {
            paddingTop: 0,
            paddingBottom: 0,
            boxShadow: "none",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",

            "& .MuiMenuItem-root": {
              "&.Mui-selected": {
                backgroundColor: "red",
                border: "1px solid #D0D5DD",
              },
              "&.Mui-selected:hover": {
                backgroundColor: "#F9F5FF",
              },
              "&:not(.Mui-selected)": {
                backgroundColor: theme.palette.background.default,
                border: "1px solid #D0D5DD",
              },
              "&:not(.Mui-selected):hover": {
                backgroundColor: "#F9F5FF",
              },
            },
          },
        }}
        renderInput={(params) => (
          <BootstrapInput
            placeholder={
              !path || path === undefined
                ? isMultiSelect && selectedValues?.length
                  ? ""
                  : placeholder
                : isMultiSelect && selectedVal?.length
                ? ""
                : placeholder
            }
            size="small"
            {...params}
            InputProps={{
              ...params.InputProps,
              sx: {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isUserFilled ? "#7B68EE" : "#D0D5DD",
                  borderWidth: isUserFilled ? "2px" : "1px",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: isUserFilled ? "#7B68EE" : "#D0D5DD",
                  borderWidth: isUserFilled ? "2px" : "1px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: isUserFilled ? "#7B68EE" : "#D0D5DD",
                  borderWidth: isUserFilled ? "2px" : "1px",
                },
              },
            }}
          />
        )}
        renderTags={(tagValue, getTagProps) => (
          <Box
            sx={{
              maxHeight: maxHeight || "100%", // adjust height as needed
              overflowY: "auto",
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            {tagValue.map((option, index) => {
              const tagProps = getTagProps({ index });
              return (
                <Chip
                  {...tagProps}
                  key={option}
                  label={formatDisplayLabel(getOptionLabel(option))}
                  deleteIcon={<TagCloseIcon />}
                  onDelete={() => handleTagClose(option)}
                  sx={{
                    padding: "0px 6px 0px 08px",
                    backgroundColor: "#F2F4F7",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "#344054",
                    "& .MuiChip-deleteIcon": {
                      color: "#344054",
                    },
                  }}
                />
              );
            })}
          </Box>
        )}
        // Note: MUI's Autocomplete renderOption props signature is:
        // renderOption: (props, option, state) where state contains { selected, index, inputValue }
        // The 'index' provided is the position in the filteredOptions array, not just selected ones.
        // So yes, you can get the index of every rendered option, whether selected or not.
        renderOption={(props, option, { selected, index }) => {
          // index is the current option's index in the rendered list (including unselected)
          // console.log("Index of Option", index);
          const internalValue = values[index];
          const CustomComponent = optionComponentDict[internalValue];

          return (
            <Box
              component="li"
              {...props}
              sx={{
                backgroundColor: selected
                  ? "red"
                  : theme.palette.background.default,
                border: "1px solid #D0D5DD",
                color: "#111827",

                "&.Mui-focused": {
                  backgroundColor: "#F9F5FF",
                },
              }}
            >
              {CustomComponent ? (
                <CustomComponent />
              ) : (
                formatDisplayLabel(option)
              )}
            </Box>
          );
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            padding: isMultiSelect ? "2px" : "3px",
          },
          ...sx,
        }}
        filterOptions={filterOptions}
      />
    </FormControl>
  );
};
export default CustomAutocomplete;
