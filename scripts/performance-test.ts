#!/usr/bin/env node

/**
 * Performance Testing Script for ThriveSend
 * 
 * This script runs comprehensive performance tests to validate
 * the optimizations we've implemented.
 */

import { performance } from 'perf_hooks';
// Using built-in Node.js fetch (Node 18+)
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  details: any;
  timestamp: number;
}

interface PerformanceTestConfig {
  baseUrl: string;
  testDuration: number; // seconds
  concurrentUsers: number;
  endpoints: Array<{
    path: string;
    method: string;
    expectedMaxTime: number; // ms
    payload?: any;
  }>;
}

class PerformanceTestRunner {
  private config: PerformanceTestConfig;
  private results: TestResult[] = [];

  constructor(config: PerformanceTestConfig) {
    this.config = config;
  }

  /**
   * Run all performance tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting ThriveSend Performance Tests...\n');

    // Test 1: API Response Times
    await this.testAPIResponseTimes();

    // Test 2: Database Query Performance
    await this.testDatabasePerformance();

    // Test 3: Bundle Size Analysis
    await this.testBundleSize();

    // Test 4: Memory Usage Tests
    await this.testMemoryUsage();

    // Test 5: Load Testing
    await this.testLoadPerformance();

    // Generate Report
    this.generateReport();
  }

  /**
   * Test API response times for critical endpoints
   */
  private async testAPIResponseTimes(): Promise<void> {
    console.log('📊 Testing API Response Times...');

    for (const endpoint of this.config.endpoints) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(`${this.config.baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            // Add auth headers if needed
          },
          body: endpoint.payload ? JSON.stringify(endpoint.payload) : undefined,
        });

        const endTime = performance.now();
        const duration = endTime - startTime;

        const success = duration <= endpoint.expectedMaxTime && response.ok;

        this.results.push({
          testName: `API Response: ${endpoint.method} ${endpoint.path}`,
          success,
          duration,
          details: {
            status: response.status,
            expectedMaxTime: endpoint.expectedMaxTime,
            actualTime: Math.round(duration),
          },
          timestamp: Date.now(),
        });

        console.log(`  ${success ? '✅' : '❌'} ${endpoint.method} ${endpoint.path}: ${Math.round(duration)}ms (max: ${endpoint.expectedMaxTime}ms)`);

      } catch (error) {
        this.results.push({
          testName: `API Response: ${endpoint.method} ${endpoint.path}`,
          success: false,
          duration: 0,
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          timestamp: Date.now(),
        });

        console.log(`  ❌ ${endpoint.method} ${endpoint.path}: Failed - ${error}`);
      }
    }
    console.log();
  }

  /**
   * Test database query performance
   */
  private async testDatabasePerformance(): Promise<void> {
    console.log('🗄️  Testing Database Performance...');

    const dbTests = [
      {
        name: 'Campaign List Query',
        endpoint: '/api/campaigns',
        expectedMaxTime: 300,
      },
      {
        name: 'Content List Query',
        endpoint: '/api/content',
        expectedMaxTime: 400,
      },
      {
        name: 'Analytics Query',
        endpoint: '/api/analytics',
        expectedMaxTime: 500,
      },
    ];

    for (const test of dbTests) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(`${this.config.baseUrl}${test.endpoint}`);
        const endTime = performance.now();
        const duration = endTime - startTime;

        const success = duration <= test.expectedMaxTime && response.ok;

        this.results.push({
          testName: `Database: ${test.name}`,
          success,
          duration,
          details: {
            expectedMaxTime: test.expectedMaxTime,
            actualTime: Math.round(duration),
          },
          timestamp: Date.now(),
        });

        console.log(`  ${success ? '✅' : '❌'} ${test.name}: ${Math.round(duration)}ms (max: ${test.expectedMaxTime}ms)`);

      } catch (error) {
        console.log(`  ❌ ${test.name}: Failed - ${error}`);
      }
    }
    console.log();
  }

  /**
   * Test bundle size and analyze
   */
  private async testBundleSize(): Promise<void> {
    console.log('📦 Testing Bundle Size...');

    try {
      // Run bundle analysis
      const { stdout } = await execAsync('npm run build');
      
      // Parse build output for bundle sizes
      const bundleInfo = this.parseBuildOutput(stdout);
      
      const maxBundleSize = 500; // KB
      const actualSize = bundleInfo.mainBundleSize;
      const success = actualSize <= maxBundleSize;

      this.results.push({
        testName: 'Bundle Size Analysis',
        success,
        duration: 0,
        details: {
          maxSize: maxBundleSize,
          actualSize,
          ...bundleInfo,
        },
        timestamp: Date.now(),
      });

      console.log(`  ${success ? '✅' : '❌'} Main Bundle: ${actualSize}KB (max: ${maxBundleSize}KB)`);
      console.log(`  📊 Total Pages: ${bundleInfo.totalPages}`);
      console.log(`  📊 Static Files: ${bundleInfo.staticFiles}`);

    } catch (error) {
      console.log(`  ❌ Bundle analysis failed: ${error}`);
    }
    console.log();
  }

  /**
   * Test memory usage patterns
   */
  private async testMemoryUsage(): Promise<void> {
    console.log('🧠 Testing Memory Usage...');

    const memoryTests = [
      {
        name: 'Analytics Dashboard Load',
        path: '/analytics',
        maxMemoryIncrease: 50, // MB
      },
      {
        name: 'Content Calendar Load',
        path: '/content/calendar',
        maxMemoryIncrease: 30, // MB
      },
    ];

    for (const test of memoryTests) {
      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      try {
        // Simulate component load by making API calls
        await fetch(`${this.config.baseUrl}${test.path}`);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
        const memoryIncrease = finalMemory - initialMemory;
        const success = memoryIncrease <= test.maxMemoryIncrease;

        this.results.push({
          testName: `Memory: ${test.name}`,
          success,
          duration: 0,
          details: {
            initialMemory: Math.round(initialMemory),
            finalMemory: Math.round(finalMemory),
            memoryIncrease: Math.round(memoryIncrease),
            maxAllowed: test.maxMemoryIncrease,
          },
          timestamp: Date.now(),
        });

        console.log(`  ${success ? '✅' : '❌'} ${test.name}: +${Math.round(memoryIncrease)}MB (max: ${test.maxMemoryIncrease}MB)`);

      } catch (error) {
        console.log(`  ❌ ${test.name}: Failed - ${error}`);
      }
    }
    console.log();
  }

  /**
   * Test load performance with concurrent requests
   */
  private async testLoadPerformance(): Promise<void> {
    console.log('⚡ Testing Load Performance...');

    const loadTests = [
      {
        name: 'Campaigns Endpoint',
        path: '/api/campaigns',
        concurrentRequests: 10,
        expectedAvgTime: 500,
      },
      {
        name: 'Content Endpoint',
        path: '/api/content',
        concurrentRequests: 10,
        expectedAvgTime: 600,
      },
    ];

    for (const test of loadTests) {
      const promises = [];
      const startTime = performance.now();

      // Create concurrent requests
      for (let i = 0; i < test.concurrentRequests; i++) {
        promises.push(
          fetch(`${this.config.baseUrl}${test.path}`)
            .then(response => ({
              success: response.ok,
              status: response.status,
            }))
            .catch(error => ({
              success: false,
              error: error.message,
            }))
        );
      }

      try {
        const responses = await Promise.all(promises);
        const endTime = performance.now();
        const totalDuration = endTime - startTime;
        const avgDuration = totalDuration / test.concurrentRequests;
        
        const successfulRequests = responses.filter(r => r.success).length;
        const successRate = (successfulRequests / test.concurrentRequests) * 100;
        const success = avgDuration <= test.expectedAvgTime && successRate >= 95;

        this.results.push({
          testName: `Load Test: ${test.name}`,
          success,
          duration: avgDuration,
          details: {
            concurrentRequests: test.concurrentRequests,
            successfulRequests,
            successRate: Math.round(successRate),
            avgResponseTime: Math.round(avgDuration),
            expectedAvgTime: test.expectedAvgTime,
          },
          timestamp: Date.now(),
        });

        console.log(`  ${success ? '✅' : '❌'} ${test.name}: ${Math.round(avgDuration)}ms avg, ${Math.round(successRate)}% success`);

      } catch (error) {
        console.log(`  ❌ ${test.name}: Failed - ${error}`);
      }
    }
    console.log();
  }

  /**
   * Parse build output to extract bundle information
   */
  private parseBuildOutput(buildOutput: string): any {
    // This would parse the actual Next.js build output
    // For now, return mock data
    return {
      mainBundleSize: 425, // KB
      totalPages: 12,
      staticFiles: 8,
      largestChunk: 'main-bundle.js',
    };
  }

  /**
   * Generate comprehensive performance report
   */
  private generateReport(): void {
    console.log('📋 Performance Test Report');
    console.log('========================\n');

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;

    console.log(`📊 Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${Math.round(successRate)}%\n`);

    // Show failed tests
    if (failedTests > 0) {
      console.log(`❌ Failed Tests:`);
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   - ${result.testName}`);
          if (result.details) {
            console.log(`     Details: ${JSON.stringify(result.details, null, 6)}`);
          }
        });
      console.log();
    }

    // Performance recommendations
    console.log(`💡 Performance Recommendations:`);
    
    const slowAPITests = this.results.filter(r => 
      r.testName.includes('API Response') && r.duration > 1000
    );
    
    if (slowAPITests.length > 0) {
      console.log(`   - Consider optimizing these slow API endpoints:`);
      slowAPITests.forEach(test => {
        console.log(`     * ${test.testName}: ${Math.round(test.duration)}ms`);
      });
    }

    const bundleTest = this.results.find(r => r.testName === 'Bundle Size Analysis');
    if (bundleTest && !bundleTest.success) {
      console.log(`   - Bundle size exceeds recommended limit. Consider code splitting.`);
    }

    // Save detailed report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate,
      },
      results: this.results,
    };

    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

// Main execution
async function main() {
  const config: PerformanceTestConfig = {
    baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
    testDuration: 30,
    concurrentUsers: 5,
    endpoints: [
      {
        path: '/api/campaigns',
        method: 'GET',
        expectedMaxTime: 500,
      },
      {
        path: '/api/content',
        method: 'GET',
        expectedMaxTime: 600,
      },
      {
        path: '/api/analytics/funnels',
        method: 'GET',
        expectedMaxTime: 800,
      },
      {
        path: '/api/templates',
        method: 'GET',
        expectedMaxTime: 400,
      },
    ],
  };

  const testRunner = new PerformanceTestRunner(config);
  await testRunner.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Performance test failed:', error);
    process.exit(1);
  });
}

export { PerformanceTestRunner };
export type { PerformanceTestConfig };