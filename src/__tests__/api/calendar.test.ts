/**
 * @jest-environment node
 */

import request from 'supertest';
import express from 'express';
import calendarRoutes from '../../routes/calendarRoutes';
import { ContentType, CalendarItemStatus } from '../../models/Calendar';

const app = express();
app.use(express.json());
app.use('/api/calendar', calendarRoutes);

describe('Calendar API', () => {
  let createdItemId: string;

  // Test creating a calendar item
  test('POST /api/calendar - should create a new calendar item', async () => {
    const newItem = {
      title: 'Test Content',
      description: 'This is a test content item',
      contentType: ContentType.BLOG_POST,
      scheduledDate: new Date('2023-12-31').toISOString(),
      authorId: 'user123'
    };

    const response = await request(app)
      .post('/api/calendar')
      .send(newItem)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(newItem.title);
    expect(response.body.status).toBe(CalendarItemStatus.DRAFT);
    
    createdItemId = response.body.id;
  });

  // Test getting all calendar items
  test('GET /api/calendar - should return all calendar items', async () => {
    const response = await request(app)
      .get('/api/calendar')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test getting a specific calendar item
  test('GET /api/calendar/:id - should return a specific calendar item', async () => {
    const response = await request(app)
      .get(`/api/calendar/${createdItemId}`)
      .expect(200);

    expect(response.body.id).toBe(createdItemId);
  });

  // Test updating a calendar item
  test('PUT /api/calendar/:id - should update a calendar item', async () => {
    const updatedData = {
      title: 'Updated Test Content',
      description: 'This content has been updated'
    };

    const response = await request(app)
      .put(`/api/calendar/${createdItemId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.description).toBe(updatedData.description);
  });

  // Test publishing a calendar item
  test('POST /api/calendar/:id/publish - should publish a calendar item', async () => {
    const response = await request(app)
      .post(`/api/calendar/${createdItemId}/publish`)
      .expect(200);

    expect(response.body.status).toBe(CalendarItemStatus.PUBLISHED);
    expect(response.body.publishedDate).toBeDefined();
  });

  // Test filtering calendar items by status
  test('GET /api/calendar?status=published - should return published items', async () => {
    const response = await request(app)
      .get('/api/calendar?status=published')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach((item: any) => {
      expect(item.status).toBe(CalendarItemStatus.PUBLISHED);
    });
  });

  // Test deleting a calendar item
  test('DELETE /api/calendar/:id - should delete a calendar item', async () => {
    await request(app)
      .delete(`/api/calendar/${createdItemId}`)
      .expect(204);

    // Verify it's deleted
    await request(app)
      .get(`/api/calendar/${createdItemId}`)
      .expect(404);
  });
});