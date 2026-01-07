import React, { useEffect } from "react";
import useConfig from "../../../../../hooks/useConfig";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";

import CustomButton from "./../../../../../components/CustomButton";
import { useState } from "react";
import FeatureGroupDialog from "./FeatureGroupDialog";
import EditIcon from "@mui/icons-material/Edit";
import { useLocation } from "react-router-dom";

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
};

const titleStyleCompleted = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#027A48",
  textAlign: "left",
};
const titleStylePurple = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#53389E",
  textAlign: "left",
};

const contentStyle = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  color: "#626F86",
  textAlign: "left",
  whiteSpace: "pre-line",
};

const NewBoxComponent = ({
  title,
  description,
  featureGroup,
  onClickFeatureGroup,
  currentFeatureGroup,
}) => {
  // Access contextConfig from useConfig directly in the component
  
  const { contextConfig } = useConfig();
  
  // Check if the required field is missing
  const isDateMissing = !contextConfig?.etl?.activity_end_date;
  
  return (
    <Card
      sx={{
        cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        boxShadow:
          featureGroup === currentFeatureGroup
            ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
            : "0px 4px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#FFFFFF",
        height: "100%",
        "& .MuiCard-root": {
          padding: 0,
        },
        "&:hover": {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
          transition: "all 0.3s ease-in-out",
        },
      }}
      onClick={() => onClickFeatureGroup(featureGroup)}
    >
      <CardContent
        sx={{
          padding: "0px",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={"space-between"}
          sx={{
            border: "1px solid #EAECF0",
            borderColor:
              featureGroup === currentFeatureGroup ? "#D6BBFB" : "#EAECF0",
            borderRadius: "8px 8px 0px 0px",
            padding: "16px 20px 16px 16px",
            backgroundColor:
              featureGroup === currentFeatureGroup ? "#F9F5FF" : "#FFFFFF",
          }}
        >
          <Stack alignItems={"center"} spacing={1} direction={"row"}>
            <Typography
              sx={
                featureGroup === currentFeatureGroup
                  ? titleStylePurple
                  : titleStyle
              }
            >
              {title}
            </Typography>
          </Stack>
        </Stack>
        <Stack p={2}>
          <Typography sx={contentStyle}>{description}</Typography>
          
          {/* Alert for missing required fields */}
          {isDateMissing  && (featureGroup === "FD") &&  (
            <Box 
            sx={{
              display: "inline-flex",
              marginTop: "12px",
              backgroundColor: "#FFF1F2",
              borderLeft: "4px solid #E11D48",
              borderRadius: "4px",
              padding: "8px 12px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                color: "#E11D48",
              }}
            >
              Missing required fields: Select a date
            </Typography>
          </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const NewFilledBoxComponent = ({
  title,
  description,
  featureGroup,
  currentFeatureGroup,
  bucket,
  onEdit,
  onRestore,
}) => {


  const { contextConfig } = useConfig();
  
  // Check if the required field is missing
  const isDateMissing = !contextConfig?.etl?.activity_end_date;
  return (
    <Card
      sx={{
        // cursor: "pointer",
        border: "1px solid #EAECF0",
        borderRadius: "8px",
        boxShadow:
          featureGroup === currentFeatureGroup
            ? "0px 4px 8px rgba(0, 0, 0, 0.1)"
            : "0px 4px 8px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#FFFFFF",
        height: "100%",
        "& .MuiCard-root": {
          padding: 0,
        },
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
          transition: "all 0.3s ease-in-out",
        },
      }}
      onClick={() => {
        onEdit(featureGroup);
      }}
    >
      <CardContent
        sx={{
          padding: "0px",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={"space-between"}
          sx={{
            border: "1px solid #A6F4C5",
            borderRadius: "8px 8px 0px 0px",
            padding: "16px 20px 16px 16px",
            background: "#ECFDF3",
          }}
        >
          <Typography sx={titleStyleCompleted}>{title}</Typography>
          <Stack direction={"row"} spacing={1}>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                onRestore(featureGroup);
              }}
              sx={{ padding: "0px" }}
            >
              <RestoreIcon fontSize="small" style={{ color: "#626F86" }} />
            </IconButton>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                onEdit(featureGroup);
              }}
              sx={{ padding: "0px" }}
            >
              <EditIcon fontSize="small" style={{ color: "#626F86" }} />
            </IconButton>
          </Stack>
        </Stack>
        <Stack p={2}>
          <Typography sx={contentStyle}>{description}</Typography>
          {isDateMissing  && (featureGroup === "FD") &&  (
            <Box 
            sx={{
              display: "inline-flex",
              marginTop: "12px",
              backgroundColor: "#FFF1F2",
              borderLeft: "4px solid #E11D48",
              borderRadius: "4px",
              padding: "8px 12px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                color: "#E11D48",
              }}
            >
              Missing required fields: Select a date
            </Typography>
          </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const BucketView = ({ bucket, refresh, onRestore, setRefresh }) => {
  const {
    contextBuckets,
    currentBucket,
    setCurrentBucket,
    contextBucketsFilledFlags,
    confirmContextGroup,
    restoreToDefault,
    currentFeatureGroup,
    contextConfig,
    setFeatureGroup,
  } = useConfig();
  // const [refresh, setRefresh] = useState(false);

  // Trigger re-render when restoreToDefault is called

  useEffect(() => {
    console.log("Context Config Changed");
  }, [contextConfig, refresh]);
  const [featureGroupOpen, setFeatureGroupOpen] = useState(false);
  const handleFeatureGroupOpen = () => setFeatureGroupOpen(true);
  const handleFeatureGroupClose = () => setFeatureGroupOpen(false);

  const handleFeatureGroupRestore = (featureGroup) => {
    restoreToDefault(currentBucket, featureGroup);
    setRefresh((prev) => !prev); // Toggle refresh state to force re-render
  };

  const location = useLocation();
  const paramsLength = location.pathname.split("/").length;
  const currentLastParam = location.pathname.split("/")[paramsLength - 1];

  if (currentBucket === "None") {
    return null;
  }
 

  return (
    <Box>
      {/* <Divider /> */}
      <Grid container spacing={2} padding={"12px 16px 12px 16px"}>
        {Object.keys(contextBuckets[bucket].featureGroups)
          .filter((featureGroup) => {
            

            return true;
          })
          .map((featureGroup) => (
            <Grid
              item
              xs={12}
              md={
                Object.keys(contextBuckets[bucket].featureGroups).length === 7
                  ? 4
                  : Object.keys(contextBuckets[bucket].featureGroups).length > 3
                  ? 24 /
                    Object.keys(contextBuckets[bucket].featureGroups).length
                  : 12 /
                    Object.keys(contextBuckets[bucket].featureGroups).length
              }
              key={`${featureGroup}`}
            >
              {!contextBucketsFilledFlags[featureGroup] ? (
                <NewBoxComponent
                  title={
                    contextBuckets[bucket].featureGroups[featureGroup].title
                  }
                  description={
                    contextBuckets[bucket].featureGroups[featureGroup]
                      .description
                  }
                  featureGroup={featureGroup}
                  currentFeatureGroup={currentFeatureGroup}
                  onClickFeatureGroup={async (featureGroup) => {
                    await setFeatureGroup(featureGroup);
                    handleFeatureGroupOpen();
                  }}
                />
              ) : (
                <NewFilledBoxComponent
                  title={
                    contextBuckets[bucket].featureGroups[featureGroup].title
                  }
                  description={
                    contextBuckets[bucket].featureGroups[featureGroup]
                      .description
                  }
                  bucket={bucket}
                  currentFeatureGroup={currentFeatureGroup}
                  featureGroup={featureGroup}
                  onEdit={async (featureGroup) => {
                    await setFeatureGroup(featureGroup);
                    handleFeatureGroupOpen();
                  }}
                  onRestore={(featureGroup) => {
                    handleFeatureGroupRestore(featureGroup);
                  }}
                />
              )}
            </Grid>
          ))}
      </Grid>
      {/* <Stack
        direction={"row"}
        justifyContent={"flex-end"}
        spacing={1}
        padding={"12px 16px 12px 16px"}
      >
        <CustomButton
          title="Restore"
          outlined
          onClick={() => {
            onRestore();
          }}
        />
        <CustomButton
          title="Confirm"
          onClick={() => {
            confirmContextGroup(bucket);
          }}
          disabled={bucket === "FC" ? !contextBucketsFilledFlags["FD"] : false}
        />
      </Stack> */}
      {featureGroupOpen && currentFeatureGroup !== "None" && (
        <FeatureGroupDialog
          open={featureGroupOpen}
          handleClose={handleFeatureGroupClose}
          bucket={currentBucket}
          featureGroup={currentFeatureGroup}
          refresh={refresh}
          onRestore={() => handleFeatureGroupRestore(currentFeatureGroup)}
        />
      )}
    </Box>
  );
};

export default BucketView;
