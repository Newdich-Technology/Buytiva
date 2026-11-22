import type { FastifyError, FastifyInstance } from 'fastify';
import { ErrorCode } from '../enums/errorCode.enum.js';
import { AppError } from './app.error.js';

export function registerErrorMapper(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message, requestId: request.id }
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        error: {
          code: ErrorCode.VALIDATION,
          message: 'Request validation failed',
          requestId: request.id
        }
      });
    }

    request.log.error({ err: error }, 'Unhandled request error');
    return reply.status(500).send({
      error: {
        code: ErrorCode.INTERNAL,
        message: 'An unexpected error occurred',
        requestId: request.id
      }
    });
  });
}
