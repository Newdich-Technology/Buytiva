import type { FastifyError, FastifyInstance } from 'fastify';
import { ErrorCode } from '../enums/errorCode.enum.js';
import { AppError } from './app.error.js';
import { AUTH_HTTP_STATUS, AUTH_ERROR_MESSAGES } from '../constants/auths/auth.constants.js';

const FASTIFY_RATE_LIMIT_ERROR_CODE = 'FST_ERR_RATE_LIMIT';

export function registerErrorMapper(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message, requestId: request.id }
      });
    }

    if ('statusCode' in error && error.statusCode === AUTH_HTTP_STATUS.tooManyRequests) {
      return reply.status(AUTH_HTTP_STATUS.tooManyRequests).send({
        error: { code: ErrorCode.RATE_LIMITED, message: AUTH_ERROR_MESSAGES.rateLimited, requestId: request.id }
      });
    }

    if ('code' in error && error.code === FASTIFY_RATE_LIMIT_ERROR_CODE) {
      return reply.status(AUTH_HTTP_STATUS.tooManyRequests).send({
        error: { code: ErrorCode.RATE_LIMITED, message: AUTH_ERROR_MESSAGES.rateLimited, requestId: request.id }
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
