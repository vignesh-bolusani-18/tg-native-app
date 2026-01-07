"use client";

import {
  Box,
  Chip,
  Stack,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
} from "@mui/material";
import { useMemo } from "react";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import useConfig from "../../../../../hooks/useConfig";
import { useEffect } from "react";
import CustomDatePicker from "../../../../../components/CustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../../components/CustomInputControls/CustomCounter";
import CustomButton from "../../../../../components/CustomButton";
import { useState } from "react";
import moment from "moment";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FullscreenOutlinedIcon from "@mui/icons-material/FullscreenOutlined";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import UploadAdjustments from "../../../../../components/UploadAdjustments";
import AdjustmentDetailsDialog from "../../../../../components/AdjustmentDetailsDialog";
import UploadAdjustmentsGuide from "../../../../../components/UploadAdjustmentsGuide";
import useDashboard from "../../../../../hooks/useDashboard";

const AdjustmentBox = ({
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
    adjust_data,
    operations,
    removePlannerAdjustmentByIndex,
    setAdjustmentDimension,
    setAdjustmentValue,
    addAdjustData,
    setAdjustmentAdjustValue,
    setAdjustmentStartDate,
    setAdjustment_bydate,
  } = useConfig();

  const { setCurrentValue } = useDashboard();

  const [uploadAdjustmentsOpen, setUploadAdjustmentsOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [uploadAdjustmentsGuideOpen, setUploadAdjustmentsGuideOpen] =
    useState(false);
  const [refresh, setRefresh] = useState(true);
  const [currentValueIndex, setCurrentValueIndex] = useState(0);

  // Get available values for the current dimension
  const availableValues = useMemo(() => {
    if (!dimensionFilterData || currentDimension === "all") {
      return [];
    }

    const dimensionValues = dimensionFilterData[currentDimension];
    return Array.isArray(dimensionValues) ? dimensionValues : [];
  }, [dimensionFilterData, currentDimension]);

  // Update current value index when currentValue changes
  useEffect(() => {
    if (availableValues.length > 0) {
      const index = availableValues.findIndex(
        (value) => value === currentValue
      );
      setCurrentValueIndex(index >= 0 ? index : 0);
    }
  }, [currentValue, availableValues]);

  const handlePrevValue = () => {
    if (currentValueIndex > 0) {
      const prevValue = availableValues[currentValueIndex - 1];
      setCurrentValue(prevValue);
    }
  };

  const handleNextValue = () => {
    if (currentValueIndex < availableValues.length - 1) {
      const nextValue = availableValues[currentValueIndex + 1];
      setCurrentValue(nextValue);
    }
  };

  const canNavigatePrev = currentValueIndex > 0 && currentDimension !== "all";
  const canNavigateNext =
    currentValueIndex < availableValues.length - 1 &&
    currentDimension !== "all";

  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const options = { year: "numeric", month: "long", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  }
  const columns = [
    "Dimension",
    "Value",
    "Type",
    "Start Date",
    "End Date",
    "Cut History Till",
    "Percentage",
    "# Value",
    "Time Steps",
    "Future/History",
  ];
  const convertToCSV = (data) => {
    let csv = columns.join(",") + "\n";
    if (data.length === 0) return csv;
    data.forEach((row) => {
      const sanitizedRow = row.map((cell) => {
        const cellStr = String(cell);
        return cellStr.includes(",") ? `"${cellStr}"` : cellStr;
      });
      csv += sanitizedRow.join(",") + "\n";
    });
    return csv;
  };
  const handleAdjustmentsUpdate = (updatedAdjustments) => {
    setAdjustment_bydate(updatedAdjustments);
  };
  const adjustments = useMemo(() => {
    if (!operations || operations.length === 0) return [];
    const startIndex =
      operations.length > 1 &&
      operations[1].operation === "new_product_forecasting"
        ? 2
        : 1;
    return operations
      .slice(startIndex)
      .filter((op) => op?.kwargs && Object.keys(op.kwargs).length > 0)
      .map((op) => op.kwargs);
  }, [operations]);
  const csv_data = useMemo(() => {
    const firstAdjustment = adjustments[0];
    if (!firstAdjustment) return [];
    const json_data = adjustments.map((adjustment) => {
      const baseRow = [
        adjustment.dimension === "None" ? "all" : adjustment.dimension,
        adjustment.value === "None" ? "all" : adjustment.value,
        adjustment.adjustment_type,
        adjustment.adjustment_type !== "cut_history"
          ? ` ${adjustment.date_range[0]}`
          : "",
        adjustment.adjustment_type !== "cut_history"
          ? ` ${adjustment.date_range[1]}`
          : "",
        adjustment.adjustment_type === "cut_history"
          ? ` ${adjustment.date_range[1]}`
          : "",
        !["replace_value", "uplift_by_value", "cut_history"].includes(
          adjustment.adjustment_type
        )
          ? adjustment.adjustment_value
          : "",
        ["replace_value", "uplift_by_value"].includes(
          adjustment.adjustment_type
        )
          ? adjustment.adjustment_value
          : "",
        adjustment.adjustment_type === "YoY" ? adjustment.time_steps : "",
        adjustment.adjustment_type === "YoY" ? adjustment.future_history : "",
      ];
      return baseRow;
    });
    const csv_data = convertToCSV(json_data);
    return csv_data;
  }, [adjustments]);

  const downloadCSV = () => {
    const blob = new Blob([csv_data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Adjustments.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    if (currentDimension === "all") {
      setAdjustmentDimension("None");
    } else {
      setAdjustmentDimension(currentDimension);
    }
  }, [currentDimension]);
  useEffect(() => {
    if (currentValue === "all") {
      setAdjustmentValue("None");
    } else {
      setAdjustmentValue(currentValue);
    }
  }, [currentValue]);
  const maxRange = 1000;
  const minRange = -1000;

  const metricTypeValues = [
    "uplift",
    "YoY",
    "cut_history",
    "stockout_correction",
    "replace_value",
    "uplift_by_value",
  ];

  const metricTypeDict = {
    uplift: "Uplift",
    YoY: "YoY",
    cut_history: "Cut History",
    stockout_correction: "Stockout Correction",
    replace_value: "Replace Value",
    uplift_by_value: "Uplift by Value",
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
          Planner Coding Panel
        </Typography>
        <Chip
          label={`${
            operations.filter((op) => op.operation === "adjust_data").length
          } Active`}
          size="small"
          sx={{
            backgroundColor: "#F0FDF4",
            color: "#065F46",
            fontSize: "0.625rem",
            fontWeight: 500,
            height: "18px",
            border: "1px solid #10B981",
          }}
        />
      </Box>

      <Card
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ padding: "0rem !important" }}>
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
        </CardContent>
      </Card>

      <Stack spacing={0.5}>
        {adjust_data.kwargs.adjustment_type !== "cut_history" ? (
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
                target="adjust"
                key={`start-date-${refresh}`}
                labelSx={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: "#374151",
                  fontFamily: "Inter",
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
                target="adjust"
                key={`end-date-${refresh}`}
                labelSx={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: "#374151",
                  fontFamily: "Inter",
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
        ) : (
          <CustomDatePicker
            showLabel
            label="Cut History Till"
            path="kwargs.date_range[1]"
            target="adjust"
            key={`end-date-${refresh}`}
            labelSx={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: "#374151",
              fontFamily: "Inter",
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
        )}

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
              placeholder="Select Adjustment type"
              label="Type"
              values={metricTypeValues}
              valuesDict={metricTypeDict}
              isMultiSelect={false}
              path="kwargs.adjustment_type"
              target="adjust"
              disableClearable
              key={`value-${refresh}`}
              labelSx={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter",
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
          {adjust_data.kwargs.adjustment_type !== "cut_history" && (
            <Box sx={{ flex: 1 }}>
              <CustomCounter
                showLabel
                placeholder="Select Adjust value"
                label="Percentage"
                path="kwargs.adjustment_value"
                target={"adjust"}
                maxRange={maxRange}
                minRange={minRange}
                key={`value-${refresh}-${adjust_data.kwargs.adjustment_type}`}
                labelSx={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: "#374151",
                  fontFamily: "Inter",
                }}
                containerSx={{
                  height: "35px",
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
          )}
        </Box>

        {adjust_data.kwargs.adjustment_type !== "uplift" &&
          adjust_data.kwargs.adjustment_type !== "cut_history" &&
          adjust_data.kwargs.adjustment_type !== "stockout_correction" &&
          adjust_data.kwargs.adjustment_type !== "replace_value" &&
          adjust_data.kwargs.adjustment_type !== "uplift_by_value" && (
            <Box
              sx={{
                display: "flex",
                gap: 0.75,
                width: "100%",
              }}
            >
              <Box sx={{ flex: 1 }}>
                <CustomCounter
                  showLabel
                  placeholder="Select Time Steps"
                  label="Time Steps"
                  path="kwargs.time_steps"
                  target={"adjust"}
                  maxRange={999}
                  minRange={0}
                  key={`timesteps-${refresh}-${adjust_data.kwargs.adjustment_type}`}
                  labelSx={{
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "#374151",
                    fontFamily: "Inter",
                  }}
                  containerSx={{
                    height: "35px",
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
                <CustomAutocomplete
                  showLabel
                  placeholder="Select Reference Data"
                  label="Reference"
                  values={["future", "history"]}
                  isMultiSelect={false}
                  path="kwargs.future_history"
                  target="adjust"
                  disableClearable
                  key={`reference-${refresh}`}
                  labelSx={{
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "#374151",
                    fontFamily: "Inter",
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
          )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.625,
            padding: "2px 0",
            width: "100%",
            marginTop: "15px",
          }}
        >
          <Button
            onClick={handlePrevValue}
            disabled={!canNavigatePrev}
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
              if (adjust_data.kwargs.adjustment_type === "cut_history") {
                setAdjustmentStartDate(
                  moment.utc("1990-01-01", "YYYY-MM-DD").format("YYYY-MM-DD")
                );
              }
              await addAdjustData();
              setAdjustmentAdjustValue(0);
              if (currentDimension !== "all") {
                setAdjustmentDimension(currentDimension);
                setAdjustmentValue(currentValue);
              } else {
                setAdjustmentDimension("None");
                setAdjustmentValue("None");
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
            Add Operation
          </Button>

          <Button
            onClick={handleNextValue}
            disabled={!canNavigateNext}
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
            Active Operations
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              onClick={() => setUploadAdjustmentsGuideOpen(true)}
              size="small"
              sx={{
                padding: "2px",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                width: "20px",
                height: "20px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#10B981",
                  color: "#10B981",
                },
              }}
            >
              <TipsAndUpdatesIcon sx={{ fontSize: "15px" }} />
            </IconButton>
            <IconButton
              onClick={downloadCSV}
              size="small"
              sx={{
                padding: "2px",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                width: "20px",
                height: "20px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#10B981",
                  color: "#10B981",
                },
              }}
            >
              <FileDownloadOutlinedIcon sx={{ fontSize: "15px" }} />
            </IconButton>
            <IconButton
              onClick={() => setUploadAdjustmentsOpen(true)}
              size="small"
              sx={{
                padding: "2px",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                width: "20px",
                height: "20px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#10B981",
                  color: "#10B981",
                },
              }}
            >
              <FileUploadOutlinedIcon sx={{ fontSize: "15px" }} />
            </IconButton>
            <IconButton
              onClick={() => setDetailsDialogOpen(true)}
              size="small"
              sx={{
                padding: "2px",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                width: "20px",
                height: "20px",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#10B981",
                  color: "#10B981",
                },
              }}
            >
              <FullscreenOutlinedIcon sx={{ fontSize: "15px" }} />
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
            maxHeight: "300px", // Fixed maximum height to prevent expansion
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
          {operations.filter(
            (operation) => operation.operation === "adjust_data"
          ).length > 0 ? (
            <Stack spacing={0.375}>
              {operations
                .filter((operation) => operation.operation === "adjust_data")
                .map((adjustment, index) => {
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
                          boxShadow: "0px 1px 3px -1px rgba(16, 185, 129, 0.1)",
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
                          {adjustment.kwargs.dimension === "None"
                            ? "All Dimensions"
                            : `${adjustment.kwargs.dimension} - ${adjustment.kwargs.value}`}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={
                              metricTypeDict[
                                adjustment.kwargs.adjustment_type
                              ] || adjustment.kwargs.adjustment_type
                            }
                            size="small"
                            sx={{
                              height: "16px",
                              fontSize: "0.5625rem",
                              fontWeight: 600,
                              backgroundColor: "#ECFDF3",
                              color: "#059669",
                              border: "1px solid #A7F3D0",
                            }}
                          />
                          {adjustment.kwargs.adjustment_type !==
                            "cut_history" && (
                            <Typography
                              sx={{
                                fontSize: "0.5625rem",
                                color: "#6B7280",
                                fontWeight: 500,
                              }}
                            >
                              {adjustment.kwargs.adjustment_value}%
                            </Typography>
                          )}
                          <Typography
                            sx={{
                              fontSize: "0.5625rem",
                              color: "#9CA3AF",
                              fontWeight: 400,
                            }}
                          >
                            {adjustment.kwargs.adjustment_type === "cut_history"
                              ? `Till ${formatDate(
                                  adjustment.kwargs.date_range[1]
                                )}`
                              : `${formatDate(
                                  adjustment.kwargs.date_range[0]
                                )} - ${formatDate(
                                  adjustment.kwargs.date_range[1]
                                )}`}
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton
                        onClick={() =>
                          removePlannerAdjustmentByIndex(index + 1)
                        }
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
                          },
                          transition: "all 0.15s ease-in-out",
                        }}
                      >
                        <CloseIcon sx={{ fontSize: "12px" }} />
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
                <SettingsIcon sx={{ fontSize: "1.5rem", color: "#D1D5DB" }} />
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  No operations added yet
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.5625rem",
                    fontWeight: 400,
                    color: "#9CA3AF",
                    textAlign: "center",
                  }}
                >
                  Configure adjustments to get started
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>

      <UploadAdjustments
        open={uploadAdjustmentsOpen}
        handleClose={() => setUploadAdjustmentsOpen(false)}
        currentAdjustments={adjustments}
        onAdjustmentsUpdate={handleAdjustmentsUpdate}
        dimensionFilterData={dimensionFilterData}
        types={metricTypeValues}
        columns={columns}
      />

      <AdjustmentDetailsDialog
        open={detailsDialogOpen}
        handleClose={() => setDetailsDialogOpen(false)}
        adjustments={adjustments}
      />
      <UploadAdjustmentsGuide
        open={uploadAdjustmentsGuideOpen}
        handleClose={() => setUploadAdjustmentsGuideOpen(false)}
        columns={columns}
        dimensionFilterData={dimensionFilterData}
        types={metricTypeValues}
      />
    </Stack>
  );
};

export default AdjustmentBox;
