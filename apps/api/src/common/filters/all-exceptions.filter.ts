import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === "object" && exceptionResponse !== null
        ? String((exceptionResponse as { message?: unknown }).message || "Unexpected server error.")
        : exception instanceof Error
          ? exception.message
          : "Unexpected server error.";

    response.status(status).json({
      success: false,
      message,
      data: null,
      errors: [message],
      path: request.url,
      timestamp: new Date().toISOString()
    });
  }
}
