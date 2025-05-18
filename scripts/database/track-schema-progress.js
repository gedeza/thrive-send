#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const calculateSchemaProgress = () => {
  const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Count models, relations, indexes, and enums
  const models = (schema.match(/model\s+\w+/g) || []).length;
  const relations = (schema.match(/@relation/g) || []).length;
  const indexes = (schema.match(/@@index/g) || []).length;
  const enums = (schema.match(/enum\s+\w+/g) || []).length;
  
  // Calculate progress percentages
  const progress = {
    models: Math.min(Math.round((models / 15) * 100), 100), // 15 is target number of models
    relations: Math.min(Math.round((relations / 45) * 100), 100), // 45 is target number of relations
    indexes: Math.min(Math.round((indexes / 15) * 100), 100), // 15 is target number of indexes
    enums: Math.min(Math.round((enums / 5) * 100), 100), // 5 is target number of enums
  };
  
  return progress;
};

const generateProgressBars = (progress) => {
  const createBar = (percentage) => {
    const filled = Math.max(0, Math.round(percentage / 5));
    const empty = Math.max(0, 20 - filled);
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    return `[${filledBar}${emptyBar}] ${percentage}%`;
  };

  return `## Schema Progress
\`\`\`progress
Core Models:       ${createBar(progress.models)}
Relations:         ${createBar(progress.relations)}
Indexes:           ${createBar(progress.indexes)}
Enums:             ${createBar(progress.enums)}
\`\`\``;
};

const updateSchemaProgress = () => {
  try {
    const progress = calculateSchemaProgress();
    const progressBars = generateProgressBars(progress);
    
    // Update schema documentation
    const schemaDocPath = path.join(process.cwd(), 'DOCS/architecture/database_schema.md');
    let schemaDoc = fs.readFileSync(schemaDocPath, 'utf8');
    
    schemaDoc = schemaDoc.replace(
      /## Schema Progress[\s\S]*?(?=## )/,
      progressBars
    );
    
    fs.writeFileSync(schemaDocPath, schemaDoc);
    console.log('✅ Schema progress updated in documentation');
  } catch (error) {
    console.error('❌ Error updating schema progress:', error.message);
    process.exit(1);
  }
};

updateSchemaProgress();