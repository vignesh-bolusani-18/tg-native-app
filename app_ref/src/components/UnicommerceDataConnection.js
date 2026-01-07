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
import UnicommerceDataConnectionData from "../pages/main/ExperimentFlow/CreateExperimentPage/AddData/UnicommerceDataConnectionData";

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

export default function UnicommerceDataConnection({
  open,
  handleClose,
  handleOpen,
  dataConnectionID,
  dataConnectionName,
  tenant,
  tenantURL,  
}) {
  const defaultPayload = `{
  "exportJobTypeName": "Copy of Gatepass Export",
  "exportColums": [
    "gatePassCode",
    "gatePassCreatedBy",
    "type",
    "gatepassStatus",
    "createdAt",
    "updatedAt",
    "purpose",
    "reference",
    "toParty",
    "itemName",
    "itemSkuCode",
    "color",
    "size",
    "brand",
    "hsnCode",
    "unitPrice",
    "quantity",
    "receivedquantity",
    "inventoryType",
    "status",
    "shelf",
    "reason",
    "created",
    "updated",
    "gatePassOrderCode",
    "fromFacilityName",
    "toFacilityName",
    "toPartyCity",
    "invoiceType",
    "taxableAmount",
    "centralGSTRate",
    "centralGST",
    "stateGSTRate",
    "stateGST",
    "integratedGSTRate",
    "integratedGST",
    "invoiceNumber",
    "asdijasjd",
    "batchCode",
    "mfd",
    "expiry"
  ],
  "exportFilters": [
    {
      "id": "addedOn",
      "dateRange": {"start": 1642291200000,
                        "end": 1642291200000}
    }
  ],
  "frequency": "ONETIME"
}`;

  const [code, setCode] = useState(defaultPayload);
  const [
    unicommerceDataConnectionDataOpen,
    setUnicommerceDataConnectionDataOpen,
  ] = useState(false);

  const handleOpenUnicommerceDataConnectionData = () => {
    setUnicommerceDataConnectionDataOpen(true);
  };
  const handleCloseUnicommerceDataConnectionData = () => {
    setUnicommerceDataConnectionDataOpen(false);
    handleClose();
  };

  const { connectionDetails, loadConnectionDataDetails } = useDataConnection();

  const [allFacilityCodes, setAllFacilityCodes] = useState(
    connectionDetails.map((connection) => connection.facility)
  );
  const [facilityCodes, setFacilityCodes] = useState(allFacilityCodes);

  useEffect(() => {
    setAllFacilityCodes(
      connectionDetails.map((connection) => connection.facility)
    );
    setFacilityCodes(
      connectionDetails.map((connection) => connection.facility)
    );
  }, [connectionDetails]);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const { userInfo, currentCompany } = useAuth();

  const handleConfirm = async () => {
    const dataConnectionPayload = {
      requestPayload: JSON.parse(
        code.replace(/\\n/g, "").replace(/\s+/g, " ").trim()
      ),
    };
    console.log("Data Conn Payload", dataConnectionPayload);
    handleOpenUnicommerceDataConnectionData();

    await loadConnectionDataDetails(
      dataConnectionID,
      dataConnectionPayload,
      userInfo.userID
    );
  };

  const confirmDisabled = code === "" || facilityCodes.length === 0;

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
          {allFacilityCodes.length > 0 ? (
            <Box
              sx={{
                padding: "24px 32px 48px 32px",
                gap: "24px",
              }}
            >
              <Stack spacing={3}>
                <Box sx={{ gap: "24px" }}>
                  <CustomAutocomplete
                    label={"Facility Codes"}
                    isMultiSelect
                    showLabel
                    values={allFacilityCodes}
                    selectedValues={facilityCodes}
                    setSelectedValues={setFacilityCodes}
                    placeholder="Select Facility.."
                  />
                </Box>

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
                    Payload JSON
                  </Typography>
                  <Box
                    sx={{
                      borderRadius: "0px",
                      border: "1px solid #EAECF0",
                      padding: "2px",
                    }}
                  >
                    <Editor
                      height="250px"
                      loading={false}
                      language="json"
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
          ) : (
            <Stack
              direction={"row"}
              justifyContent={"center"}
              sx={{
                border: "1px solid #EAECF0",
                borderRadius: "8px",
                padding: "16px 24px 16px 24px",
                backgroundColor: "#FFFFFF",
              }}
            >
              <CircularProgress size={25} />
            </Stack>
          )}
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
      {unicommerceDataConnectionDataOpen && (
        <UnicommerceDataConnectionData
          open={unicommerceDataConnectionDataOpen}
          handleClose={handleCloseUnicommerceDataConnectionData}
          dataConnectionName={dataConnectionName}
          tenant={tenant}
          tenantURL={tenantURL}
          facilityList={facilityCodes}
          payload={JSON.parse(
            code.replace(/\\n/g, "").replace(/\s+/g, " ").trim()
          )}
        />
      )}
    </Box>
  );
}
