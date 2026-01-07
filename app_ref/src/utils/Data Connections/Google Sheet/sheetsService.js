import { google } from "googleapis";
import { createServiceAccountClient } from "./credential";

/**
 * Creates a Google Sheets API service instance.
 * @returns {google.sheets_v4.Sheets} - The Google Sheets API service instance.
 */
export const createSheetsService = () => {
  const auth = createServiceAccountClient();
  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
};
