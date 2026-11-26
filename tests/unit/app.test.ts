import { describe, expect, it } from 'vitest';
import { HEALTH_ENDPOINT_PATH, API_VERSION_PREFIX } from '../../src/constants/api.constants.js';
import { createBuytivaFastifyApplication } from '../../src/app.js';

describe('versioned health endpoint', () => {
  it('returns an ok status under the current API version', async () => {
    const app = createBuytivaFastifyApplication();
    const response = await app.inject({
      method: 'GET',
      url: `${API_VERSION_PREFIX}${HEALTH_ENDPOINT_PATH}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    await app.close();
  });

  it('does not expose the old unversioned path', async () => {
    const app = createBuytivaFastifyApplication();
    const response = await app.inject({ method: 'GET', url: HEALTH_ENDPOINT_PATH });

    expect(response.statusCode).toBe(404);
    await app.close();
  });
});

describe('request safety', () => {
  it('rejects unknown request properties instead of silently discarding them', async () => {
    const app = createBuytivaFastifyApplication();
    app.post('/validation-test', { schema: { body: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'], additionalProperties: false } } }, async () => ({ ok: true }));
    const response = await app.inject({ method: 'POST', url: '/validation-test', payload: { name: 'test', unexpected: true } });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    await app.close();
  });
  it('returns a safe 413 response for oversized requests', async () => {
    const app = createBuytivaFastifyApplication();
    app.post('/size-test', async () => ({ ok: true }));
    const response = await app.inject({ method: 'POST', url: '/size-test', headers: { 'content-type': 'application/json' }, payload: JSON.stringify({ value: 'a'.repeat(1_100_000) }) });
    expect(response.statusCode).toBe(413);
    expect(response.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    await app.close();
  });
});
