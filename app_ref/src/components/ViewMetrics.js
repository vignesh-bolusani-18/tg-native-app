"use client"

import { useEffect, useState, useRef } from "react"

import { Stack, Grid, CardContent, Card, Skeleton, Divider, Box } from "@mui/material"
import { executeParallelTasks } from "../utils/executeParallelTasks"

import useAuth from "../hooks/useAuth"
import useDashboard from "../hooks/useDashboard"
import useExperiment from "../hooks/useExperiment"
import { ReactComponent as DataSet } from "../assets/Icons/DataSet.svg"
import { demandForecastingCards } from "../pages/main/DashboardFlow/ViewDashboardPage/FocusView/ExecutiveCards"
import PreviewMetricCards from "./Metric Cards/PreviewMetrics"

// Add this style object at the top of your component
const pulseAnimation = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`

const SimpleMetricCardSkeleton = () => {
  return (
    <Skeleton
      sx={{
        borderRadius: "8px",
        padding: "0.75rem",
        gap: "12px",
        border: "1px solid #D1D5DB", // Darker border for better visibility
        boxShadow: "0px 1px 2px 0px #1018280D",
        backgroundColor: "#E5E7EB", // Darker grey background
        height: "140px",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
          animation: "shimmer 1.5s ease-in-out infinite",
        },
        "@keyframes shimmer": {
          "0%": {
            left: "-100%",
          },
          "100%": {
            left: "100%",
          },
        },
      }}
    >
      {/* More visible grey rectangle */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "#D1D5DB", // Darker grey for better contrast
          borderRadius: "4px",
        }}
      />
    </Skeleton>
  )
}

const PreviewMetricCardsSkeleton = () => {
  const renderSkeletonCard = () => (
    <Stack
      sx={{
        borderRadius: "8px",
        padding: "0.75rem",
        gap: "12px",
        border: "1px solid #EAECF0",
        boxShadow: "0px 1px 2px 0px #1018280D",
        backgroundColor: "#FFFFFF",
        height: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Title skeleton */}
      <Skeleton variant="text" width="80%" height="1.2rem" sx={{ fontSize: "0.9rem" }} />

      {/* Metrics row */}
      <Stack
        direction={"row"}
        sx={{ gap: "8px", maxWidth: "100%", overflow: "hidden" }}
        justifyContent={"space-around"}
      >
        {/* Metric 1 */}
        <Stack gap={"8px"} sx={{ maxWidth: "100%", overflow: "hidden" }} alignItems={"center"}>
          <Skeleton variant="text" width={60} height="0.9rem" sx={{ fontSize: "0.75rem" }} />
          <Stack gap={"0.25rem"} sx={{ maxWidth: "100%", overflow: "hidden" }} alignItems={"flex-start"}>
            <Skeleton variant="text" width={50} height="1.6rem" sx={{ fontSize: "1.3rem" }} />
            <Skeleton variant="text" width={40} height="0.9rem" sx={{ fontSize: "0.75rem" }} />
          </Stack>
        </Stack>

        <Divider orientation="vertical" variant="middle" flexItem />

        {/* Metric 2 */}
        <Stack gap={"8px"} sx={{ maxWidth: "100%", overflow: "hidden" }} alignItems={"center"}>
          <Skeleton variant="text" width={60} height="0.9rem" sx={{ fontSize: "0.75rem" }} />
          <Stack gap={"0.25rem"} sx={{ maxWidth: "100%", overflow: "hidden" }} alignItems={"flex-start"}>
            <Skeleton variant="text" width={50} height="1.6rem" sx={{ fontSize: "1.3rem" }} />
            <Skeleton variant="text" width={40} height="0.9rem" sx={{ fontSize: "0.75rem" }} />
          </Stack>
        </Stack>

        <Divider orientation="vertical" variant="middle" flexItem />

        {/* Metric 3 */}
        <Stack gap={"8px"} sx={{ maxWidth: "100%", overflow: "hidden" }} alignItems={"center"}>
          <Skeleton variant="text" width={60} height="0.9rem" sx={{ fontSize: "0.75rem" }} />
          <Stack gap={"0.25rem"} sx={{ maxWidth: "100%", overflow: "hidden" }} alignItems={"flex-start"}>
            <Skeleton variant="text" width={50} height="1.6rem" sx={{ fontSize: "1.3rem" }} />
            <Skeleton variant="text" width={40} height="0.9rem" sx={{ fontSize: "0.75rem" }} />
          </Stack>
        </Stack>
      </Stack>

      {/* Bottom metric section */}
      <Stack spacing={"0.25rem"}>
        <Divider />
        <Stack
          sx={{ maxWidth: "100%", overflow: "hidden" }}
          alignItems={"center"}
          direction={"row"}
          justifyContent={"space-between"}
        >
          <Skeleton variant="text" width={80} height="0.9rem" sx={{ fontSize: "0.75rem" }} />
          <Skeleton variant="text" width={60} height="16px" sx={{ fontSize: "13px" }} />
        </Stack>
      </Stack>
    </Stack>
  )

  return (
    <Stack direction="row" spacing={2}>
      {/* Render three skeleton cards */}
      {[1, 2, 3].map((index) => (
        <div key={index} style={{ flex: 1 }}>
          {renderSkeletonCard()}
        </div>
      ))}
    </Stack>
  )
}

const BoxComponent = ({ data, experiment_config }) => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        height: "100%",
        "& .MuiCard-root": {
          padding: 0,
        },
        "& .MuiCardContent-root": {
          paddingBottom: "0px",
        },
        boxShadow: "0px 2px 2px #1018280D",
      }}
    >
      {<PreviewMetricCards data={data} />}
    </Card>
  )
}

const MetricCardSkeleton = () => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        height: "100%",
        boxShadow: "0px 2px 2px #1018280D",
        "& .MuiCardContent-root": {
          paddingBottom: "16px",
        },
      }}
    >
      <CardContent sx={{ padding: "24px" }}>
        <Stack spacing={3}>
          {/* Icon and title skeleton */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: "6px" }} />
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={160} height={16} />
            </Stack>
          </Stack>

          {/* Main metric value skeleton */}
          <Stack spacing={1}>
            <Skeleton variant="text" width={100} height={32} />
            <Skeleton variant="text" width={80} height={16} />
          </Stack>

          {/* Additional metrics skeleton */}
          <Stack spacing={1}>
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="75%" height={16} />
            <Skeleton variant="text" width="60%" height={16} />
          </Stack>

          {/* Bottom section skeleton */}
          <Stack spacing={1}>
            <Skeleton variant="text" width="90%" height={14} />
            <Skeleton variant="text" width="50%" height={14} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

const formatToPercent = (numberStr) => {
  // Convert string to number
  const value = Number.parseFloat(numberStr)

  // Determine if value is a fraction or already a percentage
  // const percentageValue = value<1?value*100:value;
  const percentageValue = value

  // Format the percentage value
  return new Intl.NumberFormat("default", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
    .format(percentageValue / 100)
    .toString()
}

const get_metrics = (data, dateColumn, frequency, executiveViewData, showFutureActuals, rawSalesData, currency) => {
  // Early return if data is invalid
  if (!data || Object.keys(data).length === 0) {
    return {}
  }

  // Memoize frequently accessed values
  const isNew = rawSalesData !== null && rawSalesData !== undefined

  // Calculate error array only if not present
  if (!data.hasOwnProperty("error")) {
    data.error = data.pred.map((value, index) =>
      Math.abs(Number.parseFloat(value) - Number.parseFloat(data.actual[index])),
    )
  }

  // Initialize required properties if not present
  if (!data.hasOwnProperty("ly_actual")) {
    data.ly_actual = ["actual"]
  }

  if (!data.hasOwnProperty("date_rank")) {
    data.date_rank = 1.0
    data.ts_actual = data.actual
    data.ts_pred = data.pred
    data.ts_error = data.error
  }

  // Extract graph data once
  const graphData = extractKeys(data, dateColumn)

  // Process test entries
  const testEntries = graphData.filter((entry) => entry.split === "test")
  const trainEntries = graphData.filter((entry) => entry.split === "train")

  if (trainEntries.length > 0) {
    testEntries.unshift(trainEntries[trainEntries.length - 1])
  }

  // Calculate validation period
  const Validation_Period =
    testEntries.length > 0
      ? `${formatDateWithSuffix(incrementDateByOneDay(testEntries[0][dateColumn]))} - ${formatDateWithSuffix(
          testEntries[testEntries.length - 1][dateColumn],
        )}`
      : null

  // Process forecast entries
  const forecastEntries = graphData.filter((entry) => entry.split === "future")
  if (testEntries.length > 0) {
    forecastEntries.unshift(testEntries[testEntries.length - 1])
  }

  // Calculate forecast period and horizon
  let Forecast_Period = null
  let Forecast_Horizon = null

  if (forecastEntries.length > 0) {
    const startDate = formatDateWithSuffix(incrementDateByOneDay(forecastEntries[0][dateColumn]))
    const endDate = formatDateWithSuffix(forecastEntries[forecastEntries.length - 1][dateColumn])
    Forecast_Horizon = calculateDateDifference(
      forecastEntries[0][dateColumn],
      forecastEntries[forecastEntries.length - 1][dateColumn],
      frequency,
    )
    Forecast_Period = `${startDate} - ${endDate} (${Forecast_Horizon} ${frequency})`
  }

  // Calculate metrics in parallel using Promise.all
  const metrics = {
    lastCardBottomMetricTitle: showFutureActuals ? "Future Accuracy" : "Total Combinations",
    new_lastCardBottomMetricTitle: showFutureActuals ? "Future Accuracy" : "Forecast Period",
    Validation_Period,
    Forecast_Period,
    isNew,
    currency,
  }

  // Calculate future accuracy if needed
  if (showFutureActuals) {
    const futureAccuracy = calculateFutureAccuracy(graphData)
    metrics.Future_Accuracy = futureAccuracy
    metrics.lastCardBottomMetric = formatToPercent(futureAccuracy * 100)
    metrics.new_lastCardBottomMetric = formatToPercent(futureAccuracy * 100)
  } else {
    metrics.lastCardBottomMetric = executiveViewData.total_combinations
    metrics.new_lastCardBottomMetric = Forecast_Period
  }

  // Calculate sales metrics
  if (data.hasOwnProperty("date_rank")) {
    const testIndices = data.split.reduce((acc, value, index) => {
      if (value === "test" && data.date_rank[index] === "1.0") {
        acc.push(index)
      }
      return acc
    }, [])

    metrics.predicted_sales_ts = testIndices.reduce((acc, index) => acc + Number.parseFloat(data.ts_pred[index]), 0)
    metrics.predicted_sales_mean = metrics.predicted_sales_ts / testIndices.length
    metrics.actual_sales_ts = testIndices.reduce((acc, index) => acc + Number.parseFloat(data.ts_actual[index]), 0)
    metrics.error_sales_ts = testIndices.reduce((acc, index) => acc + Number.parseFloat(data.ts_error[index]), 0)
  }

  // Calculate future metrics
  const future_indices = data.split.reduce((acc, value, index) => {
    if (value === "future") {
      acc.push(index)
    }
    return acc
  }, [])

  metrics.predicted_sales_f = future_indices.reduce((acc, index) => acc + Number.parseFloat(data.pred[index]), 0)
  metrics.predicted_sales_f_mean = metrics.predicted_sales_f / future_indices.length
  metrics.actual_sales_ly = future_indices.reduce((acc, index) => acc + Number.parseFloat(data.ly_actual[index]), 0)

  try {
    metrics.predicted_sales_f_value = future_indices.reduce(
      (acc, index) => acc + Number.parseFloat(data.sales_value_by_amount_[index]),
      0,
    )
  } catch (error) {
    metrics.predicted_sales_f_value = null
  }

  // Calculate accuracy metrics
  metrics.accuracy = (1 - metrics.error_sales_ts / metrics.actual_sales_ts) * 100
  metrics.bias = Math.abs((metrics.predicted_sales_ts - metrics.actual_sales_ts) / metrics.actual_sales_ts) * 100
  metrics.overall_accuracy =
    (1 - Math.abs((metrics.predicted_sales_ts - metrics.actual_sales_ts) / metrics.actual_sales_ts)) * 100
  metrics.latest_period_gap =
    ((metrics.predicted_sales_f_mean - metrics.predicted_sales_mean) / metrics.predicted_sales_mean) * 100
  metrics.yoy = ((metrics.predicted_sales_f - metrics.actual_sales_ly) / metrics.actual_sales_ly) * 100
  metrics.currentGrowth = Number.parseFloat(executiveViewData["Current_Growth%"]).toFixed(2)

  // Add raw sales data metrics if available
  if (isNew) {
    Object.assign(metrics, {
      Forecast_Per_Day: Math.round(Number.parseFloat(rawSalesData["Forecast_Per_Day"])),
      sales_last30days: Math.round(Number.parseFloat(rawSalesData["sales_last30days"])),
      sales_last60days: Math.round(Number.parseFloat(rawSalesData["sales_last60days"])),
      sales_last90days: Math.round(Number.parseFloat(rawSalesData["sales_last90days"])),
      sales_value_last30days: Math.round(Number.parseFloat(rawSalesData["sales_value_last30days"])),
      sales_value_last60days: Math.round(Number.parseFloat(rawSalesData["sales_value_last60days"])),
      sales_value_last90days: Math.round(Number.parseFloat(rawSalesData["sales_value_last90days"])),
      Sales_Per_Day: Math.round(Number.parseFloat(rawSalesData["Sales_Per_Day"])),
    })
  }

  return metrics
}

const extractExecutiveData = (executiveViewData, currentValue) => {
  // Early return if data is invalid
  if (!executiveViewData) {
    return {}
  }

  // Create a map of key-value pairs for faster lookups
  const extractedData = Object.keys(executiveViewData).reduce((acc, key) => {
    acc[key] = executiveViewData[key][0] || ""
    return acc
  }, {})

  // Set default Fill_rate if not present
  if (!extractedData.hasOwnProperty("Fill_rate")) {
    extractedData.Fill_rate = "NA"
  }

  return extractedData
}

const extractKeys = (data, dateColumn) => {
  // Early return if data is empty or invalid
  if (!data || Object.keys(data).length === 0) {
    return []
  }

  // Get keys once and memoize
  const keysToExtract = Object.keys(data).filter((key) => !["feature", "value"].includes(key))

  // Get length once
  const length = data[keysToExtract[0]].length

  // Pre-allocate array for better performance
  const extractedData = new Array(length)

  // Process data in chunks for better performance
  const CHUNK_SIZE = 1000
  const chunks = Math.ceil(length / CHUNK_SIZE)

  for (let chunk = 0; chunk < chunks; chunk++) {
    const start = chunk * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, length)

    for (let i = start; i < end; i++) {
      const dataPoint = {}

      for (const key of keysToExtract) {
        if (data.hasOwnProperty(key)) {
          const value = data[key][i]

          if (value !== null && value !== undefined) {
            dataPoint[key] = key === dateColumn || key === "split" ? value : Number.parseFloat(value, 10)
          }
        }
      }

      if (Object.keys(dataPoint).length > 0) {
        extractedData[i] = dataPoint
      }
    }
  }

  // Filter out any undefined entries
  return extractedData.filter(Boolean)
}

const formatDateWithSuffix = (dateString) => {
  // Normalize the date string to 'YYYY-MM-DD' using regex
  const normalizeDateString = (dateStr) => {
    // Match the most common formats (YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY)
    let normalizedDateStr = dateStr

    // Check if it's in 'YYYY-DD-MM' format (swap to 'YYYY-MM-DD')
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split("-")
      if (Number.parseInt(parts[1], 10) > 12) {
        // Swap day and month if day is > 12 (meaning it's DD-MM instead of MM-DD)
        normalizedDateStr = `${parts[0]}-${parts[2]}-${parts[1]}`
      }
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      // Convert 'DD-MM-YYYY' or 'MM-DD-YYYY' to 'YYYY-MM-DD'
      const parts = dateStr.split("-")
      if (Number.parseInt(parts[1], 10) > 12) {
        // It's in 'DD-MM-YYYY' format
        normalizedDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`
      } else {
        // It's in 'MM-DD-YYYY' format
        normalizedDateStr = `${parts[2]}-${parts[0]}-${parts[1]}`
      }
    }

    return normalizedDateStr
  }

  const normalizedDate = normalizeDateString(dateString)
  const date = new Date(normalizedDate)

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date" // Handle invalid date
  }

  const day = date.getDate()
  // Get the month in 3-letter format like 'Jan', 'Feb'
  const month = date.toLocaleString("default", { month: "short" })
  const year = date.getFullYear()

  // Function to determine the ordinal suffix
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th" // handles 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`
}

