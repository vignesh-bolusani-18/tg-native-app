import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import axios from "axios";
import BotDisplay from "./BotDisplay";
import InitialMessage from "./InitialMessage";
import ModelSelector from "./ModelSelector";
import { v4 as uuidv4 } from "uuid";
import useDashboard from "../../hooks/useDashboard";
import { fetchTxtFromS3 } from "../../utils/s3Utils";
import { getAuthToken } from "../../redux/actions/authActions";
import SendIcon from "../../assets/Icons/send.svg";
import CloseIcon from "../../assets/Icons/close-btn.svg";
import CloseIconDark from "../../assets/Icons/close-btn-dark.svg";
import ClearChatIcon from "../../assets/Icons/clear-chat-icon.svg";
import ModelSettings from "../../assets/Icons/setting-btn.svg";
import LayerIcon from "../../assets/Icons/multilayer.svg";
import AddIcon from "../../assets/Icons/addContext.svg";
import Maximize from "../../assets/Icons/maximize.svg";
import Minimize from "../../assets/Icons/minimize.svg";
import { fetchRelatedQueries } from "./ChatbotFunctions";
import Related from "./Related";
import { generateToken, processToken } from "../../utils/jwtUtils";

const Chatbot = ({
  userID,
  handleTogglePopup,
  handleToggleSize,
  isLargeSize,
}) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const { experimentBasePath, selectedModel, setSelectedModel } =
    useDashboard();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(uuidv4());
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [contextFiles, setContextFiles] = useState([
    { label: "No Context", value: null },
    { label: "Inventory Data", value: null },
    { label: "Forecast Data", value: null },
  ]);

  useEffect(() => {
    if (experimentBasePath) {
      setContextFiles([
        { label: "No Context", value: null },
        {
          label: "Inventory Data",
          value: `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.txt`,
        },
        {
          label: "Forecast Data",
          value: `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.txt`,
        },
      ]);
    } else {
      setContextFiles([{ label: "No Context", value: null }]);
    }
  }, [experimentBasePath]);
  const [selectedContextFile, setSelectedContextFile] = useState(null);
  const [contextAnchorEl, setContextAnchorEl] = useState(null);
  const openContextMenu = Boolean(contextAnchorEl);

  const messagesEndRef = useRef(null);
  const [relatedQueries, setRelatedQueries] = useState([]);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setRelatedQueries([]);

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: query }]);
    setQuery("");
    setHasUserInteracted(true);

    let fileContent = null;
    if (experimentBasePath && selectedContextFile !== null) {
      fileContent = await fetchTxtFromS3(selectedContextFile);

      if (!fileContent) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            type: "bot",
            text: "Error fetching context file. Please try again.",
          },
        ]);
        setIsLoading(false);
        return;
      }
    }

    if (
      contextFiles.find((file) => file.value === selectedContextFile)?.label !==
      "No Context"
    ) {
      try {
        setIsLoading(true);
        console.log("This Condition was hit");
        const Token = await getAuthToken(userID,);
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const actionLambdaUrl = `${baseURL}/aiaction?t=${Date.now()}`;
        const actionPayload = {
          query,
          contextKey: fileContent,
          llmModel: selectedModel,
          conversationId,
        };
        const actionbotPayloadToken = await generateToken(actionPayload, Token);

        const actionResponse = await axios.post(
          actionLambdaUrl,
          { actionbotPayloadToken },
          {
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY,
              "Content-Type": "application/json",
              Authorization: `Bearer ${Token}`,
            },
          }
        );

        const actionbotresponseToken = actionResponse.data.bot1Message;

        const actionbotMessage = await processToken(actionbotresponseToken);


        const  bot1Message  = actionbotMessage.initialPlan;


        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: bot1Message || "Processing your query as a Data Scientist...",
          },
        ]);
      } catch (error) {
        console.error("Error Calling first action response Lambda", error);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Error determining the action. Please try again Later. ",
          },
        ]);
      }
    }

    // Start backend processing after the dummy message
    setTimeout(async () => {
      setMessages((prev) => [
        ...prev,
        { type: "loading", stage: "loading", text: "Generating code..." },
      ]);

      try {
        // Simulate generating code step
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.type === "loading"
                ? { ...msg, stage: "done", text: "Generating code: done" }
                : msg
            )
          );

          // Simulate creating report step
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.type === "loading"
                  ? { ...msg, stage: "report", text: "Creating report" }
                  : msg
              )
            );
          }, 2000);
        }, 2000);
        const promptLabel = "summary";
        const s3FilePath = "analyst-SummarizeResult.txt";
        const Token = await getAuthToken(userID,);
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const backendUrl = `${baseURL}/aichatBot?t=${Date.now()}`;
        console.log(
          "The conversation id for main chatbot handler is",
          conversationId
        );
        const payload = {
          query,
          contextKey: fileContent,
          experimentBasePath,
          llmModel: selectedModel,
          conversationId,
          promptLabel: promptLabel,
          s3FilePath: s3FilePath,
          contextLabel:
            contextFiles.find((file) => file.value === selectedContextFile)
              ?.label || "No Context",
        };
        const mainbotPayloadToken = await generateToken(payload, Token);

        console.log("teh authroization token is",`Bearer ${Token}`);

        const response = await axios.post(
          backendUrl,
          { mainbotPayloadToken },
          {
            headers: {
              "x-api-key": process.env.REACT_APP_API_KEY,
              "Content-Type": "application/json",
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const mainbotreponseToken = response.data.mainbotMesage;
        console.log("The mainbotresponsetoken  is",mainbotreponseToken);
        const mainbotMesage = await processToken(mainbotreponseToken);

        const { botMessage, pythonLambdaResult, hasContext, summaryContext } = mainbotMesage || {};
        let parsedSummary = {};
        console.log("The raw summary result is ", summaryContext);
        if (summaryContext) {
          try {
            parsedSummary = JSON.parse(summaryContext);
          } catch (error) {
            console.error("Error parsing summaryContext:", error);
            parsedSummary = {}; // Fallback to an empty object
          }
        } else {
          console.warn("summaryContext is empty or undefined");
        }
        console.log("Has Context:", hasContext);
        const cleanedBotMessage = botMessage
          .replace(/```/g, "")
          .replace(/^json/, "");

        console.log("cleaned botmessage is", cleanedBotMessage);
        console.log("pythonlambda result is", pythonLambdaResult);

        let parsedPythonLambdaResult = null;

        if (pythonLambdaResult) {
          try {
            // Convert to string only if necessary
            let jsonString =
              typeof pythonLambdaResult === "string"
                ? pythonLambdaResult
                : JSON.stringify(pythonLambdaResult);

            // Replace NaN with null
            jsonString = jsonString.replace(/\bNaN\b/g, "null");

            // Parse JSON safely
            parsedPythonLambdaResult = JSON.parse(jsonString);

            console.log(
              "The parsed pythonLambdaResult is ",
              parsedPythonLambdaResult
            );
          } catch (error) {
            console.error("Failed to parse pythonLambdaResult:", error, {
              receivedValue: pythonLambdaResult,
            });
          }
        }
        if (hasContext === false) {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { type: "bot", text: cleanedBotMessage, hasContext },
            ...(parsedPythonLambdaResult
              ? [
                  {
                    type: "lambdaResult",
                    result: parsedPythonLambdaResult.result || [],
                    output:
                      parsedPythonLambdaResult.output || "No output available",
                    error_output:
                      parsedPythonLambdaResult.error_output ||
                      "No errors reported",
                    hasContext,
                  },
                ]
              : []),
          ]);
        }
        // { type: "bot", text: cleanedBotMessage ,hasContext},
        if (hasContext === true) {
          console.log(
            "The result from sandbox is",
            parsedPythonLambdaResult.result
          );
          console.log("The query just before invoking related is", query);
          const fetchedRelatedQueries = await fetchRelatedQueries(
            userID,
            query,
            selectedModel,
            conversationId
          );
          console.log(
            "The fetching of related query yielded in",
            fetchedRelatedQueries
          );
          setRelatedQueries(fetchedRelatedQueries || []); //  Store related queries in state

          setMessages((prev) => [
            ...prev.slice(0, -1),
            ...(parsedPythonLambdaResult
              ? [
                  {
                    type: "lambdaResult",
                    result: parsedPythonLambdaResult.result || [],
                    pythonCode: cleanedBotMessage,
                    output:
                      parsedPythonLambdaResult.output || "No output available",
                    error_output:
                      parsedPythonLambdaResult.error_output ||
                      "No errors reported",
                    hasContext,
                    summary:
                      parsedSummary?.bot4Message || "No summary available",
                    related: relatedQueries || [],
                  },
                ]
              : []),
          ]);
        }
        setTimeout(() => {
          setIsProcessingComplete(true);
          scrollToBottom();
        }, 1000);
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { type: "bot", text: "Error, please try again later." },
        ]);
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
    }, 1000);
  };

  const handleSendQuery = (inputQuery) => {
    if (inputQuery) {
      setQuery(inputQuery);
      handleSubmit(inputQuery);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleContextMenuOpen = (event) => {
    setContextAnchorEl(event.currentTarget);
  };

  const handleContextMenuClose = () => {
    setContextAnchorEl(null);
  };

  const clearChatMessages = () => {
    setMessages([]);
    setRelatedQueries([]);
    localStorage.removeItem("chatMessages");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        padding: "0px",
        boxSizing: "border-box",
        zIndex: 2000,
        overflow: "visible",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(90deg, rgba(38, 103, 116, 1) 0%, rgba(71, 193, 218, 1) 100%)",
          padding: "8px 12px",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#ffffff",
            fontSize: "0.9rem",
            fontWeight: "bold",
          }}
        >
          Chat with TG Agent
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconButton
            color="inherit"
            onClick={handleToggleSize}
            sx={{ color: "#ffffff" }}
          >
            <img
              src={isLargeSize ? Minimize : Maximize}
              alt="Resize Icon"
              style={{
                width: "16px",
                height: "16px",
                color: "white",
              }}
            />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ color: "#ffffff" }}
          >
            <img
              src={ModelSettings}
              alt="Model Selector"
              style={{
                width: "20px",
                height: "20px",
              }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            sx={{ marginTop: "4px" }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ModelSelector onSelectModel={setSelectedModel} />
            </MenuItem>
          </Menu>
          <IconButton
            color="inherit"
            onClick={clearChatMessages}
            sx={{ color: "#ffffff" }}
          >
            <img
              src={ClearChatIcon}
              alt="Clear Chat Icon"
              style={{
                width: "15px",
                height: "15px",
              }}
            />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleTogglePopup}
            sx={{ color: "#ffffff" }}
          >
            <img
              src={CloseIcon}
              alt="Close Icon"
              style={{
                width: "15px",
                height: "15px",
              }}
            />
          </IconButton>
        </Box>
      </Box>
      {!hasUserInteracted && <InitialMessage onSendQuery={handleSendQuery} />}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: "#fafafa",
          borderRadius: "0 0 8px 8px",
          padding: "8px",
          marginBottom: "8px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Bot Display (Messages) */}
        <BotDisplay
          messages={messages}
          noContext={selectedContextFile === null}
          conversationId={conversationId}
        />

        {/* Render Related Component After Processing Completes */}
        {isProcessingComplete && relatedQueries.length > 0 && (
          <Related
            relatedOptions={relatedQueries}
            onSendQuery={handleSendQuery}
            clearRelated={() => setRelatedQueries([])}
          />
        )}

        <div ref={messagesEndRef}></div>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "8px",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              border: "1px solid rgba(210, 210, 210, 1)",
              backgroundColor: "rgba(255, 255, 255, 1)",
              borderRadius: "15px",
              width: "60px",
              height: "32px",
              cursor: "pointer",
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            onClick={handleContextMenuOpen}
          >
            <img
              src={AddIcon}
              alt="Add Context"
              style={{
                width: "13px",
                height: "13px",
                marginRight: "2px",
              }}
            />
            <img
              src={LayerIcon}
              alt="Layer Icon"
              style={{
                width: "12px",
                height: "12px",
              }}
            />
          </Box>

          {!selectedContextFile ? (
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.9rem",
                color: "#aaa",
                fontStyle: "italic",
              }}
            >
              No context selected. Conversing in global context (default)
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(237, 237, 237, 1)",
                borderRadius: "16px",
                padding: "4px 8px",
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                gap: "4px",
              }}
            >
              <img
                src={LayerIcon}
                alt="Layer Icon"
                style={{
                  width: "16px",
                  height: "16px",
                  marginRight: "4px",
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontSize: "0.9rem", color: "#333" }}
              >
                {
                  contextFiles.find(
                    (file) => file.value === selectedContextFile
                  )?.label
                }
              </Typography>
              <IconButton
                size="small"
                onClick={() => setSelectedContextFile(null)}
                sx={{
                  color: "#333",
                  padding: "2px",
                  marginLeft: "4px",
                }}
              >
                <img
                  src={CloseIconDark}
                  alt="Close Icon"
                  style={{
                    width: "13px",
                    height: "13px",
                  }}
                />
              </IconButton>
            </Box>
          )}
        </Box>

        <Menu
          anchorEl={contextAnchorEl}
          open={openContextMenu}
          onClose={handleContextMenuClose}
          sx={{
            zIndex: 3000,
            "& .MuiPaper-root": {
              backgroundColor: "rgba(255, 255, 255, 1)",
              border: "1px solidrgba(226, 226, 226, 1) ",
              borderRadius: "10px",
            },
          }}
        >
          {contextFiles.map((file) => (
            <MenuItem
              key={file.value}
              onClick={() => {
                setSelectedContextFile(file.value);
                handleContextMenuClose();
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src={LayerIcon}
                alt="Layer Icon"
                style={{
                  width: "16px",
                  height: "16px",
                }}
              />
              {file.label}
            </MenuItem>
          ))}
        </Menu>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
            backgroundColor: "#ffffff",
          }}
        >
          <TextField
            fullWidth
            placeholder="Message TG Agent..."
            variant="standard"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            multiline
            maxRows={4}
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              fontSize: "1rem",
              marginLeft: "8px",
              color: "#333",
              "&::placeholder": {
                color: "#aaa",
              },
            }}
          />
          <Box
            onClick={handleSubmit}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(71, 193, 218, 0.1)",
              },
            }}
          >
            <img
              src={SendIcon}
              alt="Send Icon"
              style={{
                width: "20px",
                height: "20px",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Chatbot;
