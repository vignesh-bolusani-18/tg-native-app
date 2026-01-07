import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { Build as BuildIcon } from "@mui/icons-material";

const CurrentProgress = ({ progress, isStreaming }) => {
  // Helper function to check if we should show progress
  const shouldShowProgress = (progressArray) => {
    // Always show progress when streaming, even if no progress data
    if (isStreaming) return true;

    if (!progressArray || progressArray.length === 0) return false;

    const latestProgress = progressArray[progressArray.length - 1];
    // Don't show progress for final_answer - it's not a thinking state
    return latestProgress.message_type !== "final_answer";
  };

  // Function to beautify tool names
  const beautifyToolName = (toolName) => {
    return toolName
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  // Get progress text based on message type
  const getProgressText = (messageType) => {
    switch (messageType) {
      case "ai_understanding":
        return "Understanding your request...";
      case "tool_call":
        return "Calling tool...";
      case "tool_result":
        return "Processing results...";
      case "processing":
        return "Processing...";
      default:
        return "Thinking...";
    }
  };

  // Group progress by tool to show multiple active tools
  const getActiveTools = () => {
    if (!progress || progress.length === 0) {
      // Show generic "Thinking..." if no progress but streaming
      return isStreaming ? [{ type: "thinking", messageType: null }] : [];
    }

    const activeTools = [];
    const toolStates = new Map(); // Track latest state for each tool

    // Process all progress updates to get current state of each tool
    progress.forEach((item) => {
      const toolName = item.details?.tool_name;
      const messageType = item.message_type;
      const step = item.step;

      if (toolName) {
        // Update the latest state for this tool
        toolStates.set(toolName, {
          toolName,
          messageType,
          step,
          timestamp: item.timestamp,
        });
      } else if (messageType === "ai_understanding") {
        // Add AI understanding as a separate item
        activeTools.push({
          type: "ai_understanding",
          messageType,
          step,
          timestamp: item.timestamp,
        });
      }
    });

    // Convert tool states to array and sort by timestamp
    const tools = Array.from(toolStates.values()).map((tool) => ({
      type: "tool",
      ...tool,
    }));

    // Combine AI understanding and tools, sort by timestamp
    const allItems = [...activeTools, ...tools].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Filter out completed tools (final_answer) and return active ones
    return allItems.filter((item) => item.messageType !== "final_answer");
  };

  if (!shouldShowProgress(progress)) return null;

  const activeTools = getActiveTools();

  // If no active tools but streaming, show generic thinking
  if (activeTools.length === 0 && isStreaming) {
    return (
      <Box
        sx={{
          display: "flex",
          mb: 1.5,
          px: 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            maxWidth: "85%",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 2.5,
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
            boxShadow:
              "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow:
                "0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              animation: "pulse 2s ease-in-out infinite",
              boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)",
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.9rem",
              color: "#374151",
              fontWeight: 500,
              flex: 1,
              letterSpacing: "0.025em",
            }}
          >
            Thinking...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      {activeTools.map((tool, index) => (
        <Box
          key={`${tool.type}-${tool.toolName || tool.messageType}-${index}`}
          sx={{
            display: "flex",
            mb: 2,
            px: 1,
            animation: "slideIn 0.3s ease-out",
            animationDelay: `${index * 0.1}s`,
            animationFillMode: "both",
          }}
        >
          <Box
            sx={{
              flex: 1,
              maxWidth: "85%",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 2.5,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
              boxShadow:
                "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow:
                  "0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)",
                transform: "translateY(-1px)",
                borderColor: "#d1d5db",
              },
            }}
          >
            {/* Progress Icon */}
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                animation: isStreaming
                  ? "pulse 2s ease-in-out infinite"
                  : "none",
                boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)",
              }}
            />

            {/* Progress Text */}
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.9rem",
                color: "#374151",
                fontWeight: 500,
                flex: 1,
                letterSpacing: "0.025em",
              }}
            >
              {tool.messageType
                ? getProgressText(tool.messageType)
                : "Thinking..."}
            </Typography>

            {/* Tool Name Chip - Show for tool calls and tool results */}
            {tool.type === "tool" && tool.toolName && (
              <Chip
                icon={<BuildIcon sx={{ fontSize: 16 }} />}
                label={beautifyToolName(tool.toolName)}
                size="small"
                sx={{
                  fontSize: "0.7rem",
                  height: 26,
                  backgroundColor:
                    "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                  color: "#1e40af",
                  border: "1px solid #bfdbfe",
                  fontWeight: 600,
                  letterSpacing: "0.025em",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  "& .MuiChip-icon": {
                    color: "#1e40af",
                  },
                  "&:hover": {
                    backgroundColor:
                      "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  },
                }}
              />
            )}

            {/* Step Number - Only show for tool calls, not AI understanding */}
            {tool.step && tool.type === "tool" && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.65rem",
                  color: "#6b7280",
                  fontWeight: 600,
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1.5,
                  letterSpacing: "0.025em",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
              >
                Step {tool.step}
              </Typography>
            )}
          </Box>
        </Box>
      ))}

      {/* Enhanced CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0% { 
              opacity: 1; 
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            }
            50% { 
              opacity: 0.8; 
              box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
            }
            100% { 
              opacity: 1; 
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default CurrentProgress;
