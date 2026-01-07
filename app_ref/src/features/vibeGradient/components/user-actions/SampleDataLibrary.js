import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Source as SourcesIcon,
  DragIndicator as DragIndicatorIcon,
  Dataset as DatasetIcon,
  Info as InfoIcon,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material";
import { STYLES } from "../../constants";
import {
  SAMPLE_DATASETS,
  fetchSampleDataAsFile,
} from "../../../../utils/sampleDataUtils";
import { useVibe } from "../../../../hooks/useVibe";

const SampleDataLibrary = ({ onSampleDataSelect, moduleName }) => {
  const [loadingDataset, setLoadingDataset] = useState(null);
  const [error, setError] = useState(null);
  const currentModuleName = moduleName;
  const relavantSampleDataSets = SAMPLE_DATASETS.filter((dataset) =>
    dataset.moduleNames.includes(currentModuleName)
  );

  const handleDragStart = (event, dataset) => {
    event.dataTransfer.setData(
      "application/sample-dataset",
      JSON.stringify(dataset)
    );
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleSampleDataClick = async (dataset) => {
    if (loadingDataset) return;

    setLoadingDataset(dataset.id);
    setError(null);

    try {
      const file = await fetchSampleDataAsFile(
        dataset.path,
        `${dataset.name}.csv`
      );
      onSampleDataSelect(file, dataset);
    } catch (err) {
      console.error("Error loading sample data:", err);
      setError(`Failed to load ${dataset.name} sample data. Please try again.`);
    } finally {
      setLoadingDataset(null);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        p: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <SourcesIcon sx={{ color: STYLES.COLORS.PRIMARY, fontSize: 22 }} />
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#374151",
            fontFamily: STYLES.FONTS.PRIMARY,
          }}
        >
          Sample Data Library
        </Typography>
        <Tooltip title="Drag and drop sample datasets into the upload area, or click to load them directly">
          <IconButton size="small" sx={{ color: "#6b7280" }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "#6b7280",
          mb: 3,
          lineHeight: 1.5,
          fontFamily: STYLES.FONTS.PRIMARY,
        }}
      >
        Get started quickly with our curated sample datasets. Drag and drop them
        into the upload area or click to load directly.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ flex: 1, overflow: "auto", padding: "4px" }}>
        <Stack spacing={2}>
          {relavantSampleDataSets.map((dataset) => (
            <Card
              key={dataset.id}
              aria-label={"Sample-Data"}
              draggable
              onDragStart={(e) => handleDragStart(e, dataset)}
              onClick={() => handleSampleDataClick(dataset)}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                position: "relative",
                "&:hover": {
                  borderColor: STYLES.COLORS.PRIMARY,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  transform: "translateY(-1px)",
                  backgroundColor: "#fafbfc",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Stack spacing={2}>
                  {/* Header with drag handle and dataset icon */}
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        backgroundColor: "#ffffff",
                        borderRadius: "10px",
                        border: "1px solid #e0f2fe",
                      }}
                    >
                      <DatasetIcon
                        sx={{
                          color: STYLES.COLORS.PRIMARY,
                          fontSize: 20,
                        }}
                      />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#111827",
                            fontFamily: STYLES.FONTS.PRIMARY,
                            lineHeight: 1.2,
                          }}
                        >
                          {dataset.name}
                        </Typography>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: "#10b981",
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          fontFamily: STYLES.FONTS.PRIMARY,
                          mt: 0.5,
                        }}
                      >
                        Sample Dataset
                      </Typography>
                    </Box>

                    <DragIndicatorIcon
                      sx={{
                        color: "#9ca3af",
                        fontSize: 18,
                        cursor: "grab",
                        opacity: 0.6,
                        "&:active": { cursor: "grabbing" },
                        "&:hover": { opacity: 1 },
                      }}
                    />
                  </Stack>

                  {/* Description */}
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#4b5563",
                      fontFamily: STYLES.FONTS.PRIMARY,
                      lineHeight: 1.5,
                      backgroundColor: "#f9fafb",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #f3f4f6",
                    }}
                  >
                    {dataset.description}
                  </Typography>

                  {/* Tags */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#374151",
                        mb: 1,
                        fontFamily: STYLES.FONTS.PRIMARY,
                      }}
                    >
                      Categories:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      gap={0.5}
                    >
                      {dataset.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: 24,
                            backgroundColor: "#e0f2fe",
                            color: "#0369a1",
                            border: "1px solid #bae6fd",
                            fontWeight: 500,
                            "& .MuiChip-label": {
                              px: 1.5,
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default SampleDataLibrary;
