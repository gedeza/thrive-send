/**
 * Optimization Hook System - Main Entry Point
 * Integrates with existing codebase and provides unified API
 */

import { OptimizationHookSystem } from './optimization-hook-system';
import { OptimizationRuleEngine } from './optimization-rules';
import { CodeInterceptor } from './code-interceptor';
import { RealTimeFeedbackSystem } from './realtime-feedback';
import { OptimizationMetricsCollector } from './optimization-metrics';
import { HookConfigManager } from './hook-config-manager';

export class OptimizationHookManager {
  private static instance: OptimizationHookManager;
  private hookSystem: OptimizationHookSystem;
  private ruleEngine: OptimizationRuleEngine;
  private interceptor: CodeInterceptor;
  private feedbackSystem: RealTimeFeedbackSystem;
  private metricsCollector: OptimizationMetricsCollector;
  private configManager: HookConfigManager;
  private isInitialized: boolean = false;

  private constructor() {
    this.configManager = HookConfigManager.getInstance();
    this.ruleEngine = OptimizationRuleEngine.getInstance();
    this.metricsCollector = OptimizationMetricsCollector.getInstance();
    this.feedbackSystem = RealTimeFeedbackSystem.getInstance();
    this.interceptor = CodeInterceptor.getInstance();
    this.hookSystem = new OptimizationHookSystem({
      enabled: this.configManager.getConfig().global.enabled,
      rules: this.configManager.getActiveRules(),
      thresholds: this.configManager.getConfig().thresholds,
      realTimeMode: this.configManager.getConfig().feedback.enabled,
      reportingLevel: 'detailed'
    });
  }

  public static getInstance(): OptimizationHookManager {
    if (!OptimizationHookManager.instance) {
      OptimizationHookManager.instance = new OptimizationHookManager();
    }
    return OptimizationHookManager.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing Optimization Hook System...');

    try {
      // Initialize configuration
      await this.initializeConfig();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize components
      await this.initializeComponents();
      
      // Start interceptor if enabled
      if (this.configManager.getConfig().global.enabled) {
        this.interceptor.enable();
      }
      
      this.isInitialized = true;
      console.log('✅ Optimization Hook System initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Optimization Hook System:', error);
      throw error;
    }
  }

  private async initializeConfig(): Promise<void> {
    // Set environment-specific defaults
    const env = process.env.NODE_ENV || 'development';
    this.configManager.setEnvironment(env as any);
    
    // Validate configuration
    const validation = this.configManager.validateConfig();
    if (!validation.valid) {
      console.warn('⚠️ Configuration validation failed:', validation.errors);
    }
  }

  private setupEventListeners(): void {
    // Config change listeners
    this.configManager.on('config:updated', (data) => {
      this.handleConfigUpdate(data);
    });
    
    // Feedback system listeners
    this.feedbackSystem.on('message:added', (message) => {
      this.metricsCollector.recordFeedbackMessage(message);
    });
    
    // Interceptor listeners
    this.interceptor.on?.('interception:complete', (result) => {
      this.handleInterceptionComplete(result);
    });
  }

  private async initializeComponents(): Promise<void> {
    // Initialize feedback system with config
    const feedbackConfig = this.configManager.getConfig().feedback;
    this.feedbackSystem.updateConfig(feedbackConfig);
    
    // Initialize interceptor with config
    const interceptorConfig = this.configManager.getConfig().interceptor;
    this.interceptor.updateConfig(interceptorConfig);
    
    // Load custom rules into rule engine
    const customRules = this.configManager.getConfig().rules.customRules;
    customRules.forEach(rule => {
      this.ruleEngine.addCustomRule(rule);
    });
  }

