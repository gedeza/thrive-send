#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDir: './src',
  excludeDirs: ['node_modules', '.next', '.git', 'dist', 'build'],
  largeFileThreshold: 50 * 1024, // 50KB
  maxBundleSize: 5 * 1024 * 1024, // 5MB
  outputFile: './bundle-analysis.json'
};

// File size analysis
function analyzeFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Get all files recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!CONFIG.excludeDirs.some(excluded => filePath.includes(excluded))) {
        getAllFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Analyze component dependencies
function analyzeDependencies(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Extract import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Categorize imports
    const categorized = {
      external: imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('@/')),
      internal: imports.filter(imp => imp.startsWith('.') || imp.startsWith('@/')),
      heavy: imports.filter(imp => 
        ['recharts', 'date-fns', '@dnd-kit', 'react-query', 'framer-motion'].some(heavy => imp.includes(heavy))
      )
    };
    
    return categorized;
  } catch (error) {
    return { external: [], internal: [], heavy: [] };
  }
}

// Analyze code complexity
function analyzeComplexity(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Simple metrics
    const lines = content.split('\n').length;
    const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
    const useEffects = (content.match(/useEffect\(/g) || []).length;
    const useState = (content.match(/useState\(/g) || []).length;
    const complexity = functions + useEffects * 2 + useState;
    
    return {
      lines,
      functions,
      useEffects,
      useState,
      complexity
    };
  } catch (error) {
    return { lines: 0, functions: 0, useEffects: 0, useState: 0, complexity: 0 };
  }
}

// Check for performance anti-patterns
function checkAntiPatterns(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const antiPatterns = [];
    
    // Check for common anti-patterns
    if (content.includes('console.log') && !filePath.includes('test')) {
      antiPatterns.push('Console logs found (should be removed in production)');
    }
    
    if (content.includes('useState') && content.includes('useEffect') && 
        (content.match(/useEffect\(/g) || []).length > 3) {
      antiPatterns.push('Multiple useEffect hooks (consider consolidation)');
    }
    
    if (content.includes('inline-block') || content.includes('!important')) {
      antiPatterns.push('Inline styles or !important declarations found');
    }
    
    if (content.includes('setTimeout') && content.includes('useState')) {
      antiPatterns.push('Potential memory leak with setTimeout and state');
    }
    
    if (content.includes('JSON.parse') && content.includes('localStorage')) {
      antiPatterns.push('Synchronous localStorage operations (consider async alternatives)');
    }
    
    return antiPatterns;
  } catch (error) {
    return [];
  }
}

// Get file category based on path
function getFileCategory(filePath) {
  if (filePath.includes('/components/')) return 'component';
  if (filePath.includes('/pages/') || filePath.includes('/app/')) return 'page';
  if (filePath.includes('/lib/') || filePath.includes('/utils/')) return 'utility';
  if (filePath.includes('/hooks/')) return 'hook';
  if (filePath.includes('/types/')) return 'type';
  if (filePath.includes('/styles/')) return 'style';
  return 'other';
}

// Main analysis function
function analyzeBundleSize() {
  console.log('🔍 Starting bundle analysis...\n');
  
  const files = getAllFiles(CONFIG.sourceDir)
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.jsx'));
  
  const analysis = {
    summary: {
      totalFiles: files.length,
      totalSize: 0,
      averageSize: 0,
      largeFiles: 0,
      timestamp: new Date().toISOString()
    },
    files: [],
    categories: {},
    recommendations: [],
    heavyDependencies: new Set(),
    antiPatterns: {}
  };
  
  // Analyze each file
  files.forEach(filePath => {
    const size = analyzeFileSize(filePath);
    const dependencies = analyzeDependencies(filePath);
    const complexity = analyzeComplexity(filePath);
    const antiPatterns = checkAntiPatterns(filePath);
    const category = getFileCategory(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    analysis.summary.totalSize += size;
    
    if (size > CONFIG.largeFileThreshold) {
      analysis.summary.largeFiles++;
    }
    
    // Track heavy dependencies
    dependencies.heavy.forEach(dep => analysis.heavyDependencies.add(dep));
    
    // Group by category
    if (!analysis.categories[category]) {
      analysis.categories[category] = {
        count: 0,
        totalSize: 0,
        averageSize: 0,
        files: []
      };
    }
    
    analysis.categories[category].count++;
    analysis.categories[category].totalSize += size;
    analysis.categories[category].files.push(relativePath);
    
    // Store anti-patterns
    if (antiPatterns.length > 0) {
      analysis.antiPatterns[relativePath] = antiPatterns;
    }
    
    analysis.files.push({
      path: relativePath,
      size,
      sizeKB: (size / 1024).toFixed(2),
      category,
      dependencies,
      complexity,
      antiPatterns,
      isLarge: size > CONFIG.largeFileThreshold
    });
  });
  
  // Calculate averages
  analysis.summary.averageSize = analysis.summary.totalSize / analysis.summary.totalFiles;
  
  Object.keys(analysis.categories).forEach(category => {
    const cat = analysis.categories[category];
    cat.averageSize = cat.totalSize / cat.count;
  });
  
  // Generate recommendations
  generateRecommendations(analysis);
  
  return analysis;
}

// Generate optimization recommendations
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // Large files
  const largeFiles = analysis.files
    .filter(file => file.isLarge)
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
  
  if (largeFiles.length > 0) {
    recommendations.push({
      type: 'size',
      priority: 'high',
      title: 'Large Files Detected',
      description: `${largeFiles.length} files are larger than ${CONFIG.largeFileThreshold / 1024}KB`,
      files: largeFiles.map(f => f.path),
      action: 'Consider code splitting or optimization'
    });
  }
  
  // Heavy dependencies
  if (analysis.heavyDependencies.size > 0) {
    recommendations.push({
      type: 'dependencies',
      priority: 'medium',
      title: 'Heavy Dependencies Found',
      description: `${analysis.heavyDependencies.size} heavy dependencies detected`,
      dependencies: Array.from(analysis.heavyDependencies),
      action: 'Consider lazy loading or lighter alternatives'
    });
  }
  
  // Complex components
  const complexFiles = analysis.files
    .filter(file => file.complexity > 20)
    .sort((a, b) => b.complexity - a.complexity)
    .slice(0, 3);
  
  if (complexFiles.length > 0) {
    recommendations.push({
      type: 'complexity',
      priority: 'medium',
      title: 'Complex Components Detected',
      description: `${complexFiles.length} components have high complexity scores`,
      files: complexFiles.map(f => ({ path: f.path, complexity: f.complexity })),
      action: 'Consider breaking down into smaller components'
    });
  }
  
  // Anti-patterns
  const antiPatternCount = Object.keys(analysis.antiPatterns).length;
  if (antiPatternCount > 0) {
    recommendations.push({
      type: 'antipatterns',
      priority: 'low',
      title: 'Performance Anti-patterns Found',
      description: `${antiPatternCount} files contain potential performance issues`,
      details: analysis.antiPatterns,
      action: 'Review and fix identified anti-patterns'
    });
  }
  
  // Bundle size warning
  if (analysis.summary.totalSize > CONFIG.maxBundleSize) {
    recommendations.push({
      type: 'bundle-size',
      priority: 'critical',
      title: 'Bundle Size Too Large',
      description: `Total bundle size (${(analysis.summary.totalSize / 1024 / 1024).toFixed(2)}MB) exceeds recommended limit`,
      action: 'Implement aggressive code splitting and lazy loading'
    });
  }
  
  analysis.recommendations = recommendations;
}

// Print analysis results
function printResults(analysis) {
  console.log('📊 Bundle Analysis Results');
  console.log('=' * 50);
  
  // Summary
  console.log('\n📈 Summary:');
  console.log(`  Total Files: ${analysis.summary.totalFiles}`);
  console.log(`  Total Size: ${(analysis.summary.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Average File Size: ${(analysis.summary.averageSize / 1024).toFixed(2)} KB`);
  console.log(`  Large Files (>${CONFIG.largeFileThreshold / 1024}KB): ${analysis.summary.largeFiles}`);
  
  // Categories
  console.log('\n📁 By Category:');
  Object.entries(analysis.categories).forEach(([category, data]) => {
    console.log(`  ${category}: ${data.count} files (${(data.totalSize / 1024).toFixed(2)} KB avg)`);
  });
  
  // Heavy Dependencies
  if (analysis.heavyDependencies.size > 0) {
    console.log('\n⚠️  Heavy Dependencies:');
    Array.from(analysis.heavyDependencies).forEach(dep => {
      console.log(`  - ${dep}`);
    });
  }
  
  // Recommendations
  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'critical' ? '🔴' : 
                     rec.priority === 'high' ? '🟠' : 
                     rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`  ${priority} ${rec.title}`);
      console.log(`     ${rec.description}`);
      console.log(`     Action: ${rec.action}\n`);
    });
  } else {
    console.log('\n✅ No optimization recommendations at this time!');
  }
}

// Save results to file
function saveResults(analysis) {
  try {
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Results saved to ${CONFIG.outputFile}`);
  } catch (error) {
    console.error('❌ Failed to save results:', error.message);
  }
}

// Main execution
function main() {
  try {
    const analysis = analyzeBundleSize();
    printResults(analysis);
    saveResults(analysis);
    
    // Exit with error code if critical issues found
    const criticalIssues = analysis.recommendations.filter(r => r.priority === 'critical');
    if (criticalIssues.length > 0) {
      console.log('\n❌ Critical issues found. Please address before deployment.');
      process.exit(1);
    } else {
      console.log('\n✅ Bundle analysis complete!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeBundleSize, CONFIG };