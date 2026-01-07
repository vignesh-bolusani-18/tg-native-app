import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { ReactComponent as PlusIcon } from "../../../../../assets/Icons/Plus_Icon.svg";
import { ReactComponent as EditIcon } from "../../../../../assets/Icons/edit-3.svg";
import { ReactComponent as Tick } from "../../../../../assets/Icons/tick.svg";
import MLAdvancedSettings from "./MLAdvancedSettings";
import Addplanner from "./Addplanner";
import ExogenousFeatures from "./ExogenousFeature";
import PlannerEnrichments from "./PlannerEnrichments";

import { fill } from "lodash";
import { addExogenousFeature } from "../../../../../redux/slices/configSlice";
import CustomTooltip from "../../../../../components/CustomToolTip";
import CustomScrollbar from "../../../../../components/CustomScrollbar";
import useAuth from "../../../../../hooks/useAuth";
import ContactSalesDialog from "../../../../../components/ContactSalesDialog";
import useModule from "../../../../../hooks/useModule";

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
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
const boxContent = [
  {
    id: 1,
    title: "ML Advanced Settings Edit",
    description:
      "Advanced model parameters like model selection and feature selection",
  },
  {
    id: 2,
    title: "Add Planner Adjustments",
    description: "Create features to adjust historical data gaps",
  },
  {
    id: 3,
    title: "Add Exogenous Features",
    description: "Create features related to any promotion or events",
  },
  {
    id: 4,
    title: "Add Planner Enrichment",
    description:
      "Create features to enrich forecasts based on external factors",
  },
];

function formatDate(inputDate) {
  // Parse the input string as a Date object
  const date = new Date(inputDate);

  // Specify options for formatting
  const options = { year: "numeric", month: "long", day: "2-digit" };

  // Format the date as "MMMM, dd, yyyy"
  return date.toLocaleDateString("en-US", options);
}

