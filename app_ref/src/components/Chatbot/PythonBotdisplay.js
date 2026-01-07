import React from "react";
import { Box } from "@mui/material";
import Editor from "@monaco-editor/react";

const PythonBotDisplay = ({ message }) => {
  const isJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const parseMessage = () => {
    if (isJSON(message)) {
      try {
        const parsedMessage = JSON.parse(message);
        return `
${parsedMessage.import_dependency || ""}
${parsedMessage.read_data || ""}
${parsedMessage.analysis_logic || ""}
${parsedMessage.result_summary || ""}
${parsedMessage.save_result || ""}
`
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .trim();
      } catch (error) {
        console.error("Error parsing message:", error);
        return "Error processing the message.";
      }
    }
    return message;
  };

  const snippet = parseMessage();

  return (
    <Box
      sx={{
        width: "100%",
        maxHeight: "400px",
        overflow: "hidden",
        borderRadius: "8px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Editor
        height="300px"
        defaultLanguage="python"
        value={snippet}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          wordWrap: "on",
          horizontalScrollbarSize: 10,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          theme: "vs-light",
        }}
      />
    </Box>
  );
};

export default PythonBotDisplay;
