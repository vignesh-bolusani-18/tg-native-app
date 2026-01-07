import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import React from "react";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import useConfig from "../../../../hooks/useConfig";
import { useEffect } from "react";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter";
import CustomButton from "../../../../components/CustomButton";
import CustomScrollbar from "../../../../components/CustomScrollbar";
import CustomTooltip from "../../../../components/CustomToolTip";
import { useState } from "react";

const EnrichmentBox = ({ currentDimension, currentValue }) => {
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
  } = useConfig();
  const [refresh, setRefresh] = useState(true);
  function formatDate(inputDate) {
    // Parse the input string as a Date object
    const date = new Date(inputDate);

    // Specify options for formatting
    const options = { year: "numeric", month: "long", day: "2-digit" };

    // Format the date as "MMMM, dd, yyyy"
    return date.toLocaleDateString("en-US", options);
  }
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
        maxWidth: "100%",
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
            {enrichment.kwargs.dimension}
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
            {enrichment.kwargs.value}
          </Typography>
        </Stack>
        <CustomDatePicker
          showLabel
          label="Enrichment Start Date"
          path="kwargs.date_range[0]"
          target="enrichment"
          key={`start-date-${refresh}`}
        />
        <CustomDatePicker
          showLabel
          label="Enrichment End Date"
          path="kwargs.date_range[1]"
          target="enrichment"
          key={`end-date-${refresh}`}
        />
        <CustomAutocomplete
          showLabel
          placeholder="Select enrichment type"
          label="Enrichment type"
          values={["uplift"]}
          isMultiSelect={false}
          path="kwargs.enrichment_type"
          target="enrichment"
          disableClearable
        />
        <CustomCounter
          showLabel
          placeholder="Select enrichment value"
          label="Enrichment Value"
          path="kwargs.enrichment_value"
          target={"enrichment"}
          maxRange={maxRange}
          minRange={minRange}
          key={`value-${refresh}`}
        />
        <CustomButton
          title={"Add Enrichment"}
          onClick={async () => {
            await addEnrichment();
            setEnrichmentEnrichmentValue(0);
            setEnrichmentStartDate(null);
            setEnrichmentEndDate(null);
            setRefresh(!refresh);
          }}
        />
      </Stack>
      <Divider />
      <Stack spacing={1}>
        {enrichment_bydate.length > 0 ? (
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
            Enrichments :
          </Typography>
        ) : null}
        <CustomScrollbar
          verticalScroll={true}
          horizontalScroll={false}
          padding={"8px"}
        >
          <Stack
            direction={"row"}
            spacing={1}
            paddingBottom={"4px"}
            sx={{
              overflowX: "auto", // Enable horizontal scrolling
              whiteSpace: "nowrap", // Prevent items from wrapping to the next line
              maxHeight: "100%", // Optional: ensures the stack does not exceed its container
            }}
          >
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
                        <Typography>{enrichment.enrichment_type}</Typography>
                        <Typography>by</Typography>
                        <Typography>{enrichment.enrichment_value}</Typography>
                      </Stack>
                    </Stack>
                  }
                >
                  <Chip
                    label={
                      enrichment.dimension === "None"
                        ? "All"
                        : `${enrichment.dimension} - ${enrichment.value}`
                    }
                    onDelete={() => {
                      removeEnrichmentByIndex(index);
                    }}
                  />
                </CustomTooltip>
              );
            })}
          </Stack>
        </CustomScrollbar>
      </Stack>
    </Stack>
  );
};

export default EnrichmentBox;
