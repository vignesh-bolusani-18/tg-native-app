import React, { useRef, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { Box, Stack, CircularProgress } from "@mui/material";
import { GRAY, WARNING } from "../theme/custmizations/colors";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import { differenceInMinutes } from "date-fns"; // Assuming you have date-fns installed
import { filter } from "lodash";

// Styled components for your theme
const StyledAccordionSummary = styled(AccordionSummary)(({ isError }) => ({
  backgroundColor: "#ffffff",
  borderBottom: "1px solid #EAECF0",
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 600,
  color: "#101828",
  "& .MuiAccordionSummary-content": {
    justifyContent: "space-between",
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)({
  backgroundColor: "#222222",
  color: "#ffffff",
  fontFamily: "Inter",
  fontSize: "14px",
  lineHeight: "1.6",
  padding: "10px",
  border: "1px solid #EAECF0",
  borderRadius: "4px",
  maxHeight: "300px",
  overflowY: "auto",
  whiteSpace: "pre-wrap",
});

// Function to extract the filename from the file path
const getFileName = (filePath) => {
  return filePath.split("/").pop();
};

const getTime = (time) => {
  return time.split("(")[0];
};

// Function to check if a file is an error log
const isErrorLog = (fileName) => fileName.endsWith("error.log");

const LogsAccordion = ({ logs }) => {
  const accordionRefs = useRef([]);

  // Function to scroll to the bottom of the content
  const scrollToBottom = (index) => {
    const accordionContent = accordionRefs.current[index];
    if (accordionContent) {
      accordionContent.scrollTop = accordionContent.scrollHeight;
    }
  };

  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index} style={{ paddingLeft: "20px" }}>
          {renderContent(item)}
        </div>
      ));
    } else if (typeof content === "object" && content !== null) {
      return Object.entries(content).map(([key, value], index) => (
        <div key={index}>
          <strong>{key}:</strong> {renderContent(value)}
        </div>
      ));
    } else {
      return <Typography>{content}</Typography>;
    }
  };

  const isRecentlyModified = (lastModified) => {
    const now = new Date();
    const logTime = new Date(lastModified);
    console.log("isRecentlyModified", differenceInMinutes(now, logTime) <= 5);

    return differenceInMinutes(now, logTime) <= 5;
  };
  const logsWithContent = logs.filter(
    (log) => log.content && log.content.length > 0
  );
function convertUTCtoLocal(utcDateStr) {
  // Parse the UTC date string
  const utcDate = new Date(utcDateStr);

  // Convert the UTC time to the local time zone of the browser
  const localDate = new Date(utcDate);

  // Format the local date to "DD, MMM YYYY : HH:MM:SS AM/PM"
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const formattedDate = localDate
    .toLocaleString("en-US", options)
    .replace(",", "");
  return formattedDate.replace(",", ":");
}

  return (
    <div>
      {logs.map((log, index) => {
        const fileName = getFileName(log.filePath);
        const lastModified = getTime(log.lastModified?.toString());
        const isError = isErrorLog(fileName);
        const showSpinner = index === 0 && isRecentlyModified(log.lastModified);
        console.log("showSpinner at index: ", index, "::::::", showSpinner);
        const content =
          log.content && log.content.length > 0
            ? log.content
            : isError
            ? ""
            : "Competed Successfully!";
        const hasContent = content !== "";

        if (!hasContent) {
          return null;
        }
        return (
          <Accordion
            key={index}
            onChange={(_, expanded) => {
              if (expanded) {
                setTimeout(() => scrollToBottom(index), 0); // Ensure scrolling happens after rendering
              }
            }}
          >
            <StyledAccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              isError={isError}
            >
              <Stack
                direction="row"
                justifyContent={"space-between"}
                alignItems={"center"}
                flex={1}
                paddingRight={"16px"}
              >
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                  {showSpinner ? (
                    <SettingsRoundedIcon
                      fontSize={"small"}
                      sx={{ color: "#039855" }}
                    />
                  ) : isError ? (
                    <WarningRoundedIcon
                      fontSize="small"
                      style={{ color: WARNING[400] }}
                    />
                  ) : (
                    <CheckCircleRoundedIcon
                      fontSize="small"
                      style={{ color: "#039855" }}
                    />
                  )}
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#101828",
                    }}
                  >
                    {fileName}
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: GRAY[400],
                  }}
                >
                  {convertUTCtoLocal(lastModified)}
                </Typography>
              </Stack>
            </StyledAccordionSummary>
            <StyledAccordionDetails
              ref={(el) => (accordionRefs.current[index] = el)} // Capture ref for each accordion
            >
              {renderContent(content)}
            </StyledAccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};

export default LogsAccordion;
