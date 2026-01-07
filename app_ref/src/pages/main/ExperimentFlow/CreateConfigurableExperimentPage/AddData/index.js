import {
  Box,
  Stack,
  Grid,
  IconButton,
  CardContent,
  Card,
  Checkbox,
  FormControlLabel,
  styled,
  Tooltip,
  tooltipClasses,
  GlobalStyles,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { ReactComponent as DataSet } from "../../../../../assets/Icons/DataSet.svg";
import { ReactComponent as DataSetsGreen } from "../../../../../assets/Icons/DataSetsGreen.svg";
import useConfig from "../../../../../hooks/useConfig";

import NewTagFieldReview from "./NewTagFieldReview";
import CustomButton from "../../../../../components/CustomButton";
import ExpDataList from "./ExpDataList";
import {
  AddTaskOutlined,
  CloseOutlined,
  DescriptionOutlined,
  DriveFileRenameOutlineOutlined,
  NoteAddOutlined,
} from "@mui/icons-material";
import AddJoins from "./AddJoins";
import CustomTooltip from "../../../../../components/CustomToolTip";
import { render } from "@testing-library/react";
import useAuth from "../../../../../hooks/useAuth";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FilterListIcon from "@mui/icons-material/FilterList";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Divider from "@mui/material/Divider";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import useModule from "../../../../../hooks/useModule";

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
  whiteSpace: "nowrap", // Prevents wrapping
  overflow: "hidden", // Hides overflowed content
  textOverflow: "ellipsis", // Shows ellipsis for overflowed content
  maxWidth: "100%", // Ensures the text does not exceed the container
};

const titleStyleCompleted = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#027A48",
  textAlign: "left",
  whiteSpace: "nowrap", // Prevents wrapping
  overflow: "hidden", // Hides overflowed content
  textOverflow: "ellipsis", // Shows ellipsis for overflowed content
  maxWidth: "100%", // Ensures the text does not exceed the container
  // flexGrow: 1, // Allows the Typography to take up available space
};

const contentStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  color: "#626F86",
  textAlign: "left",
  whiteSpace: "nowrap", // Prevents wrapping
  overflow: "hidden", // Hides overflowed content
  textOverflow: "ellipsis", // Shows ellipsis for overflowed content
  maxWidth: "100%", // Ensures the text does not exceed the container
};

