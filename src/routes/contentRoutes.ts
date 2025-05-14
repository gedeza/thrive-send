import express from 'express';

const router = express.Router();

// In-memory store for demo
const CONTENT_STORE: any[] = [];

// Create new content
router.post('/', (req, res) => {
  const { title, content, contentType, tags, preheaderText, mediaFiles } = req.body;
  const newContent = {
    id: (CONTENT_STORE.length + 1).toString(),
    title,
    content,
    contentType,
    tags,
    preheaderText,
    mediaFiles,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  CONTENT_STORE.push(newContent);
  return res.status(201).json({ success: true, id: newContent.id });
});

// Fetch content
router.get('/:id', (req, res) => {
  const item = CONTENT_STORE.find((c) => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  return res.status(200).json(item);
});

// Update content
router.put('/:id', (req, res) => {
  const idx = CONTENT_STORE.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = {
    ...CONTENT_STORE[idx],
    ...req.body,
    updatedAt: new Date(),
  };
  CONTENT_STORE[idx] = updated;
  return res.status(200).json({ success: true });
});

export default router;