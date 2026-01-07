// import * as React from "react";
// import Button from "@mui/material/Button";
// import { styled } from "@mui/material/styles";
// import Dialog from "@mui/material/Dialog";
// import DialogTitle from "@mui/material/DialogTitle";
// import DialogContent from "@mui/material/DialogContent";
// import IconButton from "@mui/material/IconButton";
// import CloseIcon from "@mui/icons-material/Close";
// import Typography from "@mui/material/Typography";
// import { Form, Formik } from "formik";
// import { Stack, DialogActions, Box } from "@mui/material";
// import CustomButton from "../../../../components/CustomButton";
// import useAuth from "../../../../hooks/useAuth";
// import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
// import CustomTextInput from "../../../../components/CustomInputControls/CustomTextInput";
// import { stageExportSchema } from "../../../../validation";
// import useConfig from "../../../../hooks/useConfig";
// import { fetchAndModifyCSV } from "../../../../utils/s3Utils";
// import { useState } from "react";
// import useDashboard from "../../../../hooks/useDashboard";
// import { ERROR, SUCCESS } from "../../../../theme/custmizations/colors";
// import SelectConnections from "../CreateExperimentPage/AddData/SelectConnections";
// import useExports from "../../../../hooks/useExports";

// const BootstrapDialog = styled(Dialog)(({ theme }) => ({
//   "& .MuiDialogContent-root": {
//     // padding: theme.spacing(2),
//     padding: 0,
//   },
//   "& .MuiDialogActions-root": {
//     padding: theme.spacing(1),
//   },
//   "& .MuiPaper-root": {
//     borderRadius: "12px",
//     border: " 1px solid #EAECF0",
//     backgroundColor: theme.palette.background.default,
//   },
// }));

// export default function CreatePipeline({ open, handleClose, handleConfirm }) {
//   const { configState } = useConfig();
//   const { experimentBasePath } = useDashboard();
//   const [response, setResponse] = useState(null);
//   const { userInfo, currentCompany } = useAuth();
//   const { create_step, setCreateStep } = useExports();
//   const outputMap = {
//     Forecast: "forecast",
//     "Replacement Optimization": "replacement_optimization",
//   };
//   const outputs =
//     configState.data.optimization_column !== "None"
//       ? ["Forecast", "Replacement Optimization"]
//       : ["Forecast"];

//   const [output, setOutput] = React.useState(outputs[0]);
//   const formikRef = React.useRef();
//   const handleStageExport = async (values) => {
//     let inputFilePath = `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.csv`;
//     let outputFilePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/exports/${values.stageName}/last_staged_output.csv`;
//     let outputType = outputMap[output];
//     let newColumns = {
//       experiment_id: configState.common.job_id,
//       experiment_name: configState.project_setup.project_name,
//     };
//     if (outputType === "replacement_optimization") {
//       inputFilePath = `${experimentBasePath}/scenario_planning/K_best/optimization/optimal_data.csv`;
//       newColumns["forecast_from"] = configState.etl?.activity_end_date;
//       newColumns["optimization_for"] =
//         configState.etl?.optimization_forecast_period;
//       newColumns["optimization_history"] = configState.etl?.optimization_period;
//       newColumns["optimization_target_epsilon"] =
//         configState.scenario_plan?.epsilon;
//     }
//     function sleep(ms) {
//       return new Promise((resolve) => setTimeout(resolve, ms));
//     }

//     const res = await fetchAndModifyCSV(
//       inputFilePath,
//       outputFilePath,
//       newColumns,
//       userInfo.userID
//     );
//     if (res) {
//       if (res.message !== "File successfully processed and uploaded.") {
//         setResponse("Unable to export the given stage!");
//       } else {
//         setResponse("Stage exported successfully!");
//         sleep(2000).then(() => {
//           handleClose();
//         });
//       }
//     } else {
//       setResponse("No Response!");
//     }
//   };

