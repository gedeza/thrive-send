/**
 * Code Interception Middleware
 * Real-time code generation interception and optimization
 */

import { OptimizationHookSystem, CodeContext, InterceptionResult } from './optimization-hook-system';
import { OptimizationRuleEngine } from './optimization-rules';

export interface InterceptorConfig {
  enabled: boolean;
  autofix: boolean;
  realTimeNotifications: boolean;
  blockOnSeverity: ('error' | 'warning' | 'info')[];
  whitelistPatterns: string[];
  blacklistPatterns: string[];
  performanceThreshold: number;
}

export class CodeInterceptor {
  private static instance: CodeInterceptor;
  private hookSystem: OptimizationHookSystem;
  private ruleEngine: OptimizationRuleEngine;
  private config: InterceptorConfig;
  private originalFS: any;
  private isPatched: boolean = false;

  private constructor(config: InterceptorConfig) {
    this.config = config;
    this.ruleEngine = OptimizationRuleEngine.getInstance();
    this.hookSystem = new OptimizationHookSystem({
      enabled: config.enabled,
      rules: this.ruleEngine.getAllRules(),
      thresholds: {
        performance: 70,
        security: 80,
        maintainability: 70,
        cost: 75
      },
      realTimeMode: config.realTimeNotifications,
      reportingLevel: 'detailed'
    });
    
    if (config.enabled) {
      this.patchFileSystem();
    }
  }

  public static getInstance(config?: InterceptorConfig): CodeInterceptor {
    if (!CodeInterceptor.instance) {
      CodeInterceptor.instance = new CodeInterceptor(config || {
        enabled: true,
        autofix: false,
        realTimeNotifications: true,
        blockOnSeverity: ['error'],
        whitelistPatterns: [],
        blacklistPatterns: ['node_modules/', '.git/'],
        performanceThreshold: 100
      });
    }
    return CodeInterceptor.instance;
  }

  private patchFileSystem(): void {
    if (this.isPatched) return;
    
    const fs = require('fs');
    this.originalFS = {
      writeFile: fs.writeFile,
      writeFileSync: fs.writeFileSync,
      createWriteStream: fs.createWriteStream
    };

    // Patch writeFile
    fs.writeFile = this.interceptWriteFile.bind(this);
    fs.writeFileSync = this.interceptWriteFileSync.bind(this);
    
    // Patch createWriteStream
    fs.createWriteStream = this.interceptCreateWriteStream.bind(this);
    
    this.isPatched = true;
    console.log('🔧 Code interceptor activated');
  }

  private unpatchFileSystem(): void {
    if (!this.isPatched) return;
    
    const fs = require('fs');
    fs.writeFile = this.originalFS.writeFile;
    fs.writeFileSync = this.originalFS.writeFileSync;
    fs.createWriteStream = this.originalFS.createWriteStream;
    
    this.isPatched = false;
    console.log('🔧 Code interceptor deactivated');
  }

  private async interceptWriteFile(
    path: string,
    data: string,
    options: any,
    callback?: Function
  ): Promise<void> {
    try {
      const shouldIntercept = this.shouldInterceptFile(path);
      
      if (!shouldIntercept) {
        return this.originalFS.writeFile(path, data, options, callback);
      }

      const result = await this.processCodeInterception(path, data);
      
      if (this.shouldBlockWrite(result)) {
        const error = new Error(`Code optimization violations prevent write: ${result.recommendations.join(', ')}`);
        if (callback) callback(error);
        throw error;
      }

      const finalData = this.config.autofix ? result.code : data;
      return this.originalFS.writeFile(path, finalData, options, callback);
      
    } catch (error) {
      if (callback) callback(error);
      throw error;
    }
  }

  private interceptWriteFileSync(path: string, data: string, options?: any): void {
    const shouldIntercept = this.shouldInterceptFile(path);
    
    if (!shouldIntercept) {
      return this.originalFS.writeFileSync(path, data, options);
    }

    const result = this.processCodeInterceptionSync(path, data);
    
    if (this.shouldBlockWrite(result)) {
      throw new Error(`Code optimization violations prevent write: ${result.recommendations.join(', ')}`);
    }

    const finalData = this.config.autofix ? result.code : data;
    return this.originalFS.writeFileSync(path, finalData, options);
  }

  private interceptCreateWriteStream(path: string, options?: any): any {
    const shouldIntercept = this.shouldInterceptFile(path);
    
    if (!shouldIntercept) {
      return this.originalFS.createWriteStream(path, options);
    }

    const originalStream = this.originalFS.createWriteStream(path, options);
    return this.wrapWriteStream(originalStream, path);
  }

  private wrapWriteStream(stream: any, path: string): any {
    let buffer = '';
    
    const originalWrite = stream.write.bind(stream);
    stream.write = (chunk: any, encoding?: any, callback?: any) => {
      buffer += chunk.toString();
      
      // Process buffer when stream ends
      const originalEnd = stream.end.bind(stream);
      stream.end = (chunk?: any, encoding?: any, callback?: any) => {
        if (chunk) buffer += chunk.toString();
        
        const result = this.processCodeInterceptionSync(path, buffer);
        
        if (this.shouldBlockWrite(result)) {
          const error = new Error(`Code optimization violations prevent write: ${result.recommendations.join(', ')}`);
          stream.emit('error', error);
          return;
        }

        const finalData = this.config.autofix ? result.code : buffer;
        originalWrite(finalData);
        originalEnd(encoding, callback);
      };
      
      return originalWrite(chunk, encoding, callback);
    };
    
    return stream;
  }

