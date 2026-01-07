import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import {
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const AIMessage = ({ message, toolsUsed = [] }) => {
  // Extract tool calls from message if available
  const toolCalls = message.toolCalls || [];

  // Extract final answer (remove "Final Answer:" prefix if present)
  const finalAnswer = message.content.includes("Final Answer:")
    ? message.content.split("Final Answer:")[1].trim()
    : message.content;

  // Function to beautify tool names
  const beautifyToolName = (toolName) => {
    return toolName
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  // Function to format the final answer with better typography
  const formatFinalAnswer = (text) => {
    if (!text) return text;

    // Split by lines to handle different formatting
    const lines = text.split("\n").filter((line) => line.trim());

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Check for numbered lists (1., 2., etc.)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        return (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#1976d2",
                mr: 1.5,
                minWidth: "1.5rem",
                textAlign: "center",
              }}
            >
              {numberedMatch[1]}.
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "#1e293b",
                fontWeight: 400,
                flex: 1,
              }}
            >
              {numberedMatch[2]}
            </Typography>
          </Box>
        );
      }

      // Check for bullet points (- or •)
      const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)$/);
      if (bulletMatch) {
        return (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: "0.875rem",
                color: "#64748b",
                mr: 1.5,
                minWidth: "1.5rem",
                textAlign: "center",
              }}
            >
              •
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "#1e293b",
                fontWeight: 400,
                flex: 1,
              }}
            >
              {bulletMatch[1]}
            </Typography>
          </Box>
        );
      }

      // Check for headers (lines that end with :)
      if (trimmedLine.endsWith(":")) {
        return (
          <Typography
            key={index}
            sx={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#1e293b",
              mb: 1,
              mt: index > 0 ? 2 : 0,
              letterSpacing: "0.025em",
            }}
          >
            {trimmedLine}
          </Typography>
        );
      }

      // Regular paragraph
      return (
        <Typography
          key={index}
          sx={{
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "#1e293b",
            fontWeight: 400,
            mb: 1,
            whiteSpace: "pre-wrap",
          }}
        >
          {trimmedLine}
        </Typography>
      );
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        mb: 2,
        px: 1,
      }}
    >
      <Box
        sx={{
          flex: 1,
          maxWidth: "80%",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Tool Calls Section */}
        {toolCalls.length > 0 && (
          <>
            <Box
              sx={{
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e2e8f0",
                p: 2,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <BuildIcon
                  sx={{
                    fontSize: 16,
                    color: "#64748b",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Tools Used
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {toolCalls.map((toolCall, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      p: 1.5,
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        backgroundColor: "#ffffff",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Chip
                          label={beautifyToolName(toolCall.toolName)}
                          size="small"
                          sx={{
                            fontSize: "0.65rem",
                            height: 20,
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            border: "1px solid #bfdbfe",
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.8rem",
                          lineHeight: 1.4,
                          color: "#374151",
                          fontWeight: 400,
                        }}
                      >
                        {toolCall.message}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Final Answer Section */}
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CheckCircleIcon
              sx={{
                fontSize: 18,
                color: "#059669",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#059669",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Final Answer
            </Typography>
          </Box>

          {formatFinalAnswer(finalAnswer)}
        </Box>
      </Box>
    </Box>
  );
};

export default AIMessage;
