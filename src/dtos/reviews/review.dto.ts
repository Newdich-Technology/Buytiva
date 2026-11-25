import { Type } from 'typebox';
const uuid = Type.String({ format: 'uuid' });
export const reviewParams = Type.Object({ orderId: uuid });
export const reviewBody = Type.Object({ rating: Type.Integer({ minimum: 1, maximum: 5 }),
  comment: Type.Optional(Type.Union([Type.String({ maxLength: 2000 }), Type.Null()])) }, { additionalProperties: false });
export const reviewResponse = Type.Object({ id: uuid, orderId: uuid, rating: Type.Integer({ minimum: 1, maximum: 5 }),
  comment: Type.Union([Type.String(), Type.Null()]), createdAt: Type.String({ format: 'date-time' }), updatedAt: Type.String({ format: 'date-time' }) });
