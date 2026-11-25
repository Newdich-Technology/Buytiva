import { Type } from 'typebox';
import { requestResponse } from '../shoppingRequests/shoppingRequest.dto.js';
const uuid = Type.String({ format: 'uuid' });
export const quoteParams = Type.Object({ quotationId: uuid });
export const requestParams = Type.Object({ requestId: uuid });
export const issueQuoteBody = Type.Object({ expectedRevision: Type.Integer({ minimum: 0, maximum: 2147483646 }), expiresAt: Type.String({ format: 'date-time' }) }, { additionalProperties: false });
export const quoteResponse = Type.Object({ id: uuid, requestId: uuid, revision: Type.Integer(), status: Type.Union([Type.Literal('ISSUED'), Type.Literal('SUPERSEDED'), Type.Literal('ACCEPTED'), Type.Literal('REJECTED')]), policyId: uuid, currency: Type.String(),
  subtotalMinor: Type.String(), serviceFeeMinor: Type.String(), deliveryFeeMinor: Type.String(), totalMinor: Type.String(), expiresAt: Type.String(), createdAt: Type.String(), decidedAt: Type.Union([Type.String(), Type.Null()]),
  address: requestResponse.properties.address, list: requestResponse.properties.list });
