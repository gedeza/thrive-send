/**
 * @jest-environment node
 */
import request from 'supertest';
import { createServer } from 'http';
import { prisma } from '@/lib/prisma';
import handler from '@/app/api/content-calendar/route';

// If using Clerk or NextAuth, you should mock the session/user returned from getAuth
// For the sake of this sample, adjustment is needed for your real setup.
jest.mock('@clerk/nextjs/server', () => ({
  getAuth: jest.fn(),
}));

const { getAuth } = require('@clerk/nextjs/server');

describe('Content Calendar API - Authorization (Role Checks)', () => {
  let server: any;
  let testEventId: string;

  beforeAll(async () => {
    await prisma.$connect();
    server = createServer((req, res) => handler(req, res));
    server.listen(0);
  });

  afterAll(async () => {
    await prisma.contentItem.deleteMany({
      where: { title: { contains: 'ROLE Test' } }
    });
    await prisma.$disconnect();
    server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow an editor/admin to create an event', async () => {
    getAuth.mockReturnValue({ userId: 'editor-id', role: 'editor' });
    const response = await request(server)
      .post('/api/content-calendar')
      .send({ title: 'ROLE Test - Editor Create' });
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toMatch(/ROLE Test/);
    testEventId = response.body.id;
  });

  it('should forbid a viewer from creating an event', async () => {
    getAuth.mockReturnValue({ userId: 'viewer-id', role: 'viewer' });
    const response = await request(server)
      .post('/api/content-calendar')
      .send({ title: 'ROLE Test - Viewer Create' });
    // Your handler must check role! Return 403 if not allowed
    expect([401, 403]).toContain(response.statusCode);
    expect(response.body.error).toMatch(/forbid|unauthor/i);
  });

  it('should allow an editor/admin to update their event', async () => {
    getAuth.mockReturnValue({ userId: 'editor-id', role: 'editor' });
    const response = await request(server)
      .put(`/api/content-calendar/${testEventId}`)
      .send({ title: 'ROLE Test - Editor Update' });
    expect([200, 201]).toContain(response.statusCode);
    expect(response.body.title).toBe('ROLE Test - Editor Update');
  });

  it('should forbid a viewer from updating an event', async () => {
    getAuth.mockReturnValue({ userId: 'viewer-id', role: 'viewer' });
    const response = await request(server)
      .put(`/api/content-calendar/${testEventId}`)
      .send({ title: 'ROLE Test - Viewer Update' });
    expect([401, 403]).toContain(response.statusCode);
    expect(response.body.error).toMatch(/forbid|unauthor/i);
  });

  it('should allow an editor/admin to delete their event', async () => {
    getAuth.mockReturnValue({ userId: 'editor-id', role: 'editor' });
    const response = await request(server)
      .delete(`/api/content-calendar/${testEventId}`);
    expect([200, 204]).toContain(response.statusCode);
  });

  it('should forbid a viewer from deleting an event', async () => {
    getAuth.mockReturnValue({ userId: 'viewer-id', role: 'viewer' });
    // Try to delete a non-existing or unauthorized event
    const response = await request(server)
      .delete(`/api/content-calendar/nonexistent-id-viewer`);
    expect([401, 403]).toContain(response.statusCode);
    expect(response.body.error).toMatch(/forbid|unauthor/i);
  });
});
