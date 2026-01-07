import { getColumnKey } from "./getColumnKey";

export const getDefaultEnrichmentColumnKeys = (currentRLAgentEnrichmentSuggestion) => {
  if (!currentRLAgentEnrichmentSuggestion) {
    return [];
  }
  // Get the top 3 enrichment types
  const top3 = currentRLAgentEnrichmentSuggestion.Enrichments.slice(0, 3);
  const keys = [];
  for (let i = 0; i < top3.length; i++) {
    const key = getColumnKey(top3[i].Type);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}