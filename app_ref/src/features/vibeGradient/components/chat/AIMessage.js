import React from "react";
import { Box, Typography } from "@mui/material";
import TGLogo from "../../../../assets/Images/tg_logo6.svg";
import { STYLES } from "../../constants";
import ApprovalSection from "../user-actions/ApprovalSection";
import DataUploadSection from "../user-actions/DataUploadSection";
import SampleDataSection from "../user-actions/SampleDataSection";
import TagsSection from "../user-actions/TagsSection";
import ContextQuestionsSection from "../user-actions/ContextQuestionsSection";
import ExperimentExecutorSection from "../user-actions/ExperimentExecutorSection";
import AdvancedQuestionsSection from "../user-actions/AdvancedQuestionsSection";
import { useVibe } from "../../../../hooks/useVibe";
import ExperimentProgressTracker from "../user-actions/ExperimentProgressTracker";
import AIMessageCodeBlock from "./AIMessageCodeBlock";
import AIMessageDataTable from "./AIMessageDataTable";

const AIMessage = ({
  message,
  toolsUsed = [],
  setIsWaitingForAI,
  isDrawer,
}) => {
  const { currentConversation } = useVibe();
  const experiments = currentConversation?.experiments;
  const experimentTriggered =
    experiments &&
    typeof experiments === "object" &&
    Object.keys(experiments).length > 0;

  console.log("AIMessage: experimentTriggered =", experimentTriggered);
  // Get the first experiment ID from the experiments object
  const experimentId = experimentTriggered ? Object.keys(experiments)[0] : null;
  console.log("AIMessage: experimentId =", experimentId);

  // Extract tool calls from message if available
  const toolCalls = message.toolCalls || [];

  // Scenarios control which sections to show
  const scenarios = Array.isArray(message?.scenarios) ? message.scenarios : [];
  const showCodeSection = scenarios.includes("code");
  const showDataSection = scenarios.includes("data");

  const needsApproval =
    message?.langgraphState?.next_step?.user === "approve_module" ||
    message?.langgraphState?.next_step?.user === "approved";
  const approvalData = message?.langgraphState;

  const needsUploadData =
    message?.langgraphState?.next_step?.user === "upload_data" ||
    message?.langgraphState?.next_step?.user === "uploaded_data";
  const uploadData = message?.langgraphState;

  // Check for sample data section
  const hasSampleData = message?.sampleData;
  const sampleData = message?.sampleData;

  // Check for tags section
  const hasTagsData = message?.tagsData;
  const tagsData = message?.tagsData;

  // Check context node

  const showContextQuestions =
    message?.nodeName === "context_questions_generator";
  const contextQuestions = message?.langgraphState?.context_questions;

  // Check for advanced questions section
  const showAdvancedQuestions =
    message?.nodeName === "advanced_questions_generator";
  const advancedQuestions = message?.langgraphState?.advanced_questions;

  const showExperimentValidator = message?.nodeName === "experiment_validator";

  const showExperimentProgressTracker =
    message?.nodeName === "workflow_complete";

  // Function to beautify tool names
  const beautifyToolName = (toolName) => {
    return toolName
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  };

  // Helper function to render text with bold formatting
  const renderBoldText = (text) => {
    if (!text.includes("**")) return text;

    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, partIndex) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Box
            key={partIndex}
            component="span"
            sx={{
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {part.slice(2, -2)}
          </Box>
        );
      }
      return part;
    });
  };

  // Function to format the AI response with ChatGPT-like typography
  const formatAIResponse = (text) => {
    if (!text) return text;

    // Split by lines but keep empty lines for spacing
    const lines = text.split("\n");
    const result = [];
    let i = 0;
    let inCodeBlock = false;
    let codeLines = [];

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const nextLine = i < lines.length - 1 ? lines[i + 1]?.trim() : "";

      // Handle fenced code blocks ```...```
      if (trimmedLine.startsWith("```")) {
        // Toggle code block state
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLines = [];
          i++;
          continue;
        } else {
          // Closing fence - render accumulated code
          inCodeBlock = false;
          const codeContent = codeLines.join("\n");

          result.push(
            <Box
              key={`code-${i}`}
              sx={{
                mb: { xs: 2, sm: 2.5 },
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#f9fafb",
                  borderRadius: { xs: "6px", sm: "8px" },
                  border: "1px solid #e5e7eb",
                  p: { xs: 1.5, sm: 2 },
                  overflowX: "auto",
                }}
              >
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    lineHeight: 1.6,
                    color: STYLES.COLORS.TEXT_PRIMARY,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
                    whiteSpace: "pre",
                  }}
                >
                  {codeContent}
                </Box>
              </Box>
            </Box>
          );

          i++;
          continue;
        }
      }

      if (inCodeBlock) {
        codeLines.push(line);
        i++;
        continue;
      }

      // Skip empty lines but add spacing
      if (!trimmedLine) {
        // Only add spacing if there's content before and after
        if (i > 0 && i < lines.length - 1 && lines[i - 1]?.trim() && nextLine) {
          result.push(
            <Box key={`spacer-${i}`} sx={{ mb: { xs: 1, sm: 1.5 } }} />
          );
        }
        i++;
        continue;
      }

      // Check for markdown-style headings (#, ##, etc.)
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];

        const fontSizes = {
          1: { xs: "1.15rem", sm: "1.25rem" },
          2: { xs: "1.05rem", sm: "1.15rem" },
          3: { xs: "0.98rem", sm: "1.05rem" },
          4: { xs: "0.95rem", sm: "1rem" },
          5: { xs: "0.9rem", sm: "0.95rem" },
          6: { xs: "0.85rem", sm: "0.9rem" },
        };

        result.push(
          <Typography
            key={`heading-${i}`}
            sx={{
              fontSize: fontSizes[level] || fontSizes[3],
              fontWeight: 600,
              color: "#111827",
              mb: { xs: 1.5, sm: 2 },
              mt: result.length > 0 ? { xs: 2, sm: 3 } : 0,
              fontFamily: STYLES.FONTS.PRIMARY,
              wordBreak: "break-word",
            }}
          >
            {renderBoldText(content)}
          </Typography>
        );
        i++;
        continue;
      }

      // Check for numbered lists (1., 2., etc.)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        result.push(
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              mb: { xs: 1, sm: 1.5 },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                fontWeight: 500,
                color: STYLES.COLORS.TEXT_SECONDARY,
                mr: { xs: 1.5, sm: 2 },
                minWidth: { xs: "1.2rem", sm: "1.5rem" },
                textAlign: "center",
                fontFamily: STYLES.FONTS.PRIMARY,
                flexShrink: 0,
              }}
            >
              {numberedMatch[1]}.
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                lineHeight: 1.6,
                color: STYLES.COLORS.TEXT_PRIMARY,
                fontWeight: 400,
                flex: 1,
                fontFamily: STYLES.FONTS.PRIMARY,
                wordBreak: "break-word",
              }}
            >
              {renderBoldText(numberedMatch[2])}
            </Typography>
          </Box>
        );
        i++;
        continue;
      }

      // Check for bullet points on same line (- or • with content)
      const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)$/);
      if (bulletMatch) {
        result.push(
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              mb: { xs: 1, sm: 1.5 },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                color: STYLES.COLORS.TEXT_SECONDARY,
                mr: { xs: 1.5, sm: 2 },
                minWidth: { xs: "1.2rem", sm: "1.5rem" },
                textAlign: "center",
                fontFamily: STYLES.FONTS.PRIMARY,
                flexShrink: 0,
              }}
            >
              •
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                lineHeight: 1.6,
                color: STYLES.COLORS.TEXT_PRIMARY,
                fontWeight: 400,
                flex: 1,
                fontFamily: STYLES.FONTS.PRIMARY,
                wordBreak: "break-word",
              }}
            >
              {renderBoldText(bulletMatch[1])}
            </Typography>
          </Box>
        );
        i++;
        continue;
      }

      // Check for standalone bullet point (• on its own line, content on next line)
      if (trimmedLine === "•" || trimmedLine === "-") {
        // Get the content from the next non-empty line
        let contentLine = "";
        let nextIndex = i + 1;

        // Skip empty lines to find the content
        while (nextIndex < lines.length && !lines[nextIndex]?.trim()) {
          nextIndex++;
        }

        if (nextIndex < lines.length) {
          contentLine = lines[nextIndex].trim();
        }

        if (contentLine) {
          result.push(
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                mb: { xs: 1, sm: 1.5 },
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  color: STYLES.COLORS.TEXT_SECONDARY,
                  mr: { xs: 1.5, sm: 2 },
                  minWidth: { xs: "1.2rem", sm: "1.5rem" },
                  textAlign: "center",
                  fontFamily: STYLES.FONTS.PRIMARY,
                  flexShrink: 0,
                }}
              >
                •
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  lineHeight: 1.6,
                  color: STYLES.COLORS.TEXT_PRIMARY,
                  fontWeight: 400,
                  flex: 1,
                  fontFamily: STYLES.FONTS.PRIMARY,
                  wordBreak: "break-word",
                }}
              >
                {renderBoldText(contentLine)}
              </Typography>
            </Box>
          );
          // Skip the content line since we've processed it
          i = nextIndex + 1;
          continue;
        }
      }

      // Check for headers (lines that end with :)
      if (trimmedLine.endsWith(":")) {
        result.push(
          <Typography
            key={i}
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 600,
              color: "#111827",
              mb: { xs: 1.5, sm: 2 },
              mt: result.length > 0 ? { xs: 2, sm: 3 } : 0,
              fontFamily: STYLES.FONTS.PRIMARY,
              wordBreak: "break-word",
            }}
          >
            {renderBoldText(trimmedLine)}
          </Typography>
        );
        i++;
        continue;
      }

      // Regular paragraph with bold text support
      result.push(
        <Typography
          key={i}
          sx={{
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            lineHeight: 1.6,
            color: STYLES.COLORS.TEXT_PRIMARY,
            fontWeight: 400,
            mb: { xs: 1.5, sm: 2 },
            whiteSpace: "pre-wrap",
            fontFamily: STYLES.FONTS.PRIMARY,
            wordBreak: "break-word",
          }}
        >
          {renderBoldText(trimmedLine)}
        </Typography>
      );
      i++;
    }

    return result;
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        py: { xs: 1, sm: 1.5 },
        backgroundColor: STYLES.COLORS.BACKGROUND,
      }}
    >
      <Box
        sx={{
          display: "flex",
          maxWidth: { xs: "100%", sm: "100%", md: "100%", lg: "100%" },
          width: "100%",
          mx: "auto",
          px: { xs: 1, sm: 2, md: 3 },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {/* AI Avatar */}
        {!isDrawer && (
          <Box
            sx={{
              width: { xs: 36, sm: 40, md: 45 },
              height: { xs: 36, sm: 40, md: 45 },
              borderRadius: "50%",
              backgroundColor: STYLES.COLORS.BACKGROUND,
              border: `1px solid ${STYLES.COLORS.BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src={TGLogo}
              alt="TrueGradient"
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "70%",
                maxHeight: "70%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        {/* Message Content */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            overflow: "hidden",
          }}
        >
          {/* Tool Calls Section */}
          {toolCalls.length > 0 && (
            <Box
              sx={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: { xs: "6px", sm: "8px" },
                p: { xs: 2, sm: 2.5, md: 3 },
                mb: { xs: 2, sm: 2.5, md: 3 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: { xs: 1.5, sm: 2 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 3, sm: 4 },
                    height: { xs: 3, sm: 4 },
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontFamily: STYLES.FONTS.PRIMARY,
                  }}
                >
                  Tools Used
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                {toolCalls.map((toolCall, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: { xs: 1.5, sm: 2 },
                      p: { xs: 1.5, sm: 2 },
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: { xs: "4px", sm: "6px" },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 2.5, sm: 3 },
                        height: { xs: 2.5, sm: 3 },
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                        flexShrink: 0,
                        mt: { xs: 0.3, sm: 0.5 },
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          fontWeight: 600,
                          color: "#1e40af",
                          mb: 0.5,
                          fontFamily: STYLES.FONTS.PRIMARY,
                          wordBreak: "break-word",
                        }}
                      >
                        {beautifyToolName(toolCall.toolName)}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          lineHeight: 1.4,
                          color: STYLES.COLORS.TEXT_PRIMARY,
                          fontWeight: 400,
                          fontFamily: STYLES.FONTS.PRIMARY,
                          wordBreak: "break-word",
                        }}
                      >
                        {toolCall.message}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* AI Output Sections: Content -> Code -> Data with dividers */}
          {message?.content && (
            <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
              {formatAIResponse(message.content)}
            </Box>
          )}

          {message?.content && showCodeSection && message?.code && (
            <Box
              sx={{
                borderTop: "1px solid #e5e7eb",
                my: { xs: 1.5, sm: 2 },
              }}
            />
          )}

          {showCodeSection && message?.code && (
            <AIMessageCodeBlock
              code={message.code}
              title={message?.codeTitle}
            />
          )}

          {showCodeSection &&
            message?.code &&
            showDataSection &&
            message?.data && (
              <Box
                sx={{
                  borderTop: "1px solid #e5e7eb",
                  my: { xs: 1.5, sm: 2 },
                }}
              />
            )}

          {showDataSection &&
            Array.isArray(message?.data) &&
            message.data.length > 0 && (
              <AIMessageDataTable
                data={message.data}
                title={message?.dataTitle}
                message={message}
              />
            )}

          {/* Approval Section */}
          {needsApproval && approvalData && (
            <ApprovalSection
              approvalData={approvalData}
              messageId={message.id}
            />
          )}

          {/* Data Upload Section */}
          {needsUploadData && uploadData && (
            <DataUploadSection uploadData={uploadData} messageId={message.id} />
          )}

          {/* Sample Data Section */}
          {hasSampleData && sampleData && (
            <SampleDataSection sampleData={sampleData} />
          )}

          {/* Tags Section */}
          {hasTagsData && tagsData && (
            <TagsSection
              tagsData={tagsData}
              messageId={message.id}
              langgraphState={message?.langgraphState}
            />
          )}

          {showContextQuestions && contextQuestions && (
            <ContextQuestionsSection
              contextQuestions={contextQuestions}
              messageId={message.id}
              langgraphState={message?.langgraphState}
            />
          )}

          {showAdvancedQuestions && advancedQuestions && (
            <AdvancedQuestionsSection
              advancedQuestions={advancedQuestions}
              messageId={message.id}
              langgraphState={message?.langgraphState}
            />
          )}

          {showExperimentValidator && (
            <ExperimentExecutorSection
              messageId={message.id}
              langgraphState={message?.langgraphState}
            />
          )}
          {showExperimentProgressTracker &&
            experimentId &&
            experimentTriggered && (
              <ExperimentProgressTracker experimentId={experimentId} />
            )}

          {/* Feedback Section */}
          {/* <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              opacity: 0,
              transition: "opacity 0.2s ease",
              "&:hover": {
                opacity: 1,
              },
            }}
          >
            <IconButton
              size="small"
              sx={{
                color: STYLES.COLORS.TEXT_SECONDARY,
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                  color: STYLES.COLORS.TEXT_PRIMARY,
                },
              }}
            >
              <CopyIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: STYLES.COLORS.TEXT_SECONDARY,
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                  color: "#059669",
                },
              }}
            >
              <ThumbUpIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: STYLES.COLORS.TEXT_SECONDARY,
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                  color: "#dc2626",
                },
              }}
            >
              <ThumbDownIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default AIMessage;
