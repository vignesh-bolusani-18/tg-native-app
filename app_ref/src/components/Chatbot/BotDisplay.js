import { Box, Typography, IconButton } from "@mui/material";
import { useState } from "react";
import CustomChatbotTable from "./CustomChatbotTable";
import PythonBotdisplay from "./PythonBotdisplay";
import Related from "./Related";
import Summary from "./summary";
import BotIcon from "../../assets/Icons/tgBotvector.svg";
import GeneratingIcon from "../../assets/Icons/generatingCode.svg";
import GeneratingDoneIcon from "../../assets/Icons/GeneratingCodeDoneIcon.svg";
import CreatingReportIcon from "../../assets/Icons/CreatingReportIcon.svg";
import DownloadCSVButton from "./DownloadCSVButton";
import Maximize from "../../assets/Icons/minimize copy.svg";
import Minimize from "../../assets/Icons/minimize copy.svg";
import ErrorWrapper from "../ErrorWrapper";
const BotDisplay = ({
  messages,
  noContext,
  // isProcessingComplete,
  conversationId,
  // clearChat,
}) => {
  const parseResult = (result) => {
    if (typeof result !== "string") return result;
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error("Failed to parse result:", error);
      return []; // or some other fallback value
    }
  };
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const userLatestMessage = messages
  .filter((msg) => msg.type === "user") 
  .map((msg) => msg.text) 
  .pop(); 
  console.log("The messages in memory are ",messages);
  const latestSummaryMessage = messages.find((msg) => msg.summary);
  const latestSummary = latestSummaryMessage ? latestSummaryMessage.summary : "No summary available";
  
  console.log("The summary in BotDisplay is:", latestSummary);
  
  return (
    <ErrorWrapper>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "16px",
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
            }}
          >
            {/* User Message */}
            {msg.type === "user" ? (
              <Box
                sx={{
                  maxWidth: "85%",
                  backgroundColor: "#f1f1f1",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.2)",
                  color: "#333",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    color: "#333",
                  }}
                >
                  {msg.text}
                </Typography>
              </Box>
            ) : msg.type === "loading" && !noContext ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  backgroundColor:
                    msg.stage === "done"
                      ? "#e8f5e9"
                      : msg.stage === "report"
                      ? "#e3f2fd"
                      : "#e3f2fd",
                  borderRadius: "16px",
                  padding: "6px 6px",
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
                  maxWidth: "fit-content",
                }}
              >
                <Box
                  component="img"
                  src={
                    msg.stage === "done"
                      ? GeneratingDoneIcon
                      : msg.stage === "report"
                      ? CreatingReportIcon
                      : GeneratingIcon
                  }
                  alt={
                    msg.stage === "done"
                      ? "Generating Code Done"
                      : msg.stage === "report"
                      ? "Creating Report"
                      : "Generating Code"
                  }
                  sx={{
                    width: "170px",
                    height: "23px",
                  }}
                />
              </Box>
            ) : (
              // Bot or Lambda Result Message
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  maxWidth: "90%",
                }}
              >
                {/* Bot Icon */}
                <Box
                  component="img"
                  src={BotIcon}
                  alt="Bot Icon"
                  sx={{
                    width: "24px",
                    height: "24px",
                    flexShrink: 0,
                  }}
                />

                {/* Bot Message Display (Text Only) */}
                <Box
                  sx={{
                    maxWidth: "calc(90% - 36px)",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {msg.type === "bot" && (
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        color: "#333",
                        fontSize: "1rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {msg.text}
                    </Typography>
                  )}

                  {/* Lambda Result with PythonBotdisplay Condition */}
                  {msg.type === "lambdaResult" && (
                    <>
                      <Box sx={{ marginTop: "16px", overflowX: "auto" }}>
                        {msg.result && msg.result.length > 0 ? (
                          <>
                            {/* Header with Toggle Button & Download */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "8px",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold" }}
                              >
                                Result:
                              </Typography>

                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {/* Toggle Code Button - Appears First */}
                                {msg.hasContext && (
                                  <IconButton
                                    onClick={() => setIsCodeOpen(!isCodeOpen)}
                                  >
                                    <img
                                      src={isCodeOpen ? Minimize : Maximize}
                                      alt={isCodeOpen ? "Minimize" : "Maximize"}
                                      style={{ width: "20px", height: "20px" }}
                                    />
                                  </IconButton>
                                )}

                                {/* Download CSV Button - Appears After Toggle Button */}
                                <DownloadCSVButton
                                 data={parseResult(msg.result)}
                                  fileName="result_data.csv"
                                />
                              </Box>
                            </Box>

                            {/* Render PythonBotdisplay ABOVE the Table when Expanded */}
                            {isCodeOpen && msg.hasContext && (
                              <PythonBotdisplay message={msg.pythonCode} />
                            )}
                            {/* {isCodeOpen && (
                            <Box sx={{ marginTop: "16px" }}>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold", marginBottom: "8px" }}
                              >
                                Output:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ whiteSpace: "pre-wrap" }}
                              >
                                {msg.output
                                  ? msg.output
                                  : "No output available"}
                              </Typography>
                            </Box>
                          )} */}

                            {isCodeOpen && (
                              <Box sx={{ marginTop: "16px" }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: "bold",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Error Output:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "pre-wrap" }}
                                >
                                  {msg.error_output
                                    ? msg.error_output
                                    : "No error output available"}
                                </Typography>
                              </Box>
                            )}

                            {/* Render Table */}
                            <CustomChatbotTable
                              data={parseResult(msg.result)}
                              isAlreadyTransformed
                            />
                            <Box
                              sx={{
                                marginTop: "16px",
                                padding: "12px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "8px",
                                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: "bold",
                                  marginBottom: "8px",
                                }}
                              >
                                Summary
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#333",
                                  fontSize: "0.9rem",
                                  lineHeight: 1.6,
                                }}
                              >
                              <Summary parsedSummary={latestSummary || "No summary available"} />
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "8px",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold" }}
                              >
                                No results found.
                              </Typography>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {/* Toggle Code Button - Appears First */}
                                {msg.hasContext && (
                                  <IconButton
                                    onClick={() => setIsCodeOpen(!isCodeOpen)}
                                  >
                                    <img
                                      src={isCodeOpen ? Minimize : Maximize}
                                      alt={isCodeOpen ? "Minimize" : "Maximize"}
                                      style={{ width: "20px", height: "20px" }}
                                    />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                            {isCodeOpen && msg.hasContext && (
                              <PythonBotdisplay message={msg.pythonCode} />
                            )}
                            {isCodeOpen && (
                              <Box sx={{ marginTop: "16px" }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: "bold",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Error Output:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ whiteSpace: "pre-wrap" }}
                                >
                                  {msg.error_output
                                    ? msg.error_output
                                    : "No error output available"}
                                </Typography>
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        ))}

        {/* Render Related Component After Processing Completes */}
        {/* {isProcessingComplete && (
          <Box sx={{ marginTop: "16px" }}>
            <Related conversationId={conversationId} userLatestMessage={userLatestMessage}/>
          </Box>
        )} */}
      </Box>
    </ErrorWrapper>
  );
};

export default BotDisplay;
