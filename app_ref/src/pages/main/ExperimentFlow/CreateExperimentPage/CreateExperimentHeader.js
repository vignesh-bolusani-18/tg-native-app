import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Stack,
  Chip,
  Grid,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { ThemeContext } from "../../../../theme/config/ThemeContext";
import AddData from "./AddData/index";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useConfig from "./../../../../hooks/useConfig";
import useExperiment from "../../../../hooks/useExperiment";
import { v4 as uuidv4 } from "uuid";
import { Form, Formik } from "formik";
import { experimentNameSchema } from "../../../../validation";
import CustomTextInput from "../../../../components/CustomInputControls/CustomTextInput";
import CustomButton from "../../../../components/CustomButton";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import NewAddContext from "./AddContext/NewAddContext";
import CustomTooltip from "../../../../components/CustomToolTip";
import ContactSalesDialog from "../../../../components/ContactSalesDialog";
import NewAdvanceSettings from "./AdvancedSettings/NewAdvanceSettings";
import ExecuteButtonDialog from "../../../../components/ExecuteButtonDialog";
import {  Alert } from '@mui/material'; 
import useDataset from "../../../../hooks/useDataset";






  

const CreateExperimentHeader = () => {
  const { tabValue, setTabValue } = useExperiment();
  const [isExperimentNameFilled, setIsExperimentNameFilled] = useState(false);
  const navigate = useNavigate();

  const {
    configState,
    contextConfig,
    uploadConfigToS3,
    confirmAddData,
    updateConfigFieldByPath,
    confirmAddContext,
    confirmAdvancedSettings,
    clearConfigCache,
    exp_description,
    setExperimentDescription,
    isProduction,
    isArchive

  } = useConfig();
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
    refreshCurrentCompnay,
    isExecuteButtonDialogOpen,
    setIsExecuteButtonDialogOpen,
  } = useAuth();
  

  
  const [executeBtnText, setExecuteBtnText] = useState({
    runType: "run_training",
    runDEPipeline: true,
  });
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
  const [projectSetup, setProjectSetup] = useState(configState.project_setup);
  useEffect(() => {
    refreshCurrentCompnay();
  }, []);
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const handleConfirmationOpen = () => setConfirmationOpen(true);
  const handleConfirmationClose = () => setConfirmationOpen(false);

  const handleContactSales = () => {
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  const handleExperimentExecution = async () => {
    const experimentId = uuidv4();
    await confirmAddContext(loadedDatasets);

    const newConfig = await confirmAdvancedSettings();

    uploadConfigToS3({
      config: newConfig,
      clientName: currentCompany.companyName,
      experimentId: experimentId,
      moduleName: currentModule,
      userInfo,
      currentCompany,
      runType: "run_training",
      isClone: false,
      runDEPipeline: executeBtnText.runDEPipeline,
      exp_description:exp_description,
      isProduction:isProduction,
      isArchive:isArchive
     

    });
    setIsExecuteButtonDialogOpen(false);
  };

  const handleDiscardExperiment = async () => {
    await navigate(`/${currentCompany.companyName}/experiments`);
    await discardExperiment();
    await clearConfigCache();
  
  };

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePrevTab = () => {
    setTabValue((parseInt(tabValue) - 1).toString());
  };

  const handleNextTab = async () => {
    if (tabValue === "0") {
      await confirmAddData(loadedDatasets, datasetsLoaded);
      console.log("config after confirmAddData", configState);
      console.log("context config after confirmAddData", contextConfig);
    } else if (tabValue === "1") {
      confirmAddContext(loadedDatasets);
    }
    setTabValue((parseInt(tabValue) + 1).toString());
  };

  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    setIsExperimentNameFilled(projectSetup.project_name.trim().length > 0);
  }, [projectSetup.project_name]);
  const { moduleName } = useParams();


   const renderAlertMessage = () => {
    if (tabValue !== "0") return null;
    
    if (!isMandatoryDataAdded) {
      return (
        <Alert severity="warning" sx={{ mt: 2 , mx:2  }}>
          Please Select all the required Dataset to move forward
        </Alert>
      );
    }
    
    if (needToJoin && !joinsAdded) {
      return (
        <Alert severity="warning" sx={{ mt: 2 , mx:2}}>
          Please Add joins to move to next step
        </Alert>
      );
    }

    if (isMandatoryDataAdded && (!needToJoin || joinsAdded)) {
    return (
      <Alert severity="success" sx={{ mt: 2, mx: 2, backgroundColor: "#ECFDF3" }}>
        Click on Next Button to move to the next step
      </Alert>
    );
  }
    
    return null;
  };


  return (
    <Box>
      <Stack
        

        sx={{
          padding: "12px 16px 8px 16px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "16px",
          justifyContent: "space-between",
          alignItems:'center'
        }}
      >
        <Chip
          label={currentModule}
          sx={{
            padding: "2px 8px",
            borderRadius: "16px",
            backgroundColor: "#F9F5FF",
            maxHeight: "22px",
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "18px",
            textAlign: "center",
            color: "#0C66E4",
            flexShrink: 0,
            "& .MuiChip-label": {
              padding: 0,
            },
          }}
        />
        
       
        <Stack direction="row" spacing={2}  sx={{ flexShrink: 0 }}>
          <CustomButton
            outlined
            title={"Discard"}
            onClick={handleConfirmationOpen}
          />

          {!isMandatoryDataAdded ||
          !isExperimentNameFilled ||
          tabValue !== "2" ? (
            <CustomTooltip
              title="Complete all the steps!"
              arrow
              placement="top"
            >
              <CustomButton
                title={"Execute"}
                onClick={
                  currentCompany.unlimited_experiments ||
                  currentCompany.allowed_total_experiments > 0
                    ? () => setIsExecuteButtonDialogOpen(true)
                    : () => setIsContactSalesDialogOpen(true)
                }
                disabled={
                  !isMandatoryDataAdded ||
                  !isExperimentNameFilled ||
                  tabValue !== "2"
                }
                isPremiumFeature={
                  currentCompany.unlimited_experiments ||
                  currentCompany.allowed_total_experiments > 0
                }
              />
            </CustomTooltip>
          ) : (
            <CustomButton
              title={"Execute"}
              onClick={
                currentCompany.unlimited_experiments ||
                currentCompany.allowed_total_experiments > 0
                  ? () => setIsExecuteButtonDialogOpen(true)
                  : () => setIsContactSalesDialogOpen(true)
              }
              disabled={
                !isMandatoryDataAdded ||
                !isExperimentNameFilled ||
                tabValue !== "2"
              }
            />
          )}
        </Stack>
      </Stack>
      <Box padding="12px 16px 8px 16px">
        <Stack spacing={"6px"}>
  <Formik
    initialValues={{
      experimentName: projectSetup.project_name,
    }}
    validationSchema={experimentNameSchema}
    onSubmit={() => {}}
  >
    {({
      errors,
      touched,
      handleChange,
      handleBlur,
      values,
      setFieldValue,
    }) => (
      <Form>
        {/* ROW layout for both fields */}
        <Stack direction="row" spacing={2}>
          <Grid item xs={12} md={12}>
          <CustomTextInput
            required
            showLabel
            label={"Experiment name"}
            placeholder={"Please enter your experiment name"}
            name="experimentName"
            onChange={(e) => {
              const { value } = e.target;

              handleChange(e);

              setProjectSetup((prevSetup) => {
                const updatedSetup = {
                  ...prevSetup,
                  project_name: value,
                };
                updateConfigFieldByPath("project_setup", updatedSetup);
                return updatedSetup;
              });

              setFieldValue("experimentName", value);
            }}
            onBlur={handleBlur}
            value={values.experimentName}
            error={touched.experimentName && Boolean(errors.experimentName)}
            helperText={touched.experimentName && errors.experimentName}
            
          />
          </Grid>
         {/* <Grid item xs={12} md={8}>
          <CustomTextInput
            showLabel
            label={"Experiment Description"}
            placeholder={"Please enter a description for your experiment"}
            name="experimentDescription"
            value={exp_description}
            onChange={(e) => {
              setExperimentDescription(e.target.value);
            }}
            onBlur={handleBlur}
            multiline
            rows={4}
       
          />
          </Grid> */}
        </Stack>
      </Form>
    )}
  </Formik>
</Stack>

      </Box>
      <Box>
        <TabContext value={tabValue}>
          <Box padding="12px 16px 12px 16px">
            <TabList
              onChange={handleChange}
              aria-label="create experiment tablist"
            >
              <Tab
                label="Add Data"
                value="0"
                sx={{
                  color: "#667085",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "left",
                  paddingLeft: "0px",
                  textTransform: "none",
                  "&.Mui-selected": {
                    color: theme.palette.button.textOnHover,
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
                    color: theme.palette.button.textOnHover,
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
                    color: theme.palette.button.textOnHover,
                    borderBottom: "2px solid #0C66E4",
                  },
                }}
                disabled={tabValue !== "2"}
              />
            </TabList>
            
          </Box>
          <TabPanel sx={{ padding: "0px 16px", marginX: "-16px" }} value="0">
          
         
      
            <AddData renderAlertMessage = {renderAlertMessage} />
          </TabPanel>
          <TabPanel sx={{ padding: "24px 0px", marginX: "-16px" }} value="1">
            <NewAddContext />
          </TabPanel>
          <TabPanel sx={{ padding: "0px 16px", marginX: "-16px" }} value="2">
            <NewAdvanceSettings />
          </TabPanel>
        </TabContext>
      </Box>
      <>
      
      <Box 
        padding="12px 16px 12px 16px" 
        sx={{ 
          borderTop: "1px solid #EAECF0", 
          display: "flex", 
          justifyContent: "space-between" 
        }}
      >
        <CustomButton 
          onClick={handlePrevTab} 
          title={"Previous"} 
          outlined 
          disabled={tabValue === "0"} 
        />
        <CustomButton 
          onClick={handleNextTab} 
          title={"Next"} 
          disabled={
            tabValue === "2" || 
            !isMandatoryDataAdded || 
            (needToJoin && !joinsAdded) || 
            (!(moduleName !== "inventory-optimization" || 
              (configState.scenario_plan.inventory_constraints?.sales_joining_keys?.length > 0 && 
               configState.scenario_plan.inventory_constraints?.inventory_joining_keys?.length > 0))) || 
            (tabValue === "1" && !contextConfig.etl.activity_end_date)
          } 
        />
      </Box>
    </>
      <ConfirmationDialog
        open={confirmationOpen}
        handleClose={handleConfirmationClose}
        handleConfirm={handleDiscardExperiment}
        WarningText={"Are you sure, you want to discard this experiment?"}
        ResultText={
          "All unsaved changes in this session will be lost once you press Discard"
        }
        ConfirmButtonTitle={"Discard"}
      />
      <ContactSalesDialog
        open={isContactSalesDialogOpen}
        handleClose={() => setIsContactSalesDialogOpen(false)}
        handleConfirm={handleContactSales}
        WarningText="Upgrade Your Subscription"
        ResultText="Upgrade your subscription or contact sales for more access."
        ConfirmButtonTitle="Contact Sales"
      />
      <ExecuteButtonDialog
        open={isExecuteButtonDialogOpen}
        handleClose={() => setIsExecuteButtonDialogOpen(false)}
        handleConfirm={handleExperimentExecution}
        WarningText="You are about to execute a run_training workflow. This will run with DE Pipeline before execution."
        ResultText={` This process may take significant time and resources.`}
        ConfirmButtonTitle="Proceed"
        executeBtnText={executeBtnText}
        setExecuteBtnText={setExecuteBtnText}
      />
    </Box>
  );
};

export default CreateExperimentHeader;
