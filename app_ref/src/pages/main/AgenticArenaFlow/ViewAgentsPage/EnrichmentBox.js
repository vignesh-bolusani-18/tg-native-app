import {
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
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
import UploadEnrichments from "../../../../components/UploadEnrichments";
import EnrichmentDetailsDialog from "../../../../components/EnrichmentDetailsDialog";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import UploadEnrichmentsGuide from "../../../../components/UploadEnrichmentsGuide";

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
  const [refresh, setRefresh] = useState(true);
  const [uploadEnrichmentsOpen, setUploadEnrichmentsOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [uploadEnrichmentsGuideOpen, setUploadEnrichmentsGuideOpen] =
    useState(false);

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
    let columns = [
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
        Enrichment Panel
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
        <CustomDatePicker
          showLabel
          label="Start Date"
          path="kwargs.date_range[0]"
          target="enrichment"
          key={`start-date-${refresh}`}
        />
        <CustomDatePicker
          showLabel
          label="End Date"
          path="kwargs.date_range[1]"
          target="enrichment"
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
        />
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
        />

        <CustomButton
          title={"Add Enrichment"}
          onClick={async () => {
            await addEnrichment();
            setEnrichmentEnrichmentValue(0);
            // setEnrichmentStartDate(null);
            // setEnrichmentEndDate(null);
            if (currentDimension !== "all") {
              setEnrichmentDimension(currentDimension);
              setEnrichmentValue(currentValue);
            } else {
              setEnrichmentDimension("None");
              setEnrichmentValue("None");
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
            Enrichments :
          </Typography>
          <Stack direction={"row"} alignItems={"center"} spacing={0.7}>
            <IconButton
              onClick={() => setUploadEnrichmentsGuideOpen(true)}
              sx={{ padding: 0 }}
            >
              <TipsAndUpdatesIcon />
            </IconButton>
            <IconButton onClick={downloadCSV} sx={{ padding: 0 }}>
              <FileDownloadOutlinedIcon />
            </IconButton>
            <IconButton
              onClick={() => setUploadEnrichmentsOpen(true)}
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
          {enrichment_bydate.length > 0 ? (
            <CustomScrollbar verticalScroll={true} horizontalScroll={false}>
              {enrichment_bydate.map((enrichment, index) => {
                return (
                  <CustomTooltip
                    arrow
                    title={
                      <Stack spacing={0.5}>
                        <Stack
                          direction={"row"}
                          spacing={0.5}
                          alignItems={"center"}
                        >
                          <Typography>
                            {formatDate(enrichment.date_range[0])}
                          </Typography>
                          <Typography>-</Typography>
                          <Typography>
                            {formatDate(enrichment.date_range[1])}
                          </Typography>
                        </Stack>
                        <Stack
                          direction={"row"}
                          spacing={0.5}
                          alignItems={"center"}
                        >
                          {enrichment.enrichment_type === "uplift" ? (
                            <>
                              <Typography>
                                {enrichment.enrichment_type}
                              </Typography>
                              <Typography>by</Typography>
                              <Typography>
                                {enrichment.enrichment_value} %
                              </Typography>
                            </>
                          ) : (
                            <Typography>{`Updated with : ${enrichment.enrichment_type}`}</Typography>
                          )}
                        </Stack>
                      </Stack>
                    }
                  >
                    <Chip
                      label={
                        enrichment.dimension === "None"
                          ? "All"
                          : `${
                              enrichment.dimension === "ts_id"
                                ? "Forecast_Granularity"
                                : enrichment.dimension
                            } - ${enrichment.value}`
                      }
                      sx={{
                        margin: "2px",
                        width: "auto", // Let Chip's width be auto to fit content
                        whiteSpace: "nowrap", // Prevent line breaking in Chip
                      }}
                      onDelete={() => {
                        removeEnrichmentByIndex(index);
                      }}
                    />
                  </CustomTooltip>
                );
              })}
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
                No Enrichments added
              </Typography>
            </Stack>
          )}
        </Stack>
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
