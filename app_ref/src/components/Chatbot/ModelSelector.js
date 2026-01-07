import React, { useEffect } from "react";
import { FormControl, MenuItem, Select, Typography } from "@mui/material";
import useDashboard from "../../hooks/useDashboard";

const ModelSelector = ({ onSelectModel }) => {
  const { selectedModel, setSelectedModel } = useDashboard();
  const models = ["OpenAi", "Claude"];

  const handleChange = (e) => {
    const model = e.target.value;
    if (onSelectModel) onSelectModel(model);
    setSelectedModel(model); 
  };

  useEffect(() => {
    console.log("Available models:", models);
    console.log("Currently selected model:", selectedModel);
  }, [models, selectedModel]);

  return (
    <FormControl sx={{ minWidth: 150 }}>
      <Typography
        variant="caption"
        sx={{ marginBottom: "4px", color: "#0d47a1" }}
      >
        Select Model
      </Typography>
      <Select
        value={selectedModel || ""}
        onChange={handleChange}
        variant="outlined"
        size="small"
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 200,
              overflowY: "auto",
              width: 150,
            },
          },
          onClose: (event) => {
            if (event.type === "click") return;
          },
        }}
        sx={{
          backgroundColor: "#ffffff",
          borderColor: "#90caf9",
          zIndex: 5000,
        }}
      >
        {models.map((model) => (
          <MenuItem
            key={model}
            value={model}
            onClick={() => setSelectedModel(model)}
          >
            {model}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ModelSelector;
