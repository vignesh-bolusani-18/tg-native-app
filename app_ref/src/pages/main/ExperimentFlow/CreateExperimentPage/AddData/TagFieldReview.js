import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { ReactComponent as openMenuIcon } from "../../../../../assets/Icons/openMenuIcon.svg";
import InputBase from "@mui/material/InputBase";
import { ReactComponent as TagCloseIcon } from "../../../../../assets/Icons/x.svg";

import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Stack,
  useTheme,
} from "@mui/material";
import ViewDataset from "./ViewDataset";
import { useState } from "react";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: " 1px solid #EAECF0",
    backgroundColor: "#FFFFFF",
  },
}));

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: 30,
  },
  "& .MuiInputBase-input": {
    borderRadius: "8px",
    position: "relative",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D0D5DD",
    fontSize: "16px",
    padding: "10px 14px 10px 14px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: "Inter",
    fontWeight: "400",
    "&:focus": {
      borderRadius: "8px",
    },
  },
}));

const fieldData = {
  selectData: [
    {
      label: "Placeholder",
      values: ["Placeholder 1", "Placeholder 2", "Placeholder 3"],
      isMultiSelect: false,
    },
    {
      label: "Date Format",
      values: ["Date Format 1", "Date Format 2", "Date Format 3"],
      isMultiSelect: false,
    },
    {
      label: "Target",
      values: ["Target 1", "Target 2", "Target 3"],
      isMultiSelect: false,
    },
    {
      label: "Granularity",
      values: ["Granularity 1", "Granularity 2", "Granularity 3"],
      isMultiSelect: false,
    },
    {
      label: "Driver",
      values: ["Driver 1", "Driver 2", "Driver 3"],
      isMultiSelect: false,
    },
    {
      label: "Optimization Field",
      values: [
        "Optimization Field 1",
        "Optimization Field 2",
        "Optimization Field 3",
      ],
      isMultiSelect: false,
    },
    {
      label: "Other Interesting Dimensions",
      values: ["Dimension 1", "Dimension 2", "Dimension 3"],
      isMultiSelect: false,
    },
    {
      label: "Returns",
      values: ["Return 1", "Return 2", "Return 3"],
      isMultiSelect: false,
    },
  ],
  SkucodeData: [
    {
      label: "Type",
      values: ["Type 1", "Type 2", "Type 3"],
      isMultiSelect: false,
    },
    { label: "Age", values: ["Age 1", "Age 2", "Age 3"], isMultiSelect: false },
    {
      label: "FillNA",
      values: ["FillNA 1", "FillNA 2", "FillNA 3"],
      isMultiSelect: false,
    },
    { label: "Tag", values: ["Tag 1", "Tag 2", "Tag 3"], isMultiSelect: true },
  ],
};

