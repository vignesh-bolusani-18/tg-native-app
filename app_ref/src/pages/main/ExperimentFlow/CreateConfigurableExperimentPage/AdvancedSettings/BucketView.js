import React, { useEffect } from "react";
import useConfig from "../../../../../hooks/useConfig";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import CustomTooltip from "../../../../../components/CustomToolTip";
import CustomButton from "./../../../../../components/CustomButton";
import CustomScrollbar from "../../../../../components/CustomScrollbar";
import { useState } from "react";
import FeatureGroupDialog from "./FeatureGroupDialog";
import EditIcon from "@mui/icons-material/Edit";
import { useLocation } from "react-router-dom";
import HyperParamsDialog from "./HyperParamDialog";
import DeepHyperParamsDialog from "./DeepHyperParamsDialog";
import useModule from "../../../../../hooks/useModule";

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
};

const titleStyleCompleted = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#027A48",
  textAlign: "left",
};
const titleStylePurple = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#53389E",
  textAlign: "left",
};

const contentStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  color: "#626F86",
  textAlign: "left",
  whiteSpace: "pre-line",
};

const NewBoxComponent = ({
  title = "Dummy Title",
  description,
  featureGroup,
  onClickFeatureGroup,
  currentFeatureGroup,
}) => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        boxShadow:
          featureGroup === currentFeatureGroup
            ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
            : "0px 4px 8px rgba(0, 0, 0, 0.1)",
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
      onClick={() => onClickFeatureGroup(featureGroup)}
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
            borderColor:
              featureGroup === currentFeatureGroup ? "#D6BBFB" : "#EAECF0",
            borderRadius: "8px 8px 0px 0px",
            padding: "16px 20px 16px 16px",
            backgroundColor:
              featureGroup === currentFeatureGroup ? "#F9F5FF" : "#FFFFFF",
          }}
        >
          <Stack alignItems={"center"} spacing={1} direction={"row"}>
            <Typography
              sx={
                featureGroup === currentFeatureGroup
                  ? titleStylePurple
                  : titleStyle
              }
            >
              {title}
            </Typography>
          </Stack>
        </Stack>
        <Stack p={2}>
          <Typography sx={contentStyle}>{description}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

