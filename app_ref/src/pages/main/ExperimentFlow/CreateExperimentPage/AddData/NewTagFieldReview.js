import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { ReactComponent as openMenuIcon } from "../../../../../assets/Icons/openMenuIcon.svg";
import InputBase from "@mui/material/InputBase";
import { ReactComponent as TagCloseIcon } from "../../../../../assets/Icons/x.svg";

import { Box, Grid, Stack, Tooltip, Link } from "@mui/material";
import ViewDataset from "./NewViewDataset";
import { useState } from "react";
import { getTagFieldConfig } from "../../../../../utils/experimentUtils";
import CustomButton from "../../../../../components/CustomButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomAutocomplete from "./../../../../../components/CustomInputControls/CustomAutoComplete";
import useExperiment from "../../../../../hooks/useExperiment";
import useAuth from "../../../../../hooks/useAuth";
import { useEffect } from "react";
import { dateFormats } from "../../../../../utils/Formating/dateFormating";
import { cleanLoadedDataset } from "../../../../../utils/Formating/loadedDatasetFormating";
import { useLocation } from "react-router-dom";
import useDataset from "../../../../../hooks/useDataset";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: " 1px solid #EAECF0",
    backgroundColor: "#FFFFFF",
  },
}));

const styles = {
  mainTypo: {
    fontFamily: "Inter",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "24px",
    textAlign: "left",
    color: "#44546F",
  },
  subTypo: {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
    textAlign: "left",
    color: "#626F86",
    whiteSpace: "pre-line",
  },
  textSmbold: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
    textAlign: "left",
    color: "#344054",
    textTransform: "none",
  },
};

const subHeadingStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "30px",
  color: "#101828",
  textAlign: "left",
};

