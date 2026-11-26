import { Type } from 'typebox';
const uuid = Type.String({ format: 'uuid' });
const money = Type.String({ pattern: '^(0|[1-9][0-9]{0,17})$' });
export const previewBody = Type.Object({ addressId: uuid, listId: uuid, procurerId: uuid }, { additionalProperties: false });
export const previewResponse = Type.Object({ currency: Type.Literal('NGN'), policyId: uuid, policyVersion: Type.Integer(), subtotalMinor: money,
  serviceFeeMinor: money, deliveryFeeMinor: money, customerTotalMinor: money, binding: Type.Literal(false) });
