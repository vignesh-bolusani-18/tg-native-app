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
import ExportPipelinesTable from "../../../../components/ExportPipelinesTable";
import useExports from "../../../../hooks/useExports";
import CreatePipeline from "./CreatePipeline";
import useDataConnection from "../../../../hooks/useDataConnection";
import { useEffect } from "react";

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

export default function ExportPipelines({ open, handleClose }) {
  const { configState } = useConfig();
  const {
    export_pipelines_list,
    clearCache,
    export_job,
    addExportJob,
    loadExportPipelinesList,
    setExportJobsOpen,
  } = useExports();
  const { userInfo, currentCompany } = useAuth();
  const { loadConnections } = useDataConnection();
  const [openCreatePipeline, setOpenCreatePipeline] = useState(false);
  const handleOpenCreatePipeline = () => {
    setOpenCreatePipeline(true);
    clearCache();
  };
  useEffect(() => {
    loadConnections(userInfo.userID);
    loadExportPipelinesList(userInfo);
    clearCache();
  }, []);
  const handleCloseCreatePipeline = () => {
    setOpenCreatePipeline(false);
    loadExportPipelinesList(userInfo);
    clearCache();
  };
  const handleExport = async () => {
    console.log("Export Job:", export_job);
    addExportJob(userInfo, currentCompany, export_job);
    handleClose();
    setExportJobsOpen(true);
    clearCache();
  };

  return (
    <React.Fragment>
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
          <Stack
            direction="row"
            alignItems={"center"}
            justifyContent={"space-between"}
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
              Export Pipelines
            </Typography>
            <Stack direction="row" spacing={1}>
              <CustomButton
                title={"Create Pipeline"}
                outlined={!openCreatePipeline}
                onClick={handleOpenCreatePipeline}
              />

              <IconButton
                aria-label="close"
                onClick={async () => {
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
        </DialogTitle>
        <DialogContent dividers>
          <Box>
            <Stack
              sx={{
                padding: "24px 32px 24px 32px",
                gap: "24px",
              }}
            >
              <ExportPipelinesTable />
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
            disabled={export_job === null}
            title={"Export"}
            onClick={handleExport}
          />
        </DialogActions>
      </BootstrapDialog>
      <CreatePipeline
        open={openCreatePipeline}
        handleClose={handleCloseCreatePipeline}
      />
    </React.Fragment>
  );
}
