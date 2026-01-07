import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { fetchJsonFromS3 } from "../utils/s3Utils";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  PaginationItem,
  Skeleton,
  Stack,
  Typography,
  Input,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { MoreVertRounded } from "@mui/icons-material";
import { ReactComponent as File } from "../assets/Icons/file_Icon.svg";
import { ThemeContext } from "../theme/config/ThemeContext";
import { useNavigate } from "react-router-dom";
import useDashboard from "../hooks/useDashboard";
import useExperiment from "../hooks/useExperiment";
import useAuth from "../hooks/useAuth";
import { useState, useEffect, useCallback, memo, Suspense, lazy } from "react";
import { loadReports } from "../redux/actions/dashboardActions";
import { clearCache } from "../utils/s3Utils";
import ConfirmationDialog from "./ConfirmationDialog";
import useConfig from "../hooks/useConfig";
import ContactSalesDialog from "./ContactSalesDialog";
import { setIsContactSalesDialogOpen } from "../redux/slices/authSlice";
import { useRef } from "react";
import { executeParallelTasks } from "../utils/executeParallelTasks";
import SupplyORAutoMLDialog from "./SupplyORAutoMLDialog";
import CustomButton from "./CustomButton";
import { ReactComponent as PlusIcon } from "../assets/Icons/plus.svg";
import { listFilesInFolderEndpoint } from "../utils/s3UtillsEndpoints";
import useModule from "../hooks/useModule";
import { oldFlowModules } from "./../utils/oldFlowModules";
import CustomTooltip from "./CustomToolTip";
import DescriptionDialog from "./DescriptionDialog";

const ViewMetrics = lazy(() => import("./ViewMetrics"));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.text.modalHeading,
    backgroundColor: theme.palette.background.default,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F9FAFB",
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.background.default,
  },
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease-in-out",
    backgroundColor: "#F9F5FF",
    borderTop: "1px solid #D6BBFB",
    borderBottom: "1px solid #D6BBFB",
  },
}));

const CustomPaginationItem = styled(PaginationItem, {
  shouldForwardProp: (prop) =>
    prop !== "isPrevOrNext" &&
    prop !== "isPrev" &&
    prop !== "isNext" &&
    prop !== "selected",
})(({ theme, isPrevOrNext, isPrev, isNext, selected }) => ({
  borderRadius: "0",
  border: "1px solid",
  borderColor: "#D0D5DD",
  margin: "0",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.button.backgroundOnHover,
  },
  "&:not(:first-of-type)": {
    borderLeft: "none",
  },
  "& .MuiTypography-root": {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: isPrevOrNext ? 600 : 500,
    lineHeight: "20px",
    textAlign: "left",
    color: isPrevOrNext ? "#1D2939" : "#344054",
    paddingLeft: isPrevOrNext ? "8px" : "0",
    paddingRight: isPrevOrNext ? "0" : "8px",
  },
  ...(!isPrevOrNext && {
    width: "40px",
  }),
  ...(isPrev && {
    borderBottomLeftRadius: "8px",
    borderTopLeftRadius: "8px",
  }),
  ...(isNext && {
    borderBottomRightRadius: "8px",
    borderTopRightRadius: "8px",
  }),
  ...(selected && {
    backgroundColor: "#F9FAFB",
  }),
}));

// function formatYearMonth(dateString) {
//   // Parse the date string
//   const date = new Date(dateString);

//   // Extract year and month
//   const year = date.getFullYear();
//   // Get month in 2-digit format (e.g., '08' for August)
//   const month = String(date.getMonth() + 1).padStart(2, "0");

