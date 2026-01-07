import React from "react";
import { Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FileUploader = () => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`Uploaded file: ${file.name}`);
    }
  };

  return (
    <Button
      component="label"
      variant="outlined"
      startIcon={<UploadFileIcon />}
      sx={{
        textTransform: "none",
        borderColor: "#90caf9",
        color: "#0d47a1",
        "&:hover": { borderColor: "#1e88e5" },
      }}
    >
      Upload CSV
      <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
    </Button>
  );
};

export default FileUploader;
