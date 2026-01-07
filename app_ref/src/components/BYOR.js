"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Stack,
  Box,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  styled,
  Chip,
  Tooltip,
  TablePagination,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FunctionsIcon from "@mui/icons-material/Functions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CustomButton from "./CustomButton";
import useDashboard from "../hooks/useDashboard";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { uploadJsonToS3 } from "../utils/s3Utils";
import useAuth from "../hooks/useAuth";
import { store } from "../redux/store";
import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import CustomTextInput from "./CustomInputControls/CustomTextInput";
import CustomArrayEditor from "./CustomInputControls/CustomeArrayEditor";
import { callQueryEngineQuery } from "../utils/queryEngine";
import SearchIcon from "@mui/icons-material/Search";
// Styled components
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: 0,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
    maxWidth: "95vw",
    width: "95vw",
    maxHeight: "95vh",
  },
}));

const ColumnSection = styled(Box)(({ theme, isDraggingOver }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: "#FFFFFF",
  border: `1px solid ${
    isDraggingOver ? theme.palette.primary.main : "#EAECF0"
  }`,
  borderRadius: "8px",
  transition: "all 0.2s ease",
  overflow: "hidden",
  position: "relative",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
}));

// Fix the Available Columns section to have proper height and scrolling
const ListContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "12px", // Increased gap between items
  width: "100%",
  flex: 1,
  padding: "8px",
  overflowY: "auto",
  maxHeight: "300px", // Add a max height to prevent full screen expansion
  "&::-webkit-scrollbar": {
    width: "6px",
    display: "block",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "3px",
    marginTop: "4px",
    marginBottom: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: "3px",
    "&:hover": {
      background: "#555",
    },
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#888 #f1f1f1",
});

