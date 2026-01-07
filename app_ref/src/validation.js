// src/validation.js

import * as Yup from "yup";

export const loginSchema = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
  companyName: Yup.string()
    .matches(/^[a-zA-Z0-9-_]+$/, "Alphanumeric, '-' and '_' only, no spaces")
    .required("Company Name is required"),
});

// Create a function to return the Yup schema based on account type
export const getSignupSchema = (accountType) => {
  return Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Required"),
    fullName: Yup.string().required("Full Name is required"),
    password: Yup.string()
      .required("No password provided.")
      .matches(/[0-9]/, "Password requires a number")
      .matches(/[a-z]/, "Password requires a lowercase letter")
      .matches(/[A-Z]/, "Password requires an uppercase letter")
      .matches(/[^\w]/, "Password requires a symbol")
      .min(8, "Password is too short. There should be 8 chars minimum."),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    ...(accountType === "Enterprise"
      ? {
          organizationName: Yup.string().required(
            "Organization Name is required"
          ),
        }
      : {
          accountName: Yup.string().required("Account Name is required"),
        }),
  });
};

export const registerSchema = Yup.object().shape({
  fullName: Yup.string().required("Full Name is required"),
  password: Yup.string()
    .required("No password provided.")
    .matches(/[0-9]/, "Password requires a number")
    .matches(/[a-z]/, "Password requires a lowercase letter")
    .matches(/[A-Z]/, "Password requires an uppercase letter")
    .matches(/[^\w]/, "Password requires a symbol")
    .min(8, "Password is too short. There should be 8 chars minimum."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export const experimentNameSchema = Yup.object().shape({
  experimentName: Yup.string().required("Experiment Name is required"),
});

export const emailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter the valid email address")
    .required("Please enter the email address"),
});
export const stageExportSchema = Yup.object().shape({
  stageName: Yup.string().required("Please enter the stage name"),
});
export const reportNameSchema = Yup.object().shape({
  reportName: Yup.string().required("Please enter the report name"),
});

export const impactPipelineSchema = Yup.object().shape({
  impactPipelineName: Yup.string().required("Impact Pipeline Name is required"),
  impactPipelineTag: Yup.string().required("Impact Pipeline Tag is required"),
  experimentIDs: Yup.array()
    .min(1, "Please select at least one experiment")
    .required("Please select experiments"),
});

export const gSheetFormSchema = Yup.object().shape({
  gSheetConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  gSheetSpreadSheetId: Yup.string().required("Please enter the spreadsheet id"),
  gSheetServiceId: Yup.string().required("Please enter the service id"),
});

export const gDriveFormSchema = Yup.object().shape({
  gDriveConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  gDriveFolderId: Yup.string().required("Please enter the folder id"),
  gDriveServiceId: Yup.string().required("Please enter the service id"),
});
export const unicommerceFormSchema = Yup.object().shape({
  unicommerceConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  unicommerceTenantURL: Yup.string().required("Please enter the tenant url"),
  unicommerceFacility: Yup.string().required("Please enter the Facility Code"),
  unicommerceUsername: Yup.string().required("Please enter the Username"),
  unicommercePassword: Yup.string().required("Please enter the Password"),
});
export const snowflakeFormSchema = Yup.object().shape({
  snowflakeConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  snowflakeAccount: Yup.string().required("Please enter the account"),
  snowflakeUsername: Yup.string().required("Please enter the Username"),
  snowflakePassword: Yup.string().required("Please enter the Password"),
  snowflakeWarehouse: Yup.string().required("Please enter the Warehouse"),
  snowflakeDatabase: Yup.string().required("Please enter the Database"),
  snowflakeSchema: Yup.string().required("Please enter the Schema"),
});
export const azureSQLFormSchema = Yup.object().shape({
  azureSQLConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  azureSQLServer: Yup.string().required("Please enter the server"),
  azureSQLUsername: Yup.string().required("Please enter the Username"),
  azureSQLPassword: Yup.string().required("Please enter the Password"),
  azureSQLDatabase: Yup.string().required("Please enter the Database"),
});
export const googleBigQueryFormSchema = Yup.object().shape({
  googleBigQueryConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  googleBigQueryCredentials: Yup.string()
    .required("Please enter the credentials")
    .test("is-json", "Credentials must be valid JSON", (value) => {
      try {
        if (!value) return true; // Let required validation handle empty case
        JSON.parse(value);
        return true;
      } catch (e) {
        return false;
      }
    }),
});
export const bizeeBuyFormSchema = Yup.object().shape({
  bizeeBuyConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  bizeeBuyAccessToken: Yup.string().required("Please enter the Access token"),
});
export const ms365BusinessCentralFormSchema = Yup.object().shape({
  ms365BusinessCentralConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  ms365BusinessCentralBaseURL: Yup.string().required("Please enter the Base URL"),
  ms365BusinessCentralUserID: Yup.string().required("Please enter the User ID"),
  ms365BusinessCentralPassword: Yup.string().required("Please enter the Password"),
});
export const shopifyFormSchema = Yup.object().shape({
  shopifyConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  shopifyShopName: Yup.string().required("Please enter Shop name"),
  shopifyAccessToken: Yup.string().required("Please enter Access token"),
  shopifyAPISecretKey: Yup.string().required("Please enter API Secret Key"),
});

export const amazonSellerFormSchema = Yup.object().shape({
  amazonSellerConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  amazonSellerAccessToken: Yup.string().required(
    "Please enter the Login with Amazon (LWA) access token!"
  ),
  amazonSellerEndpoint: Yup.string().required(
    "Please enter the AWS region endpoint!"
  ),
  amazonSellerAppVersion: Yup.string().required(
    "Please enter the version of your application!"
  ),
  amazonSellerAppId: Yup.string().required(
    "Please enter the name of your application!"
  ),
});

export const amazonVendorFormSchema = Yup.object().shape({
  amazonVendorConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  amazonVendorAccessToken: Yup.string().required(
    "Please enter the Login with Amazon (LWA) access token!"
  ),
  amazonVendorEndpoint: Yup.string().required(
    "Please enter the AWS region endpoint!"
  ),
  amazonVendorAppVersion: Yup.string().required(
    "Please enter the version of your application!"
  ),
  amazonVendorAppId: Yup.string().required(
    "Please enter the name of your application!"
  ),
});

export const flipkartFormSchema = Yup.object().shape({
  flipkartConnectionName: Yup.string().required(
    "Please enter the connection name!"
  ),
  flipkartAccessToken: Yup.string().required("Please enter Access token"),
});

export const sapFormSchema = Yup.object().shape({
  sapConnectionName: Yup.string().required("Please enter the connection name!"),
  sapDomain: Yup.string().required("Please enter the SAP API domain!"),
  sapRegionHost: Yup.string().required(
    "Please enter the SAP region host required for inventory API!"
  ),
  sapApiKey: Yup.string().required("Please enter your SAP API Key!"),
});
