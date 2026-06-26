const path = require("node:path");
const crypto = require("node:crypto");
const dotenv = require("dotenv");
const { PrismaClient, UserStatus } = require("@prisma/client");

dotenv.config({
  path: path.resolve(__dirname, "../../../.env")
});

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function buildRoleSeeds() {
  return [
    {
      code: "SUPER_ADMIN",
      name: "Super Admin",
      description: "Akses penuh ke seluruh modul sistem."
    },
    {
      code: "ADMIN",
      name: "Admin",
      description: "Mengelola master data dan operasional billing."
    },
    {
      code: "CASHIER",
      name: "Cashier",
      description: "Mengelola penerimaan pembayaran dan invoice."
    },
    {
      code: "OPERATOR",
      name: "Operator",
      description: "Mengelola data pelanggan dan operasional harian."
    }
  ];
}

async function seedRoles() {
  const roles = buildRoleSeeds();

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description
      },
      create: role
    });
  }
}

async function seedSettings(adminUserId) {
  const existing = await prisma.setting.findFirst();
  const payload = {
    companyName: process.env.SEED_COMPANY_NAME || "STARLINK MANAGER PRO",
    companyAddress:
      process.env.SEED_COMPANY_ADDRESS || "Alamat perusahaan belum diatur",
    companyPhone: process.env.SEED_COMPANY_PHONE || null,
    companyWhatsapp: process.env.SEED_COMPANY_WHATSAPP || null,
    companyEmail: process.env.SEED_COMPANY_EMAIL || null,
    defaultReminderDays: 7,
    currencyCode: "IDR",
    invoicePrefix: "INV",
    paymentPrefix: "PAY",
    customerPrefix: "CUS",
    updatedById: adminUserId || null
  };

  if (existing) {
    await prisma.setting.update({
      where: { id: existing.id },
      data: payload
    });
    return;
  }

  await prisma.setting.create({
    data: {
      ...payload,
      createdById: adminUserId || null
    }
  });
}

async function seedAdminUser() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME || "superadmin";
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@starlinkmanager.local";
  const plainPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMeNow123!";
  const fullName = process.env.SEED_ADMIN_FULL_NAME || "Super Admin";
  const phone = process.env.SEED_ADMIN_PHONE || null;

  const passwordHash = hashPassword(plainPassword);

  const user = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      fullName,
      email: adminEmail,
      phone,
      status: UserStatus.ACTIVE,
      passwordHash
    },
    create: {
      fullName,
      username: adminUsername,
      email: adminEmail,
      phone,
      status: UserStatus.ACTIVE,
      passwordHash
    }
  });

  const superAdminRole = await prisma.role.findUnique({
    where: { code: "SUPER_ADMIN" }
  });

  if (!superAdminRole) {
    throw new Error("Role SUPER_ADMIN tidak ditemukan saat seed admin.");
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: superAdminRole.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      roleId: superAdminRole.id
    }
  });

  return user;
}

async function main() {
  await seedRoles();
  const adminUser = await seedAdminUser();
  await seedSettings(adminUser.id);

  console.log("Seed awal Prisma STARLINK MANAGER PRO berhasil dijalankan.");
  console.log(`Admin username: ${adminUser.username}`);
  console.log(`Admin email: ${adminUser.email || "-"}`);
}

main()
  .catch(async (error) => {
    console.error("Seed Prisma gagal dijalankan.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
