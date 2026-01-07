import React from "react";
import {
  Box,
  Typography,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";

const DiffViewer = ({
  changes,
  setHasTypeConflict,
  onChangeDiscard,
  rowDimension,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Function to check if a string is a number
  const isNumber = (value) => !isNaN(value) && !isNaN(parseFloat(value));

  // Function to check if a change has type conflict
  const hasTypeConflict = (originalValue, newValue) => {
    const isOriginalNumber = isNumber(originalValue);
    return isOriginalNumber && !isNumber(newValue);
  };

  // Check for any type conflicts and update parent
  React.useEffect(() => {
    // Only check non-discarded changes for type conflicts
    const hasConflict = changes.some(
      (change) =>
        !change.discarded &&
        hasTypeConflict(change.originalValue, change.newValue)
    );
    setHasTypeConflict(hasConflict);
  }, [changes, setHasTypeConflict]);

  if (!changes || changes.length === 0) return null;

  // Group changes by ts_id
  const changesByItem = changes.reduce((acc, change) => {
    const key = change[rowDimension]
      ? `${change.ts_id} - ${change[rowDimension]}`
      : change.ts_id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(change);
    return acc;
  }, {});

  // Function to display empty values
  const displayValue = (value) => {
    if (value === "" || value === null || value === undefined) {
      return (
        <Typography
          component="span"
          sx={{
            fontStyle: "italic",
            color: "inherit",
            opacity: 0.7,
          }}
        >
          (empty)
        </Typography>
      );
    }
    return value;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Found {changes.length} changes across{" "}
        {Object.keys(changesByItem).length} rows
      </Alert>
      <Box
        sx={{
          maxHeight: "300px",
          overflow: "auto",
          border: "1px solid #EAECF0",
          borderRadius: "8px",
          backgroundColor: "#FFFFFF",
          "&::-webkit-scrollbar": {
            width: "8px",
            visibility: "visible",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
            "&:hover": {
              background: "#666",
            },
          },
          scrollbarWidth: "thin",
          scrollbarColor: "#888 #f1f1f1",
        }}
      >
        {Object.entries(changesByItem).map(([itemId, itemChanges]) => (
          <Box
            key={itemId}
            sx={{
              p: isMobile ? 1 : 1,
              "&:not(:last-child)": {
                borderBottom: "1px solid #EAECF0",
              },
            }}
          >
            {itemChanges.length > 1 && (
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#101828",
                  fontFamily: "Inter",
                  fontSize: "0.875rem",
                  mb: 1,
                }}
              >
                {itemId} :
              </Typography>
            )}
            <Stack spacing={1}>
              {itemChanges.map((change, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: isMobile ? 1 : 1,
                    py: 0.5,
                    pl: itemChanges.length > 1 ? 3 : 0,
                    opacity: change.discarded ? 0.5 : 1,
                    transition: "opacity 0.2s ease-in-out",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      minWidth: isMobile
                        ? "100%"
                        : isTablet
                        ? "200px"
                        : "250px",
                    }}
                  >
                    {itemChanges.length === 1 && (
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#101828",
                          fontFamily: "Inter",
                          fontSize: "0.875rem",
                          minWidth: "fit-content",
                        }}
                      >
                        {`${itemId} :`}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        color: "#475467",
                        fontFamily: "Inter",
                        fontSize: "0.875rem",
                        lineHeight: "1.25rem",
                      }}
                    >
                      {change.columnName}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      flex: 1,
                      width: isMobile ? "100%" : "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{
                        flexWrap: "wrap",
                        gap: 0.5,
                        flex: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#cf222e",
                          fontFamily: "monospace",
                          backgroundColor: "#ffebe9",
                          px: 1,
                          borderRadius: 1,
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {displayValue(change.originalValue)}
                      </Typography>
                      →
                      <Typography
                        sx={{
                          color: "#2da44e",
                          fontFamily: "monospace",
                          backgroundColor: "#e6ffec",
                          px: 1,
                          borderRadius: 1,
                          fontSize: isMobile ? "0.75rem" : "0.875rem",
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {displayValue(change.newValue)}
                      </Typography>
                      {hasTypeConflict(
                        change.originalValue,
                        change.newValue
                      ) && (
                        <Typography
                          sx={{
                            color: "#D92D20",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            backgroundColor: "#FEF3F2",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          Type Conflict
                        </Typography>
                      )}
                    </Stack>
                    <IconButton
                      size="small"
                      onClick={() =>
                        onChangeDiscard(
                          change.ts_id,
                          change.columnName,
                          !change.discarded
                        )
                      }
                      sx={{
                        color: change.discarded ? "#0C66E4" : "#667085",
                        "&:hover": {
                          backgroundColor: change.discarded
                            ? "#F5FAFF"
                            : "#F9FAFB",
                        },
                      }}
                    >
                      {change.discarded ? (
                        <UndoIcon fontSize="small" />
                      ) : (
                        <CloseIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DiffViewer;
