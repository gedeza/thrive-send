/**
 * Code Optimization Hook System
 * Intercepts code generation and provides real-time optimization feedback
 */

export interface OptimizationRule {
  id: string;
  name: string;
  category: 'performance' | 'security' | 'maintainability' | 'cost';
  severity: 'error' | 'warning' | 'info';
  priority: number;
  check: (code: string, context: CodeContext) => OptimizationResult;
  autofix?: (code: string) => string;
}

export interface CodeContext {
  filePath: string;
  language: string;
  imports: string[];
  functions: string[];
  variables: string[];
  dependencies: string[];
  performance: {
    complexity: number;
    memoryUsage: number;
    executionTime: number;
  };
}

export interface OptimizationResult {
  passed: boolean;
  message: string;
  suggestions: string[];
  metrics: {
    performance: number;
    maintainability: number;
    security: number;
    cost: number;
  };
  autofix?: string;
}

export interface HookConfig {
  enabled: boolean;
  rules: OptimizationRule[];
  thresholds: {
    performance: number;
    security: number;
    maintainability: number;
    cost: number;
  };
  realTimeMode: boolean;
  reportingLevel: 'minimal' | 'detailed' | 'comprehensive';
}

export class OptimizationHookSystem {
  private config: HookConfig;
  private rules: Map<string, OptimizationRule> = new Map();
  private interceptors: Map<string, Function[]> = new Map();
  private metrics: OptimizationMetrics;

  constructor(config: HookConfig) {
    this.config = config;
    this.metrics = new OptimizationMetrics();
    this.initializeRules();
    this.setupInterceptors();
  }

  private initializeRules(): void {
    this.config.rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  private setupInterceptors(): void {
    // File write interceptor
    this.registerInterceptor('file:write', this.interceptFileWrite.bind(this));
    
    // Component generation interceptor
    this.registerInterceptor('component:generate', this.interceptComponentGeneration.bind(this));
    
    // API route interceptor
    this.registerInterceptor('api:create', this.interceptApiCreation.bind(this));
    
    // Database query interceptor
    this.registerInterceptor('db:query', this.interceptDatabaseQuery.bind(this));
  }

  public registerInterceptor(event: string, handler: Function): void {
    if (!this.interceptors.has(event)) {
      this.interceptors.set(event, []);
    }
    this.interceptors.get(event)!.push(handler);
  }

  public async interceptCodeGeneration(
    code: string,
    context: CodeContext
  ): Promise<InterceptionResult> {
    const results: OptimizationResult[] = [];
    const startTime = performance.now();

    // Run all applicable rules
    for (const rule of this.rules.values()) {
      const result = rule.check(code, context);
      results.push(result);
      
      if (result.passed === false && rule.severity === 'error') {
        this.metrics.recordViolation(rule.id, rule.severity);
      }
    }

    const processingTime = performance.now() - startTime;
    this.metrics.recordProcessingTime(processingTime);

    return {
      code: this.applyOptimizations(code, results),
      results,
      metrics: this.calculateOverallMetrics(results),
      processingTime,
      recommendations: this.generateRecommendations(results)
    };
  }

  private async interceptFileWrite(filePath: string, content: string): Promise<string> {
    const context = await this.buildCodeContext(filePath, content);
    const result = await this.interceptCodeGeneration(content, context);
    
    if (this.config.realTimeMode) {
      this.provideFeedback(result);
    }
    
    return result.code;
  }

  private async interceptComponentGeneration(component: string): Promise<string> {
    const context = await this.buildCodeContext('component.tsx', component);
    const result = await this.interceptCodeGeneration(component, context);
    
    this.validateReactBestPractices(component, result);
    
    return result.code;
  }

  private async interceptApiCreation(apiCode: string): Promise<string> {
    const context = await this.buildCodeContext('api/route.ts', apiCode);
    const result = await this.interceptCodeGeneration(apiCode, context);
    
    this.validateApiSecurity(apiCode, result);
    
    return result.code;
  }

  private async interceptDatabaseQuery(query: string): Promise<string> {
    const context = await this.buildCodeContext('db/query.ts', query);
    const result = await this.interceptCodeGeneration(query, context);
    
    this.validateDatabasePerformance(query, result);
    
    return result.code;
  }

  private applyOptimizations(code: string, results: OptimizationResult[]): string {
    let optimizedCode = code;
    
    for (const result of results) {
      if (result.autofix && !result.passed) {
        optimizedCode = result.autofix;
      }
    }
    
    return optimizedCode;
  }

  private calculateOverallMetrics(results: OptimizationResult[]): OverallMetrics {
    const metrics = {
      performance: 0,
      maintainability: 0,
      security: 0,
      cost: 0,
      overallScore: 0
    };

    if (results.length === 0) return metrics;

    results.forEach(result => {
      metrics.performance += result.metrics.performance;
      metrics.maintainability += result.metrics.maintainability;
      metrics.security += result.metrics.security;
      metrics.cost += result.metrics.cost;
    });

    const count = results.length;
    metrics.performance /= count;
    metrics.maintainability /= count;
    metrics.security /= count;
    metrics.cost /= count;
    
    metrics.overallScore = (
      metrics.performance * 0.3 +
      metrics.maintainability * 0.25 +
      metrics.security * 0.25 +
      metrics.cost * 0.2
    );

    return metrics;
  }

  private generateRecommendations(results: OptimizationResult[]): string[] {
    const recommendations: string[] = [];
    
    results.forEach(result => {
      if (!result.passed) {
        recommendations.push(...result.suggestions);
      }
    });
    
    return [...new Set(recommendations)];
  }

  private provideFeedback(result: InterceptionResult): void {
    if (result.metrics.overallScore < this.config.thresholds.performance) {
      console.warn('🔥 Performance optimization needed:', result.recommendations);
    }
    
    if (result.metrics.security < this.config.thresholds.security) {
      console.error('🔒 Security vulnerabilities detected:', result.recommendations);
    }
    
    if (result.metrics.cost > this.config.thresholds.cost) {
      console.warn('💰 Cost optimization opportunities:', result.recommendations);
    }
  }

  private async buildCodeContext(filePath: string, code: string): Promise<CodeContext> {
    return {
      filePath,
      language: this.detectLanguage(filePath),
      imports: this.extractImports(code),
      functions: this.extractFunctions(code),
      variables: this.extractVariables(code),
      dependencies: this.extractDependencies(code),
      performance: {
        complexity: this.calculateComplexity(code),
        memoryUsage: this.estimateMemoryUsage(code),
        executionTime: this.estimateExecutionTime(code)
      }
    };
  }

  private detectLanguage(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };
    return languageMap[extension || ''] || 'unknown';
  }

