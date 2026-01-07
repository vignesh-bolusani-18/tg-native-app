import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Label as LabelIcon,
  Check as CheckIcon,
  Analytics as AnalyticsIcon,
  DataObject as DataObjectIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoAwesome as SparkleIcon,
} from "@mui/icons-material";
import { STYLES } from "../../constants";
import DataTaggerSection from "./DataTaggerSection";
import { useVibe } from "../../../../hooks/useVibe";

const TagsSection = ({ tagsData, messageId, langgraphState }) => {
  // State for main section expansion
  const [isMainExpanded, setIsMainExpanded] = useState(true);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    assignedTags: false,
    edaSummary: false,
  });
const currentDataTag = Object.keys(langgraphState?.data).find(key => 
  langgraphState?.data[key].sample_data_path && 
  langgraphState?.data[key].sample_data_path.length > 0
);
console.log("currentDataTag", currentDataTag);

  // Extract tags information
  const dataInfo = tagsData?.data?.[currentDataTag];
  const tags = dataInfo?.tags || {};
  const edaSummary = dataInfo?.eda_summary || {};
  const columnAnalyses = edaSummary?.column_analyses || [];
  const overallInsights = edaSummary?.overall_insights || {};

  // Check if tags are already approved
  // const isApproved = langgraphState?.workflow_status?.tags_approved;
  const { dataConfirmed, creditScore } = useVibe();
  // Auto-collapse main section when approved
  React.useEffect(() => {
    if (dataConfirmed) {
      setIsMainExpanded(false);
    }
  }, [dataConfirmed]);

  // Toggle main section expansion
  const toggleMainSection = () => {
    setIsMainExpanded(!isMainExpanded);
  };

  // Toggle section expansion
  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <Box
      sx={{
        mt: 3,
        overflow: "hidden",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      {/* Main Header - Always visible */}
      <Box
        sx={{
          p: 2,
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          borderLeft: "4px solid #10b981",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(16, 185, 129, 0.05)",
          },
        }}
        onClick={toggleMainSection}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LabelIcon sx={{ color: "#10b981", fontSize: 20 }} />
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#374151",
                fontFamily: STYLES.FONTS.PRIMARY,
              }}
            >
              {dataConfirmed ? "Data Confirmed" : "Data Tags Analysis"}
            </Typography>
            {dataConfirmed && (
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <CheckIcon sx={{ color: "#10b981", fontSize: 14 }} />
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#065f46",
                    fontWeight: 500,
                    fontFamily: STYLES.FONTS.PRIMARY,
                  }}
                >
                  Data Confirmed
                </Typography>
              </Box>
            )}
          </Box>
          <IconButton
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "rgba(107, 114, 128, 0.1)",
              },
            }}
          >
            {isMainExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isMainExpanded}>
        <Box
          sx={{
            p: 3,
            border: "1px solid #e2e8f0",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
          }}
        >
          {/* Dataset Info */}
          {dataInfo?.dataset_info && (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <DataObjectIcon sx={{ color: "#6b7280", fontSize: 18 }} />
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: STYLES.FONTS.PRIMARY,
                  }}
                >
                  Data Tags
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <Chip
                  icon={<InfoIcon />}
                  label={`Name: ${dataInfo.dataset_info.datasetName}`}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    backgroundColor: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    "& .MuiChip-icon": { fontSize: 16 },
                  }}
                />
                <Chip
                  icon={<LabelIcon />}
                  label={`Tag: ${dataInfo.dataset_info.datasetTag}`}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    backgroundColor: "#fef3c7",
                    border: "1px solid #f59e0b",
                    color: "#92400e",
                    "& .MuiChip-icon": { fontSize: 16, color: "#f59e0b" },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Tags Analysis */}
          {/* {Object.keys(tags).length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  p: 1,
                  backgroundColor:
                    "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor:
                      "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                  },
                }}
                onClick={() => toggleSection("assignedTags")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <SparkleIcon
                    sx={{ color: STYLES.COLORS.PRIMARY, fontSize: 15 }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "#1e293b",
                        fontFamily: STYLES.FONTS.PRIMARY,
                        mb: 0.5,
                      }}
                    >
                      AI Assigned Tags
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={`${Object.keys(tags).length} Tags`}
                    size="small"
                    sx={{
                      backgroundColor: "#3b82f6",
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      color: "#3b82f6",
                      "&:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                      },
                    }}
                  >
                    {expandedSections.assignedTags ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                </Box>
              </Box>

              <Collapse in={expandedSections.assignedTags}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {Object.entries(tags).map(([tagName, tagInfo], index) => (
                    <Paper
                      key={tagName}
                      elevation={2}
                      sx={{
                        p: 2.5,
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                          transform: "translateY(-2px)",
                          borderColor: "#3b82f6",
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          background:
                            "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            backgroundColor: "#dbeafe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #3b82f6",
                          }}
                        >
                          <LabelIcon sx={{ color: "#1d4ed8", fontSize: 16 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#1e293b",
                              fontFamily: STYLES.FONTS.PRIMARY,
                              mb: 0.5,
                            }}
                          >
                            {tagName}
                          </Typography>
                          <Chip
                            label={tagInfo.type || "unknown"}
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                        }}
                      >
                        {tagInfo.value && (
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                color: "#64748b",
                                fontFamily: STYLES.FONTS.PRIMARY,
                                fontWeight: 600,
                                mb: 0.5,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Assigned Value
                            </Typography>
                            <Box
                              sx={{
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                p: 1.5,
                                borderLeft: "3px solid #3b82f6",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "#1e293b",
                                  fontFamily: "monospace",
                                  fontWeight: 500,
                                  wordBreak: "break-word",
                                }}
                              >
                                {Array.isArray(tagInfo.value)
                                  ? tagInfo.value.join(", ")
                                  : tagInfo.value}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {tagInfo.description && (
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                color: "#64748b",
                                fontFamily: STYLES.FONTS.PRIMARY,
                                fontWeight: 600,
                                mb: 0.5,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Description
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#475569",
                                fontFamily: STYLES.FONTS.PRIMARY,
                                lineHeight: 1.5,
                                fontStyle: "italic",
                                backgroundColor: "#fefefe",
                                p: 1,
                                borderRadius: "4px",
                                border: "1px solid #f1f5f9",
                              }}
                            >
                              {tagInfo.description}
                            </Typography>
                          </Box>
                        )}

                        {tagInfo.reason && (
                          <Box>
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                color: "#64748b",
                                fontFamily: STYLES.FONTS.PRIMARY,
                                fontWeight: 600,
                                mb: 0.5,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Analysis Reason
                            </Typography>
                            <Box
                              sx={{
                                p: 1.5,
                                backgroundColor: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                borderRadius: "6px",
                                borderLeft: "3px solid #10b981",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "#065f46",
                                  fontFamily: STYLES.FONTS.PRIMARY,
                                  fontWeight: 500,
                                  lineHeight: 1.4,
                                }}
                              >
                                {tagInfo.reason}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>

                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#10b981",
                          border: "2px solid #ffffff",
                          boxShadow: "0 0 0 2px #ecfdf5",
                        }}
                      />
                    </Paper>
                  ))}
                </Box>
              </Collapse>

              <Collapse in={expandedSections.assignedTags}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckIcon sx={{ color: "#10b981", fontSize: 18 }} />
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color: "#374151",
                        fontFamily: STYLES.FONTS.PRIMARY,
                        fontWeight: 500,
                      }}
                    >
                      All columns have been successfully analyzed and tagged
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: "#64748b",
                      fontFamily: STYLES.FONTS.PRIMARY,
                    }}
                  >
                    Ready for approval
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          )} */}

          {/* EDA Summary */}
          {/* {(columnAnalyses.length > 0 ||
            Object.keys(overallInsights).length > 0) && (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                  p: 1,
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                  },
                }}
                onClick={() => toggleSection("edaSummary")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AnalyticsIcon sx={{ color: "#6b7280", fontSize: 15 }} />
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: STYLES.FONTS.PRIMARY,
                    }}
                  >
                    Exploratory Data Analysis
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  sx={{
                    color: "#6b7280",
                    "&:hover": {
                      backgroundColor: "rgba(107, 114, 128, 0.1)",
                    },
                  }}
                >
                  {expandedSections.edaSummary ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>

              <Collapse in={expandedSections.edaSummary}>
         
                {Object.keys(overallInsights).length > 0 && (
                  <Paper
                    elevation={1}
                    sx={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: STYLES.COLORS.PRIMARY,
                          fontFamily: STYLES.FONTS.PRIMARY,
                        }}
                      >
                        Overall Dataset Insights
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: 2,
                        }}
                      >
                        {Object.entries(overallInsights).map(([key, value]) => (
                          <Box
                            key={key}
                            sx={{
                              p: 1.5,
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                color: "#475569",
                                fontFamily: STYLES.FONTS.PRIMARY,
                                mb: 0.5,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {key.replace(/_/g, " ")}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#374151",
                                fontFamily: STYLES.FONTS.PRIMARY,
                                lineHeight: 1.4,
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                )}

                {columnAnalyses.length > 0 && (
                  <Paper
                    elevation={1}
                    sx={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "#1e293b",
                          fontFamily: STYLES.FONTS.PRIMARY,
                        }}
                      >
                        Column Analysis ({columnAnalyses.length} columns)
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {columnAnalyses.map((column, index) => (
                          <Paper
                            key={index}
                            elevation={1}
                            sx={{
                              p: 2,
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 1.5,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  backgroundColor: "#dbeafe",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "2px solid #3b82f6",
                                }}
                              >
                                <DataObjectIcon
                                  sx={{ color: "#1d4ed8", fontSize: 14 }}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  sx={{
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    fontFamily: STYLES.FONTS.PRIMARY,
                                    mb: 0.5,
                                  }}
                                >
                                  {column.column_name}
                                </Typography>
                                <Chip
                                  label={column.data_type}
                                  size="small"
                                  sx={{
                                    fontSize: "0.6rem",
                                    backgroundColor: "#f1f5f9",
                                    color: "#475569",
                                    border: "1px solid #cbd5e1",
                                    fontWeight: 500,
                                  }}
                                />
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: 1.5,
                              }}
                            >
                              {column.business_meaning && (
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "0.65rem",
                                      fontWeight: 600,
                                      color: "#64748b",
                                      fontFamily: STYLES.FONTS.PRIMARY,
                                      mb: 0.5,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Business Meaning
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: "#374151",
                                      fontFamily: STYLES.FONTS.PRIMARY,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {column.business_meaning}
                                  </Typography>
                                </Box>
                              )}

                              {column.data_characteristics && (
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "0.65rem",
                                      fontWeight: 600,
                                      color: "#64748b",
                                      fontFamily: STYLES.FONTS.PRIMARY,
                                      mb: 0.5,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Data Characteristics
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: "#374151",
                                      fontFamily: "monospace",
                                      lineHeight: 1.4,
                                      backgroundColor: "#f8fafc",
                                      p: 0.5,
                                      borderRadius: "3px",
                                    }}
                                  >
                                    {column.data_characteristics}
                                  </Typography>
                                </Box>
                              )}

                              {column.data_quality && (
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "0.65rem",
                                      fontWeight: 600,
                                      color: "#64748b",
                                      fontFamily: STYLES.FONTS.PRIMARY,
                                      mb: 0.5,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Data Quality
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: "#374151",
                                      fontFamily: STYLES.FONTS.PRIMARY,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {column.data_quality}
                                  </Typography>
                                </Box>
                              )}

                              {column.potential_use && (
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "0.65rem",
                                      fontWeight: 600,
                                      color: "#64748b",
                                      fontFamily: STYLES.FONTS.PRIMARY,
                                      mb: 0.5,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Potential Use
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: "#374151",
                                      fontFamily: STYLES.FONTS.PRIMARY,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {column.potential_use}
                                  </Typography>
                                </Box>
                              )}

                              {column.special_notes && (
                                <Box sx={{ gridColumn: "1 / -1" }}>
                                  <Typography
                                    sx={{
                                      fontSize: "0.65rem",
                                      fontWeight: 600,
                                      color: "#64748b",
                                      fontFamily: STYLES.FONTS.PRIMARY,
                                      mb: 0.5,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    Special Notes
                                  </Typography>
                                  <Box
                                    sx={{
                                      p: 1,
                                      backgroundColor: "#f8fafc",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: "4px",
                                      borderLeft: "3px solid #0C66E4",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: "#374151",
                                        fontFamily: STYLES.FONTS.PRIMARY,
                                        lineHeight: 1.4,
                                        fontStyle: "italic",
                                      }}
                                    >
                                      {column.special_notes}
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                )}
              </Collapse>
            </Box>
          )} */}

          <DataTaggerSection
            dataInfo={dataInfo}
            messageId={messageId}
            langgraphState={langgraphState}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default TagsSection;
