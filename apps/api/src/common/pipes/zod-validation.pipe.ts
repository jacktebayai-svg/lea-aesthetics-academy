import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

export interface ZodValidationPipeOptions {
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  transform?: boolean;
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: ZodSchema,
    private readonly options: ZodValidationPipeOptions = {},
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query' && metadata.type !== 'param') {
      return value;
    }

    try {
      const validatedValue = this.schema.parse(value);
      return validatedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          error: 'Bad Request',
          details: this.formatZodError(error),
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }

  private formatZodError(error: ZodError) {
    return {
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        expected: this.getExpectedType(issue),
        received: issue.code === 'invalid_type' ? (issue as any).received : undefined,
      })),
      summary: `Validation failed for ${error.issues.length} field(s)`,
    };
  }

  private getExpectedType(issue: any): string | undefined {
    if (issue.code === 'invalid_type') {
      return issue.expected;
    }
    if (issue.code === 'too_small') {
      return `minimum ${issue.minimum}`;
    }
    if (issue.code === 'too_big') {
      return `maximum ${issue.maximum}`;
    }
    return undefined;
  }
}

// Decorator for easy use with controllers
export function UsZodValidation(schema: ZodSchema, options?: ZodValidationPipeOptions) {
  return new ZodValidationPipe(schema, options);
}
