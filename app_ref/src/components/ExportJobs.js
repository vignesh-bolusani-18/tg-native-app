import {
  Box,
  Chip,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import {
  CheckRounded,
  ErrorRounded,
  WarningRounded,
  Settings, // Import the gear icon
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { ReactComponent as ExportIcon } from "../assets/Icons/export.svg";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import AccessTimeTwoToneIcon from "@mui/icons-material/AccessTimeTwoTone";
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone";
import useExports from "../hooks/useExports";
import { WARNING } from "../theme/custmizations/colors";
import useAuth from "../hooks/useAuth";

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
    minWidth: "320px",
    boxShadow: theme.shadows[2],
  },
  "& .MuiMenuItem-root": {
    padding: "8px 16px",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

// Function to get styles based on experimentStatus
const getStatusStyles = (status) => {
  switch (status) {
    case "Completed":
      return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
    case "Running":
      return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
    case "Failed":
      return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
    case "Terminated":
      return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error

    // New cases added below
    case "Initiating...":
      return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
    case "Initializing...":
      return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
    case "Executing":
      return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
    case "Initiated":
      return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started, stable
    case "Terminating":
      return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
    case "On Hold":
      return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state
    case "Queued":
      return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state  
    case "Retrying...":
      return { color: "#EA580C", backgroundColor: "#FFEDD5" }; // Orange: Retrying in progress
    case "Executed":
      return { color: "#1D4ED8", backgroundColor: "#DBEAFE" }; // Dark Blue: Intermediate status
    case "Launching...":
      return { color: "#0EA5E9", backgroundColor: "#E0F2FE" }; // Light Blue: Launching in progress

    // New case for DataProcessCompleted
    case "DataProcessCompleted":
      return { color: "#059669", backgroundColor: "#D1FAE5" }; // Teal Green: Intermediate completion

    // Default styles
    default:
      return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Neutral/unknown
  }
};
const ExportJobIcon = ({ status }) => {
  const stepIconStyle = (bgColor = "#FFF") => ({
    backgroundColor: bgColor,
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });
  const iconStyle = (color = "#FFF") => ({
    color: color,
    width: "20px", // Make current step icon larger
    height: "20x", // Make current step icon larger
  });
  if (status === "Completed") {
    return (
      <Stack sx={stepIconStyle()}>
        <CheckRounded style={iconStyle("#12B76A")} />
      </Stack>
    );
  } else if (status === "Failed") {
    return (
      <Box sx={stepIconStyle()}>
        <ErrorRounded style={iconStyle("#DC2626")} />
      </Box>
    );
  } else if (status === "On Hold") {
    return (
      <Box sx={stepIconStyle()}>
        <WarningRounded style={iconStyle(WARNING[300])} />
      </Box>
    );
  } else {
    return (
      <Stack sx={stepIconStyle()}>
        <Settings className="rotating-icon" style={iconStyle("#1E40AF")} />
        <style>
          {`
          .rotating-icon {
            animation: rotate 5s linear infinite; /* Animation for rotation */
          }

          /* Keyframes for rotation */
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
        </style>
      </Stack>
    );
  }
};
const ExportJobItem = ({ exportJob }) => {
  return (
    <Stack
      gap={"4px"}
      sx={{
        width: "100%", // Ensures it takes the full width of the parent
        padding: "0px", // Optional: Adjust padding for better spacing
        boxSizing: "border-box",
      }}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{ width: "100%" }}
      >
        <Stack direction={"row"} alignItems={"center"} gap={"8px"}>
          <ExportJobIcon status={exportJob.exportJobStatus} />
          <Typography
            sx={{
              fontSize: "16px",
              fontFamily: "Inter",
              fontWeight: 600,
              lineHeight: "20px",
              color: "#101828",
            }}
          >
            {exportJob.exportPipelineName}
          </Typography>
        </Stack>

        <Chip
          label={exportJob.exportJobStatus}
          size="small"
          sx={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "14px",
            ...getStatusStyles(exportJob.exportJobStatus),
          }}
        />
      </Stack>
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          color: "grey",
        }}
      >
        {exportJob.exportJobExperimentName}
      </Typography>
    </Stack>
  );
};

export const ExportJobs = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { loadExportJobsList, export_jobs_list } = useExports();
  const { userInfo } = useAuth();
  const { export_jobs_open, setExportJobsOpen } = useExports();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // setExportJobsOpen(true)
  };

  const handleClose = () => {
    setAnchorEl(null);
    // setExportJobsOpen(false)
  };
  useEffect(() => {
    loadExportJobsList(userInfo);
  }, [open]);
  return (
    <Box>
      <IconButton
        aria-label="export-jobs"
        aria-controls={open ? "export-jobs-menu" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <IosShareRoundedIcon
          sx={{
            fontSize: "20px",
            fontWeight: "bold",
            color: open ? "black" : "grey",
          }}
        />
      </IconButton>
      <StyledMenu
        id="export-jobs-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {export_jobs_list.map((exportJob) => (
          <MenuItem key={exportJob.exportJobID}>
            <ExportJobItem exportJob={exportJob} />
          </MenuItem>
        ))}
        {export_jobs_list.length === 0 && (
          <MenuItem disabled>
            <Typography
              sx={{
                fontSize: "14px",
                color: "#667085",
              }}
            >
              No export jobs available
            </Typography>
          </MenuItem>
        )}
      </StyledMenu>
    </Box>
  );
};
