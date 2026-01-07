import React from "react";
import {
  Typography,
  Box,
  Stack,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useEffect } from "react";
import useExperiment from "../../../../hooks/useExperiment";
import LogsAccordion from "../../../../components/LogsAccordion";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoadingScreen from "./../../../../components/LoadingScreen";
import useAuth from "../../../../hooks/useAuth";

const titleText = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "28px",
  textAlign: "left",
  color: "#101828",
  textTransform: "none",
};

const contentText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  textAlign: "left",
  color: "#475467",
  textTransform: "none",
};

const ExpRunLogs = () => {
  const { logs, fetchLogs } = useExperiment();
  const {userInfo} = useAuth();
  useEffect(() => {
    fetchLogs(userInfo.userID);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs(userInfo.userID);
    }, 60000); // Polling every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Box sx={{ padding: "20px 24px 19px 24px" }}>
        <Stack
          direction="row"
          // justifyContent={"flex-end"}
          sx={{ padding: "12px", marginBottom: "16px", alignItems: "center" }}
        >
          <Typography sx={titleText}>Log Details</Typography>
          <IconButton onClick={fetchLogs}>
            <RefreshIcon />
          </IconButton>
        </Stack>
        {logs ? <LogsAccordion logs={logs} /> : null}
      </Box>
    </Box>
  );
};

export default ExpRunLogs;
