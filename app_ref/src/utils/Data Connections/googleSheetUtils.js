import axios from "axios";

const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY;

/**
 * Fetches the list of sheets (tabs) in a Google Spreadsheet
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet
 * @returns {Promise<string[] | null>} - Array of sheet titles or null if failed
 */
export const getSheetsList = async (spreadsheetId) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const sheets = response.data.sheets;
    const sheetTitles = sheets.map((sheet) => sheet.properties.title);
    return sheetTitles;
  } catch (error) {
    console.error("Error fetching sheets list:", error);
    return null;
  }
};

/**
 * Fetches data from a specific range in a Google Sheet
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet
 * @param {string} range - The range in A1 notation (e.g., "Sheet1!A1:D10")
 * @returns {Promise<object[] | null>} - Array of row objects or null if failed
 */
export const getGSheetData = async (spreadsheetId, range) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${API_KEY}`;

  try {
    const response = await axios.get(url);
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
 * Checks if the spreadsheetId is accessible
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet
 * @returns {boolean} - Connected or not
 */
export const checkSpreadsheetConnection = async (spreadsheetId) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return true;
    //   return "Connected to the spreadsheet successfully.";
    }
  } catch (error) {
    console.error("Error:", error);
    return false;
    // return "Failed to connect to the spreadsheet. Make sure the Spreadsheet ID is correct and that it is shared with the service account.";
  }
};
