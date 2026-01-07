import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";


import { Grid, Box, Stack, Skeleton, CircularProgress } from "@mui/material";

import useDataConnection from "../../../../../hooks/useDataConnection";
import { useState } from "react";
import { useEffect } from "react";

import ConnectionDataTable from "../../../../../components/ConnectionDataTable";


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



export default function ConnectionDatasets({
  open,
  handleClose,
  handleOpen,
  dataConnectionID,
  dataConnectionName,
}) {
  const { connectionDetails, SetConnectionsDetails } = useDataConnection();
  const [length, setLength] = useState(connectionDetails.length);
  const newHandleClose = async () => {
    handleClose();
    SetConnectionsDetails([]);
  };
  useEffect(() => {
    setLength(connectionDetails.length);
  }, [connectionDetails]);

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={newHandleClose}
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
              {dataConnectionName}
            </Typography>

            <Stack direction="row" spacing={1}>
              <IconButton
                aria-label="close"
                onClick={async () => {
                  newHandleClose();
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
          <Box
            sx={{
              padding: "12px 16px",
              alignContent: "center",
              justifyContent: "center",
            }}
          >
            {connectionDetails.length > 0 ? (
              <ConnectionDataTable
                dataConnectionID={dataConnectionID}
                dataConnectionName={dataConnectionName}
                handleClose={newHandleClose}
              />
            ) : (
              <Stack direction={"row"} justifyContent={"center"}>
                <CircularProgress size={25} />
              </Stack>
            )}
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );
}
