/**
 * Integration Examples for Optimization Hook System
 * Demonstrates how to integrate with existing codebase
 */

import { optimizationHooks } from './index';

// Example 1: Integration with existing API route
export async function createOptimizedAPIRoute(code: string, filePath: string): Promise<string> {
  const result = await optimizationHooks.optimizeCode(code, filePath);
  
  if (result.metrics.overallScore < 70) {
    console.warn(`⚠️ API route quality score: ${result.metrics.overallScore.toFixed(1)}`);
    console.log('💡 Recommendations:', result.recommendations);
  }
  
  return result.code;
}

// Example 2: Integration with React component generation
export async function createOptimizedComponent(componentCode: string, componentPath: string): Promise<string> {
  const result = await optimizationHooks.optimizeCode(componentCode, componentPath);
  
  // Check for React-specific optimizations
  if (result.metrics.performance < 75) {
    console.log('🔄 React component may need performance optimizations');
    console.log('Suggestions:', result.recommendations.filter(r => 
      r.includes('React') || r.includes('useCallback') || r.includes('useMemo')
    ));
  }
  
  return result.code;
}

// Example 3: Integration with database operations
export async function optimizeDatabaseQuery(queryCode: string, queryPath: string): Promise<string> {
  const result = await optimizationHooks.optimizeCode(queryCode, queryPath);
  
  // Check for database-specific issues
  if (result.metrics.cost > 80) {
    console.warn('💰 Database query may be expensive');
    console.log('Cost optimization suggestions:', result.recommendations);
  }
  
  return result.code;
}

// Example 4: Project-wide analysis
export async function analyzeProjectHealth(projectPath: string): Promise<any> {
  const results = await optimizationHooks.analyzeProject(projectPath);
  
  const summary = {
    totalFiles: results.length,
    averageScore: results.reduce((sum, r) => sum + r.metrics.overallScore, 0) / results.length,
    criticalIssues: results.filter(r => r.metrics.overallScore < 50).length,
    recommendations: []
  };
  
  console.log('📊 Project Health Report:');
  console.log(`Files analyzed: ${summary.totalFiles}`);
  console.log(`Average quality score: ${summary.averageScore.toFixed(1)}`);
  console.log(`Critical issues: ${summary.criticalIssues}`);
  
  return summary;
}

// Example 5: Custom rule for Next.js patterns
export function addNextJSOptimizationRules(): void {
  optimizationHooks.addCustomRule({
    id: 'nextjs-001',
    name: 'Next.js Image Optimization',
    category: 'performance',
    severity: 'warning',
    priority: 80,
    check: (code, context) => {
      const hasImageTag = /<img/.test(code);
      const hasNextImage = /next\/image/.test(code);
      
      const needsOptimization = hasImageTag && !hasNextImage;
      
      return {
        passed: !needsOptimization,
        message: needsOptimization ? 'Use Next.js Image component for better performance' : 'Image optimization looks good',
        suggestions: needsOptimization ? [
          'Replace <img> with Next.js Image component',
          'Add proper width and height attributes',
          'Consider using placeholder="blur" for better UX'
        ] : [],
        metrics: {
          performance: needsOptimization ? 40 : 85,
          maintainability: 70,
          security: 80,
          cost: needsOptimization ? 50 : 80
        }
      };
    }
  });
}

// Example 6: CI/CD Integration
export async function runCIOptimizationCheck(changedFiles: string[]): Promise<boolean> {
  let hasErrors = false;
  
  for (const file of changedFiles) {
    if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      const result = await optimizationHooks.analyzeFile(file);
      
      if (result.metrics.overallScore < 70) {
        console.error(`❌ ${file}: Quality score ${result.metrics.overallScore.toFixed(1)} below threshold`);
        hasErrors = true;
      }
      
      // Check for security issues
      const securityIssues = result.results.filter(r => 
        r.severity === 'error' && r.message.toLowerCase().includes('security')
      );
      
      if (securityIssues.length > 0) {
        console.error(`🔒 ${file}: Security issues found`);
        hasErrors = true;
      }
    }
  }
  
  return !hasErrors;
}

// Example 7: VS Code Extension Integration
export function createVSCodeExtensionHandler(): any {
  return {
    async onDocumentSave(document: any): Promise<void> {
      if (document.fileName.match(/\.(ts|tsx|js|jsx)$/)) {
        const result = await optimizationHooks.optimizeCode(document.getText(), document.fileName);
        
        // Show diagnostics in VS Code
        if (result.recommendations.length > 0) {
          // This would integrate with VS Code's diagnostic system
          console.log(`📋 Optimization suggestions for ${document.fileName}:`, result.recommendations);
        }
      }
    },
    
    async onDocumentChange(document: any): Promise<void> {
      // Real-time analysis as user types
      if (document.fileName.match(/\.(ts|tsx|js|jsx)$/)) {
        const result = await optimizationHooks.optimizeCode(document.getText(), document.fileName);
        
        // Show inline suggestions
        if (result.metrics.overallScore < 80) {
          console.log(`⚡ Real-time optimization available for ${document.fileName}`);
        }
      }
    }
  };
}

