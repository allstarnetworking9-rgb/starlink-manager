const APP_CONFIG = (() => {
  const sheetDefinitions = Object.freeze({
    CUSTOMERS: Object.freeze({
      name: "CUSTOMERS",
      headers: Object.freeze([
        "ID",
        "Name",
        "Phone",
        "Address",
        "Username",
        "Password",
        "Package",
        "Package Price",
        "Install Date",
        "Payment Date",
        "Expired Date",
        "Status",
        "Created At",
        "Updated At"
      ])
    }),
    PAYMENTS: Object.freeze({
      name: "PAYMENTS",
      headers: Object.freeze([
        "Invoice Number",
        "Date",
        "Customer ID",
        "Customer Name",
        "Package",
        "Amount",
        "Payment Method",
        "Admin",
        "Notes"
      ])
    }),
    PACKAGES: Object.freeze({
      name: "PACKAGES",
      headers: Object.freeze([
        "Package Code",
        "Package Name",
        "Price",
        "Duration",
        "Speed",
        "Description"
      ])
    }),
    SETTINGS: Object.freeze({
      name: "SETTINGS",
      headers: Object.freeze([
        "Company Name",
        "Company Address",
        "Phone",
        "WhatsApp",
        "Logo",
        "Default Reminder Days",
        "Currency"
      ])
    }),
    LOGS: Object.freeze({
      name: "LOGS",
      headers: Object.freeze([
        "Date",
        "Activity",
        "User",
        "IP"
      ])
    }),
    INVOICES: Object.freeze({
      name: "INVOICES",
      headers: Object.freeze([
        "Invoice Number",
        "Date",
        "Customer ID",
        "Customer Name",
        "Package",
        "Amount",
        "Payment Status",
        "Due Date",
        "Paid Date",
        "PDF File ID",
        "Created At"
      ])
    })
  });

  const sheetOrder = Object.freeze([
    "CUSTOMERS",
    "PAYMENTS",
    "PACKAGES",
    "SETTINGS",
    "LOGS",
    "INVOICES"
  ]);

  return Object.freeze({
    APP_NAME: "STARLINK MANAGER PRO",
    SPREADSHEET_ID: "1qUx9cFlw2C_QzgUJLzCLssDlZm6V_ixZof-tNIn_gEc",
    DATE_FORMAT: "yyyy-MM-dd",
    DATETIME_FORMAT: "yyyy-MM-dd HH:mm:ss",
    CURRENCY_CODE: "IDR",
    DEFAULT_REMINDER_DAYS: 7,
    SHEETS: sheetDefinitions,
    SHEET_ORDER: sheetOrder
  });
})();

function getAppConfig() {
  return APP_CONFIG;
}

function getSheetConfig(sheetKey) {
  const sheetConfig = APP_CONFIG.SHEETS[sheetKey];

  if (!sheetConfig) {
    throw new Error("Unknown sheet configuration: " + sheetKey);
  }

  return sheetConfig;
}

function getRequiredSheetConfigs() {
  return APP_CONFIG.SHEET_ORDER.map(getSheetConfig);
}

function getDB() {
  return DatabaseService.getSpreadsheet();
}
