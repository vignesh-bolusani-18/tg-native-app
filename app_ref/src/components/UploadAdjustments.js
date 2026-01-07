import React, { useCallback, useState, useRef } from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Stack,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ReactComponent as CloudUploadIcon } from "../assets/Icons/cloud-upload-dark.svg";
import CustomButton from "./CustomButton";
import CustomTooltip from "./CustomToolTip";
import CustomScrollbar from "./CustomScrollbar";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import Papa from "papaparse";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { format, parseISO } from "date-fns";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ErrorWrapper from "./ErrorWrapper";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

const ConflictBox = styled(Box)(({ theme }) => ({
  border: "1px solid #FEE4E2",
  borderRadius: "8px",
  padding: "16px",
  backgroundColor: "#FEF3F2",
  marginBottom: "16px",
}));

const EnrichmentPreviewBox = styled(Box)(({ theme }) => ({
  border: "1px solid #EAECF0",
  borderRadius: "8px",
  padding: "16px",
  backgroundColor: "#FFFFFF",
  marginBottom: "16px",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontFamily: "Inter",
  fontSize: "14px",
  padding: "12px 16px",
  borderBottom: "1px solid #EAECF0",
  color: "#101828",
  "&.header": {
    backgroundColor: "#F9FAFB",
    color: "#101828",
    fontWeight: 500,
  },
}));

