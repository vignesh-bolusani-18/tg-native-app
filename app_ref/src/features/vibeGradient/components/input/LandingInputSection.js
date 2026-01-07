import React, { useState, useRef, useEffect, useMemo } from "react";
import { Box, IconButton } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { STYLES, CHAT_CONFIG } from "../../constants";
import MentionEditor from "./MentionEditor";
import useDataset from "../../../../hooks/useDataset";
import { useVibe } from "../../../../hooks/useVibe";


const LandingInputSection = ({
  onSendMessage,
  onStartChat,
  canSendMessage: canSendMessageProp,
  isWaitingForAI,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [hasText, setHasText] = useState(false);
  const inputRef = useRef(null);
  const { datasets_list, datasets_name_list } = useDataset();

  const canSendMessage = canSendMessageProp && !isWaitingForAI;
  const handleEditorChange = (rawContent) => {
    setInputValue(rawContent);
    // Check if there's text in the editor
    const plainText = inputRef.current?.getPlainText?.() || "";
    setHasText(plainText.trim().length > 0);
  };
  // Map datasets_name_list to mentions with correct source paths
  const mentions = useMemo(() => {
    if (!datasets_name_list || !datasets_list) {
      return [];
    }

    return datasets_name_list.map((datasetName) => {
      const dataset = datasets_list.find((d) => d.datasetName === datasetName);
      const sourcePath =
        dataset && dataset.datasetSourceName !== "File Upload"
          ? "api_appended_data"
          : "uploads";

      return {
        name: datasetName,
        value: sourcePath,
        link: sourcePath,
      };
    });
  }, [datasets_name_list, datasets_list]);
  
    //  const interval = setInterval(() => {
    //   console.log(" Current mentions in landing ✅ ");
    // },5000);

 
  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current?.focus) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = (plainText) => {
    if (plainText && plainText.trim() && canSendMessage) {
      onSendMessage(plainText.trim());
      setInputValue("");
      setHasText(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const { creditScore } = useVibe();

//  useEffect(() => {
//   console.log("🏷 LandingInputSection mounted or mentions changed");
//   console.log("  • mentions length:", mentions?.length);
//   console.log("  • sample mentions:", mentions?.slice?.(0,5));
//   console.log("  • datasets_list length:", datasets_list?.length);
//   console.log("  • datasets_name_list length:", datasets_name_list?.length);
// }, [mentions, datasets_list, datasets_name_list]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: {
          xs: "100%",
          sm: "100%",
          md: "100%",
          lg: "100%",
          xl: "100%",
        },
        mx: "auto",
        px: { xs: 1, sm: 2, md: 2 },
      }}
    >
      <Box
        sx={{
          border: `2px solid ${STYLES.COLORS.BORDER}`,
          borderRadius: "24px",
          backgroundColor: STYLES.COLORS.BACKGROUND,
          //boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          transition: creditScore <= 0 ? "none" : "all 0.2s ease",
          cursor: creditScore <= 0 ? "not-allowed" : "pointer",

          "&:hover":
            creditScore <= 0
              ? {}
              : {
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                  borderColor: canSendMessage
                    ? "#d1d5db"
                    : STYLES.COLORS.BORDER,
                },
          "&:focus-within":
            creditScore <= 0
              ? {}
              : {
                  boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.1)",
                  borderColor: canSendMessage
                    ? "#2563eb"
                    : STYLES.COLORS.BORDER,
                },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: { xs: 2, sm: 3 },
            py: { xs: 0.5, sm: 0.5 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>

  <MentionEditor
              value={inputValue}
              onChange={handleEditorChange}
              onSend={handleSend}
              placeholder={
                !canSendMessage ? "Connecting..." : "Ask me anything..."
              }
              disabled={!canSendMessage}
              mentions={mentions}
              editorRef={inputRef}
            />
          </Box>

          <IconButton
            onClick={() => {
              if (inputRef.current?.getPlainText) {
                const plainText = inputRef.current.getPlainText();
                handleSend(plainText);
              }
            }}
            disabled={!hasText || !canSendMessage}
            size="small"
            sx={{
              backgroundColor:
                hasText && canSendMessage ? STYLES.COLORS.PRIMARY : "#f3f4f6",
              color: hasText && canSendMessage ? "white" : "#9ca3af",
              width: 32,
              height: 32,
              flexShrink: 0,
              transition: "all 0.2s ease",
              ml: 1,
              mb: 0.5,
              "&:hover": {
                backgroundColor:
                  hasText && canSendMessage ? "#0d8a6b" : "#e5e7eb",
                transform: hasText && canSendMessage ? "scale(1.05)" : "none",
              },
              "&:disabled": {
                backgroundColor: "#f3f4f6",
                color: "#9ca3af",
              },
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingInputSection;