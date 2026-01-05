/**
 * ⭐ TRANSFORM RL ENRICHMENT SUGGESTIONS - Transform AI suggestions
 * Source: D:\TrueGradient\tg-application\src\utils\Agent Utils\transformRLEnrichmentSuggestions.js
 */

export const transformRLEnrichmentSuggestions = async (
  rlAgentEnrichmentSuggestions,
  approvedRLAgentEnrichmentSuggestions,
  forecastDeviation,
  enableRLAgent
) => {
  console.time("Total Transform Time");

  if (
    !rlAgentEnrichmentSuggestions ||
    !rlAgentEnrichmentSuggestions.Dimension
  ) {
    console.log("Invalid input data, returning empty array");
    return [];
  }

  console.log(
    "Approved RLAgentEnrichmentSuggestions at transformRLEnrichmentSuggestions:",
    approvedRLAgentEnrichmentSuggestions
  );

  // Get the number of rows from any array field
  const rowCount = rlAgentEnrichmentSuggestions.Dimension.length;
  console.log(`\nProcessing ${rowCount} rows`);

  // Process each row in parallel
  const transformPromises = Array.from({ length: rowCount }).map(
    async (_, rowIndex) => {
      try {
        return new Promise((resolve, reject) => {
          // Extract base properties
          // Find the approved suggestion for this row's Dimension and Value
          let approvedSuggestion = null;
          if (
            Array.isArray(approvedRLAgentEnrichmentSuggestions) &&
            approvedRLAgentEnrichmentSuggestions.length > 0
          ) {
            approvedSuggestion = approvedRLAgentEnrichmentSuggestions.find(
              (item) =>
                item.Dimension ===
                  rlAgentEnrichmentSuggestions.Dimension[rowIndex] &&
                item.Value === rlAgentEnrichmentSuggestions.Value[rowIndex]
            );
          }
          console.log("Approved Suggestion:", approvedSuggestion);

          const baseData = {
            Dimension: rlAgentEnrichmentSuggestions.Dimension[rowIndex],
            Value: rlAgentEnrichmentSuggestions.Value[rowIndex],
            "Start Date":
              approvedSuggestion?.["Start Date"] ||
              rlAgentEnrichmentSuggestions["Start Date"][rowIndex],
            "End Date":
              approvedSuggestion?.["End Date"] ||
              rlAgentEnrichmentSuggestions["End Date"][rowIndex],
            "Current Accuracy":
              approvedSuggestion?.["Current Accuracy"] ||
              rlAgentEnrichmentSuggestions["Current Accuracy"][rowIndex],
            Error_Contribution:
              approvedSuggestion?.["Error_Contribution"] ||
              rlAgentEnrichmentSuggestions["Error_Contribution"][rowIndex],
            Reviewed: approvedSuggestion?.Reviewed || false,
            "Approved Enrichment":
              approvedSuggestion?.["Approved Enrichment"] || null,
            "Reviewed By": approvedSuggestion?.["Reviewed By"] || null,
            Risk: rlAgentEnrichmentSuggestions.Risk[rowIndex],
            Comment: approvedSuggestion?.Comment || null,
            Enrichments: [],
          };

          // Find the maximum enrichment number
          const maxEnrichment = Math.max(
            ...Object.keys(rlAgentEnrichmentSuggestions)
              .filter((key) => key.startsWith("Type_"))
              .map((key) => parseInt(key.split("_")[1]))
          );

          console.log("Max Enrichment:", maxEnrichment);

          // Process enrichments
          for (let i = 1; i <= maxEnrichment; i++) {
            const typeKey = `Type_${i}`;
            const rewardKey = `Reward_${i}`;
            const deviationKey = `Forecast_${forecastDeviation}_Deviation_Type_${i}`;

            const type = rlAgentEnrichmentSuggestions[typeKey][rowIndex];
            const reward = rlAgentEnrichmentSuggestions[rewardKey][rowIndex];
            const deviation =
              rlAgentEnrichmentSuggestions[deviationKey][rowIndex];

            if (type && reward && deviation) {
              const enrichment = {
                Rank: String(i),
                Type: type,
                Reward: parseFloat(reward),
                Deviation: parseFloat(deviation),
              };

              baseData.Enrichments.push({
                Rank: i,
                Type: type,
                Reward: parseFloat(reward),
                Deviation: parseFloat(deviation),
              });

              /**
               * AUTO-APPROVE RANK 1 ENRICHMENT AS FULL OBJECT
               */
              if (enableRLAgent && !approvedSuggestion && i === 1) {
                approvedSuggestion = {
                  Dimension: baseData.Dimension,
                  Value: baseData.Value,
                  "Start Date": baseData["Start Date"],
                  "End Date": baseData["End Date"],
                  "Current Accuracy": baseData["Current Accuracy"],
                  Error_Contribution: baseData["Error_Contribution"],
                  Reviewed: true,
                  "Reviewed By": "TG Scenario",

                  // store full object EXACTLY like your data
                  "Approved Enrichment": enrichment,
                };

                // reflect on baseData too
                baseData.Reviewed = true;
                baseData["Reviewed By"] = "TG Scenario";
                baseData["Approved Enrichment"] = enrichment;
                baseData["Comment"] = "Agent best recommendation";
              }
            }
          }

          // Sort enrichments by rank
          baseData.Enrichments.sort((a, b) => a.Rank - b.Rank);

          // Log row summary in table format
          if (rowIndex === 0 || rowIndex === rowCount - 1) {
            // Log only first and last row for large datasets
            console.log(`\nRow ${rowIndex} Summary:`);
            console.table([
              {
                Dimension: baseData.Dimension,
                Value: baseData.Value,
                "Start Date": baseData["Start Date"],
                "End Date": baseData["End Date"],
                Risk: baseData.Risk,
                "Enrichment Count": baseData.Enrichments.length,
              },
            ]);

            console.log(`Enrichments for Row ${rowIndex}:`);
            console.table(baseData.Enrichments);
          }

          resolve(baseData);
        });
      } catch (error) {
        console.error(`Error in row ${rowIndex} processing:`, error);
        throw error;
      }
    }
  );

  try {
    const results = await Promise.all(transformPromises);
    // Final summary table
    console.log("\nProcessing Summary:");
    console.table(
      results.map((row) => ({
        Dimension: row.Dimension,
        Value: row.Value,
        "Enrichment Count": row.Enrichments.length,
        Risk: row.Risk,
      }))
    );

    console.timeEnd("Total Transform Time");
    return results;
  } catch (error) {
    console.error("Error in parallel processing:", error);
    throw error;
  }
};

export default transformRLEnrichmentSuggestions;
