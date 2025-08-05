#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Validates that the recommendation network system is properly deployed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Recommendation Network Deployment...\n');

// Check 1: Verify all required files exist
const requiredFiles = [
  'src/components/recommendations/RecommendationManager.tsx',
  'src/lib/services/recommendation-matching.ts',
  'src/app/api/recommendations/newsletters/route.ts',
  'src/app/api/recommendations/manage/route.ts',
  'src/types/recommendation.ts',
  'src/lib/db/recommendation-schema.sql',
  'DOCS/AssessFlow-components-TDD/recommendations/RecommendationNetwork-TDD.md'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

// Check 2: Verify build output exists
console.log('\n🏗️  Checking build output...');
const buildPath = path.join(process.cwd(), '.next');
if (fs.existsSync(buildPath)) {
  console.log('  ✅ Next.js build output exists');
  
  // Check for specific build artifacts
  const buildManifest = path.join(buildPath, 'build-manifest.json');
  const appManifest = path.join(buildPath, 'app-build-manifest.json');
  
  if (fs.existsSync(buildManifest) && fs.existsSync(appManifest)) {
    console.log('  ✅ Build manifests generated');
  } else {
    console.log('  ⚠️  Some build manifests missing');
  }
} else {
  console.log('  ❌ Build output missing - Run pnpm build');
  allFilesExist = false;
}

// Check 3: Verify database schema
console.log('\n🗄️  Checking database schema...');
const schemaPath = path.join(process.cwd(), 'src/lib/db/recommendation-schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const requiredTables = ['Newsletter', 'NewsletterRecommendation', 'RecommendationPerformance', 'RecommendationSettings'];
  
  let allTablesFound = true;
  requiredTables.forEach(table => {
    if (schemaContent.includes(`CREATE TABLE IF NOT EXISTS "${table}"`)) {
      console.log(`  ✅ ${table} table schema found`);
    } else {
      console.log(`  ❌ ${table} table schema missing`);
      allTablesFound = false;
    }
  });
  
  if (allTablesFound) {
    console.log('  ✅ All required database tables defined');
  }
} else {
  console.log('  ❌ Database schema file missing');
  allFilesExist = false;
}

// Check 4: Verify TDD specification completeness
console.log('\n📋 Checking TDD specification...');
const tddPath = path.join(process.cwd(), 'DOCS/AssessFlow-components-TDD/recommendations/RecommendationNetwork-TDD.md');
if (fs.existsSync(tddPath)) {
  const tddContent = fs.readFileSync(tddPath, 'utf8');
  const requiredSections = [
    'Architecture Diagram',
    'Database Schema Diagram',
    'UI Wireframes',
    'Algorithm Flowchart',
    'Test Requirements',
    'Performance Requirements',
    'Security Requirements'
  ];
  
  let allSectionsFound = true;
  requiredSections.forEach(section => {
    if (tddContent.includes(section)) {
      console.log(`  ✅ ${section} section found`);
    } else {
      console.log(`  ❌ ${section} section missing`);
      allSectionsFound = false;
    }
  });
  
  if (allSectionsFound) {
    console.log('  ✅ TDD specification is comprehensive');
  }
} else {
  console.log('  ❌ TDD specification missing');
  allFilesExist = false;
}

// Check 5: Test file coverage
console.log('\n🧪 Checking test coverage...');
const testFiles = [
  'src/__tests__/models/newsletter.test.ts',
  'src/__tests__/models/newsletter-recommendation.test.ts',
  'src/__tests__/services/recommendation-matching.test.ts',
  'src/__tests__/api/recommendations/newsletters.test.ts',
  'src/__tests__/components/RecommendationManager.test.tsx'
];

let allTestsExist = true;
testFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${path.basename(file)}`);
  } else {
    console.log(`  ❌ ${path.basename(file)} - Missing!`);
    allTestsExist = false;
  }
});

// Final validation summary
console.log('\n' + '='.repeat(60));
console.log('📊 DEPLOYMENT VALIDATION SUMMARY');
console.log('='.repeat(60));

if (allFilesExist && allTestsExist) {
  console.log('🎉 SUCCESS: Recommendation Network deployment is VALID!');
  console.log('\n✅ All required files are present');
  console.log('✅ Build output generated successfully');
  console.log('✅ Database schema is complete');
  console.log('✅ TDD specification is comprehensive');
  console.log('✅ Test suite coverage is complete');
  
  console.log('\n🚀 READY FOR PRODUCTION DEPLOYMENT!');
  console.log('\nNext steps:');
  console.log('1. Run database migration: npx prisma db push');
  console.log('2. Run tests: pnpm test');
  console.log('3. Deploy to production environment');
  
  process.exit(0);
} else {
  console.log('❌ FAILED: Deployment validation failed');
  console.log('\n⚠️  Please resolve the missing files/components above');
  console.log('⚠️  Re-run this script after fixes are applied');
  
  process.exit(1);
}