import React, { useContext } from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  ButtonGroup,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ReactComponent as CheckCircle } from "../../assets/Icons/check-circle.svg";
import { ReactComponent as CheckCircleDark } from "../../assets/Icons/check_circle_dark.svg";
import { ThemeContext } from "../../theme/config/ThemeContext";
import useExperiment from "../../hooks/useExperiment";
import useAuth from "../../hooks/useAuth";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
  },
  "& .MuiButtonGroup-root": {
    border: "1px solid",
    borderColor: theme.palette.borderColor.searchBox,
    borderRadius: "8px",
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
  },
}));

const textStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  textAlign: "left",
  color: "#475467",
};

const btnText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
};

const CardDialog = ({ open, onClose, selectedCard }) => {
  const { createExperiment } = useExperiment();
  const { userInfo, currentCompany } = useAuth();
  const { theme } = useContext(ThemeContext);
  return (
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="md"
      fullWidth
    >
      <Box
        sx={{
          borderRadius: "12px",
          color: theme.palette.background.default,
          padding: "24px",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {theme.palette.mode === "light" ? (
            <CheckCircle />
          ) : (
            <CheckCircleDark />
          )}
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: "28px",
            textAlign: "left",
            color: theme.palette.text.modalHeading,
          }}
          id="customized-dialog-title"
        >
          {selectedCard.title}
        </DialogTitle>
        <ButtonGroup
          sx={{
            marginTop: "16px",
            marginBottom: "16px",
            ".MuiButtonGroup-grouped": {
              border: "1px solid",
              borderColor: theme.palette.borderColor.searchBox,
            },
          }}
        >
          {[
            "Problem Details",
            "Solution Design",
            "Output",
            "Case Studies/Demo",
          ].map((text, index) => (
            <Button key={index}>
              <Typography sx={btnText}>{text}</Typography>
            </Button>
          ))}
        </ButtonGroup>
        <DialogContent>
          <Typography gutterBottom sx={textStyle}>
            {selectedCard.description}
          </Typography>
          <Typography sx={textStyle}>Inclusions:</Typography>
          <ul>
            {[
              "Incorporate your supply side constraints in the product",
              "New product forecast",
              "Long Tail Automation",
            ].map((item, index) => (
              <li key={index} style={textStyle}>
                {item}
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            sx={{
              px: "18px",
              py: "10px",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: theme.palette.borderColor.searchBox,
              backgroundColor: theme.palette.background.default,
              boxShadow: "none",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "24px",
                textAlign: "left",
                color: "#344054",
                textTransform: "none",
              }}
            >
              Cancel
            </Typography>
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              createExperiment(selectedCard.moduleName, userInfo.userID);
            }}
            sx={{
              px: "18px",
              py: "10px",
              borderRadius: "8px",
              gap: "8px",
              "& .MuiButton-root": { boxShadow: "none" },
              backgroundColor: theme.palette.button.textOnHover,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "16px",
                fontWeight: 600,
                lineHeight: "24px",
                textAlign: "left",
                color: theme.palette.mode === "light" ? "#FFFFFF" : "#101828",
                textTransform: "none",
              }}
            >
              Create
            </Typography>
          </Button>
        </DialogActions>
      </Box>
    </BootstrapDialog>
  );
};

export default CardDialog;
