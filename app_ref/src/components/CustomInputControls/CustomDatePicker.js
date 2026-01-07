import React, { useState } from "react";
import { Stack, Typography } from "@mui/material";
// import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import useConfig from "../../hooks/useConfig";
import { useEffect } from "react";
import useExperiment from "../../hooks/useExperiment";
import useExports from "../../hooks/useExports";
import useImpact from "../../hooks/useImpact";

const CustomDatePicker = ({
  label,
  showLabel,
  placeholder,
  path,
  selectedValue,
  setSelectedValue,
  target,
  disabled,
  isRequired = false,
  isUserFilled = false,
  key,
  dependentFieldsToUpdate = [],
  labelSx = {},
  sx = {},
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
  } = useConfig();
  const {
    getTagFieldByPath,
    updateTagFieldByPath,
    getJoinFieldByPath,
    updateJoinDataByPath,
  } = useExperiment();
  const { getImpactPipelineFieldByPath, updateImpactPipelineByPath } =
    useImpact();
  const { getExportPipelineFieldByPath, updateExportPipelineFieldByPath } =
    useExports();
  const getDefault = () => {
    let defaultValue;

    if (target === "tag") {
      const value = getTagFieldByPath(path);
      defaultValue = value !== null ? value : null;
    } else if (target === "config" && !disabled) {
      defaultValue = getConfigFieldByPath(path) || null;
    } else if (target === "context" && !disabled) {
      defaultValue = getContextConfigFieldByPath(path) || null;
      console.log("Found Default value", defaultValue);
    } else if (target === "join" && !disabled) {
      defaultValue = getJoinFieldByPath(path) || null;
    } else if (target === "adjust" && !disabled) {
      defaultValue = getAdjustDataFieldByPath(path) || null;
    } else if (target === "enrichment" && !disabled) {
      defaultValue = getEnrichmentFieldByPath(path) || null;
    } else if (target === "exogenous" && !disabled) {
      defaultValue = getExogenousFeatureFieldByPath(path) || null;
    } else if (target === "datePair" && !disabled) {
      defaultValue = getDatePairFieldByPath(path) || null;
    } else if (target === "exports" && !disabled) {
      defaultValue = getExportPipelineFieldByPath(path) || null;
    } else if (target === "impact" && !disabled) {
      defaultValue = getImpactPipelineFieldByPath(path) || null;
    } else {
      defaultValue = path ? getConfigFieldByPath(path) || null : null;
    }

    return defaultValue;
  };

  const [defaultValue, setDefaultValue] = useState(path ? getDefault() : null);

  const [selectedDate, setSelectedDate] = useState(
    path && defaultValue ? dayjs(defaultValue) : null
  );
  useEffect(() => {
    if (!path) {
      setSelectedDate(selectedValue ? dayjs(selectedValue) : null);
    }
  }, [selectedValue]);
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (path) {
      const year = date.$y.toString();
      const month = (date.$M + 1).toString().padStart(2, "0"); // Months are 0-indexed
      const day = date.$D.toString().padStart(2, "0");

      const dateString = `${year}-${month}-${day}`;
      console.log("customdate", dateString + " " + path + " " + target);

      if (target === "tag") {
        updateTagFieldByPath(path, dateString);
      } else if (target === "config") {
        updateConfigFieldByPath(path, dateString);
      } else if (target === "context") {
        updateContextConfigFieldByPath(path, dateString);
      } else if (target === "join") {
        updateJoinDataByPath(path, dateString);
      } else if (target === "adjust" && !disabled) {
        console.log("Updating...");
        updateAdjustDataByPath(path, dateString);
      } else if (target === "enrichment" && !disabled) {
        updateEnrichmentByPath(path, dateString);
      } else if (target === "exogenous" && !disabled) {
        updateExogenousFeatureByPath(path, dateString);
      } else if (target === "datePair" && !disabled) {
        updateDatePairByPath(path, dateString);
      } else if (target === "exports" && !disabled) {
        updateExportPipelineFieldByPath(path, dateString);
      } else if (target === "impact" && !disabled) {
        updateImpactPipelineByPath(path, dateString);
      } else {
        updateConfigFieldByPath(path, dateString);
      }
    } else {
      const year = date.$y.toString();
      const month = (date.$M + 1).toString().padStart(2, "0"); // Months are 0-indexed
      const day = date.$D.toString().padStart(2, "0");

      const dateString = `${year}-${month}-${day}`;
      console.log("date", dateString);
      setSelectedValue(dateString);
    }
     if (dependentFieldsToUpdate.length > 0) {
       dependentFieldsToUpdate.forEach(({ path, target }) => {
         const year = date.$y.toString();
         const month = (date.$M + 1).toString().padStart(2, "0"); // Months are 0-indexed
         const day = date.$D.toString().padStart(2, "0");

         const dateString = `${year}-${month}-${day}`;
         console.log("customdate", dateString + " " + path + " " + target);

         if (target === "tag") {
           updateTagFieldByPath(path, dateString);
         } else if (target === "config") {
           updateConfigFieldByPath(path, dateString);
         } else if (target === "context") {
           updateContextConfigFieldByPath(path, dateString);
         } else if (target === "join") {
           updateJoinDataByPath(path, dateString);
         } else if (target === "adjust" && !disabled) {
           console.log("Updating...");
           updateAdjustDataByPath(path, dateString);
         } else if (target === "enrichment" && !disabled) {
           updateEnrichmentByPath(path, dateString);
         } else if (target === "exogenous" && !disabled) {
           updateExogenousFeatureByPath(path, dateString);
         } else if (target === "datePair" && !disabled) {
           updateDatePairByPath(path, dateString);
         } else if (target === "exports" && !disabled) {
           updateExportPipelineFieldByPath(path, dateString);
         } else if (target === "impact" && !disabled) {
           updateImpactPipelineByPath(path, dateString);
         } else {
           updateConfigFieldByPath(path, dateString);
         }
       });
     }
    // onDateChange(date);
  };
  return (
    <Stack direction="column" fullWidth sx={{ width: "100%" }}>
      {showLabel ? (
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
            ...labelSx,
          }}
        >
          {label}
        </Typography>
      ) : null}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* <DemoContainer components={["DatePicker"]}> */}
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          isRequired={isRequired}
          // readOnly
          format="MMMM D, YYYY"
          // emptyLabel="Select Date"
          sx={{ width: "100%" }}
          slotProps={{
            textField: {
              fullWidth: true,
              placeholder: placeholder,
              error: isRequired ,
              helperText:
                isRequired 
                  ? "Required"
                  : "",
              sx: {
                width: "100%",
                "& .MuiInputBase-root": {
                  borderRadius: 8,
                  // borderColor: "#D0D5DD",
                  position: "relative",
                  backgroundColor: "#FFF",
                  // border: "1px solid #D0D5DD",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "18px",
                  textAlign: "left",
                  color: "#667085",
                  padding: "10x 14px",
                  // transition: theme.transitions.create(["border-color", "box-shadow"]),

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
                // border: "1px solid #D0D5DD",
                // borderRadius: "8px",
                padding: "0px",
                "& .MuiOutlinedInput-input": {
                  padding: "10px 15px",
                  paddingRight: "2px", // Reduce right padding to minimize space before icon
                  borderRadius: "8px",
                },
                "& .MuiOutlinedInput-root": {
                  // border: "1px solid #D0D5DD",
                  borderRadius: "8px",
                  borderColor: "#D0D5DD",
                  paddingRight: "8px", // Reduce right padding for the entire input
                },
                "& .MuiInputAdornment-root": {
                  marginLeft: "2px", // Minimal space between text and icon
                },
                "& .MuiIconButton-root": {
                  padding: "4px", // Reduce icon button padding
                  marginRight: "2px",
                },
              ...sx
              },
            },
          }}
          disabled={disabled}
        />
        {/* <DemoContainer/> */}
      </LocalizationProvider>
    </Stack>
  );
};

export default CustomDatePicker;
