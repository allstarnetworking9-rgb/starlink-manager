import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getStatus() {
    return {
      name: this.configService.get<string>("app.name", "STARLINK MANAGER PRO"),
      environment: this.configService.get<string>("app.environment", "development"),
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }
}
