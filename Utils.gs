const Utils = (() => {
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function requireObject(value, fieldName) {
    assert(isObject(value), fieldName + " must be a valid object.");
    return value;
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function requireNonEmptyString(value, fieldName) {
    assert(isNonEmptyString(value), fieldName + " must be a non-empty string.");
    return value.trim();
  }

  function requireArray(value, fieldName) {
    assert(Array.isArray(value), fieldName + " must be an array.");
    return value;
  }

  function toNumber(value, fieldName) {
    const parsedValue = Number(value);
    assert(!Number.isNaN(parsedValue), fieldName + " must be a valid number.");
    return parsedValue;
  }

  function isValidSpreadsheetId(spreadsheetId) {
    return /^[a-zA-Z0-9-_]{20,}$/.test(String(spreadsheetId || "").trim());
  }

  function generateUuid() {
    return Utilities.getUuid();
  }

  function formatCurrency(value, currencyCode, locale) {
    const normalizedValue = toNumber(value, "Currency value");
    const normalizedCurrency = currencyCode || getAppConfig().CURRENCY_CODE;
    const normalizedLocale = locale || "id-ID";

    return new Intl.NumberFormat(normalizedLocale, {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(normalizedValue);
  }

  function normalizeDate(value, fieldName) {
    const parsedDate = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    assert(!Number.isNaN(parsedDate.getTime()), fieldName + " must be a valid date.");
    return parsedDate;
  }

  function formatDate(value, pattern, timeZone) {
    const normalizedDate = normalizeDate(value, "Date");
    const datePattern = pattern || getAppConfig().DATETIME_FORMAT;
    const normalizedTimeZone = timeZone || Session.getScriptTimeZone();

    return Utilities.formatDate(normalizedDate, normalizedTimeZone, datePattern);
  }

  function createResponse(success, message, data, errors) {
    return {
      success: Boolean(success),
      message: message || "",
      data: data || {},
      errors: Array.isArray(errors) ? errors : []
    };
  }

  function createSuccessResponse(message, data) {
    return createResponse(true, message, data || {}, []);
  }

  function createErrorResponse(message, errors, data) {
    const normalizedErrors = Array.isArray(errors) ? errors : [String(errors || "Unknown error")];
    return createResponse(false, message, data || {}, normalizedErrors);
  }

  function normalizeHeader(value) {
    return String(value === null || value === undefined ? "" : value).trim();
  }

  function areHeadersEqual(actualHeaders, expectedHeaders) {
    const normalizedActual = requireArray(actualHeaders, "Actual headers").map(normalizeHeader);
    const normalizedExpected = requireArray(expectedHeaders, "Expected headers").map(normalizeHeader);

    if (normalizedActual.length !== normalizedExpected.length) {
      return false;
    }

    for (let index = 0; index < normalizedExpected.length; index += 1) {
      if (normalizedActual[index] !== normalizedExpected[index]) {
        return false;
      }
    }

    return true;
  }

  function getCurrentUser() {
    try {
      return Session.getActiveUser().getEmail() || "SYSTEM";
    } catch (error) {
      return "SYSTEM";
    }
  }

  function logError(scope, error, metadata) {
    const payload = {
      scope: scope,
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : "",
      metadata: metadata || {}
    };

    Logger.log(JSON.stringify(payload));
  }

  function appendLog(activity, user, ipAddress) {
    try {
      const spreadsheet = DatabaseService.getSpreadsheet();
      const logSheet = spreadsheet.getSheetByName(getSheetConfig("LOGS").name);

      if (!logSheet || logSheet.getLastRow() === 0) {
        return false;
      }

      logSheet.appendRow([
        new Date(),
        requireNonEmptyString(activity, "Activity"),
        user || getCurrentUser(),
        ipAddress || ""
      ]);

      return true;
    } catch (error) {
      logError("Utils.appendLog", error, { activity: activity });
      return false;
    }
  }

  return Object.freeze({
    appendLog: appendLog,
    areHeadersEqual: areHeadersEqual,
    assert: assert,
    createErrorResponse: createErrorResponse,
    createResponse: createResponse,
    createSuccessResponse: createSuccessResponse,
    formatCurrency: formatCurrency,
    formatDate: formatDate,
    generateUuid: generateUuid,
    getCurrentUser: getCurrentUser,
    isNonEmptyString: isNonEmptyString,
    isObject: isObject,
    isValidSpreadsheetId: isValidSpreadsheetId,
    logError: logError,
    normalizeDate: normalizeDate,
    normalizeHeader: normalizeHeader,
    requireArray: requireArray,
    requireNonEmptyString: requireNonEmptyString,
    requireObject: requireObject,
    toNumber: toNumber
  });
})();
