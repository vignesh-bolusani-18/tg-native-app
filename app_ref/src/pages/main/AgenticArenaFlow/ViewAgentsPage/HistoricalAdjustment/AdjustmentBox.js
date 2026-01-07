import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import React, { useMemo } from "react";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import useConfig from "../../../../../hooks/useConfig";
import { useEffect } from "react";
import CustomDatePicker from "../../../../../components/CustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../../components/CustomInputControls/CustomCounter";
import CustomButton from "../../../../../components/CustomButton";
import CustomScrollbar from "../../../../../components/CustomScrollbar";
import CustomTooltip from "../../../../../components/CustomToolTip";
import { useState } from "react";
import moment from "moment";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FullscreenOutlinedIcon from "@mui/icons-material/FullscreenOutlined";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import UploadAdjustments from "../../../../../components/UploadAdjustments";
import AdjustmentDetailsDialog from "../../../../../components/AdjustmentDetailsDialog";
import UploadAdjustmentsGuide from "../../../../../components/UploadAdjustmentsGuide";

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
  const [uploadAdjustmentsOpen, setUploadAdjustmentsOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [uploadAdjustmentsGuideOpen, setUploadAdjustmentsGuideOpen] =
    useState(false);
  const [refresh, setRefresh] = useState(true);
  function formatDate(inputDate) {
    // Parse the input string as a Date object
    const date = new Date(inputDate);

    // Specify options for formatting
    const options = { year: "numeric", month: "long", day: "2-digit" };

    // Format the date as "MMMM, dd, yyyy"
    return date.toLocaleDateString("en-US", options);
  }
  let columns = [
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
    // Add headers

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
  const handleAdjustmentsUpdate = (updatedAdjustments) => {
    // Update the enrichments in your state/store
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
    // First filter enrichments by type
    console.log("adjustments", adjustments);
    console.log("operations", operations);
    const firstAdjustment = adjustments[0];
    if (!firstAdjustment) return [];

    const json_data = adjustments
      /* .filter((enrichment) => enrichment.enrichment_type === currentType) */
      .map((adjustment) => {
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
    // Create blob and download
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
  const maxRange = 1000; // Maximum allowed count value
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
        borderRadius: "8px",
        padding: "1rem",
        gap: "8px",
        border: "1px solid #EAECF0",
        boxShadow: "0px 1px 2px 0px #1018280D",
        backgroundColor: "#FFFFFF",
        height: "100%",
        overflow: "hidden",
      }}
    >
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
          maxWidth: "100%",
          //   flexGrow: 1,
        }}
      >
        Planner Coding Panel
      </Typography>
      <Divider />
      <Stack spacing={1}>
        <Stack direction={"row"} spacing={0.5}>
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
            }}
          >
            Dimension:
          </Typography>
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
            }}
          >
            {currentDimension}
          </Typography>
        </Stack>
        <Stack direction={"row"} spacing={0.5}>
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
            }}
          >
            Value:
          </Typography>
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
            }}
          >
            {currentValue}
          </Typography>
        </Stack>
        {adjust_data.kwargs.adjustment_type !== "cut_history" && (
          <CustomDatePicker
            showLabel
            label="Start Date"
            path="kwargs.date_range[0]"
            target="adjust"
            key={`start-date-${refresh}`}
          />
        )}
        <CustomDatePicker
          showLabel
          label={`${
            adjust_data.kwargs.adjustment_type !== "cut_history"
              ? "End Date"
              : "Cut History Till:-"
          }`}
          path="kwargs.date_range[1]"
          target="adjust"
          key={`end-date-${refresh}`}
        />
        {/* <CustomAutocomplete
          showLabel
          placeholder="Select enrichment type"
          label="Enrichment type"
          values={["uplift"]}
          isMultiSelect={false}
          path="kwargs.enrichment_type"
          target="enrichment"
          disableClearable
        /> */}
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
        />

        {adjust_data.kwargs.adjustment_type !== "cut_history" && (
          <CustomCounter
            showLabel
            placeholder="Select Adjust value"
            label="Percentage"
            path="kwargs.adjustment_value"
            target={"adjust"}
            maxRange={maxRange}
            minRange={minRange}
            key={`value-${refresh}-${adjust_data.kwargs.adjustment_type}`}
          />
        )}
        {adjust_data.kwargs.adjustment_type !== "uplift" &&
          adjust_data.kwargs.adjustment_type !== "cut_history" &&
          adjust_data.kwargs.adjustment_type !== "stockout_correction" &&
          adjust_data.kwargs.adjustment_type !== "replace_value" &&
          adjust_data.kwargs.adjustment_type !== "uplift_by_value" && (
            <>
              <CustomCounter
                showLabel
                placeholder="Select Time Steps"
                label="time steps"
                path="kwargs.time_steps"
                target={"adjust"}
                maxRange={999}
                minRange={0}
                key={`value-${refresh}-${adjust_data.kwargs.adjustment_type}`}
              />

              <CustomAutocomplete
                showLabel
                placeholder="Select Refrence Data"
                label="Type"
                values={["future", "history"]}
                isMultiSelect={false}
                path="kwargs.future_history"
                target="adjust"
                disableClearable
                key={`value-${refresh}`}
              />
            </>
          )}

        <CustomButton
          title={"Add Operation"}
          onClick={async () => {
            if (adjust_data.kwargs.adjustment_type === "cut_history") {
              setAdjustmentStartDate(
                moment.utc("1990-01-01", "YYYY-MM-DD").format("YYYY-MM-DD")
              );
            }
            await addAdjustData();
            setAdjustmentAdjustValue(0);
            // setEnrichmentStartDate(null);
            // setEnrichmentEndDate(null);
            if (currentDimension !== "all") {
              setAdjustmentDimension(currentDimension);
              setAdjustmentValue(currentValue);
            } else {
              setAdjustmentDimension("None");
              setAdjustmentValue("None");
            }

            setRefresh(!refresh);
          }}
        />
      </Stack>
      {<Divider />}
      <Stack spacing={1} height={"120px"}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Typography
            // flex={1}
            // display={"flex"}
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              textAlign: "left",
              color: "#344054",
              // marginBottom: "6px",
              textTransform: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            Operations :
          </Typography>
          <Stack direction={"row"} alignItems={"center"} spacing={0.7}>
            <IconButton
              onClick={() => setUploadAdjustmentsGuideOpen(true)}
              sx={{ padding: 0 }}
            >
              <TipsAndUpdatesIcon />
            </IconButton>
            <IconButton onClick={downloadCSV} sx={{ padding: 0 }}>
              <FileDownloadOutlinedIcon />
            </IconButton>
            <IconButton
              onClick={() => setUploadAdjustmentsOpen(true)}
              sx={{ padding: 0 }}
            >
              <FileUploadOutlinedIcon />
            </IconButton>
            <IconButton
              onClick={() => setDetailsDialogOpen(true)}
              sx={{ padding: 0 }}
            >
              <FullscreenOutlinedIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Stack flex={1} display={"flex"} overflow={"auto"}>
          {operations.filter(
            (operation) => operation.operation === "adjust_data"
          ).length > 0 ? (
            <CustomScrollbar padding={"2px"}>
              <Stack
                direction={"row"}
                spacing={1}
                sx={{
                  overflowX: "auto", // Enable horizontal scrolling
                  whiteSpace: "nowrap", // Prevent items from wrapping to the next line
                  maxWidth: "100%", // Optional: ensures the stack does not exceed its container
                }}
              >
                {operations
                  .filter((operation) => operation.operation === "adjust_data")
                  .map((adjustment, index) => {
                    return (
                      <CustomTooltip
                        arrow
                        title={
                          adjustment.kwargs.adjustment_type ===
                          "cut_history" ? (
                            <Typography>
                              History Cut till{" "}
                              {formatDate(adjustment.kwargs.date_range[1])}
                            </Typography>
                          ) : (
                            <Stack spacing={0.5}>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <Typography>
                                  {formatDate(adjustment.kwargs.date_range[0])}
                                </Typography>
                                <Typography>-</Typography>
                                <Typography>
                                  {formatDate(adjustment.kwargs.date_range[1])}
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <Typography>
                                  {adjustment.kwargs.adjustment_type}
                                </Typography>
                                <Typography>by</Typography>
                                <Typography>
                                  {adjustment.kwargs.adjustment_value}
                                </Typography>
                              </Stack>
                            </Stack>
                          )
                        }
                      >
                        <Chip
                          label={
                            adjustment.kwargs.dimension === "None"
                              ? "All"
                              : `${adjustment.kwargs.dimension} - ${adjustment.kwargs.value}`
                          }
                          onDelete={() => {
                            removePlannerAdjustmentByIndex(index + 1);
                          }}
                        />
                      </CustomTooltip>
                    );
                  })}
              </Stack>
            </CustomScrollbar>
          ) : (
            <Stack alignItems={"center"} justifyContent={"center"} flex={1}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  textAlign: "left",
                  color: "#34405460",
                  marginBottom: "6px",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                No Operations added
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
      {/* Add the UploadAdjustments dialog */}
      <UploadAdjustments
        open={uploadAdjustmentsOpen}
        handleClose={() => setUploadAdjustmentsOpen(false)}
        currentAdjustments={adjustments}
        onAdjustmentsUpdate={handleAdjustmentsUpdate}
        dimensionFilterData={dimensionFilterData}
        types={metricTypeValues}
        columns={columns}
      />

      {/* Add AdjustmentDetailsDialog */}
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
