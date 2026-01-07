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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as DataSet } from "../../../../../assets/Icons/DataSet.svg";
import { ReactComponent as DataSetsGreen } from "../../../../../assets/Icons/DataSetsGreen.svg";
import useConfig from "../../../../../hooks/useConfig";
import useExperiment from "../../../../../hooks/useExperiment";
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
import { useParams } from "react-router-dom";
import useDataset from "../../../../../hooks/useDataset";

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
};

const titleStyleCompleted = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#027A48",
  textAlign: "left",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
};

const contentStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  color: "#626F86",
  textAlign: "left",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
};

const BoxComponent = ({
  title,
  description,
  tag,
  onClickDatasetCard,
  currentDatasetTag,
  isMandatory = false,
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

            {isMandatory && (
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

const DataAddedList = ({ title, tag, onOpenDialog, handleCloseDialog }) => {
  const { removeNewProductOperation } = useConfig();
  const {
    loadedDatasets,
    ClearMetaData,
    AddMoreData,
    loadExistingMetaData,
    loadDatasetCSV,
    SetPath,
    onClickDatasetCard,
  } = useExperiment();
  const [newTagsOpen, setNewTagsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const handleNewTagsOpen = () => {
    setNewTagsOpen(true);
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
    const loadedDataset = loadedDatasets[tag][index];
    const name = loadedDataset.filename;
    const source = loadedDataset.source_name;
    await loadExistingMetaData(loadedDataset, tag);
    await setIndex(index);
    await handleLoadDataCSV(source, name);

    await SetPath(
      `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/metadata/${name}.json`
    );
    handleNewTagsOpen();
  };

  const handleAddMoreData = (tag) => {
    AddMoreData(tag);
    onOpenDialog(tag);
  };
  const handleClearMetaData = (tag, index) => {
    if (tag === "new_product") {
      removeNewProductOperation();
    }
    ClearMetaData(tag, index);
  };

  const isDataAddable = [
    "others",
    "bomothers",
    "future",
    "forecast",
    "inventoryothers",
    "item_master",
  ].includes(tag);

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
              <CustomTooltip title="Description" arrow>
                <IconButton disabled>
                  <DescriptionOutlined />
                </IconButton>
              </CustomTooltip>
            </Stack>
          </Stack>
          <Stack p={2}>
            <Stack spacing={0.5}>
              {loadedDatasets[tag]
                .map((dataset) => dataset.filename)
                .map((dataSetName, index) => (
                  <Stack
                    key={index}
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Typography sx={contentStyle}>{dataSetName}</Typography>
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
          handleCloseDatasetDialog={handleCloseDialog}
          open={newTagsOpen}
          editMode
          tag={tag}
          index={index}
        />
      </Card>
    </CustomTooltip>
  );
};

// New ExpDataList Dialog Component
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
            {datasetTitle ? `Add ${datasetTitle} Dataset` : "Add Dataset"}
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
  } = useExperiment();
  const {
    configState,
    showBomDataset,
    showFutureDataset,
    showForecastDataset,
    setShowForecastDataset,
    showNewProductsDataset,
    setShowNewProductsDataset,
    showSimpleDisaggregateMappingDataset,
    setshowSimpleDisaggregateMappingDataset,
    showTransitionItemDataset,
    setShowTransitionItemDataset,
    showForecastRewriteDataset,
    setShowForecastRewriteDataset,
    setShowBomDataset,
    setShowFutureDataset,
    removeNewProductOperation,
  } = useConfig();

  // Dialog state
  const {
    dialogOpen,
    dialogDatasetTag,
    dialogDatasetTitle,
    handleOpenDatasetDialog,
    handleCloseDatasetDialog,
  } = useDataset();

  const combinedDatasets = [
    ...renderDatasets.mandatory_datasets,
    ...renderDatasets.optional_datasets,
  ];

  const [addJoinsOpen, setAddJoinsOpen] = React.useState(false);
  const handleAddJoinsOpen = () => setAddJoinsOpen(true);
  const handleAddJoinsClose = () => setAddJoinsOpen(false);

  if (showBomDataset) {
    combinedDatasets.push(...renderDatasets.bom_datasets);
  }

  if (showFutureDataset) {
    combinedDatasets.push(...renderDatasets.future_datasets);
  }

  if (showForecastDataset) {
    combinedDatasets.push(...renderDatasets.forecast_datasets);
  }
  if (showNewProductsDataset) {
    combinedDatasets.push(...renderDatasets.new_product_datasets);
  }
  if (showSimpleDisaggregateMappingDataset) {
    combinedDatasets.push(
      ...renderDatasets.simple_disaggregation_mapping_datasets
    );
  }
  if (showForecastRewriteDataset) {
    combinedDatasets.push(...renderDatasets.rewrite_forecast_datasets);
  }
  if (showTransitionItemDataset) {
    combinedDatasets.push(...renderDatasets.transition_item_datasets);
  }

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
  console.log("combinedDatasets:", combinedDatasets);

  const handleOpenDialog = (tag) => {
    const dataset = combinedDatasets.find((d) => d.tag === tag);

    handleOpenDatasetDialog(tag, dataset.title);
    onClickDatasetCard(tag);
  };

  const handleCloseDialog = () => {
    console.log("handleCloseDialog called");

    handleCloseDatasetDialog();
  };

  const handleDatasetCardClick = (tag) => {
    handleOpenDialog(tag);
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
  const { moduleName } = useParams();

  return (
    <Box>
      {/* --- DROPDOWN MENU WITH CHECKBOXES --- */}
      <Box
        padding="0px 16px"
        sx={{ display: "flex", justifyContent: "flex-end", marginTop: "-55px" }}
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
              checked={showBomDataset}
              onChange={() => setShowBomDataset(!showBomDataset)}
              size="small"
              sx={{ m: 0, p: 0, mr: 1 }}
            />
            Create Bom
          </MenuItem>
          <Divider sx={{ my: "0!important" }} />
          <MenuItem
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#344054",
              px: 1,
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
              checked={showFutureDataset}
              onChange={() => setShowFutureDataset(!showFutureDataset)}
              size="small"
              sx={{ m: 0, p: 0, mr: 1 }}
            />
            Add Future Data
          </MenuItem>
          <Divider sx={{ my: "0!important" }} />
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
              py: "8px",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#F9F5FF",
                color: "#7F56D9",
              },
            }}
          >
            <Checkbox
              checked={showForecastDataset}
              onChange={() => setShowForecastDataset(!showForecastDataset)}
              size="small"
              sx={{ m: 0, p: 0, mr: 1 }}
            />
            Add Forecast Data
          </MenuItem>
          <Divider sx={{ my: "0!important" }} />
          <MenuItem
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#344054",
              px: 1,
              minHeight: "unset",
              borderRadius: 1.5,
              py: "8px",
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#F9F5FF",
                color: "#7F56D9",
              },
            }}
          >
            <Checkbox
              checked={showNewProductsDataset}
              onChange={() =>
                setShowNewProductsDataset(!showNewProductsDataset)
              }
              size="small"
              sx={{ m: 0, p: 0, mr: 1 }}
            />
            Add New Products
          </MenuItem>
          <Divider sx={{ my: "0!important" }} />
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
              checked={showSimpleDisaggregateMappingDataset}
              onChange={() =>
                setshowSimpleDisaggregateMappingDataset(
                  !showSimpleDisaggregateMappingDataset
                )
              }
              size="small"
              sx={{ m: 0, p: 0, mr: 1 }}
            />
            Add Simple Disaggregate Mapping
          </MenuItem>
          <Divider sx={{ my: "0!important" }} />
          <MenuItem
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#344054",
              px: 1,
              py: "8px",
              minHeight: "unset",
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#F9F5FF",
                color: "#7F56D9",
              },
            }}
          >
            <Checkbox
              checked={showForecastRewriteDataset}
              onChange={() =>
                setShowForecastRewriteDataset(!showForecastRewriteDataset)
              }
              size="small"
              sx={{ m: 0, p: 0, mr: 1 }}
            />
            Add Forecast Rewrites
          </MenuItem>
          <Divider sx={{ my: "0!important" }} />
          <MenuItem
            disabled={loadedDatasets["sales"]?.length === 0}
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#344054",
              px: 1,
              py: "8px",
              minHeight: "unset",
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#F9F5FF",
                color: "#7F56D9",
              },
            }}
          >
            <Checkbox
              checked={showTransitionItemDataset}
              onChange={() =>
                setShowTransitionItemDataset(!showTransitionItemDataset)
              }
              size="small"
              sx={{ m: 0, p: 0, mr: 1 }}
            />
            Add Transition Item's Data
          </MenuItem>
        </Menu>
      </Box>

      <GlobalStyles
        styles={{
          ".MuiMenuItem-root + .MuiDivider-root": {
            marginTop: "0!important",
            marginBottom: "0!important",
          },
        }}
      />
      {renderAlertMessage()}

      <Grid container spacing={3} padding={"12px 6px 6px 12px"}>
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
                  isMandatory={isMandatoryDataset(dataset.tag)}
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
                title={
                  joinsAdded &&
                  (moduleName !== "inventory-optimization" ||
                    (configState.scenario_plan.inventory_constraints
                      ?.sales_joining_keys?.length > 0 &&
                      configState.scenario_plan.inventory_constraints
                        ?.inventory_joining_keys?.length > 0))
                    ? "Edit Joins"
                    : "Add Joins"
                }
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

      {/* ExpDataList Dialog */}
      <ExpDataListDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        currentDatasetTag={dialogDatasetTag}
        datasetTitle={dialogDatasetTitle}
      />

      <AddJoins open={addJoinsOpen} handleClose={handleAddJoinsClose} />
    </Box>
  );
};

export default AddData;
