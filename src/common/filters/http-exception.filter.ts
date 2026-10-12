import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import type { Request, Response } from 'express';

type JsonApiError = {
  status: string;
  title: string;
  detail: string;
};

type JsonApiErrorDocument = {
  errors: JsonApiError[];
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const statusCode = exception.getStatus();

    const messages = this.getExceptionMessages(
      exception.getResponse(),
      exception.message,
    );

    const title = this.getHttpStatusTitle(statusCode);

    const body: JsonApiErrorDocument = {
      errors: messages.map((detail) => ({
        status: String(statusCode),
        title,
        detail,
      })),
    };

    response.status(statusCode).type('application/vnd.api+json').json(body);
  }

  private getExceptionMessages(
    response: string | object,
    fallbackMessage: string,
  ): string[] {
    if (typeof response === 'string') {
      return [response];
    }

    const { message } = response as { message?: unknown };

    if (typeof message === 'string') {
      return [message];
    }

    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === 'string')
    ) {
      return message;
    }

    return [fallbackMessage];
  }

  private getHttpStatusTitle(statusCode: number): string {
    return STATUS_CODES[statusCode] ?? 'Error';
  }
}
