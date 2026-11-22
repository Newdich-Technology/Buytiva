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
