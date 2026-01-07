import { Box, Typography, IconButton } from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error'; // Material UI error icon

const ParsedErrorMessage = ({ errorDetails, currentStep }) => {
  if (!errorDetails) {
    return null;
  }

  // Split the error message by new lines
  const errorLines = errorDetails.split("\n");

  return (
    <Box sx={{ marginTop: "16px" }}>
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "16px",
          fontWeight: 600,
          color: "#b91c1c",
        }}
      >
        Error Details: (<strong>{currentStep}</strong>)
      </Typography>
      <Box
        sx={{
          backgroundColor: "#FEE2E2",
          border: "1px solid #DC2626",
          borderRadius: "8px",
          padding: "16px",
          marginTop: "8px",
          position: "relative",
        }}
      >
        <IconButton
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            color: "#DC2626",
            "&:hover": {
              backgroundColor: "transparent", // Avoid hover color on the icon
            },
          }}
        >
          <ErrorIcon />
        </IconButton>
        {errorLines.map((line, index) => {
          const isFileLine = line.includes("File");
          const isErrorMessage = index === errorLines.length - 1; // Last line is usually the error message

          return (
            <Typography
              key={index}
              sx={{
                fontFamily: "monospace",
                fontSize: "14px",
                whiteSpace: "pre-wrap", // Keeps the spacing and line breaks intact
                ...(isFileLine && {
                  color: "#1e40af", // Highlight file-related lines in blue
                  fontWeight: 600,
                }),
                ...(isErrorMessage && {
                  color: "#b91c1c", // Highlight the final error message in red
                  fontWeight: 700,
                }),
              }}
            >
              {line}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

export default ParsedErrorMessage;
