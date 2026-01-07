"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Pagination,
  PaginationItem,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Search, SearchIconWrapper, StyledInputBase } from "./Search";
import { ReactComponent as SearchIcon } from "../assets/Icons/search.svg";
import { ThemeContext } from "../theme/config/ThemeContext";
import ViewDataset from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/NewViewDataset";
import CustomButton from "./CustomButton";
import useExperiment from "./../hooks/useExperiment";
import NewTagFieldReview from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/NewTagFieldReview";
import NewTagFieldReviewModule from "../pages/main/ExperimentFlow/CreateConfigurableExperimentPage/AddData/NewTagFieldReview";
import useDataset from "../hooks/useDataset";
import useAuth from "../hooks/useAuth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useLocation } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { uploadJsonToS3, uploadTxtToS3 } from "../utils/s3Utils";
import ConfirmationDialog from "./ConfirmationDialog";
import ContactSalesDialog from "./ContactSalesDialog";
import useSession from "../hooks/useSession";
import CustomQueryEditor from "./CustomQuery";
import DatasetFiltersDialog from "./DatasetFilterDialog";
import { ReactComponent as FilterIcon } from "../assets/Icons/Filters lines.svg";
import useModule from "../hooks/useModule";
import { AllDatasetTags } from "../utils/allDatasetTags";
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
const headingStyle = {
  fontFamily: "Inter",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: "18px",
  textAlign: "left",
  color: "#475467",
};

const tableCellStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  textAlign: "left",
  color: "#475467",
};

