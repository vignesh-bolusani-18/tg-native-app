import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import useAuth from "../../hooks/useAuth";
import TGIcon from "../../assets/Images/tg_logo4.svg";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { loadPendingInvites } from "../../redux/slices/authSlice";
import EventIcon from "@mui/icons-material/Event";
import ContactSalesDialog from "../../components/ContactSalesDialog";

// Update these utility functions at the top of the file
const encodeCompanyName = (name) => {
  // Replace spaces with zero-width spaces (\u200B) and encode URI components
  return encodeURIComponent(name.replace(/ /g, "\u200B"));
};

const decodeCompanyName = (encodedName) => {
  // Decode URI component and replace zero-width spaces with regular spaces
  try {
    // First replace validator's encoded zero-width space with actual zero-width space
    const decodedFromValidator = encodedName?.replace(/&#x200B;/g, "\u200B");
    // Then decode URI component and replace zero-width spaces with regular spaces
    return decodeURIComponent(decodedFromValidator).replace(/\u200B/g, " ");
  } catch (error) {
    console.error("Error decoding company name:", error);
    return encodedName; // Return original if decoding fails
  }
};

const isValidCompanyName = (name) => {
  // Allow only alphanumeric characters, spaces, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  return validPattern.test(name);
};

// Update the replaceEncodedSlashes function to handle both encodings
const replaceEncodedSlashes = (encodedStr) => {
  // First replace encoded slashes
  const decodedSlashes = encodedStr?.replace(/&#x2F;/g, "/");
  // Then replace encoded zero-width spaces
  return decodedSlashes?.replace(/&#x200B;/g, "\u200B");
};

// Update this utility function
const getRoutingName = (name) => {
  // First trim any leading/trailing spaces
  const trimmed = name?.trim();
  // Then replace any remaining spaces with empty string
  return trimmed?.replace(/\s/g, "");
};

// Reusable CompanyIcon Component
const CompanyIcon = ({ name }) => {
  const initials = name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box
      sx={{
        width: 60,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        backgroundColor: "#0076A5",
        color: "white",
        fontWeight: "bold",
        fontSize: "1.5rem",
        mb: 2,
      }}
    >
      {initials}
    </Box>
  );
};

// Company Item Component
const CompanyItem = ({ company, setCurrentCompany }) => (
  <Card
    aria-label={`${getRoutingName(
      decodeCompanyName(replaceEncodedSlashes(company.companyName))
    )}`}
    sx={{
      width: "100%",
      borderRadius: "16px", // More rounded corners
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)", // Soft shadow
      background: "rgba(255, 255, 255, 0.15)", // Translucent background for glassy effect
      backdropFilter: "blur(12px)", // Frosted glass effect
      transition: "transform 0.3s, box-shadow 0.3s, background 0.3s", // Smooth transitions
      "&:hover": {
        transform: "scale(1.05)", // Slightly larger on hover
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)", // Stronger shadow on hover
        background: "rgba(255, 255, 255, 0.3)", // Brighter on hover
      },
    }}
    onClick={() => {
      // First decode the company name completely
      const decodedName = decodeCompanyName(
        replaceEncodedSlashes(company.companyName)
      );
      // Then create the routing-friendly version
      console.log("decodedName" + decodedName);

      const routingName = getRoutingName(decodedName);
      console.log("routingName" + routingName);

      setCurrentCompany({
        ...company,
        companyName: routingName,
      });
    }}
  >
    <CardActionArea>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          position: "relative", // To place the premium badge correctly
          p: 3,
        }}
      >
        <CompanyIcon
          name={decodeCompanyName(replaceEncodedSlashes(company?.companyName))}
          sx={{ fontSize: "3rem", color: "primary.main" }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: "#333",
            mb: 1,
            fontSize: "1.2rem", // Slightly larger font size
          }}
        >
          {decodeCompanyName(replaceEncodedSlashes(company?.companyName))}
        </Typography>

        {/* Display Premium Badge if applicable */}
        {company?.subscriptionType === "Premium" && (
          <Tooltip title="Premium" arrow>
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "#FFD700",
                backgroundColor: "rgba(0, 0, 0, 0)", // Dark background for contrast
                borderRadius: "50%",
                padding: "5px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#FFD700"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-crown"
              >
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                <path d="M5 21h14" />
              </svg>
            </Box>
          </Tooltip>
        )}
      </CardContent>
    </CardActionArea>
  </Card>
);

// Skeleton Loader
const SkeletonLoader = () => (
  <Card
    sx={{
      width: "100%",
      borderRadius: "12px",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
      p: 2,
    }}
  >
    <Skeleton
      variant="circular"
      width={60}
      height={60}
      sx={{ mx: "auto", mb: 2 }}
    />
    <Skeleton variant="text" width="80%" sx={{ mx: "auto", mb: 1 }} />
    <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
  </Card>
);

