// Note: This test assumes you're using Jest and you have a test setup with your database seeded or available.

import { GET } from './route';

test('GET /api/projects returns array of projects', async () => {
  const response = await GET();
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
  if (body.length > 0) {
    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("name");
    // Optionally check status, clientId, createdAt
  }
});