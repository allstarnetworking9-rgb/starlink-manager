function onOpen(){

  SpreadsheetApp.getUi()

  .createMenu("🌐 Starlink Manager")

  .addItem("Buat Database","initializeDatabase")

  .addItem("Tes Koneksi","testConnection")

  .addToUi();

}

function doGet(e) {
  return showDashboard();
}