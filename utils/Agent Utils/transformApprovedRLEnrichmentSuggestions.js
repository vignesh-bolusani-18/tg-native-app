/**
 * ⭐ TRANSFORM APPROVED RL ENRICHMENT SUGGESTIONS - Process approved suggestions
 * Source: D:\TrueGradient\tg-application\src\utils\Agent Utils\transformApprovedRLEnrichmentSuggestions.js
 */

export const transformApprovedRLEnrichmentSuggestions = async (
  rlAgentEnrichmentSuggestions
) => {
  console.time("Total Transform Time");

  // Log the input data structure for debugging
  console.log("Input data structure:", rlAgentEnrichmentSuggestions);

  // Check if input is valid and has all required properties
  const requiredProperties = [
    "Dimension",
    "Value",
    "Start Date",
    "End Date",
    "Current Accuracy",
    "Reviewed By",
    "Reviewed",
    "Approved Enrichment Rank",
    "Approved Enrichment Type",
    "Approved Enrichment Reward",
    "Approved Enrichment Deviation",
    "Risk",
    "Comment",
  ];

  if (!rlAgentEnrichmentSuggestions) {
    console.log("Input data is null or undefined");
    return [];
  }

  // Check if all required properties exist and are arrays
  const missingProperties = requiredProperties.filter(
    (prop) => !rlAgentEnrichmentSuggestions[prop]
  );

  if (missingProperties.length > 0) {
    console.log("Missing required properties:", missingProperties);
    return [];
  }

  // Get the number of rows from Dimension array
  const rowCount = rlAgentEnrichmentSuggestions.Dimension.length;
  console.log(`\nProcessing ${rowCount} rows`);

  // Process each row in parallel
  const transformPromises = Array.from({ length: rowCount }).map(
    async (_, rowIndex) => {
      try {
        return new Promise((resolve, reject) => {
          // Extract base properties with null checks
          const baseData = {
            Dimension: rlAgentEnrichmentSuggestions.Dimension[rowIndex] || null,
            Value: rlAgentEnrichmentSuggestions.Value[rowIndex] || null,
            "Start Date":
              rlAgentEnrichmentSuggestions["Start Date"][rowIndex] || null,
            "End Date":
              rlAgentEnrichmentSuggestions["End Date"][rowIndex] || null,
            "Current Accuracy":
              rlAgentEnrichmentSuggestions["Current Accuracy"][rowIndex] ||
              null,
            "Error_Contribution":
              rlAgentEnrichmentSuggestions["Error_Contribution"][rowIndex] ||
              null,
            "Reviewed By":
              rlAgentEnrichmentSuggestions["Reviewed By"][rowIndex] || null,
            Reviewed:
              rlAgentEnrichmentSuggestions["Reviewed"][rowIndex] || false,
            "Approved Enrichment": {
              Rank:
                rlAgentEnrichmentSuggestions["Approved Enrichment Rank"][
                  rowIndex
                ] || null,
              Type:
                rlAgentEnrichmentSuggestions["Approved Enrichment Type"][
                  rowIndex
                ] || null,
              Reward:
                parseFloat(
                  rlAgentEnrichmentSuggestions["Approved Enrichment Reward"][
                    rowIndex
                  ]
                ) || 0,
              Deviation:
                parseFloat(
                  rlAgentEnrichmentSuggestions["Approved Enrichment Deviation"][
                    rowIndex
                  ]
                ) || 0,
            },
            Risk: rlAgentEnrichmentSuggestions.Risk[rowIndex] || null,
            Comment:
              rlAgentEnrichmentSuggestions.Comment[rowIndex] || "",
          };

          resolve(baseData);
        });
      } catch (error) {
        console.error(
          `Error in Approved RLAgentEnrichmentSuggestions row ${rowIndex} processing:`,
          error
        );
        throw error;
      }
    }
  );

  try {
    const results = await Promise.all(transformPromises);
    console.log(
      "Approved RLAgentEnrichmentSuggestions Transformed Data Fetched:",
      results
    );
    console.timeEnd("Total Transform Time");
    return results;
  } catch (error) {
    console.error("Error in parallel processing:", error);
    throw error;
  }
};

export default transformApprovedRLEnrichmentSuggestions;
