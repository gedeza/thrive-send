#!/usr/bin/env node

/**
 * Hooks System Check Script
 * Verifies optimization hooks system availability
 */

const fs = require('fs');
const path = require('path');

function checkHooksSystem() {
  const hooksPath = path.join(__dirname, '..', 'src', 'lib', 'hooks', 'index.ts');
  
  if (fs.existsSync(hooksPath)) {
    console.log('✅ Optimization hooks system files available');
    return true;
  } else {
    console.log('⚠️  Optimization hooks system files not found, skipping check');
    console.log('   This is not critical and development will continue normally');
    return false;
  }
}

// Run the check
checkHooksSystem();