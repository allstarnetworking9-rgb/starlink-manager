function testCreateCustomer() {
  return createCustomer({
    name: "Iqbal",
    phone: "08123456789",
    address: "Merauke",
    username: "iqbal01",
    password: "123456",
    packageName: "Basic",
    packagePrice: 150000,
    packageDuration: "30 days",
    installDate: "2026-06-26",
    paymentDate: "2026-06-26",
    status: "Active"
  });
}

function testListCustomers() {
  return getCustomers({
    page: 1,
    pageSize: 10,
    search: ""
  });
}
