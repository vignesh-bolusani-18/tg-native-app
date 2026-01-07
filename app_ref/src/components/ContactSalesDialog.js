import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Box, Button } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import WarningTwoToneIcon from "@mui/icons-material/WarningTwoTone";
import CustomButton from "./CustomButton";
const StyledDialog = styled(Dialog)(({ theme }) => ({

  
  "& .MuiDialogContent-root": {
    backgroundColor:'white',
    padding: theme.spacing(4),
  },
  "& .MuiDialogActions-root": {
    backgroundColor:'white',
    padding: theme.spacing(2, 4, 4),
  },
  "& .MuiPaper-root": {
    backgroundColor:'white',
    borderRadius: 16,
    boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.12)",
  },
  
}));

const WarningIconStyled = styled(WarningTwoToneIcon)(({ theme }) => ({
  fontSize: 64,
  color: "#FEC84B",
  marginBottom: theme.spacing(2),
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1.5rem",
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  textAlign: "center",
}));

const ContentTypography = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: theme.palette.text.secondary,
  textAlign: "center",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 3),
  textTransform: "none",
  fontSize: "0.9rem",
  minWidth: 120,
}));

export default function ContactSalesDialog({
  open,
  handleClose,
  handleConfirm,
  WarningText,
  ResultText,
  ConfirmButtonTitle,
}) {
  return (
    <StyledDialog onClose={handleClose} open={open} maxWidth="sm"  fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <WarningIconStyled />
          <TitleTypography variant="h6">{WarningText}</TitleTypography>
          <ContentTypography>{ResultText}</ContentTypography>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ justifyContent: "center", flexDirection: "column", gap: 2 }}
      >
        <CustomButton
          title={ConfirmButtonTitle}
          onClick={handleConfirm}
          loadable
          fullWidth
        />
        <CustomButton title="Cancel" onClick={handleClose} outlined fullWidth />
      </DialogActions>
    </StyledDialog>
  );
}
