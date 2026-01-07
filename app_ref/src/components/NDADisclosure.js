import React from "react";
import { Typography, Link } from "@mui/material";

const NDADisclosure = () => {
  return (
    <Typography
      variant="body2"
      sx={{
        fontFamily: "Inter",
        fontSize: "12px",
        color: "#667085",
        textAlign: "center",
      }}
    >
      By submitting or uploading data, you confirm that you are authorized and
      agree to be bound by the{" "}
      <Link
        href="/mutual-nda"
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
      >
        Mutual Non-Disclosure Agreement
      </Link>
      .
    </Typography>
  );
};

export default NDADisclosure;
