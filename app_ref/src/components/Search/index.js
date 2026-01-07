import { InputBase, styled } from "@mui/material";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "8px",
  border: "1px solid #D0D5DD",
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const TextFieldBox = styled("div")(({ theme, disabled, fullWidth }) => ({
  position: "relative",
  borderRadius: "8px",
  border: "1px solid #D0D5DD",
  opacity: disabled ? 0.5 : 1,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: fullWidth ? "100%" : "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const baseInputStyles = (theme) => ({
  padding: theme.spacing(1, 1, 1, 0),
  borderRadius: "8px",
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  transition: theme.transitions.create("width"),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "25ch",
  },
  [theme.breakpoints.up("md")]: {
    width: "30ch",
  },
  [theme.breakpoints.up("lg")]: {
    width: "39ch",
  },
});

const StyledInputBase = styled(InputBase)(({ theme, fullWidth }) => ({
  width: fullWidth ? "100%" : "auto",

  color: "#667085",
  "& .MuiInputBase-input": baseInputStyles(theme),
}));

const StyledInput = styled(InputBase)(({ theme, placeholder, disabled }) => ({
  color: "#667085",
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 400,
  lineHeight: "24px",
  textAlign: "left",
  "::placeholder": {
    color: "#667085",
  },
  opacity: disabled ? 0.5 : 1,
  "& .MuiInputBase-input": {
    padding: "10px 14px",
    ...baseInputStyles(theme),
  },
}));

export {
  Search,
  StyledInputBase,
  SearchIconWrapper,
  TextFieldBox,
  StyledInput,
};
