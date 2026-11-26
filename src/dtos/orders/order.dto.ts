import { Type } from 'typebox';
const uuid = Type.String({ format: 'uuid' });
const status = Type.Union([Type.Literal('AWAITING_PAYMENT'), Type.Literal('IN_PROGRESS'), Type.Literal('DELIVERY_REPORTED'), Type.Literal('COMPLETED'), Type.Literal('DISPUTED'), Type.Literal('CANCELLED')]);
export const createOrderBody = Type.Object({ quotationId: uuid }, { additionalProperties: false });
export const orderParams = Type.Object({ orderId: uuid });
export const orderPage = Type.Object({ offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 10000 })), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })) });
export const orderResponse = Type.Object({ id: uuid, quotationId: uuid, requestId: uuid, status, currency: Type.String(), totalMinor: Type.String(), createdAt: Type.String(), updatedAt: Type.String(),
  history: Type.Array(Type.Object({ fromStatus: Type.Union([status, Type.Null()]), toStatus: status, actorId: uuid, createdAt: Type.String() })) });
