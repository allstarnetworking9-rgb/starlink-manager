const TABLES = {

  CUSTOMERS: {
    name: "CUSTOMERS",
    header: [
      "ID",
      "Nama",
      "No WA",
      "Alamat",
      "Username",
      "Password",
      "Paket",
      "Tanggal Bayar",
      "Expired",
      "Status"
    ]
  },

  PAYMENTS: {
    name: "PAYMENTS",
    header: [
      "Invoice",
      "Tanggal",
      "CustomerID",
      "Nama",
      "Paket",
      "Nominal",
      "Metode",
      "Admin"
    ]
  },

  PACKAGES: {
    name: "PACKAGES",
    header: [
      "Nama Paket",
      "Harga",
      "Masa Aktif"
    ]
  },

  SETTINGS: {
    name: "SETTINGS",
    header: [
      "Key",
      "Value"
    ]
  },

  LOGS: {
    name: "LOGS",
    header: [
      "Tanggal",
      "Aktivitas",
      "User"
    ]
  },

  INVOICES: {
    name: "INVOICES",
    header: [
      "Invoice",
      "Customer",
      "PDF"
    ]
  }

};

function initializeDatabase() {

  const ss = getDB();

  Object.values(TABLES).forEach(table => {

    let sheet = ss.getSheetByName(table.name);

    if (!sheet) {

      sheet = ss.insertSheet(table.name);

      sheet.appendRow(table.header);

      sheet.getRange(1,1,1,table.header.length)
           .setFontWeight("bold");

      sheet.setFrozenRows(1);

    }

  });

  Logger.log("Database berhasil dibuat.");

}