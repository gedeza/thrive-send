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
  beforeEach(() => {
    // Clear any test data before each test
    jest.clearAllMocks();
  });

  describe('GET /api/calendar', () => {
    it('should return empty array when no items exist', async () => {
      const response = await request(app).get('/api/calendar');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/calendar', () => {
    it('should create a new calendar item', async () => {
      const newItem = {
        title: 'Test Event',
        description: 'Test Description',
        type: 'blog' as ContentType,
        status: 'draft' as CalendarItemStatus,
        date: '2024-03-20',
        time: '12:00',
        socialMediaContent: {
          platforms: [],
          mediaUrls: [],
          crossPost: false,
          platformSpecificContent: {}
        }
      };

      const response = await request(app)
        .post('/api/calendar')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...newItem,
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/calendar')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/calendar/:id', () => {
    it('should update an existing calendar item', async () => {
      // First create an item
      const newItem = {
        title: 'Test Event',
        description: 'Test Description',
        type: 'blog' as ContentType,
        status: 'draft' as CalendarItemStatus,
        date: '2024-03-20',
        time: '12:00',
        socialMediaContent: {
          platforms: [],
          mediaUrls: [],
          crossPost: false,
          platformSpecificContent: {}
        }
      };

      const createResponse = await request(app)
        .post('/api/calendar')
        .send(newItem);

      const itemId = createResponse.body.id;

      // Then update it
      const updateData = {
        title: 'Updated Event',
        status: 'scheduled' as CalendarItemStatus
      };

      const response = await request(app)
        .put(`/api/calendar/${itemId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ...newItem,
        ...updateData,
        id: itemId,
        updatedAt: expect.any(String)
      });
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/calendar/non-existent-id')
        .send({ title: 'Updated Event' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/calendar/:id', () => {
    it('should delete an existing calendar item', async () => {
      // First create an item
      const newItem = {
        title: 'Test Event',
        description: 'Test Description',
        type: 'blog' as ContentType,
        status: 'draft' as CalendarItemStatus,
        date: '2024-03-20',
        time: '12:00',
        socialMediaContent: {
          platforms: [],
          mediaUrls: [],
          crossPost: false,
          platformSpecificContent: {}
        }
      };

      const createResponse = await request(app)
        .post('/api/calendar')
        .send(newItem);

      const itemId = createResponse.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/api/calendar/${itemId}`);

      expect(response.status).toBe(204);

      // Verify it's deleted
      const getResponse = await request(app).get('/api/calendar');
      expect(getResponse.body).not.toContainEqual(expect.objectContaining({ id: itemId }));
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .delete('/api/calendar/non-existent-id');

      expect(response.status).toBe(404);
    });
  });
});