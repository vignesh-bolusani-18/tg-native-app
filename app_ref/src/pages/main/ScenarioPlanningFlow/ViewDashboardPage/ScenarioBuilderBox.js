"use client"
import { Box, Chip, Stack, Typography, Card, CardContent, IconButton, Button, Alert, Fade } from "@mui/material"
import { useMemo } from "react"
import useConfig from "../../../../hooks/useConfig"
import { useEffect } from "react"
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker"
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter"
import { useState } from "react"
import { Close as CloseIcon } from "@mui/icons-material"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import TrendingDownIcon from "@mui/icons-material/TrendingDown"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import AddIcon from "@mui/icons-material/Add"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import useDashboard from "../../../../hooks/useDashboard"

const ScenarioBuilderBox = ({ currentDimension, currentValue, dimensionFilterData, elasticity = -0.5, onNavigate, isMultiFilter = false }) => {
  const {
    enrichment,
    setEnrichmentDimension,
    setEnrichmentValue,
    addEnrichment,
    enrichment_bydate,
    enrichment_bydate_pricing,
    removeEnrichmentByIndex,
    removeEnrichmentPricingByIndex,
    setEnrichmentStartDate,
    setEnrichmentEndDate,
    setEnrichmentEnrichmentValue,
    setEnrichment_bydate,
  } = useConfig()

  const { setCurrentValue } = useDashboard()

  const [refresh, setRefresh] = useState(true)
  const [showFirstScenarioMessage, setShowFirstScenarioMessage] = useState(false)
  const [previousScenarioCount, setPreviousScenarioCount] = useState(0)
  const [currentValueIndex, setCurrentValueIndex] = useState(0)

  function formatDate(inputDate) {
    const date = new Date(inputDate)
    const options = { year: "numeric", month: "short", day: "2-digit" }
    return date.toLocaleDateString("en-US", options)
  }

  // Get available values for the current dimension
  const availableValues = useMemo(() => {
    if (!dimensionFilterData || currentDimension === "all") {
      return []
    }

    const dimensionValues = dimensionFilterData[currentDimension]
    return Array.isArray(dimensionValues) ? dimensionValues : []
  }, [dimensionFilterData, currentDimension])

  // Update current value index when currentValue changes
  useEffect(() => {
    if (availableValues.length > 0) {
      const index = availableValues.findIndex((value) => value === currentValue)
      setCurrentValueIndex(index >= 0 ? index : 0)
    }
  }, [currentValue, availableValues])

  const handlePrevValue = () => {
    if (currentValueIndex > 0) {
      const prevValue = availableValues[currentValueIndex - 1]
      setCurrentValue(prevValue)
    }
  }

  const handleNextValue = () => {
    if (currentValueIndex < availableValues.length - 1) {
      const nextValue = availableValues[currentValueIndex + 1]
      setCurrentValue(nextValue)
    }
  }

  const canNavigatePrev = currentValueIndex > 0 && currentDimension !== "all"
  const canNavigateNext = currentValueIndex < availableValues.length - 1 && currentDimension !== "all"

  useEffect(() => {
    if (currentDimension === "all") {
      setEnrichmentDimension("None")
    } else {
      setEnrichmentDimension(currentDimension)
    }
  }, [currentDimension])

  useEffect(() => {
    if (currentValue === "all") {
      setEnrichmentValue("None")
    } else {
      setEnrichmentValue(currentValue)
    }
  }, [currentValue])

  const maxRange = 1000
  const minRange = -1000

  // Filter enrichments to only show those with changed_price_percent
  const filteredEnrichments = useMemo(() => {
    return enrichment_bydate
      .map((enrich, originalIndex) => ({ enrich, originalIndex }))
      .filter(({ enrich }) => enrich.changed_price_percent !== null && enrich.changed_price_percent !== undefined)
  }, [enrichment_bydate])

  // Track when first scenario is added
  useEffect(() => {
    const currentCount = enrichment_bydate_pricing.length
    if (previousScenarioCount === 0 && currentCount === 1) {
      setShowFirstScenarioMessage(true)
      setTimeout(() => {
        setShowFirstScenarioMessage(false)
      }, 3000)
    }
    setPreviousScenarioCount(currentCount)
  }, [enrichment_bydate_pricing?.length, previousScenarioCount])

  return (
    <Stack
      sx={{
        borderRadius: "12px",
        padding: "1rem", // Reduced from 1.25rem
        gap: "0.75rem", // Reduced from 1rem
        backgroundColor: "#FFFFFF",
        overflow: "scroll",
        position: "relative",
        height: "100%",
      }}
    >
      {/* Floating Message */}
      <Fade in={showFirstScenarioMessage}>
        <Alert
          icon={<KeyboardArrowDownIcon sx={{ fontSize: "14px" }} />}
          severity="success"
          onClose={() => setShowFirstScenarioMessage(false)}
          sx={{
            position: "absolute",
            top: "50px", // Adjusted for reduced padding
            left: "1rem",
            right: "1rem",
            zIndex: 1000,
            backgroundColor: "#F0FDF4",
            border: "1px solid #10B981",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontFamily: "Inter",
            color: "#065F46",
            padding: "6px 12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 4px 12px rgba(16, 185, 129, 0.2)",
            "& .MuiAlert-message": {
              fontWeight: 500,
              padding: "0",
            },
            "& .MuiAlert-icon": {
              color: "#10B981",
              padding: "0",
              marginRight: "6px",
            },
            "& .MuiAlert-action": {
              padding: "0",
              marginRight: "-4px",
            },
            "& .MuiIconButton-root": {
              color: "#065F46",
              padding: "2px",
              "&:hover": {
                backgroundColor: "rgba(6, 95, 70, 0.1)",
              },
            },
          }}
        >
          Scroll down to see scenarios
        </Alert>
      </Fade>

      {/* Header - More Compact */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "0.5rem", // Added subtle separation
          borderBottom: "1px solid #F2F4F7", // Subtle divider
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "0.875rem", // Reduced from 1rem
            fontWeight: 600,
            lineHeight: "1.25rem",
            color: "#101828",
          }}
        >
          Scenario Builder
        </Typography>
        <Chip
          label={`${enrichment_bydate_pricing.length} Active`}
          size="small"
          sx={{
            backgroundColor: "#F0FDF4",
            color: "#065F46",
            fontSize: "0.625rem",
            fontWeight: 500,
            height: "18px", // Reduced from 20px
            border: "1px solid #10B981",
          }}
        />
      </Box>

      {/* Current Context Card - More Compact */}
      <Card
        sx={{
          backgroundColor: "#ffffff", // Subtle background
          
          boxShadow: "none",
          
        }}
      >
        <CardContent sx={{ padding: "0rem !important" }}>
          {" "}
          {/* Reduced padding */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "0.75rem", // Reduced from 0.875rem
                  fontWeight: 600,
                  color: "#101828",
                  marginBottom: "0.125rem",
                  lineHeight: 1.2,
                }}
              >
                {currentDimension}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "0.6875rem", // Reduced from 0.75rem
                  color: "#475467",
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {currentValue}
              </Typography>
            </Box>
            <Chip
              label={!isNaN(Number(elasticity)) ? Number(elasticity).toFixed(2) : elasticity}
              size="small"
              icon={<ShowChartIcon sx={{ fontSize: "10px !important" }} />}
              sx={{
                backgroundColor: "#FEF2F2",
                color: "#B42318",
                fontFamily: "Inter",
                fontSize: "0.625rem",
                fontWeight: 500,
                height: "18px", // Reduced from 20px
                border: "1px solid #FECACA",
                "& .MuiChip-icon": {
                  color: "#B42318",
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Scenario Builder Form - More Compact */}
      <Stack spacing={0.5}>
        {" "}
        {/* Reduced from 0.75 */}
        {/* Date Range Row - Improved Styling */}
        <Box
          sx={{
            display: "flex",
            gap: 0.75, // Reduced from 1
            width: "100%",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <CustomDatePicker
              showLabel
              label="Start Date"
              path="kwargs.date_range[0]"
              target="enrichment"
              key={`start-date-${refresh}`}
              labelSx={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter",
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "35px", // More compact
                  fontSize: "0.6875rem",
                  
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.6875rem",
                  padding: "6px 8px",
                },
                
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <CustomDatePicker
              showLabel
              label="End Date"
              path="kwargs.date_range[1]"
              target="enrichment"
              key={`end-date-${refresh}`}
              labelSx={{
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter",
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: "35px",
                  fontSize: "0.6875rem",
                  borderRadius: "6px",
                  border:'none'
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.6875rem",
                  padding: "6px 8px",
                  border:'none'
                },
                
                
              }}
            />
          </Box>
        </Box>
        <CustomCounter 
  showLabel 
  placeholder="Enter percentage value" 
  label="Price Change (%)" 
  path="kwargs.changed_price_percent" 
  target={"enrichment"} 
  maxRange={maxRange} 
  minRange={minRange} 
  key={`value-${refresh}`} 
  labelSx={{
    fontSize: "0.6875rem",
    fontWeight: 500,
    color: "#374151",
    fontFamily: "Inter",
  }}
  sx={{
  height: "16px",
  minHeight: "16px", 
  "& .MuiInputBase-root": {
    height: "16px",
    minHeight: "16px",
    fontSize: "0.6875rem",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.6875rem", 
    padding: "0px",
    height: "16px",
    lineHeight: "16px",
  },
  "& .MuiOutlinedInput-root": {
    height: "16px",
    minHeight: "16px",
  },
  "& .MuiOutlinedInput-input": {
    height: "16px",
    padding: "0px",
  }
}}
/>
        {/* Navigation and Add Button Row - More Compact */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75, // Reduced from 1
            padding: "2px 0", // Reduced from 4px
            width: "100%",
          }}
        >
          <Button
            onClick={handlePrevValue}
            disabled={!canNavigatePrev}
            variant="outlined"
            startIcon={<ChevronLeftIcon sx={{ fontSize: "14px" }} />}
            sx={{
              height: "32px", // Reduced from 36px
              width: "20%",
              fontSize: "0.625rem", // Reduced
              fontWeight: 500,
              borderRadius: "6px",
              fontFamily: "Inter",
              textTransform: "none",
              borderColor: "#D0D5DD",
              color: "#344054",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "#F9FAFB",
                borderColor: "#10B981",
              },
              "&.Mui-disabled": {
                opacity: 0.5,
                backgroundColor: "#F9FAFB",
              },
            }}
          >
            Prev
          </Button>

          <Button
            onClick={async () => {
              await addEnrichment(elasticity)
              setEnrichmentEnrichmentValue(0)
              if (currentDimension !== "all") {
                setEnrichmentDimension(currentDimension)
                setEnrichmentValue(currentValue)
              } else {
                setEnrichmentDimension("None")
                setEnrichmentValue("None")
              }
              setRefresh(!refresh)
            }}
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: "14px" }} />}
            sx={{
              backgroundColor: "#10B981",
              color: "white",
              fontFamily: "Inter",
              fontSize: "0.625rem", // Reduced
              fontWeight: 500,
              textTransform: "none",
              borderRadius: "6px",
              boxShadow: "0px 1px 2px rgba(16, 185, 129, 0.2)",
              height: "32px", // Reduced from 36px
              width: "60%",
              "&:hover": {
                backgroundColor: "#059669",
                boxShadow: "0px 2px 4px rgba(16, 185, 129, 0.3)",
              },
            }}
          >
            Add Scenario
          </Button>

          <Button
            onClick={handleNextValue}
            disabled={!canNavigateNext}
            variant="contained"
            endIcon={<ChevronRightIcon sx={{ fontSize: "14px" }} />}
            sx={{
              height: "32px", // Reduced from 36px
              width: "20%",
              fontSize: "0.625rem", // Reduced
              fontWeight: 500,
              borderRadius: "6px",
              fontFamily: "Inter",
              textTransform: "none",
              backgroundColor: "#10B981",
              color: "white",
              boxShadow: "0px 1px 2px rgba(16, 185, 129, 0.2)",
              "&:hover": {
                backgroundColor: "#0EA371",
                boxShadow: "0px 2px 4px rgba(16, 185, 129, 0.3)",
              },
              "&.Mui-disabled": {
                opacity: 0.5,
                backgroundColor: "#F9FAFB",
                color: "#344054",
              },
            }}
          >
            Next
          </Button>
        </Box>
      </Stack>

      {/* Active Scenarios - More Compact */}
      <Stack spacing={0.5} flex={1} minHeight={0}>
        {" "}
        {/* Reduced spacing */}
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "0.75rem", // Reduced from 0.875rem
            fontWeight: 600,
            color: "#101828",
            paddingTop: "0.25rem",
          }}
        >
          Active Scenarios
        </Typography>
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            backgroundColor: "#FAFAFA",
            borderRadius: "6px", // Reduced from 8px
            border: "1px solid #EAECF0",
            padding: "0.375rem", // Reduced from 0.5rem
            minHeight: "60px", // Reduced from 80px
            "&::-webkit-scrollbar": {
              width: "4px", // Thinner scrollbar
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#F9FAFB",
              borderRadius: "2px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#D0D5DD",
              borderRadius: "2px",
              "&:hover": {
                backgroundColor: "#98A2B3",
              },
            },
          }}
        >
          {enrichment_bydate_pricing?.length > 0 ? (
            <Stack spacing={0.375}>
              {" "}
              {/* Reduced spacing */}
              {enrichment_bydate_pricing?.map((enrich, index) => {
                const isPositive = enrich.changed_price_percent > 0
                const salesImpact = enrich.elasticity
                  ? (enrich.changed_price_percent * enrich.elasticity).toFixed(1)
                  : null
                return (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #EAECF0",
                      borderRadius: "6px", // Reduced from 8px
                      padding: "0.5rem", // Reduced from 0.75rem
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      "&:hover": {
                        borderColor: "#10B981",
                        transform: "translateX(1px)", // Reduced movement
                        boxShadow: "0px 1px 3px -1px rgba(16, 185, 129, 0.1)",
                      },
                      transition: "all 0.15s ease-in-out", // Faster transition
                    }}
                  >
                    <Stack spacing={0.25} flex={1}>
                      {" "}
                      {/* Reduced spacing */}
                      {/* Scenario Header */}
                      <Typography
                        sx={{
                          fontSize: "0.6875rem", // Reduced from 0.75rem
                          fontWeight: 600,
                          color: "#344054",
                          lineHeight: 1.2,
                        }}
                      >
                        {enrich.dimension === "None"
                          ? "All Dimensions"
                          : `${
                              enrich.dimension === "ts_id" ? "Forecast_Granularity" : enrich.dimension
                            } - ${enrich.value}`}
                      </Typography>
                      {/* Metrics Row - More Compact */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem", // Reduced from 0.75rem
                          flexWrap: "wrap",
                        }}
                      >
                        {/* Price Change */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.125rem", // Reduced
                          }}
                        >
                          {isPositive ? (
                            <TrendingUpIcon sx={{ fontSize: "10px", color: "#059669" }} />
                          ) : (
                            <TrendingDownIcon sx={{ fontSize: "10px", color: "#DC2626" }} />
                          )}
                          <Chip
                            label={`${isPositive ? "+" : ""}${enrich.changed_price_percent}%`}
                            size="small"
                            sx={{
                              height: "16px", // Reduced from 18px
                              fontSize: "0.5625rem", // Reduced
                              fontWeight: 600,
                              backgroundColor: isPositive ? "#ECFDF3" : "#FEF2F2",
                              color: isPositive ? "#059669" : "#DC2626",
                              border: `1px solid ${isPositive ? "#A7F3D0" : "#FECACA"}`,
                            }}
                          />
                        </Box>

                        {/* Sales Impact */}
                        {salesImpact && (
                          <Typography
                            sx={{
                              fontSize: "0.5625rem", // Reduced
                              color: "#6B7280",
                              fontWeight: 500,
                            }}
                          >
                            Impact: {salesImpact}%
                          </Typography>
                        )}

                        {/* Date Range */}
                        <Typography
                          sx={{
                            fontSize: "0.5625rem", // Reduced
                            color: "#9CA3AF",
                            fontWeight: 400,
                          }}
                        >
                          {formatDate(enrich.date_range[0])} - {formatDate(enrich.date_range[1])}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Remove Button - More Compact */}
                    <IconButton
                      onClick={() => removeEnrichmentPricingByIndex(index)}
                      size="small"
                      sx={{
                        padding: "2px", // Reduced from 4px
                        color: "#6B7280",
                        border: "1px solid #E5E7EB",
                        borderRadius: "4px", // Reduced from 6px
                        marginLeft: "0.375rem", // Reduced
                        width: "20px",
                        height: "20px",
                        "&:hover": {
                          backgroundColor: "#FEF2F2",
                          borderColor: "#FECACA",
                          color: "#DC2626",
                        },
                        transition: "all 0.15s ease-in-out",
                      }}
                    >
                      <CloseIcon sx={{ fontSize: "12px" }} />
                    </IconButton>
                  </Box>
                )
              })}
            </Stack>
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ height: "100%", minHeight: "60px" }} // Reduced
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem", // Reduced
                  color: "#9CA3AF",
                }}
              >
                <ShowChartIcon sx={{ fontSize: "1.5rem", color: "#D1D5DB" }} />
                <Typography
                  sx={{
                    fontSize: "0.6875rem", // Reduced
                    fontWeight: 500,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  No scenarios created yet
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.5625rem", // Reduced
                    fontWeight: 400,
                    color: "#9CA3AF",
                    textAlign: "center",
                  }}
                >
                  Add price changes to build scenarios
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </Stack>
    </Stack>
  )
}

export default ScenarioBuilderBox
