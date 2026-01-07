import React, { useEffect, useState, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Tooltip,
  Pagination,
  PaginationItem,
  Collapse,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import useAuth from "../../../hooks/useAuth";
import {
  adminRoleTransfer,
  deleteUser,
  disableUser,
  enableUser,
  getUsersByCompany,
} from "../../../utils/manageUsers";
import { processTokens, verifyInvitationsResponse, verifyUsersResponse } from "../../../utils/jwtUtils";
import {
  deleteInvite,
  getAllInvitationsByCompany,
} from "../../../utils/manageInvitations";
import { ThemeContext } from "../../../theme/config/ThemeContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CustomButton from "../../../components/CustomButton";
const btnGrpText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    color: theme.palette.text.modalHeading,
    backgroundColor: theme.palette.background.primary,
    padding: "16px",
  },
  padding: "16px",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F9FAFB",
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.background.default,
  },
  cursor: "pointer",
  "&:hover": {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease-in-out",
    backgroundColor: "#F9F5FF",
    borderTop: "1px solid #D6BBFB",
    borderBottom: "1px solid #D6BBFB",
  },
  "& td": {
    padding: "16px",
  },
}));

const CustomPaginationItem = styled(PaginationItem, {
  shouldForwardProp: (prop) =>
    prop !== "isPrevOrNext" &&
    prop !== "isPrev" &&
    prop !== "isNext" &&
    prop !== "selected",
})(({ theme, isPrevOrNext, isPrev, isNext, selected }) => ({
  borderRadius: "0",
  border: "1px solid",
  borderColor: "#D0D5DD",
  margin: "0",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.button.backgroundOnHover,
  },
  "&:not(:first-of-type)": {
    borderLeft: "none",
  },
  "& .MuiTypography-root": {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: isPrevOrNext ? 600 : 500,
    lineHeight: "20px",
    textAlign: "left",
    color: isPrevOrNext ? "#1D2939" : "#344054",
    paddingLeft: isPrevOrNext ? "8px" : "0",
    paddingRight: isPrevOrNext ? "0" : "8px",
  },
  ...(!isPrevOrNext && {
    width: "40px",
  }),
  ...(isPrev && {
    borderBottomLeftRadius: "8px",
    borderTopLeftRadius: "8px",
  }),
  ...(isNext && {
    borderBottomRightRadius: "8px",
    borderTopRightRadius: "8px",
  }),
  ...(selected && {
    backgroundColor: "#F9FAFB",
  }),
}));

