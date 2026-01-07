import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
} from "@mui/material";
import WarningTwoToneIcon from "@mui/icons-material/WarningTwoTone";

import CustomButton from "./CustomButton";

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

export default function ConfirmationDialog({
  open,
  handleClose,
  handleConfirm,
  WarningText,
  ResultText,
  ConfirmButtonTitle,
}) {
  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
        fullWidth
        sx={{ border: "2px solid green" }}
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
        <DialogContent>
          <Stack
            spacing={2}
            padding={"32px"}
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
                  fontSize: "24px",
                  fontWeight: 600,
                  lineHeight: "28px",
                  color: "#101828",
                  textAlign: "left",
                }}
              >
                {WarningText}
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
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