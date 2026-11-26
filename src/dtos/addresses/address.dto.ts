import { Type } from 'typebox';
const uuid = Type.String({ format: 'uuid' });
const location = Type.String({ minLength: 1, maxLength: 100 });
export const addressBody = Type.Object({ label: Type.String({ minLength: 1, maxLength: 80 }), line1: Type.String({ minLength: 1, maxLength: 200 }),
  line2: Type.Union([Type.String({ maxLength: 200 }), Type.Null()]), country: Type.String({ minLength: 2, maxLength: 2 }), region: location, city: location, area: location }, { additionalProperties: false });
export const addressResponse = Type.Object({ ...addressBody.properties, id: uuid, createdAt: Type.String({ format: 'date-time' }), updatedAt: Type.String({ format: 'date-time' }) });
export const addressParams = Type.Object({ addressId: uuid });
export const addressPage = Type.Object({ offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 10000 })), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })) });
