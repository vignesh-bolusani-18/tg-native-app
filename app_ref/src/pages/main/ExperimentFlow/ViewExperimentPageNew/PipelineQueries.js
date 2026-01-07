import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import CustomCheck from "../../../../components/CustomInputControls/CustomCheck";
import { Editor } from "@monaco-editor/react";
import useExports from "../../../../hooks/useExports";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import CustomTextInput from "./../../../../components/CustomInputControls/CustomTextInput2";

const PipelineQueries = () => {
  const { export_pipeline, setCreateQuery, setTransformQuery, setInsertQuery } =
    useExports();
  const languageOption = ["python", "sql"];
  return (
    <Stack>
      <Typography
        sx={{
          fontFamily: "Inter",
          fontSize: "18px",
          fontWeight: 500,
          lineHeight: "28px",
          color: "#101828",
          textAlign: "left",
        }}
      >
        Step 3: Add Queries
      </Typography>

      <Stack
  
        gap={"8px"}
        sx={{
          padding: "0px 0px",
          justifyContent: "center",
        }}
      >
        <CustomCheck
          question={"Create New Table?"}
          direction={"column"}
          path={"create_table"}
          target={"exports"}
        />
        {export_pipeline.create_table ? (
          <Stack gap={"8px"}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Box sx={{ flex: 10 }}>
                <Typography
                  sx={{
                    color: "#344054",
                    fontFamily: "Inter",
                    fontWeight: "500",
                    fontSize: "14px",
                    lineHeight: "20px",
                  }}
                >
                  Create Query
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomAutocomplete
                  disableClearable
                  path={"create_query_language"}
                  target={"exports"}
                  values={languageOption}
                />
              </Box>
            </Stack>
            <Box
              sx={{
                borderRadius: "0px",
                border: "1px solid #EAECF0",
                padding: "2px",
              }}
            >
              <Editor
                height="250px"
                // width='100%'
                loading={false}
                language={export_pipeline.create_query_language}
                theme="light"
                value={export_pipeline.create_query}
                onChange={(value) => setCreateQuery(value)}
                options={{
                  readOnly: false,
                  padding: {
                    top: 18,
                    bottom: 18,
                    left: 18,
                    right: 18,
                  },
                  borderRadius: "8px",
                  border: "1px solid red",
                }}
                style={{
                  width: "80%",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  marginBottom: "20px",
                }}
              />
            </Box>
          </Stack>
        ) : (
          <CustomTextInput
            label={"Table name"}
            showLabel
            placeholder={"Enter table name"}
            target={"exports"}
            path={"existing_table_name"}
          />
        )}
    
        <Stack gap={"8px"}>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Box sx={{ flex: 10 }}>
              <Typography
                sx={{
                  color: "#344054",
                  fontFamily: "Inter",
                  fontWeight: "500",
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                Insert Query
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <CustomAutocomplete
                disableClearable
                path={"insert_query_language"}
                target={"exports"}
                values={languageOption}
              />
            </Box>
          </Stack>
          <Box
            sx={{
              borderRadius: "0px",
              border: "1px solid #EAECF0",
              padding: "2px",
            }}
          >
            <Editor
              height="250px"
              // width='100%'
              loading={false}
              language={export_pipeline.insert_query_language}
              theme="light"
              value={export_pipeline.insert_query}
              onChange={(value) => setInsertQuery(value)}
              options={{
                readOnly: false,
                padding: {
                  top: 18,
                  bottom: 18,
                  left: 18,
                  right: 18,
                },
                borderRadius: "8px",
                border: "1px solid red",
              }}
              style={{
                width: "80%",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                marginBottom: "20px",
              }}
            />
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default PipelineQueries;
