import * as React from "react";
import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as PlusIcon } from "../../assets/Icons/plus.svg";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
// Material UI imports
import {
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  styled,
} from "@mui/material";

// Icons
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import SettingsBackupRestoreOutlinedIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SupportIcon from "@mui/icons-material/Support";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

// Import components and hooks
import CustomButton from "../../components/CustomButton";
import InvitePeopleDialog from "./InvitePeopleDialog";
import SupplyORAutoMLDialog from "../../components/SupplyORAutoMLDialog";
import useAuth from "../../hooks/useAuth";
import useDataset from "../../hooks/useDataset";
import { ThemeContext } from "../../theme/config/ThemeContext";
import CustomTooltip from "../../components/CustomToolTip";
import { whiteListedCompanies } from "../../utils/whiteListedCompanies";

// Create a styled drawer with a custom width
const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})(({ theme, open, drawerWidth }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  backgroundColor: "white",
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    backgroundColor: "white",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    ...(open
      ? {
          width: drawerWidth,
        }
      : {
          width: theme.spacing(7),
          [theme.breakpoints.up("sm")]: {
            width: theme.spacing(9),
          },
        }),
  },
}));

function Sidebar() {
  // Hooks
  const { theme } = useContext(ThemeContext);
  const { signOut, userInfo, currentCompany, setOtherCompany } = useAuth();
  const { loadDatasetsList } = useDataset();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [newExperimentOpen, setNewExperimentOpen] = useState(false);
  const [invitePeoplesOpen, setInvitePeoplesOpen] = useState(false);

  const drawerWidth = 240;

  const currentCompanyId = currentCompany.companyID;

  const isWhiteListedCompany = whiteListedCompanies.includes(currentCompanyId);

  // Navigation items configuration
  const navigationItems = [
    // Order for non-whitelisted companies: Agent, Plan, Insights, Experiment, Data, Impact, Workflows, Optimize
    {
      icon: <AutoAwesomeIcon />,
      label: "Agent",
      path: "/agent",
    },
    {
      icon: <ScienceOutlinedIcon />,
      label: "Experiment",
      path: "/experiments",
    },
    { icon: <TuneOutlinedIcon />, label: "Plan", path: "/scenario" },
    {
      icon: <AutoFixHighIcon />,
      label: "Optimize",
      path: "/optimizations",
    },
    {
      icon: <InsightsOutlinedIcon />,
      label: "Insight",
      path: "/dashboard",
    },

    { icon: <StorageOutlinedIcon />, label: "Data", path: "/datasets" },
    {
      icon: <AssessmentOutlinedIcon />,
      label: "Impact",
      path: "/impact-analysis",
    },
    {
      icon: <SettingsBackupRestoreOutlinedIcon />,
      label: "Workflows",
      path: "/workflows",
    },
    {
      icon: <SpeakerNotesOutlinedIcon />,
      label: "Meeting Notes",
      path: "/meeting-notes",
    },
  ];
  const bottomNavigationItems = [
    {
      icon: <AdminPanelSettingsOutlinedIcon />,
      label: "Admin",
      path: "/admin",
    },
    {
      icon: <EmojiObjectsOutlinedIcon />,
      label: "Solutions",
      path: "/solutions",
    },
    //{ icon: <SupportIcon />, label: "Support", path: "/support" },
    { icon: <SettingsOutlinedIcon />, label: "Settings", path: "/settings" },
  ];

  // Handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarOpen = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleInvitePeoplesOpen = () => {
    setInvitePeoplesOpen(true);
  };

  const handleInvitePeoplesClose = () => {
    setInvitePeoplesOpen(false);
  };

  const handleNewExperimentOpen = () => setNewExperimentOpen(true);
  const handleNewExperimentClose = () => setNewExperimentOpen(false);

  const handleNavigation = async (path, label) => {
    if (label === "Datasets") {
      await loadDatasetsList(userInfo);
    }
    navigate(`/${currentCompany?.companyName}${path}`);
    setMobileOpen(false);
  };

  const isPathActive = (path) => {
    return location.pathname.includes(path);
  };

  // Desktop sidebar content
  const desktopSidebarContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo at the top */}
      <Box
        sx={{
          display: "flex",
          width: sidebarOpen ? "100%" : "60%",
          alignItems: "center",
          justifyContent: "center",
          p: 1,
          marginLeft: "auto",
          marginRight: "auto",
          pt: 4,
        }}
      >
        {sidebarOpen ? (
          <CustomButton
            onClick={handleNewExperimentOpen}
            title={sidebarOpen ? "New Experiment" : ""}
            CustomStartAdornment={<PlusIcon />}
            // outlined = {!sidebarOpen}
          />
        ) : (
          <IconButton
            sx={{
              //backgroundColor: "#EFF4FF",
              backgroundColor: "#0B58F5",

              padding: "2px",
              "&:hover": {
                //backgroundColor: "#D1E0FF",
                backgroundColor: "#0C66E4",
              },
            }}
            onClick={() => {
              handleNewExperimentOpen();
            }}
          >
            <AddRoundedIcon
              sx={{
                fontSize: "30px",
                padding: "0px",
                //color: "#0B58F5",
                color: "#FFFFFF",
                borderRadius: "50%",
                "&:hover": {
                  //color: "#0644C2",
                  color: "#FFFFFF",
                },
              }}
            />
          </IconButton>
        )}
      </Box>

      {/* Main navigation items */}
      <List>
        {navigationItems.map((item) => {
          const isActive = isPathActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
              <CustomTooltip
                title={sidebarOpen ? "" : item.label}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path, item.label)}
                  sx={{
                    minHeight: 48,
                    justifyContent: sidebarOpen ? "initial" : "center",
                    px: 2.5,
                    backgroundColor: isActive
                      ? theme.palette.button.backgroundOnHover
                      : "transparent",
                    color: isActive
                      ? theme.palette.button.textOnHover
                      : "inherit",
                    "&:hover": {
                      backgroundColor: "rgba(12, 102, 228, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarOpen ? 3 : "auto",
                      justifyContent: "center",
                      color: isActive ? "#0C66E4" : "inherit",
                      "& .MuiSvgIcon-root": {
                        fontSize: 24, // Slightly larger icons
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      opacity: sidebarOpen ? 1 : 0,
                      color: isActive ? "#0C66E4" : "inherit",
                    }}
                  />
                </ListItemButton>
              </CustomTooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom navigation items */}
      <Box sx={{ mt: "auto" }}>
        <List>
          {bottomNavigationItems.map((item) => {
            if (item.label === "Admin" && !currentCompany.invite_users) {
              return null;
            }
            const isActive = isPathActive(item.path);
            return (
              <ListItem
                key={item.path}
                disablePadding
                sx={{ display: "block" }}
              >
                <CustomTooltip
                  title={sidebarOpen ? "" : item.label}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    onClick={() => handleNavigation(item.path, item.label)}
                    sx={{
                      minHeight: 48,
                      justifyContent: sidebarOpen ? "initial" : "center",
                      px: 2.5,
                      backgroundColor: isActive
                        ? "rgba(12, 102, 228, 0.08)"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(12, 102, 228, 0.08)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 3 : "auto",
                        justifyContent: "center",
                        color: isActive ? "#0C66E4" : "inherit",
                        "& .MuiSvgIcon-root": {
                          fontSize: 24,
                        },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        opacity: sidebarOpen ? 1 : 0,
                        color: isActive ? "#0C66E4" : "inherit",
                      }}
                    />
                  </ListItemButton>
                </CustomTooltip>
              </ListItem>
            );
          })}

          {/* Invite users button */}
          {currentCompany.invite_users && (
            <ListItem disablePadding sx={{ display: "block" }}>
              <CustomTooltip
                title={sidebarOpen ? "" : "Invite People"}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={handleInvitePeoplesOpen}
                  sx={{
                    minHeight: 48,
                    justifyContent: sidebarOpen ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarOpen ? 3 : "auto",
                      justifyContent: "center",
                      "& .MuiSvgIcon-root": {
                        fontSize: 24,
                      },
                    }}
                  >
                    <PersonAddOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Invite People"
                    sx={{ opacity: sidebarOpen ? 1 : 0 }}
                  />
                </ListItemButton>
              </CustomTooltip>
            </ListItem>
          )}
        </List>

        {/* User profile section - only shown when sidebar is expanded */}
        {sidebarOpen && (
          <Box sx={{ p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.12)" }}>
            <Button
              fullWidth
              onClick={handleMenuOpen}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                gap: 1,
              }}
            >
              <Avatar src="/broken-image.jpg" sx={{ width: 32, height: 32 }} />
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: "400",
                  color: "#44546F",
                  textAlign: "left",
                }}
              >
                {userInfo.userName}
              </Typography>
            </Button>
          </Box>
        )}
      </Box>

      {/* Toggle button at the bottom */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: sidebarOpen ? drawerWidth - 28 : 12,
          zIndex: 1,
          transition: (theme) =>
            theme.transitions.create(["left"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <IconButton
          onClick={sidebarOpen ? handleSidebarClose : handleSidebarOpen}
          sx={{
            backgroundColor: "#f5f5f5",
            "&:hover": {
              backgroundColor: "#e0e0e0",
            },
            border: "1px solid #e0e0e0",
          }}
        >
          {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
    </Box>
  );

  // Mobile sidebar content
  const mobileSidebarContent = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
        padding: "20px 16px 0px 16px",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src="/broken-image.jpg" />
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "21px",
            textAlign: "left",
            color: "#44546F",
          }}
        >
          {userInfo.userName}
        </Typography>

        <Box>
          <Button
            onClick={handleMenuOpen}
            sx={{
              textTransform: "none",
              minWidth: "0",
              fontFamily: "Inter",
              fontWeight: "bold",
              borderRadius: "50%",
              padding: "2px",
              width: "30px",
              height: "30px",
            }}
          >
            <ArrowDropDownIcon />
          </Button>
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="start">
        {currentCompany.invite_users ? (
          <IconButton onClick={handleInvitePeoplesOpen}>
            <PersonAddOutlinedIcon
              style={{ color: "#667085" }}
              fontSize="small"
            />
          </IconButton>
        ) : null}
      </Stack>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          height: "100%",
          padding: "20px 0px 0px 0px",
        }}
      >
        <Stack spacing={2}>
          {navigationItems.map((btn, index) => {
            const isSelected = location.pathname.includes(btn.path);

            return (
              <Button
                key={index}
                fullWidth
                onClick={() => handleNavigation(btn.path, btn.label)}
                sx={{
                  justifyContent: "flex-start",
                  backgroundColor: isSelected
                    ? theme.palette.button?.backgroundOnHover ||
                      "rgba(12, 102, 228, 0.08)"
                    : "transparent",
                  color: isSelected
                    ? theme.palette.button?.textOnHover || "#0C66E4"
                    : "#44546F",
                  "&:hover": {
                    color: theme.palette.button?.textOnHover || "#0C66E4",
                    backgroundColor:
                      theme.palette.button?.backgroundOnHover ||
                      "rgba(12, 102, 228, 0.08)",
                  },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {React.cloneElement(btn.icon, {
                    sx: { color: "inherit" },
                  })}
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "16px",
                      fontWeight: 600,
                      lineHeight: "24px",
                      textAlign: "left",
                      color: "inherit",
                      textTransform: "none",
                    }}
                  >
                    {btn.label}
                  </Typography>
                </Stack>
              </Button>
            );
          })}
        </Stack>

        <Stack spacing={2} sx={{ padding: "0px 16px 32px 16px" }}>
          {bottomNavigationItems.map((btn, index) => (
            <Button
              key={index}
              fullWidth
              onClick={() => handleNavigation(btn.path, btn.label)}
              sx={{
                justifyContent: "flex-start",
                "&:hover": {
                  color: theme.palette.button?.textOnHover || "#0C66E4",
                  backgroundColor:
                    theme.palette.button?.backgroundOnHover ||
                    "rgba(12, 102, 228, 0.08)",
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {btn.icon}
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontWeight: 600,
                    lineHeight: "24px",
                    textAlign: "left",
                    color: "inherit",
                    textTransform: "none",
                  }}
                >
                  {btn.label}
                </Typography>
              </Stack>
            </Button>
          ))}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <StyledDrawer
        variant="permanent"
        open={sidebarOpen}
        drawerWidth={drawerWidth}
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            marginTop: "60px", // Space for the AppBar
            height: "calc(100% - 60px)",
            boxSizing: "border-box",
          },
        }}
      >
        {desktopSidebarContent}
      </StyledDrawer>

      {/* Mobile Sidebar */}

      {/* User menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => setOtherCompany(userInfo)}>
          <SwitchAccountIcon
            style={{ marginRight: "8px", color: "#667085" }}
            fontSize="small"
          />
          Switch Company
        </MenuItem>
        <MenuItem onClick={signOut}>
          <LogoutIcon
            style={{ marginRight: "8px", color: "#667085" }}
            fontSize="small"
          />
          Logout
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <SupplyORAutoMLDialog
        open={newExperimentOpen}
        handleClose={handleNewExperimentClose}
      />

      <InvitePeopleDialog
        open={invitePeoplesOpen}
        handleClose={handleInvitePeoplesClose}
      />
    </>
  );
}

export default Sidebar;
