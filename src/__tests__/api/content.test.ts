import request from 'supertest';
import express from 'express';
import contentRoutes from '../../routes/contentRoutes';
import { ContentType, ContentStatus } from '../../models/Content';

const app = express();
app.use(express.json());
app.use('/api/content', contentRoutes);

describe('Content API', () => {
  beforeEach(() => {
    // Clear any test data before each test
    jest.clearAllMocks();
  });

  describe('GET /api/content', () => {
    it('should return empty array when no items exist', async () => {
      const response = await request(app).get('/api/content');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should filter items by contentType', async () => {
      // First create some test items
      const blogPost = {
        title: 'Test Blog',
        content: 'Blog content',
        contentType: 'blog' as ContentType,
        status: 'draft' as ContentStatus
      };

      const socialPost = {
        title: 'Test Social',
        content: 'Social content',
        contentType: 'social' as ContentType,
        status: 'draft' as ContentStatus
      };

      await request(app).post('/api/content').send(blogPost);
      await request(app).post('/api/content').send(socialPost);

      const response = await request(app).get('/api/content?contentType=blog');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].contentType).toBe('blog');
    });
  });

  describe('POST /api/content', () => {
    it('should create a new content item', async () => {
      const newItem = {
        title: 'Test Content',
        content: 'Test content body',
        contentType: 'blog' as ContentType,
        status: 'draft' as ContentStatus,
        tags: ['test', 'blog']
      };

      const response = await request(app)
        .post('/api/content')
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
        .post('/api/content')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields');
    });
  });

  describe('PUT /api/content/:id', () => {
    it('should update an existing content item', async () => {
      // First create an item
      const newItem = {
        title: 'Test Content',
        content: 'Test content body',
        contentType: 'blog' as ContentType,
        status: 'draft' as ContentStatus
      };

      const createResponse = await request(app)
        .post('/api/content')
        .send(newItem);

      const itemId = createResponse.body.id;

      // Then update it
      const updateData = {
        title: 'Updated Title',
        status: 'published' as ContentStatus
      };

      const response = await request(app)
        .put(`/api/content/${itemId}`)
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
        .put('/api/content/non-existent-id')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/content/:id', () => {
    it('should delete an existing content item', async () => {
      // First create an item
      const newItem = {
        title: 'Test Content',
        content: 'Test content body',
        contentType: 'blog' as ContentType,
        status: 'draft' as ContentStatus
      };

      const createResponse = await request(app)
        .post('/api/content')
        .send(newItem);

      const itemId = createResponse.body.id;

      // Then delete it
      const response = await request(app)
        .delete(`/api/content/${itemId}`);

      expect(response.status).toBe(204);

      // Verify it's deleted
      const getResponse = await request(app).get('/api/content');
      expect(getResponse.body).not.toContainEqual(expect.objectContaining({ id: itemId }));
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .delete('/api/content/non-existent-id');

      expect(response.status).toBe(404);
    });
  });
}); 