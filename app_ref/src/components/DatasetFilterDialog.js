import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  DialogActions,
  DialogContent,
  Stack,
} from "@mui/material";

import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import CustomButton from "./CustomButton";

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
  },
}));

export default function DatasetFiltersDialog({
  open,
  handleClose,
  uniqueSources,
  uniqueTags,
  uniqueCreators,
  selectedSources,
  setSelectedSources,
  selectedTags,
  setSelectedTags,
  selectedCreators,
  setSelectedCreators,
}) {
  const [localSources, setLocalSources] = React.useState(selectedSources);
  const [localTags, setLocalTags] = React.useState(selectedTags);
  const [localCreators, setLocalCreators] = React.useState(selectedCreators);

  React.useEffect(() => {
    if (open) {
      setLocalSources(selectedSources);
      setLocalTags(selectedTags);
      setLocalCreators(selectedCreators);
    }
  }, [open, selectedSources, selectedTags, selectedCreators]);

  const handleApplyFilters = () => {
    setSelectedSources(localSources);
    setSelectedTags(localTags);
    setSelectedCreators(localCreators);
    handleClose();
  };

  const handleResetFilters = () => {
    setLocalSources([]);
    setLocalTags([]);
    setLocalCreators([]);
    setSelectedSources([]);
    setSelectedTags([]);
    setSelectedCreators([]);
    handleClose();
  };

  return (
    <BootstrapDialog onClose={handleClose} open={open} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          padding: "20px 26px 19px 26px",
          borderBottom: "1px solid #EAECF0",
        }}
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
          Filter Datasets
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
      <DialogContent>
        <Stack spacing={3} padding="16px 0px">
          <Box>
            <CustomAutocomplete
              isMultiSelect={true}
              multiple
              values={uniqueSources}
              selectedValues={localSources}
              setSelectedValues={setLocalSources}
              label="Source"
              placeholder="Select sources"
              showLabel
            />
          </Box>
          
          <Box>
            <CustomAutocomplete
              isMultiSelect={true}
              multiple
              values={uniqueTags}
              selectedValues={localTags}
              setSelectedValues={setLocalTags}
              label="Data Tag"
              placeholder="Select data tags"
              showLabel
            />
          </Box>
          
          <Box>
            <CustomAutocomplete
              isMultiSelect={true}
              multiple
              values={uniqueCreators}
              selectedValues={localCreators}
              setSelectedValues={setLocalCreators}
              label="Created By"
              placeholder="Select creators"
              showLabel
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px" }}>
        <CustomButton
          onClick={handleResetFilters}
          title="Reset Filters"
          outlined
        />
        <CustomButton
          onClick={handleApplyFilters}
          title="Apply Filters"
          loadable
        />
      </DialogActions>
    </BootstrapDialog>
  );
}