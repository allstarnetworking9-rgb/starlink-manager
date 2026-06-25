/**
 * Konfigurasi Starlink Manager
 */

const CONFIG = {
  SPREADSHEET_ID: "1qUx9cFlw2C_QzgUJLzCLssDlZm6V_ixZof-tNIn_gEc"
};

function getDB() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}