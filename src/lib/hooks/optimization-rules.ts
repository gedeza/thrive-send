/**
 * Optimization Rules Engine
 * Comprehensive rule set for code optimization enforcement
 */

import { OptimizationRule, CodeContext, OptimizationResult } from './optimization-hook-system';

export class OptimizationRuleEngine {
  private static instance: OptimizationRuleEngine;
  private rules: Map<string, OptimizationRule> = new Map();

  private constructor() {
    this.initializeRules();
  }

  public static getInstance(): OptimizationRuleEngine {
    if (!OptimizationRuleEngine.instance) {
      OptimizationRuleEngine.instance = new OptimizationRuleEngine();
    }
    return OptimizationRuleEngine.instance;
  }

  private initializeRules(): void {
    // Performance Rules
    this.registerRule(this.createPerformanceRules());
    
    // Security Rules
    this.registerRule(this.createSecurityRules());
    
    // Maintainability Rules
    this.registerRule(this.createMaintainabilityRules());
    
    // Cost Optimization Rules
    this.registerRule(this.createCostOptimizationRules());
  }

  private registerRule(rules: OptimizationRule[]): void {
    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  private createPerformanceRules(): OptimizationRule[] {
    return [
      {
        id: 'perf-001',
        name: 'Avoid N+1 Query Pattern',
        category: 'performance',
        severity: 'warning',
        priority: 90,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const hasLoop = /\b(for|while|forEach)\b/.test(code);
          const hasQuery = /\b(findMany|findFirst|query)\b/.test(code);
          const hasAwait = /\bawait\b/.test(code);
          
          const isNPlusOne = hasLoop && hasQuery && hasAwait;
          
          return {
            passed: !isNPlusOne,
            message: isNPlusOne ? 'Potential N+1 query pattern detected' : 'No N+1 pattern found',
            suggestions: isNPlusOne ? [
              'Use batch queries or includes to fetch related data',
              'Consider using findMany with proper where clauses',
              'Implement data loader pattern for GraphQL'
            ] : [],
            metrics: {
              performance: isNPlusOne ? 30 : 90,
              maintainability: 70,
              security: 80,
              cost: isNPlusOne ? 40 : 85
            },
            autofix: isNPlusOne ? this.generateNPlusOneAutofix(code) : undefined
          };
        },
        autofix: this.generateNPlusOneAutofix.bind(this)
      },

      {
        id: 'perf-002',
        name: 'React Re-render Optimization',
        category: 'performance',
        severity: 'warning',
        priority: 85,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const hasUseState = /useState/.test(code);
          const hasUseCallback = /useCallback/.test(code);
          const hasUseMemo = /useMemo/.test(code);
          const hasInlineProps = /\w+\s*=\s*\{[^}]*\}/.test(code);
          
          const needsOptimization = hasUseState && !hasUseCallback && hasInlineProps;
          
          return {
            passed: !needsOptimization,
            message: needsOptimization ? 'Component may have unnecessary re-renders' : 'Component render optimization looks good',
            suggestions: needsOptimization ? [
              'Wrap event handlers with useCallback',
              'Memoize expensive calculations with useMemo',
              'Move static objects outside component or use useMemo'
            ] : [],
            metrics: {
              performance: needsOptimization ? 40 : 85,
              maintainability: 75,
              security: 80,
              cost: needsOptimization ? 50 : 80
            }
          };
        }
      },

