import React, { useContext, useEffect, useState } from "react";
import useConfig from "../../../../../hooks/useConfig";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import BucketView from "./BucketView";
import EditIcon from "@mui/icons-material/Edit";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../../../../theme/config/ThemeContext";

const btnGrpText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
  whiteSpace: "nowrap", // Prevents wrapping
  overflow: "hidden", // Hides overflowed content
  textOverflow: "ellipsis", // Shows ellipsis for overflowed content
  maxWidth: "100%", //
};

const CustomizedButtonStyles = ({
  title,
  bucket,
  onClickBucket,
  currentBucket,
  index,
  totalBuckets,
}) => {
  const { setCurrentBucket, contextBucketsFilledFlags } = useConfig();
  if (bucket === currentBucket) {
    return (
      <Button
        sx={{
          backgroundColor: "#F1F9FF",
          width: "100%",
          maxWidth: "100%",
          "&:hover": {
            backgroundColor: "#F1F9FF",
            textDecoration: "none",
            // border: "1px solid",
            // borderColor: theme.palette.borderColor.searchBox,
          },

          height: "40px",
        }}
        onClick={() => setCurrentBucket(bucket)}
      >
        <Stack
          direction={"row"}
          spacing={1}
          alignItems={"center"}
          paddingRight={"8px"}
          sx={{
            maxWidth: "100%",
            overflow: "hidden", // Prevents the stack from exceeding the button width
          }}
        >
          <Box
            sx={{
              height: "8px",
              width: "8px",
              borderRadius: "4px",
              backgroundColor: "#12B76A",
            }}
          />
          <Typography sx={btnGrpText}>{title}</Typography>
        </Stack>
      </Button>
    );
  } else {
    return (
      <Button
        sx={{
          width: "100%",
          "&:hover": {
            backgroundColor: "#F1F9FF",
            // // textDecoration: "none",
            // border: "1px solid",
            // borderColor: theme.palette.borderColor.searchBox,
          },
          height: "40px",
        }}
        onClick={() => onClickBucket(bucket)}
      >
        <Stack direction={"row"} spacing={1} paddingRight={"8px"}>
          {/* <Box
              sx={{
                height: "8px",
                width: "8px",
                borderRadius: "4px",
                backgroundColor: "#F1F9FF",
              }}
            /> */}
          <Typography sx={btnGrpText}>{title}</Typography>
        </Stack>
      </Button>
    );
  }
};

const NewAddContext = () => {
  const {
    contextBuckets,
    currentBucket,
    setCurrentBucket,
    contextBucketsFilledFlags,
    restoreToDefault,
  } = useConfig();
  const { theme } = useContext(ThemeContext);
  const [refresh, setRefresh] = useState(false);
  const handleRestore = () => {
    restoreToDefault(currentBucket, null);
    setRefresh((prev) => !prev); // Toggle refresh state to force re-render
  };
  const handleRestoreNew = (bucket) => {
    restoreToDefault(bucket, null);
    // setRefresh((prev) => !prev); // Toggle refresh state to force re-render
  };
  const location = useLocation();
  const paramsLength = location.pathname.split("/").length;
  const currentLastParam = location.pathname.split("/")[paramsLength - 1];
  useEffect(() => {
    console.log("Context Buckets:", contextBuckets);
    if (currentBucket === "None") {
      setCurrentBucket("FC");
    }
  }, []);

  return (
    <Box>
      <Grid container spacing={0} padding={"2px 32px 12px 32px"}>
        {Object.keys(contextBuckets).map((bucket, index) => {
          return (
            <Grid
              item
              xs={12}
              md={12 / Object.keys(contextBuckets).length}
              sx={{
                border: "1px solid",
                borderColor: theme.palette.borderColor.searchBox,
              }}
              key={`${bucket}`}
            >
              <CustomizedButtonStyles
                index={index}
                title={contextBuckets[bucket].title}
                description={contextBuckets[bucket].description}
                bucket={bucket}
                totalBuckets={Object.keys(contextBuckets).length}
                currentBucket={currentBucket}
                onClickBucket={setCurrentBucket}
              />
            </Grid>
          );
        })}
      </Grid>
      {Object.keys(contextBuckets).includes(currentBucket) && (
        <Box padding={"2px 16px 12px 16px"}>
          <BucketView
            bucket={currentBucket}
            refresh={refresh}
            onRestore={handleRestore}
            setRefresh={setRefresh}
          />
        </Box>
      )}
    </Box>
  );
};

export default NewAddContext;
