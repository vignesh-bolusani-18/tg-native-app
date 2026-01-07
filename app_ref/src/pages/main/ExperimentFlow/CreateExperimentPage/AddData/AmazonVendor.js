import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, Grid, InputAdornment, DialogActions } from "@mui/material";
import { ReactComponent as AlertIcon } from "../.././../../../assets/Icons/alert.svg";
import { StyledInput, TextFieldBox } from "../../../../../components/Search";
import { Formik, Form } from "formik";

import { amazonVendorFormSchema } from "../../../../../validation";
import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput";
import CustomButton from "../../../../../components/CustomButton";
import useDataConnection from "../../../../../hooks/useDataConnection";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { ERROR } from "../../../../../theme/custmizations/colors";
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

export default function AmazonVendorConnection({ open, handleClose, handleConfirm }) {
    const formikRef = React.useRef();
    const {
        createConnection,
        connectionResponse,
        connecting,
        error,
        getError,
        SetError,
    } = useDataConnection();

    const handleConnect = async (values) => {
        const payload = {
            accessToken: values.amazonVendorAccessToken,
            endpoint: values.amazonVendorEndpoint,
            appVersion: values.amazonVendorAppVersion,
            appId: values.amazonVendorAppId,
        };
        console.log("On Click Called");
        const postCreation = () => {
            handleConfirm();
            handleClose();
            SetError(null);
        };
        await createConnection(
            values.amazonVendorConnectionName,
            "amazonVendor",
            payload,
            postCreation
        );
    };

    return (
        <React.Fragment>
            <BootstrapDialog
                onClose={async () => {
                    await handleClose();
                    SetError(null);
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
                        Amazon Vendor Connection
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={async () => {
                            await handleClose();
                            SetError(null);
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
                    <Formik
                        initialValues={{
                            amazonVendorConnectionName: "",
                            amazonVendorAccessToken: "",
                            amazonVendorEndpoint: "",
                            amazonVendorAppVersion: "",
                            amazonVendorAppId: ""
                        }}
                        validationSchema={amazonVendorFormSchema}
                        onSubmit={handleConnect}
                        innerRef={formikRef}
                    >
                        {({ errors, touched, handleChange, handleBlur, values }) => (
                            <Form>
                                <Grid container padding="24px 16px 24px 16px" spacing={2}>
                                    <Grid item xs={12} md={12}>
                                        <CustomTextInput
                                            required
                                            showLabel
                                            label={"Connection Name"}
                                            placeholder="Enter your connection name"
                                            name="amazonVendorConnectionName"
                                            value={values.amazonVendorConnectionName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.amazonVendorConnectionName && Boolean(errors.amazonVendorConnectionName)}
                                            helperText={touched.amazonVendorConnectionName && errors.amazonVendorConnectionName}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <CustomTextInput
                                            required
                                            showLabel
                                            label={"Access Token"}
                                            placeholder="Enter your access token"
                                            name="amazonVendorAccessToken"
                                            value={values.amazonVendorAccessToken}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.amazonVendorAccessToken && Boolean(errors.amazonVendorAccessToken)}
                                            helperText={touched.amazonVendorAccessToken && errors.amazonVendorAccessToken}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <CustomTextInput
                                            required
                                            showLabel
                                            label={"Endpoint"}
                                            placeholder="Enter your Endpoint"
                                            name="amazonVendorEndpoint"
                                            value={values.amazonVendorEndpoint}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.amazonVendorEndpoint && Boolean(errors.amazonVendorEndpoint)}
                                            helperText={touched.amazonVendorEndpoint && errors.amazonVendorEndpoint}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <CustomTextInput
                                            required
                                            showLabel
                                            label={"App Version"}
                                            placeholder="Enter your App version"
                                            name="amazonVendorAppVersion"
                                            value={values.amazonVendorAppVersion}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.amazonVendorAppVersion && Boolean(errors.amazonVendorAppVersion)}
                                            helperText={touched.amazonVendorAppVersion && errors.amazonVendorAppVersion}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <CustomTextInput
                                            required
                                            showLabel
                                            label={"App ID"}
                                            placeholder="Enter your App ID"
                                            name="amazonVendorAppId"
                                            value={values.amazonVendorAppId}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.amazonVendorAppId && Boolean(errors.amazonVendorAppId)}
                                            helperText={touched.amazonVendorAppId && errors.amazonVendorAppId}
                                        />
                                    </Grid>

                                    {error ? (
                                        <Grid item xs={12} md={12}>
                                            <Stack
                                                direction={"row"}
                                                spacing={1}
                                                alignItems={"center"}
                                            >
                                                <WarningRoundedIcon
                                                    fontSize="small"
                                                    style={{ color: ERROR[600] }}
                                                />
                                                <Typography
                                                    sx={{
                                                        fontFamily: "Inter",

                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        lineHeight: "14px",
                                                        textAlign: "center",
                                                        color: ERROR[600],
                                                    }}
                                                >
                                                    Unable to connect
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    ) : null}
                                </Grid>
                            </Form>
                        )}
                    </Formik>

                </DialogContent>
                <DialogActions>
                    <CustomButton
                        title="Cancel"
                        onClick={async () => {
                            await handleClose();
                            SetError(null);
                        }}
                        outlined
                    />
                    <CustomButton
                        title={connecting ? "Connecting" : "Connect"}
                        onClick={() => formikRef.current.submitForm()}
                    />
                </DialogActions>
            </BootstrapDialog>
        </React.Fragment>
    );
}
