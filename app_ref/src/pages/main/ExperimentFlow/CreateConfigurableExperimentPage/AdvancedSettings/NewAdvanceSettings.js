import React, { useContext, useEffect, useState } from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";

import BucketView from "./BucketView";

import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../../../../theme/config/ThemeContext";

import useModule from "../../../../../hooks/useModule";

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
  const { setCurrentAdvanceSettingBucket } = useModule();
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
        onClick={() => setCurrentAdvanceSettingBucket(bucket)}
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

const NewAdvanceSettings = () => {
  const {
    advanceSettingBuckets,
    advanceSettingBucketsFilledFlags,
    currentAdvanceSettingBucket,
    setCurrentAdvanceSettingBucket,
    restoreMLToDefault,
  } = useModule();

  const { theme } = useContext(ThemeContext);
  const [refresh, setRefresh] = useState(false);
  const handleRestore = () => {
    restoreMLToDefault(currentAdvanceSettingBucket, null);
    setRefresh((prev) => !prev); // Toggle refresh state to force re-render
  };
  const handleRestoreNew = (bucket) => {
    restoreMLToDefault(bucket, null);
    // setRefresh((prev) => !prev); // Toggle refresh state to force re-render
  };

  console.log(
    "currenttab " +
      currentAdvanceSettingBucket +
      " " +
      advanceSettingBucketsFilledFlags
  );
  const location = useLocation();
  const paramsLength = location.pathname.split("/").length;
  const currentLastParam = location.pathname.split("/")[paramsLength - 1];

  useEffect(() => {
    console.log("Context Buckets:", advanceSettingBuckets);

    setCurrentAdvanceSettingBucket(Object.keys(advanceSettingBuckets)[0]);
  }, []);
  return (
    <Box>
      <Grid container spacing={0} padding={"2px 32px 12px 32px"}>
        {Object.keys(advanceSettingBuckets).map((bucket, index) => {
          return (
            <Grid
              item
              xs={12}
              md={12 / Object.keys(advanceSettingBuckets).length}
              sx={{
                border: "1px solid",
                borderColor: theme.palette.borderColor.searchBox,
              }}
              key={`${bucket}`}
            >
              <CustomizedButtonStyles
                index={index}
                title={advanceSettingBuckets[bucket].title}
                description={advanceSettingBuckets[bucket].description}
                bucket={bucket}
                totalBuckets={Object.keys(advanceSettingBuckets).length}
                currentBucket={currentAdvanceSettingBucket}
                onClickBucket={setCurrentAdvanceSettingBucket}
              />
            </Grid>
          );
        })}
      </Grid>
      {Object.keys(advanceSettingBuckets).includes(
        currentAdvanceSettingBucket
      ) && (
        <Box padding={"2px 16px 12px 16px"}>
          <BucketView
            bucket={currentAdvanceSettingBucket}
            refresh={refresh}
            onRestore={handleRestore}
            setRefresh={setRefresh}
          />
        </Box>
      )}
    </Box>
  );
};

export default NewAdvanceSettings;