// Make the draggable row more compact
const DraggableRow = styled("div")(({ theme, isDragging, isUsed }) => ({
  padding: "10px 12px",
  marginBottom: "8px", // Add space between rows
  width: "100%",
  display: "flex",
  alignItems: "center",
  backgroundColor: isUsed ? "#f0f7ff" : "#FFFFFF",
  border: "1px solid",
  borderColor: isUsed ? theme.palette.primary.light : theme.palette.grey[200],
  borderRadius: "4px",
  color: theme.palette.text.primary,
  fontSize: "0.875rem",
  transition: "all 0.2s ease",
  cursor: "grab",
  userSelect: "none",
  WebkitUserSelect: "none",
  MozUserUserSelect: "none",
  msUserSelect: "none",
  boxShadow: isDragging
    ? "0 4px 8px rgba(0, 0, 0, 0.1)"
    : "0 1px 2px rgba(0, 0, 0, 0.05)",
  transform: isDragging ? "scale(1.02)" : "none", // Smaller scale when dragging
  "&:hover": {
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
    transform: "translateY(-1px)",
    backgroundColor: isUsed ? "#e6f0ff" : "#f9f9f9",
  },
  "& .content": {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  "& .actions": {
    display: "flex",
    alignItems: "center",
    gap: "8px", // Increased gap between action buttons
  },
}));

const ResultsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#FFFFFF",
  border: "1px solid #EAECF0",
  borderRadius: "8px",
  height: "100%",
  overflow: "auto",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "0.875rem",
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const SectionHelp = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

// Make the drop zones more compact
const DropZone = styled(Box)(({ theme, isDraggingOver, isActive }) => ({
  padding: theme.spacing(2),
  backgroundColor: isDraggingOver
    ? "rgba(25, 118, 210, 0.08)"
    : isActive
    ? "#f0f7ff"
    : "#fff",
  border: `2px dashed ${
    isDraggingOver
      ? theme.palette.primary.main
      : isActive
      ? theme.palette.primary.light
      : "#EAECF0"
  }`,
  borderRadius: "8px",
  transition: "all 0.2s ease",
  minHeight: "100px", // Reduced from 120px
  maxHeight: "250px", // Add max height
  overflowY: "auto", // Add scrolling
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  position: "relative",
}));

// Helper functions
const formatKey = (key) => {
  if (!key) return "";

  const dateRegex = /\d{4}-\d{2}-\d{2}/;
  const dateMatch = key.match(dateRegex);

  if (dateMatch) {
    const date = dateMatch[0];
    try {
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      return key
        .replace(date, formattedDate)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    } catch (e) {
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }

  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const isNumeric = (value) => {
  return !isNaN(Number.parseFloat(value)) && isFinite(value);
};

// Main component
export default function BYORDialog({
  open,
  handleClose,
  data,
  title,
  fileName,
  filePath,
  reportTitle = null,
  customColumns = null,
}) {
  // Use the dashboard hook to access Redux state and actions
  const {
    BYORData,
    setBYORConfigurations,
    BYORConfig,
    setBYORData,
    saveBYORConfig,
    updateBYORGroupByColumns,
    updateBYORAggregationColumns,
    updateBYORFilterConditions,
    addBYORFilterCondition,
    removeBYORFilterCondition,
    updateBYORFilterCondition,
    experimentBasePath,
    clearBYORData,
  } = useDashboard();

  const { userInfo } = useAuth();

  // Get BYOR data from Redux state

  // Destructure BYOR data for easier access
  const { groupByColumns, aggregationColumns, filterConditions } = BYORData;

  // Local state for UI elements that don't need to be in Redux
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sampleData, setSampleData] = useState([]);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [results, setResults] = useState([]);
  const [reportName, setReportName] = useState("");
  const [columnValues, setColumnValues] = useState({});
  const [reportNameError, setReportNameError] = useState("");
  const reportNameInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && reportNameInputRef.current) {
      setTimeout(() => {
        reportNameInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setReportName("");
      setReportNameError("");
    }

    if (reportTitle) {
      setReportName(reportTitle);
      // Clear any error if we're editing an existing report
      setReportNameError("");
    }
    if (reportTitle && BYORConfig[reportTitle]?.filterConditions) {
      BYORConfig[reportTitle].filterConditions.forEach((condition) => {
        if (condition.column) {
          fetchColumnValues(condition.column);
        }
      });
    }
  }, [open]);

  // Initialize data when component mounts or data changes
  useEffect(() => {
    if (!data) return;

    if (customColumns) {
      setAvailableColumns(customColumns);
      return;
    }
    let sample = [];
    let columns = [];
    if (reportTitle) {
      setReportName(reportTitle);
    }

    if (Array.isArray(data)) {
      // Case 1: Data is already an array of rows
      sample = data.slice(0, 100);
      if (sample.length > 0) {
        columns = Object.keys(sample[0]);
      }
    } else if (typeof data === "object" && data !== null) {
      // Case 2: Data is an object with columns
      columns = Object.keys(data);

      // Convert column-oriented data to row-oriented
      const rowCount = columns.length > 0 ? data[columns[0]]?.length || 0 : 0;
      sample = Array.from({ length: Math.min(rowCount, 100) }, (_, i) => {
        const row = {};
        columns.forEach((col) => {
          if (data[col] && data[col][i] !== undefined) {
            row[col] = data[col][i];
          }
        });
        return row;
      });
    }

    setSampleData(sample);
    setAvailableColumns(columns);

    // Reset Redux state when data changes
    setBYORData({
      groupByColumns: [],
      aggregationColumns: {},
      filterConditions: [],
      byorFilterData: {},
    });

    setResults([]);
    setPage(0);
    console.log("isCausing multiple rerenders 1");
  }, [data]);

  // Check if a column is used in any section
  const isColumnUsed = (column) => {
    return (
      groupByColumns.includes(column) ||
      Object.keys(aggregationColumns).includes(column) ||
      filterConditions.some((condition) => condition.column === column)
    );
  };

  // Get column usage type
  const getColumnUsageType = (column) => {
    if (groupByColumns.includes(column)) return "groupBy";
    if (Object.keys(aggregationColumns).includes(column)) return "aggregation";
    if (filterConditions.some((condition) => condition.column === column))
      return "filter";
    return null;
  };

  // Get unique values for a column
  const getUniqueValues = (column) => {
    if (!column || sampleData.length === 0) return [];

    return sampleData
      .map((row) => row[column])
      .filter(
        (value, i, arr) =>
          value !== undefined && value !== null && arr.indexOf(value) === i
      )
      .sort((a, b) => {
        if (isNumeric(a) && isNumeric(b)) {
          return Number(a) - Number(b);
        }
        return String(a).localeCompare(String(b));
      });
  };

  // Process results whenever groupBy, aggregation, or filters change
  // useEffect(() => {
  //   if (sampleData.length === 0) return;

  //   // Apply filters first
  //   let filteredData = [...sampleData];
  //   if (filterConditions.length > 0) {
  //     filteredData = filteredData.filter((row) => {
  //       return filterConditions.every((condition) => {
  //         const { column, operator, value, valueTo, multiValues } = condition;
  //         if (!column) return true;

  //         const rowValue = row[column];

  //         switch (operator) {
  //           case "equals":
  //             return rowValue === value;
  //           case "notEquals":
  //             return rowValue !== value;
  //           case "contains":
  //             return String(rowValue)
  //               .toLowerCase()
  //               .includes(String(value).toLowerCase());
  //           case "greaterThan":
  //             return (
  //               isNumeric(rowValue) &&
  //               Number.parseFloat(rowValue) > Number.parseFloat(value)
  //             );
  //           case "lessThan":
  //             return (
  //               isNumeric(rowValue) &&
  //               Number.parseFloat(rowValue) < Number.parseFloat(value)
  //             );
  //           case "between":
  //             if (
  //               !isNumeric(rowValue) ||
  //               !isNumeric(value) ||
  //               !isNumeric(valueTo)
  //             )
  //               return true;
  //             const numValue = Number.parseFloat(rowValue);
  //             return (
  //               numValue >= Number.parseFloat(value) &&
  //               numValue <= Number.parseFloat(valueTo)
  //             );
  //           case "multiSelect":
  //             if (!multiValues || multiValues.length === 0) return true;
  //             return multiValues.includes(rowValue);
  //           default:
  //             return true;
  //         }
  //       });
  //     });
  //   }

  //   // If no groupBy columns, just return filtered data
  //   if (groupByColumns.length === 0) {
  //     setResults(filteredData);
  //     return;
  //   }

  //   // Group data
  //   const groupedData = {};

  //   filteredData.forEach((row) => {
  //     // Create a key based on groupBy columns
  //     const groupKey = groupByColumns.map((col) => row[col]).join("_|_");
  //     console.log("GropuKey " + groupKey + " ");
  //     if (!groupedData[groupKey]) {
  //       groupedData[groupKey] = {
  //         group: groupByColumns.reduce((acc, col) => {
  //           acc[col] = row[col];
  //           return acc;
  //         }, {}),
  //         aggregates: {},
  //         count: 0,
  //         rows: [],
  //       };
  //     }

  //     groupedData[groupKey].count++;
  //     groupedData[groupKey].rows.push(row);
  //   });

  //   console.log("groupedData " + JSON.stringify(groupedData) + " ");

  //   // Calculate aggregations
  //   Object.keys(groupedData).forEach((groupKey) => {
  //     const group = groupedData[groupKey];

  //     Object.keys(aggregationColumns).forEach((column) => {
  //       const func = aggregationColumns[column] || "sum";
  //       const values = group.rows
  //         .map((row) => {
  //           const val = row[column];
  //           return isNumeric(val) ? Number.parseFloat(val) : null;
  //         })
  //         .filter((val) => val !== null);

  //       if (values.length > 0) {
  //         switch (func) {
  //           case "sum":
  //             group.aggregates[column] = values.reduce(
  //               (sum, val) => sum + val,
  //               0
  //             );
  //             break;
  //           case "avg":
  //             group.aggregates[column] =
  //               values.reduce((sum, val) => sum + val, 0) / values.length;
  //             break;
  //           case "min":
  //             group.aggregates[column] = Math.min(...values);
  //             break;
  //           case "max":
  //             group.aggregates[column] = Math.max(...values);
  //             break;
  //           case "count":
  //             group.aggregates[column] = values.length;
  //             break;
  //           default:
  //             group.aggregates[column] = values.reduce(
  //               (sum, val) => sum + val,
  //               0
  //             );
  //         }
  //       } else {
  //         group.aggregates[column] = null;
  //       }
  //     });
  //   });

  //   // Convert grouped data to array for display
  //   const resultArray = Object.values(groupedData).map((group) => {
  //     return {
  //       ...group.group,
  //       ...group.aggregates,
  //       _count: group.count,
  //     };
  //   });

  //   setResults(resultArray);
  //   setPage(0);

  //   console.log("isCausing multiple rerenders 2");
  // }, [sampleData, groupByColumns, aggregationColumns, filterConditions]);

  useEffect(() => {
    const areFilterConditionsComplete = () => {
      if (filterConditions.length === 0) return true;

      return filterConditions.every((condition) => {
        const { column, operator, value, valueTo, multiValues } = condition;

        if (!column || !operator) return false;

        switch (operator) {
          case "equals":
          case "notEquals":
          case "contains":
          case "greaterThan":
          case "lessThan":
            return value !== undefined && value !== "";
          case "between":
            return (
              value !== undefined &&
              value !== "" &&
              valueTo !== undefined &&
              valueTo !== ""
            );
          case "multiSelect":
            return multiValues && multiValues.length > 0;
          default:
            return true;
        }
      });
    };

    const fetchResults = async () => {
      try {
        // Only proceed if all filter conditions are complete
        if (!areFilterConditionsComplete()) {
          return;
        }

        let payload;

        if (reportTitle) {
          // If editing an existing report, use the config from BYORConfig
          const config = BYORConfig[reportTitle];
          payload = {
            fileName:
              config.fileName || convertFilePathToFileName(config.filePath),
            filePath: config.filePath,
            filterData: config.filterData || null,
            sortingData: config.sortingData || null,
            groupByColumns: groupByColumns,
            aggregationColumns: aggregationColumns,
            filterConditions: filterConditions,
            paginationData: null,
            time: Date.now(),
          };
        } else {
          // For new reports, use the current BYORData
          payload = {
            fileName: convertFilePathToFileName(filePath),
            filePath,
            filterData: null,
            sortingData: null,
            groupByColumns: groupByColumns,
            aggregationColumns: aggregationColumns,
            filterConditions: filterConditions,
            paginationData: null,
            time: Date.now(),
          };
        }

        const result = await callQueryEngineQuery(payload);
        const transformedData = transformQueryResponse(result);
        setResults(transformedData);
        // You might want to handle pagination info from the response if available
        // e.g., setTotalResults(result.totalCount)
      } catch (error) {
        console.error("Error fetching results:", error);
        setResults([]);
      }
    };

    fetchResults();
  }, [
    groupByColumns,
    aggregationColumns,
    filterConditions,
    rowsPerPage,
    reportTitle,
    fileName,
    filePath,
    BYORConfig,
  ]);

  const fetchColumnValues = async (column) => {
    try {
      // Create a payload with just the selected column as a groupBy column
      const payload = {
        fileName: convertFilePathToFileName(filePath),
        filePath,
        filterData: null,
        sortingData: null,
        groupByColumns: [column],
        aggregationColumns: {},
        filterConditions: [],
        paginationData: null,
        fetchAllRows: true,
        time: Date.now(),
      };

      const result = await callQueryEngineQuery(payload);
      const transformedData = transformQueryResponse(result);

      // Extract unique values for the column from the results
      const uniqueValues = transformedData
        .map((row) => row[column])
        .filter(
          (value, index, self) =>
            value !== undefined &&
            value !== null &&
            self.indexOf(value) === index
        );

      // Update the columnValues state with the fetched values

      setColumnValues((prev) => ({
        ...prev,
        [column]: uniqueValues,
      }));
    } catch (error) {
      console.error(`Error fetching values for column ${column}:`, error);
    }
  };

  const handleReportNameChange = (e) => {
    const value = e.target.value;
    setReportName(value);

    if (!value.trim()) {
      setReportNameError("Report name is required");
    } else if (BYORConfig[value.trim()] && !reportTitle) {
      // Only check for duplicates if it's not the existing report (reportTitle is not provided)
      setReportNameError("Report name already exists");
    } else {
      setReportNameError("");
    }
  };

  const convertFilePathToFileName = (filePath) => {
    if (!filePath) return "";

    const withoutExtension = filePath.replace(/\.[^/.]+$/, "");

    const pathComponents = withoutExtension.split("/");

    return pathComponents.join("_");
  };

  const generatedFileName = fileName || convertFilePathToFileName(filePath);

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      setReportNameError("Report name is required");
      if (reportNameInputRef.current) {
        reportNameInputRef.current.focus();
      }
      return;
    }

    if (BYORConfig[reportName.trim()] && !reportTitle) {
      setReportNameError("Report name already exists");
      if (reportNameInputRef.current) {
        reportNameInputRef.current.focus();
      }
      return;
    }

    await saveBYORConfig(reportName, {
      ...BYORData,
      filterData: null,
      sortingData: null,
      fileName: generatedFileName,
      title,
      filePath,
    });
    const updatedBYORConfig = store.getState().dashboard.BYORConfig;

    await uploadJsonToS3(
      `${experimentBasePath}/custom_report/BYORDataConfig.json`,
      updatedBYORConfig
    );
    clearBYORData();
    handleClose();
  };

  // Handle drag end for column selection
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    // Extract the column name from the draggableId
    // The format is "list-column" (e.g., "available-column_name")
    const draggableIdParts = result.draggableId.split("-");
    const prefix = draggableIdParts[0];
    const column = draggableIdParts.slice(1).join("-");

    console.log("Drag end:", {
      sourceId,
      destId,
      column,
      draggableId: result.draggableId,
      sourceIndex: source.index,
      destIndex: destination.index,
    });

    // Handle different drag scenarios
    if (sourceId === "available" && destId === "groupBy") {
      // Add to groupBy from available
      if (!groupByColumns.includes(column)) {
        const newGroupByColumns = [...groupByColumns, column];
        updateBYORGroupByColumns(newGroupByColumns);
      }
    } else if (sourceId === "available" && destId === "aggregation") {
      // Add to aggregation from available
      if (!Object.keys(aggregationColumns).includes(column)) {
        const newAggregationColumns = {
          ...aggregationColumns,
          [column]: "sum",
        };
        updateBYORAggregationColumns(newAggregationColumns);
      }
    } else if (sourceId === "groupBy" && destId === "groupBy") {
      // Reorder within groupBy
      const newGroupBy = [...groupByColumns];
      const [movedColumn] = newGroupBy.splice(source.index, 1);
      newGroupBy.splice(destination.index, 0, movedColumn);
      updateBYORGroupByColumns(newGroupBy);
    } else if (sourceId === "aggregation" && destId === "aggregation") {
      // Reorder within aggregation
      const aggregationKeys = Object.keys(aggregationColumns);
      const newAggregationOrder = [...aggregationKeys];
      const [movedColumn] = newAggregationOrder.splice(source.index, 1);
      newAggregationOrder.splice(destination.index, 0, movedColumn);

      // Create new aggregation columns object with the new order
      const newAggregationColumns = {};
      newAggregationOrder.forEach((key) => {
        newAggregationColumns[key] = aggregationColumns[key];
      });

      updateBYORAggregationColumns(newAggregationColumns);
    }
  };

  // Handle direct addition to groupBy
  const handleAddToGroupBy = (column) => {
    if (groupByColumns.includes(column)) return;
    const newGroupByColumns = [...groupByColumns, column];
    updateBYORGroupByColumns(newGroupByColumns);
  };

  // Handle direct addition to aggregation
  const handleAddToAggregation = (column) => {
    if (Object.keys(aggregationColumns).includes(column)) return;

    // Set default aggregation function to sum
    const newAggregationColumns = {
      ...aggregationColumns,
      [column]: "sum",
    };
    updateBYORAggregationColumns(newAggregationColumns);
  };

  // Handle changing aggregation function for a column
  const handleAggregationFunctionChange = (column, func) => {
    const newAggregationColumns = {
      ...aggregationColumns,
      [column]: func,
    };
    updateBYORAggregationColumns(newAggregationColumns);
  };

  // Handle adding a filter condition
  const handleAddFilterCondition = () => {
    if (availableColumns.length === 0) return;

    const newCondition = {
      column: availableColumns[0],
      type: "string", // Default type is string
      operator: "equals",
      value: "",
      valueTo: "",
      multiValues: [],
    };
    fetchColumnValues(availableColumns[0]);
    addBYORFilterCondition(newCondition);
  };

  // Handle removing a filter condition
  const handleRemoveFilterCondition = (index) => {
    removeBYORFilterCondition(index);
  };

  // Handle updating a filter condition
  const handleUpdateFilterCondition = (index, field, value) => {
    const updatedCondition = {
      ...filterConditions[index],
      [field]: value,
    };

    // Reset values when operator changes
    if (field === "operator") {
      updatedCondition.value = "";
      updatedCondition.valueTo = "";
      updatedCondition.multiValues = [];
    }

    // Reset operator when column or type changes
    if (field === "column") {
      updatedCondition.value = "";
      updatedCondition.valueTo = "";
      updatedCondition.multiValues = [];

      fetchColumnValues(value);
    }

    // Reset operator when type changes to ensure compatible operators
    if (field === "type") {
      // Set default operator based on type
      updatedCondition.operator = value === "string" ? "equals" : "equals";
      updatedCondition.value = "";
      updatedCondition.valueTo = "";
      updatedCondition.multiValues = [];
    }

    updateBYORFilterCondition(index, updatedCondition);
  };

  // Handle removing a column from groupBy
  const handleRemoveGroupByColumn = (column) => {
    const newGroupByColumns = groupByColumns.filter((col) => col !== column);
    updateBYORGroupByColumns(newGroupByColumns);
  };

  // Handle removing a column from aggregation
  const handleRemoveAggregationColumn = (column) => {
    const newAggregationColumns = { ...aggregationColumns };
    delete newAggregationColumns[column];
    updateBYORAggregationColumns(newAggregationColumns);
  };
  const transformQueryResponse = (responseData) => {
    if (!responseData) return [];

    // Check if the response is already in the correct format (array of objects)
    if (Array.isArray(responseData)) {
      return responseData;
    }

    // Transform object with array properties into array of objects
    const keys = Object.keys(responseData);
    if (keys.length === 0) return [];

    // Get the length from the first array property
    const firstKey = keys[0];
    const rowCount = responseData[firstKey]?.length || 0;

    // Create an array of row objects
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      const row = {};
      keys.forEach((key) => {
        row[key] = responseData[key][i];
      });
      rows.push(row);
    }

    return rows;
  };

  // Get result columns for display
  const resultColumns = useMemo(() => {
    if (results.length === 0) return [];

    return Object.keys(results[0]);
  }, [results]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render value input based on operator
  const renderValueInput = (condition, index) => {
    const { column, operator, value, valueTo, multiValues, type } = condition;
    const uniqueValues = getUniqueValues(column);

    switch (operator) {
      case "between":
        if (type !== "number") return null;
        return (
          <Box
            sx={{
              gap: 1,
              width: "100%",
            }}
          >
            <CustomTextInput
              required
              showLabel
              label={"From"}
              placeholder="From"
              name="From"
              value={value || ""}
              onChange={(e) =>
                handleUpdateFilterCondition(index, "value", e.target.value)
              }
              type={type === "number" ? "number" : "text"}
            />

            <CustomTextInput
              required
              showLabel
              label={"To"}
              placeholder="To"
              name="To"
              value={valueTo || ""}
              onChange={(e) =>
                handleUpdateFilterCondition(index, "valueTo", e.target.value)
              }
              type={type === "number" ? "number" : "text"}
              sx={{
                backgroundColor: "white",
              }}
            />
          </Box>
        );

      case "contains":
        if (type !== "string") return null;
        return (
          <FormControl sx={{ width: "100%" }} size="small">
            <CustomTextInput
              required
              showLabel
              label={"Value"}
              placeholder="Value"
              name="Value"
              value={value || ""}
              onChange={(e) =>
                handleUpdateFilterCondition(index, "value", e.target.value)
              }
            />
          </FormControl>
        );

      case "multiSelect":
        return (
          <FormControl sx={{ width: "100%" }} size="small">
            <CustomAutocomplete
              disableClearable
              isMultiSelect
              selectedValues={multiValues || []}
              setSelectedValues={(newValue) =>
                handleUpdateFilterCondition(index, "multiValues", newValue)
              }
              label={"Select Values"}
              placeholder={"Select Values"}
              showLabel
              values={columnValues[column] || []}
            />
          </FormControl>
        );

      case "greaterThan":
      case "lessThan":
        if (type !== "number") return null;
        return (
          <FormControl sx={{ width: "100%" }} size="small">
            <CustomTextInput
              required
              showLabel
              label={"Value"}
              placeholder="Value"
              name="Value"
              value={value || ""}
              onChange={(e) =>
                handleUpdateFilterCondition(index, "value", e.target.value)
              }
              type="number"
            />
          </FormControl>
        );

      default:
        if (type === "number") {
          return (
            <FormControl sx={{ width: "100%" }} size="small">
              <CustomTextInput
                required
                showLabel
                label={"Value"}
                placeholder="Value"
                name="Value"
                value={value || ""}
                onChange={(e) =>
                  handleUpdateFilterCondition(index, "value", e.target.value)
                }
                type="number"
              />
            </FormControl>
          );
        } else {
          return (
            <FormControl sx={{ width: "100%" }} size="small">
              <CustomAutocomplete
                disableClearable
                values={columnValues[column] || []}
                setSelectedValues={(newValue) =>
                  handleUpdateFilterCondition(index, "value", newValue)
                }
                label={"Value"}
                placeholder="Value"
                showLabel
                selectedValues={value || ""}
              />
            </FormControl>
          );
        }
    }
  };

  // Filter available columns based on search query
  const filteredAvailableColumns = useMemo(() => {
    if (!searchQuery) return availableColumns;
    return availableColumns.filter((column) =>
      formatKey(column).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableColumns, searchQuery]);

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, borderBottom: "1px solid #EAECF0" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Group & Aggregate: {reportTitle ? reportTitle : title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          padding: "0 !important",
          display: "flex",
          flexDirection: "column",
          height: "75vh",
          overflow: "hidden",
        }}
      >
        {/* Group & Aggregate Tab */}
        {0 === 0 && (
          <Box sx={{ p: 3, height: "calc(100% - 48px)", overflow: "auto" }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Box
                sx={{
                  borderRadius: "8px",
                  mb: 3,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                ></Box>

                <CustomTextInput
                  type="text"
                  name="reportName"
                  id="reportName"
                  value={reportName}
                  onChange={handleReportNameChange}
                  onBlur={() => {
                    /* handle blur if needed */
                  }}
                  placeholder="Enter a name for this report"
                  showLabel={true}
                  label="Report Name"
                  error={!!reportNameError}
                  helperText={reportNameError}
                  endAdornment={
                    <InputAdornment position="end">
                      {reportName ? (
                        <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                      ) : (
                        <Tooltip title="A report name is required">
                          <InfoOutlinedIcon color="action" sx={{ ml: 1 }} />
                        </Tooltip>
                      )}
                    </InputAdornment>
                  }
                />
              </Box>

              {/* Filter Section - Improved design */}
              <Box
                sx={{
                  p: 2,
                  border: "1px solid #EAECF0",
                  borderRadius: "8px",
                  mb: 3,
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Filter Conditions
                    </Typography>
                    {/* <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Add conditions to filter your data before grouping and
                      aggregation
                    </Typography> */}
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleAddFilterCondition}
                    disabled={availableColumns.length === 0}
                    size="small"
                  >
                    Add Filter
                  </Button>
                </Box>

                {filterConditions.length === 0 ? (
                  <Box
                    sx={{
                      p: 3,
                      border: "1px dashed #ccc",
                      borderRadius: "8px",
                      textAlign: "center",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <FilterListIcon
                      sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      No filter conditions added. Click "Add Filter" to create
                      one.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {filterConditions.map((condition, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          border: "1px solid #EAECF0",
                          borderRadius: "8px",
                          backgroundColor: "#f9fafb",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                          }}
                        >
                          <FormControl sx={{ width: "20%" }} size="small">
                            <CustomAutocomplete
                              disableClearable
                              values={availableColumns}
                              selectedValues={condition.column}
                              setSelectedValues={(newValue) =>
                                handleUpdateFilterCondition(
                                  index,
                                  "column",
                                  newValue
                                )
                              }
                              label={"Column"}
                              placeholder={"Select Column"}
                              showLabel
                            />
                          </FormControl>

                          <FormControl sx={{ width: "15%" }} size="small">
                            <CustomAutocomplete
                              disableClearable
                              values={["string", "number"]}
                              selectedValues={condition.type || "string"}
                              setSelectedValues={(newValue) =>
                                handleUpdateFilterCondition(
                                  index,
                                  "type",
                                  newValue
                                )
                              }
                              label={"Type"}
                              placeholder={"Select Type"}
                              showLabel
                            />
                          </FormControl>

                          <FormControl sx={{ width: "15%" }} size="small">
                            <CustomAutocomplete
                              disableClearable
                              values={
                                condition.type === "number"
                                  ? [
                                      "equals",
                                      "notEquals",
                                      "greaterThan",
                                      "lessThan",
                                      "between",
                                    ]
                                  : [
                                      "equals",
                                      "notEquals",
                                      "contains",
                                      "multiSelect",
                                    ]
                              }
                              selectedValues={condition.operator || "equals"}
                              setSelectedValues={(newValue) =>
                                handleUpdateFilterCondition(
                                  index,
                                  "operator",
                                  newValue
                                )
                              }
                              label={"Operator"}
                              placeholder={"Select Operator"}
                              showLabel
                            />
                          </FormControl>

                          <Box sx={{ width: "40%" }}>
                            {renderValueInput(condition, index)}
                          </Box>

                          <IconButton
                            color="error"
                            onClick={() => handleRemoveFilterCondition(index)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              alignSelf: "center",
                            }}
                            size="large"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Main content with side-by-side layout */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  height: "calc(100% - 150px)",
                  minHeight: "500px",
                }}
              >
                {/* Left side - Available Columns */}
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid #EAECF0",
                    borderRadius: "8px",
                    width: "25%", // Reduced width
                    height: "100%", // Set to full height
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, flex: 1 }}
                    >
                      Available Columns ({availableColumns.length})
                    </Typography>
                  </Box>
                  {/* <Typography
                    variant="body2"
                    sx={{ mb: 2, color: "text.secondary" }}
                  >
                    Drag columns to Group By, Aggregation, or Filter sections
                  </Typography> */}
                  <Box sx={{ mb: 2 }}>
                    <CustomTextInput
                      placeholder="Search columns..."
                      value={searchQuery || ""}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      }
                      size="small"
                      fullWidth
                    />
                  </Box>
                  <Droppable droppableId="available">
                    {(provided, snapshot) => (
                      <ListContainer
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{
                          flex: 1,
                          maxHeight: "none", // Remove max height to fill container
                        }}
                      >
                        {filteredAvailableColumns.map((column, index) => {
                          const isUsed = isColumnUsed(column);
                          const usageType = getColumnUsageType(column);

                          return (
                            <Draggable
                              key={column}
                              draggableId={`available-${column}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Tooltip
                                  title={formatKey(column)}
                                  placement="top"
                                >
                                  <DraggableRow
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    isDragging={snapshot.isDragging}
                                    isUsed={isUsed}
                                  >
                                    <div className="content">
                                      {isUsed && (
                                        <Tooltip title={`Used in ${usageType}`}>
                                          <CheckCircleIcon
                                            fontSize="small"
                                            color="primary"
                                            sx={{ mr: 0.5 }}
                                          />
                                        </Tooltip>
                                      )}
                                      <span>{formatKey(column)}</span>
                                    </div>
                                    <div className="actions">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleAddToGroupBy(column)
                                        }
                                        sx={{ p: 0.5 }}
                                        title="Add to Group By"
                                      >
                                        <GroupWorkIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleAddToAggregation(column)
                                        }
                                        sx={{ p: 0.5 }}
                                        title="Add to Aggregation"
                                      >
                                        <FunctionsIcon fontSize="small" />
                                      </IconButton>
                                    </div>
                                  </DraggableRow>
                                </Tooltip>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {filteredAvailableColumns.length === 0 && (
                          <Typography
                            variant="body2"
                            sx={{
                              p: 2,
                              textAlign: "center",
                              color: "text.secondary",
                            }}
                          >
                            {availableColumns.length === 0
                              ? "No available columns"
                              : "No matching columns found"}
                          </Typography>
                        )}
                      </ListContainer>
                    )}
                  </Droppable>
                </Box>

                {/* Middle - Group By and Aggregation stacked */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    width: "25%",
                    height: "100%", // Set to full height
                  }}
                >
                  {/* Group By Section */}
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #EAECF0",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1, // Take up half the space
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <GroupWorkIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Group By Columns
                      </Typography>
                    </Box>
                    {/* <Typography
                      variant="body2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      Drag columns here to group your data by these values
                    </Typography> */}
                    <Droppable droppableId="groupBy">
                      {(provided, snapshot) => (
                        <DropZone
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          isDraggingOver={snapshot.isDraggingOver}
                          isActive={groupByColumns.length > 0}
                          sx={{ flex: 1, minHeight: "50px", maxHeight: "none" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              width: "100%",
                            }}
                          >
                            {groupByColumns.map((column, index) => (
                              <Chip
                                key={`groupBy-${column}`}
                                label={formatKey(column)}
                                onDelete={() =>
                                  handleRemoveGroupByColumn(column)
                                }
                                sx={{ margin: 0.5 }}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          {provided.placeholder}
                          {groupByColumns.length === 0 && (
                            <Box sx={{ textAlign: "center", py: 1 }}>
                              <ArrowDownwardIcon
                                sx={{
                                  fontSize: 24,
                                  color: "action.disabled",
                                  mb: 0.5,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary" }}
                              >
                                Drag columns here from Available
                              </Typography>
                            </Box>
                          )}
                        </DropZone>
                      )}
                    </Droppable>
                  </Box>

                  {/* Aggregation Section */}
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid #EAECF0",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1, // Take up half the space
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <FunctionsIcon sx={{ mr: 1, color: "primary.main" }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Aggregation Columns
                      </Typography>
                    </Box>
                    {/* <Typography
                      variant="body2"
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      Drag numeric columns here to calculate aggregations
                    </Typography> */}
                    <Droppable droppableId="aggregation">
                      {(provided, snapshot) => (
                        <DropZone
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          isDraggingOver={snapshot.isDraggingOver}
                          isActive={Object.keys(aggregationColumns).length > 0}
                          sx={{ flex: 1, minHeight: "50px", maxHeight: "none" }}
                        >
                          <Stack spacing={1} sx={{ width: "100%" }}>
                            {Object.keys(aggregationColumns).map(
                              (column, index) => (
                                <Box
                                  key={`aggregation-${column}`}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    padding: 1,
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 1,
                                    backgroundColor: "#fff",
                                  }}
                                >
                                  <Tooltip
                                    title={formatKey(column)}
                                    placement="top"
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        flex: 1,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "100px",
                                      }}
                                    >
                                      {formatKey(column)}
                                    </Typography>
                                  </Tooltip>
                                  <FormControl
                                    size="small"
                                    sx={{ minWidth: 70 }}
                                  >
                                    <Select
                                      value={
                                        aggregationColumns[column] || "sum"
                                      }
                                      onChange={(e) =>
                                        handleAggregationFunctionChange(
                                          column,
                                          e.target.value
                                        )
                                      }
                                      sx={{ height: "28px" }}
                                    >
                                      <MenuItem value="sum">Sum</MenuItem>
                                      <MenuItem value="avg">Avg</MenuItem>
                                      <MenuItem value="min">Min</MenuItem>
                                      <MenuItem value="max">Max</MenuItem>
                                      <MenuItem value="count">Count</MenuItem>
                                    </Select>
                                  </FormControl>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleRemoveAggregationColumn(column)
                                    }
                                    sx={{ p: 0.3 }}
                                  >
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )
                            )}
                          </Stack>
                          {provided.placeholder}
                          {Object.keys(aggregationColumns).length === 0 && (
                            <Box sx={{ textAlign: "center", py: 1 }}>
                              <ArrowDownwardIcon
                                sx={{
                                  fontSize: 24,
                                  color: "action.disabled",
                                  mb: 0.5,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary" }}
                              >
                                Drag numeric columns here from Available
                              </Typography>
                            </Box>
                          )}
                        </DropZone>
                      )}
                    </Droppable>
                  </Box>
                </Box>

                {/* Right side - Results Table with Pagination */}
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid #EAECF0",
                    borderRadius: "8px",
                    width: "50%",
                    height: "100%", // Set to full height
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <VisibilityIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Results Preview
                    </Typography>
                  </Box>
                  {/* <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    Preview of your grouped and aggregated data
                  </Typography> */}

                  <Box
                    sx={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {results.length === 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          p: 2,
                          backgroundColor: "#f9fafb",
                          border: "1px dashed #ccc",
                          borderRadius: "8px",
                        }}
                      >
                        <VisibilityIcon
                          sx={{ fontSize: 30, color: "text.secondary", mb: 1 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: "center" }}
                        >
                          Configure grouping and aggregation settings to see
                          results
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                {resultColumns.map((column) => (
                                  <TableCell
                                    key={column}
                                    sx={{
                                      whiteSpace: "nowrap",
                                      backgroundColor: "#f9fafb",
                                      fontWeight: 600,
                                      padding: "8px",
                                    }}
                                  >
                                    <Typography variant="subtitle2">
                                      {column === "_count"
                                        ? "Count"
                                        : formatKey(column)}
                                    </Typography>
                                    {Object.keys(aggregationColumns).includes(
                                      column
                                    ) && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        ({aggregationColumns[column]})
                                      </Typography>
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {results
                                .slice(
                                  page * rowsPerPage,
                                  page * rowsPerPage + rowsPerPage
                                )
                                .map((row, rowIndex) => (
                                  <TableRow
                                    key={rowIndex}
                                    sx={{
                                      "&:nth-of-type(odd)": {
                                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                                      },
                                    }}
                                  >
                                    {resultColumns.map((column) => (
                                      <TableCell
                                        key={`${rowIndex}-${column}`}
                                        sx={{
                                          whiteSpace: "nowrap",
                                          padding: "6px 8px",
                                        }}
                                      >
                                        {Object.keys(
                                          aggregationColumns
                                        ).includes(column) &&
                                        isNumeric(row[column])
                                          ? Number.parseFloat(
                                              row[column]
                                            ).toFixed(2)
                                          : row[column]}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <TablePagination
                          component="div"
                          count={results.length}
                          page={page}
                          onPageChange={handleChangePage}
                          rowsPerPage={rowsPerPage}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                          rowsPerPageOptions={[5, 10, 25]}
                          sx={{ borderTop: "1px solid #EAECF0" }}
                        />
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </DragDropContext>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: "1px solid #EAECF0", p: 2 }}>
        <CustomButton
          title={"Cancel"}
          onClick={handleClose}
          outlined
          color="inherit"
        />
        <CustomButton
          title={"Apply"}
          onClick={handleSaveReport}
          color="primary"
        />
      </DialogActions>
    </BootstrapDialog>
  );
}