function replaceEncodedSlashes(encodedStr) {
  return encodedStr.replace(/&#x2F;/g, "/");
}
const Row = ({
  row,
  index,
  onDeleteConfirm,
  activeCustomQueryDataset,
  onSetActiveCustomQuery,
  onClearActiveCustomQuery,
}) => {
  // console.log("row", row);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isEven = index % 2 === 0;
  const { theme } = useContext(ThemeContext);
  const [viewDataset, setViewDataset] = useState(false);
  const [viewPreprocess, setViewPreprocess] = useState(false);
  const [isViewDetail, setIsViewDetail] = useState(false);
  const [viewQuery, setViewQuery] = useState(false);

  const location = useLocation();

  const isOnDatasetsScreen =
    location.pathname.split("/")[location.pathname.split("/").length - 1] ===
    "datasets";

  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();
  const { loadDatasetCSV } = useExperiment();
  const {
    pre_processes_metadata,
    addPreprocessMetadata,
    removePreprocessMetadata,
    updatePreprocessMetadata,
    details,
    addDetails,
    removeDetail,
    updateDetail,
    queries,
    addQuery,
    removeQuery,
    updateQuery,
  } = useDataset();
  const [dataPath, setDataPath] = useState("");
  const { clearSession, currentSession, terminateSession } = useSession();

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleLoadDataCSV = async () => {
    let dataPath;
    if (row.source === "File Upload") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/uploads/${row.name}.csv`;
    } else if (
      row.source === "Google_Sheets" ||
      row.source === "Unicommerce" ||
      row.source === "Snowflake" ||
      row.source === "Azure SQL" ||
      row.source === "Shopify" ||
      row.source === "Google BigQuery" ||
      row.source === "BizeeBuy" ||
      row.source === "gdrive" ||
      row.source === "MS 365 Business Central"
    ) {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/api_request_args/samples/${row.name}.csv`;
    } else if (row.source === "Custom") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/custom_data_args/samples/${row.name}.csv`;
    } else if (row.source === "TG Internal") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/internal_data/samples/${row.name}.csv`;
    }

    setDataPath(dataPath);
    console.log("Data Fetched For the Data", row.name);
  };

  const decodedPath = replaceEncodedSlashes(row.path);
  const updatedPath = decodedPath.replace(
    /^(accounts\/)[^/]+/,
    `$1${currentCompany.companyName}_${currentCompany.companyID}`
  );
  const handleLoadPreprocessMetadata = async () => {
    await addPreprocessMetadata(updatedPath, row.datasetID, userInfo.userID);
  };
  const handleLoadDetail = async () => {
    await addDetails(
      row.datasetID,
      row.source,
      currentCompany.companyName,
      row.name,
      currentCompany
    );
  };
  const handleLoadQuery = async () => {
    await addQuery(
      row.datasetID,
      row.source,
      currentCompany.companyName,
      row.name,
      row.dataConnectionName,
      currentCompany
    );
  };

  const [data_preprocess_args, setData_preprocess_args] = useState("");
  const [detail, setDetail] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (pre_processes_metadata[row.datasetID] !== undefined) {
      setData_preprocess_args(
        pre_processes_metadata[row.datasetID].data_preprocess_args
      );
      if (
        pre_processes_metadata[row.datasetID].data_preprocess_args ===
          undefined ||
        pre_processes_metadata[row.datasetID].data_preprocess_args.trim() === ""
      ) {
        setData_preprocess_args(
          "# The dataset is loaded in a variable called 'df' which is a Pandas DataFrame() type object"
        );
      }
    } else {
      setData_preprocess_args(
        "# The dataset is loaded in a variable called 'df' which is a Pandas DataFrame() type object"
      );
    }
  }, [pre_processes_metadata, row]);

  useEffect(() => {
    if (details[row.datasetID] !== undefined) {
      setDetail(details[row.datasetID]);
      if (
        details[row.datasetID] === undefined ||
        details[row.datasetID].trim() === ""
      ) {
        setDetail(
          "# The dataset is loaded in a variable called 'df' which is a Pandas DataFrame() type object"
        );
      }
    } else {
      setDetail(
        "# The dataset is loaded in a variable called 'df' which is a Pandas DataFrame() type object"
      );
    }
  }, [details, row]);

  useEffect(() => {
    setQuery(queries[row.datasetID]);
  }, [queries, row]);

  const handleUpdatePreprocessMetadata = async (data_preprocess_args) => {
    await updatePreprocessMetadata(data_preprocess_args, row.datasetID);
  };

  const handleUpdateDetail = async (detail) => {
    await updateDetail(detail, row.datasetID);
  };

  const handleUpdateQuery = async (query) => {
    await updateQuery(query, row.datasetID);
  };

  const handleRemovePreprocessMetadata = async () => {
    await removePreprocessMetadata(row.datasetID);
  };

  const handleRemoveDetail = async () => {
    await removeDetail(row.datasetID);
  };

  const handleRemoveQuery = async () => {
    await removeQuery(row.datasetID);
  };

  const handleSavePreprocessMetadata = async () => {
    const metadata = pre_processes_metadata[row.datasetID];
    const newData = {};
    Object.keys(pre_processes_metadata[row.datasetID]).forEach((key) => {
      if (key !== "data_preprocess_args") {
        newData[key] = pre_processes_metadata[row.datasetID][key];
      }
    });
    if (
      metadata.data_preprocess_args.trim() !== "" &&
      metadata.data_preprocess_args.trim() !==
        "# The dataset is loaded in a variable called 'df' which is a Pandas DataFrame() type object"
    ) {
      await uploadJsonToS3(updatedPath, metadata);
    } else {
      await uploadJsonToS3(updatedPath, newData);
    }
    await handleRemovePreprocessMetadata();
  };

  const handleTerminate = () => {
    if (currentSession.sessionID) {
      const payload = {
        sessionID: currentSession.sessionID,
      };
      terminateSession(currentCompany, userInfo, payload);
      clearSession();
    }
  };

  const handleSaveDetail = async () => {
    const PreFixpath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library`;
    let path = "";
    if (row.source === "Custom") {
      path = `${PreFixpath}/custom_data_args/${row.name}.txt`;
    }
    const detail = details[row.datasetID];

    if (
      detail.trim() !== "" &&
      detail.trim() !==
        "# The dataset is loaded in a variable called 'df' which is a Pandas DataFrame() type object"
    ) {
      await uploadTxtToS3(path, detail);
    }
    await handleRemoveDetail();
  };

  const handleSaveQuery = async () => {
    const PreFixpath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library`;
    let path = "";
    if (
      row.source === "Snowflake" ||
      row.source === "Azure SQL" ||
      row.source === "Google BigQuery"
    ) {
      path = `${PreFixpath}/data_queries/${row.name}||${row.dataConnectionName}.txt`;
    }
    const query = queries[row.datasetID];

    if (query.trim() !== "") {
      await uploadTxtToS3(path, query);
    }
    await handleRemoveQuery();
  };

  useEffect(() => {
    handleUpdatePreprocessMetadata(data_preprocess_args);
  }, [data_preprocess_args]);

  useEffect(() => {
    handleUpdateDetail(detail);
  }, [detail]);

  useEffect(() => {
    handleUpdateQuery(query);
  }, [query]);

  const {
    loadMetaDataFromS3: loadMetaDataFromS3FromExperiment,
    SetPath: SetPathFromExperiment,
    currentDatasetTag,
    onClickDatasetCard: onClickDatasetCardFromExperiment,
  } = useExperiment();
  const {
    loadMetaDataFromS3: loadMetaDataFromS3FromModule,
    SetPath: SetPathFromModule,

    onClickDatasetCard: onClickDatasetCardFromModule,
  } = useModule();

  const loadMetaDataFromS3 = async (path, tag, userID) => {
    if (AllDatasetTags.includes(tag)) {
      await loadMetaDataFromS3FromExperiment(path, tag, userID);
    } else {
      await loadMetaDataFromS3FromModule(path, tag, userID);
    }
  };
  const onClickDatasetCard = async (tag) => {
    if (AllDatasetTags.includes(tag)) {
      await onClickDatasetCardFromExperiment(tag);
    } else {
      await onClickDatasetCardFromModule(tag);
    }
  };
  //temparory
  const [newTagsopen, setNewTagsOpen] = React.useState(false);
  const handleNewTagsOpen = () => {
    setNewTagsOpen(true);
  };
  const handleNewTagsClose = () => {
    setNewTagsOpen(false);
  };
  const [editPreprocess, setEditPreprocess] = useState(false);
  const [editQuery, setEditQuery] = useState(false);

  const { deleteTheDatasets, loadDatasetsList, datasets_list } = useDataset();

  // Handle opening custom query
  const handleOpenCustomQuery = async () => {
    if (!isViewDetail) {
      await handleLoadDetail();
      // Store the dataset name when custom query is opened
      onSetActiveCustomQuery(row.name);
    }
    setIsViewDetail(!isViewDetail);
  };

  // Handle closing the row
  const handleCloseRow = () => {
    // Check if this row has an active custom query
    if (activeCustomQueryDataset === row.name) {
      // Call terminate function
      handleTerminate();
      // Clear the active custom query tracking
      onClearActiveCustomQuery();
    }

    // Close the row
    setOpen(false);

    // Reset any open states
    setIsViewDetail(false);
    setViewPreprocess(false);
    setViewDataset(false);
    setViewQuery(false);
  };

  // Handle expand/collapse button click
  const handleExpandToggle = async (event) => {
    event.stopPropagation();

    if (open) {
      // Row is being closed
      handleCloseRow();
    } else {
      // Row is being opened
      await handleLoadDataCSV();
      setOpen(true);
    }
  };

  return (
    <>
      <TableRow
        onClick={async () => {
          console.log("new path: ", updatedPath);

          if (isOnDatasetsScreen) {
            await onClickDatasetCard(row.tag);
            await loadMetaDataFromS3(updatedPath, row.tag, userInfo.userID);
            if (AllDatasetTags.includes(row.tag)) {
              SetPathFromExperiment(updatedPath);
            } else {
              SetPathFromModule(updatedPath);
            }
          } else {
            await loadMetaDataFromS3(
              updatedPath,
              currentDatasetTag,
              userInfo.userID
            );
            if (AllDatasetTags.includes(currentDatasetTag)) {
              SetPathFromExperiment(updatedPath);
            } else {
              SetPathFromModule(updatedPath);
            }
          }

          await handleLoadDataCSV();

          handleNewTagsOpen();
        }}
        sx={{
          cursor: "pointer",
          backgroundColor: isEven ? "#FFF" : "#F9FAFB",
          borderBottom: "1px solid #EAECF0",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease-in-out",
            backgroundColor: "#F9F5FF",
            borderTop: "1px solid #D6BBFB",
            borderBottom: "1px solid #D6BBFB",
          },
        }}
      >
        <TableCell align="left" width={"35%"} sx={tableCellStyle}>
          {row.name}
        </TableCell>
        <TableCell align="left" width={"10%"} sx={tableCellStyle}>
          {row.source}
        </TableCell>
        <TableCell align="center" width={"10%"} sx={tableCellStyle}>
          <Box
            sx={{
              padding: " 2px 8px ",
              borderRadius: "16px",
              backgroundColor: row.tagColor,
              maxHeight: "22px",
              width: "max-content",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "18px",
                textAlign: "center",
                color: row.tagTextColor,
              }}
            >
              {row.tag}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="left" width={"19%"} sx={tableCellStyle}>
          {row.last_updated}
        </TableCell>
        <TableCell align="left" width={"13%"} sx={tableCellStyle}>
          {row.updated_by}
        </TableCell>
        <TableCell align="left" width={"5%"}>
          <IconButton
            aria-label="settings"
            onClick={handleExpandToggle}
            sx={{
              color: "#0C66E4",
            }}
          >
            {!open ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              padding="10px 10px 10px 10px"
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                flexDirection: { xs: "column", md: "row" },
                gap: "16px",
              }}
            >
              <Stack spacing={1} direction="row" alignItems={"flex-start"}>
                <CustomButton
                  title={"Close"}
                  outlined
                  onClick={handleCloseRow}
                />
                <CustomButton
                  title={"View Dataset"}
                  outlined={!viewDataset}
                  onClick={async () => {
                    if (!viewDataset) {
                      await handleLoadDataCSV();
                    }
                    setViewDataset(!viewDataset);
                  }}
                />
                <CustomButton
                  title={"Delete Dataset"}
                  outlined={true}
                  onClick={
                    currentCompany.delete_datasets
                      ? handleDialogOpen
                      : () => setIsContactSalesDialogOpen(true)
                  } // Show the dialog when delete is clicked
                />
                <ContactSalesDialog
                  open={isContactSalesDialogOpen}
                  handleClose={() => setIsContactSalesDialogOpen(false)}
                  handleConfirm={handleContactSales}
                  WarningText="Upgrade Your Subscription"
                  ResultText="Upgrade your subscription or contact sales for more access."
                  ConfirmButtonTitle="Contact Sales"
                />
                <CustomButton
                  title={"Preprocess"}
                  outlined={!viewPreprocess}
                  onClick={
                    currentCompany.preprocessing_query
                      ? async () => {
                          if (!viewPreprocess) {
                            await handleLoadPreprocessMetadata();
                          }
                          setViewPreprocess(!viewPreprocess);
                        }
                      : () => setIsContactSalesDialogOpen(true)
                  }
                />
                {row.source === "Custom" && (
                  <CustomButton
                    title={"Custom Query"}
                    outlined={!isViewDetail}
                    onClick={
                      currentCompany.custom_query
                        ? handleOpenCustomQuery
                        : () => setIsContactSalesDialogOpen(true)
                    }
                  />
                )}
                {(row.source === "Snowflake" ||
                  row.source === "Azure SQL" ||
                  row.source === "Google BigQuery") &&
                  row.dataConnectionName !== "" && (
                    <CustomButton
                      title={`${row.source} Query`}
                      outlined={!viewQuery}
                      onClick={
                        currentCompany.access_premium_external_data_connections
                          ? async () => {
                              if (!viewQuery) {
                                await handleLoadQuery();
                              }
                              setViewQuery(!viewQuery);
                            }
                          : () => setIsContactSalesDialogOpen(true)
                      }
                    />
                  )}

                <CustomButton
                  size="medium"
                  onClick={async () => {
                    console.log("new path: ", updatedPath);

                    if (isOnDatasetsScreen) {
                      await onClickDatasetCard(row.tag);
                      await loadMetaDataFromS3(
                        updatedPath,
                        row.tag,
                        userInfo.userID
                      );
                      if (AllDatasetTags.includes(row.tag)) {
                        SetPathFromExperiment(updatedPath);
                      } else {
                        SetPathFromModule(updatedPath);
                      }
                    } else {
                      await loadMetaDataFromS3(
                        updatedPath,
                        currentDatasetTag,
                        userInfo.userID
                      );
                      if (AllDatasetTags.includes(currentDatasetTag)) {
                        SetPathFromExperiment(updatedPath);
                      } else {
                        SetPathFromModule(updatedPath);
                      }
                    }

                    await handleLoadDataCSV();

                    handleNewTagsOpen();
                  }}
                  title={"Edit Tags"}
                  outlined={!newTagsopen}
                />
              </Stack>
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <Box>
                {viewDataset ? <ViewDataset path={dataPath} /> : null}
                {viewPreprocess ? (
                  <>
                    <Stack width="90vw" padding={"0.5rem"}>
                      <Stack
                        direction={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        padding={"0.5rem"}
                      >
                        <Typography
                          sx={{
                            color: "#344054",
                            fontFamily: "Inter",
                            fontWeight: "500",
                            fontSize: "14px",
                            lineHeight: "20px",
                          }}
                        >
                          Preprocess Query
                        </Typography>
                        <CustomButton
                          title={editPreprocess ? "Save" : "Edit"}
                          loadable={editPreprocess}
                          onClick={async () => {
                            if (editPreprocess) {
                              await handleSavePreprocessMetadata();
                              setViewPreprocess(false);
                              setEditPreprocess(false);
                            } else {
                              setEditPreprocess(true);
                            }
                          }}
                        />
                      </Stack>
                      <Box
                        sx={{
                          borderRadius: "0px",
                          border: "1px solid #EAECF0",
                          padding: "2px",
                        }}
                      >
                        <Editor
                          height="250px"
                          loading={false}
                          language="python"
                          theme="light"
                          value={data_preprocess_args}
                          onChange={(value) => setData_preprocess_args(value)}
                          options={{
                            readOnly: !editPreprocess,
                            padding: {
                              top: 18,
                              bottom: 18,
                              left: 18,
                              right: 18,
                            },
                            borderRadius: "8px",
                            border: "1px solid red",
                          }}
                          style={{
                            width: "80%",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            marginBottom: "20px",
                          }}
                        />
                      </Box>
                    </Stack>
                  </>
                ) : null}
                {isViewDetail ? (
                  <CustomQueryEditor
                    detail={detail}
                    setDetail={setDetail}
                    row={row}
                    userInfo={userInfo}
                    currentCompany={currentCompany}
                    datasets_list={datasets_list}
                    onClose={() => {
                      // When custom query editor is closed
                      if (activeCustomQueryDataset === row.name) {
                        handleTerminate();
                        onClearActiveCustomQuery();
                      }
                      setIsViewDetail(false);
                    }}
                    onSave={handleSaveDetail}
                  />
                ) : null}
                {viewQuery ? (
                  <>
                    <Stack width="90vw" padding={"0.5rem"}>
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        padding={"0.5rem"}
                      >
                        <Typography
                          sx={{
                            color: "#344054",
                            fontFamily: "Inter",
                            fontWeight: "500",
                            fontSize: "14px",
                            lineHeight: "20px",
                          }}
                        >
                          {`${row.source} Query`}
                        </Typography>
                        <CustomButton
                          title={editQuery ? "Save" : "Edit"}
                          loadable={editQuery}
                          onClick={async () => {
                            if (editQuery) {
                              setViewQuery(false);
                              await handleSaveQuery();
                              setEditQuery(false);
                            } else {
                              setEditQuery(true);
                            }
                          }}
                        />
                      </Stack>
                      <Box
                        sx={{
                          borderRadius: "0px",
                          border: "1px solid #EAECF0",
                          padding: "2px",
                        }}
                      >
                        <Editor
                          height="250px"
                          loading={false}
                          language="sql"
                          theme="light"
                          value={query}
                          onChange={(value) => setQuery(value)}
                          options={{
                            readOnly: !editQuery,
                            padding: {
                              top: 18,
                              bottom: 18,
                              left: 18,
                              right: 18,
                            },
                            borderRadius: "8px",
                          }}
                          style={{
                            width: "80%",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            marginBottom: "20px",
                          }}
                        />
                      </Box>
                    </Stack>
                  </>
                ) : null}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      {/* Confirmation Dialog for delete */}
      <ConfirmationDialog
        open={dialogOpen}
        handleClose={handleDialogClose}
        handleConfirm={() => onDeleteConfirm(row)} // Pass the row to delete
        WarningText="Are you sure you want to delete this dataset?"
        ResultText="Deleting this dataset will remove it permanently."
        ConfirmButtonTitle="Delete"
      />
      {AllDatasetTags.includes(row.tag) ? (
        <>
          {newTagsopen && (
            <NewTagFieldReview
              handleClose={handleNewTagsClose}
              open={newTagsopen}
            />
          )}
        </>
      ) : (
        <>
          {newTagsopen && (
            <NewTagFieldReviewModule
              handleClose={handleNewTagsClose}
              open={newTagsopen}
            />
          )}
        </>
      )}
    </>
  );
};

