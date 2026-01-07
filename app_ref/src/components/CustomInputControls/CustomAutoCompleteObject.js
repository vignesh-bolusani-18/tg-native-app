"use client"

import { useContext } from "react"
import { ThemeContext } from "../../theme/config/ThemeContext"
import { Box, FormControl, Typography, styled, TextField, Autocomplete, Chip } from "@mui/material"
import { ReactComponent as openMenuIcon } from "../../assets/Icons/chevron-down.svg"
import { ReactComponent as TagCloseIcon } from "../../assets/Icons/x.svg"
import { createFilterOptions } from "@mui/material/Autocomplete"
import React from "react"

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
}))

const StyledOpenMenuIcon = styled(openMenuIcon)(({ theme }) => ({}))

const CustomAutoCompleteObject = ({
  showLabel = false,
  label = "",
  placeholder = "",
  values = [],
  selectedValues = {},
  setSelectedValues = () => {},
  valuesDict = {},
  objectDict = {},
  optionComponentDict = {},
  isMultiSelect = false,
  target = "",
  path = "",
  disabled = false,
  disableClearable = false,
  excludedOptions = [],
}) => {
  const { theme } = useContext(ThemeContext);

  console.log("excludedOptions: ", excludedOptions);
  console.log("values: ", values);

  const filteredValues = React.useMemo(() => {
    return values.filter(value => !excludedOptions.includes(value));
  }, [values, excludedOptions]);

  console.log("filteredValues: ", filteredValues);
  const handleChange = (event, newValue) => {
    const selectedIds = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];
    const selectedObjects = selectedIds.map(id => objectDict[id]);
    
    setSelectedValues({
      ...selectedValues,
      [target]: selectedIds,
      [`${target}Object`]: selectedObjects
    });
  };

  const handleTagClose = (value) => {
    const newSelectedIds = selectedValues[target].filter(id => id !== value);
    const newSelectedObjects = newSelectedIds.map(id => objectDict[id]);
    
    setSelectedValues({
      ...selectedValues,
      [target]: newSelectedIds,
      [`${target}Object`]: newSelectedObjects
    });
  };

  const filterOptions = createFilterOptions({
    matchFrom: "any",
    ignoreCase: true,
    stringify: (option) => {
      const displayLabel = valuesDict[option]?.experimentName || "";
      const originalValue = option.toString();
      return `${originalValue} ${displayLabel}`;
    },
    trim: true,
  });

  return (
    <FormControl fullWidth sx={{ opacity: disabled ? 0.3 : 1 }}>
      {showLabel && (
        <Typography
          sx={{
            color: "#344054",
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
      <Autocomplete
        multiple={isMultiSelect}
        options={filteredValues}
        value={selectedValues[target] ? selectedValues[target][0] || null : null}
        onChange={handleChange}
        disabled={disabled}
        disableClearable={disableClearable}
        freeSolo={false}
        filterOptions={filterOptions}
        popupIcon={<StyledOpenMenuIcon />}
        getOptionLabel={(option) => valuesDict[option]?.experimentName || ""}
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
        renderOption={(props, option) => {
          const CustomComponent = optionComponentDict[option];
          return (
            <Box
              component="li"
              {...props}
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 400,
                color: "#344054",
                padding: "10px 14px",
                borderBottom: "1px solid #EAECF0",
                "&:hover": {
                  backgroundColor: "#F9F5FF",
                },
                "&.Mui-selected": {
                  backgroundColor: "#F9F5FF",
                },
              }}
            >
              {CustomComponent ? <CustomComponent /> : valuesDict[option]?.experimentName || ""}
            </Box>
          );
        }}
        renderInput={(params) => (
          <BootstrapInput
            placeholder={placeholder}
            size="small"
            {...params}
            InputProps={{
              ...params.InputProps,
              sx: {
                "&.Mui-focused": {
                  borderColor: "#D0D5DD",
                },
                "&:hover": {
                  borderColor: "#D0D5DD",
                },
              },
            }}
          />
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const tagProps = getTagProps({ index });
            return (
              <Chip
                {...tagProps}
                key={option}
                label={valuesDict[option]?.experimentName || ""}
                deleteIcon={<TagCloseIcon />}
                onDelete={() => handleTagClose(option)}
                sx={{
                  padding: "0px 6px 0px 8px",
                  backgroundColor: "#F2F4F7",
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "16px",
                  marginY: "99px",
                  color: "#344054",
                  "& .MuiChip-deleteIcon": {
                    color: "#344054",
                  },
                }}
              />
            )
          })
        }
        sx={{
          "& .MuiAutocomplete-endAdornment": {
            right: "14px !important",
          },
          "& .MuiAutocomplete-popupIndicator": {
            color: "#667085",
          },
          "& .MuiAutocomplete-paper": {
            marginTop: "4px",
            backgroundColor: theme.palette.background.default,
            boxShadow: "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
            border: "1px solid #D0D5DD",
            borderRadius: "8px",
          },
        }}
      />
    </FormControl>
  );
};

export default CustomAutoCompleteObject; 