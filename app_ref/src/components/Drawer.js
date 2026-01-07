import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ReactComponent as Home } from "../assets/Icons/home.svg";

import { ReactComponent as CheckSquare } from "../assets/Icons/check-square.svg";
import { ReactComponent as Flag } from "../assets/Icons/flag.svg";
import { ReactComponent as Layers } from "../assets/Icons/3-layers.svg";
import { ReactComponent as Support } from "../assets/Icons/support.svg";
import { ReactComponent as Deployements } from "../assets/Icons/DeploymentIcon.svg";
import { ReactComponent as Admin } from "../assets/Icons/admin.svg";
import { ReactComponent as Settings } from "../assets/Icons/settings.svg";
import { ThemeContext } from "../theme/config/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Stack, Grid, Button } from "@mui/material";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import useAuth from "../hooks/useAuth";

const drawerWidth = 205;
const styles = {
  textSmbold: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
    textAlign: "left",
    color: "#344054",
    textTransform: "none",
  },
};

const buttonConfig = [
  { icon: <InsightsOutlinedIcon />, label: "Dashboards", path: "/dashboard" },
  
  
  { icon: <StorageOutlinedIcon/>, label: "Datasets", path: "/datasets" },
  { icon: <TuneOutlinedIcon />, label: "Deployments", path: "/scenario" },
  { icon: <Admin />, label: "Admin One", path: "/admin" },
  { icon: <ScienceOutlinedIcon />, label: "Experiment", path: "/experiments" },
  // { icon: <Support />, label: "Support", path: "/support" },
  // { icon: <Settings />, label: "Settings", path: "/settings" },
];

const MyDrawer = ({ mobileOpen, handleDrawerToggle }) => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { currentCompany } = useAuth();

  const drawer = (
    <Box sx={{ display: "flex", flex: 1 }}>
      <Toolbar />
      <Box
        sx={{
          paddingTop: "80px",
          //   paddingLeft: "24px",
          height: "100%",
          display: "flex",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            flex: 1,
            border: "1px solid red",
          }}
        >
          <Stack spacing={2} sx={{ padding: "20px 16px 0px 16px" }}>
            {buttonConfig.slice(0, 6).map((btn, index) => (
              <Button
                key={index}
                fullWidth
                onClick={() =>
                  navigate(`/${currentCompany.companyName}${btn.path}`)
                }
                sx={{
                  justifyContent: "flex-start",
                  "&:hover": {
                    color: theme.palette.button.textOnHover,
                    backgroundColor: theme.palette.button.backgroundOnHover,
                  },
                }}
              >
                <Stack spacing={1} direction="row">
                  {btn.icon}
                  <Typography sx={styles.textSmbold}>{btn.label}</Typography>
                </Stack>
              </Button>
            ))}
          </Stack>
          <Stack spacing={2} sx={{ padding: "0px 16px 32px 16px" }}>
            {buttonConfig.slice(6).map((btn, index) => (
              <Button
                key={index}
                fullWidth
                onClick={() =>
                  navigate(`/${currentCompany.companyName}${btn.path}`)
                }
                sx={{
                  justifyContent: "flex-start",
                  "&:hover": {
                    color: theme.palette.button.textOnHover,
                    backgroundColor: theme.palette.button.backgroundOnHover,
                  },
                }}
              >
                <Stack spacing={1} direction="row">
                  {btn.icon}
                  <Typography sx={styles.textSmbold}>{btn.label}</Typography>
                </Stack>
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
      <Toolbar />
      <Toolbar />
    </Box>
  );

  return (
    <Box
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
        // border: "1px solid green",
        // height: "100px",
      }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          border: "1px solid green",
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "flex" },
          flex: 1,

          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
            backgroundColor: "transparent",
            marginBottom: "100px",
            border: "1px solid green",
            display: "flex",
            height: "93%",
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default MyDrawer;