const CustomizedButtonStyles = ({ page, currentPage, onClick, children }) => {
  const isActive = page === currentPage;

  return (
    <Button
      sx={{
        backgroundColor: isActive ? "#F1F9FF" : "transparent",
        width: "100%",
        maxWidth: "100%",
        "&:hover": {
          backgroundColor: "#F1F9FF",
          textDecoration: "none",
        },
        height: "40px",
      }}
      onClick={() => onClick(page)}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        paddingRight="8px"
        sx={{
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {isActive && (
          <Box
            sx={{
              height: "8px",
              width: "8px",
              borderRadius: "4px",
              backgroundColor: "#12B76A",
            }}
          />
        )}
        <Typography sx={btnGrpText}>{children}</Typography>
      </Stack>
    </Button>
  );
};

const AdminPanel = () => {
  const { userInfo, currentCompany, isContactSalesDialogOpen, setIsContactSalesDialogOpen } = useAuth();
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  const [currentPage, setCurrentPage] = useState("Users");
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [invitationAnchorEl, setInvitationAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null)
  const [userPage, setUserPage] = useState(1);
  const [invitationPage, setInvitationPage] = useState(1);
  const [userRowsPerPage] = useState(5);
  const [invitationRowsPerPage] = useState(5);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "Accepted":
      case "Enable":
        return "success";
      case "Disabled":
      case "Delete":
        return "error";
      case "Invited":
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Utility function to flatten DynamoDB AttributeValue objects
const flattenAttributes = (item) => {
  const flattened = {};
  for (const key in item) {
    if (item[key]?.S !== undefined) {
      flattened[key] = item[key].S; // String
    } else if (item[key]?.N !== undefined) {
      flattened[key] = parseFloat(item[key].N); // Number
    } else if (item[key]?.BOOL !== undefined) {
      flattened[key] = item[key].BOOL; // Boolean
    } else if (item[key]?.NULL !== undefined) {
      flattened[key] = null; // Null
    } else {
      flattened[key] = item[key]; // Other (unchanged)
    }
  }
  return flattened;
};


  useEffect(() => {
    const fetchUsersAndInvitation = async () => {
      try {
        const listOfUsers = await getUsersByCompany(
          currentCompany,
          userInfo.userID
        );
        const verifiedUsers = await verifyUsersResponse(listOfUsers, userInfo.userID);
        console.log("Verified users:", verifiedUsers);
        setUsers(verifiedUsers);

        const listOfInvitations = await getAllInvitationsByCompany(
          currentCompany,
          userInfo.userID
        );
        const verifiedInvitations = await verifyInvitationsResponse(listOfInvitations, userInfo.userID);
        console.log("Verified Invitations:", verifiedInvitations);
        setInvitations(verifiedInvitations);
      } catch (error) {
        console.error("Error fetching users and invitations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndInvitation();
  }, [currentCompany, userInfo.userID]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Invite link copied to clipboard!");
  };

  const handleUserClick = (event, user) => { 
    setUserAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleExpandRow = (event, user) => {
    event.stopPropagation();
    setExpandedRow((prev) => (prev !== null && prev.userID === user.userID ? null : {
      userID : user.userID,
      userEmail: user.userEmail
    }))
  }

  const handleInvitationClick = (event, invitation) => {
    setInvitationAnchorEl(event.currentTarget);
    setSelectedInvitation(invitation);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
    setSelectedUser(null);
  };

  const handleInvitationClose = () => {
    setInvitationAnchorEl(null);
    setSelectedInvitation(null);
  };

  const handleUserChangePage = (event, newPage) => {
    setUserPage(newPage);
  };

  const handleInvitationChangePage = (event, newPage) => {
    setInvitationPage(newPage);
  };

  const handleAdminRoleTransfer = async (userEmail) => {
    const tokenPayload = {
      userEmail: userEmail,
      adminEmail: userInfo.userEmail,
      companyName: currentCompany.companyName,
      time: Date.now(),
    };
    console.log("PayloadAdmin: ", tokenPayload);
    await adminRoleTransfer(tokenPayload, currentCompany, userInfo.userID);
    const listOfUsers = await getUsersByCompany(
      currentCompany,
      userInfo.userID
    );
    const verifiedUsers = await verifyUsersResponse(listOfUsers, userInfo.userID);
    console.log("Verified users:", verifiedUsers);
    setUsers(verifiedUsers);
    console.log("Role Transfer Successfully");
    handleUserClose();
  };

  const handleDeleteUser = async (userEmail, userID) => {
    const tokenPayload = {
      userID: userID,
      email: userEmail,
      companyName: currentCompany.companyName,
      time: Date.now(),
    };
    console.log("PayloadAdmin: ", tokenPayload);
    await deleteUser(tokenPayload, currentCompany, userInfo.userID);
    const listOfUsers = await getUsersByCompany(
      currentCompany,
      userInfo.userID
      );
    const verifiedUsers = await verifyUsersResponse(listOfUsers, userInfo.userID);
    console.log("Verified users:", verifiedUsers);
    setUsers(verifiedUsers);
    console.log("Deleted Successfully");
    handleUserClose();
  };

  const handleDeleteInvitation = async (invitationID, userID) => {
    const tokenPayload = {
      userID: userID,
      invitationID: invitationID,
      time: Date.now(),
    };
    console.log("PayloadAdmin: ", tokenPayload);
    await deleteInvite(tokenPayload, currentCompany, userInfo.userID);
    const listOfInvitations = await getAllInvitationsByCompany(
      currentCompany,
      userInfo.userID
    );
    const verifiedInvitations = await verifyInvitationsResponse(listOfInvitations, userInfo.userID);
    console.log("Verified Invitations:", verifiedInvitations);
    setInvitations(verifiedInvitations);
    console.log("Deleted Invite Successfully");
    handleInvitationClose();
  };

  const handleDisable = async (userEmail, userID) => {
    const tokenPayload = {
      userID: userID,
      email: userEmail,
      companyName: currentCompany.companyName,
      time: Date.now(),
    };
    console.log("PayloadAdmin: ", tokenPayload);
    await disableUser(tokenPayload, currentCompany, userInfo.userID);
    const listOfUsers = await getUsersByCompany(
      currentCompany,
      userInfo.userID
    );
    const verifiedUsers = await verifyUsersResponse(listOfUsers, userInfo.userID);
    console.log("Verified users:", verifiedUsers);
    setUsers(verifiedUsers);
    console.log("Disabled Successfully");
    handleUserClose();
  };

  const handleEnable = async (userEmail, userID) => {
    const tokenPayload = {
      userID: userID,
      email: userEmail,
      companyName: currentCompany.companyName,
      time: Date.now(),
    };
    console.log("PayloadAdmin: ", tokenPayload);
    await enableUser(tokenPayload, currentCompany, userInfo.userID);
    const listOfUsers = await getUsersByCompany(
      currentCompany,
      userInfo.userID
    );
    const verifiedUsers = await verifyUsersResponse(listOfUsers, userInfo.userID);
    console.log("Verified users:", verifiedUsers);
    setUsers(verifiedUsers);
    console.log("Enabled Successfully");
    handleUserClose();
  };

  if (loading) {
    return <Typography>Loading users and invitations...</Typography>;
  }

  const filteredUsers = users.filter(
    (user) => !user.inTrash && user.userStatus !== "Invited"
  );
  const filteredInvitations = invitations.filter(
    (invitation) => !invitation.inTrash
  );

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * userRowsPerPage,
    userPage * userRowsPerPage
  );

  const paginatedInvitations = filteredInvitations.slice(
    (invitationPage - 1) * invitationRowsPerPage,
    invitationPage * invitationRowsPerPage
  );

  return (
    <Box
      sx={{ marginTop: "80px", backgroundColor: "none", border: "2px" }}
      padding="12px 16px 12px 16px"
    >
      <Grid container sx={{ paddingX: "15px", paddingBottom: "8px" }}>
        {[
          { label: "Users", page: "Users" },
          { label: "Invitations", page: "Invitations" },
        ].map((button) => (
          <Grid
            item
            key={button.label}
            xs={6}
            md={6}
            sx={{
              border: "1px solid",
              borderColor: theme.palette.borderColor.searchBox,
            }}
          >
            <CustomizedButtonStyles
              page={button.page}
              currentPage={currentPage}
              onClick={setCurrentPage}
            >
              {button.label}
            </CustomizedButtonStyles>
          </Grid>
        ))}
      </Grid>

      {currentPage === "Users" && (
        <Paper
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>
            List of Users
          </Typography>
          <TableContainer>
            <Table aria-label="user list table" size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    User
                  </StyledTableCell>
                  {/* <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Role
                  </StyledTableCell> */}
                  <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Status
                  </StyledTableCell>
                  <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                    // align="right"
                  >
                    Actions
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <>
                  <StyledTableRow key={user.userID}
                    style={{ backgroundColor: "#F9FAFB" }}
                  >
                    <TableCell style={{ width: "40%" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            mr: 2,
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.8),
                          }}
                        >
                          {getInitials(user.userName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.userName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.userEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    {/* <TableCell style={{ width: "20%" }}>
                      <Tooltip
                        title={user.userRole === "admin" ? "Admin" : "User"}
                      >
                        <IconButton
                          size="small"
                          color={
                            user.userRole === "admin" ? "primary" : "default"
                          }
                        >
                          {user.userRole === "admin" ? (
                            <AdminPanelSettingsIcon />
                          ) : (
                            <PersonIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell> */}
                    <TableCell style={{ width: "20%", alignItems: "center", paddingLeft: "0px" }}>
                      <Chip
                        label={user.userStatus}
                        // color={getStatusColor(user.userStatus)}
                        size="small"
                        sx={{ fontWeight: "bold", paddingX: 2, backgroundColor: `${user.userStatus === "Active" ? "#ECFDF3" : "#FEE2E2"}`, color: `${user.userStatus === "Active" ? "#027A48" : "#B91C1C"}`}}
                      />
                    </TableCell>
                    <TableCell style={{ width: "20%", marginLeft: "16px" }} >
                      {user.userRole !== "admin" &&
                        user.userStatus !== "Invited" && userInfo.userID !== user.userID && (
                          <IconButton
                            aria-label="more actions"
                            aria-controls="user-action-menu"
                            aria-haspopup="true"
                            onClick={(event) => handleExpandRow(event, user)}
                            sx={{ transition: "all 0.3s ease-in-out" }}
                          >
                            {
                              expandedRow !== null && expandedRow.userID === user.userID ? <ExpandLessIcon /> : <ExpandMoreIcon />
                            }
                          </IconButton>
                        )}
                    </TableCell>
                  </StyledTableRow>
                  {
                    expandedRow !== null && expandedRow.userID === user.userID ? (
                      <TableRow
                        sx={{ transition: "all 0.3s ease-in-out" }}
                      >
                      <TableCell>
                        <Collapse
                          in={expandedRow !== null && expandedRow.userID === user.userID}
                          timeout="auto"
                          unmountOnExit
                          sx={{ transition: "all 0.3s ease-in-out" }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              flexDirection: "row",
                              padding: "16px",
                            }}
                          >
                            {expandedRow !== null && expandedRow.userID === user.userID && (
                              <>
                                {
                                  user.userStatus === "Active" && user.userID !== userInfo.userID ? (
                                    <>
                                    <Button 
                                      onClick={() => handleDisable(user.userEmail, user.userID)}
                                      title={"Disable"}
                                      // style={{marginLeft: "15px", border: "1px solid red", borderRadius: "40px" }}
                                      color={getStatusColor("Disabled")}
                                      size="small"
                                      sx={{ fontWeight: "medium", color: "red", fontSize: 12, paddingX: 2, backgroundColor: "#fff", border: "1px solid red",boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", transition: "all 0.3s ease-in-out", }}
                                    >Disable</Button>
                                    <Button 
                                      onClick={() => handleAdminRoleTransfer(user.userEmail, user.userID)}
                                      title={"Disable"}
                                      // style={{marginLeft: "15px", border: "1px solid red", borderRadius: "40px" }}
                                      // color={adminRoleTransfer("Disabled")}
                                      size="small"
                                      sx={{ fontWeight: "medium", color: "#0C66E4", fontSize: 12, paddingX: 2, backgroundColor: "#fff", border: "1px solid #0C66E4", marginLeft: "15px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", transition: "all 0.3s ease-in-out", }}
                                    >Make Admin</Button>
                                    </>
                                  ) : (<>
                                    {
                                      user.userStatus === "Disabled" ? 
                                      <>
                                        <Button 
                                          onClick={() => handleEnable(user.userEmail, user.userID)}
                                          color={getStatusColor("Enable")} // This is to get the green color
                                          size="small"
                                          sx={{fontWeight: "medium", color: "green", fontSize: 12, paddingX: 2, backgroundColor: "#fff", border: "1px solid green",boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", transition: "all 0.3s ease-in-out" }}
                                        >Enable</Button>
                                        <Button 
                                          onClick={() => handleDeleteUser(user.userEmail, user.userID)}
                                          color={getStatusColor("Delete")}
                                          size="small"
                                          sx={{fontWeight: "medium", color: "black", fontSize: 12, paddingX: 2, backgroundColor: "#fff", border: "1px solid red",boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", transition: "all 0.3s ease-in-out", marginLeft: "15px" }}
                                        >Delete</Button>
                                      </> : <></>
                                    }
                                  </>)
                                }
                              </>
                            )}
                            </Box>
                          </Collapse>
                      </TableCell>
                    </TableRow>
                    ) : (<></>)
                  }
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(filteredUsers.length / userRowsPerPage)}
            page={userPage}
            onChange={handleUserChangePage}
            renderItem={(item) => (
              <CustomPaginationItem
                {...item}
                isPrev={item.type === "previous"}
                isNext={item.type === "next"}
                isPrevOrNext={item.type === "previous" || item.type === "next"}
              />
            )}
            sx={{
              padding: "24px",
              justifyContent: "flex-end",
              display: "flex",
            }}
          />
          {/* <Menu
            id="user-action-menu"
            anchorEl={userAnchorEl}
            keepMounted
            open={Boolean(userAnchorEl)}
            onClose={handleUserClose}
          >
            <MenuItem
              onClick={() => {
                selectedUser.userStatus === "Active"
                  ? handleDisable(selectedUser.userEmail, selectedUser.userID)
                  : handleEnable(selectedUser.userEmail, selectedUser.userID);
              }}
            >
              {selectedUser?.userStatus === "Active" ? "Disable" : "Enable"}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleAdminRoleTransfer(selectedUser.userEmail);
              }}
            >
              Make Admin
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeleteUser(selectedUser.userEmail, selectedUser.userID);
              }}
            >
              Delete
            </MenuItem>
          </Menu> */}
        </Paper>
      )}

      {currentPage === "Invitations" && (
        <Paper
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>
            List of Invitations
          </Typography>
          <TableContainer>
            <Table aria-label="invitation list table" size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Invitation
                  </StyledTableCell>
                  {/* <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Role
                  </StyledTableCell> */}
                  <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Status
                  </StyledTableCell>
                  {/* <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Copy Link
                  </StyledTableCell> */}
                  <StyledTableCell
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                    // align="right"
                  >
                    Actions
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInvitations.map((invitation) => (
                  <StyledTableRow key={invitation.invitationID}
                    style={{ backgroundColor: "#F9FAFB" }}
                  >
                    <TableCell style={{ width: "40%" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            mr: 2,
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.8),
                          }}
                        >
                          <EmailIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {invitation.userEmail}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {invitation.companyName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    {/* <TableCell style={{ width: "20%" }}>
                      <Tooltip title={invitation.userRole.S}>
                        <IconButton size="small" color="default">
                          <PersonIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell> */}
                    <TableCell style={{ width: "20%" }}>
                      <Chip
                        label={invitation.invitationStatus}
                        color={getStatusColor(invitation.invitationStatus)}
                        size="small"
                        sx={{ fontWeight: "bold", paddingY: 2 }}
                      />
                    </TableCell>
                    {/* <TableCell style={{ width: "20%" }}>
                      {invitation.invitationStatus.S === "Pending" && (
                        <Tooltip title="Copy Invitation Link">
                          <IconButton
                            size="small"
                            onClick={() =>
                              copyToClipboard(invitation.inviteLink.S)
                            }
                            sx={{
                              color: theme.palette.primary.main,
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.04
                                ),
                              },
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell> */}
                    <TableCell style={{ width: "20%" }}>
                      <IconButton
                        aria-label="more actions"
                        aria-controls="invitation-action-menu"
                        aria-haspopup="true"
                        onClick={(event) =>
                          handleInvitationClick(event, invitation)
                        }
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={Math.ceil(
              filteredInvitations.length / invitationRowsPerPage
            )}
            page={invitationPage}
            onChange={handleInvitationChangePage}
            renderItem={(item) => (
              <CustomPaginationItem
                {...item}
                isPrev={item.type === "previous"}
                isNext={item.type === "next"}
                isPrevOrNext={item.type === "previous" || item.type === "next"}
              />
            )}
            sx={{
              padding: "24px",
              justifyContent: "flex-end",
              display: "flex",
            }}
          />
          <Menu
            id="invitation-action-menu"
            anchorEl={invitationAnchorEl}
            keepMounted
            open={Boolean(invitationAnchorEl)}
            onClose={handleInvitationClose}
          >
            <MenuItem
              onClick={() => {
                handleDeleteInvitation(
                  selectedInvitation.invitationID.S,
                  selectedInvitation.userID.S
                );
              }}
            >
              {selectedInvitation?.invitationStatus.S === "Accepted"
                ? "Move To Trash"
                : "Discard Invitation"}
            </MenuItem>
          </Menu>
        </Paper>
      )}
    </Box>
  );
};

export default AdminPanel;
