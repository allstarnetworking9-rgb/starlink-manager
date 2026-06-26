import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DEFAULT_API_PREFIX } from "./common/constants/api.constants";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";
import { PrismaService } from "./database/prisma.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);
  const apiPrefix = configService.get<string>("app.apiPrefix", DEFAULT_API_PREFIX);
  const port = configService.get<number>("app.port", 4000);

  app.setGlobalPrefix(apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  await prismaService.enableShutdownHooks(app);
  await app.listen(port);
}

bootstrap();
