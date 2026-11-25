import { Type } from 'typebox';

const uuid = Type.String({ format: 'uuid' });
const notes = (maxLength: number) => Type.Optional(Type.Union([Type.String({ maxLength }), Type.Null()]));
export const listParams = Type.Object({ listId: uuid });
export const itemParams = Type.Object({ listId: uuid, itemId: uuid });
export const createListBody = Type.Object({ title: Type.String({ minLength: 1, maxLength: 120 }), currency: Type.String({ pattern: '^[A-Z]{3}$' }), notes: notes(2000) }, { additionalProperties: false });
export const itemBody = Type.Object({ name: Type.String({ minLength: 1, maxLength: 160 }), quantity: Type.String({ pattern: '^(0|[1-9][0-9]{0,5})(\\.[0-9]{1,3})?$' }), expectedUnitPriceMinor: Type.String({ pattern: '^(0|[1-9][0-9]{0,17})$' }), notes: notes(1000) }, { additionalProperties: false });
export const listResponse = Type.Object({ id: uuid, title: Type.String(), currency: Type.String(), notes: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal('DRAFT'), Type.Literal('SUBMITTED')]), createdAt: Type.String(), updatedAt: Type.String(), submittedAt: Type.Union([Type.String(), Type.Null()]),
  items: Type.Array(Type.Object({ id: uuid, name: Type.String(), quantity: Type.String(), expectedUnitPriceMinor: Type.String(), notes: Type.Union([Type.String(), Type.Null()]) })) });
export const listQuery = Type.Object({ offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 100000 })), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })) });
