import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import type { Response } from 'express';
import type { ValidationIssue } from '../validation/validation-error.mapper.js';

type JsonApiError = {
  status: string;
  title: string;
  detail: string;
  source?: { pointer: string };
};

type JsonApiErrorDocument = {
  errors: JsonApiError[];
};

type StructuredResponse = {
  validationIssues?: ValidationIssue[];
  message?: unknown;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const statusCode = exception.getStatus();
    const title = this.getHttpStatusTitle(statusCode);

    const errors = this.toJsonApiErrors(exception, statusCode, title);

    response
      .status(statusCode)
      .type('application/vnd.api+json')
      .json({ errors } satisfies JsonApiErrorDocument);
  }

  private toJsonApiErrors(
    exception: HttpException,
    statusCode: number,
    title: string,
  ): JsonApiError[] {
    const raw = exception.getResponse();

    if (typeof raw === 'object' && raw !== null) {
      const maybe = raw as StructuredResponse;
      if (Array.isArray(maybe.validationIssues)) {
        return maybe.validationIssues.map((issue) => {
          const error: JsonApiError = {
            status: String(statusCode),
            title,
            detail: issue.detail,
          };
          if (issue.pointer) {
            error.source = { pointer: issue.pointer };
          }
          return error;
        });
      }
    }

    const messages = this.getExceptionMessages(raw, exception.message);
    return messages.map((detail) => ({
      status: String(statusCode),
      title,
      detail,
    }));
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