const UploadAdjustments = ({
  open,
  handleClose,
  currentAdjustments,
  onAdjustmentsUpdate,
  dimensionFilterData,
  types,
  columns,
}) => {
  const fileInputRef = React.useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [finalAdjustments, setFinalAdjustments] = useState([]);
  const [approvals, setApprovals] = useState({});
  const [ignoredInvalidAdjustments, setIgnoredInvalidAdjustments] = useState(
    []
  );

  const processAdjustments = (parsedAdjustments) => {
    // Create an array to store all enrichments
    let allAdjustments = [];
    let origionalAdjustments = [];

    // Add existing enrichments to the array
    currentAdjustments.forEach((adjustment) => {
      origionalAdjustments.push({ ...adjustment, used: false });
    });

    console.log("currentAdjustments", currentAdjustments);

    // Process each enrichment from the uploaded file
    parsedAdjustments.forEach((newAdjustment, index) => {
      // console.log("newAdjustment", newAdjustment, "Index", index);
      const formatDateString = (dateStr) => {
        // Parse the date string and adjust for timezone
        if (!dateStr) return dateStr;
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Format dates for comparison
      const formattedStartDate = formatDateString(newAdjustment.date_range[0]);
      const formattedEndDate = formatDateString(newAdjustment.date_range[1]);

      //console.log("formattedStartDate", formattedStartDate);
      // console.log("formattedEndDate", formattedEndDate);

      // If there are validation errors, mark as invalid
      if (newAdjustment.validationErrors) {
        allAdjustments.push({
          ...newAdjustment,
          date_range: [formattedStartDate, formattedEndDate],
          status: "invalid",
          id: `new-${index}`,
        });
        return;
      }
      const existingAdjustmentIndex = origionalAdjustments.findIndex(
        (adjustment) => {
          // For cut_history type, we only need to check cutHistoryTill date
          if (adjustment.adjustment_type === "cut_history") {
            return (
              adjustment.dimension === newAdjustment.dimension &&
              adjustment.value === newAdjustment.value &&
              adjustment.adjustment_type === newAdjustment.adjustment_type &&
              adjustment.date_range[1] === formattedEndDate &&
              !adjustment.used
            );
          }

          // For other types, check all common fields
          const commonFieldsMatch =
            adjustment.date_range[0] === formattedStartDate &&
            adjustment.date_range[1] === formattedEndDate &&
            adjustment.dimension === newAdjustment.dimension &&
            adjustment.value === newAdjustment.value &&
            adjustment.adjustment_type === newAdjustment.adjustment_type &&
            !adjustment.used;

          if (!commonFieldsMatch) return false;

          // Type-specific checks
          switch (adjustment.adjustment_type) {
            case "uplift":
              return (
                adjustment.adjustment_value === newAdjustment.adjustment_value
              );
            case "YoY":
              return (
                adjustment.time_steps === newAdjustment.time_steps &&
                adjustment.future_history === newAdjustment.future_history
              );
            case "stockout_correction":
              return (
                adjustment.adjustment_value === newAdjustment.adjustment_value
              );
            case "replace_value":
              return (
                adjustment.adjustment_value === newAdjustment.adjustment_value
              );
            case "uplift_by_value":
              return (
                adjustment.adjustment_value === newAdjustment.adjustment_value
              );
            default:
              return false;
          }
        }
      );

      if (existingAdjustmentIndex !== -1) {
        // console.log("Existing Adjustment");
        // console.log("Existing Adjustment Index", existingAdjustmentIndex);
        origionalAdjustments[existingAdjustmentIndex].used = true;
        allAdjustments.push({
          ...newAdjustment,
          date_range: [formattedStartDate, formattedEndDate],

          status: "existing",
          id: `existing-${index}`, // Add a unique ID to distinguish between duplicates
        });
      } else {
        // Check if this is a modification of an existing enrichment (only for uplift type)
        const modifiedAdjustmentIndex = origionalAdjustments.findIndex(
          (adjustment) => {
            // Special handling for cut_history type
            if (adjustment.adjustment_type === "cut_history") {
              return (
                adjustment.dimension === newAdjustment.dimension &&
                adjustment.value === newAdjustment.value &&
                adjustment.adjustment_type === newAdjustment.adjustment_type &&
                adjustment.date_range[1] !== formattedEndDate &&
                !adjustment.used
              );
            }

            // Check common fields match
            const commonFieldsMatch =
              adjustment.date_range[0] === formattedStartDate &&
              adjustment.date_range[1] === formattedEndDate &&
              adjustment.dimension === newAdjustment.dimension &&
              adjustment.value === newAdjustment.value &&
              adjustment.adjustment_type === newAdjustment.adjustment_type &&
              !adjustment.used;

            if (!commonFieldsMatch) return false;
            if (adjustment.adjustment_type !== "YoY") {
              return (
                adjustment.adjustment_value !== newAdjustment.adjustment_value
              );
            } else {
              return (
                adjustment.time_steps !== newAdjustment.time_steps ||
                adjustment.future_history !== newAdjustment.future_history ||
                adjustment.adjustment_value !== newAdjustment.adjustment_value
              );
            }
            // Check if type-specific fields are different
          }
        );

        if (modifiedAdjustmentIndex !== -1) {
          // It's a modification of an existing uplift enrichment

          // console.log("Modified Adjustment");
          // console.log("Modified Adjustment Index", modifiedAdjustmentIndex);
          origionalAdjustments[modifiedAdjustmentIndex].used = true;
          allAdjustments.push({
            ...newAdjustment,
            date_range: [formattedStartDate, formattedEndDate],

            status: "modified",
            originalValue:
              origionalAdjustments[modifiedAdjustmentIndex].adjustment_value !==
              newAdjustment.adjustment_value
                ? origionalAdjustments[modifiedAdjustmentIndex].adjustment_value
                : null,
            origionalCutHistoryTill:
              origionalAdjustments[modifiedAdjustmentIndex].date_range[1] !==
              newAdjustment.date_range[1]
                ? origionalAdjustments[modifiedAdjustmentIndex].date_range[1]
                : null,
            origionalTimeSteps:
              origionalAdjustments[modifiedAdjustmentIndex].time_steps !==
              newAdjustment.time_steps
                ? origionalAdjustments[modifiedAdjustmentIndex].time_steps
                : null,
            origionalFutureHistory:
              origionalAdjustments[modifiedAdjustmentIndex].future_history !==
              newAdjustment.future_history
                ? origionalAdjustments[modifiedAdjustmentIndex].future_history
                : null,
            approved: false,
          });
        } else {
          // console.log("New Adjustment");
          //    console.log("New Adjustment Index", index);

          allAdjustments.push({
            ...newAdjustment,
            date_range: [formattedStartDate, formattedEndDate],
            status: "new",
            id: `new-${index}`, // Add a unique ID to distinguish between duplicates
          });
        }
      }
    });

    return allAdjustments;
  };
  const changableDimensions = ["ts_id", "Cluster", "None"];
  const changableValues = ["None"];
  const dimensionMap = {
    ts_id: "Forecast_Granularity",
    Cluster: "cluster",
    None: "all",
  };
  const valueMap = {
    None: "all",
  };
  const convertDimension = (dimension) => {
    if (changableDimensions.includes(dimension)) {
      return dimensionMap[dimension];
    }
    return dimension;
  };
  const convertValue = (value) => {
    if (changableValues.includes(value)) {
      return valueMap[value];
    }
    return value;
  };

  const parseCSV = async (file) => {
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: async(result) => {
        try {
          // Check if CSV has the correct columns
          const csvHeaders = result.data[0];
          const expectedHeaders = columns;

          // Check if headers match
          console.time("Headers Validation");
          const headersMatch = expectedHeaders.every(
            (header, index) => csvHeaders[index] === header
          );
          console.timeEnd("Headers Validation");
          if (!headersMatch) {
            // Show error using Alert instead of toast
            setFinalAdjustments([
              {
                error: true,
                message:
                  "CSV columns don't match the expected format. Please ensure your file has the following columns in order: " +
                  expectedHeaders.join(", "),
              },
            ]);

            setScanning(false);
            return;
          }
          console.time("Date Validation");
          // Validate date format in all rows
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const invalidDateRows = result.data.slice(1).filter((row, index) => {
            const startDate = row[3];
            const endDate = row[4];
            const cutHistoryTill = row[5];

            return (
              row.length > 1 &&
              ((startDate.trim().length > 0 && !dateRegex.test(startDate.trim())) ||
                (endDate.trim().length > 0 && !dateRegex.test(endDate.trim())) ||
                (cutHistoryTill.trim().length > 0 &&
                  !dateRegex.test(cutHistoryTill.trim())))
            );
          });
          console.log("invalidDateRows", invalidDateRows);
          console.timeEnd("Date Validation");
          if (invalidDateRows.length > 0) {
            setFinalAdjustments([
              {
                error: true,
                message:
                  "Invalid date format detected. All dates must be in YYYY-MM-DD format (e.g., 2024-01-31)",
              },
            ]);
            /*  toast.error(
              "Invalid date format detected. All dates must be in YYYY-MM-DD format (e.g., 2024-01-31)"
            ); */
            setScanning(false);
            return;
          }
          console.time("Parsing Adjustments");
          // Process each row with validation
          const parsedAdjustments = result.data
            .slice(1)
            .map((row, rowIndex) => {
              // Initialize validation errors object
              const validationErrors = {};

              // Validate Dimension
              const dimension = row[0] === "all" ? "None" : row[0];
              if (!dimensionFilterData[convertDimension(dimension)]) {
                validationErrors.dimension = "Invalid dimension";
              }

              // Validate Value
              const value = row[1] === "all" ? "None" : row[1];
              if (
                !dimensionFilterData[convertDimension(dimension)]?.includes(
                  convertValue(value)
                )
              ) {
                validationErrors.value = "Invalid value for this dimension";
              }
              // Validate Type
              const adjustmentType = row[2];
              if (!types.includes(adjustmentType)) {
                validationErrors.type = "Invalid adjustment type";
              }

              // Validate Dates
              const startDate = row[3];
              const endDate = row[4];
              const cutHistoryTill = row[5];

              // Check if dates are valid
              const isValidStartDate =
                startDate && !isNaN(new Date(startDate).getTime());
              const isValidEndDate =
                endDate && !isNaN(new Date(endDate).getTime());
              const isValidCutHistoryTill =
                cutHistoryTill && !isNaN(new Date(cutHistoryTill).getTime());

              // Validate dates based on type
              if (adjustmentType === "cut_history") {
                // For cut_history, only Cut History Till date is required
                const cutHistoryTill = row[5];
                if (!isValidCutHistoryTill) {
                  validationErrors.cutHistoryTill =
                    "Cut History Till date is required and must be in YYYY-MM-DD format";
                }
                // Start and End dates should be empty
                if (startDate || endDate) {
                  validationErrors.startDate =
                    "Start/End dates should not be provided for cut_history type";
                  validationErrors.endDate =
                    "Start/End dates should not be provided for cut_history type";
                }
              } else {
                // For all other types, validate start and end dates
                if (!isValidStartDate) {
                  validationErrors.startDate = "Invalid start date";
                }
                if (!isValidEndDate) {
                  validationErrors.endDate = "Invalid end date";
                }
                if (isValidStartDate && isValidEndDate) {
                  const start = new Date(startDate);
                  const end = new Date(endDate);
                  if (end < start) {
                    validationErrors.endDate =
                      "End date must be after start date";
                    validationErrors.startDate =
                      "Start date must be before end date";
                  }
                }
              }

              // Type-specific validations
              const percentage = row[6];
              const numericValue = row[7]; // This is the # Value column
              const timeSteps = row[8];
              const futureHistory = row[9];

              switch (adjustmentType) {
                case "uplift":
                  if (!percentage || isNaN(parseFloat(percentage))) {
                    validationErrors.percentage =
                      "Percentage is required and must be numeric for uplift type";
                  }
                  if (numericValue) {
                    validationErrors.numericValue =
                      "# Value should not be provided for uplift type";
                  }
                  if (timeSteps || futureHistory) {
                    validationErrors.timeSteps =
                      "Time Steps and Future/History should not be provided for uplift type";
                  }
                  break;

                case "YoY":
                  if (!timeSteps || isNaN(parseInt(timeSteps))) {
                    validationErrors.timeSteps =
                      "Time Steps is required and must be numeric for YoY type";
                  }
                  if (
                    !futureHistory ||
                    !["history", "future"].includes(futureHistory)
                  ) {
                    validationErrors.futureHistory =
                      "Future/History must be either 'history' or 'future' for YoY type";
                  }
                  if (numericValue) {
                    validationErrors.percentage =
                      "# Value should not be provided for YoY type";
                  }
                  break;

                case "stockout_correction":
                  if (!percentage || isNaN(parseFloat(percentage))) {
                    validationErrors.percentage =
                      "Percentage is required and must be numeric for stockout_correction type";
                  }
                  if (numericValue || timeSteps || futureHistory) {
                    validationErrors.numericValue =
                      "# Value, Time Steps, and Future/History should not be provided for stockout_correction type";
                  }
                  break;

                case "replace_value":
                  if (!numericValue || isNaN(parseFloat(numericValue))) {
                    validationErrors.numericValue =
                      "# Value is required and must be numeric for replace_value type";
                  }
                  if (percentage || timeSteps || futureHistory) {
                    validationErrors.percentage =
                      "Percentage, Time Steps, and Future/History should not be provided for replace_value type";
                  }
                  break;

                case "uplift_by_value":
                  if (!numericValue || isNaN(parseFloat(numericValue))) {
                    validationErrors.numericValue =
                      "# Value is required and must be numeric for uplift_by_value type";
                  }
                  if (percentage || timeSteps || futureHistory) {
                    validationErrors.percentage =
                      "Percentage, Time Steps, and Future/History should not be provided for uplift_by_value type";
                  }
                  break;
              }

              // Format the adjustment object with validation errors
              return {
                dimension,
                value,
                date_range:
                  adjustmentType === "cut_history"
                    ? [startDate, row[5]]
                    : [startDate, endDate],
                adjustment_type: adjustmentType,
                adjustment_value: [
                  "uplift",
                  "YoY",
                  "stockout_correction",
                ].includes(adjustmentType)
                  ? percentage
                    ? parseFloat(percentage)
                    : null
                  : numericValue
                  ? parseFloat(numericValue)
                  : null,

                time_steps:
                  adjustmentType === "YoY"
                    ? timeSteps
                      ? parseInt(timeSteps)
                      : null
                    : null,
                future_history: adjustmentType === "YoY" ? futureHistory : null,
                validationErrors:
                  Object.keys(validationErrors).length > 0
                    ? validationErrors
                    : null,
                /*  rowIndex: rowIndex + 2, // Add 2 to account for 0-based index and header row */
              };
            })
            .filter((adjustment) => adjustment.dimension && adjustment.value);
          console.timeEnd("Parsing Adjustments");
          console.log("parsedAdjustments", parsedAdjustments);
          console.time("Processing Adjustments");
          const processed = await processAdjustments(parsedAdjustments);
          console.log("processed", processed);
          console.timeEnd("Processing Adjustments");
          setFinalAdjustments(processed);

          const newCount = processed.filter((e) => e.status === "new").length;
          const modifiedCount = processed.filter(
            (e) => e.status === "modified"
          ).length;
          const invalidCount = processed.filter(
            (e) => e.validationErrors
          ).length;

          if (newCount === 0 && modifiedCount === 0 && invalidCount === 0) {
            toast.info("No new or modified adjustments found");
          } else {
            let message = "";
            if (newCount > 0) message += `${newCount} new`;
            if (modifiedCount > 0)
              message += `${message ? ", " : ""}${modifiedCount} modified`;
            if (invalidCount > 0)
              message += `${message ? ", " : ""}${invalidCount} invalid`;
            message += ` adjustment${
              newCount + modifiedCount + invalidCount !== 1 ? "s" : ""
            }`;
            toast.success(`Found ${message}`);
          }

          setScanning(false);
        } catch (error) {
          console.error("Error parsing adjustments:", error);
          toast.error("Error parsing adjustments from CSV");
          setScanning(false);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        toast.error("Error parsing CSV file");
        setScanning(false);
      },
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "text/csv") {
        setScanning(true);
        setSelectedFile(file);
        console.time("Complete Scanning");
        await parseCSV(file);
        console.timeEnd("Complete Scanning");
      } else {
        toast.error("Please select a CSV file");
        setSelectedFile(null);
        event.target.value = "";
      }
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setScanning(true);
      setSelectedFile(file);
      console.time("Complete Scanning");
      await parseCSV(file);
      console.timeEnd("Complete Scanning");
    } else {
      toast.error("Please select a CSV file");
      setSelectedFile(null);
    }
    setDragOver(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFinalAdjustments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApprove = () => {
    // Check if all modified enrichments are approved
    const hasUnapprovedModifications = finalAdjustments.some(
      (e) => e.status === "modified" && !e.approved
    );

    if (hasUnapprovedModifications) {
      toast.error("Please approve all modifications before proceeding");
      return;
    }

    // Filter out the status and other temporary properties
    console.log("finalAdjustments", finalAdjustments);
    const cleanedAdjustments = finalAdjustments
      .filter(
        (adjustment) => adjustment.status !== "invalid" // Always filter out invalid enrichments
      )
      .map(
        ({
          status,
          originalValue,
          approved,
          id,
          validationErrors,
          ...adjustment
        }) => {
          // Parse and format dates that are in DD-MM-YY format
          const formatDateIfNeeded = (dateStr) => {
            if (!dateStr) return dateStr;
            return formatDate(dateStr);
          };

          return {
            operation: "adjust_data",
            kwargs: {
              ...adjustment,
              date_range: [
                formatDateIfNeeded(adjustment.date_range[0]),
                formatDateIfNeeded(adjustment.date_range[1]),
              ],
            },
          };
        }
      );
    console.log("cleanedAdjustments", cleanedAdjustments);
    onAdjustmentsUpdate(cleanedAdjustments);
    handleClose();
    handleRemoveFile();
    toast.success("Adjustments updated successfully");
  };

  const toggleIgnoreInvalidAdjustment = (adjustmentId) => {
    if (ignoredInvalidAdjustments.includes(adjustmentId)) {
      setIgnoredInvalidAdjustments(
        ignoredInvalidAdjustments.filter((id) => id !== adjustmentId)
      );
    } else {
      setIgnoredInvalidAdjustments([
        ...ignoredInvalidAdjustments,
        adjustmentId,
      ]);
    }
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

  const renderAdjustmentsTable = () => {
    if (!selectedFile || !finalAdjustments.length) return null;

    // Check if there's an error to display
    if (finalAdjustments[0]?.error) {
      return (
        <Alert
          severity="error"
          sx={{
            width: "100%",
            marginBottom: 2,
          }}
        >
          {finalAdjustments[0].message}
        </Alert>
      );
    }

    // Check if there are any invalid enrichments
    const hasInvalidAdjustments = finalAdjustments.some(
      (e) => e.status === "invalid"
    );

    // Check if all invalid enrichments are ignored
    const allInvalidAdjustmentsIgnored = finalAdjustments.every(
      (e) => e.status !== "invalid" || ignoredInvalidAdjustments.includes(e.id)
    );

    // Check if there are any modified enrichments
    const hasModifiedAdjustments = finalAdjustments.some(
      (e) => e.status === "modified"
    );

    // Check if all modified enrichments are approved
    const allModifiedAdjustmentsApproved = finalAdjustments.every(
      (e) => e.status !== "modified" || e.approved
    );

    // Function to toggle ignore all invalid enrichments
    const handleIgnoreAllInvalid = () => {
      if (allInvalidAdjustmentsIgnored) {
        // If all are ignored, unignore them
        const invalidAdjustmentIds = finalAdjustments
          .filter((e) => e.status === "invalid")
          .map((e) => e.id);
        setIgnoredInvalidAdjustments(
          ignoredInvalidAdjustments.filter(
            (id) => !invalidAdjustmentIds.includes(id)
          )
        );
      } else {
        // If not all are ignored, ignore them all
        const invalidAdjustmentIds = finalAdjustments
          .filter((e) => e.status === "invalid")
          .map((e) => e.id);
        setIgnoredInvalidAdjustments([
          ...ignoredInvalidAdjustments,
          ...invalidAdjustmentIds,
        ]);
      }
    };

    // Function to toggle approve all modified enrichments
    const handleApproveAllModified = () => {
      const updatedAdjustments = finalAdjustments.map((adjustment) => {
        if (adjustment.status === "modified") {
          return { ...adjustment, approved: !allModifiedAdjustmentsApproved };
        }
        return adjustment;
      });
      setFinalAdjustments(updatedAdjustments);
    };

    return (
      <Box sx={{ mt: 0 }}>
        <ErrorWrapper>
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={2}
            sx={{
              paddingY: 2,
              justifyContent: "space-between",
            }}
          >
            <Alert
              severity={
                finalAdjustments.filter((e) => e.status === "modified").length >
                0
                  ? "warning"
                  : finalAdjustments.filter((e) => e.status === "invalid")
                      .length > 0
                  ? "error"
                  : "info"
              }
              sx={{ flex: 1, display: "flex" }}
            >
              Found {finalAdjustments.filter((e) => e.status === "new").length}{" "}
              new and{" "}
              {finalAdjustments.filter((e) => e.status === "modified").length}{" "}
              modified adjustment
              {finalAdjustments.filter((e) => e.status === "modified")
                .length !== 1
                ? "s"
                : ""}
              {finalAdjustments.filter((e) => e.status === "invalid").length >
                0 && (
                <>
                  {" "}
                  and{" "}
                  {
                    finalAdjustments.filter((e) => e.status === "invalid")
                      .length
                  }{" "}
                  invalid adjustment
                  {finalAdjustments.filter((e) => e.status === "invalid")
                    .length !== 1
                    ? "s"
                    : ""}
                  {finalAdjustments.every(
                    (e) =>
                      e.status !== "invalid" ||
                      ignoredInvalidAdjustments.includes(e.id)
                  ) && <> (all ignored)</>}
                </>
              )}
            </Alert>
            <Stack direction="row" spacing={1}>
              {hasModifiedAdjustments && (
                <CustomButton
                  title={
                    allModifiedAdjustmentsApproved
                      ? "Unapprove All Modifications"
                      : "Approve All Modifications"
                  }
                  onClick={handleApproveAllModified}
                  outlined
                  size="small"
                />
              )}
              {hasInvalidAdjustments && (
                <CustomButton
                  title={
                    allInvalidAdjustmentsIgnored
                      ? "Unignore All Invalid"
                      : "Ignore All Invalid"
                  }
                  onClick={handleIgnoreAllInvalid}
                  outlined
                  size="small"
                />
              )}
            </Stack>
          </Stack>
          <CustomScrollbar verticalScroll={true} horizontalScroll={false}>
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: "none",
                border: "none",
                maxHeight: "400px",
                overflowX: "auto", // Enable horizontal scrolling
                width: "100%",
              }}
            >
              <Table stickyHeader sx={{ minWidth: "max-content" }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Sr.
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Dimension
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Value
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Type
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Start Date
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      End Date
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Cut History Till
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Percentage
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      # Value
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Time Steps
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Future / History
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Status
                    </StyledTableCell>
                    <StyledTableCell
                      className="header"
                      sx={{ whiteSpace: "nowrap" }}
                    ></StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {finalAdjustments.map((adjustment, index) => {
                    const isIgnored =
                      adjustment.status === "invalid" &&
                      ignoredInvalidAdjustments.includes(adjustment.id);

                    return (
                      <TableRow
                        key={adjustment.id || index}
                        sx={{
                          backgroundColor:
                            adjustment.status === "modified"
                              ? "#FFFDE7"
                              : adjustment.status === "new"
                              ? "#F6FEF9"
                              : adjustment.status === "invalid"
                              ? ignoredInvalidAdjustments.includes(
                                  adjustment.id
                                )
                                ? "#F9FAFB"
                                : "#FEF3F2"
                              : "#FFFFFF",
                          "&:hover": {
                            backgroundColor:
                              adjustment.status === "modified"
                                ? "#FFF9C490"
                                : adjustment.status === "new"
                                ? "#ECFDF3"
                                : adjustment.status === "invalid"
                                ? ignoredInvalidAdjustments.includes(
                                    adjustment.id
                                  )
                                  ? "#F2F4F7"
                                  : "#FEE4E2"
                                : "#F9FAFB",
                          },
                          position: "relative",
                          opacity: isIgnored ? 0.6 : 1,
                          "&::after": isIgnored
                            ? {
                                content: '""',
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                right: 0,
                                borderTop: "1px solid #B42318",
                                zIndex: 1,
                              }
                            : {},
                        }}
                      >
                        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
                          {index + 1}
                        </StyledTableCell>
                        <StyledTableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                color: adjustment.validationErrors?.dimension
                                  ? "error.main"
                                  : "inherit",
                                /* maxWidth: "calc(100% - 24px)", */
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.dimension === "None"
                                ? "All"
                                : convertDimension(adjustment.dimension)}
                            </Typography>
                            {adjustment.validationErrors?.dimension && (
                              <CustomTooltip
                                title={adjustment.validationErrors.dimension}
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>

                        {/* Continue with all other cells - keeping their existing content but adding sx={{ whiteSpace: "nowrap" }} to StyledTableCell */}
                        {/* For brevity, I'm showing the pattern - you would repeat for all remaining cells */}

                        <StyledTableCell sx={{ whiteSpace: "nowrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                color: adjustment.validationErrors?.value
                                  ? "error.main"
                                  : "inherit",
                                /*  maxWidth: "calc(100% - 24px)", */
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.value === "None"
                                ? "All"
                                : adjustment.value}
                            </Typography>
                            {adjustment.validationErrors?.value && (
                              <CustomTooltip
                                title={adjustment.validationErrors.value}
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                        {/*  //Type */}
                        <StyledTableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                color: adjustment.validationErrors?.type
                                  ? "error.main"
                                  : "inherit",
                                /*   maxWidth: "calc(100% - 24px)", */
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.adjustment_type}
                            </Typography>
                            {adjustment.validationErrors?.type && (
                              <CustomTooltip
                                title={adjustment.validationErrors.type}
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                        {/*  //Start Date */}
                        <StyledTableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                color: adjustment.validationErrors?.startDate
                                  ? "error.main"
                                  : "inherit",
                                /*   maxWidth     : "calc(100% - 24px)", */
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.adjustment_type !== "cut_history"
                                ? formatKey(
                                    formatDate(adjustment.date_range[0])
                                  )
                                : "-"}
                            </Typography>
                            {adjustment.validationErrors?.startDate && (
                              <CustomTooltip
                                title={adjustment.validationErrors.startDate}
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                        {/*  //End Date */}
                        <StyledTableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                color: adjustment.validationErrors?.endDate
                                  ? "error.main"
                                  : "inherit",
                                /*  maxWidth: "calc(100% - 24px)", */
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adjustment.adjustment_type !== "cut_history"
                                ? formatKey(
                                    formatDate(adjustment.date_range[1])
                                  )
                                : "-"}
                            </Typography>
                            {adjustment.validationErrors?.endDate && (
                              <CustomTooltip
                                title={adjustment.validationErrors.endDate}
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                        {/* //Cut History Till */}
                        <StyledTableCell>
                          {adjustment.adjustment_type === "cut_history" ? (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {adjustment.status === "modified" &&
                              adjustment.origionalCutHistoryTill ? (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    /* maxWidth : "calc(100% - 24px)", */
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      backgroundColor: "#fff9c4",
                                    }}
                                  >
                                    {formatKey(
                                      formatDate(
                                        adjustment.origionalCutHistoryTill
                                      )
                                    )}
                                  </span>
                                  <span>→</span>
                                  <span
                                    style={{
                                      backgroundColor: "#e8f5e9",
                                    }}
                                  >
                                    {formatKey(
                                      formatDate(adjustment.date_range[1])
                                    )}
                                  </span>
                                </Typography>
                              ) : (
                                <Typography
                                  sx={{
                                    color: adjustment.validationErrors
                                      ?.cutHistoryTill
                                      ? "error.main"
                                      : "inherit",
                                    /* maxWidth: "calc(100% - 24px)", */
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {formatKey(
                                    formatDate(adjustment.date_range[1])
                                  )}
                                </Typography>
                              )}
                              {adjustment.validationErrors?.cutHistoryTill && (
                                <CustomTooltip
                                  title={
                                    adjustment.validationErrors.cutHistoryTill
                                  }
                                  arrow
                                >
                                  <ErrorOutlineIcon
                                    sx={{
                                      ml: 1,
                                      color: "error.main",
                                      fontSize: "1rem",
                                      cursor: "help",
                                      flexShrink: 0,
                                    }}
                                  />
                                </CustomTooltip>
                              )}
                            </Box>
                          ) : (
                            "-"
                          )}
                        </StyledTableCell>
                        {/* // Percentage */}
                        <StyledTableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {adjustment.adjustment_value !== null &&
                            adjustment.adjustment_value !== "" &&
                            ["uplift", "YoY", "stockout_correction"].includes(
                              adjustment.adjustment_type
                            ) ? (
                              adjustment.status === "modified" &&
                              adjustment.originalValue ? (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    /*  maxWidth: "calc(100% - 24px)", */
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      backgroundColor: "#fff9c4",
                                    }}
                                  >
                                    {adjustment.originalValue}%
                                  </span>
                                  <span>→</span>
                                  <span
                                    style={{
                                      backgroundColor: "#e8f5e9",
                                    }}
                                  >
                                    {adjustment.adjustment_value}%
                                  </span>
                                </Typography>
                              ) : (
                                <Typography
                                  sx={{
                                    color: adjustment.validationErrors
                                      ?.percentage
                                      ? "error.main"
                                      : "inherit",
                                    // maxWidth : "calc(100% - 24px)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {adjustment.adjustment_value}
                                  {adjustment.validationErrors?.percentage
                                    ? ""
                                    : "%"}
                                </Typography>
                              )
                            ) : (
                              "-"
                            )}
                            {adjustment.validationErrors?.percentage && (
                              <CustomTooltip
                                title={adjustment.validationErrors.percentage}
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                        {/*  // # Value */}
                        <StyledTableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {adjustment.adjustment_value !== null &&
                            adjustment.adjustment_value !== "" &&
                            ["replace_value", "uplift_by_value"].includes(
                              adjustment.adjustment_type
                            ) ? (
                              adjustment.status === "modified" &&
                              adjustment.originalValue ? (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    //maxWidth: "calc(100% - 24px)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      backgroundColor: "#fff9c4",
                                    }}
                                  >
                                    {adjustment.originalValue}
                                  </span>
                                  <span>→</span>
                                  <span
                                    style={{
                                      backgroundColor: "#e8f5e9",
                                    }}
                                  >
                                    {adjustment.adjustment_value}
                                  </span>
                                </Typography>
                              ) : (
                                <Typography
                                  sx={{
                                    color: adjustment.validationErrors
                                      ?.numericValue
                                      ? "error.main"
                                      : "inherit",
                                    // maxWidth: "calc(100% - 24px)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {adjustment.adjustment_value}
                                  {adjustment.validationErrors?.numericValue
                                    ? ""
                                    : ""}
                                </Typography>
                              )
                            ) : (
                              "-"
                            )}
                            {adjustment.validationErrors?.numericValue && (
                              <CustomTooltip
                                title={adjustment.validationErrors.numericValue}
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                        {/*  // # Time Steps */}
                        <StyledTableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {adjustment.time_steps !== null &&
                            adjustment.time_steps !== "" &&
                            adjustment.adjustment_type === "YoY" ? (
                              adjustment.status === "modified" &&
                              adjustment.origionalTimeSteps ? (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    // maxWidth: "calc(100% - 24px)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      backgroundColor: "#fff9c4",
                                    }}
                                  >
                                    {adjustment.origionalTimeSteps}
                                  </span>
                                  <span>→</span>
                                  <span
                                    style={{
                                      backgroundColor: "#e8f5e9",
                                    }}
                                  >
                                    {adjustment.time_steps}
                                  </span>
                                </Typography>
                              ) : (
                                <Typography
                                  sx={{
                                    color: adjustment.validationErrors
                                      ?.time_steps
                                      ? "error.main"
                                      : "inherit",
                                    // maxWidth: "calc(100% - 24px)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {adjustment.time_steps}
                                </Typography>
                              )
                            ) : (
                              "-"
                            )}
                            {adjustment.validationErrors?.time_steps && (
                              <CustomTooltip
                                title={adjustment.validationErrors.time_steps}
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                        {/* // # Future/History */}
                        <StyledTableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {adjustment.future_history !== null &&
                            adjustment.future_history !== "" &&
                            adjustment.adjustment_type === "YoY" ? (
                              adjustment.status === "modified" &&
                              adjustment.origionalFutureHistory ? (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    // maxWidth: "calc(100% - 24px)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      backgroundColor: "#fff9c4",
                                    }}
                                  >
                                    {adjustment.origionalFutureHistory}
                                  </span>
                                  <span>→</span>
                                  <span
                                    style={{
                                      backgroundColor: "#e8f5e9",
                                    }}
                                  >
                                    {adjustment.future_history}
                                  </span>
                                </Typography>
                              ) : (
                                <Typography
                                  sx={{
                                    color: adjustment.validationErrors
                                      ?.future_history
                                      ? "error.main"
                                      : "inherit",
                                    // maxWidth: "calc(100% - 24px)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {adjustment.future_history}
                                </Typography>
                              )
                            ) : (
                              "-"
                            )}
                            {adjustment.validationErrors?.futureHistory && (
                              <CustomTooltip
                                title={
                                  adjustment.validationErrors.futureHistory
                                }
                                arrow
                              >
                                <ErrorOutlineIcon
                                  sx={{
                                    ml: 1,
                                    color: "error.main",
                                    fontSize: "1rem",
                                    cursor: "help",
                                    flexShrink: 0,
                                  }}
                                />
                              </CustomTooltip>
                            )}
                          </Box>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                adjustment.status === "modified"
                                  ? "#B45F18"
                                  : adjustment.status === "new"
                                  ? "#027A48"
                                  : adjustment.status === "invalid"
                                  ? "#B42318"
                                  : "black",
                              backgroundColor:
                                adjustment.status === "modified"
                                  ? "#FFF9C4"
                                  : adjustment.status === "new"
                                  ? "#ECFDF3"
                                  : adjustment.status === "invalid"
                                  ? ignoredInvalidAdjustments.includes(
                                      adjustment.id
                                    )
                                    ? "#F2F4F7"
                                    : "#FEF3F2"
                                  : "#F2F4F7",
                              padding: "2px 8px",
                              borderRadius: "16px",
                              fontWeight: 500,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "inline-block",
                            }}
                          >
                            {adjustment.status === "modified"
                              ? "Modified"
                              : adjustment.status === "new"
                              ? "New"
                              : adjustment.status === "invalid"
                              ? ignoredInvalidAdjustments.includes(
                                  adjustment.id
                                )
                                ? "Ignored"
                                : "Invalid"
                              : "Existing"}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          {adjustment.status === "modified" ? (
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                onClick={() => {
                                  const newAdjustments = [...finalAdjustments];
                                  newAdjustments[index] = {
                                    ...adjustment,
                                    approved: !adjustment.approved,
                                  };
                                  setFinalAdjustments(newAdjustments);
                                }}
                                size="medium"
                                sx={{
                                  color: adjustment.approved
                                    ? "#027A48"
                                    : "#344054",
                                  padding: 0,
                                }}
                              >
                                {adjustment.approved ? (
                                  <CheckCircleIcon fontSize="medium" />
                                ) : (
                                  <CheckCircleOutlineIcon fontSize="medium" />
                                )}
                              </IconButton>
                            </Stack>
                          ) : adjustment.status === "invalid" ? (
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                onClick={() =>
                                  toggleIgnoreInvalidAdjustment(adjustment.id)
                                }
                                size="medium"
                                sx={{
                                  color: ignoredInvalidAdjustments.includes(
                                    adjustment.id
                                  )
                                    ? "#027A48"
                                    : "#344054",
                                  padding: 0,
                                }}
                              >
                                <CloseIcon fontSize="medium" />
                              </IconButton>
                            </Stack>
                          ) : null}
                        </StyledTableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CustomScrollbar>
        </ErrorWrapper>
      </Box>
    );
  };

  // Add helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const exampleRows = [
    {
      Dimension: "all",
      Value: "all",
      "Start Date": "2024-10-01",
      "End Date": "2025-02-27",
      Type: "uplift",
      "Cut History Till": "",
      Percentage: "2",
      "# Value": "",
      "Time Steps": "",
      "Future/History": "",
    },
    {
      Dimension: "all",
      Value: "all",
      "Start Date": "",
      "End Date": "",
      Type: "cut_history",
      "Cut History Till": "2025-04-23",
      Percentage: "",
      "# Value": "",
      "Time Steps": "",
      "Future/History": "",
    },
    {
      Dimension: "all",
      Value: "all",
      "Start Date": "2025-04-01",
      "End Date": "2025-04-29",
      Type: "YoY",
      "Cut History Till": "",
      Percentage: "2",
      "# Value": "",
      "Time Steps": "1",
      "Future/History": "history",
    },
    {
      Dimension: "all",
      Value: "all",
      "Start Date": "2025-04-06",
      "End Date": "2025-04-24",
      Type: "stockout_correction",
      "Cut History Till": "",
      Percentage: "2",
      "# Value": "",
      "Time Steps": "",
      "Future/History": "",
    },
    {
      Dimension: "all",
      Value: "all",
      "Start Date": "2025-04-08",
      "End Date": "2025-04-23",
      Type: "replace_value",
      "Cut History Till": "",
      Percentage: "",
      "# Value": "0",
      "Time Steps": "",
      "Future/History": "",
    },
    {
      Dimension: "all",
      Value: "all",
      "Start Date": "2025-04-22",
      "End Date": "2025-04-30",
      Type: "uplift_by_value",
      "Cut History Till": "",
      Percentage: "",
      "# Value": "100",
      "Time Steps": "",
      "Future/History": "",
    },
  ];

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
          Upload Adjustments
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
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

      <DialogContent>
        <Box sx={{ padding: "24px 32px 48px 32px", gap: "24px" }}>
          {selectedFile ? (
            <Box
              sx={{
                border: "1px solid #EAECF0",
                borderRadius: "8px",
                padding: "16px 24px 16px 24px",
                backgroundColor: "#FFFFFF",
                alignItems: "center",
              }}
            >
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Stack direction="column">
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "20px",
                      color: "#101828",
                    }}
                  >
                    {selectedFile.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "20px",
                      color: "#10182870",
                    }}
                  >
                    {`${(selectedFile.size / 1024).toFixed(2)} KB`}
                  </Typography>
                </Stack>
                <IconButton
                  aria-label="remove"
                  onClick={handleRemoveFile}
                  sx={{
                    color: "#FF0000",
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>

              {scanning ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                    width: "100%",
                    gap: 2,
                    border: "1px solid #eaedf1",
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    padding: 2,
                  }}
                >
                  <Typography sx={{ color: "#1976d2" }}>
                    Scanning file for adjustments...
                  </Typography>
                </Box>
              ) : (
                <>{renderAdjustmentsTable()}</>
              )}
            </Box>
          ) : (
            <Stack direction="column" spacing={2}>
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                sx={{
                  border: "1px solid #EAECF0",
                  borderRadius: "8px",
                  padding: "16px 24px 16px 24px",
                  backgroundColor: dragOver ? "#F2F4F7" : "#FFFFFF",
                }}
              >
                <Stack
                  spacing={0.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconButton
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <Box
                      sx={{
                        border: "6px solid #F9FAFB",
                        backgroundColor: "#F2F4F7",
                        borderRadius: "28px",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "40px",
                        width: "40px",
                      }}
                    >
                      <CloudUploadIcon />
                    </Box>
                    <VisuallyHiddenInput
                      type="file"
                      accept=".csv"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </IconButton>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "#475467",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      component="span"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      sx={{
                        color: "#0C66E4",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Click to upload
                    </Box>
                    {" or drag and drop"}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "18px",
                      color: "#475467",
                      textAlign: "center",
                    }}
                  >
                    CSV files only
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  border: "1px solid #EAECF0",
                  borderRadius: "8px",
                  padding: "16px 24px 16px 24px",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "18px",
                    color: "#475467",
                    mb: 1,
                  }}
                >
                  Required columns (in order):
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    flexWrap: "wrap",
                    gap: "4px",
                    maxWidth: "100%",
                    mb: 2,
                  }}
                >
                  {columns.map((column, index) => (
                    <Typography
                      key={index}
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "#101828",
                        backgroundColor: "#F2F4F7",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid #E0E4E8",
                      }}
                    >
                      {column}
                    </Typography>
                  ))}
                </Stack>
                {/* 
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "18px",
                    color: "#475467",
                    mb: 1,
                  }}
                >
                  Required columns by type:
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      uplift:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Start Date", "End Date", "Type", "Percentage"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      cut_history:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Type", "Cut History Till"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      YoY:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {[
                        "Dimension",
                        "Value",
                        "Start Date",
                        "End Date",
                        "Type",
                        "Time Steps",
                        "Future/History",
                      ].map((column, index) => (
                        <Typography
                          key={index}
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#027A48",
                            backgroundColor: "#ECFDF3",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            border: "1px solid #ABEFC6",
                          }}
                        >
                          {column}
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      stockout_correction:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Start Date", "End Date", "Type", "Percentage"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      replace_value:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Start Date", "End Date", "Type", "# Value"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 0.5,
                      }}
                    >
                      uplift_by_value:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      {["Dimension", "Value", "Start Date", "End Date", "Type", "# Value"].map(
                        (column, index) => (
                          <Typography
                            key={index}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              border: "1px solid #ABEFC6",
                            }}
                          >
                            {column}
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Box>
                </Stack> */}

                <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 1,
                      }}
                    >
                      Validation Rules:
                    </Typography>
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • Date Format: YYYY-MM-DD (e.g., 2024-01-31)
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • Note: If using Excel, be careful with dates. They may
                        auto-format.
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • End date {">"} Start date (except for cut_history
                        type)
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • Type-specific requirements:
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: "#475467",
                          }}
                        >
                          - uplift: Requires Percentage (numeric)
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: "#475467",
                          }}
                        >
                          - cut_history: Requires Cut History Till date only
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: "#475467",
                          }}
                        >
                          - YoY: Requires Time Steps (numeric) and
                          Future/History ("history" or "future")
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: "#475467",
                          }}
                        >
                          - stockout_correction: Requires Percentage (numeric)
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: "#475467",
                          }}
                        >
                          - replace_value: Requires # Value (numeric)
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "12px",
                            lineHeight: "18px",
                            color: "#475467",
                          }}
                        >
                          - uplift_by_value: Requires # Value (numeric)
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/*  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                        mb: 1,
                      }}
                    >
                      Special Cases:
                    </Typography>
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • "None" = "all"
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • ts_id → Forecast_Granularity
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • Cluster → cluster
                      </Typography>
                    </Stack>
                  </Box> */}
                </Stack>
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "18px",
                        color: "#475467",
                      }}
                    >
                      Example Formats:
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        // Create CSV content with columns in the correct order
                        const csvContent = [
                          [
                            "Dimension",
                            "Value",
                            "Start Date",
                            "End Date",
                            "Type",
                            "Cut History Till",
                            "Percentage",
                            "# Value",
                            "Time Steps",
                            "Future/History",
                          ].join(","),
                          // Example for uplift
                          [
                            "all",
                            "all",
                            " 2024-10-01",
                            " 2025-02-27",
                            "uplift",
                            "",
                            "2",
                            "",
                            "",
                            "",
                          ].join(","),
                          // Example for cut_history
                          [
                            "all",
                            "all",
                            "",
                            "",
                            "cut_history",
                            " 2025-04-23",
                            "",
                            "",
                            "",
                            "",
                          ].join(","),
                          // Example for YoY
                          [
                            "all",
                            "all",
                            " 2025-04-01",
                            " 2025-04-29",
                            "YoY",
                            "",
                            "2",
                            "",
                            "1",
                            "history",
                          ].join(","),
                          // Example for stockout_correction
                          [
                            "all",
                            "all",
                            " 2025-04-06",
                            " 2025-04-24",
                            "stockout_correction",
                            "",
                            "2",
                            "",
                            "",
                            "",
                          ].join(","),
                          // Example for replace_value
                          [
                            "all",
                            "all",
                            " 2025-04-08",
                            " 2025-04-23",
                            "replace_value",
                            "",
                            "",
                            "0",
                            "",
                            "",
                          ].join(","),
                          // Example for uplift_by_value
                          [
                            "all",
                            "all",
                            " 2025-04-22",
                            " 2025-04-30",
                            "uplift_by_value",
                            "",
                            "",
                            "100",
                            "",
                            "",
                          ].join(","),
                        ].join("\n");

                        // Create and trigger download
                        const blob = new Blob([csvContent], {
                          type: "text/csv;charset=utf-8;",
                        });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "example_format.csv";
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      <FileDownloadOutlinedIcon
                        sx={{ fontSize: 16, color: "#475467" }}
                      />
                    </IconButton>
                  </Stack>
                  <TableContainer
                    component={Paper}
                    sx={{ boxShadow: "none", border: "1px solid #EAECF0" }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {columns.map((column, index) => (
                            <TableCell key={index}>
                              <Typography
                                sx={{
                                  fontFamily: "Inter",
                                  fontWeight: 600,
                                  fontSize: "12px",
                                  lineHeight: "16px",
                                  color: "black",
                                }}
                              >
                                {column}
                              </Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {exampleRows.map((row, index) => (
                          <TableRow key={index}>
                            {columns.map((column, colIndex) => (
                              <TableCell key={colIndex}>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontWeight: 400,
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    color: "#667085",
                                  }}
                                >
                                  {row[column]}
                                </Typography>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px" }}>
        <CustomButton onClick={handleClose} title="Cancel" outlined />
        {!selectedFile || scanning ? (
          <CustomButton title="Apply Adjustments" disabled={true} />
        ) : finalAdjustments.some(
            (e) =>
              e.status === "invalid" &&
              !ignoredInvalidAdjustments.includes(e.id)
          ) ? (
          <CustomTooltip
            title="Please ignore all invalid adjustments before proceeding."
            arrow
          >
            <span>
              <CustomButton title="Apply Adjustments" disabled={true} />
            </span>
          </CustomTooltip>
        ) : finalAdjustments.some(
            (e) => e.status === "modified" && !e.approved
          ) ? (
          <CustomTooltip
            title="Please approve all modified adjustments before proceeding."
            arrow
          >
            <span>
              <CustomButton title="Apply Adjustments" disabled={true} />
            </span>
          </CustomTooltip>
        ) : (
          <CustomButton onClick={handleApprove} title="Apply Adjustments" />
        )}
      </DialogActions>
    </BootstrapDialog>
  );
};

export default UploadAdjustments;
