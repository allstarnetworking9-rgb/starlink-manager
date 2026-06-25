function testConnection() {

  const ss = getDB();

  Logger.log("Nama Spreadsheet : " + ss.getName());

  Logger.log("ID Spreadsheet   : " + ss.getId());

}
