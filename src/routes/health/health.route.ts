import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import { HEALTH_ENDPOINT_PATH } from '../../constants/api.constants.js';

export const healthRoute: FastifyPluginAsync = async (app) => {
  const typedApp = app.withTypeProvider<TypeBoxTypeProvider>();

  typedApp.get(
    HEALTH_ENDPOINT_PATH,
    {
      schema: {
        response: {
          200: Type.Object({ status: Type.Literal('ok') })
        }
      }
    },
    async () => ({ status: 'ok' as const })
  );
};