export default function TagFieldReview({open,handleClose}) {
  // const [open, setOpen] = React.useState(false);
  const [showViewDataSet, setShowViewDataSet] = useState(false);
  const [selectedValues, setSelectedValues] = React.useState({
    selectData: {},
    SkucodeData: {},
  });

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };


  const handleChange = (type, label, isMultiSelect) => (event) => {
    if (isMultiSelect) {
      const { value } = event.target;
      setSelectedValues((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [label]: value,
        },
      }));
    } else {
      setSelectedValues((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [label]: event.target.value,
        },
      }));
    }
  };

  const handleTagClose = (type, label, value) => (event) => {
    event.stopPropagation();
    console.log("Called close ", type, " ", label, " ", value);
    console.log(selectedValues);
    setSelectedValues((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [label]: prev[type][label].filter((item) => item !== value),
      },
    }));
    console.log("after ", selectedValues);
  };

  const theme = useTheme();
  const renderSelectFields = (data, type) => {
    return data.map((item, index) => (
      <Grid item xs={12} md={6} key={index}>
        <FormControl variant="standard" fullWidth>
          <Typography
            sx={{
              color: "#344054",
              fontFamily: "Inter",
              fontWeight: "500",
              fontSize: "14px",
              lineHeight: "20px",
              marginBottom: "6px",
            }}
          >
            {item.label}
          </Typography>
          {item.isMultiSelect ? (
            <Select
              multiple
              MenuProps={{
                PaperProps: {
                  sx: {
                    boxShadow: "none",
                    "& .MuiList-root": {
                      paddingTop: 0, // Remove padding from the top of the list
                      paddingBottom: 0, // Remove padding from the bottom of the list
                      boxShadow: "none",
                      borderBottomLeftRadius: "8px",
                      borderBottomRightRadius: "8px",
                    },
                    "& .MuiMenuItem-root": {
                      "&.Mui-selected": {
                        backgroundColor: "#F9F5FF", // Background color for selected items
                        border: "1px solid #D0D5DD",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "#F9F5FF", // Hover color for selected items
                      },
                      "&:not(.Mui-selected)": {
                        backgroundColor: theme.palette.background.default, // Background color for non-selected items
                        border: "1px solid #D0D5DD",
                      },
                      "&:not(.Mui-selected):hover": {
                        backgroundColor: "#F9F5FF", // Hover color for non-selected items
                      },
                    },
                  },
                },
              }}
              labelId={`customized-select-label-${index}`}
              id={`customized-select-${index}`}
              value={selectedValues[type][item.label] || []}
              onChange={handleChange(type, item.label, true)}
              sx={{
                display: "flex",
                "& .MuiSelect-icon": {
                  right: "14px", // Adjust this value to move the icon left
                  top: "50%",
                  transform: "translateY(-50%)", // Vertically center the icon
                  color: "#D0D5DD",
                },
              }}
              input={<BootstrapInput />}
              IconComponent={openMenuIcon}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      sx={{
                        backgroundColor: "#F2F4F7",
                        padding: "2px 6px 2px 8px",
                        borderRadius: "16px",
                        // gap:"4px"
                      }}
                      spacing={0.5}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontWeight: 500,
                          fontSize: "12px",
                          lineHeight: "18px",
                          textAlign: "center",
                          color: "#344054",
                        }}
                      >
                        {value}
                      </Typography>
                      <IconButton
                        sx={{
                          zIndex: "2",
                        }}
                        onClick={() => {
                          handleTagClose(type, item.label, value);
                        }}
                      >
                        <TagCloseIcon />
                      </IconButton>
                    </Stack>
                  ))}
                </Box>
              )}
            >
              {item.values.map((value, idx) => (
                <MenuItem key={idx} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Select
              labelId={`customized-select-label-${index}`}
              id={`customized-select-${index}`}
              value={selectedValues[type][item.label] || ""}
              onChange={handleChange(type, item.label, false)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    boxShadow: "none",
                    "& .MuiList-root": {
                      paddingTop: 0, // Remove padding from the top of the list
                      paddingBottom: 0, // Remove padding from the bottom of the list
                      boxShadow: "none",
                      borderBottomLeftRadius: "8px",
                      borderBottomRightRadius: "8px",
                    },
                    "& .MuiMenuItem-root": {
                      "&.Mui-selected": {
                        backgroundColor: "#F9F5FF", // Background color for selected items
                        border: "1px solid #D0D5DD",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "#F9F5FF", // Hover color for selected items
                      },
                      "&:not(.Mui-selected)": {
                        backgroundColor: theme.palette.background.default, // Background color for non-selected items
                        border: "1px solid #D0D5DD",
                      },
                      "&:not(.Mui-selected):hover": {
                        backgroundColor: "#F9F5FF", // Hover color for non-selected items
                      },
                    },
                  },
                },
              }}
              sx={{
                display: "flex",
                "& .MuiSelect-icon": {
                  right: "14px", // Adjust this value to move the icon left
                  top: "50%",
                  transform: "translateY(-50%)", // Vertically center the icon
                  color: "#D0D5DD",
                },
              }}
              input={<BootstrapInput />}
              IconComponent={openMenuIcon}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {item.values.map((value, idx) => (
                <MenuItem key={idx} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          )}
        </FormControl>
      </Grid>
    ));
  };

  return (
    <>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open dialog
      </Button> */}
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
        fullWidth
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          p={4}
          sx={{
            height: "79px",
            padding: "20px 24px 19px 24px",
            gap: "16px",
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Inter",
              fontWeight: "500",
              fontSize: "18px",
              lineHeight: "28px",
            }}
            id="customized-dialog-title"
          >
            Men_Cloth_Inventory.csv
          </DialogTitle>
          <Stack direction="row" spacing={1}>
            <Button
              size="medium"
              onClick={() => {
                setShowViewDataSet(!showViewDataSet);
              }}
              sx={{
                border: "1px solid #D0D5DD",
                borderRadius: "8px",
                padding: "10px 16px 10px 16px",
                gap: "8px",
                height: "40px",
                backgroundColor: showViewDataSet ? "#0C66E4" : "#ffffff00",
                boxShadow: "0px 1px 2px 0px #1018280D",
                "&:hover": {
                  // border:"1px solid #0C66E4",
                  backgroundColor: showViewDataSet ? "#0C66E4" : "#ffffff00",
                  color: "#344054",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "20px",
                  textAlign: "center",
                  color: showViewDataSet ? "#FFFFFF" : "#344054",
                  textTransform: "none",
                }}
              >
                View Dataset
              </Typography>
            </Button>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                width: "40px",
                height: "40px",
                padding: "8px",
                gap: "8px",
                borderRadius: "8px",
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        <DialogContent dividers>
          {showViewDataSet && <ViewDataset />}

          <Stack
            padding="24px 32px 24px 32px"
            sx={{ gap: "24px" }}
            alignItems={"center"}
          >
            <Grid container spacing={1.875}>
              {renderSelectFields(fieldData.selectData, "selectData")}
            </Grid>
            <Typography
              alignSelf={"flex-start"}
              sx={{
                fontFamily: "Inter",
                fontWeight: "500",
                fontSize: "18px",
                lineHeight: "28px",
                color: "#101828",
              }}
            >
              field - itemSkuCode
            </Typography>
            <Grid container spacing={1.875}>
              {renderSelectFields(fieldData.SkucodeData, "SkucodeData")}
            </Grid>
          </Stack>
          <Box padding="24px 32px 24px 32px"></Box>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
}