const BoxComponent = ({
  title,
  description,
  tag,
  onClickDatasetCard,
  currentDatasetTag,
  isMandatoryDataset = false,
}) => {
  return (
    <CustomTooltip title={title} placement={"top-end"} arrow>
      <Card
        sx={{
          cursor: "pointer",
          border: "1px solid #EAECF0",
          borderRadius: "8px",
          boxShadow:
            tag === currentDatasetTag
              ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
              : "none",
          backgroundColor: "#FFFFFF",
          height: "100%",
          "& .MuiCard-root": {
            padding: 0,
          },
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease-in-out",
          },
        }}
        onClick={() => onClickDatasetCard(tag)}
      >
        <CardContent
          sx={{
            padding: "0px",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
            sx={{
              border: "1px solid #EAECF0",
              borderColor: tag === currentDatasetTag ? "#D6BBFB" : "#EAECF0",
              borderRadius: "8px 8px 0px 0px",
              padding: "16px 20px 16px 16px",
              backgroundColor:
                tag === currentDatasetTag ? "#F9F5FF" : "#FFFFFF",
              maxWidth: "100%",
            }}
          >
            <Stack
              alignItems={"center"}
              spacing={1}
              direction={"row"}
              sx={{ maxWidth: "100%", overflow: "hidden" }}
            >
              <DataSet />
              <Typography sx={titleStyle}>{title}</Typography>
            </Stack>

            {isMandatoryDataset && (
              <Chip
                label="Required"
                size="small"
                sx={{
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  border: "1px solid #FCD34D",
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 500,
                  height: "24px",
                  borderRadius: "12px",
                  "& .MuiChip-label": {
                    paddingX: "8px",
                    paddingY: "2px",
                  },
                }}
              />
            )}
          </Stack>
          <Stack p={2}>
            <Typography sx={contentStyle}>{description}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </CustomTooltip>
  );
};

const DataAddedList = ({ title, tag, onOpenDialog }) => {
  const {
    loadedDatasets,
    ClearMetaData,
    AddMoreData,
    loadExistingMetaData,
    loadDatasetCSV,
    SetPath,
    removeNewProductOperation,
  } = useModule();
  const [newTagsOpen, setNewTagsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const handleNewTagsOpen = () => {
    setNewTagsOpen(true);
  };

  const handleClearMetaData = (tag , index) => {
    if(tag === "new_product"){
      removeNewProductOperation();
    }
    ClearMetaData(tag, index);
  };
  const handleNewTagsClose = () => {
    setNewTagsOpen(false);
  };
  const { currentCompany } = useAuth();
  const handleLoadDataCSV = async (source, name) => {
    let dataPath;
    if (source === "File Upload") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/uploads/${name}.csv`;
    } else if (
      source === "Google_Sheets" ||
      source === "Unicommerce" ||
      source === "Snowflake" ||
      source === "Azure SQL" ||
      source === "Shopify"
    ) {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/api_request_args/samples/${name}.csv`;
    } else if (source === "Custom") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/custom_data_args/samples/${name}.csv`;
    } else if (source === "TG Internal") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/internal_data/samples/${name}.csv`;
    }

    await loadDatasetCSV(dataPath);
    console.log("Data Fetched For the Data", name);
  };
  const handleEdit = async (index) => {
    // await onClickDatasetCard(tag);
    console.log("handleEdit Index", index);
    const loadedDataset = loadedDatasets[tag][index];
    const name = loadedDataset.filename;
    const source = loadedDataset.source_name;
    console.log("loadedDataset", loadedDataset);
    console.log("name", name);
    console.log("source", source);
    console.log("tag", tag);
    await loadExistingMetaData(loadedDataset, tag);
    await setIndex(index);
    await handleLoadDataCSV(source, name);

    await SetPath(
      `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/metadata/${name}.json`
    );
    handleNewTagsOpen();
  };
  const isDataAddable = [
    "others",
    "bomothers",
    "future",
    "forecast",
    "inventoryothers",
  ].includes(tag);
  const handleAddMoreData = () => {
    AddMoreData(tag);
    onOpenDialog(tag);
  };

  return (
    <CustomTooltip title={title} placement={"top-end"} arrow>
      <Card
        sx={{
          cursor: "pointer",
          border: "1px solid #EAECF0",
          borderRadius: "8px",
          boxShadow: "none",
          backgroundColor: "#FFFFFF",
          height: "100%",
          "& .MuiCard-root": {
            padding: 0,
          },
        }}
      >
        <CardContent
          sx={{
            padding: "0px",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
            borderRadius="8px 8px 0px 0px"
            padding="16px 12px 16px 16px"
            gap={"4px"}
            sx={{
              border: "1px solid #A6F4C5",
              background: "#ECFDF3",
              maxWidth: "100%",
            }}
          >
            <Stack
              spacing={1}
              direction="row"
              alignItems="center"
              sx={{ maxWidth: "100%", overflow: "hidden" }}
            >
              <DataSetsGreen />
              <Typography noWrap sx={titleStyleCompleted}>
                {title}
              </Typography>
            </Stack>
            <Stack spacing={1} direction="row" alignItems="center">
              {isDataAddable && (
                <CustomTooltip title="Add More Data" arrow placement="top-end">
                  <IconButton onClick={() => handleAddMoreData(tag)}>
                    <NoteAddOutlined />
                  </IconButton>
                </CustomTooltip>
              )}
              {/* <CustomTooltip title="Edit" arrow>
              <IconButton disabled>
                <DriveFileRenameOutlineOutlined />
              </IconButton>
            </CustomTooltip> */}
              <CustomTooltip title="Description" arrow>
                <IconButton disabled>
                  <DescriptionOutlined />
                </IconButton>
              </CustomTooltip>
              {/* <CustomTooltip title="Clear" arrow placement="top-start">
                <IconButton onClick={() => ClearMetaData(tag)}>
                  <CloseOutlined />
                </IconButton>
              </CustomTooltip> */}
            </Stack>
          </Stack>
          <Stack p={2}>
            <Stack spacing={0.5}>
              {loadedDatasets[tag]
                .map((dataset) => dataset.filename)
                .map((dataSetName, index) => (
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Typography key={index} sx={contentStyle}>
                      {dataSetName}
                    </Typography>
                    <Stack direction={"row"} spacing={1}>
                      <IconButton
                        onClick={() => {
                          handleEdit(index);
                        }}
                        sx={{ padding: "2px" }}
                      >
                        <DriveFileRenameOutlineOutlined
                          sx={{
                            fontSize: "18px",
                            color: "#626F86",
                          }}
                        />
                      </IconButton>

                      <IconButton
                        onClick={() => handleClearMetaData(tag, index)}
                        sx={{ padding: "2px" }}
                      >
                        <CloseOutlined
                          sx={{
                            fontSize: "18px",
                            color: "#626F86",
                          }}
                        />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
            </Stack>
          </Stack>
        </CardContent>
        <NewTagFieldReview
          handleClose={handleNewTagsClose}
          open={newTagsOpen}
          editMode
          tag={tag}
          index={index}
        />
      </Card>
    </CustomTooltip>
  );
};

const ExpDataListDialog = ({
  open,
  onClose,
  currentDatasetTag,
  datasetTitle,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxHeight={"90vh"}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0px 20px 24px -4px #10182814, 0px 8px 8px -4px #10182808",
          border: "1px solid #EAECF0",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: "1.5rem 1.5rem 1rem 1.5rem",
          borderBottom: "1px solid #EAECF0",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "1.125rem",
              color: "#101828",
              lineHeight: "1.75rem",
            }}
          >
            {datasetTitle ? `${datasetTitle}` : "Add Dataset"}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#667085",
              "&:hover": {
                backgroundColor: "#F9FAFB",
              },
            }}
          >
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: "1.5rem",
          backgroundColor: "#FFFFFF",
          overflow: "auto",
        }}
      >
        <ExpDataList handleClose={onClose} />
      </DialogContent>

      <DialogActions
        sx={{
          padding: "1rem 1.5rem 1.5rem 1.5rem",
          gap: "0.75rem",
          borderTop: "1px solid #EAECF0",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            fontFamily: "Inter",
            fontSize: "0.875rem",
            fontWeight: 600,
            lineHeight: "1.25rem",
            color: "#344054",
            borderColor: "#D0D5DD",
            borderRadius: "8px",
            padding: "0.625rem 1rem",
            textTransform: "none",
            boxShadow: "0px 1px 2px 0px #1018280D",
            "&:hover": {
              borderColor: "#98A2B3",
              backgroundColor: "#F9FAFB",
              boxShadow: "0px 1px 2px 0px #1018281A",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AddData = ({ renderAlertMessage }) => {
  const {
    defaultConfig,
    renderDatasets,
    currentDatasetTag,
    onClickDatasetCard,
    loadedDatasets,
    datasetsLoaded,
    needToJoin,
    joinsAdded,
    datasetsAdded,
    loadJoins,
    configState,
    showBomDataset,
    showFutureDataset,
    showForecastDataset,
    setShowForecastDataset,
    showNewProductsDataset,
    setShowNewProductsDataset,
    showSimpleDisaggregateMappingDataset,
    setshowSimpleDisaggregateMappingDataset,
    showForecastRewriteDataset,
    setShowForecastRewriteDataset,
    setShowBomDataset,
    setShowFutureDataset,
    show_dataset_groups,
    setShowDatasetGroups,
    ui_config,
    dialogOpen,
    dialogDatasetTag,
    dialogDatasetTitle,
    handleOpenDatasetDialog,
    handleCloseDatasetDialog,
  } = useModule();

  // const [showBomDataset, setShowBomDataset] = useState(false);
  // const [showFutureDataset, setShowFutureDataset] = useState(false);
  const combinedDatasets = [
    ...renderDatasets.mandatory_datasets,
    ...renderDatasets.optional_datasets,
  ];

  const [addJoinsOpen, setAddJoinsOpen] = React.useState(false);
  const handleAddJoinsOpen = () => setAddJoinsOpen(true);
  const handleAddJoinsClose = () => setAddJoinsOpen(false);

  Object.entries(show_dataset_groups).forEach(([groupKey, isEnabled]) => {
    if (
      isEnabled &&
      groupKey !== "mandatory_datasets_tags" &&
      groupKey !== "optional_datasets_tags"
    ) {
      // Convert group key to renderDatasets key by removing "_tags" suffix
      const renderKey = groupKey.replace("_tags", "");
      // Convert to snake case and append _datasets
      const datasetKey = renderKey;

      if (renderDatasets[datasetKey]) {
        combinedDatasets.push(...renderDatasets[datasetKey]);
      }
    }
  });

  console.log("combinedDatasets:", combinedDatasets);

  const handleClose = () => {
    onClickDatasetCard("none");
  };
  useEffect(() => {
    console.log("Config State Updated", configState);
  }, [configState]);
  console.log("loadedDatasets:", loadedDatasets);
  console.log("datasetsLoaded:", datasetsLoaded);
  const isMandatoryDataset = (tag) => {
    const mandatoryTags = renderDatasets.mandatory_datasets.map(
      (dataset) => dataset.tag
    );
    return mandatoryTags.includes(tag) && !datasetsLoaded[tag];
  };
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDatasetCardClick = (tag) => {
    handleOpenDialog(tag);
    console.log(
      "ui_config.datasets.dataset_info",
      ui_config.datasets.dataset_info
    );
  };

  const handleOpenDialog = (tag) => {
    const dataset = combinedDatasets.find((d) => d.tag === tag);

    handleOpenDatasetDialog(tag, dataset.title);
    onClickDatasetCard(tag);
  };

  const handleCloseDialog = () => {
    console.log("handleCloseDialog called");

    handleCloseDatasetDialog();
  };

  const getMdValues = (totalItems) => {
    const result = [];
    let remaining = totalItems;

    while (remaining > 0) {
      let itemsInRow = 4;

      if (remaining === 5) itemsInRow = 3;
      else if (remaining === 2 || remaining === 3) itemsInRow = remaining;
      else if (remaining === 1) itemsInRow = 1;
      else if (remaining === 9) itemsInRow = 4;
      else if (remaining === 10) itemsInRow = 4;

      result.push(...Array(itemsInRow).fill(Math.floor(12 / itemsInRow)));
      remaining -= itemsInRow;
    }

    return result;
  };

  return (
    <Box>
      {/* --- DROPDOWN MENU WITH CHECKBOXES (Option 2) --- */}
      {Object.keys(ui_config.datasets.show_dataset_group_labels).length > 0 && (
        <Box
          padding="0px 16px"
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "-55px",
          }}
        >
          <IconButton
            aria-label="more datasets"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: "8px",
              padding: "6px 12px",
              background: anchorEl ? "#F9F5FF" : "#FFF",
              fontWeight: 500,
              fontFamily: "Inter",
              fontSize: "14px",
              color: anchorEl ? "#7F56D9" : "#344054",
              border: anchorEl ? "1px solid #D6BBFB" : "1px solid #EAECF0",
              "&:hover": {
                background: "#F9F5FF",
                color: "#7F56D9",
                borderColor: "#D6BBFB",
              },
            }}
          >
            More Datasets
            <KeyboardArrowDown sx={{ fontSize: 20 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 240,
                backgroundColor: "#FFF",
                boxShadow: "0px 8px 32px rgba(16, 24, 40, 0.16)",
                p: 0,
                marginTop: "6px",
              },
            }}
            MenuListProps={{
              sx: {
                p: 0,
                margin: "0px",
              },
            }}
          >
            {Object.entries(ui_config.datasets.show_dataset_group_labels).map(
              ([groupKey, label]) => (
                <React.Fragment key={groupKey}>
                  <MenuItem
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#344054",
                      px: 1,
                      minHeight: "unset",
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      py: "8px",
                      "&:hover": {
                        backgroundColor: "#F9F5FF",
                        color: "#7F56D9",
                      },
                    }}
                  >
                    <Checkbox
                      checked={show_dataset_groups[groupKey]}
                      onChange={() =>
                        setShowDatasetGroups(
                          groupKey,
                          !show_dataset_groups[groupKey]
                        )
                      }
                      size="small"
                      sx={{ m: 0, p: 0, mr: 1 }}
                    />
                    {label}
                  </MenuItem>
                  <Divider sx={{ my: "0!important" }} />
                </React.Fragment>
              )
            )}
          </Menu>
        </Box>
      )}
      {/* --- END DROPDOWN MENU --- */}

      {/* --- SEGMENTED CONTROL (Option 3) --- */}
      {/*
      <Box padding="0px 16px" sx={{ display: "flex", justifyContent: "flex-end", marginTop: "-55px" }}>
        <ToggleButtonGroup size="small" sx={{ gap: 1 }}>
          <ToggleButton
            value="bom"
            selected={showBomDataset}
            onChange={() => setShowBomDataset(!showBomDataset)}
            title="Create Bom"
          >
            <Tooltip title="Create Bom" arrow><span>Bom</span></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="future"
            selected={showFutureDataset}
            onChange={() => setShowFutureDataset(!showFutureDataset)}
            title="Add Future Data"
          >
            <Tooltip title="Add Future Data" arrow><span>Future</span></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="forecast"
            selected={showForecastDataset}
            onChange={() => setShowForecastDataset(!showForecastDataset)}
            title="Add Forecast Data"
          >
            <Tooltip title="Add Forecast Data" arrow><span>Forecast</span></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="newProducts"
            selected={showNewProductsDataset}
            onChange={() => setShowNewProductsDataset(!showNewProductsDataset)}
            title="Add New Products"
          >
            <Tooltip title="Add New Products" arrow><span>New</span></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="simpleDisaggregate"
            selected={showSimpleDisaggregateMappingDataset}
            onChange={() => setshowSimpleDisaggregateMappingDataset(!showSimpleDisaggregateMappingDataset)}
            title="Add Simple Disaggregate Mapping"
          >
            <Tooltip title="Add Simple Disaggregate Mapping" arrow><span>Disagg</span></Tooltip>
          </ToggleButton>
          <ToggleButton
            value="forecastRewrite"
            selected={showForecastRewriteDataset}
            onChange={() => setShowForecastRewriteDataset(!showForecastRewriteDataset)}
            title="Add Forecast Rewrites"
          >
            <Tooltip title="Add Forecast Rewrites" arrow><span>Rewrite</span></Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      */}
      {/* --- END SEGMENTED CONTROL --- */}

      {/* --- OLD CHECKBOXES (commented for reference) --- */}
      {/**
      <Box
        padding="0px 16px"
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "-55px",
        }}
      >
        ...
      </Box>
      */}
      <GlobalStyles
        styles={{
          ".MuiMenuItem-root + .MuiDivider-root": {
            marginTop: "0!important",
            marginBottom: "0!important",
          },
        }}
      />
      {renderAlertMessage()}
      <Grid container spacing={3} padding={"12px 16px 12px 16px"}>
        {combinedDatasets.map((dataset, index) => {
          const total = combinedDatasets.length;
          const itemsPerRow = 4;
          const itemsInLastRow =
            total % itemsPerRow === 0 ? itemsPerRow : total % itemsPerRow;

          // Are we rendering an item in the last row?
          const isInLastRow = index >= total - itemsInLastRow;

          let md = 3; // default: 4 items per row

          if (isInLastRow && itemsInLastRow < itemsPerRow) {
            md = Math.floor(12 / itemsInLastRow);
          }

          const mdValues = getMdValues(combinedDatasets.length);
          return (
            <Grid
              item
              xs={12}
              md={mdValues[index]}
              key={`${index}-${dataset.tag}`}
            >
              {!datasetsLoaded[dataset.tag] ? (
                <BoxComponent
                  title={dataset.title}
                  description={dataset.description}
                  tag={dataset.tag}
                  currentDatasetTag={currentDatasetTag}
                  onClickDatasetCard={handleDatasetCardClick}
                  isMandatoryDataset={isMandatoryDataset(dataset.tag)}
                />
              ) : (
                <DataAddedList
                  title={dataset.title}
                  tag={dataset.tag}
                  onOpenDialog={handleOpenDialog}
                />
              )}
            </Grid>
          );
        })}
        <Grid item xs={12} md={12}>
          <Stack direction={"row"} justifyContent={"flex-end"}>
            {datasetsAdded.length > 1 && (
              <CustomButton
                title={joinsAdded ? "Edit Joins" : "Add Joins"}
                outlined
                onClick={async () => {
                  await loadJoins();
                  handleAddJoinsOpen();
                }}
              />
            )}
          </Stack>
        </Grid>
      </Grid>
      <ExpDataListDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        currentDatasetTag={dialogDatasetTag}
        datasetTitle={dialogDatasetTitle}
      />
      {addJoinsOpen && (
        <AddJoins open={addJoinsOpen} handleClose={handleAddJoinsClose} />
      )}
    </Box>
  );
};

export default AddData;
