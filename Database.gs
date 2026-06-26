const DatabaseService = (() => {
  function getSpreadsheet() {
    const spreadsheetId = Utils.requireNonEmptyString(getAppConfig().SPREADSHEET_ID, "Spreadsheet ID");

    if (!Utils.isValidSpreadsheetId(spreadsheetId)) {
      throw new Error("Invalid Spreadsheet ID in Config.gs.");
    }

    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

      if (!spreadsheet || spreadsheet.getId() !== spreadsheetId) {
        throw new Error("Spreadsheet opened but returned an unexpected ID.");
      }

      return spreadsheet;
    } catch (error) {
      Utils.logError("DatabaseService.getSpreadsheet", error, {
        spreadsheetId: spreadsheetId
      });
      throw new Error("Failed to connect to spreadsheet: " + error.message);
    }
  }

  function getSheetDefinitionByName(sheetName) {
    const definitions = getRequiredSheetConfigs();

    for (let index = 0; index < definitions.length; index += 1) {
      if (definitions[index].name === sheetName) {
        return definitions[index];
      }
    }

    throw new Error("Sheet definition not found for: " + sheetName);
  }

  function getSheet(sheetKey) {
    const spreadsheet = getSpreadsheet();
    const sheetName = getSheetConfig(sheetKey).name;
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error("Sheet not found: " + sheetName + ". Run initializeDatabase() first.");
    }

    return sheet;
  }

  function getHeaders(sheet, expectedHeaderLength) {
    if (sheet.getLastRow() === 0) {
      return [];
    }

    const width = Math.max(sheet.getLastColumn(), expectedHeaderLength);

    return sheet.getRange(1, 1, 1, width).getValues()[0].slice(0, expectedHeaderLength);
  }

  function writeHeaders(sheet, headers) {
    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  function applySheetFormatting(sheet, headers) {
    const headerRange = sheet.getRange(1, 1, 1, headers.length);

    headerRange
      .setFontWeight("bold")
      .setBackground("#0d6efd")
      .setFontColor("#ffffff")
      .setHorizontalAlignment("center");

    sheet.setFrozenRows(1);

    for (let column = 1; column <= headers.length; column += 1) {
      sheet.autoResizeColumn(column);
      sheet.setColumnWidth(column, Math.max(sheet.getColumnWidth(column), 140));
    }
  }

  function ensureSheet(definition) {
    Utils.requireObject(definition, "Sheet definition");
    Utils.requireArray(definition.headers, definition.name + " headers");

    const spreadsheet = getSpreadsheet();
    let sheet = spreadsheet.getSheetByName(definition.name);
    let action = "verified";

    if (!sheet) {
      sheet = spreadsheet.insertSheet(definition.name);
      action = "created";
    }

    const currentHeaders = getHeaders(sheet, definition.headers.length);
    const hasHeaderRow = currentHeaders.some((header) => Utils.normalizeHeader(header) !== "");

    if (!hasHeaderRow) {
      writeHeaders(sheet, definition.headers);
      action = action === "created" ? "created" : "updated";
    } else if (!Utils.areHeadersEqual(currentHeaders, definition.headers)) {
      if (sheet.getLastRow() > 1) {
        throw new Error(
          "Header mismatch detected in sheet " +
            definition.name +
            ". Existing data was preserved and automatic migration was stopped."
        );
      }

      writeHeaders(sheet, definition.headers);
      action = "updated";
    }

    applySheetFormatting(sheet, definition.headers);

    return {
      name: definition.name,
      action: action,
      headers: definition.headers.length
    };
  }

  function createMissingSheets() {
    const results = getRequiredSheetConfigs().map(ensureSheet);
    const summary = {
      created: [],
      updated: [],
      verified: []
    };

    results.forEach((result) => {
      summary[result.action].push(result.name);
    });

    return summary;
  }

  function validateSpreadsheetConnection() {
    try {
      const spreadsheet = getSpreadsheet();

      return Utils.createSuccessResponse("Spreadsheet connection validated successfully.", {
        spreadsheetId: spreadsheet.getId(),
        spreadsheetName: spreadsheet.getName(),
        spreadsheetUrl: spreadsheet.getUrl(),
        timeZone: spreadsheet.getSpreadsheetTimeZone(),
        totalSheets: spreadsheet.getSheets().length
      });
    } catch (error) {
      return Utils.createErrorResponse("Spreadsheet connection failed.", [error.message], {
        spreadsheetId: getAppConfig().SPREADSHEET_ID
      });
    }
  }

  function validateRequiredSheets() {
    const spreadsheet = getSpreadsheet();
    const missingSheets = getRequiredSheetConfigs()
      .map((definition) => definition.name)
      .filter((sheetName) => !spreadsheet.getSheetByName(sheetName));

    return Utils.createSuccessResponse("Required sheet validation completed.", {
      isComplete: missingSheets.length === 0,
      missingSheets: missingSheets
    });
  }

  function initializeDatabase() {
    const connection = validateSpreadsheetConnection();

    if (!connection.success) {
      return connection;
    }

    try {
      const summary = createMissingSheets();
      Utils.appendLog("Database initialized", Utils.getCurrentUser(), "");

      return Utils.createSuccessResponse("Database initialization completed successfully.", {
        spreadsheet: connection.data,
        sheets: summary
      });
    } catch (error) {
      Utils.logError("DatabaseService.initializeDatabase", error, {});

      return Utils.createErrorResponse("Database initialization failed.", [error.message], {
        spreadsheetId: getAppConfig().SPREADSHEET_ID
      });
    }
  }

  return Object.freeze({
    createMissingSheets: createMissingSheets,
    getSheet: getSheet,
    getSheetDefinitionByName: getSheetDefinitionByName,
    getSpreadsheet: getSpreadsheet,
    initializeDatabase: initializeDatabase,
    validateRequiredSheets: validateRequiredSheets,
    validateSpreadsheetConnection: validateSpreadsheetConnection
  });
})();

function initializeDatabase() {
  const result = DatabaseService.initializeDatabase();
  Logger.log(JSON.stringify(result));
  return result;
}

function validateSpreadsheetConnection() {
  const result = DatabaseService.validateSpreadsheetConnection();
  Logger.log(JSON.stringify(result));
  return result;
}

function testConnection() {
  return validateSpreadsheetConnection();
}
