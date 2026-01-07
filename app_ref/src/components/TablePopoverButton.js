import React, { useState } from "react";
import {
  IconButton,
  Popover,
  Box,
  Fade,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import SimpleTable from "./SimpleTable";

const TablePopoverButton = ({ title, filePath }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "table-popover" : undefined;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          color: "primary.main",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.08)",
            transform: "scale(1.1)",
          },
        }}
      >
        <InfoIcon fontSize="small" />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock={true}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              width: "auto",
              maxWidth: "600px",
              maxHeight: "500px",
              overflow: "hidden",
              borderRadius: 2,
              mt: 1,
              background: "linear-gradient(to bottom, #ffffff, #fafafa)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
            },
          },
        }}
        BackdropProps={{
          invisible: true,
        }}
      >
        <Box sx={{ position: "relative", height: "100%" }}>
          {/* Close button */}
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

          {/* Table container with custom scrollbar */}
          <Box
            sx={{
              height: "100%",
              overflow: "auto",
             
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
      </Popover>
    </>
  );
};

export default TablePopoverButton;