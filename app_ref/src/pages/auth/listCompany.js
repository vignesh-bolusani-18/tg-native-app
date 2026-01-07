import React, { useState } from "react";
import {
  Grid,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import useAuth from "../../hooks/useAuth";
import { createCompany } from "../../utils/createCompany";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const TenantList = () => {
  const { userInfo, currentCompany } = useAuth();
  console.log(userInfo); // Get userInfo from the context
  const tenantDetails = userInfo?.tenantDetails || [];
  const hasTenants = tenantDetails.length > 0;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const initialValues = { companyName: "" };

  // Form validation schema
  const validationSchema = Yup.object({
    companyName: Yup.string()
      .required("Company name is required")
      .min(2, "Company name must be at least 2 characters"),
  });

  // Handler for API call to create company
  const handleCreateCompany = async (
    values,
    { setSubmitting, setFieldError, resetForm }
  ) => {
    try {
      const response = await createCompany({ name: values.companyName });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      console.log("Company created successfully", response.data);
      resetForm(); // Clear the form after successful creation
    } catch (err) {
      setFieldError("companyName", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Grid
      container
      spacing={2}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "100vh" }} // Ensure full-height on larger screens
    >
      {hasTenants ? (
        <Grid item xs={12} md={8}>
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
            align="center"
            gutterBottom
          >
            Your Tenants
          </Typography>
          <List>
            {tenantDetails.map((tenant, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={tenant.name || "Unnamed Tenant"} />
              </ListItem>
            ))}
          </List>
        </Grid>
      ) : (
        <Grid item xs={12} md={8} textAlign="center">
          <Typography variant={isSmallScreen ? "h5" : "h4"} gutterBottom>
            No Tenants Found
          </Typography>
        </Grid>
      )}

      {/* Add Company Form */}
      <Grid item xs={12} md={8}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleCreateCompany}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field name="companyName">
                {({ field }) => (
                  <TextField
                    {...field}
                    label="Enter Company Name"
                    variant="outlined"
                    fullWidth
                    error={!!field.error}
                    helperText={<ErrorMessage name="companyName" />}
                  />
                )}
              </Field>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting} // Disable when submitting
                style={{ marginTop: 16 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} />
                ) : (
                  "Create Company"
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </Grid>
    </Grid>
  );
};

export default TenantList;