      {
        id: 'perf-003',
        name: 'Bundle Size Optimization',
        category: 'performance',
        severity: 'info',
        priority: 70,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const hasLargeLibrary = context.imports.some(imp => 
            ['lodash', 'moment', 'antd'].includes(imp)
          );
          const hasDefaultImport = /import\s+\w+\s+from/.test(code);
          
          const needsOptimization = hasLargeLibrary && hasDefaultImport;
          
          return {
            passed: !needsOptimization,
            message: needsOptimization ? 'Bundle size can be optimized' : 'Bundle imports look optimized',
            suggestions: needsOptimization ? [
              'Use named imports instead of default imports',
              'Consider tree-shaking compatible alternatives',
              'Implement code splitting for large dependencies'
            ] : [],
            metrics: {
              performance: needsOptimization ? 50 : 80,
              maintainability: 70,
              security: 80,
              cost: needsOptimization ? 45 : 85
            }
          };
        }
      }
    ];
  }

  private createSecurityRules(): OptimizationRule[] {
    return [
      {
        id: 'sec-001',
        name: 'Input Validation Required',
        category: 'security',
        severity: 'error',
        priority: 95,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const hasRequestBody = /req\.body/.test(code);
          const hasValidation = /validate|schema|zod|joi/.test(code);
          
          const needsValidation = hasRequestBody && !hasValidation;
          
          return {
            passed: !needsValidation,
            message: needsValidation ? 'Request body requires validation' : 'Input validation present',
            suggestions: needsValidation ? [
              'Add Zod schema validation for request body',
              'Implement input sanitization',
              'Use middleware for validation'
            ] : [],
            metrics: {
              performance: 75,
              maintainability: 80,
              security: needsValidation ? 20 : 90,
              cost: 70
            }
          };
        }
      },

      {
        id: 'sec-002',
        name: 'Authentication Check',
        category: 'security',
        severity: 'error',
        priority: 98,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const isApiRoute = context.filePath.includes('/api/');
          const hasAuth = /auth|authenticate|user|session/.test(code);
          const isPublicRoute = /public|health|status/.test(context.filePath);
          
          const needsAuth = isApiRoute && !hasAuth && !isPublicRoute;
          
          return {
            passed: !needsAuth,
            message: needsAuth ? 'API route requires authentication' : 'Authentication properly implemented',
            suggestions: needsAuth ? [
              'Add authentication middleware',
              'Implement JWT token verification',
              'Use Clerk auth helper functions'
            ] : [],
            metrics: {
              performance: 80,
              maintainability: 75,
              security: needsAuth ? 10 : 95,
              cost: 75
            }
          };
        }
      },

      {
        id: 'sec-003',
        name: 'SQL Injection Prevention',
        category: 'security',
        severity: 'error',
        priority: 92,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const hasRawQuery = /\$\{.*\}/.test(code) && /query|execute|raw/.test(code);
          const hasParameterizedQuery = /\$\d+|\?/.test(code);
          
          const vulnerable = hasRawQuery && !hasParameterizedQuery;
          
          return {
            passed: !vulnerable,
            message: vulnerable ? 'Potential SQL injection vulnerability' : 'SQL queries properly parameterized',
            suggestions: vulnerable ? [
              'Use parameterized queries',
              'Use Prisma ORM instead of raw queries',
              'Sanitize all user inputs'
            ] : [],
            metrics: {
              performance: 80,
              maintainability: 70,
              security: vulnerable ? 15 : 90,
              cost: 75
            }
          };
        }
      }
    ];
  }

  private createMaintainabilityRules(): OptimizationRule[] {
    return [
      {
        id: 'maint-001',
        name: 'Function Complexity',
        category: 'maintainability',
        severity: 'warning',
        priority: 75,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const complexity = context.performance.complexity;
          const isComplex = complexity > 10;
          
          return {
            passed: !isComplex,
            message: isComplex ? `Function complexity (${complexity}) exceeds threshold (10)` : 'Function complexity acceptable',
            suggestions: isComplex ? [
              'Break down function into smaller functions',
              'Extract common logic into utilities',
              'Consider using strategy pattern'
            ] : [],
            metrics: {
              performance: isComplex ? 60 : 85,
              maintainability: isComplex ? 30 : 90,
              security: 80,
              cost: isComplex ? 55 : 80
            }
          };
        }
      },

      {
        id: 'maint-002',
        name: 'Type Safety',
        category: 'maintainability',
        severity: 'warning',
        priority: 80,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const hasAnyType = /:\s*any\b/.test(code);
          const hasImplicitAny = /\w+\s*=/.test(code) && !/:\s*\w+/.test(code);
          
          const needsTypes = hasAnyType || hasImplicitAny;
          
          return {
            passed: !needsTypes,
            message: needsTypes ? 'Type safety can be improved' : 'Type safety looks good',
            suggestions: needsTypes ? [
              'Replace "any" with specific types',
              'Add type annotations to variables',
              'Use TypeScript strict mode'
            ] : [],
            metrics: {
              performance: 75,
              maintainability: needsTypes ? 40 : 85,
              security: needsTypes ? 60 : 80,
              cost: needsTypes ? 50 : 80
            }
          };
        }
      },

      {
        id: 'maint-003',
        name: 'Code Duplication',
        category: 'maintainability',
        severity: 'info',
        priority: 65,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const lines = code.split('\n');
          const duplicateLines = this.findDuplicateLines(lines);
          const hasDuplication = duplicateLines.length > 3;
          
          return {
            passed: !hasDuplication,
            message: hasDuplication ? `Found ${duplicateLines.length} duplicate lines` : 'No significant duplication found',
            suggestions: hasDuplication ? [
              'Extract common code into utility functions',
              'Create reusable components',
              'Use constants for repeated values'
            ] : [],
            metrics: {
              performance: 75,
              maintainability: hasDuplication ? 45 : 80,
              security: 80,
              cost: hasDuplication ? 50 : 80
            }
          };
        }
      }
    ];
  }

  private createCostOptimizationRules(): OptimizationRule[] {
    return [
      {
        id: 'cost-001',
        name: 'Database Query Optimization',
        category: 'cost',
        severity: 'warning',
        priority: 80,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const hasSelectAll = /SELECT\s+\*/.test(code);
          const hasUnindexedQuery = /WHERE\s+\w+\s*=/.test(code) && !/INDEX/.test(code);
          
          const needsOptimization = hasSelectAll || hasUnindexedQuery;
          
          return {
            passed: !needsOptimization,
            message: needsOptimization ? 'Database queries can be optimized for cost' : 'Database queries look cost-effective',
            suggestions: needsOptimization ? [
              'Select only needed columns',
              'Add database indexes for WHERE clauses',
              'Consider query result caching'
            ] : [],
            metrics: {
              performance: needsOptimization ? 45 : 85,
              maintainability: 70,
              security: 80,
              cost: needsOptimization ? 35 : 90
            }
          };
        }
      },

      {
        id: 'cost-002',
        name: 'API Call Optimization',
        category: 'cost',
        severity: 'info',
        priority: 70,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const hasApiCall = /fetch|axios|api/.test(code);
          const hasLoopWithApi = /\b(for|while|forEach)\b/.test(code) && hasApiCall;
          
          const needsOptimization = hasLoopWithApi;
          
          return {
            passed: !needsOptimization,
            message: needsOptimization ? 'API calls in loops can be expensive' : 'API usage looks cost-efficient',
            suggestions: needsOptimization ? [
              'Batch API calls where possible',
              'Implement request caching',
              'Use pagination for large datasets'
            ] : [],
            metrics: {
              performance: needsOptimization ? 40 : 80,
              maintainability: 75,
              security: 80,
              cost: needsOptimization ? 30 : 85
            }
          };
        }
      },

      {
        id: 'cost-003',
        name: 'Memory Usage Optimization',
        category: 'cost',
        severity: 'warning',
        priority: 75,
        check: (code: string, context: CodeContext): OptimizationResult => {
          const memoryUsage = context.performance.memoryUsage;
          const isHighMemory = memoryUsage > 500;
          
          return {
            passed: !isHighMemory,
            message: isHighMemory ? `High memory usage estimated (${memoryUsage}MB)` : 'Memory usage looks reasonable',
            suggestions: isHighMemory ? [
              'Implement lazy loading for large datasets',
              'Use streaming for file operations',
              'Consider pagination for large collections'
            ] : [],
            metrics: {
              performance: isHighMemory ? 50 : 85,
              maintainability: 75,
              security: 80,
              cost: isHighMemory ? 40 : 85
            }
          };
        }
      }
    ];
  }

  private generateNPlusOneAutofix(code: string): string {
    // Simple autofix for N+1 pattern
    if (code.includes('forEach') && code.includes('await')) {
      return code.replace(
        /(\w+)\.forEach\(async\s*\(\s*(\w+)\s*\)\s*=>\s*\{/g,
        'const $2Results = await Promise.all($1.map(async ($2) => {'
      ).replace(/\}\)/g, '}))');
    }
    return code;
  }

  private findDuplicateLines(lines: string[]): string[] {
    const lineMap = new Map<string, number>();
    const duplicates: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 10) {
        const count = lineMap.get(trimmed) || 0;
        lineMap.set(trimmed, count + 1);
        if (count === 1) {
          duplicates.push(trimmed);
        }
      }
    });
    
    return duplicates;
  }

  public getAllRules(): OptimizationRule[] {
    return Array.from(this.rules.values());
  }

  public getRule(id: string): OptimizationRule | undefined {
    return this.rules.get(id);
  }

  public addCustomRule(rule: OptimizationRule): void {
    this.rules.set(rule.id, rule);
  }

  public removeRule(id: string): boolean {
    return this.rules.delete(id);
  }

  public getRulesByCategory(category: string): OptimizationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.category === category);
  }

  public getRulesBySeverity(severity: string): OptimizationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.severity === severity);
  }
}