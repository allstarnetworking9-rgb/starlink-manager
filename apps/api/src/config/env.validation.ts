import { plainToInstance } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min, validateSync } from "class-validator";

class EnvironmentVariables {
  @IsOptional()
  @IsIn(["development", "test", "production"])
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  APP_NAME?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  APP_PORT?: number;

  @IsString()
  DATABASE_URL!: string;
}

export function validateEnvironment(configuration: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, configuration, {
    enableImplicitConversion: true
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    throw new Error(errors.map((error) => Object.values(error.constraints || {}).join(", ")).join("; "));
  }

  return validatedConfig;
}