const NewFilledBoxComponent = ({
  title = "dummy Title",
  description,
  featureGroup,
  currentFeatureGroup,
  bucket,
  onEdit,
  onRestore,
  arrayName,
}) => {
  const {
    getDataByArrayName,
    removeExogenousFeatureByIndex,
    removePlannerAdjustmentByIndex,
    removeEnrichmentByIndex,
    exogenous_features,
    operations,
    enrichment_bydate,
  } = useModule();
  const data =
    arrayName === "exogenous_features"
      ? exogenous_features
      : arrayName === "operations"
      ? operations
      : enrichment_bydate;
  console.log("arrayName " + arrayName);
  console.log("arraydata " + data);
  function formatDate(inputDate) {
    // Parse the input string as a Date object
    const date = new Date(inputDate);

    // Specify options for formatting
    const options = { year: "numeric", month: "long", day: "2-digit" };

    // Format the date as "MMMM, dd, yyyy"
    return date.toLocaleDateString("en-US", options);
  }
  const renderContent = () => {
    if (data.length === 0) {
      return <Typography sx={contentStyle}>{description}</Typography>;
    }

    switch (arrayName) {
      case "exogenous_features":
        return (
          <Stack direction="row" spacing={2} sx={{ overflowX: "auto" }}>
            {data.map((feature, index) => (
              <CustomTooltip
                key={index}
                arrow
                title={
                  <Stack direction="row" spacing={0.5}>
                    <Stack spacing={0.5}>
                      {feature.start_dt.map((dt, i) => (
                        <Typography
                          key={i}
                          sx={{ overflow: "hidden", whiteSpace: "nowrap" }}
                        >
                          {formatDate(dt)}
                        </Typography>
                      ))}
                    </Stack>
                    <Stack spacing={0.5}>
                      {feature.start_dt.map((_, i) => (
                        <Typography key={i}> - </Typography>
                      ))}
                    </Stack>
                    <Stack spacing={0.5}>
                      {feature.end_dt.map((dt, i) => (
                        <Typography
                          key={i}
                          sx={{ overflow: "hidden", whiteSpace: "nowrap" }}
                        >
                          {formatDate(dt)}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                }
              >
                <Chip
                  label={feature.new_column}
                  onDelete={() => removeExogenousFeatureByIndex(index)}
                />
              </CustomTooltip>
            ))}
          </Stack>
        );
      case "operations":
        return (
          <CustomScrollbar padding="2px">
            <Stack direction="row" spacing={2} sx={{ overflowX: "auto" }}>
              {data
                .filter((operation) => operation.operation === "adjust_data")
                .map((adjustment, index) => (
                  <CustomTooltip
                    key={index}
                    arrow
                    title={
                      <Stack spacing={0.5}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Typography>
                            {formatDate(adjustment.kwargs.date_range[0])}
                          </Typography>
                          <Typography>-</Typography>
                          <Typography>
                            {formatDate(adjustment.kwargs.date_range[1])}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          {adjustment.kwargs.adjustment_type === "uplift" ? (
                            <>
                              <Typography>
                                {adjustment.kwargs.adjustment_type}
                              </Typography>
                              <Typography>by</Typography>
                              <Typography>
                                {adjustment.kwargs.adjustment_value}
                              </Typography>{" "}
                            </>
                          ) : (
                            <>
                              <Typography>replaced by</Typography>
                              <Typography>
                                {adjustment.kwargs.adjustment_type}
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    }
                  >
                    <Chip
                      label={
                        adjustment.kwargs.dimension === "None"
                          ? "All"
                          : `${adjustment.kwargs.dimension} - ${adjustment.kwargs.value}`
                      }
                      onDelete={() => removePlannerAdjustmentByIndex(index + 1)}
                    />
                  </CustomTooltip>
                ))}
            </Stack>
          </CustomScrollbar>
        );
      case "enrichment_bydate":
        return (
          <Stack direction="row" spacing={2} sx={{ overflowX: "auto" }}>
            {data.map((enrichment, index) => (
              <CustomTooltip
                key={index}
                arrow
                title={
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography>
                        {formatDate(enrichment.date_range[0])}
                      </Typography>
                      <Typography>-</Typography>
                      <Typography>
                        {formatDate(enrichment.date_range[1])}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {enrichment.enrichment_type === "uplift" ? (
                        <>
                          <Typography>{enrichment.enrichment_type}</Typography>
                          <Typography>by</Typography>
                          <Typography>
                            {enrichment.enrichment_value}
                          </Typography>{" "}
                        </>
                      ) : (
                        <>
                          <Typography>replaced by</Typography>
                          <Typography>{enrichment.enrichment_type}</Typography>
                        </>
                      )}
                    </Stack>
                  </Stack>
                }
              >
                <Chip
                  label={
                    enrichment.dimension === "None"
                      ? "All"
                      : `${enrichment.dimension} - ${enrichment.value}`
                  }
                  onDelete={() => removeEnrichmentByIndex(index)}
                />
              </CustomTooltip>
            ))}
          </Stack>
        );
      default:
        return <Typography sx={contentStyle}>{description}</Typography>;
    }
  };
  return (
    <Card
      sx={{
        // cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        boxShadow:
          featureGroup === currentFeatureGroup
            ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
            : "0px 4px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#FFFFFF",
        height: "100%",
        "& .MuiCard-root": {
          padding: 0,
        },
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
          transition: "all 0.3s ease-in-out",
        },
      }}
      onClick={() => {
        onEdit(featureGroup);
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
          sx={{
            border: "1px solid #A6F4C5",
            borderRadius: "8px 8px 0px 0px",
            padding: "16px 20px 16px 16px",
            background: "#ECFDF3",
          }}
        >
          <Typography sx={titleStyleCompleted}>{title}</Typography>
          <Stack direction={"row"} spacing={1}>
            {["APA", "AEF", "APE"].includes(featureGroup) && (
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  onRestore(featureGroup);
                }}
                sx={{ padding: "0px" }}
              >
                <RestoreIcon fontSize="small" style={{ color: "#626F86" }} />
              </IconButton>
            )}

            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                onEdit(featureGroup);
              }}
              sx={{ padding: "0px" }}
            >
              <EditIcon fontSize="small" style={{ color: "#626F86" }} />
            </IconButton>
          </Stack>
        </Stack>
        <Box
          padding="16px"
          borderRadius="0px 0px 8px 8px"
          borderTop="none"
          borderBottom="none"
          paddingBottom="0px"
        >
          {renderContent()}
        </Box>
      </CardContent>
    </Card>
  );
};

const BucketView = ({ bucket, refresh, onRestore, setRefresh }) => {
  const {
    advanceSettingBuckets,
    currentAdvanceSettingBucket,
    advanceSettingBucketsFilledFlags,
    currentFeatureGroup,
    contextConfig,
    setFeatureGroup,
    resetAdvanceSettingToDefault,
    configState,
  } = useModule();

  const [isHyperParams, setIsHyperParams] = useState(false);
  const [isDeepHyperParams, setIsDeepHyperParams] = useState(false);
  // const [refresh, setRefresh] = useState(false);

  // Trigger re-render when restoreToDefault is called

  useEffect(() => {
    console.log("Context Config Changed");
  }, [contextConfig, refresh]);

  const [featureGroupOpen, setFeatureGroupOpen] = useState(false);
  const handleFeatureGroupOpen = () => setFeatureGroupOpen(true);
  const handleFeatureGroupClose = () => setFeatureGroupOpen(false);

  const handleFeatureGroupRestore = (featureGroup) => {
    console.log("bucket " + bucket);
    console.log("featureGroup " + featureGroup);
    console.log(
      "advanceSettingBuckets[bucket] " + advanceSettingBuckets[bucket]
    );
    console.log(
      "advanceSettingBuckets[bucket].featureGroups[currentFeatureGroup] " +
        advanceSettingBuckets[bucket].featureGroups[currentFeatureGroup]
    );
    resetAdvanceSettingToDefault(
      advanceSettingBuckets[bucket].featureGroups[currentFeatureGroup],
      featureGroup
    );

    setRefresh((prev) => !prev); // Toggle refresh state to force re-render
  };

  useEffect(() => {
    setIsHyperParams(advanceSettingBuckets[bucket]?.isHyperParamTab);
  }, [bucket]);
  useEffect(() => {
    setIsDeepHyperParams(
      advanceSettingBuckets[bucket].featureGroups[currentFeatureGroup]
        ?.isDeepHyperParams
    );
  }, [currentFeatureGroup, bucket]);

  console.log(
    "isHyperParam " +
      configState?.training?.model_names +
      " " +
      configState?.training?.model_names.includes(
        advanceSettingBuckets[bucket].featureGroups[currentFeatureGroup]?.title
      )
  );
  const location = useLocation();
  const paramsLength = location.pathname.split("/").length;
  const currentLastParam = location.pathname.split("/")[paramsLength - 1];

  console.log(
    "featuregroups " +
      JSON.stringify(
        advanceSettingBuckets[bucket].featureGroups[currentFeatureGroup]?.title
      )
  );

  return (
    <Box>
      {/* <Divider /> */}
      <Grid container spacing={2} padding="12px 16px 12px 16px">
        {Object.keys(advanceSettingBuckets[bucket].featureGroups).map(
          (featureGroup) => {
            const showComponent =
              (isHyperParams &&
                configState?.training?.model_names?.includes(
                  advanceSettingBuckets[bucket].featureGroups[featureGroup]
                    ?.title
                )) ||
              !isHyperParams;

            return showComponent ? (
              <Grid
                item
                xs={12}
                md={
                  Object.keys(advanceSettingBuckets[bucket].featureGroups)
                    .length > 3
                    ? 6
                    : 12 /
                      Object.keys(advanceSettingBuckets[bucket].featureGroups)
                        .length
                }
                key={featureGroup}
              >
                {!advanceSettingBucketsFilledFlags[featureGroup] ? (
                  <NewBoxComponent
                    title={
                      advanceSettingBuckets[bucket].featureGroups[featureGroup]
                        ?.title
                    }
                    description={
                      advanceSettingBuckets[bucket].featureGroups[featureGroup]
                        .description
                    }
                    featureGroup={featureGroup}
                    currentFeatureGroup={currentFeatureGroup}
                    onClickFeatureGroup={async (featureGroup) => {
                      await setFeatureGroup(featureGroup);
                      handleFeatureGroupOpen();
                    }}
                  />
                ) : (
                  <NewFilledBoxComponent
                    title={
                      advanceSettingBuckets[bucket].featureGroups[featureGroup]
                        .title
                    }
                    description={
                      advanceSettingBuckets[bucket].featureGroups[featureGroup]
                        .description
                    }
                    bucket={bucket}
                    currentFeatureGroup={currentFeatureGroup}
                    featureGroup={featureGroup}
                    onEdit={async (featureGroup) => {
                      await setFeatureGroup(featureGroup);
                      handleFeatureGroupOpen();
                    }}
                    onRestore={(featureGroup) => {
                      handleFeatureGroupRestore(featureGroup);
                    }}
                    arrayName={
                      advanceSettingBuckets[bucket].featureGroups[featureGroup]
                        .arrayName
                    }
                  />
                )}
              </Grid>
            ) : null;
          }
        )}
      </Grid>
      {/* <Stack
        direction={"row"}
        justifyContent={"flex-end"}
        spacing={1}
        padding={"12px 16px 12px 16px"}
      >
        <CustomButton
          title="Restore"
          outlined
          onClick={() => {
            onRestore();
          }}
        />
        <CustomButton
          title="Confirm"
          onClick={() => {
            confirmContextGroup(bucket);
          }}
          disabled={bucket === "FC" ? !advanceSettingBucketsFilledFlags["FD"] : false}
        />
      </Stack> */}
      {featureGroupOpen && currentFeatureGroup !== "None" && (
        <>
          {isHyperParams ? (
            currentFeatureGroup === "MLP" ||
            currentFeatureGroup === "LSTM" ||
            currentFeatureGroup === "GRU" ? (
              <DeepHyperParamsDialog
                open={featureGroupOpen}
                handleClose={handleFeatureGroupClose}
                bucket={currentAdvanceSettingBucket}
                featureGroup={currentFeatureGroup}
                refresh={refresh}
                onRestore={() => handleFeatureGroupRestore(currentFeatureGroup)}
              />
            ) : (
              <HyperParamsDialog
                open={featureGroupOpen}
                handleClose={handleFeatureGroupClose}
                bucket={currentAdvanceSettingBucket}
                featureGroup={currentFeatureGroup}
                refresh={refresh}
                onRestore={() => handleFeatureGroupRestore(currentFeatureGroup)}
              />
            )
          ) : (
            <FeatureGroupDialog
              open={featureGroupOpen}
              handleClose={handleFeatureGroupClose}
              bucket={currentAdvanceSettingBucket}
              featureGroup={currentFeatureGroup}
              refresh={refresh}
              onRestore={() => handleFeatureGroupRestore(currentFeatureGroup)}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default BucketView;