  private shouldInterceptFile(path: string): boolean {
    if (!this.config.enabled) return false;
    
    // Check blacklist patterns
    if (this.config.blacklistPatterns.some(pattern => path.includes(pattern))) {
      return false;
    }
    
    // Check whitelist patterns (if any)
    if (this.config.whitelistPatterns.length > 0) {
      return this.config.whitelistPatterns.some(pattern => path.includes(pattern));
    }
    
    // Default: intercept code files
    return /\.(ts|tsx|js|jsx|py|java|cpp|c)$/i.test(path);
  }

  private async processCodeInterception(path: string, code: string): Promise<InterceptionResult> {
    const startTime = performance.now();
    
    try {
      const context = await this.buildCodeContext(path, code);
      const result = await this.hookSystem.interceptCodeGeneration(code, context);
      
      const processingTime = performance.now() - startTime;
      
      if (processingTime > this.config.performanceThreshold) {
        console.warn(`⚠️  Slow interception: ${path} took ${processingTime.toFixed(2)}ms`);
      }
      
      this.logInterceptionResult(path, result);
      
      return result;
    } catch (error) {
      console.error(`❌ Interception failed for ${path}:`, error);
      return {
        code,
        results: [],
        metrics: {
          performance: 0,
          maintainability: 0,
          security: 0,
          cost: 0,
          overallScore: 0
        },
        processingTime: performance.now() - startTime,
        recommendations: [`Interception failed: ${error.message}`]
      };
    }
  }

  private processCodeInterceptionSync(path: string, code: string): InterceptionResult {
    const startTime = performance.now();
    
    try {
      const context = this.buildCodeContextSync(path, code);
      const result = this.hookSystem.interceptCodeGeneration(code, context);
      
      const processingTime = performance.now() - startTime;
      
      if (processingTime > this.config.performanceThreshold) {
        console.warn(`⚠️  Slow interception: ${path} took ${processingTime.toFixed(2)}ms`);
      }
      
      this.logInterceptionResult(path, result);
      
      return result;
    } catch (error) {
      console.error(`❌ Interception failed for ${path}:`, error);
      return {
        code,
        results: [],
        metrics: {
          performance: 0,
          maintainability: 0,
          security: 0,
          cost: 0,
          overallScore: 0
        },
        processingTime: performance.now() - startTime,
        recommendations: [`Interception failed: ${error.message}`]
      };
    }
  }

  private shouldBlockWrite(result: InterceptionResult): boolean {
    if (!this.config.blockOnSeverity.length) return false;
    
    return result.results.some(r => 
      !r.passed && this.config.blockOnSeverity.includes(r.severity)
    );
  }

  private logInterceptionResult(path: string, result: InterceptionResult): void {
    if (!this.config.realTimeNotifications) return;
    
    const filename = path.split('/').pop();
    const score = result.metrics.overallScore;
    
    if (score < 50) {
      console.log(`🔴 ${filename}: Score ${score.toFixed(1)} - Critical issues found`);
    } else if (score < 70) {
      console.log(`🟡 ${filename}: Score ${score.toFixed(1)} - Needs optimization`);
    } else {
      console.log(`🟢 ${filename}: Score ${score.toFixed(1)} - Good quality`);
    }
    
    if (result.recommendations.length > 0) {
      console.log(`💡 Recommendations:`, result.recommendations.slice(0, 3));
    }
  }

  private async buildCodeContext(path: string, code: string): Promise<CodeContext> {
    return {
      filePath: path,
      language: this.detectLanguage(path),
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

  private buildCodeContextSync(path: string, code: string): CodeContext {
    return {
      filePath: path,
      language: this.detectLanguage(path),
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

  private detectLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };
    return map[ext || ''] || 'unknown';
  }

  private extractImports(code: string): string[] {
    const regex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  }

  private extractFunctions(code: string): string[] {
    const regex = /(?:function\s+|const\s+|let\s+|var\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]?\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*\{|function\s*\([^)]*\)\s*\{)/g;
    const functions: string[] = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
      functions.push(match[1]);
    }
    return functions;
  }

  private extractVariables(code: string): string[] {
    const regex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const variables: string[] = [];
    let match;
    while ((match = regex.exec(code)) !== null) {
      variables.push(match[1]);
    }
    return variables;
  }

  private extractDependencies(code: string): string[] {
    const imports = this.extractImports(code);
    return imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('/'));
  }

  private calculateComplexity(code: string): number {
    const keywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try', '&&', '||', '?'];
    let complexity = 1;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  private estimateMemoryUsage(code: string): number {
    const arrays = (code.match(/\[\s*\]/g) || []).length;
    const objects = (code.match(/\{\s*\}/g) || []).length;
    const strings = (code.match(/['"`]/g) || []).length / 2;
    
    return arrays * 100 + objects * 50 + strings * 10;
  }

  private estimateExecutionTime(code: string): number {
    const loops = (code.match(/\b(for|while)\b/g) || []).length;
    const calls = (code.match(/\w+\s*\(/g) || []).length;
    const complexity = this.calculateComplexity(code);
    
    return loops * 10 + calls * 2 + complexity * 1;
  }

  public enable(): void {
    this.config.enabled = true;
    if (!this.isPatched) {
      this.patchFileSystem();
    }
  }

  public disable(): void {
    this.config.enabled = false;
    this.unpatchFileSystem();
  }

  public updateConfig(newConfig: Partial<InterceptorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled && !this.isPatched) {
      this.patchFileSystem();
    } else if (!this.config.enabled && this.isPatched) {
      this.unpatchFileSystem();
    }
  }

  public getConfig(): InterceptorConfig {
    return { ...this.config };
  }

  public getMetrics(): any {
    return this.hookSystem.getMetrics();
  }

  public destroy(): void {
    this.disable();
    CodeInterceptor.instance = null as any;
  }
}

// Export singleton for easy access
export const codeInterceptor = CodeInterceptor.getInstance();