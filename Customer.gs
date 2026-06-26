const CustomerService = (() => {
  const CUSTOMER_STATUS = Object.freeze({
    ACTIVE: "Active",
    DISABLED: "Disabled"
  });

  const DEFAULT_PAGE_SIZE = 10;
  const MAX_PAGE_SIZE = 100;
  const CUSTOMER_COLUMNS = Object.freeze([
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
  ]);

  const INDEX = Object.freeze({
    ID: 0,
    NAME: 1,
    PHONE: 2,
    ADDRESS: 3,
    USERNAME: 4,
    PASSWORD: 5,
    PACKAGE: 6,
    PACKAGE_PRICE: 7,
    INSTALL_DATE: 8,
    PAYMENT_DATE: 9,
    EXPIRED_DATE: 10,
    STATUS: 11,
    CREATED_AT: 12,
    UPDATED_AT: 13
  });

  function getCustomerSheet() {
    return DatabaseService.getSheet("CUSTOMERS");
  }

  function getPackageSheet() {
    return DatabaseService.getSheet("PACKAGES");
  }

  function sanitizeText(value) {
    return String(value === null || value === undefined ? "" : value).trim();
  }

  function sanitizePhone(value) {
    return sanitizeText(value).replace(/\s+/g, "");
  }

  function normalizeLookup(value) {
    return sanitizeText(value).toLowerCase();
  }

  function toDateValue(value, fieldName, fallbackValue) {
    if (value === null || value === undefined || value === "") {
      return fallbackValue ? new Date(fallbackValue.getTime()) : null;
    }

    return Utils.normalizeDate(value, fieldName);
  }

  function addDays(baseDate, totalDays) {
    const date = new Date(baseDate.getTime());
    date.setDate(date.getDate() + totalDays);
    return date;
  }

  function addMonths(baseDate, totalMonths) {
    const date = new Date(baseDate.getTime());
    date.setMonth(date.getMonth() + totalMonths);
    return date;
  }

  function parsePackageDuration(rawDuration) {
    const durationText = sanitizeText(rawDuration);

    if (!durationText) {
      return { unit: "days", value: 30 };
    }

    if (/^\d+$/.test(durationText)) {
      return { unit: "days", value: Number(durationText) };
    }

    const match = durationText.match(/(\d+)\s*(day|days|hari|month|months|bulan)/i);

    if (!match) {
      return { unit: "days", value: 30 };
    }

    const total = Number(match[1]);
    const unitToken = match[2].toLowerCase();

    if (unitToken === "month" || unitToken === "months" || unitToken === "bulan") {
      return { unit: "months", value: total };
    }

    return { unit: "days", value: total };
  }

  function calculateExpiredDate(baseDate, packageDuration, explicitExpiredDate) {
    if (explicitExpiredDate) {
      return new Date(explicitExpiredDate.getTime());
    }

    const duration = parsePackageDuration(packageDuration);

    if (duration.unit === "months") {
      return addMonths(baseDate, duration.value);
    }

    return addDays(baseDate, duration.value);
  }

  function serializeValue(value, isDateField) {
    if (value instanceof Date) {
      return Utils.formatDate(
        value,
        isDateField ? getAppConfig().DATE_FORMAT : getAppConfig().DATETIME_FORMAT
      );
    }

    return value === null || value === undefined ? "" : value;
  }

  function rowToCustomer(row, rowNumber) {
    return {
      id: serializeValue(row[INDEX.ID], false),
      name: serializeValue(row[INDEX.NAME], false),
      phone: serializeValue(row[INDEX.PHONE], false),
      address: serializeValue(row[INDEX.ADDRESS], false),
      username: serializeValue(row[INDEX.USERNAME], false),
      password: serializeValue(row[INDEX.PASSWORD], false),
      packageName: serializeValue(row[INDEX.PACKAGE], false),
      packagePrice: Number(row[INDEX.PACKAGE_PRICE] || 0),
      installDate: serializeValue(row[INDEX.INSTALL_DATE], true),
      paymentDate: serializeValue(row[INDEX.PAYMENT_DATE], true),
      expiredDate: serializeValue(row[INDEX.EXPIRED_DATE], true),
      status: serializeValue(row[INDEX.STATUS], false) || CUSTOMER_STATUS.ACTIVE,
      createdAt: serializeValue(row[INDEX.CREATED_AT], false),
      updatedAt: serializeValue(row[INDEX.UPDATED_AT], false),
      createdAtRaw: row[INDEX.CREATED_AT],
      updatedAtRaw: row[INDEX.UPDATED_AT],
      rowNumber: rowNumber
    };
  }

  const CustomerRepository = {
    getAll: function () {
      const sheet = getCustomerSheet();
      const lastRow = sheet.getLastRow();

      if (lastRow <= 1) {
        return [];
      }

      const values = sheet.getRange(2, 1, lastRow - 1, CUSTOMER_COLUMNS.length).getValues();

      return values.map(function (row, index) {
        return rowToCustomer(row, index + 2);
      });
    },

    findById: function (customerId) {
      const targetId = sanitizeText(customerId);

      return this.getAll().find(function (customer) {
        return customer.id === targetId;
      }) || null;
    },

    append: function (customerRecord) {
      const sheet = getCustomerSheet();
      sheet.appendRow([
        customerRecord.id,
        customerRecord.name,
        customerRecord.phone,
        customerRecord.address,
        customerRecord.username,
        customerRecord.password,
        customerRecord.packageName,
        customerRecord.packagePrice,
        customerRecord.installDate,
        customerRecord.paymentDate,
        customerRecord.expiredDate,
        customerRecord.status,
        customerRecord.createdAt,
        customerRecord.updatedAt
      ]);
    },

    update: function (rowNumber, customerRecord) {
      const sheet = getCustomerSheet();
      sheet.getRange(rowNumber, 1, 1, CUSTOMER_COLUMNS.length).setValues([[
        customerRecord.id,
        customerRecord.name,
        customerRecord.phone,
        customerRecord.address,
        customerRecord.username,
        customerRecord.password,
        customerRecord.packageName,
        customerRecord.packagePrice,
        customerRecord.installDate,
        customerRecord.paymentDate,
        customerRecord.expiredDate,
        customerRecord.status,
        customerRecord.createdAt,
        customerRecord.updatedAt
      ]]);
    },

    delete: function (rowNumber) {
      getCustomerSheet().deleteRow(rowNumber);
    }
  };

  function getPackageOptions() {
    const sheet = getPackageSheet();
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return [];
    }

    const values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();

    return values
      .filter(function (row) {
        return sanitizeText(row[1]) !== "";
      })
      .map(function (row) {
        return {
          packageCode: sanitizeText(row[0]),
          packageName: sanitizeText(row[1]),
          price: Number(row[2] || 0),
          duration: sanitizeText(row[3]),
          speed: sanitizeText(row[4]),
          description: sanitizeText(row[5])
        };
      });
  }

  function ensureUnique(fieldName, fieldValue, excludeCustomerId) {
    const normalizedFieldValue = normalizeLookup(fieldValue);
    const rows = CustomerRepository.getAll();

    const duplicate = rows.find(function (customer) {
      const matchesId = excludeCustomerId && customer.id === excludeCustomerId;

      if (matchesId) {
        return false;
      }

      return normalizeLookup(customer[fieldName]) === normalizedFieldValue;
    });

    if (duplicate) {
      throw new Error(fieldName === "phone" ? "Phone number already exists." : "Username already exists.");
    }
  }

  function buildCustomerRecord(payload, mode, existingCustomer) {
    const source = Utils.requireObject(payload || {}, "Customer payload");
    const currentTime = new Date();
    const name = Utils.requireNonEmptyString(source.name || source.nama, "Name");
    const phone = sanitizePhone(source.phone || source.wa);
    const address = Utils.requireNonEmptyString(source.address || source.alamat, "Address");
    const username = Utils.requireNonEmptyString(source.username, "Username");
    const rawPassword = sanitizeText(source.password);
    const packageName = Utils.requireNonEmptyString(source.packageName || source.package || source.paket, "Package");
    const packagePrice = Utils.toNumber(source.packagePrice, "Package Price");
    const packageDuration = sanitizeText(source.packageDuration || source.duration);
    const status = sanitizeText(source.status || CUSTOMER_STATUS.ACTIVE) || CUSTOMER_STATUS.ACTIVE;

    Utils.assert(/^[0-9+]{8,16}$/.test(phone), "Phone must be 8-16 digits and may include leading +.");
    Utils.assert(/^[A-Za-z0-9._-]{4,32}$/.test(username), "Username must be 4-32 characters and use letters, numbers, dot, underscore, or dash.");
    Utils.assert(packagePrice >= 0, "Package Price must be zero or greater.");
    Utils.assert(
      Object.keys(CUSTOMER_STATUS).some(function (key) {
        return CUSTOMER_STATUS[key] === status;
      }),
      "Status must be Active or Disabled."
    );

    let password = rawPassword;

    if (mode === "create") {
      password = Utils.requireNonEmptyString(rawPassword, "Password");
    } else {
      password = rawPassword || existingCustomer.password;
      Utils.assert(sanitizeText(password) !== "", "Password is required.");
    }

    const installDate = toDateValue(source.installDate, "Install Date", currentTime) || currentTime;
    const paymentDate = toDateValue(source.paymentDate, "Payment Date", installDate) || installDate;
    const explicitExpiredDate = toDateValue(source.expiredDate, "Expired Date", null);
    const expiredDate = calculateExpiredDate(paymentDate, packageDuration, explicitExpiredDate);

    Utils.assert(expiredDate.getTime() >= paymentDate.getTime(), "Expired Date must be the same as or after Payment Date.");

    ensureUnique("phone", phone, existingCustomer ? existingCustomer.id : "");
    ensureUnique("username", username, existingCustomer ? existingCustomer.id : "");

    return {
      id: existingCustomer ? existingCustomer.id : generateCustomerID(),
      name: name,
      phone: phone,
      address: address,
      username: username,
      password: password,
      packageName: packageName,
      packagePrice: packagePrice,
      installDate: installDate,
      paymentDate: paymentDate,
      expiredDate: expiredDate,
      status: status,
      createdAt: existingCustomer ? Utils.normalizeDate(existingCustomer.createdAtRaw, "Created At") : currentTime,
      updatedAt: currentTime
    };
  }

  function getSummary(customers) {
    const source = Array.isArray(customers) ? customers : CustomerRepository.getAll();
    const today = Utils.formatDate(new Date(), getAppConfig().DATE_FORMAT);
    let active = 0;
    let disabled = 0;
    let expired = 0;
    let installedToday = 0;

    source.forEach(function (customer) {
      if (customer.status === CUSTOMER_STATUS.ACTIVE) {
        active += 1;
      }

      if (customer.status === CUSTOMER_STATUS.DISABLED) {
        disabled += 1;
      }

      if (customer.expiredDate && customer.expiredDate < today) {
        expired += 1;
      }

      if (customer.installDate === today) {
        installedToday += 1;
      }
    });

    return {
      total: source.length,
      active: active,
      disabled: disabled,
      expired: expired,
      installedToday: installedToday
    };
  }

  function getCustomers(request) {
    try {
      const params = request || {};
      const page = Math.max(1, parseInt(params.page, 10) || 1);
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(5, parseInt(params.pageSize, 10) || DEFAULT_PAGE_SIZE));
      const search = normalizeLookup(params.search);
      const allCustomers = CustomerRepository.getAll().sort(function (first, second) {
        return second.rowNumber - first.rowNumber;
      });

      const filteredCustomers = search
        ? allCustomers.filter(function (customer) {
            return [
              customer.id,
              customer.name,
              customer.phone,
              customer.address,
              customer.username,
              customer.packageName,
              customer.status
            ].some(function (field) {
              return normalizeLookup(field).indexOf(search) !== -1;
            });
          })
        : allCustomers;

      const totalItems = filteredCustomers.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const currentPage = Math.min(page, totalPages);
      const startIndex = (currentPage - 1) * pageSize;
      const items = filteredCustomers.slice(startIndex, startIndex + pageSize);

      return Utils.createSuccessResponse("Customers loaded successfully.", {
        items: items,
        pagination: {
          page: currentPage,
          pageSize: pageSize,
          totalItems: totalItems,
          totalPages: totalPages,
          hasPrevious: currentPage > 1,
          hasNext: currentPage < totalPages
        },
        summary: getSummary(allCustomers)
      });
    } catch (error) {
      Utils.logError("CustomerService.getCustomers", error, request || {});
      return Utils.createErrorResponse("Failed to load customers.", [error.message], {});
    }
  }

  function getCustomerById(customerId) {
    try {
      const customer = CustomerRepository.findById(customerId);
      Utils.assert(customer, "Customer not found.");

      return Utils.createSuccessResponse("Customer loaded successfully.", {
        customer: customer
      });
    } catch (error) {
      Utils.logError("CustomerService.getCustomerById", error, { customerId: customerId });
      return Utils.createErrorResponse("Failed to load customer.", [error.message], {});
    }
  }

  function createCustomer(payload) {
    try {
      const customerRecord = buildCustomerRecord(payload, "create", null);
      CustomerRepository.append(customerRecord);
      Utils.appendLog("Customer created: " + customerRecord.id, Utils.getCurrentUser(), "");

      return Utils.createSuccessResponse("Customer created successfully.", {
        customer: rowToCustomer([
          customerRecord.id,
          customerRecord.name,
          customerRecord.phone,
          customerRecord.address,
          customerRecord.username,
          customerRecord.password,
          customerRecord.packageName,
          customerRecord.packagePrice,
          customerRecord.installDate,
          customerRecord.paymentDate,
          customerRecord.expiredDate,
          customerRecord.status,
          customerRecord.createdAt,
          customerRecord.updatedAt
        ], 0)
      });
    } catch (error) {
      Utils.logError("CustomerService.createCustomer", error, payload || {});
      return Utils.createErrorResponse("Failed to create customer.", [error.message], {});
    }
  }

  function updateCustomer(payload) {
    try {
      const source = Utils.requireObject(payload || {}, "Customer payload");
      const customerId = Utils.requireNonEmptyString(source.id, "Customer ID");
      const existingCustomer = CustomerRepository.findById(customerId);
      Utils.assert(existingCustomer, "Customer not found.");

      const customerRecord = buildCustomerRecord(source, "update", existingCustomer);
      CustomerRepository.update(existingCustomer.rowNumber, customerRecord);
      Utils.appendLog("Customer updated: " + customerRecord.id, Utils.getCurrentUser(), "");

      return Utils.createSuccessResponse("Customer updated successfully.", {
        customer: CustomerRepository.findById(customerId)
      });
    } catch (error) {
      Utils.logError("CustomerService.updateCustomer", error, payload || {});
      return Utils.createErrorResponse("Failed to update customer.", [error.message], {});
    }
  }

  function deleteCustomer(customerId) {
    try {
      const targetId = Utils.requireNonEmptyString(customerId, "Customer ID");
      const existingCustomer = CustomerRepository.findById(targetId);
      Utils.assert(existingCustomer, "Customer not found.");

      CustomerRepository.delete(existingCustomer.rowNumber);
      Utils.appendLog("Customer deleted: " + targetId, Utils.getCurrentUser(), "");

      return Utils.createSuccessResponse("Customer deleted successfully.", {
        customerId: targetId
      });
    } catch (error) {
      Utils.logError("CustomerService.deleteCustomer", error, { customerId: customerId });
      return Utils.createErrorResponse("Failed to delete customer.", [error.message], {});
    }
  }

  function getFormOptions() {
    try {
      return Utils.createSuccessResponse("Customer form options loaded successfully.", {
        statuses: [CUSTOMER_STATUS.ACTIVE, CUSTOMER_STATUS.DISABLED],
        packages: getPackageOptions()
      });
    } catch (error) {
      Utils.logError("CustomerService.getFormOptions", error, {});
      return Utils.createErrorResponse("Failed to load customer form options.", [error.message], {});
    }
  }

  function getBootstrapData() {
    const customers = getCustomers({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      search: ""
    });
    const options = getFormOptions();

    if (!customers.success) {
      return customers;
    }

    if (!options.success) {
      return options;
    }

    return Utils.createSuccessResponse("Customer module loaded successfully.", {
      customers: customers.data,
      options: options.data
    });
  }

  return Object.freeze({
    createCustomer: createCustomer,
    deleteCustomer: deleteCustomer,
    getBootstrapData: getBootstrapData,
    getCustomerById: getCustomerById,
    getCustomers: getCustomers,
    getFormOptions: getFormOptions,
    updateCustomer: updateCustomer
  });
})();

function generateCustomerID() {
  return "CUS-" + Utils.generateUuid().replace(/-/g, "").substring(0, 10).toUpperCase();
}

function addCustomer(data) {
  return CustomerService.createCustomer(data);
}

function createCustomer(data) {
  return CustomerService.createCustomer(data);
}

function getCustomers(params) {
  return CustomerService.getCustomers(params);
}

function getCustomerById(customerId) {
  return CustomerService.getCustomerById(customerId);
}

function updateCustomer(data) {
  return CustomerService.updateCustomer(data);
}

function deleteCustomer(customerId) {
  return CustomerService.deleteCustomer(customerId);
}

function getCustomerFormOptions() {
  return CustomerService.getFormOptions();
}

function getCustomerModuleBootstrap() {
  return CustomerService.getBootstrapData();
}
