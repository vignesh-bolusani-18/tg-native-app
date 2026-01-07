import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Grid,
  TextField,
} from "@mui/material";
import CustomTextInput from "../../../../components/CustomInputControls/CustomTextInput";

const EnrichmentConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  selectedEnrichmentData,
  globalStartDate,
  globalEndDate,
}) => {
  const [comment, setComment] = useState("");
  const handleConfirm = () => {
    onConfirm(comment);
    setComment("");
  };

  const handleCancel = () => {
    onClose();
    setComment("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0px 20px 24px -4px #10182814, 0px 8px 8px -4px #10182808",
          border: "1px solid #EAECF0",
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: "1.5rem 1.5rem 1rem 1.5rem",
          borderBottom: "1px solid #EAECF0",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: "1.125rem",
            color: "#101828",
            lineHeight: "1.75rem",
          }}
        >
          Add Enrichment Confirmation
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: "1.5rem",
          backgroundColor: "#FFFFFF",
        }}
      >
        {selectedEnrichmentData && (
          <Stack spacing={3}>
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "0.875rem",
                color: "#344054",
                lineHeight: "1.25rem",
              }}
            >
              Are you sure you want to add{" "}
              <strong>{selectedEnrichmentData.enrichment.Type}</strong>{" "}
              enrichment for{" "}
              <strong>
                {selectedEnrichmentData.suggestion.Dimension}:{" "}
                {selectedEnrichmentData.suggestion.Value}
              </strong>
              ?
            </Typography>

            <Box
              sx={{
                padding: "1.25rem",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                border: "1px solid #EAECF0",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#344054",
                      lineHeight: "1rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Period:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "0.75rem",
                      color: "#667085",
                      lineHeight: "1rem",
                    }}
                  >
                    {globalStartDate} to {globalEndDate}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#344054",
                      lineHeight: "1rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Expected Impact:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "0.75rem",
                      color: "#10B981",
                      fontWeight: 600,
                      lineHeight: "1rem",
                    }}
                  >
                    +
                    {(selectedEnrichmentData.enrichment.Reward * 100).toFixed(
                      1
                    )}
                    %
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#344054",
                      lineHeight: "1rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Rank:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "0.75rem",
                      color: "#667085",
                      lineHeight: "1rem",
                    }}
                  >
                    #{selectedEnrichmentData.enrichment.Rank} out of{" "}
                    {selectedEnrichmentData.suggestion.Enrichments.length}{" "}
                    options
                  </Typography>
                </Grid>
              </Grid>
            </Box>
             <CustomTextInput
          showLabel
          label={"Comment (Optional)"}
          placeholder="Enter Comment "
          name="Comment"
          value={comment}
          onChange={(e) => {
            const { value } = e.target;
            setComment(value);
          }}
        />
          </Stack>
        )}

       
      </DialogContent>

      <DialogActions
        sx={{
          padding: "1rem 1.5rem 1.5rem 1.5rem",
          gap: "0.75rem",
          borderTop: "1px solid #EAECF0",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{
            fontFamily: "Inter",
            fontSize: "0.875rem",
            fontWeight: 600,
            lineHeight: "1.25rem",
            color: "#344054",
            borderColor: "#D0D5DD",
            borderRadius: "8px",
            padding: "0.625rem 1rem",
            textTransform: "none",
            boxShadow: "0px 1px 2px 0px #1018280D",
            "&:hover": {
              borderColor: "#98A2B3",
              backgroundColor: "#F9FAFB",
              boxShadow: "0px 1px 2px 0px #1018281A",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            fontFamily: "Inter",
            fontSize: "0.875rem",
            fontWeight: 600,
            lineHeight: "1.25rem",
            backgroundColor: "#10B981",
            borderRadius: "8px",
            padding: "0.625rem 1rem",
            textTransform: "none",
            boxShadow: "0px 1px 2px 0px #1018280D",
            "&:hover": {
              backgroundColor: "#059669",
              boxShadow: "0px 1px 2px 0px #1018281A",
            },
          }}
        >
          Confirm & Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnrichmentConfirmationDialog;
