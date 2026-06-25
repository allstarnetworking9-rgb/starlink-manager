function generateCustomerID() {

  const sheet = getDB().getSheetByName("CUSTOMERS");

  const lastRow = sheet.getLastRow();

  const number = String(lastRow).padStart(6, "0");

  return "CUS-" + number;

}

function addCustomer(data) {

  const sheet = getDB().getSheetByName("CUSTOMERS");

  const id = generateCustomerID();

  const today = new Date();

  const expired = new Date(today);
  expired.setMonth(expired.getMonth() + 1);

  sheet.appendRow([
    id,
    data.nama,
    data.wa,
    data.alamat,
    data.username,
    data.password,
    data.paket,
    data.metode,
    today,
    expired,
    "Aktif",
    new Date()
  ]);

  return {
    success: true,
    id: id
  };

}

function getCustomers() {

  const sheet = getDB().getSheetByName("CUSTOMERS");

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return [];

  return sheet.getRange(2,1,lastRow-1,12).getValues();

}