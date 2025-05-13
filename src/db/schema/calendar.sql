-- Calendar Items Table
CREATE TABLE IF NOT EXISTS calendar_items (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  scheduled_date TIMESTAMP NOT NULL,
  published_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  author_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Calendar Item Tags Table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS calendar_item_tags (
  calendar_item_id VARCHAR(36) NOT NULL,
  tag_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (calendar_item_id, tag_id),
  FOREIGN KEY (calendar_item_id) REFERENCES calendar_items(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Calendar Item Metadata Table (for flexible metadata storage)
CREATE TABLE IF NOT EXISTS calendar_item_metadata (
  calendar_item_id VARCHAR(36) NOT NULL,
  meta_key VARCHAR(100) NOT NULL,
  meta_value TEXT,
  PRIMARY KEY (calendar_item_id, meta_key),
  FOREIGN KEY (calendar_item_id) REFERENCES calendar_items(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_calendar_items_status ON calendar_items(status);
CREATE INDEX idx_calendar_items_scheduled_date ON calendar_items(scheduled_date);
CREATE INDEX idx_calendar_items_author_id ON calendar_items(author_id);
CREATE INDEX idx_calendar_items_content_type ON calendar_items(content_type);