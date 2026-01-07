import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  Checkbox,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { toast } from "react-toastify";

const DownloadMenu = ({
  anchorEl,
  onClose,
  multiDownloadFiles = {},
  currentCompany,
  onContactSales,
  onDownloadMultiple,
}) => {
  const [selectedReports, setSelectedReports] = useState({});
  const [loadingMultiDownload, setLoadingMultiDownload] = useState(false);

  const handleMultiDownload = async () => {
    const selectedCount = Object.keys(selectedReports).length;
    
    if (selectedCount === 0) {
      toast.warning("Please select at least one report to download");
      return;
    }

    if (!currentCompany?.download_reports) {
      onContactSales?.();
      onClose();
      return;
    }

    setLoadingMultiDownload(true);
    try {
      await onDownloadMultiple(selectedReports);
      toast.success(`Successfully downloaded ${selectedCount} report${selectedCount !== 1 ? 's' : ''}!`);
      setSelectedReports({});
      onClose();
    } catch (error) {
      console.error("Error downloading multiple reports:", error);
      toast.error("Failed to download reports");
    } finally {
      setLoadingMultiDownload(false);
    }
  };

  const handleReportToggle = (reportTitle, filePath) => {
    setSelectedReports(prev => {
      const newSelection = { ...prev };
      if (newSelection[reportTitle]) {
        delete newSelection[reportTitle];
      } else {
        newSelection[reportTitle] = filePath;
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (Object.keys(selectedReports).length === Object.keys(multiDownloadFiles).length) {
      setSelectedReports({});
    } else {
      setSelectedReports({ ...multiDownloadFiles });
    }
  };

  const selectedCount = Object.keys(selectedReports).length;
  const totalCount = Object.keys(multiDownloadFiles).length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 200,
          maxWidth: 280,
          backgroundColor: "#FFF",
          boxShadow: "0px 8px 32px rgba(16, 24, 40, 0.16)",
          p: 0,
          marginTop: "6px",
          maxHeight: 400,
        },
      }}
      MenuListProps={{
        sx: {
          p: 0,
          margin: "0px",
        },
      }}
    >
      {/* Header */}
      <Typography
        sx={{
          padding: "8px 12px 6px 12px",
          fontFamily: "Inter",
          fontSize: "11px",
          fontWeight: 600,
          color: "#344054",
          borderBottom: "1px solid #EAECF0",
          margin: 0,
        }}
      >
        Select Reports to Download
      </Typography>

      {/* Select All Option */}
      <Box>
        <MenuItem
          onClick={handleSelectAll}
          sx={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            color: "#344054",
            px: 1.5,
            py: "6px",
            minHeight: "unset",
            borderRadius: 0,
            display: "flex",
            alignItems: "center",
            "&:hover": {
              backgroundColor: "#F9F5FF",
              color: "#7F56D9",
            },
          }}
        >
          <Checkbox
            checked={selectedCount === totalCount && totalCount > 0}
            indeterminate={selectedCount > 0 && selectedCount < totalCount}
            size="small"
            sx={{
              m: 0,
              p: 0,
              mr: 1,
              "& .MuiSvgIcon-root": { fontSize: 14 },
            }}
          />
          Select All
        </MenuItem>
        <Box sx={{ borderBottom: "1px solid #EAECF0", mx: 0 }} />
      </Box>

      {/* Scrollable Report List */}
      <Box sx={{ maxHeight: 250, overflowY: "auto" }}>
        {Object.entries(multiDownloadFiles).map(([reportTitle, filePath], index) => (
          <Box key={reportTitle}>
            <MenuItem
              onClick={() => handleReportToggle(reportTitle, filePath)}
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                color: "#344054",
                px: 1.5,
                py: "6px",
                minHeight: "unset",
                borderRadius: 0,
                display: "flex",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "#F9F5FF",
                  color: "#7F56D9",
                },
              }}
            >
              <Checkbox
                checked={!!selectedReports[reportTitle]}
                size="small"
                sx={{
                  m: 0,
                  p: 0,
                  mr: 1,
                  "& .MuiSvgIcon-root": { fontSize: 14 },
                }}
              />
              {reportTitle}
            </MenuItem>
            {index < Object.keys(multiDownloadFiles).length - 1 && (
              <Box sx={{ borderBottom: "1px solid #EAECF0", mx: 0 }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Download Button */}
      <Box 
        sx={{ 
          padding: "12px 12px",
          borderTop: "1px solid #EAECF0",
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={loadingMultiDownload ? <CircularProgress size={16} /> : <GetAppIcon />}
          onClick={handleMultiDownload}
          disabled={loadingMultiDownload || selectedCount === 0}
          size="small"
          sx={{
            fontFamily: "Inter",
            fontSize: "12px",
            fontWeight: 500,
            textTransform: "none",
            backgroundColor: "#7F56D9",
            borderRadius: "6px",
            py: "6px",
            "&:hover": {
              backgroundColor: "#6941C6",
            },
            "&:disabled": {
              backgroundColor: "#9ca3af",
              color: "#fff",
            },
          }}
        >
          {loadingMultiDownload 
            ? "Downloading..." 
            : `Download ${selectedCount} Report${selectedCount !== 1 ? 's' : ''}`
          }
        </Button>
      </Box>
    </Menu>
  );
};

export default DownloadMenu;