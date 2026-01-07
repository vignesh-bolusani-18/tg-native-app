"use client";

import {
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { useMemo } from "react";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import useConfig from "../../../../hooks/useConfig";
import { useEffect } from "react";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter";
import { useState } from "react";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FullscreenOutlinedIcon from "@mui/icons-material/FullscreenOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import UploadEnrichments from "../../../../components/UploadEnrichments";
import EnrichmentDetailsDialog from "../../../../components/EnrichmentDetailsDialog";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import UploadEnrichmentsGuide from "../../../../components/UploadEnrichmentsGuide";
import useDashboard from "../../../../hooks/useDashboard";
import AddIcon from "@mui/icons-material/Add";

const EnrichmentBox = ({
  currentDimension,
  currentValue,
  dimensionFilterData,
}) => {
  const {
    enrichment,
    setEnrichmentDimension,
    setEnrichmentValue,
    addEnrichment,
    enrichment_bydate,
    removeEnrichmentByIndex,
    setEnrichmentStartDate,
    setEnrichmentEndDate,
    setEnrichmentEnrichmentValue,
    setEnrichment_bydate,
  } = useConfig();

  const { setCurrentValue } = useDashboard();
  const [refresh, setRefresh] = useState(true);
  const [uploadEnrichmentsOpen, setUploadEnrichmentsOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [uploadEnrichmentsGuideOpen, setUploadEnrichmentsGuideOpen] =
    useState(false);

  // Get available values for the current dimension
  const availableValues = useMemo(() => {
    if (!dimensionFilterData || currentDimension === "all") {
      return [];
    }

    const dimensionData = dimensionFilterData[currentDimension];
    return dimensionData ? dimensionData : [];
  }, [dimensionFilterData, currentDimension]);

  // Get current value index
  const currentValueIndex = useMemo(() => {
    if (currentValue === "all" || availableValues.length === 0) {
      return -1;
    }
    return availableValues.indexOf(currentValue);
  }, [availableValues, currentValue]);

  // Navigation handlers
  const handlePreviousValue = () => {
    if (availableValues.length === 0 || currentValueIndex <= 0) return;

    const previousValue = availableValues[currentValueIndex - 1];
    setCurrentValue(previousValue);
  };

  const handleNextValue = () => {
    if (
      availableValues.length === 0 ||
      currentValueIndex >= availableValues.length - 1
    )
      return;

    const nextValue = availableValues[currentValueIndex + 1];
    setCurrentValue(nextValue);
  };

  // Check if navigation buttons should be disabled
  const isPreviousDisabled =
    currentDimension === "all" ||
    availableValues.length === 0 ||
    currentValueIndex <= 0;
  const isNextDisabled =
    currentDimension === "all" ||
    availableValues.length === 0 ||
    currentValueIndex >= availableValues.length - 1;

  function formatDate(inputDate) {
    // Parse the input string as a Date object
    const date = new Date(inputDate);

    // Specify options for formatting
    const options = { year: "numeric", month: "long", day: "2-digit" };

    // Format the date as "MMMM, dd, yyyy"
    return date.toLocaleDateString("en-US", options);
  }

  const convertToCSV = (data) => {
    // Add headers
    const columns = [
      "Dimension",
      "Value",
      "Start Date",
      "End Date",
      "Type",
      "Percentage",
    ];
    let csv = columns.join(",") + "\n";

    if (data.length === 0) return csv;

    // Add data rows
    data.forEach((row) => {
      // Replace any commas in the data with spaces to avoid CSV formatting issues
      const sanitizedRow = row.map((cell) => {
        const cellStr = String(cell);
        return cellStr.includes(",") ? `"${cellStr}"` : cellStr;
      });
      csv += sanitizedRow.join(",") + "\n";
    });

    return csv;
  };

  const csv_data = useMemo(() => {
    // First filter enrichments by type
    const firstEnrichment = enrichment_bydate[0];
    if (!firstEnrichment) return [];

    const currentType = firstEnrichment.enrichment_type;

    const json_data = enrichment_bydate
      /* .filter((enrichment) => enrichment.enrichment_type === currentType) */
      .map((enrichment) => {
        const baseRow = [
          enrichment.dimension === "None" ? "all" : enrichment.dimension,
          enrichment.value === "None" ? "all" : enrichment.value,
          enrichment.date_range[0],
          enrichment.date_range[1],
          enrichment.enrichment_type,
        ];

        // Only add percentage for uplift type
        if (enrichment.enrichment_type === "uplift") {
          baseRow.push(enrichment.enrichment_value);
        }

        return baseRow;
      });
    const csv_data = convertToCSV(json_data);
    return csv_data;
  }, [enrichment_bydate]);

  const downloadCSV = () => {
    // Create blob and download
    const blob = new Blob([csv_data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Enrichments.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (currentDimension === "all") {
      setEnrichmentDimension("None");
    } else {
      setEnrichmentDimension(currentDimension);
    }
  }, [currentDimension]);

  useEffect(() => {
    if (currentValue === "all") {
      setEnrichmentValue("None");
    } else {
      setEnrichmentValue(currentValue);
    }
  }, [currentValue]);

  const maxRange = 1000; // Maximum allowed count value
  const minRange = -1000;

  // Add this handler for enrichment updates
  const handleEnrichmentsUpdate = (updatedEnrichments) => {
    // Update the enrichments in your state/store
    setEnrichment_bydate(updatedEnrichments);
  };

  return (
    <Stack
      sx={{
        borderRadius: "12px",
        padding: "1rem",
        gap: "0.75rem",
        backgroundColor: "#FFFFFF",
        overflow: "scroll",
        position: "relative",
        height: "530px",
      }}
    >
      {/* Header - Applied scenario-builder styling */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid #F2F4F7",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "0.875rem",
            fontWeight: 600,
            lineHeight: "1.25rem",
            color: "#101828",
          }}
        >
          Enrichment Panel
        </Typography>
        <Chip
          label={`${enrichment_bydate.length} Active`}
          size="small"
          sx={{
            backgroundColor: "#F0FDF4",
            color: "#065F46",
            fontSize: "0.625rem",
            fontWeight: 500,
            height: "20px",
            border: "1px solid #10B981",
          }}
        />
      </Box>

      {/* Current Context Card - Removed background and padding */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#101828",
              marginBottom: "0.125rem",
              lineHeight: 1.2,
            }}
          >
            {currentDimension}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "0.6875rem",
              color: "#475467",
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            {currentValue}
          </Typography>
        </Box>
      </Box>

      {/* Enrichment Form - Applied scenario-builder styling */}
      <Stack spacing={0.5}>
        {/* Date Range Row */}
        <Box
          sx={{
            display: "flex",
            gap: 0.75,
            width: "100%",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <CustomDatePicker
              showLabel
              label="Start Date"
              path="kwargs.date_range[0]"
              target="enrichment"
              key={`start-date-${refresh}`}
              labelSx={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter",
                marginBottom: "0.25rem",
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "35px",
                  fontSize: "0.6875rem",
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.6875rem",
                  padding: "6px 8px",
                },
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <CustomDatePicker
              showLabel
              label="End Date"
              path="kwargs.date_range[1]"
              target="enrichment"
              key={`end-date-${refresh}`}
              labelSx={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter",
                marginBottom: "0.25rem",
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "35px",
                  fontSize: "0.6875rem",
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.6875rem",
                  padding: "6px 8px",
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 0.75,
            width: "100%",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <CustomAutocomplete
              showLabel
              placeholder="Select enrichment type"
              label="Type"
              values={[
                "uplift",
                "upper_bound",
                "lower_bound",
                "offset",
                "P10",
                "P20",
                "P30",
                "P40",
                "P50",
                "P60",
                "P70",
                "P80",
                "P90",
                "P99",
              ]}
              isMultiSelect={false}
              path="kwargs.enrichment_type"
              target="enrichment"
              disableClearable
              key={`value-${refresh}`}
              labelSx={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter",
                marginBottom: "0.25rem",
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "35px",
                  fontSize: "0.6875rem",
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.6875rem",
                  padding: "6px 8px",
                },
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <CustomCounter
              disabled={enrichment.kwargs.enrichment_type !== "uplift"}
              showLabel
              placeholder="Select enrichment value"
              label="Percentage"
              path="kwargs.enrichment_value"
              target={"enrichment"}
              maxRange={maxRange}
              minRange={minRange}
              key={`value-${refresh}-${enrichment.kwargs.enrichment_type}`}
              labelSx={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter",
                marginBottom: "0.25rem",
              }}
              containerSx={{
                height: "35px",
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "32px",
                  fontSize: "0.6875rem",
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.6875rem",
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.625,
            padding: "2px 0",
            width: "100%",
          }}
        >
          <Button
            onClick={handlePreviousValue}
            disabled={isPreviousDisabled}
            variant="outlined"
            startIcon={<ChevronLeftIcon sx={{ fontSize: "14px" }} />}
            sx={{
              height: "32px",
              fontSize: "0.625rem",
              fontWeight: 500,
              borderRadius: "6px",
              fontFamily: "Inter",
              textTransform: "none",
              borderColor: "#D0D5DD",
              color: "#344054",
              backgroundColor: "white",
              padding: "0 8px",
              "&:hover": {
                backgroundColor: "#F9FAFB",
                borderColor: "#10B981",
                transform: "translateY(-1px)",
                boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
              },
              "&.Mui-disabled": {
                opacity: 0.5,
                backgroundColor: "#F9FAFB",
                color: "#344054",
              },
              transition: "all 0.15s ease-in-out",
            }}
          >
            Prev
          </Button>

          <Button
            onClick={async () => {
              await addEnrichment();
              setEnrichmentEnrichmentValue(0);
              if (currentDimension !== "all") {
                setEnrichmentDimension(currentDimension);
                setEnrichmentValue(currentValue);
              } else {
                setEnrichmentDimension("None");
                setEnrichmentValue("None");
              }
              setRefresh(!refresh);
            }}
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: "14px" }} />}
            sx={{
              backgroundColor: "#10B981",
              color: "white",
              fontFamily: "Inter",
              fontSize: "0.625rem",
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "6px",
              boxShadow: "0px 1px 2px rgba(16, 185, 129, 0.2)",
              height: "32px",
              flex: 1,
              padding: "0 10px",
              "&:hover": {
                backgroundColor: "#059669",
                boxShadow: "0px 2px 4px rgba(16, 185, 129, 0.3)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.15s ease-in-out",
            }}
          >
            Add Enrichment
          </Button>

          <Button
            onClick={handleNextValue}
            disabled={isNextDisabled}
            variant="contained"
            endIcon={<ChevronRightIcon sx={{ fontSize: "14px" }} />}
            sx={{
              height: "32px",
              fontSize: "0.625rem",
              fontWeight: 500,
              borderRadius: "6px",
              fontFamily: "Inter",
              textTransform: "none",
              backgroundColor: "#10B981",
              color: "white",
              boxShadow: "0px 1px 2px rgba(16, 185, 129, 0.2)",
              padding: "0 8px",
              "&:hover": {
                backgroundColor: "#0EA371",
                boxShadow: "0px 2px 4px rgba(16, 185, 129, 0.3)",
                transform: "translateY(-1px)",
              },
              "&.Mui-disabled": {
                opacity: 0.5,
                backgroundColor: "#F9FAFB",
                color: "#344054",
              },
              transition: "all 0.15s ease-in-out",
            }}
          >
            Next
          </Button>
        </Box>
      </Stack>

      {/* Active Enrichments - Made enrichments section scrollable */}
      <Stack spacing={0.5} flex={1} minHeight={0}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#101828",
              paddingTop: "0.25rem",
            }}
          >
            Enrichments
          </Typography>
          <Stack direction={"row"} alignItems={"center"} spacing={0.7}>
            <IconButton
              onClick={() => setUploadEnrichmentsGuideOpen(true)}
              sx={{
                padding: "2px",
                color: "#6B7280",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  color: "#10B981",
                },
              }}
            >
              <TipsAndUpdatesIcon sx={{ fontSize: "16px" }} />
            </IconButton>
            <IconButton
              onClick={downloadCSV}
              sx={{
                padding: "2px",
                color: "#6B7280",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  color: "#10B981",
                },
              }}
            >
              <FileDownloadOutlinedIcon sx={{ fontSize: "16px" }} />
            </IconButton>
            <IconButton
              onClick={() => setUploadEnrichmentsOpen(true)}
              sx={{
                padding: "2px",
                color: "#6B7280",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  color: "#10B981",
                },
              }}
            >
              <FileUploadOutlinedIcon sx={{ fontSize: "16px" }} />
            </IconButton>
            <IconButton
              onClick={() => setDetailsDialogOpen(true)}
              sx={{
                padding: "2px",
                color: "#6B7280",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  color: "#10B981",
                },
              }}
            >
              <FullscreenOutlinedIcon sx={{ fontSize: "16px" }} />
            </IconButton>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            backgroundColor: "#FAFAFA",
            borderRadius: "6px",
            border: "1px solid #EAECF0",
            padding: "0.375rem",
            minHeight: "60px",
            maxHeight: "200px",
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#F9FAFB",
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#D0D5DD",
              borderRadius: "2px",
              "&:hover": {
                backgroundColor: "#98A2B3",
              },
            },
          }}
        >
          {enrichment_bydate.length > 0 ? (
            <Stack spacing={0.375}>
              {enrichment_bydate.map((enrichment, index) => {
                return (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #EAECF0",
                      borderRadius: "6px",
                      padding: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      "&:hover": {
                        borderColor: "#10B981",
                        transform: "translateX(1px)",
                        boxShadow: "0px 1px 3px -1px rgba(16, 185, 129, 0.15)",
                      },
                      transition: "all 0.15s ease-in-out",
                    }}
                  >
                    <Stack spacing={0.25} flex={1}>
                      <Typography
                        sx={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          color: "#344054",
                          lineHeight: 1.2,
                        }}
                      >
                        {enrichment.dimension === "None"
                          ? "All"
                          : `${
                              enrichment.dimension === "ts_id"
                                ? "Forecast_Granularity"
                                : enrichment.dimension
                            } - ${enrichment.value}`}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.5625rem",
                            color: "#6B7280",
                            fontWeight: 500,
                          }}
                        >
                          {enrichment.enrichment_type === "uplift"
                            ? `${enrichment.enrichment_type} by ${enrichment.enrichment_value}%`
                            : `Updated with: ${enrichment.enrichment_type}`}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.5625rem",
                            color: "#9CA3AF",
                            fontWeight: 400,
                          }}
                        >
                          {formatDate(enrichment.date_range[0])} -{" "}
                          {formatDate(enrichment.date_range[1])}
                        </Typography>
                      </Box>
                    </Stack>

                    <IconButton
                      onClick={() => removeEnrichmentByIndex(index)}
                      size="small"
                      sx={{
                        padding: "2px",
                        color: "#6B7280",
                        border: "1px solid #E5E7EB",
                        borderRadius: "4px",
                        marginLeft: "0.375rem",
                        width: "20px",
                        height: "20px",
                        "&:hover": {
                          backgroundColor: "#FEF2F2",
                          borderColor: "#FECACA",
                          color: "#DC2626",
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.15s ease-in-out",
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>×</span>
                    </IconButton>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ height: "100%", minHeight: "60px" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: "#9CA3AF",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  No enrichments added yet
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.5625rem",
                    fontWeight: 400,
                    color: "#9CA3AF",
                    textAlign: "center",
                  }}
                >
                  Add enrichments to enhance your data
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>

      {/* Add the UploadEnrichments dialog */}
      <UploadEnrichments
        open={uploadEnrichmentsOpen}
        handleClose={() => setUploadEnrichmentsOpen(false)}
        currentEnrichments={enrichment_bydate}
        onEnrichmentsUpdate={handleEnrichmentsUpdate}
        dimensionFilterData={dimensionFilterData}
        types={[
          "uplift",
          "upper_bound",
          "lower_bound",
          "offset",
          "P10",
          "P20",
          "P30",
          "P40",
          "P50",
          "P60",
          "P70",
          "P80",
          "P90",
          "P99",
        ]}
        columns={[
          "Dimension",
          "Value",
          "Start Date",
          "End Date",
          "Type",
          "Percentage",
        ]}
      />

      {/* Add EnrichmentDetailsDialog */}
      <EnrichmentDetailsDialog
        open={detailsDialogOpen}
        handleClose={() => setDetailsDialogOpen(false)}
        enrichments={enrichment_bydate}
      />
      <UploadEnrichmentsGuide
        open={uploadEnrichmentsGuideOpen}
        handleClose={() => setUploadEnrichmentsGuideOpen(false)}
        columns={[
          "Dimension",
          "Value",
          "Start Date",
          "End Date",
          "Type",
          "Percentage",
        ]}
        dimensionFilterData={dimensionFilterData}
        types={[
          "uplift",
          "upper_bound",
          "lower_bound",
          "offset",
          "P10",
          "P20",
          "P30",
          "P40",
          "P50",
          "P60",
          "P70",
          "P80",
          "P90",
          "P99",
        ]}
      />
    </Stack>
  );
};

export default EnrichmentBox;
