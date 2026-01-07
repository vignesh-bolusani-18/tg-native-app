import React, { useCallback, useState } from "react";
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

const UploadEnrichments = ({
  open,
  handleClose,
  currentEnrichments,
  onEnrichmentsUpdate,
  dimensionFilterData,
  types,
  columns,
}) => {
  const fileInputRef = React.useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [finalEnrichments, setFinalEnrichments] = useState([]);
  const [approvals, setApprovals] = useState({});
  const [ignoredInvalidEnrichments, setIgnoredInvalidEnrichments] = useState(
    []
  );

  const processEnrichments = (parsedEnrichments) => {
    // Create an array to store all enrichments
    let allEnrichments = [];
    let origionalEnrichments = [];

    // Add existing enrichments to the array
    currentEnrichments.forEach((enrichment) => {
      origionalEnrichments.push({ ...enrichment, used: false });
    });

    console.log("currentEnrichments", currentEnrichments);

    // Process each enrichment from the uploaded file
    parsedEnrichments.forEach((newEnrichment, index) => {
      console.log("newEnrichment", newEnrichment, "Index", index);
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
      const formattedStartDate = formatDateString(newEnrichment.date_range[0]);
      const formattedEndDate = formatDateString(newEnrichment.date_range[1]);
      console.log("formattedStartDate", formattedStartDate);
      console.log("formattedEndDate", formattedEndDate);
      // If there are validation errors, mark as invalid
      if (newEnrichment.validationErrors) {
        allEnrichments.push({
          ...newEnrichment,
          date_range: [formattedStartDate, formattedEndDate],
          status: "invalid",
          id: `new-${index}`,
        });
        return;
      }
      const existingEnrichmentIndex = origionalEnrichments.findIndex(
        (enrichment) =>
          enrichment.date_range[0] === formattedStartDate &&
          enrichment.date_range[1] === formattedEndDate &&
          enrichment.dimension === newEnrichment.dimension &&
          enrichment.value === newEnrichment.value &&
          enrichment.enrichment_type === newEnrichment.enrichment_type &&
          (enrichment.enrichment_type !== "uplift" ||
            enrichment.enrichment_value === newEnrichment.enrichment_value) &&
          !enrichment.used
      );

      if (existingEnrichmentIndex !== -1) {
        console.log("Existing Enrichment");
        console.log("Existing Enrichment Index", existingEnrichmentIndex);
        origionalEnrichments[existingEnrichmentIndex].used = true;
        allEnrichments.push({
          ...newEnrichment,
          date_range: [formattedStartDate, formattedEndDate],
          status: "existing",
          id: `existing-${index}`, // Add a unique ID to distinguish between duplicates
        });
      } else {
        // Check if this is a modification of an existing enrichment (only for uplift type)
        const modifiedEnrichmentIndex = origionalEnrichments.findIndex(
          (enrichment) =>
            enrichment.date_range[0] === formattedStartDate &&
            enrichment.date_range[1] === formattedEndDate &&
            enrichment.dimension === newEnrichment.dimension &&
            enrichment.value === newEnrichment.value &&
            enrichment.enrichment_type === newEnrichment.enrichment_type &&
            enrichment.enrichment_type === "uplift" &&
            enrichment.enrichment_value !== newEnrichment.enrichment_value &&
            !enrichment.used
        );

        if (modifiedEnrichmentIndex !== -1) {
          // It's a modification of an existing uplift enrichment

          console.log("Modified Enrichment");
          console.log("Modified Enrichment Index", modifiedEnrichmentIndex);
          origionalEnrichments[modifiedEnrichmentIndex].used = true;
          allEnrichments.push({
            ...newEnrichment,
            date_range: [formattedStartDate, formattedEndDate],
            status: "modified",
            originalValue:
              origionalEnrichments[modifiedEnrichmentIndex].enrichment_value,
            approved: false,
          });
        } else {
          console.log("New Enrichment");
          console.log("New Enrichment Index", index);

          allEnrichments.push({
            ...newEnrichment,
            date_range: [formattedStartDate, formattedEndDate],
            status: "new",
            id: `new-${index}`, // Add a unique ID to distinguish between duplicates
          });
        }
      }
    });

    return allEnrichments;
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

  const parseCSV = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        try {
          // Check if CSV has the correct columns
          const csvHeaders = result.data[0];
          const expectedHeaders = columns;

          // Check if headers match
          const headersMatch = expectedHeaders.every(
            (header, index) => csvHeaders[index] === header
          );

          if (!headersMatch) {
            toast.error(
              "CSV columns don't match the expected format. Please ensure your file has the following columns in order: " +
                expectedHeaders.join(", ")
            );
            setScanning(false);
            return;
          }

          // Validate date format in all rows
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          const invalidDateRows = result.data.slice(1).filter((row, index) => {
            const startDate = row[2];
            const endDate = row[3];
            return !dateRegex.test(startDate.trim()) || !dateRegex.test(endDate.trim());
          });

          if (invalidDateRows.length > 0) {
            toast.error(
              "Invalid date format detected. All dates must be in YYYY-MM-DD format (e.g., 2024-01-31)"
            );
            setScanning(false);
            return;
          }

          // Process each row with validation
          const parsedEnrichments = result.data
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

              // Validate Dates
              const startDate = row[2];
              const endDate = row[3];

              // Check if dates are valid
              const isValidStartDate =
                startDate && !isNaN(new Date(startDate).getTime());
              const isValidEndDate =
                endDate && !isNaN(new Date(endDate).getTime());

              if (!isValidStartDate) {
                validationErrors.startDate = "Invalid start date";
              }

              if (!isValidEndDate) {
                validationErrors.endDate = "Invalid end date";
              }

              // Check if end date is after start date
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

              // Validate Type
              const enrichmentType = row[4];
              if (!types.includes(enrichmentType)) {
                validationErrors.type = "Invalid enrichment type";
              }

              // Validate Percentage
              const percentage = row[5];
              if (enrichmentType === "uplift") {
                if (
                  percentage === null ||
                  percentage === undefined ||
                  percentage === ""
                ) {
                  validationErrors.percentage =
                    "Percentage is required for uplift type";
                } else if (isNaN(parseFloat(percentage))) {
                  validationErrors.percentage = "Percentage must be a number";
                }
              }

              // Format the enrichment object with validation errors
              return {
                dimension,
                value,
                date_range: [startDate, endDate],
                enrichment_type: enrichmentType,
                enrichment_value:
                  enrichmentType === "uplift"
                    ? percentage
                      ? isNaN(parseFloat(percentage))
                        ? percentage
                        : parseFloat(percentage)
                      : null
                    : null,
                validationErrors:
                  Object.keys(validationErrors).length > 0
                    ? validationErrors
                    : null,
                /* rowIndex: rowIndex + 2, // Add 2 to account for 0-based index and header row */
              };
            })
            .filter(
              (enrichment) => enrichment.dimension && enrichment.date_range[0]
            );
          console.log("parsedEnrichments", parsedEnrichments);
          const processed = processEnrichments(parsedEnrichments);
          console.log("processed", processed);
          setFinalEnrichments(processed);

          const newCount = processed.filter((e) => e.status === "new").length;
          const modifiedCount = processed.filter(
            (e) => e.status === "modified"
          ).length;
          const invalidCount = processed.filter(
            (e) => e.validationErrors
          ).length;

          if (newCount === 0 && modifiedCount === 0 && invalidCount === 0) {
            toast.info("No new or modified enrichments found");
          } else {
            let message = "";
            if (newCount > 0) message += `${newCount} new`;
            if (modifiedCount > 0)
              message += `${message ? ", " : ""}${modifiedCount} modified`;
            if (invalidCount > 0)
              message += `${message ? ", " : ""}${invalidCount} invalid`;
            message += ` enrichment${
              newCount + modifiedCount + invalidCount !== 1 ? "s" : ""
            }`;
            toast.success(`Found ${message}`);
          }

          setScanning(false);
        } catch (error) {
          console.error("Error parsing enrichments:", error);
          toast.error("Error parsing enrichments from CSV");
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "text/csv") {
        setScanning(true);
        setSelectedFile(file);
        parseCSV(file);
      } else {
        toast.error("Please select a CSV file");
        setSelectedFile(null);
        event.target.value = "";
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setScanning(true);
      setSelectedFile(file);
      parseCSV(file);
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
    setFinalEnrichments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApprove = () => {
    // Check if all modified enrichments are approved
    const hasUnapprovedModifications = finalEnrichments.some(
      (e) => e.status === "modified" && !e.approved
    );

    if (hasUnapprovedModifications) {
      toast.error("Please approve all modifications before proceeding");
      return;
    }

    // Filter out the status and other temporary properties
    console.log("finalEnrichments", finalEnrichments);
    const cleanedEnrichments = finalEnrichments
      .filter(
        (enrichment) => enrichment.status !== "invalid" // Always filter out invalid enrichments
      )
      .map(
        ({
          status,
          originalValue,
          approved,
          id,
          validationErrors,
          ...enrichment
        }) => {
          // Parse and format dates that are in DD-MM-YY format
          const formatDateIfNeeded = (dateStr) => {
            if (!dateStr) return dateStr;
            return formatDate(dateStr);
          };

          return {
            ...enrichment,
            date_range: [
              formatDateIfNeeded(enrichment.date_range[0]),
              formatDateIfNeeded(enrichment.date_range[1]),
            ],
          };
        }
      );
    console.log("cleanedEnrichments", cleanedEnrichments);
    onEnrichmentsUpdate(cleanedEnrichments);
    handleClose();
    handleRemoveFile();
    toast.success("Enrichments updated successfully");
  };

  const toggleIgnoreInvalidEnrichment = (enrichmentId) => {
    if (ignoredInvalidEnrichments.includes(enrichmentId)) {
      setIgnoredInvalidEnrichments(
        ignoredInvalidEnrichments.filter((id) => id !== enrichmentId)
      );
    } else {
      setIgnoredInvalidEnrichments([
        ...ignoredInvalidEnrichments,
        enrichmentId,
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

  const renderEnrichmentsTable = () => {
    if (!selectedFile || !finalEnrichments.length) return null;

    // Check if there are any invalid enrichments
    const hasInvalidEnrichments = finalEnrichments.some(
      (e) => e.status === "invalid"
    );

    // Check if all invalid enrichments are ignored
    const allInvalidEnrichmentsIgnored = finalEnrichments.every(
      (e) => e.status !== "invalid" || ignoredInvalidEnrichments.includes(e.id)
    );

    // Check if there are any modified enrichments
    const hasModifiedEnrichments = finalEnrichments.some(
      (e) => e.status === "modified"
    );

    // Check if all modified enrichments are approved
    const allModifiedEnrichmentsApproved = finalEnrichments.every(
      (e) => e.status !== "modified" || e.approved
    );

    // Function to toggle ignore all invalid enrichments
    const handleIgnoreAllInvalid = () => {
      if (allInvalidEnrichmentsIgnored) {
        // If all are ignored, unignore them
        const invalidEnrichmentIds = finalEnrichments
          .filter((e) => e.status === "invalid")
          .map((e) => e.id);
        setIgnoredInvalidEnrichments(
          ignoredInvalidEnrichments.filter(
            (id) => !invalidEnrichmentIds.includes(id)
          )
        );
      } else {
        // If not all are ignored, ignore them all
        const invalidEnrichmentIds = finalEnrichments
          .filter((e) => e.status === "invalid")
          .map((e) => e.id);
        setIgnoredInvalidEnrichments([
          ...ignoredInvalidEnrichments,
          ...invalidEnrichmentIds,
        ]);
      }
    };

    // Function to toggle approve all modified enrichments
    const handleApproveAllModified = () => {
      const updatedEnrichments = finalEnrichments.map((enrichment) => {
        if (enrichment.status === "modified") {
          return { ...enrichment, approved: !allModifiedEnrichmentsApproved };
        }
        return enrichment;
      });
      setFinalEnrichments(updatedEnrichments);
    };

    return (
      <Box sx={{ mt: 0 }}>
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
              finalEnrichments.filter((e) => e.status === "modified").length > 0
                ? "warning"
                : finalEnrichments.filter((e) => e.status === "invalid")
                    .length > 0
                ? "error"
                : "info"
            }
            sx={{ flex: 1, display: "flex" }}
          >
            Found {finalEnrichments.filter((e) => e.status === "new").length}{" "}
            new and{" "}
            {finalEnrichments.filter((e) => e.status === "modified").length}{" "}
            modified enrichment
            {finalEnrichments.filter((e) => e.status === "modified").length !==
            1
              ? "s"
              : ""}
            {finalEnrichments.filter((e) => e.status === "invalid").length >
              0 && (
              <>
                {" "}
                and{" "}
                {
                  finalEnrichments.filter((e) => e.status === "invalid").length
                }{" "}
                invalid enrichment
                {finalEnrichments.filter((e) => e.status === "invalid")
                  .length !== 1
                  ? "s"
                  : ""}
                {finalEnrichments.every(
                  (e) =>
                    e.status !== "invalid" ||
                    ignoredInvalidEnrichments.includes(e.id)
                ) && <> (all ignored)</>}
              </>
            )}
          </Alert>
          <Stack direction="row" spacing={1}>
            {hasModifiedEnrichments && (
              <CustomButton
                title={
                  allModifiedEnrichmentsApproved
                    ? "Unapprove All Modifications"
                    : "Approve All Modifications"
                }
                onClick={handleApproveAllModified}
                outlined
                size="small"
              />
            )}
            {hasInvalidEnrichments && (
              <CustomButton
                title={
                  allInvalidEnrichmentsIgnored
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
              maxHeight: "400px", // Set a fixed height to enable scrolling
            }}
          >
            <Table stickyHeader>
              {" "}
              {/* Make the header sticky */}
              <TableHead>
                <TableRow>
                  <StyledTableCell className="header" sx={{ width: "5%" }}>
                    Sr.
                  </StyledTableCell>
                  <StyledTableCell className="header" sx={{ width: "18%" }}>
                    Dimension
                  </StyledTableCell>
                  <StyledTableCell className="header" sx={{ width: "18%" }}>
                    Value
                  </StyledTableCell>
                  <StyledTableCell className="header" sx={{ width: "13%" }}>
                    Start Date
                  </StyledTableCell>
                  <StyledTableCell className="header" sx={{ width: "13%" }}>
                    End Date
                  </StyledTableCell>
                  <StyledTableCell className="header" sx={{ width: "13%" }}>
                    Type
                  </StyledTableCell>
                  <StyledTableCell className="header" sx={{ width: "10%" }}>
                    Percentage
                  </StyledTableCell>
                  <StyledTableCell className="header" sx={{ width: "8%" }}>
                    Status
                  </StyledTableCell>
                  <StyledTableCell
                    className="header"
                    sx={{ width: "2%" }}
                  ></StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {finalEnrichments.map((enrichment, index) => {
                  const isIgnored =
                    enrichment.status === "invalid" &&
                    ignoredInvalidEnrichments.includes(enrichment.id);

                  return (
                    <TableRow
                      key={enrichment.id || index}
                      sx={{
                        backgroundColor:
                          enrichment.status === "modified"
                            ? "#FFFDE7"
                            : enrichment.status === "new"
                            ? "#F6FEF9"
                            : enrichment.status === "invalid"
                            ? ignoredInvalidEnrichments.includes(enrichment.id)
                              ? "#F9FAFB"
                              : "#FEF3F2"
                            : "#FFFFFF",
                        "&:hover": {
                          backgroundColor:
                            enrichment.status === "modified"
                              ? "#FFF9C490"
                              : enrichment.status === "new"
                              ? "#ECFDF3"
                              : enrichment.status === "invalid"
                              ? ignoredInvalidEnrichments.includes(
                                  enrichment.id
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
                      <StyledTableCell>{index + 1}</StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: enrichment.validationErrors?.dimension
                                ? "error.main"
                                : "inherit",
                              maxWidth: "calc(100% - 24px)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {enrichment.dimension === "None"
                              ? "All"
                              : convertDimension(enrichment.dimension)}
                          </Typography>
                          {enrichment.validationErrors?.dimension && (
                            <CustomTooltip
                              title={enrichment.validationErrors.dimension}
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: enrichment.validationErrors?.value
                                ? "error.main"
                                : "inherit",
                              maxWidth: "calc(100% - 24px)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {enrichment.value === "None"
                              ? "All"
                              : enrichment.value}
                          </Typography>
                          {enrichment.validationErrors?.value && (
                            <CustomTooltip
                              title={enrichment.validationErrors.value}
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: enrichment.validationErrors?.startDate
                                ? "error.main"
                                : "inherit",
                              maxWidth: "calc(100% - 24px)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatKey(formatDate(enrichment.date_range[0]))}
                          </Typography>
                          {enrichment.validationErrors?.startDate && (
                            <CustomTooltip
                              title={enrichment.validationErrors.startDate}
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: enrichment.validationErrors?.endDate
                                ? "error.main"
                                : "inherit",
                              maxWidth: "calc(100% - 24px)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatKey(formatDate(enrichment.date_range[1]))}
                          </Typography>
                          {enrichment.validationErrors?.endDate && (
                            <CustomTooltip
                              title={enrichment.validationErrors.endDate}
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            sx={{
                              color: enrichment.validationErrors?.type
                                ? "error.main"
                                : "inherit",
                              maxWidth: "calc(100% - 24px)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {enrichment.enrichment_type}
                          </Typography>
                          {enrichment.validationErrors?.type && (
                            <CustomTooltip
                              title={enrichment.validationErrors.type}
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
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {enrichment.enrichment_value !== null ? (
                            enrichment.status === "modified" ? (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  maxWidth: "calc(100% - 24px)",
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
                                  {enrichment.originalValue}%
                                </span>
                                <span>→</span>
                                <span
                                  style={{
                                    backgroundColor: "#e8f5e9",
                                  }}
                                >
                                  {enrichment.enrichment_value}%
                                </span>
                              </Typography>
                            ) : (
                              <Typography
                                sx={{
                                  color: enrichment.validationErrors?.percentage
                                    ? "error.main"
                                    : "inherit",
                                  maxWidth: "calc(100% - 24px)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {enrichment.enrichment_value}
                                {enrichment.validationErrors?.percentage
                                  ? ""
                                  : "%"}
                              </Typography>
                            )
                          ) : (
                            "-"
                          )}
                          {enrichment.validationErrors?.percentage && (
                            <CustomTooltip
                              title={enrichment.validationErrors.percentage}
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
                              enrichment.status === "modified"
                                ? "#B45F18"
                                : enrichment.status === "new"
                                ? "#027A48"
                                : enrichment.status === "invalid"
                                ? "#B42318"
                                : "black",
                            backgroundColor:
                              enrichment.status === "modified"
                                ? "#FFF9C4"
                                : enrichment.status === "new"
                                ? "#ECFDF3"
                                : enrichment.status === "invalid"
                                ? ignoredInvalidEnrichments.includes(
                                    enrichment.id
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
                          {enrichment.status === "modified"
                            ? "Modified"
                            : enrichment.status === "new"
                            ? "New"
                            : enrichment.status === "invalid"
                            ? ignoredInvalidEnrichments.includes(enrichment.id)
                              ? "Ignored"
                              : "Invalid"
                            : "Existing"}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell>
                        {enrichment.status === "modified" ? (
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              onClick={() => {
                                const newEnrichments = [...finalEnrichments];
                                newEnrichments[index] = {
                                  ...enrichment,
                                  approved: !enrichment.approved,
                                };
                                setFinalEnrichments(newEnrichments);
                              }}
                              size="medium"
                              sx={{
                                color: enrichment.approved
                                  ? "#027A48"
                                  : "#344054",
                                padding: 0,
                              }}
                            >
                              {enrichment.approved ? (
                                <CheckCircleIcon fontSize="medium" />
                              ) : (
                                <CheckCircleOutlineIcon fontSize="medium" />
                              )}
                            </IconButton>
                          </Stack>
                        ) : enrichment.status === "invalid" ? (
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              onClick={() =>
                                toggleIgnoreInvalidEnrichment(enrichment.id)
                              }
                              size="medium"
                              sx={{
                                color: ignoredInvalidEnrichments.includes(
                                  enrichment.id
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
          Upload Enrichments
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
                <Alert severity="info">Scanning file for enrichments...</Alert>
              ) : (
                <>{renderEnrichmentsTable()}</>
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
                        • End date {">"} Start date
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • Valid Type: {types.join(", ")}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#475467",
                        }}
                      >
                        • Percentage: numeric
                      </Typography>
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
                        // Create CSV content
                        const csvContent = [
                          columns.join(","),
                          ...types.map((type) => {
                            const dimension =
                              Object.keys(dimensionFilterData)[1];
                            const value = dimensionFilterData[dimension][0];
                            return [
                              dimension,
                              value,
                              " 2024-01-01", // Add space to prevent Excel auto-formatting
                              " 2024-12-31", // Add space to prevent Excel auto-formatting
                              type,
                              type === "uplift" ? "10" : "",
                            ].join(",");
                          }),
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
                        {types.map((type, index) => {
                          const dimension = Object.keys(dimensionFilterData)[1];
                          const value = dimensionFilterData[dimension][0];
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    color: "#475467",
                                  }}
                                >
                                  {dimension}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    color: "#475467",
                                  }}
                                >
                                  {value}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    color: "#475467",
                                  }}
                                >
                                  2024-01-01
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    color: "#475467",
                                  }}
                                >
                                  2024-12-31
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    color: "#475467",
                                  }}
                                >
                                  {type}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontWeight: 500,
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    color: "#475467",
                                  }}
                                >
                                  {type === "uplift" ? "10" : ""}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
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
          <CustomButton title="Apply Enrichments" disabled={true} />
        ) : finalEnrichments.some(
            (e) =>
              e.status === "invalid" &&
              !ignoredInvalidEnrichments.includes(e.id)
          ) ? (
          <CustomTooltip
            title="Please ignore all invalid enrichments before proceeding."
            arrow
          >
            <span>
              <CustomButton title="Apply Enrichments" disabled={true} />
            </span>
          </CustomTooltip>
        ) : finalEnrichments.some(
            (e) => e.status === "modified" && !e.approved
          ) ? (
          <CustomTooltip
            title="Please approve all modified enrichments before proceeding."
            arrow
          >
            <span>
              <CustomButton title="Apply Enrichments" disabled={true} />
            </span>
          </CustomTooltip>
        ) : (
          <CustomButton onClick={handleApprove} title="Apply Enrichments" />
        )}
      </DialogActions>
    </BootstrapDialog>
  );
};

export default UploadEnrichments;
