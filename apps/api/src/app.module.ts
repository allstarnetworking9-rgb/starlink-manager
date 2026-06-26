import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { resolve } from "node:path";
import { appConfig, databaseConfig, validateEnvironment } from "./config";
import { PrismaModule } from "./database/prisma.module";
import { MikrotikIntegrationModule } from "./integrations/mikrotik/mikrotik-integration.module";
import { PdfModule } from "./integrations/pdf/pdf.module";
import { StorageModule } from "./integrations/storage/storage.module";
import { WhatsappIntegrationModule } from "./integrations/whatsapp/whatsapp-integration.module";
import { JobsModule } from "./jobs/jobs.module";
import { ActivityLogsModule } from "./modules/activity-logs/activity-logs.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { HealthModule } from "./modules/health/health.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { PackagesModule } from "./modules/packages/packages.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { RemindersModule } from "./modules/reminders/reminders.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [
        resolve(process.cwd(), ".env"),
        resolve(process.cwd(), "../../.env")
      ],
      load: [appConfig, databaseConfig],
      validate: validateEnvironment
    }),
    PrismaModule,
    JobsModule,
    WhatsappIntegrationModule,
    MikrotikIntegrationModule,
    StorageModule,
    PdfModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CustomersModule,
    PackagesModule,
    SubscriptionsModule,
    PaymentsModule,
    InvoicesModule,
    RemindersModule,
    ReportsModule,
    SettingsModule,
    ActivityLogsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
