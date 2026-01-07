import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import useExperiment from "../hooks/useExperiment";
import CustomButton from "./CustomButton";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: "20px 20px",
  },
  "& .MuiDialogActions-root": {
    padding: "16px 32px 32px 32px",
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

const DescriptionDialog = ({
  open,
  onClose,
  experiment,
  loading = false,
}) => {
  const [description, setDescription] = useState("");
  const { updateExperimentDescriptionAndReload } = useExperiment();

  useEffect(() => {
    if (open && experiment) {
      setDescription(experiment.exp_description || "");
    }
  }, [open, experiment]);

  const handleClose = () => {
    setDescription("");
    onClose();
  };

  const handleSave = async () => {
    if (experiment && description !== undefined) {
      await updateExperimentDescriptionAndReload(
        experiment.experimentID,
        description
      );
      handleClose();
    }
  };

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      {/* Close Button */}
      <Box
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: "#667085",
            padding: "8px",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent>
        <DialogTitle
          sx={{
            fontFamily: "Inter",
            fontSize: "19px",
            fontWeight: 600,
            color: "#101828",
            px: 0,
            pb: 1,
          }}
        >
          {experiment?.exp_description ? "Edit Description" : "Add Description"}
        </DialogTitle>

        <DialogContentText
          sx={{
            mb: 2,
            fontFamily: "Inter",
            fontSize: "14px",
            color: "#475467",
          }}
        >
          <Typography component="span" sx={{ fontWeight: 500 }}>
            Experiment:
          </Typography>{" "}
          {experiment?.experimentName}
          <Typography
            component="div"
            sx={{
              fontFamily: "Inter",
              fontSize: "12px",
              fontWeight: 400,
              color: "#667085",
              mt: 0.5,
            }}
          >
            ID: {experiment?.experimentID}
          </Typography>
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description for this experiment..."
          disabled={loading}
          sx={{
            "& .MuiOutlinedInput-root": {
              fontFamily: "Inter",
              fontSize: "14px",
              borderRadius: "10px",
            },
            "& .MuiInputLabel-root": {
              fontFamily: "Inter",
              fontSize: "14px",
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        {/* Cancel Button (Outlined) */}
        <CustomButton title="Cancel" onClick={handleClose} outlined />

        {/* Save Button (Loadable) */}
        <CustomButton
          title="Save Changes"
          onClick={handleSave}
          loadable
          disabled={!description.trim()}
          loading={loading}
        />
      </DialogActions>
    </BootstrapDialog>
  );
};

export default DescriptionDialog;
