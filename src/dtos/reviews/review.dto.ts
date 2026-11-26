import { Type } from 'typebox';
const uuid = Type.String({ format: 'uuid' });
export const reviewParams = Type.Object({ orderId: uuid });
export const reviewBody = Type.Object({ rating: Type.Integer({ minimum: 1, maximum: 5 }),
  comment: Type.Optional(Type.Union([Type.String({ maxLength: 2000 }), Type.Null()])) }, { additionalProperties: false });
export const reviewResponse = Type.Object({ id: uuid, orderId: uuid, rating: Type.Integer({ minimum: 1, maximum: 5 }),
  comment: Type.Union([Type.String(), Type.Null()]), version: Type.Integer({ minimum: 1 }), createdAt: Type.String({ format: 'date-time' }), updatedAt: Type.String({ format: 'date-time' }) });

const moderationStatus = Type.Union([Type.Literal('PENDING'), Type.Literal('APPROVED'), Type.Literal('HIDDEN')]);
export const moderationParams = Type.Object({ reviewId: uuid });
export const moderationPage = Type.Object({ offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 10000 })), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })) });
export const reviewEditBody = Type.Object({ ...reviewBody.properties, expectedVersion: Type.Integer({ minimum: 1, maximum: 2147483646 }) }, { additionalProperties: false });
export const moderationBody = Type.Object({ expectedVersion: Type.Integer({ minimum: 1 }), expectedStatus: moderationStatus, targetStatus: Type.Union([Type.Literal('APPROVED'), Type.Literal('HIDDEN')]),
  reason: Type.String({ minLength: 8, maxLength: 1000 }) }, { additionalProperties: false });
export const moderationResponse = Type.Object({ ...reviewResponse.properties, moderationStatus });

export const ratingParams = Type.Object({ procurerId: uuid });
export const ratingSummaryResponse = Type.Object({ averageRating: Type.Union([Type.Number({ minimum: 1, maximum: 5 }), Type.Null()]), reviewCount: Type.Integer({ minimum: 0 }),
  distribution: Type.Object({ one: Type.Integer({ minimum: 0 }), two: Type.Integer({ minimum: 0 }), three: Type.Integer({ minimum: 0 }), four: Type.Integer({ minimum: 0 }), five: Type.Integer({ minimum: 0 }) }) });

export const reviewReportBody = Type.Object({ expectedVersion: Type.Integer({ minimum: 1 }), reason: Type.String({ minLength: 8, maxLength: 1000 }) }, { additionalProperties: false });
export const reviewReportParams = Type.Object({ reportId: uuid });
export const reviewReportDecision = Type.Object({ targetStatus: Type.Union([Type.Literal('RESOLVED'), Type.Literal('DISMISSED')]), reason: Type.String({ minLength: 8, maxLength: 1000 }) }, { additionalProperties: false });
export const reviewReportResponse = Type.Object({ id: uuid, reviewId: uuid, reviewVersion: Type.Integer({ minimum: 1 }), ratingSnapshot: Type.Integer({ minimum: 1, maximum: 5 }), commentSnapshot: Type.Union([Type.String(), Type.Null()]), reason: Type.String(), status: Type.Union([Type.Literal('OPEN'), Type.Literal('RESOLVED'), Type.Literal('DISMISSED')]), createdAt: Type.String({ format: 'date-time' }), updatedAt: Type.String({ format: 'date-time' }) });