  private handleConfigUpdate(data: any): void {
    console.log('🔄 Configuration updated, reloading components...');
    
    // Update hook system
    this.hookSystem.updateConfig({
      enabled: data.new.global.enabled,
      rules: this.configManager.getActiveRules(),
      thresholds: data.new.thresholds,
      realTimeMode: data.new.feedback.enabled,
      reportingLevel: 'detailed'
    });
    
    // Update interceptor
    this.interceptor.updateConfig(data.new.interceptor);
    
    // Update feedback system
    this.feedbackSystem.updateConfig(data.new.feedback);
    
    // Enable/disable system
    if (data.new.global.enabled) {
      this.interceptor.enable();
    } else {
      this.interceptor.disable();
    }
  }

  private handleInterceptionComplete(result: any): void {
    // Record metrics
    this.metricsCollector.recordSnapshot(
      result.filePath,
      result.metrics,
      result.results,
      result.processingTime,
      result.codeSize || 0,
      result.complexity || 0
    );
    
    // Process feedback
    this.feedbackSystem.processFeedback(result.filePath, result);
  }

  // Public API
  public async optimizeCode(code: string, filePath: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const context = await this.buildCodeContext(filePath, code);
    return this.hookSystem.interceptCodeGeneration(code, context);
  }

  public async analyzeFile(filePath: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const fs = require('fs');
    const code = fs.readFileSync(filePath, 'utf8');
    return this.optimizeCode(code, filePath);
  }

  public async analyzeProject(projectPath: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const glob = require('glob');
    const files = glob.sync('**/*.{ts,tsx,js,jsx}', { 
      cwd: projectPath,
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    });
    
    const results = [];
    for (const file of files) {
      const fullPath = require('path').join(projectPath, file);
      const result = await this.analyzeFile(fullPath);
      results.push({ file, ...result });
    }
    
    return results;
  }

  public generateReport(timeRange?: { start: number; end: number }): any {
    return this.metricsCollector.generateReport(timeRange);
  }

  public getMetrics(): any {
    return {
      collector: this.metricsCollector.getSnapshots(),
      interceptor: this.interceptor.getMetrics(),
      feedback: this.feedbackSystem.getStatistics(),
      config: this.configManager.getConfigStats()
    };
  }

  public getConfig(): any {
    return this.configManager.getConfig();
  }

  public updateConfig(updates: any): void {
    this.configManager.updateConfig(updates);
  }

  public applyTemplate(templateName: string): void {
    this.configManager.applyTemplate(templateName);
  }

  public getTemplates(): any[] {
    return this.configManager.getTemplates();
  }

  public enableRule(ruleId: string): void {
    this.configManager.enableRule(ruleId);
  }

  public disableRule(ruleId: string): void {
    this.configManager.disableRule(ruleId);
  }

  public addCustomRule(rule: any): void {
    this.ruleEngine.addCustomRule(rule);
    this.configManager.addCustomRule(rule);
  }

  public enable(): void {
    this.configManager.enable();
  }

  public disable(): void {
    this.configManager.disable();
  }

  public reset(): void {
    this.metricsCollector.reset();
    this.feedbackSystem.clearMessages();
    this.configManager.resetConfig();
  }

  private async buildCodeContext(filePath: string, code: string): Promise<any> {
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
    const ext = filePath.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript'
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
}

// Export main interface
export const optimizationHooks = OptimizationHookManager.getInstance();

// Export all components for direct access
export {
  OptimizationHookSystem,
  OptimizationRuleEngine,
  CodeInterceptor,
  RealTimeFeedbackSystem,
  OptimizationMetricsCollector,
  HookConfigManager
};

// Export types
export type {
  OptimizationRule,
  CodeContext,
  OptimizationResult,
  InterceptionResult,
  OverallMetrics
} from './optimization-hook-system';

export type {
  InterceptorConfig
} from './code-interceptor';

export type {
  FeedbackConfig,
  FeedbackMessage
} from './realtime-feedback';

export type {
  MetricsSnapshot,
  OptimizationReport
} from './optimization-metrics';

export type {
  HookSystemConfig,
  ConfigTemplate
} from './hook-config-manager';

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  optimizationHooks.initialize().catch(console.error);
}