function runFoundationDiagnostics() {
  return {
    connection: DatabaseService.validateSpreadsheetConnection(),
    sheets: DatabaseService.validateRequiredSheets()
  };
}
