/**
 * @jest-environment node
 */
import request from 'supertest';
import { createServer } from 'http';
import { prisma } from '@/lib/prisma';
import handler from '@/app/api/content-calendar/route';

describe('Content Calendar API (integration)', () => {
  let server: any;
  let testEventId: string;

  beforeAll(async () => {
    await prisma.$connect();
    server = createServer((req, res) => handler(req, res));
    server.listen(0); // Random open port
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.contentItem.deleteMany({
      where: { title: { contains: 'Integration Test' } }
    });
    await prisma.$disconnect();
    server.close();
  });

  it('should create a content event', async () => {
    const eventData = {
      title: 'Integration Test Event',
      body: 'This is a test event for integration testing',
      status: 'SCHEDULED',
      scheduledFor: new Date().toISOString(),
      organizationId: process.env.TEST_ORGANIZATION_ID || 'test-org-id',
    };

    const response = await request(server)
      .post('/api/content-calendar')
      .send(eventData);
    
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(eventData.title);
    expect(response.body.id).toBeDefined();
    
    // Save ID for later tests
    testEventId = response.body.id;
    
    // Verify database state
    const dbItem = await prisma.contentItem.findUnique({
      where: { id: testEventId }
    });
    expect(dbItem).toBeTruthy();
    expect(dbItem?.title).toBe(eventData.title);
  });

  it('should fetch all content events', async () => {
    const response = await request(server)
      .get('/api/content-calendar');
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Verify our test event is included in results
    const testEvent = response.body.find((item: any) => item.id === testEventId);
    expect(testEvent).toBeTruthy();
  });

  it('should fetch a specific content event', async () => {
    const response = await request(server)
      .get(`/api/content-calendar/${testEventId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(testEventId);
    expect(response.body.title).toContain('Integration Test');
  });

  it('should update a content event', async () => {
    const updateData = {
      title: 'Integration Test Event (Updated)',
      status: 'PUBLISHED'
    };

    const response = await request(server)
      .put(`/api/content-calendar/${testEventId}`)
      .send(updateData);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(updateData.title);
    expect(response.body.status).toBe(updateData.status);
    
    // Verify database was updated
    const dbItem = await prisma.contentItem.findUnique({
      where: { id: testEventId }
    });
    expect(dbItem?.title).toBe(updateData.title);
    expect(dbItem?.status).toBe(updateData.status);
  });

  it('should delete a content event', async () => {
    const response = await request(server)
      .delete(`/api/content-calendar/${testEventId}`);
    
    expect(response.statusCode).toBe(200);
    
    // Verify item was deleted from database
    const dbItem = await prisma.contentItem.findUnique({
      where: { id: testEventId }
    });
    expect(dbItem).toBeNull();
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      // Missing required fields
      body: 'This should fail validation'
    };

    const response = await request(server)
      .post('/api/content-calendar')
      .send(invalidData);
    
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
