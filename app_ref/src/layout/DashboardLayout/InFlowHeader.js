import * as React from "react";
import { useState, useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as PlusIcon } from "../../assets/Icons/plus.svg";
import CustomTooltip from "../../components/CustomToolTip";


// Material UI imports
import {
  AppBar,
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
  Toolbar,
  Tooltip,
  Typography,
  styled,
  TextField,
  Portal,
} from "@mui/material";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { ReactComponent as ArrowDown } from "../../assets/Icons/downArrow.svg";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupportIcon from "@mui/icons-material/Support";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";

// Import your existing components and assets
import logo from "../../assets/Images/tg_logo1.svg";
import InvitePeopleDialog from "./InvitePeopleDialog";
import { ExportJobs } from "../../components/ExportJobs";
import useAuth from "../../hooks/useAuth";
import useDataset from "../../hooks/useDataset";
import useExports from "../../hooks/useExports";
import { ThemeContext } from "../../theme/config/ThemeContext";
import CustomButton from "../../components/CustomButton";
import NewExperimentDialog from "../../components/NewExperimentDialog";
import SupplyORAutoMLDialog from "../../components/SupplyORAutoMLDialog";
import VideoOverviewDialog from "../../components/OverviewVideoDialog";
import useExperiment from "../../hooks/useExperiment";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import { whiteListedCompanies } from "../../utils/whiteListedCompanies";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import SettingsBackupRestoreOutlinedIcon from "@mui/icons-material/SettingsBackupRestoreOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { updateUserInDatabase } from "../../utils/createUserEntry";
import { processToken } from "../../utils/jwtUtils";

import { useVibe } from "../../hooks/useVibe";        //credit score hook
import { ERROR } from "../../theme/custmizations/colors";
// import useCreditRefresh from "../../hooks/useVibe";


const formatDisplayLabel = (value) => {
  if (!value) return value;

  // Convert string to display format
  let displayValue = value.toString();

  // Handle cases like "site_ID" to "Site ID"
  displayValue = displayValue.replace(
    /_([a-zA-Z])/g,
    (match, letter) => ` ${letter.toUpperCase()}`
  );

  // Handle cases with dots like ". one two" to "One Two"
  displayValue = displayValue.replace(/^\.\s*/, "");

  // Capitalize first letter of each word
  displayValue = displayValue
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return displayValue;
};

// Common styles for menu items
const commonStyles = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "24px",
  letterSpacing: "0em",
  textTransform: "capitalize",
  textAlign: "left",
  color: "#475467",
};
const CompanyIcon = ({ name }) => {
  const initials = name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        backgroundColor: "#0C66E4",
        color: "white",
        fontWeight: "bold",
        fontSize: "1.5rem",
      }}
    >
      {initials}
    </Box>
  );
};

