import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Avatar,
  CircularProgress,
  Fade,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import useAuth from "../../hooks/useAuth";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { processToken } from "../../utils/jwtUtils";
import { getInvitationById } from "../../utils/getInvitationById";
import Cookies from "js-cookie";


const InvitationAcceptancePage = () => {
  const [invitationStatus, setInvitationStatus] = useState(null);
  const [payload, setPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useParams();
  const { acceptInvite, denyInvite } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log("Entered in useEffect");

        const payload = await processToken(token);
        if(!payload.refreshTokenID){
          setInvitationStatus("expired")
        }
        Cookies.set("refresh_token", token, {
                  expires: 1,
                  secure: true,
                  sameSite: "strict",
                });
                
        const invitation = await getInvitationById(
          { invitationID: payload.invitationID, time: performance.now() },
          token
        );
        console.log("Invitation: " + invitation);
        const payload2 = await processToken(invitation.user);
        setPayload(payload2);
        console.log("Payload2: " + JSON.stringify(payload2));
        if (payload2.invitationStatus === "Accepted") {
          setInvitationStatus("accepted");
        } else if (payload2.invitationStatus === "Denied") {
          setInvitationStatus("denied");
        }
        console.log("Invitation Status: " + invitationStatus);
      } catch (error) {
        console.error("Invalid token or error:", error);
        setInvitationStatus("expired");
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [token]);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await acceptInvite(
        payload.userID,
        {
          companyID: payload.companyID,
          invitationID: payload.invitationID,
          companyName: payload.companyName,
          time: performance.now(),
        },
        token
      );

      setInvitationStatus("accepted");
      // Cookies.remove("refresh_token_invite")
    } catch (error) {
      console.error("Error accepting invite:", error);
      setInvitationStatus("Error Accepting the Invitation");
    } finally {
      setIsLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate("/");
    }
  };

  const handleDeny = async () => {
    setIsLoading(true);
    try {
      await denyInvite(
        payload.userID,
        {
          invitationID: payload.invitationID,
          time: performance.now(),
        },
        token
      );
      setInvitationStatus("denied");
      // Cookies.remove("refresh_token_invite")
    } catch (error) {
      console.error("Error denying invite:", error);
      setInvitationStatus("Error Denying the Invitation");
    } finally {
      setIsLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate("/");
    }
  };

  const getInitials = (name) => {
    return name ? name.slice(0, 2).toUpperCase() : "??";
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Fade in={true} timeout={800}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              width: "100%",
              borderRadius: 4,
              background: "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
             {invitationStatus === "expired" ? (
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                align="center"
                sx={{ fontWeight: "bold", color: "#333", mb: 2 }}
              >
                Invitation Expired
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                The invitation link is invalid or has expired. Please contact
                the sender for a new invitation.
              </Typography>
            </Box>
          ) : (
            <>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#0076A5",
                fontSize: "2.5rem",
                mb: 3,
                boxShadow: "0 4px 20px rgba(0,118,165,0.4)",
              }}
            >
              {getInitials(payload?.companyName)}
            </Avatar>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: "bold", color: "#333", mb: 2 }}
            >
              You're Invited!
            </Typography>
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ color: "#666", mb: 3 }}
            >
              {payload?.companyName || "Company Name"}
            </Typography>
            <Typography
              variant="body1"
              paragraph
              align="center"
              sx={{ mb: 4, color: "#555" }}
            >
              {payload?.senderName || "Someone"} has invited you to join their
              organization. Would you like to accept this invitation?
            </Typography>
            {invitationStatus === null ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 3,
                  width: "100%",
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleAccept}
                  disabled={isLoading}
                  sx={{
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    px: 4,
                    py: 1.5,
                    boxShadow: "0 4px 15px rgba(0,118,165,0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0,118,165,0.4)",
                    },
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelOutlinedIcon />}
                  onClick={handleDeny}
                  disabled={isLoading}
                  sx={{
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    px: 4,
                    py: 1.5,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 15px rgba(211,47,47,0.2)",
                    },
                  }}
                >
                  Deny
                </Button>
              </Box>
            ) : (
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography
                  variant="h6"
                  color={
                    invitationStatus === "accepted"
                      ? "success.main"
                      : "error.main"
                  }
                >
                  {invitationStatus === "accepted"
                    ? "Invitation Accepted!"
                    : invitationStatus}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {invitationStatus === "accepted"
                    ? "You've successfully joined the organization."
                    : invitationStatus}
                </Typography>
              </Box>
            )}
          </>
          )}
            
            {isLoading && <CircularProgress />}
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default InvitationAcceptancePage;
