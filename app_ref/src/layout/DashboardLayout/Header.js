import * as React from "react";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Portal,
} from "@mui/material";
import logo from "../../assets/Images/tg_logo1.svg";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import { ReactComponent as SearchIcon } from "../../assets/Icons/search.svg";
import { ReactComponent as Moon } from "../../assets/Icons/moon.svg";
import { ReactComponent as Info } from "../../assets/Icons/info.svg";

import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { ReactComponent as Notification } from "../../assets/Icons/notification.svg";
import ProfilePic from "../../assets/Images/profilePicture.svg";
import { ReactComponent as ArrowDown } from "../../assets/Icons/downArrow.svg";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { useContext } from "react";
import useAuth from "../../hooks/useAuth";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import InvitePeopleDialog from "./InvitePeopleDialog";
import useDataset from "../../hooks/useDataset";
import { ReactComponent as Solution } from "../../assets/Icons/solution.svg";
import { ReactComponent as SolutionDark } from "../../assets/Icons/solution_dark.svg";
import { ReactComponent as Home } from "../../assets/Icons/home.svg";
import { ReactComponent as CheckSquare } from "../../assets/Icons/check-square.svg";
import { ReactComponent as Flag } from "../../assets/Icons/flag.svg";
import { ReactComponent as Bot } from "../../assets/Icons/bot.svg";
import { ReactComponent as Layers } from "../../assets/Icons/3-layers.svg";
import { ReactComponent as Support } from "../../assets/Icons/support.svg";
import { ReactComponent as Deployements } from "../../assets/Icons/DeploymentIcon.svg";
import { ReactComponent as Admin } from "../../assets/Icons/admin.svg";
import { ReactComponent as Settings } from "../../assets/Icons/settings.svg";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CardDialog from "../../components/Dialog/Dialog";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import { ReactComponent as ExportIcon } from "../../assets/Icons/export.svg";
import { ExportJobs, ExportJobsDropdown } from "../../components/ExportJobs";
import useExports from "../../hooks/useExports";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import DifferenceOutlinedIcon from "@mui/icons-material/DifferenceOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { updateUserInDatabase } from "../../utils/createUserEntry";
import { processToken } from "../../utils/jwtUtils";
const drawerWidth = 240;
const styles = {
  mainTypo: {
    fontFamily: "Inter",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "24px",
    textAlign: "left",
    color: "#44546F",
  },
  subTypo: {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
    textAlign: "left",
    color: "#626F86",
    whiteSpace: "pre-line",
  },
  textSmbold: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
    textAlign: "left",
    color: "#344054",
    textTransform: "none",
  },
  selectedTextSmbold: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
    textAlign: "left",
    color: "#0C66E4",
    textTransform: "none",
  },
};
const cardData = [
  {
    title: "Advanced Planning System (APS)",
    description:
      "Optimize strategic and operational planning for e-commerce/D2C brands in an interconnected manner to include demand forecasting, managing inventory levels,\n promotion strategies, markdown timing, and assortment plans.",
    moduleName: "inventory-optimization",
  },
  {
    title: "Demand Planning",
    description:
      "Predict future demand for a product or service by analysing historical \nsales data, market trends, seasonality, external factors, events, and \n other relevant factors.",
    moduleName: "demand-planning",
  },
  {
    title: "Inventory Optimization",
    description:
      "This involves optimizing inventory levels based on forecasted demand \n to guarantee products are accessible when and where required,\n thereby reducing instances of both stockouts and surplus inventory.",
    moduleName: "inventory-optimization",
  },
  {
    title: "Pricing & Promotion Optimization",
    description:
      "Optimize the efficiency of pricing and promotional approaches to enhance \n return on investment (ROI) while considering business parameters such as\n sell-through targets, budget constraints & shelf-life considerations.",
    moduleName: "pricing-promotion-optimization",
  },
  {
    title: "Assortment Planning",
    description:
      "Optimize store product assortment by considering size, characteristics, \n location, and customer preferences. Account for halo and cannibalization \n effects.",
    moduleName: "assortment-planning",
  },
];
const buttonConfig = [
  {
    icon: <InsightsOutlinedIcon sx={{ color: "inherit" }} />,
    label: "Dashboard",
    path: "/dashboard",
    rolesAllowed: ["admin", "creator", "viewer", "superAdmin"],
  },

  {
    icon: <TuneOutlinedIcon sx={{ color: "inherit" }} />,
    label: "Scenario Plan",
    path: "/scenario",
    rolesAllowed: ["admin", "creator", "superAdmin"],
  },
  {
    icon: <ScienceOutlinedIcon sx={{ color: "inherit" }} />,
    label: "Experiment",
    path: "/experiments",
    rolesAllowed: ["admin", "creator", "viewer", "superAdmin"],
  },
  {
    icon: <AssessmentOutlinedIcon sx={{ color: "inherit" }} />,
    label: "Impact",
    path: "/impact-analysis",
    rolesAllowed: ["admin", "creator", "superAdmin"],
  },
  {
    icon: <StorageOutlinedIcon sx={{ color: "inherit" }} />,
    label: "Dataset",
    path: "/datasets",
    rolesAllowed: ["admin", "creator", "viewer", "superAdmin"],
  },
  // {
  //   icon: <DifferenceOutlinedIcon sx={{ color: "inherit" }} />,
  //   label: "User Guide",
  //   path: "/user-guide",
  //   rolesAllowed: ["admin", "creator", "viewer", "superAdmin"],
  // },
  {
    icon: <Admin sx={{ color: "inherit" }} />,
    label: "Admin One",
    path: "/admin",
    rolesAllowed: ["admin", "superAdmin"],
  },
  {
    icon: <PersonAddOutlinedIcon sx={{ color: "inherit" }} fontSize="small" />,
    label: "Invite People",
    path: "",
    rolesAllowed: ["admin", "superAdmin"],
  },
];

