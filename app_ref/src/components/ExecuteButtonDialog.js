import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  DialogActions,
  DialogContent,
  Stack,
  Switch,
  FormControlLabel,
  Grid,
  TextField,
} from "@mui/material";
import WarningTwoToneIcon from "@mui/icons-material/WarningTwoTone";
import CustomButton from "./CustomButton";
import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import useConfig from "../hooks/useConfig";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
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

const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,

  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.grey[300],
    opacity: 1,
  },
}));

const StyledFormControlLabel = styled(FormControlLabel)({
  margin: 0,
  gap: 2,
  "& .MuiTypography-root": {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 500,
    color: "#667085",
  },
});

const getWarningText = (runType) => {
  switch (runType) {
    case "run_training":
      return "run training";
    case "run_scenario":
      return "run scenario";
    case "run_optimization":
      return "run optimization";
    default:
      return runType;
  }
};

export default function ExecuteButtonDialog({
  open,
  handleClose,
  handleConfirm,
  ResultText,
  ConfirmButtonTitle,
  executeBtnText,
  setExecuteBtnText,
}) {
  const handleToggle = (e) => {
    setExecuteBtnText((prev) => ({
      ...prev,
      runDEPipeline: e.target.checked,
    }));
  };

  const { configState,exp_description, setExperimentDescription } = useConfig();
  const showToggle = executeBtnText.runType !== "run_scenario";

  const instanceSizeValues = ["xLarge", "4xLarge", "8xLarge", "12xLarge"];

  const instanceSizeDict = {
    xLarge: "4vCPU, 16GB",
    "4xLarge": "16vCPU, 64GB",
    "8xLarge": "32vCPU, 128GB",
    "12xLarge": "48vCPU, 192GB",
  };

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
        fullWidth
      >
        <Box
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Grid minWidth={250}>
              <CustomAutocomplete
                target="config"
                placeholder="Select"
                label="Machine"
                values={instanceSizeValues}
                valuesDict={instanceSizeDict}
                path="resource_config.instance_size"
                disableClearable
                // Ensuring proper width
              />
            </Grid>
            {showToggle && (
              <StyledFormControlLabel
  sx={{
    gap: 1, // or use specific pixel value like '16px'
    // additional spacing if needed
  }}
  control={
    <StyledSwitch
      checked={executeBtnText.runDEPipeline}
      onChange={handleToggle}
      color="primary"
      size="small"
    />
  }
  label="Data refresh"
/>
            )}
          </Stack>

          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: "#667085",
              padding: "8px",
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent>
          <Stack
            spacing={2}
            padding={"32px 20px"}
            justifyContent={"center"}
            marginTop={"16px"}
          >
            <Stack direction={"row"} alignItems={"center"} spacing={1}>
              <WarningTwoToneIcon
                style={{ color: "#FEC84B" }}
                fontSize="large"
              />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "19px",
                  fontWeight: 600,
                  lineHeight: "28px",
                  color: "#101828",
                  textAlign: "left",
                }}
              >
                You are about to {getWarningText(executeBtnText.runType)}{" "}
                {executeBtnText.runDEPipeline ? "with" : "without"} data
                refresh. On {configState?.resource_config?.instance_size}{" "}
                Machine
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "18px",
                color: "#44546F",
                textAlign: "left",
              }}
            >
              {ResultText}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "20px",
                color: "#101828",
                textAlign: "left",
              }}
            >
              Please confirm to proceed.
            </Typography>
            <TextField
  label="Experiment Description"
  placeholder="Enter description..."
  fullWidth
  multiline
  rows={3}
  value={exp_description || ""}
  onChange={async (e) => {
    const value = e.target.value;

    // 1️⃣ Update local UI state (optional but recommended)
   setExperimentDescription(value);

    // 2️⃣ Run THE SAME function used in DescriptionDialog
    
  }}
  sx={{
    mt: 2,
    "& .MuiOutlinedInput-root": {
      fontFamily: "Inter",
      fontSize: "14px",
      borderRadius: "10px",
      backgroundColor: "#fff",
    },
    "& .MuiInputLabel-root": {
      fontFamily: "Inter",
      fontSize: "14px",
      color: "#667085",
    },
  }}
/>

          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "space-between",
            padding: "16px 32px 32px 32px", // Added consistent padding
          }}
        >
          <CustomButton title="Cancel" onClick={handleClose} outlined />
          <CustomButton
            title={ConfirmButtonTitle}
            onClick={handleConfirm}
            loadable
          />
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
}
