import {
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Button,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import React, { useMemo } from "react";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import useConfig from "../../../../hooks/useConfig";
import { useEffect } from "react";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter";
import CustomButton from "../../../../components/CustomButton";
import CustomScrollbar from "../../../../components/CustomScrollbar";
import CustomTooltip from "../../../../components/CustomToolTip";
import { useState } from "react";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FullscreenOutlinedIcon from "@mui/icons-material/FullscreenOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckIcon from "@mui/icons-material/Check";
import UploadEnrichments from "../../../../components/UploadEnrichments";
import EnrichmentDetailsDialog from "../../../../components/EnrichmentDetailsDialog";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import UploadEnrichmentsGuide from "../../../../components/UploadEnrichmentsGuide";
import useDashboard from "../../../../hooks/useDashboard";
import useModule from "../../../../hooks/useModule";
import EnrichmentConfirmationDialog from "./EnrichmentConfirmationDialog";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ShowChartIcon from "@mui/icons-material/ShowChart";

import { oldFlowModules } from "./../../../../utils/oldFlowModules";
import { useParams } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";
import { downloadParquetFileUsingPreSignedURL } from "../../../../redux/actions/dashboardActions";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { current } from "@reduxjs/toolkit";
import { BatchPredictionOutlined } from "@mui/icons-material";
import useExperiment from "../../../../hooks/useExperiment";
import { useCallback } from "react";
import debounce from "lodash.debounce";
import { batch } from "react-redux";
import { set } from "lodash";

const EnrichmentSuggestions = () => {
  const {
    rlAgentEnrichmentSuggestions,
    currentRLAgentEnrichmentRisk,
    setCurrentRLAgentEnrichmentRisk,
    currentRLAgentEnrichmentSuggestion,
    setCurrentRLAgentEnrichmentSuggestion,
    addCurrentRLAgentEnrichmentKey,
    removeCurrentRLAgentEnrichmentKey,
    currentRLAgentEnrichmentKeys,
    updateRLAgentEnrichmentSuggestions,
    rlEnrichmentsGlobalStartDate,
    setRlEnrichmentsGlobalStartDate,
    rlEnrichmentsGlobalEndDate,
    setRlEnrichmentsGlobalEndDate,
    currentRLAgentEnrichmentSuggestionCardIndex: currentCardIndex,
    setCurrentRLAgentEnrichmentSuggestionCardIndex: setCurrentCardIndex,
    currentDimension,
    approvedRLAgentEnrichmentSuggestions,
    experimentBasePath,
    setRLAgentEnrichmentSuggestions,
  } = useDashboard();

  const [currentBatch, setCurrentBatch] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo, currentCompany } = useAuth();
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { moduleName, experiment_id } = useParams();
  const isOldModule = oldFlowModules.includes(moduleName);
  const { experiment_config, hasParquetFiles } = useExperiment();
  const handleDownload = async (type) => {
    const filePaths = {
      "Enrichments List": `${experimentBasePath}/rl_agent/enrichment_bydate_rlagent.csv`,
      "Approved Enrichment": `${experimentBasePath}/rl_agent/approved_enrichments.csv`,
      "Enrich RL Pivot": `${experimentBasePath}/rl_agent/enrich_rl_pivot.csv`,
    };

    await downloadSingleReport(type, filePaths[type]);
    setDownloadAnchorEl(null);
  };
  const downloadSingleReport = async (reportTitle, filePath) => {
    // Implement your single report download logic
    // Reuse your existing download logic
    const tokenPayloadForParquet = {
      filePath: filePath,
      fileName: filePath.split("/").pop().replace(".csv", ""),
      companyName: currentCompany.companyName,
      filterData: {},
      paginationData: null,
      sortingData: null,
    };

    await downloadParquetFileUsingPreSignedURL(
      tokenPayloadForParquet,
      reportTitle,
      userInfo.userID
    );
  };

  const isEnrichmentTypeMatching = (suggestionEnrichment, bydateEnrichment) => {
    if (!bydateEnrichment || !suggestionEnrichment) return false;

    const typeMapping = {
      "ML Forecast": "ml_forecast",
      "Upper Bound": "upper_bound",
      "Lower Bound": "lower_bound",
      Offset: "offset",
      Uplift: "uplift",
      P10: "P10",
      P20: "P20",
      P30: "P30",
      P40: "P40",
      P50: "P50",
      P60: "P60",
      P70: "P70",
      P80: "P80",
      P90: "P90",
      P99: "P99",
    };

    const suggestionType =
      typeMapping[suggestionEnrichment.Type] ||
      suggestionEnrichment.Type.toLowerCase();
    const bydateType = bydateEnrichment.enrichment_type;

    return suggestionType === bydateType;
  };

  const normalizeDimension = (dimension) => {
    // Convert ts_id to Forecast_Granularity if needed
    if (dimension === "ts_id") return "Forecast_Granularity";
    return dimension;
  };

  const getEnrichmentFromBydate = (suggestion) => {
    if (!enrichment_bydate || !Array.isArray(enrichment_bydate)) return null;

    // Normalize the suggestion dimension
    const suggestionDimension = normalizeDimension(suggestion.Dimension);

    // Find all matching enrichments (could be multiple)
    const matchingEnrichments = enrichment_bydate.filter((enrichment) => {
      const enrichmentDimension = normalizeDimension(enrichment.dimension);
      return (
        enrichmentDimension === suggestionDimension &&
        enrichment.value === suggestion.Value
      );
    });

    // Return the last one if multiple exist
    if (matchingEnrichments.length > 0) {
      return matchingEnrichments[matchingEnrichments.length - 1];
    }

    return null;
  };
  const shouldOverrideReviewedStatus = (suggestion) => {
    const bydateEnrichment = getEnrichmentFromBydate(suggestion);

    if (!bydateEnrichment) {
      return false; // No enrichment_bydate entry, keep original status
    }

    console.log(bydateEnrichment, suggestion);

    // Get the current approved enrichment (from original logic)
    const approvedEnrichment = getApprovedEnrichment(suggestion);

    // If enrichment types don't match, we should NOT show as Reviewed
    if (
      approvedEnrichment &&
      !isEnrichmentTypeMatching(approvedEnrichment, bydateEnrichment)
    ) {
      return true; // Override to NOT show as Reviewed
    }

    return false; // Keep original status
  };

  // Dynamically select setEnrichment based on isOldModule
  const {
    setEnrichment: setEnrichmentFromConfig,
    addEnrichment: addEnrichmentFromConfig,
    removeRLAgentEnrichment: removeRLAgentEnrichmentFromConfig,
    configState,
    enrichment_bydate,
  } = useConfig();

  console.log(enrichment_bydate, rlAgentEnrichmentSuggestions);
  const {
    setEnrichment: setEnrichmentFromModule,
    addEnrichment: addEnrichmentFromModule,
    removeRLAgentEnrichment: removeRLAgentEnrichmentFromModule,
  } = useModule();
  const setEnrichment = isOldModule
    ? setEnrichmentFromConfig
    : setEnrichmentFromModule;
  const addEnrichment = isOldModule
    ? addEnrichmentFromConfig
    : addEnrichmentFromModule;
  const removeRLAgentEnrichment = isOldModule
    ? removeRLAgentEnrichmentFromConfig
    : removeRLAgentEnrichmentFromModule;

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedEnrichmentData, setSelectedEnrichmentData] = useState(null);

  // Helper function to check if a suggestion is reviewed
  const isSuggestionReviewed = (suggestion) => {
    // if (configState.stacking?.rl_agents) {
    //   // Check if there's an entry in approvedRLAgentEnrichmentSuggestions with matching dimension and value
    //   return approvedRLAgentEnrichmentSuggestions?.some(
    //     (approved) =>
    //       approved.Dimension === suggestion.Dimension &&
    //       approved.Value === suggestion.Value
    //   );
    // } else {
    // Original logic - check the Reviewed property
    const isCustomEnrichment = shouldOverrideReviewedStatus(suggestion);

    return (
      !isCustomEnrichment &&
      (suggestion.Reviewed === true ||
        suggestion.Reviewed === "true" ||
        suggestion.Reviewed === "True")
    );
    // }
  };

  // Helper function to get approved enrichment for a suggestion
  const getApprovedEnrichment = (suggestion) => {
    // if (configState.stacking?.rl_agents) {
    //   // Find the approved enrichment from approvedRLAgentEnrichmentSuggestions
    //   const approvedEntry = approvedRLAgentEnrichmentSuggestions?.find(
    //     (approved) =>
    //       approved.Dimension === suggestion.Dimension &&
    //       approved.Value === suggestion.Value
    //   );
    //   return approvedEntry?.["Approved Enrichment"] || null;
    // } else {
    // Original logic - use the Approved Enrichment property

    return suggestion["Approved Enrichment"];
    // }
  };

  // Helper function to get reviewed by information
  const getReviewedBy = (suggestion) => {
    // If from enrichment_bydate, we don't have user info, so use a default
    const bydateEnrichment = getEnrichmentFromBydate(suggestion);
    const approvedEnrichment = getApprovedEnrichment(suggestion);

    if (
      bydateEnrichment &&
      !isEnrichmentTypeMatching(approvedEnrichment, bydateEnrichment)
    ) {
      return "User";
    }

    // Fallback to original logic
    return suggestion.ReviewedBy || suggestion["Reviewed By"];
  };

  // Helper function to get comment
  const getComment = (suggestion) => {
    const bydateEnrichment = getEnrichmentFromBydate(suggestion);
    const approvedEnrichment = getApprovedEnrichment(suggestion);

    if (
      bydateEnrichment &&
      !isEnrichmentTypeMatching(approvedEnrichment, bydateEnrichment)
    ) {
      let comment = `Enrichment Type: ${bydateEnrichment.enrichment_type}`;

      // Add enrichment value if it's uplift
      if (bydateEnrichment.enrichment_type === "uplift") {
        comment += `, Value: ${bydateEnrichment.enrichment_value}`;
      }

      // Add date range if available
      

      return comment;
    }

    // Fallback to original logic
    return suggestion?.Comment;
  };

  const fetchBatch = async (batchNo, shouldAppend = false) => {
    setIsLoading(true);
    try {
      const data = await setRLAgentEnrichmentSuggestions(
        `${experimentBasePath}/rl_agent/enrich_rl_pivot.csv`,
        {
          dimensionFilters:
            currentRLAgentEnrichmentRisk === "All"
              ? {
                  Dimension: [currentDimension],
                }
              : {
                  Risk: [currentRLAgentEnrichmentRisk],
                  Dimension: [currentDimension],
                },
          columnFilter: [],
          selectAllColumns: true,
        },
        hasParquetFiles,
        approvedRLAgentEnrichmentSuggestions,
        experiment_config.agent_settings.forecast_deviation,
        batchNo
      );

      if (data && data.length > 0) {
        // If appending (for infinite scroll), you'd merge with existing data
        // For now, we'll replace the data with the new batch
        if (!shouldAppend) {
          setCurrentCardIndex(0);
          if (data.length > 0) {
            setCurrentRLAgentEnrichmentSuggestion(data[0]);
          }
        }
        setCurrentBatch(batchNo);

        // If this is the first batch and we get less than batch size,
        // it means we've reached the end
        if (batchNo === 1 && data.length < 100) {
          setTotalItems(data.length);
        }
      }
    } catch (error) {
      console.error("Error fetching batch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      currentDimension !== currentRLAgentEnrichmentSuggestion?.Dimension &&
      rlAgentEnrichmentSuggestions[0]?.Dimension === currentDimension
    ) {
      setCurrentRLAgentEnrichmentSuggestion(rlAgentEnrichmentSuggestions[0]);
      setRlEnrichmentsGlobalStartDate(
        rlAgentEnrichmentSuggestions[0]["Start Date"] || ""
      );
      setRlEnrichmentsGlobalEndDate(
        rlAgentEnrichmentSuggestions[0]["End Date"] || ""
      );
    }
    if (currentRLAgentEnrichmentSuggestion && rlAgentEnrichmentSuggestions) {
      const newIndex = rlAgentEnrichmentSuggestions.findIndex(
        (suggestion) =>
          suggestion.Dimension ===
            currentRLAgentEnrichmentSuggestion.Dimension &&
          suggestion.Value === currentRLAgentEnrichmentSuggestion.Value
      );

      console.log(newIndex);

      if (newIndex !== -1) {
        setCurrentCardIndex(newIndex);
      }
    }
  }, [
    currentRLAgentEnrichmentSuggestion,
    rlAgentEnrichmentSuggestions,
    currentDimension,
  ]);

  const onEnrichmentSelect = (enrichment, suggestion, index) => {
    setSelectedEnrichmentData({
      enrichment,
      suggestion,
      index,
    });
    const { Type, Rank, Reward } = enrichment;
    const dictionary = {
      "ML Forecast": "ml_forecast",
      "Upper Bound": "upper_bound",
      "Lower Bound": "lower_bound",
      Offset: "offset",
      P10: "P10",
      P20: "P20",
      P30: "P30",
      P40: "P40",
      P50: "P50",
      P60: "P60",
      P70: "P70",
      P80: "P80",
      P90: "P90",
      P99: "P99",
    };
    const enrichment_data = {
      operation: "enrich_data",
      kwargs: {
        dimension: suggestion.Dimension || "None",
        value: suggestion.Value || "None",
        date_range: [rlEnrichmentsGlobalStartDate, rlEnrichmentsGlobalEndDate],
        enrichment_type: dictionary[Type] || Type,
        enrichment_value: 0,
      },
    };
    setEnrichment(enrichment_data);
    return;
  };

  const onRemoveEnrichment = async (enrichment, suggestion, index) => {
    const updatedSuggestion = {
      ...suggestion,
      Reviewed: false,
      "Approved Enrichment": null,
      "Reviewed By": userInfo.userName,
      Comment: "",
    };

    // Update both the main array and current suggestion
    await updateRLAgentEnrichmentSuggestions(
      updatedSuggestion,
      index,
      experiment_id
    );

    // Update the current suggestion to reflect changes immediately
    setCurrentRLAgentEnrichmentSuggestion(updatedSuggestion);

    console.log("Removing Enrichment", enrichment);
    removeRLAgentEnrichment({
      Type: enrichment.Type,
      Dimension: suggestion.Dimension,
      Value: suggestion.Value,
    });
  };

  const handleDateChange = (dateType, newDate) => {
    if (dateType === "start") {
      setRlEnrichmentsGlobalStartDate(newDate);
    } else {
      setRlEnrichmentsGlobalEndDate(newDate);
    }
  };

  // Handler for selecting enrichment for approval
  const handleEnrichmentApproval = (enrichment, suggestion, index) => {
    // Call onEnrichmentSelect for any additional logic
    onEnrichmentSelect(enrichment, suggestion, index);
    setShowConfirmDialog(true);
  };

  // Handler for confirming enrichment addition
  const handleConfirmAddEnrichment = async (comment) => {
    // Call addEnrichment without arguments as it doesn't need any
    addEnrichment();
    const updatedSuggestion = {
      ...selectedEnrichmentData.suggestion,
      Reviewed: true,
      "Approved Enrichment": selectedEnrichmentData.enrichment,
      "Reviewed By": userInfo.userName,
      Comment: comment,
    };

    console.log(updatedSuggestion);

    // Update the main array first and wait for it to complete
    await updateRLAgentEnrichmentSuggestions(
      updatedSuggestion,
      selectedEnrichmentData.index,
      experiment_id
    );
    // Update the current suggestion to reflect changes immediately
    setCurrentRLAgentEnrichmentSuggestion(updatedSuggestion);

    // Reset state and close dialog
    setSelectedEnrichmentData(null);
    setShowConfirmDialog(false);
  };

  // Handler for canceling enrichment addition
  const handleCancelAddEnrichment = () => {
    setSelectedEnrichmentData(null);
    setShowConfirmDialog(false);
  };

  const isUnderPreview = (type) => {
    const dictionary = {
      "ML Forecast": "ml_forecast",
      "Upper Bound": "pred_upper_bound_range",
      "Lower Bound": "pred_lower_bound_range",
      Offset: "offset_forecast",
      P10: "P10",
      P20: "P20",
      P30: "P30",
      P40: "P40",
      P50: "P50",
      P60: "P60",
      P70: "P70",
      P80: "P80",
      P90: "P90",
      P99: "P99",
    };
    return currentRLAgentEnrichmentKeys.includes(dictionary[type]);
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return {
          backgroundColor: "#FEF3F2",
          color: "#B42318",
          borderColor: "#FDA29B",
        };
      case "medium":
        return {
          backgroundColor: "#FFFAEB",
          color: "#B54708",
          borderColor: "#FEC84B",
        };
      case "low":
        return {
          backgroundColor: "#F0F9FF",
          color: "#1849A9",
          borderColor: "#84CAFF",
        };
      default:
        return {
          backgroundColor: "#F9FAFB",
          color: "#475467",
          borderColor: "#D0D5DD",
        };
    }
  };

  const isSelected = (suggestion) => {
    return (
      currentRLAgentEnrichmentSuggestion?.Dimension === suggestion.Dimension &&
      currentRLAgentEnrichmentSuggestion?.Value === suggestion.Value
    );
  };

  // Navigation handlers
  const handlePrevCard = () => {
    const newIndex = currentCardIndex - 1;
    if (newIndex >= 0) {
      // Get the suggestion from the main array
      const suggestion = rlAgentEnrichmentSuggestions[newIndex];
      setCurrentRLAgentEnrichmentSuggestion({ ...suggestion }); // Create a new copy
      setCurrentCardIndex(newIndex);
    }
  };

  const handleNextCard = async () => {
    const newIndex = currentCardIndex + 1;
    if (newIndex < rlAgentEnrichmentSuggestions?.length) {
      // Get the suggestion from the main array
      const suggestion = rlAgentEnrichmentSuggestions[newIndex];
      setCurrentRLAgentEnrichmentSuggestion({ ...suggestion }); // Create a new copy
      setCurrentCardIndex(newIndex);
    }
  };

  // In the render, find the enrichment to show in summary:
  const currentSuggestion = rlAgentEnrichmentSuggestions[currentCardIndex];
  const isReviewed = currentSuggestion
    ? isSuggestionReviewed(currentSuggestion)
    : false;
  const approvedEnrichment = currentSuggestion
    ? getApprovedEnrichment(currentSuggestion)
    : null;
  const reviewedBy = currentSuggestion
    ? getReviewedBy(currentSuggestion)
    : null;
  const comment = currentSuggestion ? getComment(currentSuggestion) : null;

  const summaryEnrichment = isReviewed
    ? approvedEnrichment
    : currentSuggestion?.Enrichments[0];

  return (
    <Stack
      sx={{
        borderRadius: "8px",
        padding: "1rem",
        gap: "8px",
        border: "1px solid #EAECF0",
        boxShadow: "0px 1px 2px 0px #1018280D",
        backgroundColor: "#FFFFFF",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "1rem",
            fontWeight: 600,
            lineHeight: "1.5rem",
            textAlign: "left",
            color: "#101828",
            textTransform: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 2, // take maximum horizontal space
            minWidth: 0, // allow text to shrink if needed
          }}
        >
          Enrichment Suggestions
        </Typography>

        <Box
          sx={{ flexShrink: 0 }}
          onMouseEnter={(e) => setAnchorEl(e.currentTarget)} // OPEN ON HOVER
          onMouseLeave={() => setAnchorEl(null)} // CLOSE ON LEAVE
        >
          <IconButton
            size="small"
            sx={{
              color: "#374151",
              border: "1px solid #d1d5db",
              backgroundColor: "#FFF",
              borderRadius: "6px",
              width: "40px",
              height: "40px",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: "20px" }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 220,
                backgroundColor: "#FFF",
                boxShadow: "0px 8px 32px rgba(16, 24, 40, 0.16)",
                mt: "6px",
              },
            }}
            MenuListProps={{
              onMouseLeave: () => setAnchorEl(null), // CLOSE WHEN MOUSE LEAVES MENU
              sx: { p: 0 },
            }}
          >
            {/* Header */}
            <Typography
              sx={{
                padding: "8px 12px",
                fontFamily: "Inter",
                fontSize: "11px",
                fontWeight: 600,
                color: "#344054",
                borderBottom: "1px solid #EAECF0",
              }}
            >
              Download Reports
            </Typography>

            {/* Option 1 */}
            <MenuItem
              onClick={() => {
                handleDownload("Enrichments List");
                setAnchorEl(null);
              }}
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                color: "#344054",
                px: 1.5,
                py: "8px",
                "&:hover": {
                  backgroundColor: "#F9F5FF",
                  color: "#7F56D9",
                },
              }}
            >
              Enrichments List
            </MenuItem>

            <Box sx={{ borderBottom: "1px solid #EAECF0", mx: 0 }} />

            {/* Option 2 */}
            <MenuItem
              onClick={() => {
                handleDownload("Enrich RL Pivot");
                setAnchorEl(null);
              }}
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                color: "#344054",
                px: 1.5,
                py: "8px",
                "&:hover": {
                  backgroundColor: "#F9F5FF",
                  color: "#7F56D9",
                },
              }}
            >
              Enrich RL Pivot
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ flexShrink: 0, flex: 1 }}>
          <CustomAutocomplete
            values={["All", "High", "Medium", "Low"]}
            selectedValues={currentRLAgentEnrichmentRisk}
            setSelectedValues={setCurrentRLAgentEnrichmentRisk}
            placeholder="Risk"
            showLabel={false}
            disableClearable
          />
        </Box>
      </Stack>
      <Divider />

      {/* Date Range Controls */}
      {rlAgentEnrichmentSuggestions &&
        rlAgentEnrichmentSuggestions.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              padding: "0.25rem 0",
              alignItems: "center",
            }}
          >
            <CustomDatePicker
              //showLabel
              label="Start Date:"
              selectedValue={rlEnrichmentsGlobalStartDate}
              setSelectedValue={(newDate) => handleDateChange("start", newDate)}
              sx={{ flex: 1 }}
            />
            <Typography
              sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#101828" }}
            >
              -
            </Typography>
            <CustomDatePicker
              //showLabel
              label="End Date:"
              selectedValue={rlEnrichmentsGlobalEndDate}
              setSelectedValue={(newDate) => handleDateChange("end", newDate)}
              sx={{ flex: 1 }}
            />
          </Stack>
        )}

      {/* Main content area with centered card */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px 0px",
        }}
      >
        {/* Single Card Container with Navigation */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1, // Increased gap between card and navigation
          }}
        >
          {/* Card */}
          <Box
            sx={{
              width: "100%",
              flex: 1,
              minHeight: 0, // Important for proper flex behavior
            }}
          >
            {!rlAgentEnrichmentSuggestions ||
            rlAgentEnrichmentSuggestions.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem",
                  color: "#667085",
                  width: "100%",
                  /*  border: "1px solid #EAECF0",
                  borderRadius: "12px", */
                  backgroundColor: "#FFFFFF",
                }}
              >
                <TipsAndUpdatesIcon
                  sx={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                    color: "#D0D5DD",
                  }}
                />
                <Typography sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                  No enrichment suggestions available
                </Typography>
              </Box>
            ) : (
              <Card
                sx={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #10B981",
                  borderRadius: "12px",
                  boxShadow:
                    "0px 4px 6px -2px rgba(16, 185, 129, 0.05), 0px 12px 16px -4px rgba(16, 185, 129, 0.1)",
                  height: "fit-content",
                  maxHeight: "65vh",
                  overflow: "auto",
                }}
              >
                <CardContent
                  sx={{
                    padding: "1.25rem !important",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {/* Card content for current suggestion */}
                  {currentSuggestion && (
                    <>
                      {/* Header Section */}
                      <Box sx={{ marginBottom: "0.75rem" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#101828",
                                marginBottom: "0.125rem",
                                lineHeight: 1.2,
                              }}
                            >
                              {currentSuggestion.Dimension}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "Inter",
                                fontSize: "0.75rem",
                                color: "#475467",
                                fontWeight: 500,
                                lineHeight: 1.2,
                              }}
                            >
                              {currentSuggestion.Value}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {/* Info Icon with Tooltip */}
                            <Tooltip
                              title={
                                <Box
                                  sx={{
                                    fontSize: "0.875rem",
                                    fontFamily: "Inter",
                                    padding: "4px 0",
                                  }}
                                >
                                  <Box sx={{ marginBottom: "8px" }}>
                                    <Box
                                      component="span"
                                      sx={{
                                        color: "#64748B",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                      }}
                                    >
                                      Reviewed By
                                    </Box>
                                    <Box
                                      sx={{
                                        color: "#0F172A",
                                        fontWeight: 500,
                                        marginTop: "2px",
                                      }}
                                    >
                                      {reviewedBy || "N/A"}
                                    </Box>
                                  </Box>

                                  <Box>
                                     <Box
    component="span"
    sx={{
      color: "#64748B",
      fontSize: "0.75rem",
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}
  >
    {reviewedBy === "User" ? "Details" : "Comment"}
  </Box>
                                    <Box
                                      sx={{
                                        color: "#475569",
                                        marginTop: "2px",
                                        lineHeight: 1.5,
                                        maxWidth: "280px",
                                      }}
                                    >
                                      {comment || (
                                        <Box
                                          component="span"
                                          sx={{
                                            color: "#94A3B8",
                                            fontStyle: "italic",
                                          }}
                                        >
                                          No comments
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                              }
                              arrow
                              placement="top"
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: "#FFFFFF",
                                    color: "#0F172A",
                                    boxShadow:
                                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                    border: "1px solid #E2E8F0",
                                    borderRadius: "8px",
                                    padding: "12px 16px",
                                    "& .MuiTooltip-arrow": {
                                      color: "#FFFFFF",
                                      "&::before": {
                                        border: "1px solid #E2E8F0",
                                      },
                                    },
                                  },
                                },
                              }}
                            >
                              <IconButton
                                size="small"
                                sx={{
                                  padding: 0,
                                  color: "#64748B",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    color: "#0F172A",
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <InfoOutlinedIcon sx={{ fontSize: "16px" }} />
                              </IconButton>
                            </Tooltip>
                            {isReviewed && (
                              <Chip
                                label="Reviewed"
                                size="small"
                                sx={{
                                  backgroundColor: "#F0FDF4",
                                  color: "#10B981",
                                  fontFamily: "Inter",
                                  fontSize: "0.625rem",
                                  fontWeight: 500,
                                  height: "20px",
                                  border: "1px solid #A6F4C5",
                                }}
                              />
                            )}

                            {!isReviewed && reviewedBy === "User" && (
                              <Chip
                                label="Custom"
                                size="small"
                                sx={{
                                  backgroundColor: "#FEF3C7",
                                  color: "#F59E0B",
                                  fontFamily: "Inter",
                                  fontSize: "0.625rem",
                                  fontWeight: 500,
                                  height: "20px",
                                  border: "1px solid #FBBF24",
                                }}
                              />
                            )}

                            <Chip
                              label={currentSuggestion.Risk}
                              size="small"
                              sx={{
                                ...getRiskColor(currentSuggestion.Risk),
                                fontFamily: "Inter",
                                fontSize: "0.625rem",
                                fontWeight: 500,
                                height: "20px",
                                border: `1px solid ${
                                  getRiskColor(currentSuggestion.Risk)
                                    .borderColor
                                }`,
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Metadata Section - More Compact */}
                        <Grid
                          container
                          spacing={1}
                          sx={{ marginBottom: "0.5rem" }}
                        >
                          <Grid
                            item
                            xs={
                              currentSuggestion["Error_Contribution"] ? 12 : 6
                            }
                          >
                            <Typography
                              sx={{
                                fontSize: "0.625rem",
                                color: "#667085",
                                fontWeight: 500,
                              }}
                            >
                              Period
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#344054",
                                fontWeight: 500,
                                lineHeight: 1.2,
                              }}
                            >
                              {rlEnrichmentsGlobalStartDate ||
                                currentSuggestion["Start Date"]}{" "}
                              -{" "}
                              {rlEnrichmentsGlobalEndDate ||
                                currentSuggestion["End Date"]}
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            xs={currentSuggestion["Error_Contribution"] ? 6 : 6}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.625rem",
                                color: "#667085",
                                fontWeight: 500,
                              }}
                            >
                              Current Accuracy
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#344054",
                                fontWeight: 600,
                                lineHeight: 1.2,
                              }}
                            >
                              {(
                                parseFloat(
                                  currentSuggestion["Current Accuracy"]
                                ) * 100
                              ).toFixed(1)}
                              %
                            </Typography>
                          </Grid>
                          {currentSuggestion["Error_Contribution"] && (
                            <Grid item xs={6}>
                              <Typography
                                sx={{
                                  fontSize: "0.625rem",
                                  color: "#667085",
                                  fontWeight: 500,
                                }}
                              >
                                Error Contribution
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "#344054",
                                  fontWeight: 600,
                                  lineHeight: 1.2,
                                }}
                              >
                                {parseFloat(
                                  currentSuggestion["Error_Contribution"]
                                ).toFixed(1)}
                                %
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>

                      {/* Smart Summary + Enrichments */}
                      <Box>
                        {/* Summary Bar */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.75rem",
                            border: isReviewed
                              ? "1.5px solid #6366F1"
                              : "1.5px solid #10B981",
                            borderRadius: "8px",
                            backgroundColor: isReviewed ? "#F5F5FF" : "#F0FDF4",
                            marginBottom: "0.75rem",
                            position: "relative",
                          }}
                        >
                          {/* Recommended/Approved Badge */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: "-8px",
                              left: "12px",
                              backgroundColor: isReviewed
                                ? "#6366F1"
                                : "#10B981",
                              color: "#FFFFFF",
                              fontSize: "0.5rem",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              boxShadow: "0px 1px 2px 0px #1018280D",
                            }}
                          >
                            {isReviewed ? "APPROVED" : "RECOMMENDED"}
                          </Box>

                          {/* Left Side - Top Enrichment Details */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              flex: 1,
                              marginTop: "4px",
                            }}
                          >
                            <Chip
                              label={
                                isReviewed
                                  ? approvedEnrichment?.Rank || "1"
                                  : "1"
                              }
                              size="small"
                              sx={{
                                backgroundColor: isReviewed
                                  ? "#6366F1"
                                  : "#F0FDF4",
                                color: isReviewed ? "#FFFFFF" : "#065F46",
                                fontSize: "0.5rem",
                                height: "20px",
                                fontWeight: 700,
                                border: isReviewed
                                  ? "none"
                                  : "1px solid #10B981",
                                minWidth: "20px",
                              }}
                            />
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: isReviewed ? "#3730A3" : "#065F46",
                                flex: 1,
                              }}
                            >
                              {isReviewed
                                ? approvedEnrichment?.Type
                                : currentSuggestion.Enrichments[0]?.Type ||
                                  "ML Forecast"}
                            </Typography>

                            {/* Performance Metrics */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              {/* Accuracy Icon and Value */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                <MyLocationIcon
                                  sx={{
                                    fontSize: "12px",
                                    color: isReviewed ? "#6366F1" : "#10B981",
                                  }}
                                />

                                <CustomTooltip
                                  title="Accuracy"
                                  placement="top"
                                  arrow
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.625rem",
                                      fontWeight: 600,
                                      color: isReviewed ? "#3730A3" : "#065F46",
                                    }}
                                  >
                                    {(
                                      (approvedEnrichment?.Reward ??
                                        currentSuggestion.Enrichments[0]
                                          ?.Reward ??
                                        0.923) * 100
                                    ).toFixed(1)}
                                    %
                                  </Typography>
                                </CustomTooltip>
                              </Box>

                              {/* Deviation Icon and Value */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                }}
                              >
                                <ShowChartIcon
                                  sx={{
                                    fontSize: "12px",
                                    color: "#6B7280",
                                  }}
                                />
                                <CustomTooltip
                                  title="Deviation"
                                  placement="top"
                                  arrow
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "0.625rem",
                                      fontWeight: 600,
                                      color: "#344054",
                                      cursor: "default", // prevents text selection cursor
                                    }}
                                  >
                                    {(
                                      approvedEnrichment?.Deviation ??
                                      currentSuggestion.Enrichments[0]
                                        ?.Deviation
                                    ).toFixed(1)}
                                    %
                                  </Typography>
                                </CustomTooltip>
                              </Box>

                              {/* Eye Icon for Preview Toggle */}
                              <IconButton
                                size="small"
                                sx={{
                                  padding: "4px",
                                  color: isUnderPreview(
                                    isReviewed
                                      ? approvedEnrichment?.Type
                                      : currentSuggestion.Enrichments[0]?.Type
                                  )
                                    ? isReviewed
                                      ? "#6366F1"
                                      : "#10B981"
                                    : "#6B7280",
                                  "&:hover": {
                                    backgroundColor: isUnderPreview(
                                      isReviewed
                                        ? approvedEnrichment?.Type
                                        : currentSuggestion.Enrichments[0]?.Type
                                    )
                                      ? isReviewed
                                        ? "rgba(99, 102, 241, 0.1)"
                                        : "rgba(16, 185, 129, 0.1)"
                                      : "rgba(107, 114, 128, 0.1)",
                                    color: isUnderPreview(
                                      isReviewed
                                        ? approvedEnrichment?.Type
                                        : currentSuggestion.Enrichments[0]?.Type
                                    )
                                      ? isReviewed
                                        ? "#4F46E5"
                                        : "#10B981"
                                      : "#6B7280",
                                  },
                                  transition: "all 0.2s ease-in-out",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const enrichmentType = isReviewed
                                    ? approvedEnrichment?.Type
                                    : currentSuggestion.Enrichments[0]?.Type;
                                  if (isUnderPreview(enrichmentType)) {
                                    removeCurrentRLAgentEnrichmentKey(
                                      enrichmentType
                                    );
                                  } else {
                                    addCurrentRLAgentEnrichmentKey(
                                      enrichmentType
                                    );
                                  }
                                }}
                              >
                                {isUnderPreview(
                                  isReviewed
                                    ? approvedEnrichment?.Type
                                    : currentSuggestion.Enrichments[0]?.Type
                                ) ? (
                                  <VisibilityIcon sx={{ fontSize: "16px" }} />
                                ) : (
                                  <VisibilityOffIcon
                                    sx={{ fontSize: "16px" }}
                                  />
                                )}
                              </IconButton>

                              {/* Action Button (Add or Reset) */}
                              <IconButton
                                size="small"
                                title={
                                  isReviewed
                                    ? "Reset Enrichment"
                                    : "Add Enrichment"
                                }
                                sx={{
                                  padding: "4px",
                                  color: isReviewed ? "#6366F1" : "#10B981",
                                  "&:hover": {
                                    backgroundColor: isReviewed
                                      ? "rgba(99, 102, 241, 0.1)"
                                      : "rgba(16, 185, 129, 0.1)",
                                    color: isReviewed ? "#4F46E5" : "#059669",
                                  },
                                  transition: "all 0.2s ease-in-out",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isReviewed) {
                                    onRemoveEnrichment(
                                      approvedEnrichment,
                                      currentSuggestion,
                                      currentCardIndex
                                    );
                                  } else {
                                    handleEnrichmentApproval(
                                      currentSuggestion.Enrichments[0],
                                      currentSuggestion,
                                      currentCardIndex
                                    );
                                  }
                                }}
                              >
                                {isReviewed ? (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12 4L4 12M4 4L12 12"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : (
                                  <CheckIcon sx={{ fontSize: "16px" }} />
                                )}
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>

                        {/* Enrichments List Section */}
                        <Box
                          sx={{
                            maxHeight: "120px",
                            overflowY: "auto",
                            "&::-webkit-scrollbar": {
                              width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                              backgroundColor: "#F9FAFB",
                              borderRadius: "3px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              backgroundColor: "#D0D5DD",
                              borderRadius: "3px",
                              "&:hover": {
                                backgroundColor: "#98A2B3",
                              },
                            },
                          }}
                        >
                          <Stack spacing={0.5}>
                            {currentSuggestion.Enrichments.filter(
                              (enrichment) => {
                                const approvedType = approvedEnrichment?.Type;

                                if (isReviewed) {
                                  // When approved: exclude the approved enrichment from list
                                  return enrichment.Type !== approvedType;
                                } else {
                                  // When not approved: exclude rank 1 (recommended) from list
                                  return enrichment.Rank !== 1;
                                }
                              }
                            ).map((enrichment, enrichmentIndex) => (
                              <Box
                                key={enrichmentIndex}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0.5rem",
                                  border: "1px solid #EAECF0",
                                  borderRadius: "6px",
                                  backgroundColor:
                                    isReviewed &&
                                    approvedEnrichment?.Type === enrichment.Type
                                      ? "#F5F5FF"
                                      : "#FFFFFF",
                                  "&:hover": {
                                    borderColor: "#D0D5DD",
                                    transform: "translateX(4px)",
                                  },
                                  transition: "all 0.2s ease-in-out",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    isReviewed &&
                                    approvedEnrichment?.Type === enrichment.Type
                                  ) {
                                    onRemoveEnrichment(
                                      enrichment,
                                      currentSuggestion,
                                      currentCardIndex
                                    );
                                  } else {
                                    addCurrentRLAgentEnrichmentKey(
                                      enrichment.Type
                                    );
                                  }
                                }}
                              >
                                {/* Left Side - Rank and Type */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    flex: 1,
                                  }}
                                >
                                  <Chip
                                    label={enrichment.Rank}
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        isReviewed &&
                                        approvedEnrichment?.Type ===
                                          enrichment.Type
                                          ? "#6366F1"
                                          : enrichment.Rank === 1
                                          ? "#F0FDF4"
                                          : enrichment.Rank <= 3
                                          ? "#FEF3F2"
                                          : "#F9FAFB",
                                      color:
                                        isReviewed &&
                                        approvedEnrichment?.Type ===
                                          enrichment.Type
                                          ? "#FFFFFF"
                                          : enrichment.Rank === 1
                                          ? "#065F46"
                                          : enrichment.Rank <= 3
                                          ? "#B42318"
                                          : "#475467",
                                      fontSize: "0.5rem",
                                      fontWeight: 600,
                                      border:
                                        isReviewed &&
                                        approvedEnrichment?.Type ===
                                          enrichment.Type
                                          ? "none"
                                          : enrichment.Rank === 1
                                          ? "1px solid #10B981"
                                          : `1px solid ${
                                              enrichment.Rank <= 3
                                                ? "#B42318"
                                                : "#D0D5DD"
                                            }`,
                                      minWidth: "24px",
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.625rem",
                                      fontWeight:
                                        isReviewed &&
                                        approvedEnrichment?.Type ===
                                          enrichment.Type
                                          ? 600
                                          : enrichment.Rank === 1
                                          ? 600
                                          : 500,
                                      color:
                                        isReviewed &&
                                        approvedEnrichment?.Type ===
                                          enrichment.Type
                                          ? "#3730A3"
                                          : enrichment.Rank === 1
                                          ? "#065F46"
                                          : "#344054",
                                    }}
                                  >
                                    {enrichment.Type}
                                  </Typography>
                                </Box>

                                {/* Right Side - Performance & Actions */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    minWidth: "120px",
                                  }}
                                >
                                  {/* Performance Metrics - Single Line */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.5rem",
                                    }}
                                  >
                                    {/* Accuracy */}

                                    <CustomTooltip
                                      title="Accuracy"
                                      placement="top"
                                      arrow
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "2px",
                                        }}
                                      >
                                        <MyLocationIcon
                                          sx={{
                                            fontSize: "12px",
                                            color:
                                              isReviewed &&
                                              approvedEnrichment?.Type ===
                                                enrichment.Type
                                                ? "#6366F1"
                                                : "#10B981",
                                          }}
                                        />
                                        <Typography
                                          sx={{
                                            fontSize: "0.625rem",
                                            fontWeight: 600,
                                            color:
                                              isReviewed &&
                                              approvedEnrichment?.Type ===
                                                enrichment.Type
                                                ? "#3730A3"
                                                : enrichment.Rank === 1
                                                ? "#065F46"
                                                : "#344054",
                                          }}
                                        >
                                          {(enrichment.Reward * 100).toFixed(1)}
                                          %
                                        </Typography>
                                      </Box>
                                    </CustomTooltip>

                                    {/* Deviation */}

                                    <CustomTooltip
                                      title="Deviation"
                                      placement="top"
                                      arrow
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "2px",
                                        }}
                                      >
                                        <ShowChartIcon
                                          sx={{
                                            fontSize: "12px",
                                            color: "#6B7280",
                                          }}
                                        />
                                        <Typography
                                          sx={{
                                            fontSize: "0.625rem",
                                            fontWeight: 600,
                                            color:
                                              isReviewed &&
                                              approvedEnrichment?.Type ===
                                                enrichment.Type
                                                ? "#3730A3"
                                                : enrichment.Rank === 1
                                                ? "#065F46"
                                                : "#344054",
                                          }}
                                        >
                                          {enrichment.Deviation.toFixed(1)}%
                                        </Typography>
                                      </Box>
                                    </CustomTooltip>
                                  </Box>

                                  {/* Eye Icon for Preview Toggle */}
                                  <IconButton
                                    size="small"
                                    sx={{
                                      padding: "4px",
                                      color: isUnderPreview(enrichment.Type)
                                        ? isReviewed &&
                                          approvedEnrichment?.Type ===
                                            enrichment.Type
                                          ? "#6366F1"
                                          : "#10B981"
                                        : "#6B7280",
                                      "&:hover": {
                                        backgroundColor:
                                          isReviewed &&
                                          approvedEnrichment?.Type ===
                                            enrichment.Type
                                            ? "rgba(99, 102, 241, 0.1)"
                                            : "rgba(16, 185, 129, 0.1)",
                                        color:
                                          isReviewed &&
                                          approvedEnrichment?.Type ===
                                            enrichment.Type
                                            ? "#4F46E5"
                                            : "#10B981",
                                      },
                                      transition: "all 0.2s ease-in-out",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isUnderPreview(enrichment.Type)) {
                                        removeCurrentRLAgentEnrichmentKey(
                                          enrichment.Type
                                        );
                                      } else {
                                        addCurrentRLAgentEnrichmentKey(
                                          enrichment.Type
                                        );
                                      }
                                    }}
                                  >
                                    {isUnderPreview(enrichment.Type) ? (
                                      <VisibilityIcon
                                        sx={{ fontSize: "16px" }}
                                      />
                                    ) : (
                                      <VisibilityOffIcon
                                        sx={{ fontSize: "16px" }}
                                      />
                                    )}
                                  </IconButton>

                                  {/* Action Button (Add or Reset) */}
                                  <IconButton
                                    size="small"
                                    disabled={
                                      isReviewed &&
                                      approvedEnrichment?.Type !==
                                        enrichment.Type
                                    }
                                    title={
                                      isReviewed &&
                                      approvedEnrichment?.Type ===
                                        enrichment.Type
                                        ? "Reset Enrichment"
                                        : isReviewed
                                        ? "Another enrichment is already approved"
                                        : "Add Enrichment"
                                    }
                                    sx={{
                                      padding: "4px",
                                      color:
                                        isReviewed &&
                                        approvedEnrichment?.Type ===
                                          enrichment.Type
                                          ? "#6366F1"
                                          : isReviewed
                                          ? "#D0D5DD"
                                          : "#10B981",
                                      "&:hover": {
                                        backgroundColor:
                                          isReviewed &&
                                          approvedEnrichment?.Type ===
                                            enrichment.Type
                                            ? "rgba(99, 102, 241, 0.1)"
                                            : isReviewed
                                            ? "transparent"
                                            : "rgba(16, 185, 129, 0.1)",
                                        color:
                                          isReviewed &&
                                          approvedEnrichment?.Type ===
                                            enrichment.Type
                                            ? "#4F46E5"
                                            : isReviewed
                                            ? "#D0D5DD"
                                            : "#059669",
                                      },
                                      transition: "all 0.2s ease-in-out",
                                      "&.Mui-disabled": {
                                        opacity: 0.5,
                                      },
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (
                                        isReviewed &&
                                        approvedEnrichment?.Type ===
                                          enrichment.Type
                                      ) {
                                        onRemoveEnrichment(
                                          enrichment,
                                          currentSuggestion,
                                          currentCardIndex
                                        );
                                      } else {
                                        handleEnrichmentApproval(
                                          enrichment,
                                          currentSuggestion,
                                          currentCardIndex
                                        );
                                      }
                                    }}
                                  >
                                    {isReviewed &&
                                    approvedEnrichment?.Type ===
                                      enrichment.Type ? (
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M12 4L4 12M4 4L12 12"
                                          stroke="currentColor"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    ) : (
                                      <CheckIcon sx={{ fontSize: "16px" }} />
                                    )}
                                  </IconButton>
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Navigation Controls - Now outside the scrollable area */}
          {rlAgentEnrichmentSuggestions &&
            rlAgentEnrichmentSuggestions.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  padding: "4px 0",
                  backgroundColor: "transparent",
                  width: "100%",
                }}
              >
                <Button
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0 && currentBatch === 1}
                  variant="outlined"
                  startIcon={<ChevronLeftIcon sx={{ fontSize: "16px" }} />}
                  sx={{
                    height: "32px",
                    minWidth: "auto",
                    padding: "8px 14px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    borderRadius: "8px",
                    fontFamily: "Inter",
                    textTransform: "none",
                    borderColor: "#D0D5DD",
                    color: "#344054",
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "#F9FAFB",
                      borderColor: "#D0D5DD",
                    },
                    "&.Mui-disabled": {
                      opacity: 0.5,
                      backgroundColor: "#F9FAFB",
                    },
                  }}
                >
                  Previous
                </Button>

                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#475467",
                    textAlign: "center",
                    minWidth: "40px",
                    fontFamily: "Inter",
                  }}
                >
                  {`${currentCardIndex + 1} of ${
                    rlAgentEnrichmentSuggestions?.length || 0
                  }`}
                </Typography>

                <Button
                  onClick={handleNextCard}
                  disabled={!rlAgentEnrichmentSuggestions}
                  variant="contained"
                  endIcon={<ChevronRightIcon sx={{ fontSize: "16px" }} />}
                  sx={{
                    height: "32px",
                    minWidth: "auto",
                    padding: "8px 14px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    borderRadius: "8px",
                    fontFamily: "Inter",
                    textTransform: "none",
                    backgroundColor: "#10B981",
                    color: "white",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#0EA371",
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      opacity: 0.5,
                      backgroundColor: "#F9FAFB",
                      color: "#344054",
                    },
                  }}
                >
                  Next
                </Button>
              </Box>
            )}
        </Box>
      </Box>

      {/* Enrichment Confirmation Dialog */}
      <EnrichmentConfirmationDialog
        open={showConfirmDialog}
        onClose={handleCancelAddEnrichment}
        onConfirm={handleConfirmAddEnrichment}
        selectedEnrichmentData={selectedEnrichmentData}
        globalStartDate={rlEnrichmentsGlobalStartDate}
        globalEndDate={rlEnrichmentsGlobalEndDate}
      />
    </Stack>
  );
};

export default EnrichmentSuggestions;