  private extractImports(code: string): string[] {
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  }

  private extractFunctions(code: string): string[] {
    const functionRegex = /(?:function\s+|const\s+|let\s+|var\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]?\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*\{|function\s*\([^)]*\)\s*\{)/g;
    const functions: string[] = [];
    let match;
    while ((match = functionRegex.exec(code)) !== null) {
      functions.push(match[1]);
    }
    return functions;
  }

  private extractVariables(code: string): string[] {
    const varRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const variables: string[] = [];
    let match;
    while ((match = varRegex.exec(code)) !== null) {
      variables.push(match[1]);
    }
    return variables;
  }

  private extractDependencies(code: string): string[] {
    const imports = this.extractImports(code);
    return imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('/'));
  }

  private calculateComplexity(code: string): number {
    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||', '?'
    ];
    
    let complexity = 1;
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  private estimateMemoryUsage(code: string): number {
    const arrayCreations = (code.match(/\[\s*\]/g) || []).length;
    const objectCreations = (code.match(/\{\s*\}/g) || []).length;
    const stringCreations = (code.match(/['"`]/g) || []).length / 2;
    
    return arrayCreations * 100 + objectCreations * 50 + stringCreations * 10;
  }

  private estimateExecutionTime(code: string): number {
    const loops = (code.match(/\b(for|while)\b/g) || []).length;
    const funcCalls = (code.match(/\w+\s*\(/g) || []).length;
    const complexity = this.calculateComplexity(code);
    
    return loops * 10 + funcCalls * 2 + complexity * 1;
  }

  private validateReactBestPractices(component: string, result: InterceptionResult): void {
    // Add React-specific validations
    if (component.includes('useState') && !component.includes('useCallback')) {
      result.recommendations.push('Consider using useCallback for event handlers');
    }
    
    if (component.includes('useEffect') && !component.includes('dependencies')) {
      result.recommendations.push('Ensure useEffect has proper dependencies');
    }
  }

  private validateApiSecurity(apiCode: string, result: InterceptionResult): void {
    // Add API security validations
    if (!apiCode.includes('auth') && !apiCode.includes('authenticate')) {
      result.recommendations.push('Consider adding authentication middleware');
    }
    
    if (apiCode.includes('req.body') && !apiCode.includes('validate')) {
      result.recommendations.push('Add input validation for request body');
    }
  }

  private validateDatabasePerformance(query: string, result: InterceptionResult): void {
    // Add database performance validations
    if (query.includes('SELECT *')) {
      result.recommendations.push('Avoid SELECT * queries, specify needed columns');
    }
    
    if (query.includes('WHERE') && !query.includes('INDEX')) {
      result.recommendations.push('Consider adding database indexes for WHERE clauses');
    }
  }

  public getMetrics(): OptimizationMetrics {
    return this.metrics;
  }

  public updateConfig(newConfig: Partial<HookConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export interface InterceptionResult {
  code: string;
  results: OptimizationResult[];
  metrics: OverallMetrics;
  processingTime: number;
  recommendations: string[];
}

export interface OverallMetrics {
  performance: number;
  maintainability: number;
  security: number;
  cost: number;
  overallScore: number;
}

export class OptimizationMetrics {
  private violations: Map<string, number> = new Map();
  private processingTimes: number[] = [];
  private startTime: number = Date.now();

  recordViolation(ruleId: string, severity: string): void {
    const key = `${ruleId}:${severity}`;
    this.violations.set(key, (this.violations.get(key) || 0) + 1);
  }

  recordProcessingTime(time: number): void {
    this.processingTimes.push(time);
  }

  getViolationStats(): Record<string, number> {
    return Object.fromEntries(this.violations);
  }

  getPerformanceStats(): {
    avgProcessingTime: number;
    totalProcessingTime: number;
    operationCount: number;
  } {
    const total = this.processingTimes.reduce((sum, time) => sum + time, 0);
    return {
      avgProcessingTime: total / this.processingTimes.length || 0,
      totalProcessingTime: total,
      operationCount: this.processingTimes.length
    };
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  reset(): void {
    this.violations.clear();
    this.processingTimes = [];
    this.startTime = Date.now();
  }
}