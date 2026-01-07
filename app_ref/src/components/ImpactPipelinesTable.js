import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  PaginationItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  DeleteRounded,
  MoreVertRounded,
  PlayArrowRounded,
} from "@mui/icons-material";
import { ReactComponent as File } from "../assets/Icons/file_Icon.svg";
import { ThemeContext } from "../theme/config/ThemeContext";
import { useNavigate } from "react-router-dom";
import useDashboard from "../hooks/useDashboard";
import useExperiment from "../hooks/useExperiment";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import { useEffect } from "react";
import { loadReports } from "../redux/actions/dashboardActions";
import { clearCache } from "../utils/s3Utils";
import ConfirmationDialog from "./ConfirmationDialog";
import useConfig from "../hooks/useConfig";
import ContactSalesDialog from "./ContactSalesDialog";
import { setIsContactSalesDialogOpen } from "../redux/slices/authSlice";
import { useRef } from "react";
import useImpact from "../hooks/useImpact";
import { runImpactPipeline } from "../utils/runImpactPipeline";
import { ERROR } from "../theme/custmizations/colors";

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
function formatYearMonth(dateString) {
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

export default function ImpactPipelinesTable({ currentFlow }) {
  const { theme } = React.useContext(ThemeContext);
  const navigate = useNavigate();

  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();
  const { isNoInstanceAvailable, setIsNoInstanceAvailable, retryExecution } =
    useConfig();

  const {
    impact_pipelines_list,
    loadImpactPipelines,
    deleteTheImpactPipeline,
    setImpactPipeline,
    setImpactPipelineLoading,
    loadMetricsAnalysisGraphMetrics,
  } = useImpact();

  const [data, setData] = useState(
    impact_pipelines_list ? impact_pipelines_list : null
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     loadExperiementsList(userInfo);
  //   }, 5000); // Polling every 5 seconds

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    setData();
    setFilterData(impact_pipelines_list?.filter((row) => !row.inTrash));
  }, [impact_pipelines_list]);
  // Ref to track if the reload condition is met
  const isReloading = useRef(false);

  // useEffect(() => {
  //   // Function to check if any experiment's status matches the condition
  //   const shouldReload = () => {
  //     return impact_pipelines_list.some(
  //       (impactPipeline) =>
  //         !["Failed", "Completed", "Terminated", "On Hold"].includes(
  //           parseString(impactPipeline.impactPipelineStatus)
  //         )
  //     );
  //   };

  //   // Function to handle loading the experiments list
  //   const loadIfNeeded = () => {
  //     if (shouldReload() && !isReloading.current) {
  //       isReloading.current = true; // Set reloading flag to true
  //       loadImpactPipelines(userInfo);
  //       // Reset the flag after loading is completed
  //       setTimeout(() => {
  //         isReloading.current = false;
  //       }, 10000); // Prevent overlapping calls
  //     }
  //   };

  //   // Call loadIfNeeded once immediately
  //   loadIfNeeded();

  //   // Set up an interval to call the function every 30 seconds
  //   const interval = setInterval(loadIfNeeded, 10000);

  //   // Call it once immediately in case the condition is already met
  //   loadIfNeeded();

  //   // Cleanup the interval when the component unmounts
  //   return () => clearInterval(interval);
  // }, [userInfo, loadImpactPipelines]);

  // Filter out experiments that are in trash
  const [filteredData, setFilterData] = useState(
    data?.filter((row) => !row.inTrash)
  );

  console.log("currentFlow: " + currentFlow);
  console.log("filterData: " + filteredData);

  const [page, setPage] = useState(1);

  const RecordsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = filteredData.slice(
    (page - 1) * RecordsPerPage,
    page * RecordsPerPage
  );
  const [openDialog, setOpenDialog] = useState(false); // State for confirmation dialog
  const [currentImpactPipelineID, setCurrentImpactPipelineID] = useState(null); // State to store current experiment ID for deletion

  // Function to handle confirmation dialog
  const handleConfirmDelete = async () => {
    if (currentImpactPipelineID) {
      const payload = {
        impactPipelineID: currentImpactPipelineID,
        updatedAt: Date.now(),
        time: Date.now(),
      };

      const response = await deleteTheImpactPipeline(
        currentCompany,
        userInfo,
        payload
      );
      console.log("Deleting experiment:", currentImpactPipelineID, response);
      loadImpactPipelines(userInfo);
      setOpenDialog(false); // Close the dialog after deletion
    }
  };

  const handleDelete = async (event, impactPipelineID) => {
    event.stopPropagation();
    setCurrentImpactPipelineID(impactPipelineID); // Store current experiment ID
    setOpenDialog(true); // Open confirmation dialog
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
      case "Created":
        return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started, stable
      case "Terminating":
        return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
      case "On Hold":
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

  const handleRowClick = async ({ impactPipeline }) => {
    console.log("Row clicked:", impactPipeline.impactPipelineID);
    await clearCache(userInfo.userID, currentCompany.companyName);
    await setImpactPipeline(impactPipeline);
    await setImpactPipelineLoading(true);
    await loadMetricsAnalysisGraphMetrics(
      impactPipeline.impactPipelineID,
      impactPipeline.impactPipelineName
    );

    navigate(
      `/${currentCompany.companyName}/impact-analysis/view/${impactPipeline.impactPipelineID}`
    );
    await setImpactPipelineLoading(false);
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

  const [runningStatus, setRunningStatus] = useState(
    filteredData.reduce((acc, pipeline) => {
      acc[pipeline.impactPipelineID] = false;
      return acc;
    }, {})
  );

  const handleRunImpactPipeline = async (e, impactPipelineID) => {
    e.stopPropagation();
    setRunningStatus((prev) => ({
      ...prev,
      [impactPipelineID]: true,
    }));
    console.log("Running impact pipeline:", impactPipelineID);
    await runImpactPipeline(impactPipelineID, userInfo.userID);
    await loadImpactPipelines(userInfo);
    setRunningStatus((prev) => ({
      ...prev,
      [impactPipelineID]: false,
    }));
  };
  return (
    <Box flex={1}>
      {!impact_pipelines_list || filteredData.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            height: "50vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "20px",
              color: "#475467",
              textAlign: "center",
            }}
          >
            No Impact Pipeline available
          </Typography>
        </Box>
      ) : (
        <Box flex={1}>
          <TableContainer component={Box} flex={1}>
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
                      width: "20%",
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "10px",
                      textAlign: "left",
                      color: "#475467",
                      marginLeft: "12px",
                    }}
                  >
                    Pipeline name
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
                    Tag
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
                    Status
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData.map((row) => (
                  <StyledTableRow
                    key={row.impactPipelineID}
                    disabled={
                      parseString(row.impactPipelineStatus) === "Created"
                    }
                    onClick={() => {
                      if (parseString(row.impactPipelineStatus) === "Created") {
                        alert("Run Pipeline to see the results");
                        return;
                      }
                      handleRowClick({
                        impactPipeline: row,
                      });
                    }}
                  >
                    <StyledTableCell
                      component="th"
                      scope="row"
                      sx={{ width: "20%" }}
                    >
                      <Stack
                        direction={"row"}
                        spacing={2}
                        alignItems={"center"}
                      >
                        <File />

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
                            {row.impactPipelineName}
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
                            {row.impactPipelineID}
                          </Typography>
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
                        label={row.impactPipelineTag}
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
                        sx={{ width: "100%" }}
                      >
                        <Box sx={{ flex: 1 }} marginRight={"10px"}>
                          <Chip
                            // display={"flex"}
                            // flex="1"
                            label={parseString(row.impactPipelineStatus)}
                            size="small"
                            sx={{
                              fontFamily: "Inter",
                              fontSize: "12px",
                              fontWeight: 500,
                              lineHeight: "18px",
                              textAlign: "initial",
                              // width: '100%',
                              ...getStatusStyles(
                                parseString(row.impactPipelineStatus)
                              ),
                            }}
                          />
                        </Box>
                        <Stack
                          direction={"row"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                          sx={{ flex: 1 }}
                        >
                          <Box sx={{ position: "relative" }}>
                            <IconButton
                              sx={{
                                backgroundColor: "#EFF4FF",
                                padding: "0px",
                                "&:hover": {
                                  backgroundColor: "#D1E0FF",
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRunImpactPipeline(
                                  e,
                                  row.impactPipelineID
                                );
                              }}
                            >
                              <PlayArrowRounded
                                sx={{
                                  fontSize: "30px",
                                  padding: "0px",
                                  color: "#0B58F5",
                                  borderRadius: "50%",
                                  "&:hover": {
                                    color: "#0644C2",
                                  },
                                }}
                              />
                            </IconButton>
                            {runningStatus[row.impactPipelineID] && (
                              <CircularProgress
                                size={36}
                                sx={{
                                  position: "absolute",
                                  top: -3,
                                  left: -3,
                                  zIndex: 1,
                                }}
                              />
                            )}
                          </Box>
                          <IconButton
                            sx={{
                              backgroundColor: "transparent",
                              padding: "0px",
                              "&:hover": {
                                backgroundColor: "transparent",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(e, row.impactPipelineID);
                            }}
                          >
                            <DeleteRounded
                              sx={{
                                fontSize: "24px",
                                padding: "1px",
                                color: ERROR[600],
                                borderRadius: "50%",
                                "&:hover": {
                                  color: ERROR[700],
                                },
                              }}
                            />
                          </IconButton>
                        </Stack>

                        {/* <IconButton
                          aria-label="more"
                          aria-controls={`menu-${row.impactPipelineID}`}
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
                          id={`menu-${row.impactPipelineID}`}
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl && currentRow === row)}
                          onClose={(e) => handleMenuClose(e)}
                        >
                          {(parseString(row.impactPipelineStatus) ===
                            "Completed" ||
                            parseString(row.impactPipelineStatus) ===
                              "Terminated" ||
                            parseString(row.impactPipelineStatus) ===
                              "Failed" ||
                            parseString(row.impactPipelineStatus) ===
                              "Created") && (
                            <MenuItem
                              onClick={(e) => {
                                handleDelete(e, row.impactPipelineID); // Pass the experiment ID
                              }}
                            >
                              Move to Trash
                            </MenuItem>
                          )}
                        </Menu> */}
                      </Stack>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            open={openDialog}
            handleClose={() => setOpenDialog(false)} // Close dialog
            handleConfirm={handleConfirmDelete} // Handle confirmation
            WarningText="Are you sure you want to move this impact pipeline into the trash?"
            ResultText="You will be able to resotre this impact pipeline from trash withing 30 days."
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
            count={Math.ceil(filteredData.length / RecordsPerPage)}
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
    </Box>
  );
}
