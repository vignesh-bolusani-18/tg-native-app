import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
} from "@mui/material";
import { ReactComponent as CloudUploadIcon } from "../assets/Icons/cloud-upload-dark.svg";

import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import DeleteIcon from "@mui/icons-material/Delete";

import PreviewTable from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/PreviewData";
import useExperiment from "../hooks/useExperiment";
import CustomButton from "./CustomButton";

import { generateMetadata } from "../utils/generateMetadata";
import useAuth from "../hooks/useAuth";
import { Papa } from "papaparse";
import { uploadCSVToS3, uploadJsonToS3, uploadTxtToS3 } from "../utils/s3Utils";
import useDataset from "../hooks/useDataset";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CustomTextInput from "./CustomInputControls/CustomTextInput";
import { useEffect } from "react";
import useDataConnection from "../hooks/useDataConnection";

import { Editor } from "@monaco-editor/react";

import { useState } from "react";

import SnowflakesDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/SnowflakeDataConnectionData";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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

export default function SnowflakeDataConnection({
  open,
  handleClose,
  handleOpen,
  dataConnectionID,
  dataConnectionName,
}) {
  const [code, setCode] = useState("");
  const [snowflakeDataConnectionDataOpen, setSnowflakeDataConnectionDataOpen] =
    useState(false);

  const handleOpenSnowflakeDataConnectionData = () => {
    setSnowflakeDataConnectionDataOpen(true);
  };
  const handleCloseSnowflakeDataConnectionData = () => {
    setSnowflakeDataConnectionDataOpen(false);
    handleClose();
  };

  const { loadConnectionDataDetails } = useDataConnection();

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const { userInfo, currentCompany } = useAuth();

  const handleConfirm = async () => {
    const dataConnectionPayload = {
      query: code,
    };
    console.log("Data Conn Payload", dataConnectionPayload);
    handleOpenSnowflakeDataConnectionData();

    await loadConnectionDataDetails(
      dataConnectionID,
      dataConnectionPayload,
      userInfo.userID
    );
  };

  const confirmDisabled = code === "";

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
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
            {dataConnectionName}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
        <DialogContent>
          <Box
            sx={{
              padding: "24px 32px 48px 32px",
              gap: "24px",
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  sx={{
                    color: "#344054",
                    fontFamily: "Inter",
                    fontWeight: "500",
                    fontSize: "14px",
                    lineHeight: "20px",
                    marginBottom: "6px",
                  }}
                >
                  Query
                </Typography>
                <Box
                  sx={{
                    borderRadius: "0px",
                    border: "1px solid #EAECF0",
                    padding: "2px",
                  }}
                >
                  <Editor
                    height="400px"
                    loading={false}
                    language="sql"
                    theme="light"
                    value={code}
                    onChange={(value) => handleCodeChange(value)}
                    options={{
                      padding: {
                        top: 18,
                        bottom: 18,
                        left: 18,
                        right: 18,
                      },
                      borderRadius: "8px",
                      border: "1px solid red",
                    }}
                    style={{
                      width: "80%",
                      borderRadius: "8px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      marginBottom: "20px",
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <CustomButton onClick={handleClose} title={"Cancel"} outlined />
          <CustomButton
            onClick={handleConfirm}
            title={"Confirm"}
            disabled={confirmDisabled}
            loadable
          />
        </DialogActions>
      </BootstrapDialog>
      {snowflakeDataConnectionDataOpen && (
        <SnowflakesDataConnectionData
          open={snowflakeDataConnectionDataOpen}
          handleClose={handleCloseSnowflakeDataConnectionData}
          dataConnectionName={dataConnectionName}
          query={code}
        />
      )}
    </Box>
  );
}
