import React from "react";
import { Box, Typography } from "@mui/material";
import { STYLES } from "../../constants";

const AIMessageCodeBlock = ({ code, title }) => {
  if (!code) return null;

  const normalizedCode =
    typeof code === "string" ? code : JSON.stringify(code, null, 2);

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      {title && (
        <Typography
          sx={{
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            fontWeight: 600,
            color: "#111827",
            mb: { xs: 1, sm: 1.25 },
            fontFamily: STYLES.FONTS.PRIMARY,
          }}
        >
          {title}
        </Typography>
      )}
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
          {normalizedCode}
        </Box>
      </Box>
    </Box>
  );
};

export default AIMessageCodeBlock;
