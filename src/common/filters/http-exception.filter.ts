import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const statusCode = exception.getStatus();
    const message = this.getExceptionMessage(
      exception.getResponse(),
      exception.message,
    );

    response.status(statusCode).json({
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getExceptionMessage(
    response: string | object,
    fallbackMessage: string,
  ): string | string[] {
    if (typeof response === 'string') {
      return response;
    }

    const { message } = response as { message?: unknown };

    if (typeof message === 'string') {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === 'string')
    ) {
      return message;
    }

    return fallbackMessage;
  }
}
