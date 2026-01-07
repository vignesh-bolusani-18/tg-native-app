import React, { useEffect, useState } from "react";
import { AllDatasetTags } from "../../../../utils/allDatasetTags";
import useExperiment from "../../../../hooks/useExperiment";
import useModule from "../../../../hooks/useModule";
import useAuth from "../../../../hooks/useAuth";
import { useVibe } from "../../../../hooks/useVibe";
import {
  Box,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Collapse,
} from "@mui/material";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import { Link } from "react-router-dom";
import { dateFormats } from "../../../../utils/Formating/dateFormating";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { cleanLoadedDataset } from "../../../../utils/Formating/loadedDatasetFormating";
import { useWorkflowWebSocket } from "../../../../hooks/useWorkflowWebSocket";
import CustomButton from "../../../../components/CustomButton";
import useConfig from "../../../../hooks/useConfig";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { oldFlowModules } from "../../../../utils/oldFlowModules";
import { default as CustomAutocompleteModule } from "../../../../components/ConfigurableCustomInputControls/CustomAutoComplete";
import { default as CustomAutocompleteConfig } from "../../../../components/CustomInputControls/CustomAutoComplete";

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
const DataTaggerSection = ({ dataInfo, messageId, langgraphState }) => {
  const CustomAutocomplete = !oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? CustomAutocompleteModule
    : CustomAutocompleteConfig;
  console.log("DataTaggerSection Rendered");
  const { userInfo } = useAuth();
  const {
    setOpenDataTagger,
    setIsWaitingForAI,
    setProcessingStepText,
    setDataTagged,
    currentConversation,
    editMessage,
    setDataConfirmed,
    creditScore,
  } = useVibe();
  const dataTagged = currentConversation.dataTagged;
  const dataConfirmed = currentConversation.dataConfirmed;
  const [isExpanded, setIsExpanded] = useState(true);
  const [prefilledTags, setPrefilledTags] = useState(new Set());
  const openDataTagger = currentConversation.openDataTagger;
  const { sendQuery } = useWorkflowWebSocket();
  const {
    loadMetaDataFromS3: loadMetaDataFromS3FromExperiment,
    onClickDatasetCard: onClickDatasetCardFromExperiment,
    SetPath: SetPathFromExperiment,
    tagFieldConfig: tagFieldConfigFromExperiment,
    loadedDataset: loadedDatasetFromExperiment,
    columnsInUse: columnsInUseFromExperiment,
    renderDataStepsList: renderDataStepsListFromExperiment,
    updateTagFieldByPath: updateTagFieldByPathFromExperiment,
    AddMetaData: AddMetaDataFromExperiment,
    uploadMetadataToS3: uploadMetadataToS3FromExperiment,

    datasetsLoaded: datasetsLoadedFromExperiment,
    loadedDatasets: loadedDatasetsFromExperiment,
  } = useExperiment();
  const { confirmAddData: confirmAddDataFromExperiment } = useConfig();
  const {
    loadMetaDataFromS3: loadMetaDataFromS3FromModule,
    onClickDatasetCard: onClickDatasetCardFromModule,
    SetPath: SetPathFromModule,
    tagFieldConfig: tagFieldConfigFromModule,
    loadedDataset: loadedDatasetFromModule,
    columnsInUse: columnsInUseFromModule,
    renderDataStepsList: renderDataStepsListFromModule,
    updateTagFieldByPath: updateTagFieldByPathFromModule,
    AddMetaData: AddMetaDataFromModule,
    uploadMetadataToS3: uploadMetadataToS3FromModule,
    confirmAddData: confirmAddDataFromModule,
    datasetsLoaded: datasetsLoadedFromModule,
    loadedDatasets: loadedDatasetsFromModule,
  } = useModule();

  const loadedDatasets = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? loadedDatasetsFromExperiment
    : loadedDatasetsFromModule;
  const confirmAddData = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? confirmAddDataFromExperiment
    : confirmAddDataFromModule;
  const datasetsLoaded = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? datasetsLoadedFromExperiment
    : datasetsLoadedFromModule;

  const AddMetaData = oldFlowModules.includes(langgraphState?.determined_module)
    ? AddMetaDataFromExperiment
    : AddMetaDataFromModule;
  const uploadMetadataToS3 = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? uploadMetadataToS3FromExperiment
    : uploadMetadataToS3FromModule;
  const updateTagFieldByPath = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? updateTagFieldByPathFromExperiment
    : updateTagFieldByPathFromModule;

  const tagFieldConfig = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? tagFieldConfigFromExperiment
    : tagFieldConfigFromModule;

  const loadMetaDataFromS3 = async (path, tag, userID) => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      await loadMetaDataFromS3FromExperiment(path, tag, userID);
    } else {
      await loadMetaDataFromS3FromModule(path, tag, userID);
    }
  };
  const onClickDatasetCard = async (tag) => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      await onClickDatasetCardFromExperiment(tag);
    } else {
      await onClickDatasetCardFromModule(tag);
    }
  };
  const setPath = async (path) => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      SetPathFromExperiment(path);
    } else {
      SetPathFromModule(path);
    }
  };
  const loadedDataset = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? loadedDatasetFromExperiment
    : loadedDatasetFromModule;
  const columnsInUse = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? columnsInUseFromExperiment
    : columnsInUseFromModule;
  const renderDataStepsList = oldFlowModules.includes(
    langgraphState?.determined_module
  )
    ? renderDataStepsListFromExperiment
    : renderDataStepsListFromModule;
  const metadata_path = dataInfo?.metadata_path;
  const { mandatory_tags, optional_tags } = tagFieldConfig;
  const array = loadedDataset ? columnsInUse : ["1", "2", "3"];
  const aggValues = ["sum", "mean", "max", "min"];
  const fillNAValues = ["0", "mean", "max", "min"];
  const preFillTags = async () => {
    console.log("[PREFILL] dataInfo: ", dataInfo);
    console.log("[PREFILL] tags: ", dataInfo?.tags);
    const tags = dataInfo?.tags;
    const keys = Object.keys(tags);
    const prefilledSet = new Set();

    keys.forEach(async (key) => {
      const path = `field_tags.${key}`;
      const value = tags[key]["value"];
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        value.length > 0
      ) {
        updateTagFieldByPath(path, value);
        prefilledSet.add(key); // Track which tags were pre-filled
      }
    });

    setPrefilledTags(prefilledSet);
  };

  const handleConfirmTags = async () => {
    console.log("Before Cleaning:", loadedDataset);
    const cleanLoadedData = await cleanLoadedDataset(loadedDataset);

    await AddMetaData(cleanLoadedData);

    await uploadMetadataToS3({
      metaData: cleanLoadedData,
      path: metadata_path,
    });
    setDataTagged(true);
  };

  const handleConfirmData = async () => {
    await confirmAddData(loadedDatasets, datasetsLoaded);
    if (messageId) {
      editMessage(messageId, {
        langgraphState: {
          ...langgraphState,
        },
        next_step: {
          user: "tags_confirmed",
          ai: "context_questions_generator",
        },
        workflow_status: {
          ...langgraphState.workflow_status,
          tags_approved: true,
          data_validator: true,
          data_validated: true,
        },
        next_module: "context_questions_generator",
      });
    }
    const updated_state = {
      ...langgraphState,
      next_step: {
        user: "tags_confirmed",
        ai: "context_questions_generator",
      },
      workflow_status: {
        ...langgraphState.workflow_status,
        tags_approved: true,
        data_validator: true,
        data_validated: true,
      },
      next_module: "context_questions_generator",
    };
    setIsWaitingForAI(true);
    setProcessingStepText("Generating context questions...");
    setDataConfirmed(true);
    sendQuery({query: "", updated_state: updated_state});
  };
  console.log("LanggraphState", langgraphState);
  const currentDataTag = Object.keys(langgraphState?.data)[0];
  console.log("currentDataTag", currentDataTag);

  const onRenderDataTagger = async () => {
    await onClickDatasetCard(currentDataTag);

    await loadMetaDataFromS3(metadata_path, currentDataTag, userInfo.userID);
    setPath(metadata_path);
    await preFillTags();
    setOpenDataTagger(true);
  };

  useEffect(() => {
    onRenderDataTagger();
  }, []);

  // Auto-collapse when data is tagged (but keep expanded initially)
  useEffect(() => {
    if (dataTagged) {
      setIsExpanded(false);
    }
    // Don't force expansion here - let the initial state handle it
  }, [dataTagged]);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const renderTagLabelWithInfo = (tag) => {
    if (!tag.showLabel) return null;

    // Check if this tag was pre-filled
    const isPrefilled = prefilledTags.has(
      tag.path?.replace("field_tags.", "") ||
        tag.label?.toLowerCase().replace(/\s+/g, "_")
    );

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
            gap: 0.5,
          }}
        >
          {tag.label}
          {isPrefilled && (
            <Tooltip title="Auto-filled by AI" arrow placement="top">
              <AutoAwesomeIcon
                sx={{
                  fontSize: 14,
                  color: "#10b981",
                  ml: 0.5,
                }}
              />
            </Tooltip>
          )}
        </Typography>
        <InfoTooltip infoTooltip={tag.infoTooltip} docLink={tag.docLink} />
      </div>
    );
  };

  return (
    <>
      {openDataTagger && (
        <Box
          sx={{
            mt: 1,
            overflow: "hidden",
            borderRadius: "12px",
            background: "#ffffff",
          }}
        >
          {/* Collapsible Header */}
          <Box
            sx={{
              p: 2,
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(16, 185, 129, 0.05)",
              },
            }}
            onClick={toggleExpansion}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CheckCircleIcon
                  sx={{
                    color: dataTagged ? "#10b981" : "#6b7280",
                    fontSize: 20,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                    fontFamily: "Inter",
                  }}
                >
                  Data Tagging Configuration
                </Typography>
                {dataTagged && (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      backgroundColor: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#10b981", fontSize: 14 }} />
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#065f46",
                        fontWeight: 500,
                        fontFamily: "Inter",
                      }}
                    >
                      Tags Confirmed
                    </Typography>
                  </Box>
                )}
              </Box>
              <IconButton
                size="small"
                sx={{
                  color: "#6b7280",
                  "&:hover": {
                    backgroundColor: "rgba(107, 114, 128, 0.1)",
                  },
                }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Collapsible Content */}
          <Collapse in={isExpanded}>
            <Box sx={{ p: 3 }}>
              <Stack gap="24px">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <Typography sx={subHeadingStyle}>Mandatory Tag</Typography>
                  </Grid>
                  {mandatory_tags.map((tag, id) => {
                    const haveSpace =
                      mandatory_tags.length % 2 !== 0 &&
                      id === mandatory_tags.length - 1;
                    const isDateFormat = tag.label === "Date Format";
                    const isPrefilled = prefilledTags.has(
                      tag.path?.replace("field_tags.", "") ||
                        tag.label?.toLowerCase().replace(/\s+/g, "_")
                    );
                    return (
                      <Grid
                        item
                        xs={tag.xs}
                        md={haveSpace ? 12 : tag.md}
                        key={id}
                      >
                        {renderTagLabelWithInfo(tag)}
                        <Box
                          sx={{
                            position: "relative",
                            "& .MuiOutlinedInput-root": isPrefilled
                              ? {
                                  backgroundColor: "#f0fdf4",
                                  borderColor: "#10b981",
                                  "&:hover": {
                                    borderColor: "#059669",
                                  },
                                  "&.Mui-focused": {
                                    borderColor: "#059669",
                                    boxShadow:
                                      "0 0 0 2px rgba(16, 185, 129, 0.2)",
                                  },
                                }
                              : {},
                          }}
                        >
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
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
                {optional_tags.length > 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <Typography sx={subHeadingStyle}>
                        Optional Tags
                      </Typography>
                    </Grid>
                    {optional_tags.map((tag, id) => {
                      const haveSpace =
                        optional_tags.length % 2 !== 0 &&
                        id === optional_tags.length - 1;
                      const isDateFormat = tag.label === "Date Format";
                      const isPrefilled = prefilledTags.has(
                        tag.path?.replace("field_tags.", "") ||
                          tag.label?.toLowerCase().replace(/\s+/g, "_")
                      );
                      return (
                        <Grid
                          item
                          xs={tag.xs}
                          md={haveSpace ? 12 : tag.md}
                          key={id}
                        >
                          {renderTagLabelWithInfo(tag)}
                          <Box
                            sx={{
                              position: "relative",
                              "& .MuiOutlinedInput-root": isPrefilled
                                ? {
                                    backgroundColor: "#f0fdf4",
                                    borderColor: "#10b981",
                                    "&:hover": {
                                      borderColor: "#059669",
                                    },
                                    "&.Mui-focused": {
                                      borderColor: "#059669",
                                      boxShadow:
                                        "0 0 0 2px rgba(16, 185, 129, 0.2)",
                                    },
                                  }
                                : {},
                            }}
                          >
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
                          </Box>
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
                      <Typography
                        sx={{ paddingLeft: "40px", ...styles.mainTypo }}
                      >
                        Label
                      </Typography>
                    </Grid>

                    {renderDataStepsList.map((item, id) => {
                      return (
                        <React.Fragment key={id}>
                          <Grid item xs={12} md={12 / 5}>
                            <Typography sx={styles.mainTypo}>
                              {item.label}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={12 / 5}>
                            <CustomAutocomplete disabled values={array} />
                          </Grid>
                          <Grid item xs={12} md={12 / 5}>
                            <CustomAutocomplete
                              path={item.aggregate_path}
                              disabled={item.aggregate_disabled}
                              values={aggValues}
                              target="tag"
                              formatLabel={false}
                            />
                          </Grid>
                          <Grid item xs={12} md={12 / 5}>
                            <CustomAutocomplete
                              path={item.fillNa_path}
                              disabled={item.fillNa_disabled}
                              values={fillNAValues}
                              target="tag"
                              formatLabel={false}
                            />
                          </Grid>
                          <Grid item xs={12} md={12 / 5}>
                            <Typography
                              sx={{ paddingLeft: "40px", ...styles.mainTypo }}
                            >
                              {item.tag}
                            </Typography>
                          </Grid>
                        </React.Fragment>
                      );
                    })}
                  </Grid>
                ) : null}
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  {!dataTagged && (
                    <CustomButton
                    disabled={creditScore <= 0}
                      onClick={handleConfirmTags}
                      title="Confirm Tags"
                    />
                  )}
                </Stack>
              </Stack>
            </Box>
          </Collapse>

          {/* Show only Confirm Data button when collapsed and data is tagged */}
          {!isExpanded && dataTagged && !dataConfirmed && (
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <CustomButton
                disabled={creditScore <=  0}
                  onClick={handleConfirmData}
                  title="Confirm Data"
                />
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </>
  );
};

export default DataTaggerSection;
