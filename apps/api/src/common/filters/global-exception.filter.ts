import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ThrottlerException } from '@nestjs/throttler';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
  correlationId: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId = this.generateCorrelationId();

    // Add correlation ID to response headers for tracing
    response.setHeader('X-Correlation-ID', correlationId);

    const errorResponse = this.buildErrorResponse(
      exception,
      request,
      correlationId,
    );

    // Log the error with context
    this.logError(exception, request, correlationId, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
    correlationId: string,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      return this.handleHttpException(
        exception,
        timestamp,
        path,
        method,
        correlationId,
      );
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      return this.handlePrismaException(
        exception,
        timestamp,
        path,
        method,
        correlationId,
      );
    }

    if (exception instanceof ThrottlerException) {
      return this.handleThrottlerException(
        exception,
        timestamp,
        path,
        method,
        correlationId,
      );
    }

    // Default to internal server error
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      method,
      message: 'Internal server error',
      error: 'Internal Server Error',
      correlationId,
    };
  }

  private handleHttpException(
    exception: HttpException,
    timestamp: string,
    path: string,
    method: string,
    correlationId: string,
  ): ErrorResponse {
    const status = exception.getStatus();
    const response = exception.getResponse();

    let message: string | string[];
    let error: string;
    let details: any;

    if (typeof response === 'object' && response !== null) {
      const responseObj = response as any;
      message = responseObj.message || exception.message;
      error = responseObj.error || exception.name;
      details = responseObj.details;
    } else {
      message = response as string;
      error = exception.name;
    }

    return {
      statusCode: status,
      timestamp,
      path,
      method,
      message,
      error,
      correlationId,
      ...(details && { details }),
    };
  }

  private handlePrismaException(
    exception: PrismaClientKnownRequestError,
    timestamp: string,
    path: string,
    method: string,
    correlationId: string,
  ): ErrorResponse {
    let statusCode: number;
    let message: string;
    let details: any;

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        statusCode = HttpStatus.CONFLICT;
        message = 'A record with this information already exists';
        details = {
          fields: exception.meta?.target,
          constraint: 'unique_violation',
        };
        break;
      case 'P2025':
        // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2003':
        // Foreign key constraint violation
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference to related record';
        details = {
          field: exception.meta?.field_name,
          constraint: 'foreign_key_violation',
        };
        break;
      case 'P2014':
        // Invalid ID
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid ID provided';
        break;
      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database operation failed';
        details = { code: exception.code };
    }

    return {
      statusCode,
      timestamp,
      path,
      method,
      message,
      error: 'Database Error',
      correlationId,
      ...(details && { details }),
    };
  }

  private handleThrottlerException(
    exception: ThrottlerException,
    timestamp: string,
    path: string,
    method: string,
    correlationId: string,
  ): ErrorResponse {
    return {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      timestamp,
      path,
      method,
      message: 'Too many requests. Please try again later.',
      error: 'Rate Limit Exceeded',
      correlationId,
    };
  }

  private logError(
    exception: unknown,
    request: Request,
    correlationId: string,
    errorResponse: ErrorResponse,
  ) {
    const user = (request as any).user;
    const tenant = (request as any).tenant;

    const logContext = {
      correlationId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: user?.id,
      tenantId: tenant?.id,
      statusCode: errorResponse.statusCode,
    };

    if (errorResponse.statusCode >= 500) {
      // Log server errors with full stack trace
      this.logger.error(
        `Server Error: ${errorResponse.message}`,
        {
          ...logContext,
          stack: exception instanceof Error ? exception.stack : undefined,
          exception: exception instanceof Error ? exception.message : exception,
        },
      );
    } else if (errorResponse.statusCode >= 400) {
      // Log client errors with context
      this.logger.warn(
        `Client Error: ${errorResponse.message}`,
        logContext,
      );
    }
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