export default function ListCompanySecond() {
  const {
    userInfo,
    loadCompaniesList,
    loadPendingInviteList,
    setNewCompany,
    setCurrentCompany,
    companies_list,
    pending_invite_list,
    isSsoDone,
    acceptInvite,
    denyInvite,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
    signOut,
    currentCompany, // Used for logging out the user
  } = useAuth();

  const [open, setOpen] = useState(false);
  const [addCompany, setAddCompany] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggle, setToggle] = useState(true);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false); // State to control the "Contact Sales" popup
  const [inviteError, setInviteError] = useState(""); // State for invitation error

  useEffect(() => {
    const loadCompaniesAndInvites = async () => {
      await loadCompaniesList(userInfo.userID);
      await loadPendingInviteList(userInfo);
      setIsLoading(false);
    };
    loadCompaniesAndInvites();
  }, []);

  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };

  // Function to get the value of a cookie by its name
  const getCookie = async (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    console.log("Parts:", parts);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const handleAcceptInvite = async (invitation) => {
    try {
      const refreshToken = await getCookie("refresh_token");
      console.log("refreshToken Data:", refreshToken);
      setIsLoading(true);
      await acceptInvite(userInfo.userID, invitation, refreshToken); // Pass necessary data
      await loadCompaniesList(userInfo.userID); // Refresh companies list
      await loadPendingInviteList(userInfo); // Refresh invitations list
    } catch (err) {
      console.error("Failed to accept invitation:", err);
      setInviteError("Failed to accept invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDenyInvite = async (invitation) => {
    try {
      setIsLoading(true);
      const refreshToken = await getCookie("refresh_token");
      console.log("refreshToken Data:", refreshToken);
      await denyInvite(userInfo.userID, invitation, refreshToken); // Pass necessary data
      await loadCompaniesList(userInfo.userID); // Refresh companies list
      await loadPendingInviteList(userInfo); // Refresh invitations list
    } catch (err) {
      console.error("Failed to deny invitation:", err);
      setInviteError("Failed to deny invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    // Don't allow closing dialog if a name has already been entered
    setOpen(false);
    setAddCompany("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = addCompany.trim();

    if (!trimmedName) {
      setError("Organization name cannot be empty.");
      return;
    }

    if (!isValidCompanyName(trimmedName)) {
      setError(
        "Organization name can only contain letters, numbers, spaces, hyphens, and underscores."
      );
      return;
    }

    if (companies_list.some((c) => c.companyName === trimmedName)) {
      setError("This organization already exists.");
      return;
    }

    setIsLoading(true);
    try {
      // Use routing-friendly name for storage
      const routingName = encodeCompanyName(trimmedName);
      await setNewCompany(userInfo, routingName);
    } catch (error) {
      if (error.message.includes("freemium organization limit")) {
        setSalesDialogOpen(true);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setTimeout(() => {
        loadCompaniesList(userInfo.userID);
        setOpen(false);
        setAddCompany("");
        setError("");
        setIsLoading(false);
      }, 2000);
    }
  };
  const sortedCompanies = companies_list
    ? [...companies_list].sort((a, b) => {
        // First, sort by lastAccessed (descending - most recent first)
        const aLastAccessed = a.lastAccessed ?? 0;
        const bLastAccessed = b.lastAccessed ?? 0;

        if (aLastAccessed !== bLastAccessed) {
          return bLastAccessed - aLastAccessed;
        }

        // If lastAccessed is the same, sort alphabetically by company name
        return decodeCompanyName(a.companyName).localeCompare(
          decodeCompanyName(b.companyName)
        );
      })
    : [];

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        width: "80%",
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        <img
          src={TGIcon}
          alt="TG Logo"
          style={{ width: "40%", marginBottom: "16px" }}
        />
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Welcome to Your Organizations
        </Typography>
        <Typography variant="body1" sx={{ color: "gray", mt: 1 }}>
          All your organizations in one place.
        </Typography>
      </Box>

      {/* Instruction Section */}
      <Typography
        variant="body1"
        sx={{
          fontStyle: "italic",
          color: "gray",
          mb: 4,
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        Joining a pre-existing organization? Ask the admin of your organization
        to send you an invite link to join.
      </Typography>

      {isLoading ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <SkeletonLoader />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {/* Pending Invitations Section */}
          {pending_invite_list.length > 0 && (
            <Box
              sx={{
                mb: 4,
                width: "100%",
                px: { xs: 2, sm: 3 }, // Add padding for smaller screens
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  textAlign: "left",
                  color: "primary.main",
                  fontSize: { xs: "1.2rem", sm: "1.5rem" }, // Adjust font size for smaller screens
                }}
              >
                Pending Invitations
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {pending_invite_list.map((invite) => (
                  <Card
                    key={invite.invitationID}
                    sx={{
                      borderRadius: "16px",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                      p: 2,
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" }, // Stacks on small screens
                      alignItems: { xs: "flex-start", sm: "center" }, // Align items for small screens
                      justifyContent: "space-between",
                      gap: { xs: 2, sm: 0 }, // Add gap between sections on small screens
                      background: "rgba(255, 255, 255, 0.2)", // Glassy effect with transparency
                      backdropFilter: "blur(10px)", // Apply blur effect to the background
                      transition:
                        "transform 0.3s, box-shadow 0.3s, background 0.3s",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 8px 15px rgba(0, 0, 0, 0.15)",
                        background: "rgba(255, 255, 255, 0.4)", // Light up on hover
                      },
                    }}
                  >
                    {/* Left Section: Company Info */}
                    <Box sx={{ flex: 1, width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: { xs: "center", md: "flex-start" },
                          // border:"1px solid black",
                          flex: 1,
                          flexWrap: "wrap", // Allow wrapping for smaller screens
                        }}
                      >
                        <CompanyIcon name={invite.companyName} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            ml: 2,
                            color: "text.primary",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: { xs: "1rem", sm: "1.2rem" }, // Adjust font size
                          }}
                        >
                          {invite.companyName}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: { xs: "center", md: "flex-start" },
                          // border:"1px solid black",
                          flex: 1,
                          flexWrap: "wrap", // Allow wrapping for smaller screens
                        }}
                      >
                        <EventIcon
                          sx={{
                            fontSize: "1rem",
                            color: "primary.main",
                            mr: 1,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.9rem",
                            wordBreak: "break-word", // Break text when it's too long
                            whiteSpace: "normal", // Allow text to wrap
                          }}
                        >
                          Expires at:{" "}
                          <span>
                            {new Date(invite.expiresAt * 1000).toLocaleString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </span>
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right Section: Action Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "row", sm: "row" }, // Row layout for all screens
                        flexWrap: "wrap", // Wrap buttons on small screens
                        gap: { xs: 1, sm: 2 }, // Smaller gap for small screens
                        mt: { xs: 1, sm: 0 }, // Add spacing for buttons on small screens
                      }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleAcceptInvite(invite)}
                        disabled={isLoading}
                        sx={{
                          fontWeight: "bold",
                          borderRadius: "8px",
                          px: 3,
                          fontSize: { xs: "0.8rem", sm: "1rem" }, // Adjust font size for smaller screens
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDenyInvite(invite)}
                        disabled={isLoading}
                        sx={{
                          fontWeight: "bold",
                          borderRadius: "8px",
                          px: 3,
                          fontSize: { xs: "0.8rem", sm: "1rem" }, // Adjust font size for smaller screens
                        }}
                      >
                        Deny
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
          {companies_list.length > 0 && (
            <Box sx={{ mb: 4, mt: 5, width: "100%" }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 3,
                  textAlign: "left",
                  color: "primary.main",
                }}
              >
                Your Organizations
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Sort companies alphabetically */}
                {sortedCompanies.map((company, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <CompanyItem
                      company={company}
                      setCurrentCompany={setCurrentCompany}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* Add Organization Button */}
      <Tooltip title="Create New Organization">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={isLoading}
          sx={{
            mt: 4,
            borderRadius: "24px",
            textTransform: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            px: 4,
          }}
        >
          Create Organization
        </Button>
      </Tooltip>

      {/* Add Organization Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Organization</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="company"
              label="Organization Name"
              type="text"
              fullWidth
              variant="outlined"
              value={addCompany}
              onChange={(e) => setAddCompany(e.target.value)}
              error={!!error}
              helperText={error}
            />
          </DialogContent>
          <DialogActions>
            {/* Disable Cancel Button if no name is entered */}
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Logout Button */}
      <Tooltip title="Logout">
        <IconButton
          onClick={signOut}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <PowerSettingsNewIcon
            style={{ color: "#667085" }}
            fontSize="medium"
          />
        </IconButton>
      </Tooltip>

      <ContactSalesDialog
        open={isContactSalesDialogOpen}
        handleClose={() => setIsContactSalesDialogOpen(false)}
        handleConfirm={handleContactSales}
        WarningText="Upgrade Your Subscription"
        ResultText="Upgrade your subscription or contact sales for more access."
        ConfirmButtonTitle="Contact Sales"
      />
    </Box>
  );
}
