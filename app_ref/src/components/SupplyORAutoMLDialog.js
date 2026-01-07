import * as React from "react";
import NewExperimentDialog from "./NewExperimentDialog";

export default function SupplyORAutoMLDialog({ open, handleClose }) {
  return (
    <NewExperimentDialog 
      open={open} 
      handleClose={handleClose}
    />
  );
}