import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import useAuth from "../../../../hooks/useAuth";
import { STYLES } from "../../constants";

const UserMessage = ({ message, isLastMessage, isDrawer }) => {
  const { userInfo } = useAuth();

  // Get user initials from userName
  const getUserInitials = (userName) => {
    if (!userName) return "U";
    const names = userName.split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const userInitials = getUserInitials(userInfo?.userName);

  // Function to render message content with @mention chips
  const renderMessageContent = () => {
    const content = message.content;
    const data = message.data; // Object with dataset names as keys

    // If no data or empty, just return plain text
    if (!data || Object.keys(data).length === 0) {
      return <span>{content}</span>;
    }

    // Get all dataset names from data
    const datasetNames = Object.keys(data);

    // Create regex pattern to match @mentions
    // Escape special regex characters in dataset names
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = datasetNames.map(escapeRegex).join("|");
    const mentionRegex = new RegExp(`@(${pattern})`, "g");

    // Split content by mentions and create array of parts
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      // Add the mention as a chip
      parts.push({
        type: "mention",
        content: match[1], // Dataset name without @
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last mention
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    // Render parts
    return (
      <Box
        sx={{
          display: "inline",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0.5,
        }}
      >
        {parts.map((part, index) => {
          if (part.type === "mention") {
            return (
              <Chip
                key={index}
                label={`@${part.content}`}
                size="small"
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1976d2",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  height: "24px",
                  borderRadius: "4px",
                  mx: 0.5,
                  "& .MuiChip-label": {
                    padding: "0",
                  },
                }}
              />
            );
          }
          return <span key={index}>{part.content}</span>;
        })}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        py: 2,
        backgroundColor: STYLES.COLORS.BACKGROUND,
      }}
    >
      <Box
        sx={{
          display: "flex",
          maxWidth: "90%",
          width: "100%",
          ml: "auto",
          px: 1,
          gap: 3,
          justifyContent: "flex-end",
          alignItems: "flex-start",
        }}
      >
        {/* Message Content */}
        <Box
          sx={{
            maxWidth: isDrawer ? "90%" : "70%",
            textAlign: "left",
            backgroundColor: STYLES.COLORS.USER_MESSAGE_BG,
            borderRadius: "12px",
            padding: "12px",
          }}
        >
          <Typography
            component="div"
            sx={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              fontWeight: 400,
              color: STYLES.COLORS.TEXT_PRIMARY,
              whiteSpace: "pre-wrap",
              fontFamily: STYLES.FONTS.PRIMARY,
              wordBreak: "break-word",
            }}
          >
            {renderMessageContent()}
          </Typography>
        </Box>

        {/* User Avatar */}
        {!isDrawer && (
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: "50%",
              backgroundColor: STYLES.COLORS.SECONDARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${STYLES.COLORS.BORDER}`,
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              {userInitials}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserMessage;
