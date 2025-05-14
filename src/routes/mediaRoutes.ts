import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const MEDIA_DIR = path.join(__dirname, '../../../public/uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_, __, cb) => { cb(null, MEDIA_DIR); },
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });
const router = express.Router();

// POST /api/media/upload
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`; // public/ is served as static
  res.status(201).json({ success: true, url: fileUrl, filename: req.file.filename });
});

export default router;