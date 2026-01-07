import React, { useState } from "react";
import {
  Button,
  IconButton,
  Popover,
  Box,
  Fade,
  Modal,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import CustomTooltip from "./CustomToolTip";
import SimpleTable from "./SimpleTable";

const MetricsButton = ({ title, filePath }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "metrics-popover" : undefined;

  return (
    <>
      <CustomTooltip
        placement="top"
        title="Future Time metrics"
        arrow
      >
        <Button
          startIcon={<InfoIcon />}
          onClick={handleClick}
          variant="outlined"
          size="small"
          sx={{
            color: "#374151",
            borderColor: "#d1d5db",
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              borderColor: "#9ca3af",
              backgroundColor: "#f9fafb",
            },
          }}
        >
          Metrics
        </Button>
      </CustomTooltip>

      <Modal
  open={open}
  onClose={handleClose}
  closeAfterTransition
  slotProps={{
    backdrop: {
      timeout: 300,
    },
  }}
>
  <Fade in={open} timeout={300}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "#ffffff",
        borderRadius: 2,
        width: "90%",
        maxWidth: "650px",
        
        boxShadow: 24,
        overflow: "hidden",
        border: "1px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 4,
          top: 4,
          zIndex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 1)",
            transform: "rotate(90deg)",
          },
          transition: "all 0.3s ease-in-out",
        }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* Modal Content */}
      <Box
        sx={{
          height: "100%",
          overflow: "auto",
          p: 1.5,
          pt: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "3px",
            "&:hover": {
              background: "rgba(0, 0, 0, 0.3)",
            },
          },
        }}
      >
        <SimpleTable title={title} filePath={filePath} />
      </Box>
    </Box>
  </Fade>
</Modal>

    </>
  );
};

export default MetricsButton;