import React, { useState, useRef } from "react";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { STYLES, CHAT_CONFIG } from "../../constants";
import { useVibe } from "../../../../hooks/useVibe";


const RunningInputSection = ({
  onSendMessage,
  canSendMessage: canSendMessageProp,
  isWaitingForAI,
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // const interval = setInterval(() => {
  //     console.log(" Current mentions in running ✅ ");
  //   },5000);
  // Compute canSendMessage based on connection, loading state, and disabled prop
  // const canSendMessage = isConnected && !isLoading && !isWaitingForAI;
  const canSendMessage = canSendMessageProp && !isWaitingForAI;

  const handleSend = () => {
    if (inputValue.trim() && canSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Determine placeholder text based on state
  const getPlaceholderText = () => {
    if (!canSendMessage) {
      return "Connecting...";
    }
    return "Ask anything";
  };
   const { creditScore } = useVibe();

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
          backgroundColor: STYLES.COLORS.BACKGROUND,
          borderRadius: "24px",
          border: `2px solid ${STYLES.COLORS.BORDER}`,
          //boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          cursor: creditScore <= 0 ? "not-allowed" : "pointer",
          
          "&:hover":creditScore <= 0 ? {}: {
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
            borderColor: canSendMessage ? "#d1d5db" : STYLES.COLORS.BORDER,
          },
          "&:focus-within":creditScore <= 0 ? {}: {
            boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.1)",
            borderColor: canSendMessage ? "#2563eb" : STYLES.COLORS.BORDER,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
          }}
        >
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            minRows={1}
            maxRows={CHAT_CONFIG.MAX_INPUT_ROWS}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholderText()}
            variant="outlined"
            disabled={!canSendMessage}
            sx={{
              "& .MuiOutlinedInput-root": {
                border: "none",
                borderRadius: 0,
                backgroundColor: "transparent",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.875rem", sm: "0.9rem", md: "0.875rem" },
                color: canSendMessage ? STYLES.COLORS.TEXT_PRIMARY : "#9ca3af",
                padding: "0",
                fontWeight: 400,
                resize: "none",
                fontFamily: STYLES.FONTS.PRIMARY,
                lineHeight: "1.5",
                "&::placeholder": {
                  color: "#9ca3af",
                  opacity: 1,
                  fontWeight: 400,
                },
                "&:disabled": {
                  color: "#9ca3af",
                },
              },
              "& .MuiInputBase-root": {
                padding: "0",
                "& textarea": {
                  padding: "0",
                  resize: "none",
                  overflow: "auto",
                  maxHeight: "120px", // 5 lines * 24px per line
                  minHeight: "24px", // 1 line height
                },
              },
            }}
          />

          <IconButton
            onClick={handleSend}
            disabled={!inputValue.trim() || !canSendMessage}
            size="small"
            sx={{
              backgroundColor:
                inputValue.trim() && canSendMessage
                  ? STYLES.COLORS.PRIMARY
                  : "#f3f4f6",
              color: inputValue.trim() && canSendMessage ? "white" : "#9ca3af",
              width: 32,
              height: 32,
              flexShrink: 0,
              transition: "all 0.2s ease",
              ml: 1,
              mb: 0.5, // Align with the bottom of the text area
              "&:hover": {
                backgroundColor:
                  inputValue.trim() && canSendMessage ? "#0d8a6b" : "#e5e7eb",
                transform:
                  inputValue.trim() && canSendMessage ? "scale(1.05)" : "none",
              },
              "&:disabled": {
                backgroundColor: "#f3f4f6",
                color: "#9ca3af",
              },
            }}
          >
            {!canSendMessage ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SendIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default RunningInputSection;