// Helper function to calculate future accuracy
const calculateFutureAccuracy = (data) => {
  // Filter data
  const metricsDataFuture = data.filter((entry) => entry.split === "future" && entry.date_rank === 1.0)

  // Calculate future accuracy
  const totalTsActual = metricsDataFuture.reduce((sum, entry) => sum + entry.ts_actual, 0)
  const totalTsError = metricsDataFuture.reduce((sum, entry) => sum + Math.abs(entry.ts_error), 0)

  return 1 - totalTsError / totalTsActual
}

// Helper function to calculate number of weeks between two dates
const calculateDateDifference = (startDate, endDate, frequency) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Check for invalid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Invalid Date(s)"
  }

  // Calculate the time difference in milliseconds
  const diffTime = Math.abs(end - start)
  console.log("Fre1: " + frequency)
  switch (frequency) {
    case "Weeks":
      return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) // Weeks
    case "Days":
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // Days
    case "Months":
      console.log("123456", (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()))
      return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) // Months
    case "Quarters":
      return Math.floor(((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())) / 3) // Quarters (3 months)
    case "Years":
      return end.getFullYear() - start.getFullYear() // Years
    case "Hour":
      return Math.floor(diffTime / (1000 * 60 * 60)) // Hours
    case "30 minute":
      return Math.floor(diffTime / (1000 * 60 * 30)) // 30-minute intervals
    case "15 minute":
      return Math.floor(diffTime / (1000 * 60 * 15)) // 15-minute intervals
    case "10 minute":
      return Math.floor(diffTime / (1000 * 60 * 10)) // 15-minute intervals
    case "5 minute":
      return Math.floor(diffTime / (1000 * 60 * 5)) // 15-minute intervals
    default:
      return "Invalid Frequency" // If frequency is not recognized
  }
}

