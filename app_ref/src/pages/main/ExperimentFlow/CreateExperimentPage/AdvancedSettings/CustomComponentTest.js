import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  // InputBase,
  DialogContent,
  Grid,
} from "@mui/material";
// import { ThemeContext } from "../../../../../theme/config/ThemeContext";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import { useState } from "react";
import CustomCheck from "../../../../../components/CustomInputControls/CustomCheck";
import CustomCounter from "../../../../../components/CustomInputControls/CustomCounter";
import CustomDatePicker from "../../../../../components/CustomInputControls/CustomDatePicker";

// const VisuallyHiddenInput = styled("input")({
//   clip: "rect(0 0 0 0)",
//   clipPath: "inset(50%)",
//   height: 1,
//   overflow: "hidden",
//   position: "absolute",
//   bottom: 0,
//   left: 0,
//   whiteSpace: "nowrap",
//   width: 1,
// });

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
    backgroundColor: theme.palette.background.default,
  },
}));

// const tags = ["Sales", "Inventory", "Demand"];
// const BootstrapInput = styled(InputBase)(({ theme }) => ({
//   "label + &": {
//     marginTop: theme.spacing(3),
//   },
//   "& .MuiInputBase-input": {
//     borderRadius: 8,
//     position: "relative",
//     backgroundColor: theme.palette.background.default,
//     border: "1px solid #D0D5DD",
//     fontSize: 16,
//     padding: "10px 14px",
//     transition: theme.transitions.create(["border-color", "box-shadow"]),
//     // Use the system font instead of the default Roboto font.
//     fontFamily: [
//       "-apple-system",
//       "BlinkMacSystemFont",
//       '"Segoe UI"',
//       "Roboto",
//       '"Helvetica Neue"',
//       "Arial",
//       "sans-serif",
//       '"Apple Color Emoji"',
//       '"Segoe UI Emoji"',
//       '"Segoe UI Symbol"',
//     ].join(","),
//     "&:focus": {
//       borderRadius: 8,
//       borderColor: " #D0D5DD",
//       // boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
//     },
//   },
// }));

export default function CustomComponentsTest({ open, handleClose }) {
  // const { theme } = React.useContext(ThemeContext);

  // Checkboxes
  const [ans1, setAns1] = useState(true);
  const [ans2, setAns2] = useState(true);

  //Auto Completes
  const [selectedValues, setSelectedValues] = React.useState({});
  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
  const [selectedValuesMulti, setSelectedValuesMulti] = React.useState({});
  const Multioptions = ["Option 1", "Option 2", "Option 3", "Option 4"];

  //Couters

  const [count, setCount] = useState(0); // Initial count value
  const maxRange = 10; // Maximum allowed count value
  const minRange = 0; // Minimum allowed count value

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
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
          id="customized-dialog-title"
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
            Upload Datasets
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
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item md={6}>
              <CustomAutocomplete showLabel placeholder = "Type here...."
                label="Select Options"
                values={options}
                isMultiSelect={false}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
              />
            </Grid>
            <Grid item md={6}>
              <CustomAutocomplete showLabel placeholder = "Type here...."
                label="Select Multi Options"
                values={Multioptions}
                isMultiSelect={true}
                selectedValues={selectedValuesMulti}
                setSelectedValues={setSelectedValuesMulti}
              />
            </Grid>
            <Grid item md={6}>
              <CustomCheck
                question="Select your ans1:"
                value={ans1}
                setValue={setAns1}
                direction="row" // Example direction
              />
            </Grid>
            <Grid item md={6}>
              <CustomCheck
                question="Select your ans2:"
                value={ans2}
                setValue={setAns2}
                direction="column" // Example direction
              />
            </Grid>
            <Grid item md={6}>
              <CustomCounter showLabel placeholder = "Set your count"
                label="Counter:"
                value={count}
                setValue={setCount}
                maxRange={maxRange}
                minRange={minRange}
              />
            </Grid>
            <Grid item md={6}>
              <CustomDatePicker showLabel placeholder = "Select date"
                label="Select a date:"
                initialDate={new Date()} // Initial date
                // Callback function to handle date change
              />
            </Grid>
            <Grid item md={6}>
              <CustomDatePicker showLabel placeholder = "Select date"
                label="Select a date:"
                initialDate={new Date()} // Initial date
                // Callback function to handle date change
              />
            </Grid>
            <Grid item md={6}>
              <CustomDatePicker showLabel placeholder = "Select date"
                label="Select a date:"
                initialDate={new Date()} // Initial date
                // Callback function to handle date change
              />
            </Grid>
          </Grid>
        </DialogContent>
      </BootstrapDialog>
    </Box>
  );
}
