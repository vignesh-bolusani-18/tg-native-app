import * as React from "react";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { Button } from "@mui/material";
import logo from "../../assets/Images/tg_logo1.svg";

import { ThemeContext } from "../../theme/config/ThemeContext";
import { useContext } from "react";

function Header() {
  const { theme } = useContext(ThemeContext);

  return (
    <Box
      sx={{
        borderBottomColor: theme.palette.borderColor.header,
        borderBottom: "1px solid",
        width: "100%",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          height: "80px",
          backgroundColor: theme.palette.background.default,
          borderBottom: "1px solid",
          borderBottomColor: theme.palette.borderColor.header,
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Toolbar
            variant="regular"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "60px",
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                height: "44px",
                gap: "40px",
              }}
            >
              <a href="/" alt="home">
                <img 
                  className="img" 
                  src={logo} 
                  alt="TrueGradient AI Logo" 
                  fetchpriority="high"
                  loading="eager"
                  decoding="async"
                />
              </a>
            </Box>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: "12px",
                alignItems: "center",
              }}
            >
              <Button
                variant="text"
                sx={{
                  backgroundColor: theme.palette.button.backgroundOnHover,
                  borderRadius: "8px",
                }}
              >
                <Typography
                  color={theme.palette.button.textOnHover}
                  sx={{ textTransform: "none" }}
                >
                  Help
                </Typography>
              </Button>
            </Box>
          </Toolbar>
        </Box>
      </AppBar>
    </Box>
  );
}

export default Header;
