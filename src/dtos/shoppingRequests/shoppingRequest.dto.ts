import { Type } from 'typebox';
const uuid = Type.String({ format: 'uuid' });
const nullableText = Type.Union([Type.String(), Type.Null()]);
export const requestInput = Type.Object({ listId: uuid, addressId: uuid, procurerId: uuid }, { additionalProperties: false });
export const requestParams = Type.Object({ requestId: uuid });
export const pageInput = Type.Object({ offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 10000 })), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })) });
export const requestResponse = Type.Object({ id: uuid, customerId: uuid, procurerId: uuid, shoppingListId: uuid,
  status: Type.Union([Type.Literal('REQUESTED'), Type.Literal('CANCELLED')]), createdAt: Type.String({ format: 'date-time' }), updatedAt: Type.String({ format: 'date-time' }),
  address: Type.Object({ label: Type.String(), line1: Type.String(), line2: nullableText, country: Type.String(), region: Type.String(), city: Type.String(), area: Type.String() }),
  list: Type.Object({ title: Type.String(), currency: Type.String(), notes: nullableText,
    items: Type.Array(Type.Object({ id: uuid, name: Type.String(), quantity: Type.String(), expectedUnitPriceMinor: Type.String(), notes: nullableText })) }) });