//   // Concatenate year and month
//   return `${year}${month}`;
// }
export function formatYearMonth(dateString) {
  // Split the string to extract date part
  const datePart = dateString.split(" at ")[0];

  // Create a new Date object with the date part
  const date = new Date(datePart);

  // Check if the date is valid
  if (isNaN(date)) {
    throw new Error("Invalid date format");
  }

  // Extract year and month
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Concatenate year and month
  console.log("Run Date", `${year}${month}`);
  return `${year}${month}`;
}
const DashboardModules = [
  ...oldFlowModules,
  "next_best_offer",
  "next_best_action",
  "binary_classification",
  "regression",
];
const PlanModules = [...oldFlowModules];
export default function ExpTable({ currentFlow, currentTable }) {
  const { theme } = React.useContext(ThemeContext);
  const navigate = useNavigate();
  const {
    loadDemandForecastingData,
    loadDimensionFilterData,
    loadElasticityDimensionFilterData,
    loadRawSalesData,
    setCurrentDimension,
    setCurrentValue,
    setExperimentBasePath,
    setDashboardLoading,
    currentDimension,
    currentValue,
    loadInvPriceFilterData,
    loadTablesFilterData,
    syncExperimentConfigWithTablesFilter,
    syncExperimentConfigWithBYOR,
    setBYORConfigurations,
    loadSupplyPlanFilterData,
  } = useDashboard();
  const {
    experiments_list,
    loadExperimentConfigFromS3,
    setExperimentStatus,
    loadExperiementsList,
    hasParquetFiles,
    deleteTheExperiments,
    renameExperimentAndReload,
    filters,
    isArchiveAndProductionAndReload,
  } = useExperiment();
  const {
    loadExperimentConfigFromS3: loadExperimentConfigFromS3New,
    setExperimentStatus: setExperimentStatusNew,
  } = useModule();
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();
  const {
    isNoInstanceAvailable,
    setIsNoInstanceAvailable,
    retryExecution,
    setBaseDatasets,
    setDeletedBaseDatasets,
    setIsArchive,
    setIsProduction,
    setExperimentDescription,
  } = useConfig();

  const [data, setData] = useState(experiments_list ? experiments_list : null);
  const [expandedRow, setExpandedRow] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExperimentID, setEditingExperimentID] = useState(null);
  const [newExperimentName, setNewExperimentName] = useState("");
  const [newExperimentOpen, setNewExperimentOpen] = React.useState(false);
  const handleNewExperimentOpen = () => setNewExperimentOpen(true);
  const handleNewExperimentClose = () => setNewExperimentOpen(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [currentExperimentForDescription, setCurrentExperimentForDescription] =
    useState(null);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadExperiementsList(userInfo);
  //   }, 5000); // Polling every 5 seconds

  //   return () => clearInterval(interval);
  // }, []);

  const [retryCount, setRetryCount] = useState(0);
  // Remove isRetrying state - we'll use retryCount instead

  // Memoize loadExperiementsList to prevent infinite update loop
  const stableLoadExperiementsList = useCallback(() => {
    loadExperiementsList(userInfo);
  }, [loadExperiementsList, userInfo]);

  useEffect(() => {
    console.log("Retry Count", retryCount);

    // If we have data, stop retrying
    if (experiments_list && experiments_list.length > 0) {
      return;
    }

    // If we hit max retries, stop retrying
    if (retryCount >= 3) {
      return;
    }

    // If we need to retry, start a new retry
    if (!experiments_list || experiments_list.length === 0) {
      const timeout = setTimeout(async () => {
        try {
          console.log(
            `Attempting to load experiments list (retry ${retryCount + 1}/3)`
          );
          await stableLoadExperiementsList();
          console.log("Successfully loaded experiments list");
        } catch (error) {
          console.error("Failed to load experiments list:", error);
        } finally {
          setRetryCount((prev) => prev + 1);
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [experiments_list, retryCount, stableLoadExperiementsList]);
  console.log(experiments_list);
  useEffect(() => {
    setData(experiments_list);
    setFilterData(
      experiments_list
        ?.filter((row) => {
          if (row.inTrash) return false; // Exclude rows in trash

          if (currentFlow === "dashboard") {
            if (row.experimentRunType === "run_training") {
              // Include Completed experiments and not in Failed status
              return (
                parseString(row.experimentStatus) === "Completed" &&
                DashboardModules.includes(row.experimentModuleName)
              );
            }
            // Include all other run types that are not in Failed status
            return (
              (parseString(row.experimentStatus) !== "Failed" ||
                parseString(row.experimentStatus) !== "Terminated") &&
              DashboardModules.includes(row.experimentModuleName)
            );
          } else if (
            currentFlow === "scenario" ||
            currentFlow === "optimizations"
          ) {
            // Include only Completed experiments
            return (
              parseString(row.experimentStatus) === "Completed" &&
              PlanModules.includes(row.experimentModuleName)
            );
          } else {
            // Default: exclude rows in trash
            return !row.inTrash;
          }
        })
        .filter((row) => {
          if (currentTable === "archive") {
            return row.isArchive;
          }

          if (currentTable === "live") {
            return !row.isArchive;
          }
        })
    );
  }, [experiments_list]);
  // Ref to track if the reload condition is met
  const isReloading = useRef(false);

  useEffect(() => {
    // Function to check if any experiment's status matches the condition
    const shouldReload = () => {
      return experiments_list.some(
        (experiment) =>
          !["Failed", "Completed", "Terminated", "On Hold"].includes(
            parseString(experiment.experimentStatus)
          )
      );
    };

    // Function to handle loading the experiments list
    const loadIfNeeded = () => {
      if (shouldReload() && !isReloading.current) {
        isReloading.current = true; // Set reloading flag to true
        loadExperiementsList(userInfo);
        // Reset the flag after loading is completed
        setTimeout(() => {
          isReloading.current = false;
        }, 10000); // Prevent overlapping calls
      }
    };

    // Call loadIfNeeded once immediately
    loadIfNeeded();

    // Set up an interval to call the function every 30 seconds
    const interval = setInterval(loadIfNeeded, 10000);

    // Call it once immediately in case the condition is already met
    loadIfNeeded();

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, [userInfo, loadExperiementsList]);

  // Filter out experiments that are in trash
  const [filteredData, setFilterData] = useState(
    currentFlow !== "dashboard" && currentFlow !== "scenario"
      ? data?.filter((row) => !row.inTrash)
      : data
          ?.filter((row) => !row.inTrash)
          .filter((row) => parseString(row.experimentStatus) === "Completed")
  );

  // console.log("currentFlow: " + currentFlow);
  // console.log("filterData: " + filteredData);

  const [page, setPage] = useState(1);

  const RecordsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  function parseDate(dateString) {
    if (!dateString) return null;

    // Remove "at" to make it parseable: "Mar 7, 2025, at 8:09:06 PM" → "Mar 7, 2025, 8:09:06 PM"
    const cleanString = dateString.replace(/,\s*at\s*/, ", ");

    const parsedDate = new Date(cleanString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  const filteredAppliedData = filteredData.filter((experiment) => {
    if (filters.searchString && filters.searchString.trim() !== "") {
      const searchStr = filters.searchString.toLowerCase();
      const matchesSearch =
        experiment.experimentName.toLowerCase().includes(searchStr) ||
        experiment.experimentID.toLowerCase().includes(searchStr) ||
        experiment.createdBy.toLowerCase().includes(searchStr);

      if (!matchesSearch) return false;
    }

    if (filters.createdAt.startDate) {
      const createdDate = parseDate(experiment.createdAt);
      const startDate = new Date(filters.createdAt.startDate);

      if (!createdDate) {
        return false;
      }

      if (createdDate < startDate) return false;
    }

    if (filters.createdAt.endDate) {
      const createdDate = parseDate(experiment.createdAt);
      const endDate = new Date(filters.createdAt.endDate);
      endDate.setDate(endDate.getDate() + 1);

      if (!createdDate) {
        return false;
      }

      if (createdDate >= endDate) return false;
    }

    if (filters.updatedAt.startDate) {
      const updatedDate = parseDate(experiment.updatedAt);
      const startDate = new Date(filters.updatedAt.startDate);

      if (!updatedDate || isNaN(startDate.getTime())) {
        return false;
      }

      if (updatedDate < startDate) return false;
    }

    if (filters.updatedAt.endDate) {
      const updatedDate = parseDate(experiment.updatedAt);
      const endDate = new Date(filters.updatedAt.endDate);
      endDate.setDate(endDate.getDate() + 1);

      if (!updatedDate || isNaN(endDate.getTime())) {
        return false;
      }

      if (updatedDate >= endDate) return false;
    }
    // Apply module name filter
    if (filters.moduleNames?.length > 0) {
      if (!filters.moduleNames.includes(experiment.experimentModuleName))
        return false;
    }

    // Apply status filter
    if (filters.statuses?.length > 0) {
      let status;

      if (typeof experiment.experimentStatus === "string") {
        try {
          // Try to parse as JSON
          status = JSON.parse(experiment.experimentStatus).status;
        } catch (error) {
          // If parsing fails, assume the string itself is the status
          status = experiment.experimentStatus;
        }
      } else {
        // Object case
        status = experiment.experimentStatus.status;
      }

      if (!filters.statuses.includes(status)) return false;
    }
    if (filters.isProduction === true) {
      if (!experiment.isProduction) return false;
    }

    return true;
  });

  const paginatedData = filteredAppliedData.slice(
    (page - 1) * RecordsPerPage,
    page * RecordsPerPage
  );
  const [openDialog, setOpenDialog] = useState(false); // State for confirmation dialog
  const [currentExperimentID, setCurrentExperimentID] = useState(null); // State to store current experiment ID for deletion

  // Function to handle confirmation dialog
  const handleConfirmDelete = async () => {
    if (currentExperimentID) {
      const payload = {
        experimentTableName: `EXPERIMENTS`,
        experimentID: currentExperimentID,
        time: Date.now(),
      };

      const response = await deleteTheExperiments(
        currentCompany,
        userInfo,
        payload
      );
      console.log("Deleting experiment:", currentExperimentID, response);
      loadExperiementsList(userInfo);
      setOpenDialog(false); // Close the dialog after deletion
    }
  };

  const handleMenuClick = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setCurrentRow(row);
  };

  const handleMenuClose = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    setCurrentRow(null);
  };

  const handleRowExpand = (experimentID, event) => {
    event.stopPropagation();
    setExpandedRow((prev) => (prev === experimentID ? null : experimentID));
  };

  const handleRowHover = (experimentID) => {
    setHoveredRow(experimentID);
  };

  const handleRowLeave = () => {
    setHoveredRow(null);
  };

  const handleDelete = async (event, experimentID) => {
    event.stopPropagation();
    if (currentCompany.delete_experiments) {
      setCurrentExperimentID(experimentID); // Store current experiment ID
      setOpenDialog(true); // Open confirmation dialog
    } else {
      setIsContactSalesDialogOpen(true);
      handleMenuClose(event);
    }
  };
  function replaceEncodedSlashes(encodedStr) {
    return encodedStr.replace(/&#x2F;/g, "/");
  }
  const handleRetry = async (
    event,
    experimentId,
    userID,
    userName,
    runType,
    moduleName,
    createdAt,
    experimentName,
    filePath
  ) => {
    const decodedFilePath = replaceEncodedSlashes(filePath);
    const updatedFilePath = decodedFilePath.replace(
      /^(accounts\/)[^/]+/,
      `$1${currentCompany.companyName}_${currentCompany.companyID}`
    );
    event.stopPropagation();
    setCurrentExperimentID(experimentId); // Store current experiment ID
    const userInfo = { userID, userName };
    console.log("Current Company", currentCompany);
    console.log(
      "Retrying with parameteres: ",
      "clientName: ",
      currentCompany.companyName,
      "moduleName: ",
      moduleName,
      "experimentId: ",
      experimentId,
      "userInfo: ",
      userInfo,
      "runType: ",
      runType,
      "createdAt: ",
      createdAt,
      "experimentName: ",
      experimentName,
      "updatedFilePath: ",
      updatedFilePath
    );
    retryExecution({
      clientName: currentCompany.companyName,
      moduleName,
      experimentId,
      userInfo,
      currentCompany,
      runType,
      createdAt,
      experimentName,
      filePath: updatedFilePath,
    });
    // setOpenDialog(true); // Open confirmation dialog
  };

  const handleRename = async (event) => {
    event.stopPropagation();
    console.log("Rename experiment called");
    setIsEditing(true);
    setEditingExperimentID(currentRow.experimentID);
    setNewExperimentName(currentRow.experimentName);
    handleMenuClose(event);
  };

  const handleConfirmRename = async (experimentID, moduleName, updatedAt) => {
    await renameExperimentAndReload(
      experimentID,
      newExperimentName,
      moduleName,
      updatedAt
    );
    setIsEditing(false);
    setEditingExperimentID(null);
  };
  // Function to get styles based on experimentStatus
  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
      case "Running":
        return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
      case "Failed":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Terminated":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error

      // New cases added below
      case "Initiating...":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
      case "Executing":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
      case "Initiated":
        return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started, stable
      case "Terminating":
        return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
      case "On Hold":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state
      case "Queued":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state
      case "Retrying...":
        return { color: "#EA580C", backgroundColor: "#FFEDD5" }; // Orange: Retrying in progress
      case "Executed":
        return { color: "#1D4ED8", backgroundColor: "#DBEAFE" }; // Dark Blue: Intermediate status
      case "Launching...":
        return { color: "#0EA5E9", backgroundColor: "#E0F2FE" }; // Light Blue: Launching in progress

      // New case for DataProcessCompleted
      case "DataProcessCompleted":
        return { color: "#059669", backgroundColor: "#D1FAE5" }; // Teal Green: Intermediate completion

      // Default styles
      default:
        return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Neutral/unknown
    }
  };

  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }
    return dimension;
  };

  const handleRowClick = async ({
    experimentID,
    moduleName,
    run_date,
    experimentStatus,
    isProduction,
    isArchive,
    exp_description,
  }) => {
    if (oldFlowModules.includes(moduleName)) {
      setBYORConfigurations({});
      console.log("Row clicked:", experimentID);
      console.log("old?", oldFlowModules.includes(moduleName));
      setIsArchive(isArchive);
      setIsProduction(isProduction);
      setExperimentDescription(exp_description);
      await setCurrentDimension("all");
      await setCurrentValue("all");

      console.log(experimentID);
      console.log(moduleName);
      console.log(run_date);
      await setDashboardLoading(true);
      let exp_config;
      let priceColumn = "";
      let exp_tablesFilterData;
      let exp_byor_config;
      let exp_deleted_base_datasets;
      let exp_base_datasets;
      let exp_base_dataset_files;

      const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${experimentID}`;
      await setExperimentBasePath(Experiment_Base_Path);
      await executeParallelTasks([
        { fn: clearCache, args: [userInfo.userID, currentCompany.companyName] },
        {
          fn: loadExperimentConfigFromS3,
          args: [moduleName, experimentID, userInfo, currentCompany],
          output: "exp_config",
        },
        /*  {
        fn: navigate,
        args: [
          `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`,
        ],
      }, */
        { fn: setExperimentStatus, args: [experimentStatus] },
        { fn: setExperimentBasePath, args: [Experiment_Base_Path] },
        {
          fn: loadTablesFilterData,
          args: [
            `${Experiment_Base_Path}/custom_report/tablesFilterData.json`,
            userInfo.userID,
          ],
          output: "exp_tablesFilterData",
        },
        {
          fn: fetchJsonFromS3,
          args: [
            `${Experiment_Base_Path}/custom_report/BYORDataConfig.json`,
            userInfo.userID,
          ],
          output: "exp_byor_config",
        },

        {
          fn: fetchJsonFromS3,
          args: [
            `${Experiment_Base_Path}/custom_report/deletedBaseDatasets.json`,
            userInfo.userID,
          ],
          output: "exp_deleted_base_datasets",
        },

        {
          fn: listFilesInFolderEndpoint,
          args: [
            { folderPath: `${Experiment_Base_Path}/byor_base_datasets/` },
            userInfo.userID,
          ],
          output: "exp_base_dataset_files",
        },
      ]).then((results) => {
        exp_config = results.exp_config;
        priceColumn = exp_config.scenario_plan.pricing_constraints.price;
        exp_tablesFilterData = results.exp_tablesFilterData;
        exp_byor_config = results.exp_byor_config;
        exp_deleted_base_datasets = results.exp_deleted_base_datasets;
        exp_base_dataset_files = results.exp_base_dataset_files;
      });
      /* await clearCache(userInfo.userID, currentCompany.companyName); */
      /* const exp_config = await loadExperimentConfigFromS3(
      moduleName,
      experimentID,
      userInfo,
      currentCompany
    ); */
      navigate(
        `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`
      );
      /* await setExperimentStatus(experimentStatus); */

      //console.log("Experiment_Base_Path", Experiment_Base_Path);
      /* await setExperimentBasePath(Experiment_Base_Path); */
      /* const exp_tablesFilterData = await loadTablesFilterData(
      `${Experiment_Base_Path}/custom_report/tablesFilterData.json`,
      userInfo.userID
    ); */

      await syncExperimentConfigWithTablesFilter(
        exp_tablesFilterData,
        exp_config,
        Experiment_Base_Path
      );

      if (exp_deleted_base_datasets) {
        setDeletedBaseDatasets(exp_deleted_base_datasets);
      }

      if (
        Array.isArray(exp_base_dataset_files) &&
        exp_base_dataset_files.length > 0
      ) {
        const logFiles = exp_base_dataset_files.filter((file) =>
          file.Key.endsWith(".csv")
        );

        const datasetNames = logFiles.map((file) => {
          const parts = file.Key.split("/");
          return parts[parts.length - 2]; // Folder before output.csv
        });

        let finalDatasetList = datasetNames;
        if (exp_deleted_base_datasets) {
          finalDatasetList = datasetNames.filter(
            (name) => !exp_deleted_base_datasets?.includes(name)
          );
        }

        setBaseDatasets(finalDatasetList);
      }

      if (exp_byor_config) {
        setBYORConfigurations(exp_byor_config);
        console.log("BYOR");
      } else {
        await syncExperimentConfigWithBYOR(
          exp_byor_config,
          exp_config,
          Experiment_Base_Path
        );
      }
      if (currentFlow === "dashboard") {
        // await loadExecutiveViewData(
        //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`,
        //   {
        //     dimensionFilters: {
        //       feature: [currentDimension],
        //       value: [currentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );
        /*  await loadRawSalesData(
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
        hasParquetFiles
      ); */
        await executeParallelTasks([
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
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadElasticityDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
              hasParquetFiles,
              priceColumn,
            ],
          },
          {
            fn: loadInvPriceFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
          {
            fn: loadSupplyPlanFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/pp_dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
        ]);
        // await loadPriceMetricsData(
        //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/price_card_metrics.csv`,
        //   {
        //     dimensionFilters: {
        //       feature: [PriceCurrentDimension],
        //       value: [PriceCurrentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );
        // await loadDemandForecastingData(
        //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_distributed/all.csv`,
        //   {
        //     dimensionFilters: {
        //       feature: [currentDimension],
        //       value: [currentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   }
        // );
        // await setForecastingPivotData(
        //   `${Experiment_Base_Path}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
        //   {
        //     dimensionFilters: {
        //       [currentDimension]: [currentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );

        /* await loadDimensionFilterData(
        `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
        hasParquetFiles
      );
      await loadInvPriceFilterData(
        `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
        userInfo.userID
      ); */
        /*  if (
        moduleName !== "demand-planning" ||
        moduleName !== "pricing-promotion-optimization"
      ) {
        // await loadInventoryOptimizationData(
        //   `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
        //   exp_config,
        //   {
        //     dimensionFilters: {
        //       [convert(InvCurrentDimension)]: [InvCurrentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );
        // await loadInventoryMetricsData(
        //   `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/inventory_metrics.csv`,
        //   {
        //     dimensionFilters: {
        //       feature: [currentDimension],
        //       value: [currentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );
      } */

        // await loadPriceOptimizationData(
        //   `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`,
        //   exp_config,
        //   {
        //     dimensionFilters: {
        //       [convert(PriceCurrentDimension)]: [PriceCurrentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );
      } else if (
        currentFlow === "scenario" ||
        currentFlow === "optimizations"
      ) {
        await executeParallelTasks([
          {
            fn: clearCache,
            args: [userInfo.userID, currentCompany.companyName],
          },
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadElasticityDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
              hasParquetFiles,
              priceColumn,
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
          {
            fn: loadInvPriceFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
          {
            fn: loadSupplyPlanFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/pp_dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
          /* {
          fn: setForecastingPivotData,
          args: [
            `${Experiment_Base_Path}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
            {
              dimensionFilters: {
                [currentDimension]: [currentValue],
              },
              columnFilter: [],
              selectAllColumns: true,
            },
            userInfo.userID,
            hasParquetFiles,
          ],
        } , */
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadElasticityDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/scenario_plan/aggregated_elasticities.csv`,
              hasParquetFiles,
              priceColumn,
            ],
          },
        ]);
      }

      setDashboardLoading(false);
    } else {
      console.log("Row clicked:", experimentID);

      await setDashboardLoading(true);
      let exp_config;

      const Experiment_Base_Path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/data_bucket/${moduleName}/${run_date}/${experimentID}`;
      await setExperimentBasePath(Experiment_Base_Path);
      await executeParallelTasks([
        {
          fn: clearCache,
          args: [userInfo.userID, currentCompany.companyName],
        },
        {
          fn: loadExperimentConfigFromS3New,
          args: [moduleName, experimentID, userInfo, currentCompany],
          output: "exp_config",
        },
        /*  {
        fn: navigate,
        args: [
          `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`,
        ],
      }, */
        { fn: setExperimentStatusNew, args: [experimentStatus] },
        { fn: setExperimentBasePath, args: [Experiment_Base_Path] },
      ]).then((results) => {
        exp_config = results.exp_config;
      });

      navigate(
        `/${currentCompany.companyName}/${currentFlow}/view/${moduleName}/${experimentID}`
      );

      if (currentFlow === "dashboard") {
        /*  await executeParallelTasks([
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
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
          {
            fn: loadInvPriceFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
        ]); */
      } else if (
        currentFlow === "scenario" ||
        currentFlow === "optimizations"
      ) {
        /*   await executeParallelTasks([
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
          {
            fn: loadInvPriceFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/inventory_plan/dimension_value_metadata.json`,
              userInfo.userID,
            ],
          },
          {
            fn: loadDimensionFilterData,
            args: [
              `${Experiment_Base_Path}/scenario_planning/K_best/post_model_demand_pattern/post_model_df_address.csv`,
              hasParquetFiles,
            ],
          },
        ]); */
      }

      setDashboardLoading(false);
    }
  };

  const [retrying, setRetrying] = useState(false);
  function parseString(input) {
    try {
      // Try to parse the input as JSON
      const json = JSON.parse(input);

      // If successful and it's an object or array, return it
      if (typeof json === "object" && json !== null) {
        return json.status;
      }
    } catch (e) {
      // If JSON.parse throws an error, it means input is not valid JSON
      return input;
    }

    // If input is not valid JSON, return the original string
    return input;
  }
  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsNoInstanceAvailable(false);
  };

  if (filters === undefined) {
    return <>Loading...</>;
  }

  const isEven = (index) => index % 2 === 0;

  const getHoverStyles = (isHovered) => ({
    ...(isHovered && {
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
      transition: "all 0.3s ease-in-out",
      backgroundColor: "#F9F5FF",
      borderTop: "1px solid #D6BBFB",
      borderBottom: "1px solid #D6BBFB",
    }),
  });

  return (
    <Box flex={1}>
      {!experiments_list || experiments_list.length === 0 ? (
        retryCount < 3 ? (
          <Stack
            sx={{ width: "100%", padding: "16px", height: "100%" }}
            spacing={2}
          >
            <Stack spacing={1}>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <Stack key={rowIndex} direction="row" spacing={1}>
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <Skeleton
                      key={colIndex}
                      variant="text"
                      width="100%"
                      height="50px"
                    />
                  ))}
                </Stack>
              ))}
            </Stack>
          </Stack>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "50vh",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "18px",
                fontWeight: 600,
                lineHeight: "24px",
                color: "#344054",
              }}
            >
              No experiment available
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 400,
                color: "text.secondary",
                mb: 2,
              }}
            >
              Get started by creating your first experiment
            </Typography>
            <CustomButton
              onClick={handleNewExperimentOpen}
              title="New Experiment"
              CustomStartAdornment={<PlusIcon />}
            />
          </Box>
        )
      ) : (
        <Box flex={1}>
          <TableContainer component={Box} flex={1}>
            {filteredAppliedData.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "50vh",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "18px",
                    fontWeight: 600,
                    lineHeight: "24px",
                    color: "#344054",
                  }}
                >
                  {currentTable === "live"
                    ? "No Live Experiments Available"
                    : currentTable === "archive"
                    ? "No Archive Experiments Available"
                    : "No Experiments Available"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  {currentTable === "live"
                    ? "There are no live experiments present. Create a new experiment to get started."
                    : currentTable === "archive"
                    ? "There are no archived experiments present."
                    : "Get started by creating your first experiment"}
                </Typography>
                {currentTable === "live" && (
                  <CustomButton
                    onClick={handleNewExperimentOpen}
                    title="New Experiment"
                    CustomStartAdornment={<PlusIcon />}
                  />
                )}
              </Box>
            ) : (
              <Table
                sx={{
                  "& .MuiTableCell-root": {
                    padding: "16px",
                    alignContent: "center",
                    justifyContent: "center",
                  },
                }}
                aria-label="customized table"
              >
                <TableHead>
                  <TableRow>
                    <StyledTableCell
                      align="left"
                      sx={{
                        width: "25%",
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "10px",
                        textAlign: "left",
                        color: "#475467",
                        marginLeft: "12px",
                      }}
                    >
                      Project name
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      sx={{
                        width: "10%",
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "10px",
                        textAlign: "left",
                        color: "#475467",
                        marginLeft: "12px",
                      }}
                    >
                      Module name
                    </StyledTableCell>

                    <StyledTableCell
                      align="left"
                      sx={{
                        width: "10%",
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "10px",
                        textAlign: "left",
                        color: "#475467",
                        marginLeft: "12px",
                      }}
                    >
                      Created by
                    </StyledTableCell>
                    <StyledTableCell
                      align="left"
                      sx={{
                        width: "15%",
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "10px",
                        textAlign: "left",
                        color: "#475467",
                        marginLeft: "12px",
                      }}
                    >
                      Created at
                    </StyledTableCell>

                    <StyledTableCell
                      align="left"
                      sx={{
                        width: "15%",
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "10px",
                        textAlign: "left",
                        color: "#475467",
                        marginLeft: "12px",
                      }}
                    >
                      Updated at
                    </StyledTableCell>
                    <StyledTableCell
                      align="left"
                      sx={{
                        width: "5%",
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: 500,
                        lineHeight: "10px",
                        textAlign: "left",
                        color: "#475467",
                        marginLeft: "12px",
                      }}
                    >
                      Action
                    </StyledTableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.map((row, index) => (
                    <React.Fragment key={row.experimentID}>
                      <StyledTableRow
                        disabled={
                          parseString(row.experimentStatus) === "Initiating..."
                        }
                        onMouseEnter={() => handleRowHover(row.experimentID)}
                        onMouseLeave={handleRowLeave}
                        sx={{
                          ...getHoverStyles(hoveredRow === row.experimentID),
                          transition: "all 0.3s ease-in-out",
                        }}
                        onClick={() => {
                          if (
                            parseString(row.experimentStatus) ===
                            "Initiating..."
                          ) {
                            alert(
                              "Experiment is getting Initiated wait for sometime..."
                            );
                            return;
                          }
                          handleRowClick({
                            experimentID: row.experimentID,
                            moduleName: row.experimentModuleName,
                            run_date: formatYearMonth(row.createdAt),
                            experimentStatus: row.experimentStatus,
                            isProduction: row.isProduction,
                            isArchive: row.isArchive,
                            exp_description: row.exp_description,
                          });
                        }}
                      >
                        <StyledTableCell
                          component="th"
                          scope="row"
                          sx={{ width: "30%" }}
                        >
                          <Stack
                            direction={"row"}
                            spacing={2}
                            alignItems={"center"}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: row.isProduction
                                  ? "2px solid #027A48"
                                  : "1px solid #D0D5DD",
                                borderRadius: "50%",

                                backgroundColor: row.isProduction
                                  ? "#ECFDF3"
                                  : "transparent",
                              }}
                            >
                              <File
                                style={{
                                  fill: row.isProduction ? "#ECFDF3" : "",
                                }}
                              />
                            </Box>

                            <Stack spacing={0.1}>
                              <Typography
                                sx={{
                                  fontFamily: "Inter",
                                  fontSize: "14px",
                                  fontWeight: 500,
                                  lineHeight: "18px",
                                  textAlign: "left",
                                  color: theme.palette.text.modalHeading,
                                }}
                              >
                                {isEditing &&
                                editingExperimentID === row.experimentID ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Input
                                      value={newExperimentName}
                                      onChange={(e) =>
                                        setNewExperimentName(e.target.value)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      sx={{
                                        fontFamily: "Inter",
                                        fontSize: "14px",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: "1px solid #D0D5DD",
                                        width: "240px",
                                      }}
                                      inputProps={{
                                        style: {
                                          fontFamily: "Inter",
                                          fontSize: "14px",
                                        },
                                      }}
                                    />
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleConfirmRename(
                                            row.experimentID,
                                            row.experimentModuleName,
                                            Date.now()
                                          );
                                        }}
                                        sx={{
                                          bgcolor: "#F9F5FF",
                                          color: "#7F56D9",
                                          "&:hover": { bgcolor: "#F4EBFF" },
                                        }}
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M5 12L10 17L20 7"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsEditing(false);
                                          setEditingExperimentID(null);
                                          setNewExperimentName("");
                                        }}
                                        sx={{
                                          bgcolor: "#FEE4E2",
                                          color: "#D92D20",
                                          "&:hover": { bgcolor: "#FECDCA" },
                                        }}
                                      >
                                        <svg
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M18 6L6 18M6 6L18 18"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </IconButton>
                                    </Box>
                                  </Box>
                                ) : (
                                  row.experimentName
                                )}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: "Inter",
                                  fontSize: "12px",
                                  fontWeight: 400,
                                  lineHeight: "20px",
                                  color: "#475467",
                                  textAlign: "left",
                                }}
                              >
                                {row.experimentID}
                              </Typography>

                              <CustomTooltip
                                title={row.exp_description}
                                arrow
                                maxwidth="420px"
                              >
                                <Typography
                                  sx={{
                                    fontFamily: "Inter",
                                    fontSize: "12px",
                                    fontWeight: 400,
                                    lineHeight: "18px",
                                    color: "#667085",
                                    textAlign: "left",
                                    maxWidth: "220px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    cursor: "pointer",
                                  }}
                                >
                                  {row.exp_description}
                                </Typography>
                              </CustomTooltip>
                            </Stack>
                          </Stack>
                        </StyledTableCell>
                        <StyledTableCell
                          align="left"
                          sx={{
                            width: "10%",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "20px",
                            color: "#475467",
                            textAlign: "left",
                          }}
                        >
                          {/* {row.experimentModuleName} */}
                          <Chip
                            label={row.experimentModuleName}
                            size="small"
                            sx={{
                              fontFamily: "Inter",
                              fontSize: "12px",
                              fontWeight: 500,
                              lineHeight: "18px",
                              textAlign: "initial",
                              color: "#027A48",
                              backgroundColor: "#ECFDF3",
                            }}
                          />
                        </StyledTableCell>

                        <StyledTableCell
                          align="left"
                          sx={{
                            width: "10%",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "20px",
                            color: "#475467",
                            textAlign: "left",
                          }}
                        >
                          {row.createdBy}
                        </StyledTableCell>
                        <StyledTableCell
                          align="left"
                          sx={{
                            width: "15%",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "20px",
                            color: "#475467",
                            textAlign: "left",
                          }}
                        >
                          {row.createdAt}
                        </StyledTableCell>
                        <StyledTableCell
                          align="left"
                          sx={{
                            width: "15%",
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "20px",
                            color: "#475467",
                            textAlign: "left",
                          }}
                        >
                          {row.updatedAt}
                        </StyledTableCell>
                        <StyledTableCell align="left" sx={{ width: "5%" }}>
                          <Stack
                            direction={"row"}
                            alignItems={"center"}
                            justifyContent={"space-around"}
                          >
                            <Chip
                              label={parseString(row.experimentStatus)}
                              size="small"
                              sx={{
                                fontFamily: "Inter",
                                fontSize: "12px",
                                fontWeight: 500,
                                lineHeight: "18px",
                                textAlign: "initial",
                                ...getStatusStyles(
                                  parseString(row.experimentStatus)
                                ),
                              }}
                            />
                            <IconButton
                              aria-label="expand"
                              onClick={(e) =>
                                handleRowExpand(row.experimentID, e)
                              }
                              sx={{
                                color:
                                  parseString(row.experimentStatus) ===
                                  "Completed"
                                    ? "#0C66E4"
                                    : "transparent",
                                visibility:
                                  parseString(row.experimentStatus) ===
                                  "Completed"
                                    ? "visible"
                                    : "hidden",
                              }}
                            >
                              {expandedRow !== row.experimentID ? (
                                <ExpandMoreIcon />
                              ) : (
                                <ExpandLessIcon />
                              )}
                            </IconButton>
                            <IconButton
                              aria-label="more"
                              aria-controls={`menu-${row.experimentID}`}
                              aria-haspopup="true"
                              onClick={(e) => {
                                console.log("1");
                                e.stopPropagation();
                                handleMenuClick(e, row);
                              }}
                            >
                              <MoreVertRounded
                                sx={{ fontSize: "16px", padding: "2px" }}
                              />
                            </IconButton>
                            <Menu
                              id={`menu-${row.experimentID}`}
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl && currentRow === row)}
                              onClose={(e) => handleMenuClose(e)}
                            >
                              {(parseString(row.experimentStatus) ===
                                "Completed" ||
                                parseString(row.experimentStatus) ===
                                  "Terminated" ||
                                parseString(row.experimentStatus) ===
                                  "Failed") && (
                                <MenuItem
                                  onClick={(e) => {
                                    handleDelete(e, row.experimentID); // Pass the experiment ID
                                  }}
                                >
                                  Move to Trash
                                </MenuItem>
                              )}
                              {parseString(row.experimentStatus) ===
                                "Failed" && (
                                //uncomment below line to comment the task manager
                                //|| parseString(row.experimentStatus) ==="On Hold"
                                <MenuItem
                                  disabled={retrying}
                                  onClick={async (e) => {
                                    if (retrying) return; // Prevent multiple clicks
                                    setRetrying(true);
                                    handleMenuClose(e); // Set loading to true
                                    try {
                                      await handleRetry(
                                        e,
                                        row.experimentID,
                                        row.userID,
                                        row.createdBy,
                                        row.experimentRunType,
                                        row.experimentModuleName,
                                        row.createdAt,
                                        row.experimentName,
                                        row.experimentPath
                                      );
                                    } catch (error) {
                                      console.error("Retry failed:", error);
                                    } finally {
                                      setRetrying(false); // Reset loading state
                                    }
                                  }}
                                >
                                  {retrying ? "Retrying" : "Retry"}
                                </MenuItem>
                              )}
                              <MenuItem
                                onClick={(e) => {
                                  console.log("4");
                                  handleRename(e);
                                }}
                              >
                                Rename
                              </MenuItem>

                              {/* Add Production toggle */}
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  isArchiveAndProductionAndReload(
                                    row.experimentID,
                                    "isProduction",
                                    !row.isProduction
                                  );
                                  handleMenuClose(e);
                                }}
                              >
                                {row.isProduction
                                  ? "Remove from Production"
                                  : "Move to Production"}
                              </MenuItem>

                              {/* Add Archive toggle */}
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  isArchiveAndProductionAndReload(
                                    row.experimentID,
                                    "isArchive",
                                    !row.isArchive
                                  );
                                  handleMenuClose(e);
                                }}
                              >
                                {row.isArchive
                                  ? "Remove from Archive"
                                  : "Move to Archive"}
                              </MenuItem>

                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentExperimentForDescription(row);
                                  setDescriptionDialogOpen(true);
                                  handleMenuClose(e);
                                }}
                              >
                                {row.exp_description
                                  ? "Edit Description"
                                  : "Add Description"}
                              </MenuItem>
                            </Menu>
                          </Stack>
                        </StyledTableCell>
                      </StyledTableRow>
                      <TableRow
                        onMouseEnter={() => handleRowHover(row.experimentID)}
                        onMouseLeave={handleRowLeave}
                        sx={{
                          backgroundColor: isEven(index)
                            ? "#F9FAFB"
                            : theme.palette.background.default,
                          cursor: "pointer",
                          ...getHoverStyles(hoveredRow === row.experimentID),
                          transition: "all 0.3s ease-in-out",
                        }}
                      >
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={6}
                        >
                          <Collapse
                            in={expandedRow === row.experimentID}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                padding: "16px",
                              }}
                            >
                              {/* Only render ViewMetrics when this specific row is expanded */}
                              {expandedRow === row.experimentID && (
                                <>
                                  <ViewMetrics
                                    experimentID={row.experimentID}
                                    moduleName={row.experimentModuleName}
                                    run_date={formatYearMonth(row.createdAt)}
                                  />
                                </>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            open={openDialog}
            handleClose={() => setOpenDialog(false)} // Close dialog
            handleConfirm={handleConfirmDelete} // Handle confirmation
            WarningText="Are you sure you want to move this experiment into the trash?"
            ResultText="You will be able to resotre this experiments from trash withing 30 days."
            ConfirmButtonTitle="Move to trash"
          />

          <ContactSalesDialog
            open={isNoInstanceAvailable}
            handleClose={() => setIsNoInstanceAvailable(false)} // Close dialog
            handleConfirm={handleContactSales} // Handle confirmation
            WarningText="All our machines are currently busy."
            ResultText="Please try again after some time, or contact sales to upgrade to a premium plan for higher priority access."
            ConfirmButtonTitle="Contact Sales"
          />

          <ContactSalesDialog
            open={isContactSalesDialogOpen}
            handleClose={() => setIsContactSalesDialogOpen(false)}
            handleConfirm={handleContactSales}
            WarningText="Upgrade Your Subscription"
            ResultText="Upgrade your subscription or contact sales for more access."
            ConfirmButtonTitle="Contact Sales"
          />

          <Pagination
            count={Math.ceil(filteredAppliedData.length / RecordsPerPage)}
            page={page}
            onChange={handleChangePage}
            renderItem={(item) => (
              <CustomPaginationItem
                {...item}
                isPrev={item.type === "previous"}
                isNext={item.type === "next"}
                isPrevOrNext={item.type === "previous" || item.type === "next"}
              />
            )}
            sx={{
              padding: "24px",
              justifyContent: "flex-end",
              display: "flex",
            }}
          />
        </Box>
      )}

      <SupplyORAutoMLDialog
        open={newExperimentOpen}
        handleClose={handleNewExperimentClose}
      />
      <DescriptionDialog
        open={descriptionDialogOpen}
        onClose={() => {
          setDescriptionDialogOpen(false);
          setCurrentExperimentForDescription(null);
        }}
        experiment={currentExperimentForDescription}
      />
    </Box>
  );
}
