import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import { AUTH_OPENAPI_TITLE, AUTH_OPENAPI_VERSION } from '../constants/auths/auth.constants.js';

export const openApiDocumentOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: { title: AUTH_OPENAPI_TITLE, version: AUTH_OPENAPI_VERSION },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  }
};