// Example 8: Git Hook Integration
export async function createGitPreCommitHook(): Promise<boolean> {
  const { execSync } = require('child_process');
  
  try {
    // Get staged files
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=AM')
      .toString()
      .trim()
      .split('\n')
      .filter(file => file.match(/\.(ts|tsx|js|jsx)$/));
    
    console.log('🔍 Analyzing staged files for optimization...');
    
    let hasBlockingIssues = false;
    
    for (const file of stagedFiles) {
      const result = await optimizationHooks.analyzeFile(file);
      
      // Check for blocking issues
      const blockingIssues = result.results.filter(r => 
        r.severity === 'error' && !r.passed
      );
      
      if (blockingIssues.length > 0) {
        console.error(`🚫 ${file}: Blocking optimization issues found`);
        blockingIssues.forEach(issue => {
          console.error(`  - ${issue.message}`);
        });
        hasBlockingIssues = true;
      }
    }
    
    if (hasBlockingIssues) {
      console.error('❌ Commit blocked due to optimization issues');
      console.log('💡 Fix the issues above or use --no-verify to bypass');
      return false;
    }
    
    console.log('✅ All files passed optimization checks');
    return true;
    
  } catch (error) {
    console.error('❌ Error during pre-commit optimization check:', error);
    return false;
  }
}

// Example 9: Performance Monitoring Integration
export function createPerformanceMonitor(): any {
  return {
    startMonitoring(): void {
      // Monitor file writes and analyze in real-time
      const fs = require('fs');
      const originalWriteFile = fs.writeFile;
      
      fs.writeFile = async (path: string, data: string, options: any, callback?: Function) => {
        try {
          if (path.match(/\.(ts|tsx|js|jsx)$/)) {
            const result = await optimizationHooks.optimizeCode(data, path);
            
            // Log performance metrics
            if (result.processingTime > 100) {
              console.warn(`⏱️ Slow optimization: ${path} took ${result.processingTime}ms`);
            }
            
            // Alert on performance degradation
            if (result.metrics.performance < 60) {
              console.warn(`📉 Performance degradation detected in ${path}`);
            }
          }
          
          return originalWriteFile(path, data, options, callback);
        } catch (error) {
          console.error('Optimization monitoring error:', error);
          return originalWriteFile(path, data, options, callback);
        }
      };
    },
    
    getMetrics(): any {
      return optimizationHooks.getMetrics();
    },
    
    generateReport(): any {
      return optimizationHooks.generateReport();
    }
  };
}

// Example 10: Webpack Plugin Integration
export function createWebpackOptimizationPlugin(): any {
  return {
    apply(compiler: any): void {
      compiler.hooks.compilation.tap('OptimizationHookPlugin', (compilation: any) => {
        compilation.hooks.optimize.tapAsync('OptimizationHookPlugin', async (callback: Function) => {
          console.log('🔧 Running webpack optimization analysis...');
          
          const assets = compilation.assets;
          let totalIssues = 0;
          
          for (const filename in assets) {
            if (filename.match(/\.(ts|tsx|js|jsx)$/)) {
              const source = assets[filename].source();
              const result = await optimizationHooks.optimizeCode(source, filename);
              
              if (result.metrics.overallScore < 75) {
                console.warn(`⚠️ ${filename}: Quality score ${result.metrics.overallScore.toFixed(1)}`);
                totalIssues++;
              }
            }
          }
          
          if (totalIssues > 0) {
            console.log(`📊 Found ${totalIssues} files with optimization opportunities`);
          }
          
          callback();
        });
      });
    }
  };
}

// Example 11: Express.js middleware integration
export function createExpressOptimizationMiddleware(): any {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Intercept response
    const originalSend = res.send;
    res.send = function(data: any) {
      const responseTime = Date.now() - startTime;
      
      // Log slow responses
      if (responseTime > 200) {
        console.warn(`⏱️ Slow API response: ${req.path} took ${responseTime}ms`);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

// Example 12: Testing integration
export async function createTestOptimizationSuite(): Promise<any> {
  return {
    async runOptimizationTests(): Promise<boolean> {
      const testFiles = [
        'src/components/ui/button.tsx',
        'src/app/api/content/route.ts',
        'src/lib/auth.ts'
      ];
      
      let allPassed = true;
      
      for (const file of testFiles) {
        const result = await optimizationHooks.analyzeFile(file);
        
        if (result.metrics.overallScore < 70) {
          console.error(`❌ Test failed: ${file} score ${result.metrics.overallScore.toFixed(1)} below threshold`);
          allPassed = false;
        } else {
          console.log(`✅ Test passed: ${file} score ${result.metrics.overallScore.toFixed(1)}`);
        }
      }
      
      return allPassed;
    },
    
    async validateConfiguration(): Promise<boolean> {
      const config = optimizationHooks.getConfig();
      const validation = optimizationHooks.validateConfig?.();
      
      if (!validation?.valid) {
        console.error('❌ Configuration validation failed:', validation?.errors);
        return false;
      }
      
      console.log('✅ Configuration validation passed');
      return true;
    }
  };
}

// Export all examples
export const integrationExamples = {
  createOptimizedAPIRoute,
  createOptimizedComponent,
  optimizeDatabaseQuery,
  analyzeProjectHealth,
  addNextJSOptimizationRules,
  runCIOptimizationCheck,
  createVSCodeExtensionHandler,
  createGitPreCommitHook,
  createPerformanceMonitor,
  createWebpackOptimizationPlugin,
  createExpressOptimizationMiddleware,
  createTestOptimizationSuite
};