// function stringAvatar(name) {
//   return {
//     sx: {
//       bgcolor: "#0066CB",
//     },
//     children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
//   };
// }

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

function Header({ isHome }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { signOut, userInfo, currentCompany, setOtherCompany, setUserInfo } =
    useAuth();
  const [invitePeoplesOpen, setInvitePeoplesOpen] = useState(false);
  const handleInvitePeoplesOpen = () => setInvitePeoplesOpen(true);
  const handleInvitePeoplesClose = () => setInvitePeoplesOpen(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false); // State to manage mobile drawer
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { loadDatasetsList } = useDataset();
  const { loadExportJobsList, export_jobs_open } = useExports();
  const location = useLocation();

  // State for editable name
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const nameInputRef = useRef(null);
  const nameContainerRef = useRef(null);
  const [nameFieldPosition, setNameFieldPosition] = useState(null);
  useEffect(() => {
    loadExportJobsList(userInfo);
  }, []);

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

  // Reusable EditableName component
  const EditableName = ({ sx = {}, variant = "body2" }) => {
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
                fontSize: "14px",
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
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "21px",
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleClickOpen = (card) => {
    setSelectedCard(card);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCard(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%", // Adjusted to fill the Drawer
        padding: "20px 16px 0px 16px", // Ensure padding matches desired design
      }}
    >
      <Stack spacing={2}>
        <Stack direction={"row"} gap={2} alignItems={"center"}>
          <CompanyIcon
            name={currentCompany?.companyName}
            backgroundColor="#0C66E4"
          />
          <Stack gap={1}>
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
            <EditableName />
          </Stack>
        </Stack>
        <Divider />
        {buttonConfig.slice(0, 7).map((btn, index) => {
          if (
            (btn.label === "Invite People" || btn.label === "Admin") &&
            !currentCompany.invite_users
          ) {
            return null;
          }
          return (
            <Button
              key={index}
              fullWidth
              onClick={async () => {
                console.log("clicked");
                if (btn.label === "Dataset") {
                  // await loadDatasetsList(userInfo);
                  navigate(`/${currentCompany?.companyName}${btn.path}`);
                } else {
                  navigate(`/${currentCompany?.companyName}${btn.path}`);
                }
                if (btn.label === "Invite People") {
                  handleInvitePeoplesOpen();
                }
                setMobileOpen(false); // Close drawer on navigation
              }}
              sx={{
                justifyContent: "flex-start",
                color: btn.label === "Home" ? "" : "#44546F",
                backgroundColor:
                  btn.label === "Home"
                    ? theme.palette.button.backgroundOnHover
                    : "transparent",
                "&:hover": {
                  color: theme.palette.button.textOnHover,
                  backgroundColor: theme.palette.button.backgroundOnHover,
                },
              }}
            >
              <Stack spacing={1} direction="row">
                {btn.icon}
                <Typography
                  sx={
                    btn.label === "Home"
                      ? styles.selectedTextSmbold
                      : styles.textSmbold
                  }
                >
                  {btn.label}
                </Typography>
              </Stack>
            </Button>
          );
        })}
      </Stack>
      {/* <Stack spacing={2} sx={{ padding: "0px 16px 32px 16px" }}>
        
        {buttonConfig.slice(7).map((btn, index) => (
          <Button
            key={index}
            fullWidth
            onClick={() => {
              console.log("clicked");
              navigate(`/${currentCompany?.companyName}${btn.path}`);
              setMobileOpen(false); // Close drawer on navigation
            }}
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
      </Stack> */}
    </Box>
  );
  const mobileDrawer = (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
        padding: "20px 16px 0px 16px",
      }}
    >
      <Stack direction={"row"} gap={2} alignItems={"center"}>
        <Avatar src="/broken-image.jpg" />
        <EditableName />

        <Box>
          <Button
            onClick={handleMenuOpen}
            sx={{
              textTransform: "none",
              minWidth: "0",
              fontFamily: "Inter",
              width: "30px",
              fontWeight: "bold",
              borderRadius: "50%",
              padding: "2px",
              height: "30px",
            }}
          >
            <ArrowDown />
          </Button>
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
        </Box>
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
          <Stack direction={"row"} gap={2} alignItems={"center"}>
            <CompanyIcon name={currentCompany.companyName} />
            <Stack gap={1}>
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
              <EditableName />
            </Stack>
          </Stack>
          <Divider />

          {buttonConfig.slice(0, 7).map((btn, index) => {
            if (
              (btn.label === "Invite People" || btn.label === "Admin") &&
              !currentCompany.invite_users
            ) {
              return null;
            }

            const isSelected = location.pathname.includes(btn.path);

            return (
              <Button
                key={index}
                fullWidth
                onClick={async () => {
                  console.log("clicked");
                  if (btn.label === "Dataset") {
                    await loadDatasetsList(userInfo);
                    navigate(`/${currentCompany?.companyName}${btn.path}`);
                  } else {
                    navigate(`/${currentCompany?.companyName}${btn.path}`);
                  }
                  setMobileOpen(false); // Close drawer on navigation
                }}
                sx={{
                  justifyContent: "flex-start",
                  backgroundColor: isSelected
                    ? theme.palette.button.backgroundOnHover
                    : "transparent",
                  color: isSelected
                    ? theme.palette.button.textOnHover
                    : "#44546F", // Default color when not selected
                  "&:hover": {
                    color: theme.palette.button.textOnHover,
                    backgroundColor: theme.palette.button.backgroundOnHover,
                  },
                }}
              >
                <Stack spacing={1} direction="row">
                  {React.cloneElement(btn.icon, {
                    sx: { color: "inherit" }, // Icon inherits text color
                  })}
                  <Typography
                    sx={
                      isSelected ? styles.selectedTextSmbold : styles.textSmbold
                    }
                  >
                    {btn.label}
                  </Typography>
                </Stack>
              </Button>
            );
          })}
        </Stack>
        {/* <Stack spacing={2} sx={{ padding: "0px 16px 32px 16px" }}>
          {buttonConfig.slice(7).map(
            (btn, index) =>
              btn.rolesAllowed.includes("creator") && (
                <Button
                  key={index}
                  fullWidth
                  onClick={() => {
                    navigate(`/${currentCompany?.companyName}${btn.path}`);
                    setMobileOpen(false); // Close drawer on navigation
                  }}
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
              )
          )}
        </Stack> */}
      </Box>
    </Box>
  );

  console.log("isHome:", isHome);
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100%)`,
          ml: { md: `${drawerWidth}px` }, // Adjust based on screen size
          boxShadow: 0,
          height: "60px",
          backgroundColor: theme.palette.background.default,
          borderBottom: "1px solid",
          borderBottomColor: theme.palette.borderColor.header,
          zIndex: (theme) => theme.zIndex.drawer + 1,
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
                src={logo}
                alt="TrueGradient AI Logo"
                fetchpriority="high"
                loading="eager"
                decoding="async"
              />
            </a>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: "12px",
              alignItems: "center",
            }}
          >
            {currentCompany.invite_users ? (
              <IconButton onClick={handleInvitePeoplesOpen}>
                <PersonAddOutlinedIcon
                  style={{ color: "#667085" }}
                  fontSize="small"
                />
              </IconButton>
            ) : null}
            {/* <Info /> */}
            <ExportJobs key={`${export_jobs_open}`} />
            {
              // <IconButton
              //   onClick={() => {
              //     navigate(`/${currentCompany?.companyName}/user-guide`);
              //   }}
              // >
              //   <FolderCopyOutlinedIcon />
              // </IconButton>
            }
            <Avatar src="/broken-image.jpg" />
            <EditableName />
            <Box>
              <Button
                onClick={handleMenuOpen}
                sx={{
                  textTransform: "none",
                  minWidth: "0",
                  fontFamily: "Inter",
                  borderRadius: "50%",
                  padding: "2px",
                  width: "30px",
                  height: "30px",
                  fontWeight: "bold",
                }}
              >
                <ArrowDown />
              </Button>
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
            </Box>
          </Box>
          {/* <IconButton
            onClick={toggleTheme}
            sx={{ display: { md: "none" }, marginX: "24px" }} // Show only on small screens
          >
            <Moon />
          </IconButton> */}
          <IconButton
            color={theme.palette.text.modelHeading}
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" } }} // Show only on small screens
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {isHome ? (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" }, // Hide on small screens
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              borderColor: theme.palette.borderColor.sideNav,
              backgroundColor: theme.palette.background.default,
              borderRadius: "8px",
              maxHeight: "calc(100% - 176px)",
              mt: "92px",
              ml: "24px",
              boxShadow:
                "0px 4px 6px -2px rgba(16, 24, 40, 0.08), 0px 12px 16px -4px rgba(16, 24, 40, 0.14)",
            },
          }}
          open={mobileOpen} // Control the drawer on mobile
          onClose={handleDrawerToggle}
        >
          {drawer}
        </Drawer>
      ) : null}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" }, // Show only on small screens
          [`& .MuiDrawer-paper`]: {
            boxSizing: "border-box",
            width: drawerWidth,
            borderColor: theme.palette.borderColor.sideNav,
            backgroundColor: theme.palette.background.default,
            mt: "60px",
            maxHeight: "calc(100% - 60px)",
            boxShadow:
              "0px 4px 6px -2px rgba(16, 24, 40, 0.08), 0px 12px 16px -4px rgba(16, 24, 40, 0.14)",
          },
        }}
      >
        {mobileDrawer}
      </Drawer>

      {/* <Box
        component="main"
        sx={{
          flexGrow: 1,
          margin: "72px 0px 32px 0px", // Adjusted top margin to account for AppBar height
          ml: { md: "24px" },
          p: 3,
        }}
      >
        <Grid
          container
          sx={{ display: "flex", flexDirection: { md: "row" }, gap: "24px" }}
        >
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {cardData.map((card, index) => (
                <Grid item sm={index === 0 ? 12 : 6} key={card.title}>
                  <Card
                    onClick={() => handleClickOpen(card)}
                    sx={{
                      border: "1px solid",
                      borderColor: theme.palette.borderColor.solutionCard,
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                        transform: "translateY(-2px)",
                        transition: "all 0.3s ease-in-out",
                      },
                      cursor: "pointer",
                    }}
                  >
                    <Stack
                      spacing={1}
                      direction="row"
                      alignItems="center"
                      sx={{
                        borderRadius: "3px 3px 0 0",
                        paddingLeft: "48px",
                        backgroundColor: theme.palette.background.paper,
                        height: "64px",
                      }}
                    >
                      {theme.palette.mode === "light" ? (
                        <Solution />
                      ) : (
                        <SolutionDark />
                      )}
                      <Typography sx={styles.mainTypo}>{card.title}</Typography>
                    </Stack>
                    <CardContent
                      sx={{
                        paddingLeft: "40px",
                        backgroundColor: theme.palette.background.default,
                      }}
                    >
                      <Typography sx={styles.subTypo}>
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
        {selectedCard && (
          <CardDialog
            open={open}
            onClose={handleClose}
            selectedCard={selectedCard}
          />
        )}
      </Box> */}
      <InvitePeopleDialog
        open={invitePeoplesOpen}
        handleClose={handleInvitePeoplesClose}
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

export default Header;
