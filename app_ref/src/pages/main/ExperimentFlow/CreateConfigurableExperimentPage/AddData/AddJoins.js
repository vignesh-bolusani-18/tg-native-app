import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, Grid, DialogActions, Divider } from "@mui/material";
import { ReactComponent as AlertIcon } from "../.././../../../assets/Icons/alert.svg";
import { StyledInput, TextFieldBox } from "../../../../../components/Search";
import useExperiment from "../../../../../hooks/useExperiment";

import CustomButton from "../../../../../components/CustomButton";
import { PaddingTwoTone } from "@mui/icons-material";
import useModule from "../../../../../hooks/useModule";
import CustomAutocomplete from "../../../../../components/ConfigurableCustomInputControls/CustomAutoComplete";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
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

const mainTitleStyle = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#101828",
  textAlign: "center",
  paddingTop: "16px",
  alignSelf: "center",
};

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#101828",
  textAlign: "center",
  alignSelf: "center",
};

export default function AddJoins({ open, handleClose }) {
  const { configState, addJoins, ui_config } = useModule();
  console.log("ui_config", ui_config);

  const renderJoinGroup = (joinGroup, index) => {
    const joinOperationKey = joinGroup.join_operation_key.split(".").pop();
    const joinOperations = configState.etl[joinOperationKey];

    if (!joinOperations || joinOperations.length === 0) {
      return null;
    }

    return (
      <Stack spacing={1} key={index}>
        {index === 0 ? (
          <Typography sx={mainTitleStyle}>{joinGroup.label}</Typography>
        ) : (
          <Divider sx={{ paddingTop: "16px" }}>
            <Typography sx={titleStyle}>{joinGroup.label}</Typography>
          </Divider>
        )}

        {joinOperations.map((join_object, joinIndex) => {
          return (
            <Grid container spacing={2} key={joinIndex}>
              <Grid item md={6} xs={12}>
                <CustomAutocomplete
                  label={`Left Input File: ${join_object.file1}`}
                  showLabel
                  values={join_object.file1_allCols}
                  target="config"
                  path={`etl.${joinOperationKey}[${joinIndex}].file1_col`}
                  isMultiSelect
                  formatLabel={false}
                  placeholder={"Select primary key/keys"}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <CustomAutocomplete
                  label={`Right Input File: ${join_object.file2}`}
                  showLabel
                  values={join_object.file2_allCols}
                  target="config"
                  path={`etl.${joinOperationKey}[${joinIndex}].file2_col`}
                  isMultiSelect
                  formatLabel={false}
                  placeholder={"Select primary key/keys"}
                />
              </Grid>
            </Grid>
          );
        })}
      </Stack>
    );
  };

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="lg"
        fullWidth
      >
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
        <DialogContent dividers>
          <Stack padding="24px 32px 24px 32px" spacing={2}>
            <Stack spacing={2}>
              {ui_config.join_groups.map((joinGroup, index) => 
                renderJoinGroup(joinGroup, index)
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CustomButton
            title={"Add Joins"}
            onClick={async () => {
              await addJoins();
              handleClose();
            }}
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
