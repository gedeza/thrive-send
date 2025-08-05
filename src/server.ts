import express from 'express';
import cors from 'cors';
import path from 'path';
import contentRoutes from './routes/contentRoutes';
import mediaRoutes from './routes/mediaRoutes';

// Create Express server
const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for mobile device access
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Allow localhost and local network requests
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Add your computer's local IP pattern (192.168.x.x, 10.x.x.x, etc.)
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:(3000|3001)$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:(3000|3001)$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:(3000|3001)$/,
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed`);
      callback(null, true); // Allow in development, but log for monitoring
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads as static (for persistent file URLs)
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Routes
app.use('/api/content', contentRoutes);
app.use('/api/media', mediaRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with network binding for mobile access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://0.0.0.0:${PORT}`);
  console.log(`Mobile access: http://[YOUR_LOCAL_IP]:${PORT}`);
  console.log('\nTo find your local IP:');
  console.log('- macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1');
  console.log('- Windows: ipconfig | findstr "IPv4"');
});

export default app;
