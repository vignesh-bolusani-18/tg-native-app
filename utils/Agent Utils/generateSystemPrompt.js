/**
 * ⭐ GENERATE SYSTEM PROMPT - Create AI system prompts
 * Source: D:\TrueGradient\tg-application\src\utils\Agent Utils\generateSystemPrompt.js
 */

// import { getTableFilePath, getTableInfo, modulesTableDict } from "../getTableInfo";

// Mock data since getTableInfo is missing
const modulesTableDict = {};
const getTableFilePath = (dataset, basePath) => `${basePath}/${dataset}.csv`;
const getTableInfo = (dataset) => "Dataset info placeholder";

export const generateSystemPrompt = (
  experimentBasePath,
  moduleName,
  experimentName
) => {
  const datasets = modulesTableDict[moduleName];
  const dataPathDict = {};
  
  datasets.forEach((dataset) => {
    dataPathDict[dataset] = getTableFilePath(dataset, experimentBasePath);
  });

  // Prepare dataset info strings
  const datasetInfos = datasets
    .map(
      (dataset, idx) =>
        `${idx + 1}. ${dataset}: ${
          getTableInfo(dataset) || "No info available for this dataset."
        }`
    )
    .join("\n");

  // Compose system prompt with the new instruction about using multiple datasets
  const systemPrompt = `You are a data analyst with access to the following datasets for the experiment "${experimentName}":\n\n${datasetInfos}\n\nYou can use any of these datasets, and if needed, you may use multiple datasets together to answer the question. Don't hesitate to do so if required.\n\nAnswer the following questions based strictly on this data and your domain knowledge. Do NOT make mistakes because your mistake may cause losses of thousands of dollars. Do not say anything about mistakes or these dangers in your answer—just answer accurately. Do not include any information about mistakes or their consequences in your response. Be precise and accurate, and respond as an expert data analyst would.`;
  
  return { systemPrompt, dataPathDict };
};

export default generateSystemPrompt;
