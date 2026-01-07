import { Grid, Box, IconButton, Grow, Zoom, Fade } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Header from "./Header";
import InFlowHeader from "./InFlowHeader";
import useAuth from "../../hooks/useAuth";
import LoadingScreen from "../../components/LoadingScreen";
import ErrorWrapper from "../../components/ErrorWrapper";
import useExperiment from "../../hooks/useExperiment";
import useDataset from "../../hooks/useDataset";
import Chatbot from "../../components/Chatbot/index1";

import Nudge from "./chatBotnudge";
import useImpact from "../../hooks/useImpact";
import Sidebar from "./Sidebar";
import useWorkflow from "../../hooks/useWorkflow";

const DashboardLayout = ({ currentPage }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { isAuthenticated, currentCompany, userInfo } = useAuth();
  const { loadExperiementsList } = useExperiment();
  const { loadDatasetsList } = useDataset();
  const [isLargeSize, setIsLargeSize] = useState(false);
  const { loadImpactPipelines } = useImpact();
  const { loadWorkflows } = useWorkflow();
  useEffect(() => {
    loadExperiementsList(userInfo);
    loadDatasetsList(userInfo);
    loadImpactPipelines(userInfo);
    loadWorkflows(userInfo);
  }, [userInfo]);
  console.log("DashboardLayout Rendered")

  const handleTogglePopup = () => {
    setIsPopupOpen((prev) => !prev);
  };

  const handleToggleSize = () => {
    setIsLargeSize((prev) => !prev);
  };

  const isHome = currentPage === "home";

  if (isAuthenticated && currentCompany?.companyID) {
    return (
      <Grid container direction="column" sx={{ minHeight: "100vh" }}>
        <Grid
          item
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1000,
          }}
        >
          <InFlowHeader currentPage={currentPage} />
        </Grid>

        <Grid item sx={{ width: "64px" }} />

        <Grid
          container
          direction="row"
          sx={{
            flex: 1,
            width:
             "calc(100% - 60px)",
               
            display: "flex",
            alignSelf: "end",
          }}
        >
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#ffffff",
              overflowY: "auto",

              // height of the fixed header
            }}
          >
            <ErrorWrapper>
              
                <Sidebar />
             

              <Outlet />
            </ErrorWrapper>
          </Box>
        </Grid>

        {/* Footer */}
        <Grid item sx={{ height: "60px" }}>
          <Footer />
        </Grid>

        {/* Chatbot Toggle Button */}
        {/* {!isPopupOpen && (
          <Box
            sx={{
              position: "fixed",
              bottom: "80px",
              right: "24px", // for normal chat icon
              // bottom: "120px",
              // right: "60px",
              zIndex: 1500,
            }}
          >
            <IconButton
              onClick={handleTogglePopup}
              sx={{
                backgroundColor: "#90caf9",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#64b5f6",
                },
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <ChatIcon />
            </IconButton>
          </Box>
        )} */}

        {/* Chatbot Popup */}

        {/* {isPopupOpen && (
          <Zoom
            in={isPopupOpen}
            style={{ transformOrigin: "bottom right" }}
            timeout={300}
          >
            <Box
              sx={{
                position: "fixed",
                bottom: "16px",
                right: "16px",
                width: isLargeSize ? "36vw" : "25vw",
                height: isLargeSize ? "83vh" : "65.5vh",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Chatbot
                handleTogglePopup={handleTogglePopup}
                handleToggleSize={handleToggleSize}
                isLargeSize={isLargeSize}
              />
            </Box>
          </Zoom>
        )} */}
      </Grid>
    );
  } else {
    return <LoadingScreen />;
  }
};

export default DashboardLayout;
