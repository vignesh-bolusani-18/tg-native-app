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
  ListItemText,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import useAuth from "../../hooks/useAuth";
import CustomTextInput from "../../components/CustomInputControls/CustomTextInput";
import { Form, Formik } from "formik";
import { emailSchema } from "../../validation";
import CustomAutocomplete from "../../components/CustomInputControls/CustomAutoComplete";
import CustomButton from "../../components/CustomButton";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";


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


export default function InvitePeopleDialog({ open, handleClose }) {
  const { userInfo, SendInvite, currentCompany } = useAuth();
  const [invitaionResponse, setInvitationResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const onHandleClose = async () => {
    handleClose();
    setInvitationResponse(null);
  };

  const handleInvite = async (values) => {
    setLoading(true);
    console.log("email", values.email);
    let response = await SendInvite(
      userInfo,
      currentCompany,
      values.email.toLowerCase()
    );
    if (!response) {
      response = { message: "Failed to send invite" };
    }
    setInvitationResponse(response);
    console.log("Invite response", response);
    setLoading(false);
  };

  const formikRef = React.useRef();

  // Copy invite link to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Invite link copied to clipboard!");
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
            Invite People to {`${currentCompany.companyName}`}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onHandleClose}
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
          <Stack
            sx={{
              padding: "24px 32px 24px 32px",
              gap: "24px",
            }}
          >
            <Formik
              initialValues={{ email: "" }}
              validationSchema={emailSchema}
              onSubmit={handleInvite}
              innerRef={formikRef}
            >
              {({ errors, touched, handleChange, handleBlur, values }) => (
                <Form>
                  <Stack spacing={2}>
                    <CustomTextInput
                      required
                      fullWidth
                      showLabel
                      label={"To"}
                      placeholder="Enter the email address"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Stack>
                </Form>
              )}
            </Formik>
          </Stack>

          {/* Conditional rendering based on invitation response */}
          {invitaionResponse && (
            <Box sx={{ padding: "0px 32px 0px 32px" }}>
              {invitaionResponse.message ? (
                <Typography
                  sx={{
                    fontSize: "14px",
                    color: "red",
                  }}
                >
                  {invitaionResponse.message}
                </Typography>
              ) : null}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <CustomButton title="Cancel" onClick={onHandleClose} outlined />
          <CustomButton
            title={loading ? "Inviting.." : "Invite"}
            disabled={loading}
            onClick={() => formikRef.current.submitForm()}
          />
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
}
