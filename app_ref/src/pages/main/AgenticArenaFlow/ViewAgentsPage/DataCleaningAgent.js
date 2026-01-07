import { AddOutlined } from "@mui/icons-material";
import { Box, Button, Grid, Stack, Tab, Typography } from "@mui/material";

import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import React, { useContext } from "react";
import { useState } from "react";
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter";
import CustomCheck from "../../../../components/CustomInputControls/CustomCheck";
import AddPlannerEnrichments from "./AddPlannerEnrichments";
import useDashboard from "../../../../hooks/useDashboard";
import NewAddContext from "../../ExperimentFlow/CreateExperimentPage/AddContext/NewAddContext";
import CustomButton from "../../../../components/CustomButton";
import useConfig from "../../../../hooks/useConfig";
import useAuth from "../../../../hooks/useAuth";
import AdvancedSettings from "../../ExperimentFlow/CreateExperimentPage/AdvancedSettings";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import AddData from "../../ExperimentFlow/CreateExperimentPage/AddData";
import { ThemeContext } from "../../../../theme/config/ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";
import useExperiment from "../../../../hooks/useExperiment";
import NewAdvanceSettings from "../../ExperimentFlow/CreateExperimentPage/AdvancedSettings/NewAdvanceSettings";
import HistoricalAdjustment from "./HistoricalAdjustment/HistoricalAdjustment";

const btnText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
};

const subHeadingStyle = {
  color: "#475467",
  fontFamily: "Inter",
  fontWeight: "500",
  fontSize: "14px",
  lineHeight: "20px",
  // marginBottom: "6px",
};

const DataCleaningAgent = () => {
  const [selectedValues, setSelectedValues] = React.useState("");
  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];

  const [selectedValuesMulti, setSelectedValuesMulti] = React.useState({});
  const Multioptions = ["Option 1", "Option 2", "Option 3", "Option 4"];

  const [count, setCount] = useState(0); // Initial count value
  const maxRange = 10; // Maximum allowed count value
  const minRange = 0; // Minimum allowed count value

  const [ans2, setAns2] = useState(true);

  const [addPlannerEnrichmentsOpen, setAddPlannerEnrichmentsOpen] =
    React.useState(false);

  const handleAddPlannerEnrichmentsOpen = () => {
    setAddPlannerEnrichmentsOpen(true);
  };
  const handleAddPlannerEnrichmentsClose = () => {
    setAddPlannerEnrichmentsOpen(false);
  };

  // const [tabValue, setTabValue] = useState("1");
  const { tabValue, setTabValue } = useExperiment();
  const [isExperimentNameFilled, setIsExperimentNameFilled] = useState(false);
  const navigate = useNavigate();

  const {
    configState,
    uploadConfigToS3,
    confirmAddData,
    updateConfigFieldByPath,
    confirmAddContext,
    confirmAdvancedSettings,
    confirmPlannerCoding,
  } = useConfig();
  const { userInfo, currentCompany } = useAuth();

  const {
    loadedDatasets,
    isMandatoryDataAdded,
    discardExperiment,
    joinsAdded,
    needToJoin,
    datasetsLoaded,
  } = useExperiment();
  const location = useLocation();
  const paramsLength = location.pathname.split("/").length;
  const currentModule = location.pathname.split("/")[paramsLength - 1];
  const currentLastParam = location.pathname.split("/")[paramsLength - 1];


  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePrevTab = () => {
    setTabValue((parseInt(tabValue) - 1).toString());
  };

  const handleNextTab = async () => {
    
    await confirmPlannerCoding(loadedDatasets);
    await confirmAddContext(loadedDatasets);
    setTabValue((parseInt(tabValue) + 1).toString());
  };

  const { theme } = useContext(ThemeContext);

  return (
    <Stack sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
     {/*  <TabContext value={tabValue}>
        <Box padding="12px 16px 12px 16px">
          <TabList
            onChange={handleChange}
            aria-label="create experiment tablist"
          >
            <Tab
              label="Planner Coding"
              value="0"
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "left",
                textTransform: "none",
                "&.Mui-selected": {
                  color: theme.palette.button.textOnHover, // Color for selected tab
                  borderBottom: "2px solid #0C66E4",
                },
              }}
              disabled={tabValue !== "0"}
            />
            <Tab
              label="Add Context"
              value="1"
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "left",
                textTransform: "none",
                "&.Mui-selected": {
                  color: theme.palette.button.textOnHover, // Color for selected tab
                  borderBottom: "2px solid #0C66E4",
                },
              }}
              disabled={tabValue !== "1"}
            />
            <Tab
              label="Advanced Settings"
              value="2"
              sx={{
                color: "#667085",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "20px",
                textAlign: "left",
                textTransform: "none",
                "&.Mui-selected": {
                  color: theme.palette.button.textOnHover, // Color for selected tab
                  borderBottom: "2px solid #0C66E4",
                },
              }}
              disabled={tabValue !== "2"}
            />
          </TabList>
        </Box>

        <TabPanel sx={{ padding: "24px 0px", marginX: "-16px" }} value="0">
          <HistoricalAdjustment />
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            paddingX={"32px"}
            paddingBottom={"16px"}
          ></Stack>
          <Stack
            direction={"row"}
            justifyContent={"flex-end"}
            paddingRight={"32px"}
            paddingBottom={"16px"}
          >
            <CustomButton title={"Next"} onClick={() => handleNextTab()} />
          </Stack>
        </TabPanel>

        <TabPanel sx={{ padding: "24px 0px", marginX: "-16px" }} value="1">
          <NewAddContext />
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            paddingX={"32px"}
            paddingBottom={"16px"}
          >
            <CustomButton title={"Previous"} outlined onClick={handlePrevTab} />
            <CustomButton title={"Next"} onClick={handleNextTab} />
          </Stack>
        </TabPanel>
        <TabPanel sx={{ padding: "0px 16px", marginX: "-16px" }} value="2">
          <NewAdvanceSettings />
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            paddingX={"32px"}
            paddingBottom={"16px"}
          >
            <CustomButton
              title={"Previous"}
              outlined
              onClick={() => handlePrevTab()}
            />
          </Stack>
        </TabPanel>
      </TabContext> */}
      <HistoricalAdjustment />
    </Stack>
  );
};

export default DataCleaningAgent;
