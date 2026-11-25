import { Type } from 'typebox';
const uuid = Type.String({ format: 'uuid' });
export const reviewParams = Type.Object({ orderId: uuid });
export const reviewBody = Type.Object({ rating: Type.Integer({ minimum: 1, maximum: 5 }),
  comment: Type.Optional(Type.Union([Type.String({ maxLength: 2000 }), Type.Null()])) }, { additionalProperties: false });
export const reviewResponse = Type.Object({ id: uuid, orderId: uuid, rating: Type.Integer({ minimum: 1, maximum: 5 }),
  comment: Type.Union([Type.String(), Type.Null()]), createdAt: Type.String({ format: 'date-time' }), updatedAt: Type.String({ format: 'date-time' }) });

const moderationStatus = Type.Union([Type.Literal('PENDING'), Type.Literal('APPROVED'), Type.Literal('HIDDEN')]);
export const moderationParams = Type.Object({ reviewId: uuid });
export const moderationPage = Type.Object({ offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 10000 })), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })) });
export const moderationBody = Type.Object({ expectedStatus: moderationStatus, targetStatus: Type.Union([Type.Literal('APPROVED'), Type.Literal('HIDDEN')]),
  reason: Type.String({ minLength: 8, maxLength: 1000 }) }, { additionalProperties: false });
export const moderationResponse = Type.Object({ ...reviewResponse.properties, moderationStatus });

export const ratingParams = Type.Object({ procurerId: uuid });
export const ratingSummaryResponse = Type.Object({ averageRating: Type.Union([Type.Number({ minimum: 1, maximum: 5 }), Type.Null()]), reviewCount: Type.Integer({ minimum: 0 }),
  distribution: Type.Object({ one: Type.Integer({ minimum: 0 }), two: Type.Integer({ minimum: 0 }), three: Type.Integer({ minimum: 0 }), four: Type.Integer({ minimum: 0 }), five: Type.Integer({ minimum: 0 }) }) });