const DatasetTable = () => {
  const { datasets_list, loadDatasetsList, deleteTheDatasets } = useDataset();

  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();
  const { loadDatasetInfo } = useModule();
  useEffect(() => {
    loadDatasetInfo();
  }, []);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCreators, setSelectedCreators] = useState([]);

  const [activeCustomQueryDataset, setActiveCustomQueryDataset] =
    useState(null);

  // ... existing code

  // Pass the tracking functions to Row component
  const handleSetActiveCustomQuery = (datasetName) => {
    setActiveCustomQueryDataset(datasetName);
  };

  const handleClearActiveCustomQuery = () => {
    setActiveCustomQueryDataset(null);
  };
  const RecordsPerPage = 5;

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  console.log("====================================");
  console.log("Dataset List Dataset Table", datasets_list);
  console.log("====================================");

  // Filter datasets where inTrash is null or false
  const filteredDatasets = datasets_list.filter((dataset) => !dataset.inTrash);
  console.log("====================================");
  console.log("Filtered Dataset List Dataset Table", filteredDatasets);
  console.log("====================================");

  // Handle delete confirmation
  const handleDeleteConfirm = async (dataset) => {
    const payload = {
      datasetID: dataset.datasetID,
      time: Date.now(),
    };

    const response = await deleteTheDatasets(currentCompany, userInfo, payload);
    console.log("Deleting dataset:", dataset.datasetID, response);
    loadDatasetsList(userInfo); // Reload the dataset list after deletion
  };

  const uniqueSources = [
    ...new Set(filteredDatasets.map((dataset) => dataset.datasetSourceName)),
  ];
  const uniqueTags = [
    ...new Set(filteredDatasets.map((dataset) => dataset.datasetTag)),
  ];
  const uniqueCreators = [
    ...new Set(filteredDatasets.map((dataset) => dataset.createdBy)),
  ];

  const searchAndFilteredDatasets = filteredDatasets.filter((dataset) => {
    const matchesSearch =
      dataset.datasetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.datasetSourceName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      dataset.datasetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource =
      selectedSources.length === 0 ||
      selectedSources.includes(dataset.datasetSourceName);
    const matchesTag =
      selectedTags.length === 0 || selectedTags.includes(dataset.datasetTag);
    const matchesCreator =
      selectedCreators.length === 0 ||
      selectedCreators.includes(dataset.createdBy);

    return matchesSearch && matchesSource && matchesTag && matchesCreator;
  });
  // Inside your rows mapping:
  const rows = searchAndFilteredDatasets.map((dataset) => {
    return {
      datasetID: dataset.datasetID,
      name: dataset.datasetName,
      source: dataset.datasetSourceName,
      tag: dataset.datasetTag,
      last_updated: dataset.updatedAt,
      updated_by: dataset.createdBy,
      tagTextColor: dataset.datasetTag === "sales" ? "#027A48" : "#0C66E4",
      tagColor: dataset.datasetTag === "sales" ? "#ECFDF3" : "#FFF1F3",
      path: dataset.datasetPath,
      dataConnectionName: dataset?.dataConnectionName || "",
    };
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const paginatedData = rows.slice(
    (page - 1) * RecordsPerPage,
    page * RecordsPerPage
  );

  return (
    <Box flex={1}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
          mb: 3,
          paddingRight: 3,
        }}
      >
        <Search sx={{ maxWidth: "300px", minWidth: "200px" }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </Search>

        <CustomButton
          onClick={() => setFilterDialogOpen(true)}
          title={"Filters"}
          outlined
          CustomStartAdornment={<FilterIcon />}
        />
      </Box>
      {rows.length === 0 ? (
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
            No datasets available
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Box}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow sx={{ borderBottom: "1px solid #EAECF0" }}>
                <TableCell align="left" width={"35%"} sx={headingStyle}>
                  Dataset Name
                </TableCell>
                <TableCell align="left" width={"10%"} sx={headingStyle}>
                  Source
                </TableCell>
                <TableCell align="left" width={"10%"} sx={headingStyle}>
                  Data Tag
                </TableCell>
                <TableCell align="left" width={"19%"} sx={headingStyle}>
                  Last updated
                </TableCell>
                <TableCell align="left" width={"13%"} sx={headingStyle}>
                  Created by
                </TableCell>
                <TableCell align="left" width={"5%"} sx={headingStyle}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((row, index) => (
                <Row
                  key={row.name}
                  row={row}
                  index={index}
                  onDeleteConfirm={handleDeleteConfirm}
                  activeCustomQueryDataset={activeCustomQueryDataset}
                  onSetActiveCustomQuery={handleSetActiveCustomQuery}
                  onClearActiveCustomQuery={handleClearActiveCustomQuery}
                />
              ))}
            </TableBody>
          </Table>
          <Pagination
            count={Math.ceil(rows.length / RecordsPerPage)}
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
        </TableContainer>
      )}

      <DatasetFiltersDialog
        open={filterDialogOpen}
        handleClose={() => setFilterDialogOpen(false)}
        uniqueSources={uniqueSources}
        uniqueTags={uniqueTags}
        uniqueCreators={uniqueCreators}
        selectedSources={selectedSources}
        setSelectedSources={setSelectedSources}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedCreators={selectedCreators}
        setSelectedCreators={setSelectedCreators}
      />
    </Box>
  );
};

export default DatasetTable;
