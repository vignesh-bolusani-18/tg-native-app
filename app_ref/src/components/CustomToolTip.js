import { styled, Tooltip, tooltipClasses } from "@mui/material";

const CustomTooltip = styled(({ className, maxwidth, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme,  maxwidth }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "white", // Customize background color
    borderColor: "#626F86", //Border Color
    color: "#626F86", // Text color
    fontFamily: "Inter",
    fontSize: "12px", // Customize font size
    borderRadius: "8px", // Customize border radius
    padding: "8px 12px", // Add padding
    boxShadow: theme.shadows[3], // Add shadow
     maxWidth: maxwidth || "100%",     // ← Use prop
    whiteSpace: "normal",
   
  },
}));

export default CustomTooltip;