const InfoTooltip = ({ infoTooltip, docLink }) => {
  const [open, setOpen] = React.useState(false);

  if (!infoTooltip) return null;

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (docLink) {
      // Extract base path (everything before the third slash after protocol)
      const currentUrl = window.location.href;
      const urlParts = currentUrl.split("/");
      // Get protocol, host, and first path segment (test1)
      const basePath = `${urlParts[0]}//${urlParts[2]}/${urlParts[3]}`;

      // Ensure docLink starts with / for absolute path
      const absoluteDocLink = docLink.startsWith("/") ? docLink : `/${docLink}`;
      const fullUrl = `${basePath}${absoluteDocLink}`;

      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  const TooltipContent = () => (
    <Box sx={{ maxWidth: 250, p: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          mb: docLink ? 1 : 0,
          color: "#344054",
          fontSize: "13px",
          lineHeight: "18px",
        }}
      >
        {infoTooltip}
      </Typography>
      {docLink && (
        <Link
          href={docLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          onMouseDown={handleLinkClick}
          sx={{
            fontSize: "12px",
            color: "#1976d2",
            textDecoration: "underline",
            cursor: "pointer",
            display: "inline-block",
            "&:hover": {
              color: "#1565c0",
            },
          }}
        >
          Explore more
        </Link>
      )}
    </Box>
  );

  return (
    <Tooltip
      title={<TooltipContent />}
      arrow
      placement="top"
      open={open}
      onClose={handleTooltipClose}
      onOpen={handleTooltipOpen}
      disableHoverListener={false}
      disableFocusListener={false}
      disableTouchListener={false}
      leaveDelay={300}
      enterDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: "white",
            color: "#344054",
            fontSize: "13px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E4E7EC",
            "& .MuiTooltip-arrow": {
              color: "white",
              "&::before": {
                border: "1px solid #E4E7EC",
              },
            },
          },
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
        },
      }}
    >
      <IconButton
        size="small"
        onMouseEnter={handleTooltipOpen}
        onMouseLeave={() => {
          // Don't close immediately, let the tooltip handle it
        }}
        sx={{
          ml: 0.5,
          p: 0.25,
          color: "#666",
          "&:hover": {
            color: "#1976d2",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
};

export default function NewTagFieldReview({
  open,
  handleClose,
  editMode = false,
  tag,
  index,
}) {
  // const [open, setOpen] = React.useState(false);
  const {
    tagFieldConfig,
    loadedDataset,
    loadedDatasets,
    AddMetaData,
    renderDataStepsList,
    uploadMetadataToS3,
    path,
    columnsInUse,
    areMandatoryFieldsFilled,
    loadDatasetCSV,
    EditMetaData,
    onClickDatasetCard,
  } = useExperiment();
  const { userInfo, currentCompany } = useAuth();
  const location = useLocation();
  const [dataPath, setDataPath] = useState("");
  const { handleCloseDatasetDialog } = useDataset();
  const isOnDatasetsScreen =
    location.pathname.split("/")[location.pathname.split("/").length - 1] ===
    "datasets";
  const handleAddData = async () => {
    console.log("Before Cleaning:", loadedDataset);
    const cleanLoadedData = await cleanLoadedDataset(loadedDataset);
    if (!isOnDatasetsScreen) {
      await AddMetaData(cleanLoadedData);
    }

    await uploadMetadataToS3({ metaData: cleanLoadedData, path: path });
    // await ClearCache();
    handleCloseDatasetDialog();
    handleClose();
  };
  const handleEditData = async () => {
    console.log("Before Cleaning:", loadedDataset);
    const cleanLoadedData = await cleanLoadedDataset(loadedDataset);
    console.log("After Cleaning:", cleanLoadedData);
    if (!isOnDatasetsScreen) {
      await EditMetaData(cleanLoadedData, tag, index);
    }

    await uploadMetadataToS3({ metaData: cleanLoadedData, path: path });
    // await ClearCache();
    await onClickDatasetCard("none");
    handleClose();
  };

  const loadData = async () => {
    let dataPath;
    if (loadedDataset.source_name === "File Upload") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/uploads/${loadedDataset.filename}.csv`;
    } else if (
      loadedDataset.source_name === "Google_Sheets" ||
      loadedDataset.source_name === "Unicommerce" ||
      loadedDataset.source_name === "Snowflake" ||
      loadedDataset.source_name === "Azure SQL" ||
      loadedDataset.source_name === "Shopify" ||
      loadedDataset.source_name === "Google BigQuery" ||
      loadedDataset.source_name === "BizeeBuy" ||
      loadedDataset.source_name === "gdrive" ||
      loadedDataset.source_name === "MS 365 Business Central"
    ) {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/api_request_args/samples/${loadedDataset.filename}.csv`;
    } else if (loadedDataset.source_name === "Custom") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/custom_data_args/samples/${loadedDataset.filename}.csv`;
    } else if (loadedDataset.source_name === "TG Internal") {
      dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/internal_data/samples/${loadedDataset.filename}.csv`;
    }
    console.log("Data Path:", dataPath);
    setDataPath(dataPath);
    // await loadDatasetCSV(dataPath);
  };

  const renderTagLabelWithInfo = (tag) => {
    if (!tag.showLabel) return null;

    return (
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
      >
        <Typography
          component="label"
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 500,
            color: "#344054",
            display: "flex",
            alignItems: "center",
          }}
        >
          {tag.label}
        </Typography>
        <InfoTooltip infoTooltip={tag.infoTooltip} docLink={tag.docLink} />
      </div>
    );
  };

  // useEffect(() => {
  //   let isMounted = true;

  //   const loadData = async () => {
  //     const dataPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/data_library/uploads/${loadedDataset.filename}.csv`;
  //     if (isMounted) {
  //       await loadDatasetCSV(dataPath);
  //     }
  //   };

  //   if (isMounted) {
  //     loadData();
  //   }

  //   return () => {
  //     // Cleanup to avoid issues when the component is unmounted
  //     isMounted = false;
  //   };
  // }, [userInfo, loadedDataset]);

  // const currentTag = "others";
  const { mandatory_tags, optional_tags } = tagFieldConfig;
  // console.log("tagFieldConfig", mandatory_tags, optional_tags);
  const [showViewDataSet, setShowViewDataSet] = useState(false);
  const array = loadedDataset ? columnsInUse : ["1", "2", "3"];
  console.log("Options to tag", array)
  const sales_columns_fileds = ["Sales Data Item"]
  const sales_data_columns = loadedDatasets["sales"]?.[0]?.data_attributes?.cols || [];
  

  const aggValues = ["sum", "mean", "max", "min"];
  const fillNAValues = ["0", "mean", "max", "min"];
  return (
    <>
      <BootstrapDialog
        onClose={async () => {
          if (editMode) {
            await onClickDatasetCard("none");
          }
          handleClose();
        }}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="lg"
        fullWidth
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          p={4}
          sx={{
            height: "79px",
            padding: "20px 24px 19px 24px",
            gap: "16px",
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Inter",
              fontWeight: "500",
              fontSize: "18px",
              lineHeight: "28px",
            }}
            id="customized-dialog-title"
          >
            {loadedDataset ? loadedDataset.filename : "No Dataset Loaded"}
          </DialogTitle>
          <Stack direction="row" spacing={1}>
            <CustomButton
              outlined={!showViewDataSet}
              disabled={!path || path.length === 0}
              title={"View Dataset"}
              onClick={async () => {
                if (!showViewDataSet) {
                  await loadData();
                }
                setShowViewDataSet(!showViewDataSet);
              }}
            />
            <CustomButton
              title={editMode ? "Confirm" : "Add Tags"}
              disabled={!areMandatoryFieldsFilled || !path || path.length === 0}
              onClick={
                editMode
                  ? () => {
                      handleEditData();
                    }
                  : () => {
                      handleAddData();
                    }
              }
              loadable
            />
            <IconButton
              aria-label="close"
              onClick={async () => {
                if (editMode) {
                  await onClickDatasetCard("none");
                }
                handleClose();
              }}
              sx={{
                width: "40px",
                height: "40px",
                padding: "8px",
                gap: "8px",
                borderRadius: "8px",
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        <DialogContent dividers>
          {showViewDataSet && <ViewDataset path={dataPath} />}
          <Stack padding="24px 32px 24px 32px" gap="24px">
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <Typography sx={subHeadingStyle}>Mandatory Tags</Typography>
              </Grid>
              {mandatory_tags.map((tag, id) => {
                const haveSpace =
                  mandatory_tags.length % 2 !== 0 &&
                  id === mandatory_tags.length - 1;
                const isDateFormat = tag.label === "Date Format";
                return (
                  <Grid item xs={tag.xs} md={haveSpace ? 12 : tag.md} key={id}>
                    {renderTagLabelWithInfo(tag)}
                    <CustomAutocomplete
                      showLabel={false}
                      label={tag.label}
                      isMultiSelect={tag.isMultiSelect}
                      path={tag.path}
                      values={sales_columns_fileds.includes(tag.label) ? sales_data_columns : isDateFormat ? dateFormats : array}
                      dateFormat={isDateFormat}
                      target="tag"
                      formatLabel={false}
                    />
                  </Grid>
                );
              })}
            </Grid>
            {optional_tags.length > 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <Typography sx={subHeadingStyle}>Optional Tags</Typography>
                </Grid>
                {optional_tags.map((tag, id) => {
                  const haveSpace =
                    optional_tags.length % 2 !== 0 &&
                    id === optional_tags.length - 1;
                  const isDateFormat = tag.label === "Date Format";
                  const isSupplyItemMaster =
                    tag.label === "Supply Item Master?";

                  return (
                    <Grid
                      item
                      xs={tag.xs}
                      md={haveSpace ? 12 : tag.md}
                      key={id}
                    >
                      {renderTagLabelWithInfo(tag)}

                      {isSupplyItemMaster ? (
                        <CustomAutocomplete
                          showLabel={false}
                          label={tag.label}
                          isMultiSelect={false}
                          path={tag.path}
                          values={[true, false]}
                          valuesDict={{
                            true: "True",
                            false: "False",
                          }}
                          target="tag"
                          formatLabel={false}
                          key={`supply-${tag.label}-${tag.path || id}`}
                        />
                      ) : (
                        <CustomAutocomplete
                          showLabel={false}
                          label={tag.label}
                          isMultiSelect={tag.isMultiSelect}
                          path={tag.path}
                          values={isDateFormat ? dateFormats : array}
                          dateFormat={isDateFormat}
                          target="tag"
                          formatLabel={false}
                        />
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            )}
            {renderDataStepsList.length > 0 ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <Typography sx={subHeadingStyle}>Group by</Typography>
                </Grid>
                <Grid item xs={12} md={12 / 5}>
                  <Typography sx={styles.mainTypo}>Title</Typography>
                </Grid>
                <Grid item xs={12} md={12 / 5}>
                  <Typography sx={styles.mainTypo}>Type</Typography>
                </Grid>
                <Grid item xs={12} md={12 / 5}>
                  <Typography sx={styles.mainTypo}>Aggregation</Typography>
                </Grid>
                <Grid item xs={12} md={12 / 5}>
                  <Typography sx={styles.mainTypo}>FillNA</Typography>
                </Grid>
                <Grid item xs={12} md={12 / 5}>
                  <Typography sx={{ paddingLeft: "40px", ...styles.mainTypo }}>
                    Label
                  </Typography>
                </Grid>

                {renderDataStepsList.map((item, id) => {
                  return (
                    <>
                      <Grid item xs={12} md={12 / 5} key={id}>
                        <Typography sx={styles.mainTypo}>
                          {item.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={12 / 5} key={id}>
                        <CustomAutocomplete disabled values={array} />
                      </Grid>
                      <Grid item xs={12} md={12 / 5} key={id}>
                        <CustomAutocomplete
                          path={item.aggregate_path}
                          disabled={item.aggregate_disabled}
                          values={aggValues}
                          target="tag"
                          formatLabel={false}
                        />
                      </Grid>
                      <Grid item xs={12} md={12 / 5} key={id}>
                        <CustomAutocomplete
                          path={item.fillNa_path}
                          disabled={item.fillNa_disabled}
                          values={fillNAValues}
                          target="tag"
                          formatLabel={false}
                        />
                      </Grid>
                      <Grid item xs={12} md={12 / 5} key={id}>
                        <Typography
                          sx={{ paddingLeft: "40px", ...styles.mainTypo }}
                        >
                          {item.tag}
                        </Typography>
                      </Grid>
                    </>
                  );
                })}
              </Grid>
            ) : null}
          </Stack>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
}