const BoxComponent = ({ title, description, onClick }) => {
  const [selected, setSelected] = React.useState(false);
  const {
    exogenous_features,
    removeExogenousFeatureByIndex,
    operations,
    enrichment_bydate,
    removeEnrichmentByIndex,
    removePlannerAdjustmentByIndex,
  } = useModule();

  let filled;
  const {
    isMLSettingsDone,
    isExogenousFeatureAdded,
    isPlannerAdjustmentAdded,
    isPlannerEnrichmentAdded,
  } = useModule();
  switch (title) {
    case "ML Advanced Settings Edit":
      filled = isMLSettingsDone;
      break;
    case "Add Planner Adjustments":
      filled = isPlannerAdjustmentAdded;
      break;
    case "Add Exogenous Features":
      filled = isExogenousFeatureAdded;
      break;
    case "Add Planner Enrichment":
      filled = isPlannerEnrichmentAdded;
      break;
    default:
      filled = false;
      break;
  }
  return (
    <Card
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        boxShadow: "none",
        backgroundColor: "#FFFFFF",
        height: "100%",
        "& .MuiCard-root": {
          padding: 0, // Change default padding
        },
        boxShadow: selected ? "0px 4px 8px rgba(0, 0, 0, 0.1)" : "none",
        "&:hover": {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
          transition: "all 0.3s ease-in-out",
        },
      }}
      onClick={() => {
        onClick();
      }}
    >
      <CardContent
        sx={{
          padding: "0px",
        }}
      >
        <Box
          borderRadius="8px 8px 0px 0px"
          padding="16px 20px"
          sx={{
            // border: "1px solid #EAECF0",
            backgroundColor: filled ? "#ECFDF3" : "#FFFFFF",
            borderColor: filled ? "#A6F4C5" : "#EAECF0",
            borderLeft: filled ? "1px solid #A6F4C5" : "none",
            borderRight: filled ? "1px solid #A6F4C5" : "none",
            borderTop: filled ? "1px solid #A6F4C5" : "none",
            borderBottom: filled ? "1px solid #A6F4C5" : "1px solid #EAECF0",
          }}
        >
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Stack spacing={2} direction="row" alignItems="center">
              <Box
                sx={{
                  backgroundColor: "#F4EBFF",
                  border: "4px solid #F9F5FF",
                  borderRadius: "50%", // Make the box a complete circle
                  width: "32px", // Ensure width and height are equal to make a circle
                  height: "32px", // Ensure width and height are equal to make a circle
                  display: "flex", // Use flexbox for centering
                  alignItems: "center", // Center vertically
                  justifyContent: "center", // Center horizontally
                }}
              >
                {filled ? <EditIcon /> : <PlusIcon />}
              </Box>
              <Typography sx={{ titleStyle }}>{title}</Typography>
            </Stack>
            <Box
              sx={{
                backgroundColor: filled ? "#039855" : "transparent",
                border: "1px solid",
                borderColor: filled ? "#32D583" : "#D0D5DD",
                borderRadius: "50%", // Make the box a complete circle
                width: "16px", // Ensure width and height are equal to make a circle
                height: "16px", // Ensure width and height are equal to make a circle
                display: "flex", // Use flexbox for centering
                alignItems: "center", // Center vertically
                justifyContent: "center", // Center horizontally
              }}
            >
              {filled ? <Tick /> : null}
            </Box>
          </Stack>
        </Box>
        <Box
          padding="16px"
          // border="1px solid #EAECF0"
          borderRadius="0px 0px 8px 8px"
          borderTop={"none"}
          borderBottom={"none"}
          paddingBottom={"0px"}
        >
          {title === "Add Exogenous Features" ? (
            exogenous_features.length > 0 ? (
              <Stack direction={"row"} spacing={1}>
                {exogenous_features.map((feature, index) => {
                  return (
                    <CustomTooltip
                      arrow
                      title={
                        <Stack direction={"row"} spacing={0.5}>
                          <Stack spacing={0.5}>
                            {feature.start_dt.map((dt) => (
                              <Typography
                                sx={{
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatDate(dt)}
                              </Typography>
                            ))}
                          </Stack>
                          <Stack spacing={0.5}>
                            {feature.start_dt.map((dt) => (
                              <Typography> - </Typography>
                            ))}
                          </Stack>
                          <Stack spacing={0.5}>
                            {feature.end_dt.map((dt) => (
                              <Typography
                                sx={{
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                }}
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
                        onDelete={() => {
                          removeExogenousFeatureByIndex(index);
                        }}
                      />
                    </CustomTooltip>
                  );
                })}
              </Stack>
            ) : (
              <Typography sx={contentStyle}>{description}</Typography>
            )
          ) : title === "Add Planner Adjustments" ? (
            operations.filter(
              (operation) => operation.operation === "adjust_data"
            ).length > 0 ? (
              <CustomScrollbar padding={"2px"}>
                <Stack
                  direction={"row"}
                  spacing={1}
                  sx={{
                    overflowX: "auto", // Enable horizontal scrolling
                    whiteSpace: "nowrap", // Prevent items from wrapping to the next line
                    maxWidth: "100%", // Optional: ensures the stack does not exceed its container
                  }}
                >
                  {operations
                    .filter(
                      (operation) => operation.operation === "adjust_data"
                    )
                    .map((adjustment, index) => {
                      return (
                        <CustomTooltip
                          arrow
                          title={
                            <Stack spacing={0.5}>
                              <Stack
                                direction={"row"}
                                spacing={0.5}
                                alignItems={"center"}
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
                                direction={"row"}
                                spacing={0.5}
                                alignItems={"center"}
                              >
                                <Typography>
                                  {adjustment.kwargs.adjustment_type}
                                </Typography>
                                <Typography>by</Typography>
                                <Typography>
                                  {adjustment.kwargs.adjustment_value}
                                </Typography>
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
                            onDelete={() => {
                              removePlannerAdjustmentByIndex(index + 1);
                            }}
                          />
                        </CustomTooltip>
                      );
                    })}
                </Stack>
              </CustomScrollbar>
            ) : (
              <Typography sx={contentStyle}>{description}</Typography>
            )
          ) : title === "Add Planner Enrichment" ? (
            enrichment_bydate.length > 0 ? (
              <Stack direction={"row"} spacing={1}>
                {enrichment_bydate.map((enrichment, index) => {
                  return (
                    <CustomTooltip
                      arrow
                      title={
                        <Stack spacing={0.5}>
                          <Stack
                            direction={"row"}
                            spacing={0.5}
                            alignItems={"center"}
                          >
                            <Typography>
                              {formatDate(enrichment.date_range[0])}
                            </Typography>
                            <Typography>-</Typography>
                            <Typography>
                              {formatDate(enrichment.date_range[1])}
                            </Typography>
                          </Stack>
                          <Stack
                            direction={"row"}
                            spacing={0.5}
                            alignItems={"center"}
                          >
                            <Typography>
                              {enrichment.enrichment_type}
                            </Typography>
                            <Typography>by</Typography>
                            <Typography>
                              {enrichment.enrichment_value}
                            </Typography>
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
                        onDelete={() => {
                          removeEnrichmentByIndex(index);
                        }}
                      />
                    </CustomTooltip>
                  );
                })}
              </Stack>
            ) : (
              <Typography sx={contentStyle}>{description}</Typography>
            )
          ) : (
            <Typography sx={contentStyle}>{description}</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const AdvancedSettings = () => {
  const [selectedId, setSelectedId] = React.useState(0);

  const [MLSettingsOpen, setMLSettingsOpen] = useState(false);
  const [AddplannerOpen, setAddplannerOpen] = useState(false);
  const [ExogenousOpen, setExogenousOpen] = useState(false);
  const [PlannerEnrichmentsOpen, setPlannerEnrichmentsOpen] = useState(false);
  const {
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();
  const handleMLSettingsOpen = () => {
    setMLSettingsOpen(true);
  };
  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const handleAddplannerOpen = () => {
    setAddplannerOpen(true);
  };
  const handleExogenousOpen = () => {
    setExogenousOpen(true);
  };
  const handlePlannerEnrichmentsOpen = () => {
    setPlannerEnrichmentsOpen(true);
  };

  const handleMLSettingsClose = () => {
    setMLSettingsOpen(false);
  };
  const handleExogenousClose = () => {
    setExogenousOpen(false);
  };
  const handleAddplannerClose = () => {
    setAddplannerOpen(false);
  };
  const handlePlannerEnrichmentsClose = () => {
    setPlannerEnrichmentsOpen(false);
  };

  return (
    <Box
      sx={{
        paddingLeft: "16px",
        paddingBottom: "16px",
      }}
    >
      <Grid container spacing={3}>
        {boxContent.map((box) => {
          return (
            <Grid item xs={12} md={5.9} key={box.id}>
              <BoxComponent
                title={box.title}
                description={box.description}
                id={box.id}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onClick={() => {
                  switch (box.title) {
                    case "ML Advanced Settings Edit":
                      if (currentCompany.ml_advanced_settings) {
                        handleMLSettingsOpen();
                      } else {
                        setIsContactSalesDialogOpen(true); // Directly call the function
                      }
                      break;
                    case "Add Planner Adjustments":
                      handleAddplannerOpen();
                      break;
                    case "Add Exogenous Features":
                      handleExogenousOpen();
                      break;
                    case "Add Planner Enrichment":
                      handlePlannerEnrichmentsOpen();
                      break;
                    default:
                      // Default case
                      break;
                  }
                }}
              />
            </Grid>
          );
        })}
      </Grid>
      <ContactSalesDialog
        open={isContactSalesDialogOpen}
        handleClose={() => setIsContactSalesDialogOpen(false)}
        handleConfirm={handleContactSales}
        WarningText="Upgrade Your Subscription"
        ResultText="Upgrade your subscription or contact sales for more access."
        ConfirmButtonTitle="Contact Sales"
      />
      {MLSettingsOpen && (
        <MLAdvancedSettings
          open={MLSettingsOpen}
          handleClose={handleMLSettingsClose}
        />
      )}
      {AddplannerOpen && (
        <Addplanner open={AddplannerOpen} handleClose={handleAddplannerClose} />
      )}
      {ExogenousOpen && (
        <ExogenousFeatures
          open={ExogenousOpen}
          handleClose={handleExogenousClose}
        />
      )}
      {PlannerEnrichmentsOpen && (
        <PlannerEnrichments
          open={PlannerEnrichmentsOpen}
          handleClose={handlePlannerEnrichmentsClose}
        />
      )}
    </Box>
  );
};

export default AdvancedSettings;