//   return (
//     <React.Fragment>
//       <BootstrapDialog
//         onClose={async () => {
//           await handleClose();
//         }}
//         aria-labelledby="customized-dialog-title"
//         open={open}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{
//             m: 0,
//             padding: "20px 26px 19px 26px",
//             borderBottom: "1px solid #EAECF0",
//           }}
//           id="customized-dialog-title"
//         >
//           <Typography
//             sx={{
//               fontFamily: "Inter",
//               fontSize: "18px",
//               fontWeight: 500,
//               lineHeight: "28px",
//               color: "#101828",
//               textAlign: "left",
//             }}
//           >
//             Create Export Pipeline
//           </Typography>
//           <IconButton
//             aria-label="close"
//             onClick={async () => {
//               await handleClose();
//             }}
//             sx={{
//               position: "absolute",
//               right: 8,
//               top: 8,
//               color: "#667085",
//               padding: "8px",
//             }}
//           >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent dividers>
//           <Box>
//             <Stack
//               sx={{
//                 padding: "24px 32px 24px 32px",
//                 gap: "24px",
//               }}
//             >
//               <SelectConnections />
//             </Stack>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <CustomButton
//             title="Cancel"
//             onClick={async () => {
//               await handleClose();
//             }}
//             outlined
//           />
//           <CustomButton
//             loadable
//             title={"Export"}
//             onClick={() => formikRef.current.submitForm()}
//           />
//         </DialogActions>
//       </BootstrapDialog>
//     </React.Fragment>
//   );
// }

import React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, DialogActions, Box } from "@mui/material";
import CustomButton from "../../../../components/CustomButton";
import BasicDetails from "./BasicDetails";
import PipelineQueries from "./PipelineQueries";
import SelectConnections from "../CreateExperimentPage/AddData/SelectConnections";
import useExports from "../../../../hooks/useExports";
import useAuth from "../../../../hooks/useAuth";
import { uploadJsonToS3 } from "../../../../utils/s3Utils";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: 0,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

const StepIndicator = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  padding: "16px 0",
}));

const StepDot = styled(Box)(({ theme, active }) => ({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: active ? theme.palette.primary.main : "#D0D5DD",
  transition: "background-color 0.3s ease",
}));

export default function CreatePipeline({ open, handleClose }) {
  const {
    create_step,
    setCreateStep,
    export_pipeline,
    addExportPipeline,
    loadExportPipelinesList,
  } = useExports();
  const { userInfo, currentCompany } = useAuth();
  const handleConfirm = async () => {
    const export_config_path = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/customer_data/exports/pipelines/${export_pipeline.name}.json`;
    const export_config = export_pipeline;
    await uploadJsonToS3(export_config_path, export_config);
    await addExportPipeline(userInfo, currentCompany, export_config);
    await loadExportPipelinesList(userInfo);
    handleClose();
  };
  const handleNext = () => {
    if (create_step < 3) setCreateStep(create_step + 1);
  };

  const handlePrevious = () => {
    if (create_step > 1) setCreateStep(create_step - 1);
  };

  return (
    <BootstrapDialog
      onClose={async () => {
        await handleClose();
      }}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle
        sx={{
          m: 0,
          padding: "20px 26px 19px 26px",
          borderBottom: "1px solid #EAECF0",
        }}
        id="customized-dialog-title"
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "28px",
            color: "#101828",
            textAlign: "left",
          }}
        >
          Create Export Pipeline
        </Typography>
        <IconButton
          aria-label="close"
          onClick={async () => {
            await handleClose();
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#667085",
            padding: "8px",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box>
          <Stack
            sx={{
              padding: "24px 32px 24px 32px",
              gap: "24px",
              height: "70vh",
            }}
          >
            {create_step === 1 && <BasicDetails />}
            {create_step === 2 && <SelectConnections />}
            {create_step === 3 && <PipelineQueries />}
          </Stack>
        </Box>
        {/* Step Indicator */}
      </DialogContent>
      <DialogActions>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          width={"100%"}
        >
          <CustomButton
            title="Cancel"
            onClick={async () => {
              await handleClose();
            }}
            outlined
          />
          <StepIndicator>
            {[1, 2, 3].map((step) => (
              <StepDot key={step} active={step === create_step} />
            ))}
          </StepIndicator>
          <Stack direction={"row"} alignItems={"center"} gap={"8px"}>
            <CustomButton
              disabled={create_step === 1}
              onClick={handlePrevious}
              outlined
              title={"Previous"}
            />

            <CustomButton
              onClick={create_step === 3 ? handleConfirm : handleNext}
              title={create_step === 3 ? "Confirm" : "Next"}
            />
          </Stack>
        </Stack>
      </DialogActions>
    </BootstrapDialog>
  );
}