// // Helper function to increment a date by one day
const incrementDateByOneDay = (dateString) => {
  const date = new Date(dateString)
  date.setDate(date.getDate() + 1)
  return date.toISOString().split("T")[0] // Return in YYYY-MM-DD format
}

const ViewMetrics = ({ experimentID, moduleName, run_date, first }) => {
  console.log("isFirst" + first)
  const [currentValue, setCurrentValue] = useState("all")
  const [currentDimension, setCurrentDimension] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Create a unique key for the current experiment
  const currentExperimentKey = `${experimentID}-${moduleName}-${run_date}`
  const previousExperimentKey = useRef(null)

  console.log(experimentID + moduleName)
  const {
    demandForecastingData,
    currentStartDate,
    currentEndDate,
    setCurrentEndDate,
    setCurrentStartDate,
    dimensionFilterData,
    forecastingPivotData,
    applyDimensionFilters,
    loadExecutiveViewData,
    loadRawSalesData,
    rawSalesData,
    experimentBasePath,
    executiveViewData,
    setForecastingPivotData,
    setForecastingDisagg,
    forecastingDisagg,
    loadDemandForecastingData,
    showFutureActuals,
    setShowFutureActuals,
    showMLForecast,
    setShowMLForecast,
    showPredictionInterval,
    setShowPredictionInterval,
    tablesFilterData,
    setFilterData,
    showRawActuals,
    setShowRawActuals,
    showOffsetForecast,
    setShowOffsetForecast,
    loadDimensionFilterData,
  } = useDashboard()

  const [extractedExecutiveViewData, setExtractedExecutiveViewData] = useState(
    extractExecutiveData(executiveViewData, currentValue),
  )

  const { hasParquetFiles = false, loadExperimentConfigFromS3, experiment_config } = useExperiment()
  const { userInfo, currentCompany } = useAuth()
  const dateColumn = experiment_config?.data.timestamp_column

  const colors = [
    "#c55b5d",
    "#4ab56e",
    "#d6a74d",
    "#5b7bbf",
    "#c88d5a",
    "#8b3f9f",
    "#5fd0d0",
    "#c88bcc",
    "#9baf5a",
    "#d59cb3",
    "#008585",
    "#c6b2d1",
    "#8e5a2d",
    "#d3d8a7",
    "#404080",
    "#8fd8a7",
    "#6f6f00",
    "#d0b89c",
    "#6f0000",
    "#6e6e6e",
  ]
  const frequencyDict = {
    W: "Weeks",
    M: "Months",
    Q: "Quarters",
    D: "Days",
    Y: "Year",
    H: "Hour",
    "30T": "30 minute",
    "15T": "15 minute",
    "10T": "10 minute",
    "5T": "5 minute",
  }
  const currencyDict = {
    USD: "$",
    INR: "₹",
  }
  const [transformedData, setTransformedData] = useState()
  const [boxContent, setboxContent] = useState(null)
  const [values, setvalues] = useState()
  console.log("optionValues " + values)

  // Reset state immediately when experiment changes
  useEffect(() => {
    if (previousExperimentKey.current !== currentExperimentKey) {
      console.log("Experiment changed, resetting state")
      setIsLoading(true)
      setboxContent(null)
      setTransformedData(null)
      previousExperimentKey.current = currentExperimentKey
    }
  }, [currentExperimentKey])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${experimentID}`
        let exp_config
        await executeParallelTasks([
          {
            fn: loadExperimentConfigFromS3,
            args: [moduleName, experimentID, userInfo, currentCompany],
            output: "exp_config",
          },
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadRawSalesData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              userInfo.userID,
              hasParquetFiles,
            ],
          },
          {
            fn: loadExecutiveViewData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/raw_sales_metrics.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              userInfo.userID,
              hasParquetFiles,
            ],
          },
          {
            fn: loadDemandForecastingData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
              {
                dimensionFilters: {
                  feature: [currentDimension],
                  value: [currentValue],
                },
                columnFilter: [],
                selectAllColumns: true,
              },
              hasParquetFiles,
            ],
          },
        ]).then((results) => {
          exp_config = results.exp_config
        })
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentExperimentKey]) // Use the experiment key as dependency

  console.log("experiment_config" + experiment_config)

  useEffect(() => {
    // Only process data if we're not loading and have the required data
    if (!isLoading && experiment_config && demandForecastingData) {
      setTransformedData(
        get_metrics(
          demandForecastingData,
          dateColumn,
          frequencyDict[experiment_config.data.frequency],
          extractedExecutiveViewData,
          showFutureActuals,
          rawSalesData,
          experiment_config.scenario_plan.pricing_constraints.currency !== undefined &&
            experiment_config.scenario_plan.pricing_constraints.currency
            ? currencyDict[experiment_config.scenario_plan.pricing_constraints.currency]
            : null,
        ),
      )
      setboxContent(
        demandForecastingCards(
          get_metrics(
            demandForecastingData,
            dateColumn,
            frequencyDict[experiment_config.data.frequency],
            extractedExecutiveViewData,
            showFutureActuals,
            rawSalesData,
            experiment_config.scenario_plan.pricing_constraints.currency !== undefined &&
              experiment_config.scenario_plan.pricing_constraints.currency
              ? currencyDict[experiment_config.scenario_plan.pricing_constraints.currency]
              : null,
          ),
          DataSet,
        ),
      )
    }

    console.log("BoxContent", boxContent)
  }, [demandForecastingData, isLoading, experiment_config])

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Grid container spacing={3} padding={"1px 10px 1px 10px"}>
        <>
          {/* Show skeleton while loading OR if no content yet */}
          {isLoading || !boxContent ? (
            <Grid container spacing={3} padding={"1px 10px 1px 10px"}>
              {[1, 2, 3].map((index) => (
                <Grid item xs={12} md={4} key={index}>
                  <SimpleMetricCardSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : (
            <>
              {boxContent.map((box) => (
                <Grid item xs={12} md={4} key={box.id}>
                  <BoxComponent
                    icon={box.icon}
                    title={box.title}
                    lables={box.lables}
                    id={box.id}
                    data={box}
                    onHoverBackgroundColor={"#F9F5FF"}
                  />
                </Grid>
              ))}
            </>
          )}
        </>
      </Grid>
    </Stack>
  )
}

export default ViewMetrics
