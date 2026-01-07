import React, { useState } from "react";
import { Box, Typography, Chip, Collapse, IconButton } from "@mui/material";
import {
  DataObject as DataObjectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { STYLES } from "../../constants";

const SampleDataSection = ({ sampleData }) => {
  // State for collapsible section
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sampleData) return null;
  const currentDataTag = Object.keys(sampleData.data)[0];
  // Extract sample data information
  const dataInfo = sampleData?.data?.[currentDataTag];
  console.log("dataInfo", dataInfo);
  const sampleDataRows = dataInfo?.sample_data?.data || [];
  const columns = dataInfo?.sample_data?.columns || [];
  const shape = dataInfo?.sample_data?.shape || [];
  const dtypes = dataInfo?.sample_data?.dtypes || {};

  // Toggle expansion
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box
      sx={{
        mt: 3,
        p: 1,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        borderLeft: "4px solid #10b981",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0,
          p: 1,
          backgroundColor: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: "8px",

          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor:
              "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
          },
        }}
        onClick={toggleExpansion}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DataObjectIcon sx={{ color: "#10b981", fontSize: 18 }} />
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              fontFamily: STYLES.FONTS.PRIMARY,
            }}
          >
            Sample Data
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{
            color: "#10b981",
            "&:hover": {
              backgroundColor: "rgba(16, 185, 129, 0.1)",
            },
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        {/* Dataset Info */}
        {dataInfo?.dataset_info && (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6b7280",
                mb: 1,
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              Dataset Information
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                label={`Name: ${dataInfo.dataset_info.datasetName}`}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
              <Chip
                label={`Tag: ${dataInfo.dataset_info.datasetTag}`}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
              <Chip
                label={`Source: ${dataInfo.dataset_info.sourceName}`}
                size="small"
                sx={{ fontSize: "0.7rem" }}
              />
            </Box>
          </Box>
        )}

        {/* Columns */}
        {columns.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6b7280",
                mb: 1,
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              Columns
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {columns.map((column, index) => (
                <Chip
                  key={index}
                  label={`${column} (${dtypes[column] || "unknown"})`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.65rem" }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Sample Data Preview */}
        {sampleDataRows.length > 0 && (
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6b7280",
                mb: 1,
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              Sample Data (First {Math.min(sampleDataRows.length, 5)} rows)
            </Typography>
            <Box
              sx={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "4px",
                overflow: "auto",
                maxHeight: "200px",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                  gap: 1,
                  p: 1,
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                }}
              >
                {/* Header */}
                {columns.map((column, index) => (
                  <Box
                    key={`header-${index}`}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#e2e8f0",
                      p: 0.5,
                      borderRadius: "2px",
                      textAlign: "center",
                    }}
                  >
                    {column}
                  </Box>
                ))}

                {/* Data rows */}
                {sampleDataRows.slice(0, 5).map((row, rowIndex) =>
                  Object.values(row).map((value, colIndex) => (
                    <Box
                      key={`${rowIndex}-${colIndex}`}
                      sx={{
                        p: 0.5,
                        borderBottom:
                          rowIndex < 4 ? "1px solid #e2e8f0" : "none",
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {String(value)}
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default SampleDataSection;
