const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Image dimensions
const WIDTH = 1200;
const HEIGHT = 800;

// Colors
const COLORS = {
  background: '#ffffff',
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b',
  text: '#1e293b'
};

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/docs/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Generate dashboard image
function generateDashboardImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Header
  ctx.fillStyle = COLORS.primary;
  ctx.fillRect(0, 0, WIDTH, 80);

  // Content
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Content Management Dashboard', 40, 50);

  // Stats
  const stats = [
    { label: 'Total Content', value: '156' },
    { label: 'Published', value: '89' },
    { label: 'Drafts', value: '42' },
    { label: 'Scheduled', value: '25' }
  ];

  stats.forEach((stat, i) => {
    const x = 40 + (i * 280);
    const y = 120;
    
    ctx.fillStyle = COLORS.secondary;
    ctx.font = '16px Arial';
    ctx.fillText(stat.label, x, y);
    
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 32px Arial';
    ctx.fillText(stat.value, x, y + 40);
  });

  // Recent Content
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 20px Arial';
  ctx.fillText('Recent Content', 40, 220);

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, 'content-dashboard.png'), buffer);
}

// Generate editor interface image
function generateEditorImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Toolbar
  ctx.fillStyle = COLORS.secondary;
  ctx.fillRect(0, 0, WIDTH, 60);

  // Editor area
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(40, 80, WIDTH - 80, HEIGHT - 120);

  // Content blocks
  const blocks = [
    { type: 'Text', y: 120 },
    { type: 'Image', y: 200 },
    { type: 'Button', y: 300 },
    { type: 'Divider', y: 380 }
  ];

  blocks.forEach(block => {
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(60, block.y, WIDTH - 120, 60);
    
    ctx.fillStyle = COLORS.background;
    ctx.font = '16px Arial';
    ctx.fillText(block.type, 80, block.y + 35);
  });

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, 'content-editor.png'), buffer);
}

// Generate analytics dashboard image
function generateAnalyticsImage() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Header
  ctx.fillStyle = COLORS.primary;
  ctx.fillRect(0, 0, WIDTH, 80);

  // Content
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Content Analytics Dashboard', 40, 50);

  // Charts
  const charts = [
    { label: 'Engagement', y: 120 },
    { label: 'Conversion', y: 400 }
  ];

  charts.forEach(chart => {
    // Chart area
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(40, chart.y, WIDTH - 80, 240);

    // Chart title
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 20px Arial';
    ctx.fillText(chart.label, 60, chart.y + 30);

    // Chart bars
    const barWidth = 60;
    const barSpacing = 20;
    const startX = 60;
    const maxHeight = 180;

    for (let i = 0; i < 8; i++) {
      const height = Math.random() * maxHeight;
      const x = startX + (i * (barWidth + barSpacing));
      const y = chart.y + 240 - height;

      ctx.fillStyle = COLORS.primary;
      ctx.fillRect(x, y, barWidth, height);
    }
  });

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(imagesDir, 'analytics-dashboard.png'), buffer);
}

// Generate all images
generateDashboardImage();
generateEditorImage();
generateAnalyticsImage();

console.log('Documentation images generated successfully!'); 