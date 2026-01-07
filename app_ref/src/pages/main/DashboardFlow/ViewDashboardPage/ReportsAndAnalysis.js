import {
  Box,
  Stack,
  Tab,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import useDashboard from "../../../../hooks/useDashboard";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { ThemeContext } from "../../../../theme/config/ThemeContext";
import LoadingScreen from "../../../../components/LoadingScreen";
import ReportTable from "./ReportTable";
import CustomTable from "../../../../components/TanStackCustomTable"; // Import your CustomTable component
import CustomTooltip from "../../../../components/CustomToolTip"; // Import CustomTooltip

import DataFetchingDialog from "../../../../components/DataFetchingDialog";
import CustomButton from "../../../../components/CustomButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { uploadJsonToS3 } from "../../../../utils/s3Utils";
import { store } from "../../../../redux/store";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import { listFilesInFolderEndpoint } from "../../../../utils/s3UtillsEndpoints";
import useAuth from "../../../../hooks/useAuth";
import useConfig from "../../../../hooks/useConfig";

const ReportsAndAnalysis = () => {
  const {
    BYORConfig,

    reports,
    reportsTab,
    setReportsTab,
    subReportsTab,
    setSubReportsTab,
    dashboardLoading,
    BYORData,
    setBYORData,
    loadBYORConfig,
    deleteBYORConfig,
    experimentBasePath,
  } = useDashboard();

  const {
    deleteBaseDataset,
    deletedBaseDatasets,
    addBaseDataset,
    baseDatasets,
    setBaseDatasets,
  } = useConfig();

  const { userInfo } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dataOpen, setDataOpen] = React.useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [baseDataFetchToggle, setBaseDataFetchToggle] = useState(false);

  // State for viewing base datasets
  const [showBaseDatasets, setShowBaseDatasets] = useState(false);

  // State for base datasets

  // State for base dataset deletion
  const [baseDatasetToDelete, setBaseDatasetToDelete] = useState(null);

  const handleOpenDialog = () => {
    setDataOpen(true);
  };

  const handleCloseDialog = () => {
    setDataOpen(false);
  };

  // Handle opening delete confirmation dialog for custom reports
  const handleOpenDeleteDialog = (reportTitle, e) => {
    e.stopPropagation(); // Prevent tab change when clicking delete
    setReportToDelete(reportTitle);
    setDeleteDialogOpen(true);
  };

  // Handle opening delete confirmation dialog for base datasets
  const handleOpenBaseDatasetDeleteDialog = (datasetName, e) => {
    e.stopPropagation(); // Prevent tab change when clicking delete
    setBaseDatasetToDelete(datasetName);
    setDeleteDialogOpen(true);
  };

  // Handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
    setBaseDatasetToDelete(null);
  };

  // Handle base datasets view toggle
  const handleViewBaseDatasets = () => {
    setShowBaseDatasets(!showBaseDatasets);
    setSubReportsTab("1"); // Reset to first tab when switching
  };

  useEffect(() => {
    const folderPath = `${experimentBasePath}/byor_base_datasets/`;

    const fetchBYORDatastes = async () => {
      const payload = { folderPath };
      const files = await listFilesInFolderEndpoint(payload, userInfo.userID);

      // Filter only CSV files
      const logFiles = files.filter((file) => file.Key.endsWith(".csv"));

      // Extract folder names right before output.csv
      const datasetNames = logFiles.map((file) => {
        const parts = file.Key.split("/");
        return parts[parts.length - 2]; // the folder just before "output.csv"
      });

      const finalDatasetList = datasetNames.filter(
        (name) => !deletedBaseDatasets?.includes(name)
      );

      setBaseDatasets(finalDatasetList);
    };
    if (baseDatasets.length === 0) {
      fetchBYORDatastes();
    }
  }, []);

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    // Handle base dataset deletion
    if (baseDatasetToDelete) {
      try {
        // Add the dataset to deleted base datasets
        deleteBaseDataset(baseDatasetToDelete);
        const updatedBaseDatasets =
          store.getState().config?.config?.deleted_base_datasets;
        await uploadJsonToS3(
          `${experimentBasePath}/custom_report/deletedBaseDatasets.json`,
          updatedBaseDatasets
        );

        // If we're deleting the currently selected base dataset, select the first available one
        const remainingDatasets = baseDatasets
        if (
          remainingDatasets.length > 0 &&
          subReportsTab ===
            (baseDatasets.indexOf(baseDatasetToDelete) + 1).toString()
        ) {
          setSubReportsTab("1");
        }
      } catch (error) {
        console.error("Error deleting base dataset:", error);
      }

      // Close the dialog after deletion
      handleCloseDeleteDialog();
      return;
    }

    // Handle custom report deletion
    if (reportToDelete) {
      try {
        // Dispatch delete action to update redux store
        deleteBYORConfig(reportToDelete);

        // Get updated config after deletion
        const updatedBYORConfig = store.getState().dashboard.BYORConfig;

        // Upload updated config to S3
        await uploadJsonToS3(
          `${experimentBasePath}/custom_report/BYORDataConfig.json`,
          updatedBYORConfig
        );

        // If we're deleting the currently selected report, select the first available report
        if (subReportsTab === "1") {
          const remainingReports = Object.keys(updatedBYORConfig || {});
          if (remainingReports.length > 0) {
            setSubReportsTab("1");
          }
        }
      } catch (error) {
        console.error("Error deleting report:", error);
      }

      // Close the dialog after deletion
      handleCloseDeleteDialog();
    }
  };

  // Handle loading state based on the dashboardLoading value
  useEffect(() => {
    setLoading(dashboardLoading || !reports); // Ensure loading is true when reports are not yet available
  }, [dashboardLoading, reports]);

  const handleChange = (event, newValue) => {
    setReportsTab(newValue);
  };

  const handleSubChange = (event, newValue) => {
    setSubReportsTab(newValue);
  };

  const { theme } = useContext(ThemeContext);

  if (loading) {
    return <LoadingScreen />;
  }

  // Format BYORConfig to match the structure of other reports
  const customReports = Object.keys(BYORConfig || {}).map((configKey) => {
    const config = BYORConfig[configKey];
    return {
      title: configKey,
      data: null, // This indicates that we'll use ReportTable to handle the data
      config: config, // Store the original config for use in ReportTable
      filePath: config.filePath,
    };
  });

  // Format base datasets
  const baseDatasetReports = baseDatasets.map((datasetName) => ({
    title: datasetName,
    datasetPath: `${experimentBasePath}/byor_base_datasets/${datasetName}/output.csv`,
  }));

  const baseDatasetReports2 = baseDatasets.map((datasetName) => ({
    title: datasetName,
    datasetPath: `byor_base_datasets/${datasetName}/output.csv`,
  }));

  // Add custom tab to the reports object with BYORConfig data
  const reportsWithCustom = {
    ...reports,
    custom: {
      title: "Custom",
      reports: showBaseDatasets ? baseDatasetReports : customReports,
    },
  };

  return (
    <Box fullwidth sx={{ width: "100%" }}>
      <TabContext value={reportsTab}>
        <Box padding="12px 16px 12px 16px">
          <TabList
            onChange={handleChange}
            aria-label="create experiment tablist"
          >
            {Object.keys(reportsWithCustom).map((reportGroup, index) => (
              <Tab
                key={reportGroup}
                label={reportsWithCustom[reportGroup].title}
                value={(index + 1).toString()}
                sx={{
                  color: "#667085",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "left",
                  textTransform: "none",
                  "&.Mui-selected": {
                    color: theme.palette.button.textOnHover,
                    borderBottom: "2px solid #0C66E4",
                  },
                }}
              />
            ))}
          </TabList>
        </Box>

        {Object.keys(reportsWithCustom).map((reportGroup, index) => {
          const hasData =
            reportsWithCustom[reportGroup].reports &&
            reportsWithCustom[reportGroup].reports.length > 0;

          // Determine if this is the custom tab
          const isCustomTab = reportGroup === "custom";

          return (
            <TabPanel
              key={reportGroup}
              value={(index + 1).toString()}
              sx={{ padding: "0px 16px", marginX: "-16px" }}
            >
              {/* Show buttons for custom tab */}
              {isCustomTab && (
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* Show fetch/create button only when viewing custom reports */}
                  {!showBaseDatasets && (
                    <CustomButton
                      onClick={handleOpenDialog}
                      title={"Create New Report"}
                    />
                  )}

                  <CustomButton
                    onClick={handleViewBaseDatasets}
                    title={
                      showBaseDatasets
                        ? "View Custom Reports"
                        : "View Base Datasets"
                    }
                    variant="outlined"
                  />
                </Box>
              )}

              {/* Show CreateReportButton for custom tab when no data and it's not already shown above */}
              {isCustomTab && !hasData && (
                <Box sx={{ display: "none" }}>
                  {" "}
                  {/* Hidden as button is now in toggle section */}
                </Box>
              )}

              <Box
                fullwidth
                sx={{
                  display: "flex",
                  width: "100%",
                  gap: "16px",
                }}
              >
                {hasData ? (
                  <TabContext value={subReportsTab}>
                    <Box
                      sx={{
                        borderRight: 1,
                        borderColor: "divider",
                        minWidth: "200px",
                        flexShrink: 0,
                      }}
                    >
                      <TabList
                        orientation="vertical"
                        onChange={handleSubChange}
                        aria-label="reports and analysis tablist"
                        sx={{ alignItems: "flex-start" }}
                      >
                        {reportsWithCustom[reportGroup].reports.map(
                          (report, subIndex) => (
                            <Tab
                              key={subIndex}
                              label={
                                isCustomTab ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      width: "100%",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <CustomTooltip
                                      arrow
                                      title={
                                        <Typography>{report.title}</Typography>
                                      }
                                    >
                                      <Typography
                                        sx={{
                                          fontSize: "14px",
                                          fontWeight: 600,
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          maxWidth: "150px",
                                        }}
                                      >
                                        {report.title}
                                      </Typography>
                                    </CustomTooltip>
                                    <DeleteIcon
                                      sx={{
                                        fontSize: "18px",
                                        ml: 1,
                                        color: "#667085",
                                        "&:hover": { color: "error.main" },
                                        cursor: "pointer",
                                      }}
                                      onClick={(e) =>
                                        showBaseDatasets
                                          ? handleOpenBaseDatasetDeleteDialog(
                                              report.title,
                                              e
                                            )
                                          : handleOpenDeleteDialog(
                                              report.title,
                                              e
                                            )
                                      }
                                    />
                                  </Box>
                                ) : (
                                  report.title
                                )
                              }
                              value={(subIndex + 1).toString()}
                              sx={{
                                color: "#667085",
                                fontFamily: "Inter",
                                fontSize: "14px",
                                fontWeight: 600,
                                lineHeight: "20px",
                                textAlign: "left",
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%",
                                "&.Mui-selected": {
                                  color: theme.palette.button.textOnHover,
                                  borderRight: "2px solid #0C66E4",
                                },
                              }}
                            />
                          )
                        )}
                      </TabList>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowX: "auto" }}>
                      {reportsWithCustom[reportGroup].reports.map(
                        (report, subIndex) => (
                          <TabPanel
                            key={report.title}
                            value={(subIndex + 1).toString()}
                            sx={{
                              padding: "0px",
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            {/* Render CustomTable for base datasets, ReportTable for custom reports */}
                            {isCustomTab && showBaseDatasets ? (
                              <CustomTable
                                title={report.title}
                                datasetPath={report.datasetPath}
                                isBaseData={true}
                              />
                            ) : (
                              <ReportTable
                                reports={reportsWithCustom}
                                reportGroup={reportGroup}
                                index={subIndex}
                                isCustomReport={reportGroup === "custom"}
                                byorConfig={
                                  reportGroup === "custom"
                                    ? report.config
                                    : null
                                }
                              />
                            )}
                          </TabPanel>
                        )
                      )}
                    </Box>
                  </TabContext>
                ) : (
                  <Stack sx={{ width: "100%", padding: "16px" }}>
                    <Typography
                      sx={{
                        color: "#667085",
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "20px",
                        textAlign: "center",
                      }}
                    >
                      {isCustomTab
                        ? !showBaseDatasets
                          ? "No custom reports available. Create one to get started."
                          : "No base datasets available."
                        : "No data available"}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </TabPanel>
          );
        })}
      </TabContext>

      {/* Data Fetching Dialog */}
      <DataFetchingDialog
        open={dataOpen}
        handleClose={handleCloseDialog}
        baseDatasets={baseDatasets}
        baseDataFetchToggle={() => setBaseDataFetchToggle(!baseDataFetchToggle)}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        handleClose={() => setDeleteDialogOpen(false)}
        handleConfirm={handleConfirmDelete} // Pass the row to delete
        WarningText="Confirm Delete"
        ResultText={`Are you sure you want to delete the ${
          baseDatasetToDelete ? "base dataset" : "report"
        } ${baseDatasetToDelete || reportToDelete}? `}
        ConfirmButtonTitle="Delete"
      />
    </Box>
  );
};

export default ReportsAndAnalysis;