// Main component
function ExperimentsHeader({ currentPage }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { signOut, userInfo, currentCompany, setOtherCompany, setUserInfo ,companies_list } =
    useAuth();
  const { export_jobs_open } = useExports();
  const { loadDatasetsList } = useDataset();
  const navigate = useNavigate();
  const location = useLocation();
  const { experiments_list } = useExperiment();
  // State for sidebar and mobile drawer

const { creditScore, refreshCredits, creditLoading } = useVibe();

  // Poll refreshCredits every 30 seconds starting immediately
  useEffect(() => {
    // Fetch credits immediately on component mount
    refreshCredits().catch((err) => console.error("Failed to refresh credits:", err));
    
    // Set up polling every 30 seconds
    const pollInterval = setInterval(() => {
      refreshCredits().catch((err) => console.error("Failed to refresh credits during polling:", err));
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoOverviewOpen, setVideoOverviewOpen] = useState(false);
  const [newExperimentOpen, setNewExperimentOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [invitePeoplesOpen, setInvitePeoplesOpen] = useState(false);

  // State for editable name
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const nameInputRef = useRef(null);
  const nameContainerRef = useRef(null);
  const [nameFieldPosition, setNameFieldPosition] = useState(null);

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
      icon: <InsightsOutlinedIcon />,
      label: "Insight",
      path: "/dashboard",
    },
    {
      icon: <AutoFixHighIcon />,
      label: "Optimize",
      path: "/optimizations",
    },

    // { icon: <StorageOutlinedIcon />, label: "Data", path: "/datasets" },
    // {
    //   icon: <AssessmentOutlinedIcon />,
    //   label: "Impact",
    //   path: "/impact-analysis",
    // },
    // {
    //   icon: <SettingsBackupRestoreOutlinedIcon />,
    //   label: "Workflows",
    //   path: "/workflows",
    // },
  ];

  const bottomNavigationItems = [
    { icon: <AdminPanelSettingsIcon />, label: "Admin", path: "/admin" },
    { icon: <SupportIcon />, label: "Support", path: "/support" },
    { icon: <SettingsIcon />, label: "Settings", path: "/settings" },
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

  const handleVideoOverviewOpen = () => {
    setVideoOverviewOpen(true);
  };

  const handleVideoOverviewClose = () => {
    setVideoOverviewOpen(false);
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

  useEffect(() => {
    // Initialize name value when userInfo changes
    if (userInfo?.userName) {
      setNameValue(userInfo.userName);
      setIsEditingName(false);
      setNameFieldPosition(null);
    } else {
      setNameValue("");
      setIsEditingName(true);
      // Calculate position after a short delay to ensure DOM is ready
      setTimeout(() => {
        updateNameFieldPosition();
      }, 300);
    }
  }, [userInfo?.userName]);

  const updateNameFieldPosition = () => {
    // Use container ref to include the entire component (TextField + buttons)
    const refToUse = nameContainerRef.current || nameInputRef.current;
    if (refToUse) {
      const rect = refToUse.getBoundingClientRect();
      setNameFieldPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    // Update position when editing state changes
    if (isEditingName && !userInfo?.userName) {
      setTimeout(() => {
        updateNameFieldPosition();
      }, 100);
    }
  }, [isEditingName]);

  useEffect(() => {
    // Update position on scroll/resize
    if (!userInfo?.userName && nameFieldPosition) {
      const handleResize = () => {
        updateNameFieldPosition();
      };
      const handleScroll = () => {
        updateNameFieldPosition();
      };
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [nameFieldPosition, userInfo?.userName]);

  const handleSaveName = async () => {
    const trimmedName = nameValue.trim();

    if (!trimmedName) {
      return; // Don't save empty names
    }

    setIsSavingName(true);
    try {
      const response = await updateUserInDatabase(
        userInfo.userID,
        trimmedName,
        `USERS`,
        `INVITATIONS`
      );
      const user = await processToken(response.user);
      setUserInfo(user);
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to update user name:", err);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setNameValue(userInfo?.userName || "");
    setIsEditingName(false);
  };
   const handleContactSales = () => {
    window.open("https://www.truegradient.ai/contact", "_blank");
  };

  // Reusable EditableName component
  const EditableName = ({ sx = {}, variant = "body2", fontSize = "14px" }) => {
    if (isEditingName || !userInfo?.userName) {
      return (
        <Box
          ref={nameContainerRef}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            width: "100%",
            position: "relative",
            zIndex: 1401,
            ...sx,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TextField
            inputRef={nameInputRef}
            variant="standard"
            placeholder="Enter Your Name"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveName();
              } else if (e.key === "Escape") {
                handleCancelEdit();
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              updateNameFieldPosition();
            }}
            disabled={isSavingName}
            sx={{
              flex: 1,
              "& .MuiInput-underline:before": {
                borderBottomColor: "#D0D5DD",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: "#98A2B3",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#0C66E4",
              },
              input: {
                padding: "4px 0",
                fontFamily: "Inter",
                fontSize: fontSize,
                fontWeight: "400",
                color: "#44546F",
              },
            }}
            autoFocus
          />
          {userInfo?.userName && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelEdit();
              }}
              disabled={isSavingName}
              sx={{
                padding: "2px",
                color: "#667085",
                "&:hover": { backgroundColor: "rgba(102, 112, 133, 0.08)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveName();
            }}
            disabled={isSavingName || !nameValue.trim()}
            sx={{
              padding: "2px",
              minWidth: "24px",
              width: "24px",
              height: "24px",
              color: "#0C66E4",
              "&:hover": { backgroundColor: "rgba(12, 102, 228, 0.08)" },
              "&.Mui-disabled": { color: "#98A2B3" },
            }}
          >
            <CheckIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </Box>
      );
    }
    return (
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.5, ...sx }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography
          variant={variant}
          sx={{
            fontFamily: "Inter",
            fontSize: fontSize,
            fontWeight: "400",
            lineHeight: fontSize === "12px" ? "12px" : "21px",
            textAlign: "left",
            color: "#44546F",
            ...sx,
          }}
        >
          {userInfo.userName}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditingName(true);
          }}
          sx={{
            padding: "2px",
            color: "#667085",
            "&:hover": { backgroundColor: "rgba(102, 112, 133, 0.08)" },
          }}
        >
          <EditIcon fontSize="1px" />
        </IconButton>
      </Box>
    );
  };

  // Mobile drawer content
  const mobileDrawerContent = (
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
        <EditableName />

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
                aria-label={btn.label}
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

        <Stack spacing={2}>
          {bottomNavigationItems.map((btn, index) => {
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
            );
          })}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Persistent sidebar for larger screens */}

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderColor:
              theme.palette.borderColor?.sideNav || "rgba(0, 0, 0, 0.12)",
            backgroundColor: theme.palette.background?.default || "#fff",
            mt: "60px",
            maxHeight: "calc(100% - 60px)",
            boxShadow:
              "0px 4px 6px -2px rgba(16, 24, 40, 0.08), 0px 12px 16px -4px rgba(16, 24, 40, 0.14)",
          },
        }}
      >
        {mobileDrawerContent}
      </Drawer>

      {/* Main content area with AppBar */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${sidebarOpen ? drawerWidth : 72}px)` },
          ml: { lg: `${sidebarOpen ? drawerWidth : 72}px` },
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            boxShadow: 0,
            height: "60px",
            backgroundColor: theme.palette.background?.default || "#fff",
            borderBottom: "1px solid",
            borderBottomColor:
              theme.palette.borderColor?.header || "rgba(0, 0, 0, 0.12)",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: { lg: `calc(100% - 0}px)` },
            ml: { lg: `${sidebarOpen ? drawerWidth : 72}px` },
            transition: (theme) =>
              theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: "100%",
              backgroundColor: theme.palette.background?.default || "#fff",
            }}
          >
            <Toolbar
              variant="regular"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  height: "44px",
                  gap: "40px",
                }}
              >
                <a href="/" alt="home">
                  <img
                    className="img"
                    src={logo || "/placeholder.svg"}
                    alt="logo"
                  />
                </a>


                <Box sx={{ display: { xs: "none", lg: "flex" }, gap: "15px" }}>
                  {navigationItems.map((btn, index) => {
                    return (
                      <MenuItem
                        key={index}
                        onClick={() => handleNavigation(btn.path, btn.label)}
                        sx={{
                          py: "6px",
                          px: "12px",
                          borderBottom:
                            currentPage === btn.path.split("/")[1]
                              ? "3px solid #0C66E4"
                              : "none",
                        }}
                      >
                        <Typography
                          sx={{
                            ...commonStyles,
                            color:
                              currentPage === btn.path.split("/")[1]
                                ? "#0C66E4"
                                : "#475467",
                          }}
                        >
                          {btn.label}
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </Box>
              </Box>
              <Box
                sx={{
                  display: { xs: "none", lg: "flex" },
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                {/*      <Stack direction={"row"} gap={1} alignItems={"center"}>
                  <CompanyIcon name={currentCompany.companyName} />
                  <Stack>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "16px",
                        fontWeight: "bold",

                        textAlign: "left",
                        color: "#44546F",
                      }}
                    >
                      {currentCompany.companyName}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "12px",
                        fontWeight: "400",
                        lineHeight: "12px",
                        textAlign: "left",
                        color: "#44546F",
                      }}
                    >
                      {userInfo.userName}
                    </Typography>
                  </Stack>
                </Stack> */}
                <Stack direction="row" spacing={0.2} alignItems="center">
                  
                 { !currentCompany.isPremium && (
                  <CustomTooltip
                  arrow
                    title={
                      <span>
                        {creditScore <= 0
                          ? "You are running out of Credits!"
                          : "Do you want to add more Credits?"}{" "}
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleContactSales();
                          }}
                          style={{
                            color: "#2a62c4ff",
                            textDecoration: "underline",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Contact Sales
                        </a>
                      </span>
                    }
                    placement="bottom"
                  >
                   <Box
    sx={{
      display: { xs: "none", lg: "flex" },
      alignItems: "center",
      gap: "6px",
      px: 1.5,
      py: 0.5,
      borderRadius: "999px",
      backgroundColor:creditScore <= 0 ? ERROR[100] : "rgba(12, 102, 228, 0.06)",
      border:creditScore <= 0 ? "1px solid #F97066" : "1px solid rgba(12, 102, 228, 0.16)",
    }}
  >
  <Typography
    sx={{
      fontFamily: "Inter",
      fontSize: "12px",
      fontWeight: 500,
      color: creditScore <= 0 ? ERROR[600]: "#475467",
    }}
  >
    Credits
  </Typography>
  <Typography
    sx={{
      fontFamily: "Inter",
      fontSize: "14px",
      fontWeight: 700,
      color:creditScore <= 0 ? ERROR[600] : "#0C66E4",
    }}
  >
    {creditScore ?? 0}
  </Typography>
  

 {/* <Button size="small" onClick={refreshCredits} disabled={creditLoading}>
  {creditLoading ? "..." : "Refresh"}
</Button> */}

</Box> 
</CustomTooltip>
                )}
                  <IconButton onClick={handleVideoOverviewOpen}>
                    <PlayCircleOutlineOutlinedIcon
                      style={{ color: "#667085" }}
                      fontSize="small"
                    />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      navigate(`/${currentCompany.companyName}/user-guide`);
                    }}
                  >
                    <FolderCopyOutlinedIcon
                      style={{ color: "#667085" }}
                      fontSize="small"
                    />
                  </IconButton>
                  {currentCompany.invite_users ? (
                    <IconButton onClick={handleInvitePeoplesOpen}>
                      <PersonAddOutlinedIcon
                        style={{ color: "#667085" }}
                        fontSize="small"
                      />
                    </IconButton>
                  ) : null}
                  <ExportJobs key={`${export_jobs_open}`} />
                </Stack>

                {/*  <Avatar src="/broken-image.jpg" />
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
                </Typography> */}
                <Stack
                  direction={"row"}
                  gap={1}
                  alignItems={"center"}
                  onClick={handleMenuOpen}
                  sx={{ cursor: "pointer" }}
                >
                  <CompanyIcon name={currentCompany.companyName} />
                  <Stack>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "16px",
                        fontWeight: "bold",

                        textAlign: "left",
                        color: "#44546F",
                      }}
                    >
                      {formatDisplayLabel(currentCompany.companyName)}
                    </Typography>
                    <EditableName fontSize="12px" />
                  </Stack>
                  <Button
                    onClick={handleMenuOpen}
                    sx={{
                      textTransform: "none",
                      fontFamily: "Inter",
                      minWidth: "0",
                      fontWeight: "400",
                      borderRadius: "50%",
                      padding: "2px",
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    <ArrowDown />
                  </Button>
                </Stack>
              </Box>
              <IconButton
                color={theme.palette.text?.modelHeading || "inherit"}
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ display: { lg: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Box>
        </AppBar>
      </Box>

      {/* User menu */}
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
          <ArrowDown />
        </Button>
        <Menu  
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { p: 0, bgcolor: "#fff", minWidth: 220, mr: -28 } }}
        >
         { (companies_list.length > 1) && (
          <MenuItem
            onClick={() => setOtherCompany(userInfo)}
            sx={{ pl: 2, ml: 0, pr: 2, width: '100%', justifyContent: 'flex-start', bgcolor: "#fff", borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <SwitchAccountIcon sx={{ mr: 1, color: "#667085" }} fontSize="small" />
            Switch Company
          </MenuItem>
         )}
          <MenuItem
            
            onClick={signOut}
            sx={{ pl: 2, ml: 0, pr: 2, width: '100%', justifyContent: 'flex-start', bgcolor: "#fff", borderRadius: 1, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <LogoutIcon sx={{ mr: 1, color: "#667085" }} fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Box>

      <SupplyORAutoMLDialog
        open={newExperimentOpen}
        handleClose={handleNewExperimentClose}
      />

      {/* Invite People Dialog */}
      <InvitePeopleDialog
        open={invitePeoplesOpen}
        handleClose={handleInvitePeoplesClose}
      />

      <VideoOverviewDialog
        open={videoOverviewOpen}
        handleClose={handleVideoOverviewClose}
        videoUrl={"https://www.youtube.com/embed/gabCn2EavuI"}
      />

      {/* Subtle Overlay for Name Input */}
      {!userInfo?.userName && nameFieldPosition && (
        <Portal>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1400,
              pointerEvents: "none",
            }}
          >
            {/* Top blocking area */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: `${nameFieldPosition.top - 12}px`,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                pointerEvents: "auto",
                animation: "fadeIn 0.3s ease-in",
                "@keyframes fadeIn": {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            {/* Bottom blocking area */}
            <Box
              sx={{
                position: "absolute",
                top: `${
                  nameFieldPosition.top + nameFieldPosition.height + 12
                }px`,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                pointerEvents: "auto",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            {/* Left blocking area */}
            <Box
              sx={{
                position: "absolute",
                top: `${nameFieldPosition.top - 12}px`,
                left: 0,
                width: `${nameFieldPosition.left - 12}px`,
                height: `${nameFieldPosition.height + 24}px`,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                pointerEvents: "auto",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            {/* Right blocking area */}
            <Box
              sx={{
                position: "absolute",
                top: `${nameFieldPosition.top - 12}px`,
                left: `${
                  nameFieldPosition.left + nameFieldPosition.width + 12
                }px`,
                right: 0,
                height: `${nameFieldPosition.height + 24}px`,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                pointerEvents: "auto",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            {/* Subtle glow around the input field */}
            <Box
              sx={{
                position: "absolute",
                top: `${nameFieldPosition.top - 12}px`,
                left: `${nameFieldPosition.left - 12}px`,
                width: `${nameFieldPosition.width + 24}px`,
                height: `${nameFieldPosition.height + 24}px`,
                borderRadius: "4px",
                boxShadow: `
                0 0 0 2px rgba(12, 102, 228, 0.6),
                0 0 12px rgba(12, 102, 228, 0.4)
              `,
                animation: "gentlePulse 2s ease-in-out infinite",
                pointerEvents: "none",
                "@keyframes gentlePulse": {
                  "0%, 100%": {
                    boxShadow: `
                    0 0 0 2px rgba(12, 102, 228, 0.6),
                    0 0 12px rgba(12, 102, 228, 0.4)
                  `,
                  },
                  "50%": {
                    boxShadow: `
                    0 0 0 2px rgba(12, 102, 228, 0.8),
                    0 0 16px rgba(12, 102, 228, 0.5)
                  `,
                  },
                },
              }}
            />

            {/* Small arrow pointing to the field */}
            <Box
              sx={{
                position: "absolute",
                top: `${
                  nameFieldPosition.top + nameFieldPosition.height + 20
                }px`,
                left: `${
                  nameFieldPosition.left + nameFieldPosition.width / 2
                }px`,
                transform: "translateX(-50%)",
                color: "white",
                animation: "gentleBounce 1.5s ease-in-out infinite",
                pointerEvents: "none",
                "@keyframes gentleBounce": {
                  "0%, 100%": {
                    transform: "translateX(-50%) translateY(0)",
                  },
                  "50%": {
                    transform: "translateX(-50%) translateY(6px)",
                  },
                },
              }}
            >
              <ArrowUpwardIcon
                sx={{
                  fontSize: "28px",
                  filter: `
                    drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))
                    drop-shadow(0 0 16px rgba(255, 255, 255, 0.6))
                    drop-shadow(0 0 24px rgba(255, 255, 255, 0.4))
                  `,
                }}
              />
            </Box>

            {/* Subtle instruction text */}
            <Box
              sx={{
                position: "absolute",
                top: `${nameFieldPosition.top - 70}px`,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(12, 102, 228, 0.9)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                fontFamily: "Inter",
                fontSize: "14px",
                fontWeight: 500,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                animation: "fadeIn 0.3s ease-in",
              }}
            >
              Please enter your name
            </Box>
          </Box>
        </Portal>
      )}
    </Box>
  );
}

export default ExperimentsHeader;
