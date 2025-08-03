/**
 * @jest-environment node
 */
import request from 'supertest';
import { createServer } from 'http';
import { prisma } from '@/lib/prisma';
import handler from '@/app/api/content-calendar/route';

describe('Content Calendar API - Error Handling & Auth', () => {
  let server: any;

  beforeAll(async () => {
    await prisma.$connect();
    server = createServer((req, res) => handler(req, res));
    server.listen(0);
  });

  afterAll(async () => {
    await prisma.contentItem.deleteMany({
      where: { title: { contains: 'AUTH/ERR Test' } }
    });
    await prisma.$disconnect();
    server.close();
  });

  it('should return 401 if user not authenticated (simulate by no session)', async () => {
    // To fully test this, your handler must check authentication using a mockable mechanism.
    // Here, it's shown conceptually and would require adjustment in practice:
    const response = await request(server)
      .post('/api/content-calendar')
      .send({ title: 'AUTH/ERR Test - No Auth' });
    // In production, use test utils to simulate no session; here, expect 401
    expect([401, 403]).toContain(response.statusCode);
    expect(response.body.error).toMatch(/unauthor/i);
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(server)
      .post('/api/content-calendar')
      .send({ body: 'Missing title should fail' });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toMatch(/title/i);
  });

  it('should return 404 for a non-existent item', async () => {
    const response = await request(server)
      .get('/api/content-calendar/non-existent-id');
    expect([404, 403]).toContain(response.statusCode); // If forbidden, handler may use 403
    expect(response.body.error).toBeDefined();
  });

  it('should handle server errors gracefully', async () => {
    // Simulate a DB failure by closing the connection prematurely
    await prisma.$disconnect();
    const response = await request(server)
      .post('/api/content-calendar')
      .send({ title: 'AUTH/ERR Test - DB Error' });
    expect([500, 503]).toContain(response.statusCode);
    expect(response.body.error).toBeDefined();
    // Restore DB connection for other tests
    await prisma.$connect();
  });
});
