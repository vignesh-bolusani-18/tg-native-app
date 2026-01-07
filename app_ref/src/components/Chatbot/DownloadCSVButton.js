import React from "react";
import { IconButton } from "@mui/material";
import DownloadIcon from "../../assets/Icons/download-chatbot.svg";

const DownloadCSVButton = ({ data, fileName = "table_data.csv" }) => {
  const handleDownloadCSV = () => {
    if (!data || data.length === 0) return;

    const csvContent = [
      Object.keys(data[0]).join(","), // Headers
      ...data.map((row) => Object.values(row).join(",")), // Rows
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <IconButton onClick={handleDownloadCSV} sx={{ color: "#1976d2" }}>
      <img src={DownloadIcon} alt="Download CSV" style={{ width: "20px", height: "20px" }} />
    </IconButton>
  );
};

export default DownloadCSVButton;
