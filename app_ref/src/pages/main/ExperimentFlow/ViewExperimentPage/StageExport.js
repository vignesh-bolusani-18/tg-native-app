import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Form, Formik } from "formik";
import { Stack, DialogActions, Box } from "@mui/material";
import CustomButton from "../../../../components/CustomButton";
import useAuth from "../../../../hooks/useAuth";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import CustomTextInput from "../../../../components/CustomInputControls/CustomTextInput";
import { stageExportSchema } from "../../../../validation";
import useConfig from "../../../../hooks/useConfig";
import { fetchAndModifyCSV } from "../../../../utils/s3Utils";
import { useState } from "react";
import useDashboard from "../../../../hooks/useDashboard";
import { ERROR, SUCCESS } from "../../../../theme/custmizations/colors";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    // padding: theme.spacing(2),
    padding: 0,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: " 1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

export default function StageExport({ open, handleClose, handleConfirm }) {
  const { configState } = useConfig();
  const { experimentBasePath } = useDashboard();
  const [response, setResponse] = useState(null);
  const { userInfo, currentCompany } = useAuth();
  const outputMap = {
    Forecast: "forecast",
    "Replacement Optimization": "replacement_optimization",
  };
  const outputs =
    configState.data.optimization_column !== "None"
      ? ["Forecast", "Replacement Optimization"]
      : ["Forecast"];

  const [output, setOutput] = React.useState(outputs[0]);
  const formikRef = React.useRef();
  const handleStageExport = async (values) => {
    let inputFilePath = `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.csv`;
    let outputFilePath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/exports/${values.stageName}/last_staged_output.csv`;
    let outputType = outputMap[output];
    let newColumns = {
      experiment_id: configState.common.job_id,
      experiment_name: configState.project_setup.project_name,
    };
    if (outputType === "replacement_optimization") {
      inputFilePath = `${experimentBasePath}/scenario_planning/K_best/optimization/optimal_data.csv`;
      newColumns["forecast_from"] = configState.etl?.activity_end_date;
      newColumns["optimization_for"] =
        configState.etl?.optimization_forecast_period;
      newColumns["optimization_history"] = configState.etl?.optimization_period;
      newColumns["optimization_target_epsilon"] =
        configState.scenario_plan?.epsilon;
    }
    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const res = await fetchAndModifyCSV(
      inputFilePath,
      outputFilePath,
      newColumns,
      userInfo.userID
    );
    if (res) {
      if (res.message !== "File successfully processed and uploaded.") {
        setResponse("Unable to export the given stage!");
      } else {
        setResponse("Stage exported successfully!");
        sleep(2000).then(() => {
          handleClose();
        });
      }
    } else {
      setResponse("No Response!");
    }
  };

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={async () => {
          await handleClose();
        }}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
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
            Stage Export
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
              }}
            >
              <Formik
                initialValues={{ stageName: "" }}
                validationSchema={stageExportSchema}
                onSubmit={handleStageExport}
                innerRef={formikRef}
              >
                {({ errors, touched, handleChange, handleBlur, values }) => (
                  <Form>
                    <Stack spacing={2}>
                      <CustomTextInput
                        required
                        fullWidth
                        showLabel
                        label={"Name"}
                        placeholder="Enter the stage name"
                        name="stageName"
                        value={values.stageName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.stageName && Boolean(errors.stageName)}
                        helperText={touched.stageName && errors.stageName}
                      />
                      <CustomAutocomplete
                        disableClearable
                        values={outputs}
                        selectedValues={output}
                        setSelectedValues={setOutput}
                        label={"Select the Output"}
                        placeholder={"Select the output"}
                        showLabel
                      />
                    </Stack>
                    {response ? (
                      <>
                        {response === "Unable to export the given stage!" ? (
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontSize: "12px",
                              fontWeight: "500",
                              lineHeight: "14px",
                              // textAlign: "center",
                              color: ERROR[500],
                              paddingTop: "16px",
                            }}
                          >
                            {response.toString()}
                          </Typography>
                        ) : (
                          <Typography
                            sx={{
                              fontFamily: "Inter",
                              fontSize: "12px",
                              fontWeight: "500",
                              lineHeight: "14px",
                              // textAlign: "center",
                              color: SUCCESS[500],
                              paddingTop: "16px",
                            }}
                          >
                            {response.toString()}
                          </Typography>
                        )}
                      </>
                    ) : null}
                  </Form>
                )}
              </Formik>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton
            title="Cancel"
            onClick={async () => {
              await handleClose();
            }}
            outlined
          />
          <CustomButton
            loadable
            title={"Export"}
            onClick={() => formikRef.current.submitForm()}
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
