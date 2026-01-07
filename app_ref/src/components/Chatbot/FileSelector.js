import React from "react";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const FileSelector = ({ contextFiles, selectedContextFile, setSelectedContextFile }) => {
  return (
    <FormControl sx={{ minWidth: 120 }}>
      <InputLabel>Context</InputLabel>
      <Select
        value={selectedContextFile}
        onChange={(e) => setSelectedContextFile(e.target.value)}
      >
        <MenuItem value={null}>No Context</MenuItem>
        {contextFiles.map((file, index) => (
          <MenuItem key={index} value={file}>
            {file.split("/").pop()} 
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FileSelector;
