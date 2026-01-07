import { createSheetsService } from "./sheetsService";

/**
 * Fetches the list of sheets (tabs) in a Google Spreadsheet.
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
 * @returns {Promise<string[]>} - Array of sheet titles.
 */
export const getSheetsList = async (spreadsheetId) => {
  const service = createSheetsService();
  try {
    const response = await service.spreadsheets.get({ spreadsheetId });
    const sheets = response.data.sheets;
    const sheetTitles = sheets.map((sheet) => sheet.properties.title);
    return sheetTitles;
  } catch (error) {
    console.error("Error fetching sheets list:", error);
    return [];
  }
};

/**
 * Fetches data from a specific range in a Google Sheet.
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
 * @param {string} range - The range in A1 notation (e.g., "Sheet1!A1:D10").
 * @returns {Promise<object[]>} - Array of row objects.
 */
export const getGSheetData = async (spreadsheetId, range) => {
  const service = createSheetsService();
  try {
    const response = await service.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const values = response.data.values;

    if (!values || values.length === 0) {
      return null;
    }

    const [columns, ...rows] = values;
    const dataset = rows.map((row) => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index] || "";
      });
      return obj;
    });

    return dataset;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return null;
  }
};

/**
 * Checks if the spreadsheetId is accessible.
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
 * @returns {Promise<boolean>} - Connected or not.
 */
export const checkSpreadsheetConnection = async (spreadsheetId) => {
  const service = createSheetsService();
  try {
    const response = await service.spreadsheets.get({ spreadsheetId });
    return response.status === 200;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};
