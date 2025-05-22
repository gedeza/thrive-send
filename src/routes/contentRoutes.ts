import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Content, CreateContentInput, UpdateContentInput, ContentFilters } from '../models/Content';

const router = express.Router();

// In-memory storage for content items
let contentItems: Content[] = [];

// GET all content items with optional filters
router.get('/', (req, res) => {
  const filters: ContentFilters = req.query;
  let filteredItems = [...contentItems];

  if (filters.contentType) {
    filteredItems = filteredItems.filter(item => item.contentType === filters.contentType);
  }

  if (filters.status) {
    filteredItems = filteredItems.filter(item => item.status === filters.status);
  }

  if (filters.tags && filters.tags.length > 0) {
    filteredItems = filteredItems.filter(item => 
      filters.tags!.some(tag => item.tags.includes(tag))
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredItems = filteredItems.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.content.toLowerCase().includes(searchLower)
    );
  }

  if (filters.startDate) {
    filteredItems = filteredItems.filter(item =>
      item.createdAt >= new Date(filters.startDate!)
    );
  }

  if (filters.endDate) {
    filteredItems = filteredItems.filter(item =>
      item.createdAt <= new Date(filters.endDate!)
    );
  }

  res.json(filteredItems);
});

// GET single content item
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const item = contentItems.find(item => item.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Content not found' });
  }

  res.json(item);
});

// POST new content item
router.post('/', (req, res) => {
  const input: CreateContentInput = req.body;

  // Validate required fields
  if (!input.title || !input.content || !input.contentType) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['title', 'content', 'contentType']
    });
  }

  const newItem: Content = {
    id: uuidv4(),
    title: input.title,
    content: input.content,
    contentType: input.contentType,
    status: input.status || 'draft',
    mediaUrls: input.mediaUrls || [],
    preheaderText: input.preheaderText,
    publishDate: input.publishDate,
    tags: input.tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-123' // TODO: Get from auth
  };

  contentItems.push(newItem);
  res.status(201).json(newItem);
});

// PUT update content item
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const input: UpdateContentInput = req.body;

  const itemIndex = contentItems.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Content not found' });
  }

  const updatedItem = {
    ...contentItems[itemIndex],
    ...input,
    updatedAt: new Date()
  };

  contentItems[itemIndex] = updatedItem;
  res.json(updatedItem);
});

// DELETE content item
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const itemIndex = contentItems.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Content not found' });
  }

  contentItems = contentItems.filter(item => item.id !== id);
  res.status(204).send();
});

export default router; 