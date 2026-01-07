import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Box, DialogActions, DialogContent } from "@mui/material";
import CustomButton from "./CustomButton";
import YouTube from "react-youtube";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
    maxWidth: "900px",
  },
}));
const opts = {
  height: "400",
  width: "100%",
  playerVars: {
    autoplay: 0,
  },
};

export default function VideoOverviewDialog({ open, handleClose, videoUrl }) {
  // Process the video URL to ensure it's embeddable and uses HTTPS
  const processVideoUrl = (url) => {
    if (!url) return "https://www.youtube.com/embed/gabCn2EavuI";

    try {
      // Convert watch URLs to embed URLs
      if (url.includes("youtube.com/watch")) {
        const videoId = new URL(url).searchParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Ensure HTTPS
      return url.replace("http://", "https://");
    } catch (e) {
      console.error("Error processing video URL:", e);
      return "https://www.youtube.com/embed/gabCn2EavuI";
    }
  };

  const embedUrl = processVideoUrl(videoUrl);

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="video-overview-dialog-title"
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          m: 0,
          padding: "20px 26px 19px 26px",
          borderBottom: "1px solid #EAECF0",
        }}
        id="video-overview-dialog-title"
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 500,
            lineHeight: "28px",
            color: "#101828",
            textAlign: "left",
          }}
        >
          Application Overview
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 400,
            color: "#667085",
            mt: 0.5,
          }}
        >
          Learn how to create your first experiment under 5 minutes
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#667085",
            padding: "8px",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "24px" }}>
        <Box
          sx={{
            width: "100%",
            height: "400px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #EAECF0",
          }}
        >
          <video
            width="100%"
            height="100%"
            controls
            style={{ borderRadius: "8px", objectFit: "cover" }}
          >
            <source src="/Demo 5 Minutes.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px 24px 24px" }}>
        <CustomButton onClick={handleClose} title={"Skip"} outlined />
      </DialogActions>
    </BootstrapDialog>
  );
}
