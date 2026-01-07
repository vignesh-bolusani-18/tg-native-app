import React from "react";
import { GridToolbarContainer, useGridApiContext } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import CustomButton from "./CustomButton";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";

function CustomToolbar() {
  const apiRef = useGridApiContext();

  // Download CSV
  const handleDownloadClick = () => {
    apiRef.current.exportDataAsCsv();
  };

  return (
    <GridToolbarContainer>
      <Box sx={{ flexGrow: 1 }} />

      <CustomButton title="Download CSV" onClick={handleDownloadClick} CustomStartAdornment={<FileDownloadOutlinedIcon style={{color:'white'}}/>} />
    </GridToolbarContainer>
  );
}

export default CustomToolbar;
