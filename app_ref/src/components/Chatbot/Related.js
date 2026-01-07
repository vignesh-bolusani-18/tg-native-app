import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import plusicon from "../../assets/Icons/plusicon.svg";

const Related = ({ relatedOptions = [], onSendQuery, clearRelated }) => {
  return (
    relatedOptions.length > 0 && (
      <Box
        sx={{
          marginTop: "16px",
          padding: "16px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
          maxWidth: "85%", // ✅ Ensure width aligns with bot response
          marginLeft: "48px", // ✅ Adjust left margin to match Bot Icon
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            color: "#333",
            marginBottom: "12px",
          }}
        >
          Related
        </Typography>
        <List sx={{ padding: 0 }}>
          {relatedOptions.map((option, index) => (
            <ListItem
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 8px",
                borderBottom:
                  index !== relatedOptions.length - 1 ? "1px solid #ddd" : "none",
                cursor: "pointer",
                // "&:hover": {
                //   backgroundColor: "#f5f5f5",
                // },
              }}
            >
              <ListItemText
                primary={option}
                primaryTypographyProps={{
                  variant: "body2",
                  sx: {
                    color: "#555",
                    fontSize: "0.95rem",
                    fontStyle: "italic",
                  },
                }}
              />
              <img
                src={plusicon}
                alt="Plus Icon"
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  marginLeft: "12px",
                }}
                onClick={() => {
                  clearRelated(); 
                  onSendQuery(option);
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    )
  );
};

export default Related;
