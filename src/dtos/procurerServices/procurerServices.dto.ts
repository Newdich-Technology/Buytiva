import { Type } from 'typebox';
const location = Type.String({ minLength: 1, maxLength: 100 });
const currency = Type.Literal('NGN');
export const profileInput = Type.Object({ publicName: Type.String({ minLength: 2, maxLength: 120 }), biography: Type.Union([Type.String({ maxLength: 2000 }), Type.Null()]), acceptingRequests: Type.Boolean() }, { additionalProperties: false });
export const zoneInput = Type.Object({ country: Type.String({ minLength: 2, maxLength: 2 }), region: location, city: location, area: location,
  deliveryFeeMinor: Type.String({ pattern: '^(0|[1-9][0-9]{0,17})$' }), currency, active: Type.Boolean() }, { additionalProperties: false });
export const zoneResponse = Type.Object({ ...zoneInput.properties, id: Type.String({ format: 'uuid' }) });
export const profileResponse = Type.Object({ userId: Type.String({ format: 'uuid' }), status: Type.String(), publicName: Type.Union([Type.String(), Type.Null()]), biography: Type.Union([Type.String(), Type.Null()]), acceptingRequests: Type.Boolean(), zones: Type.Array(zoneResponse) });
export const zoneParams = Type.Object({ zoneId: Type.String({ format: 'uuid' }) });
export const discoveryQuery = Type.Object({ country: Type.String({ minLength: 2, maxLength: 2 }), region: location, city: location, area: location, offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 10000 })), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })) });
export const publicProfileResponse = Type.Object({ userId: Type.String({ format: 'uuid' }), publicName: Type.String(), biography: Type.Union([Type.String(), Type.Null()]), zone: zoneResponse });
