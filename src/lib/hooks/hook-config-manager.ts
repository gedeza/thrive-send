/**
 * Hook Configuration Manager
 * Centralized configuration management for optimization hooks
 */

import { OptimizationRule } from './optimization-hook-system';
import { InterceptorConfig } from './code-interceptor';
import { FeedbackConfig } from './realtime-feedback';
import { OptimizationRuleEngine } from './optimization-rules';

export interface HookSystemConfig {
  global: {
    enabled: boolean;
    environment: 'development' | 'production' | 'testing';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    persistenceEnabled: boolean;
    telemetryEnabled: boolean;
  };
  interceptor: InterceptorConfig;
  feedback: FeedbackConfig;
  rules: {
    enabled: string[];
    disabled: string[];
    customRules: OptimizationRule[];
    categoryWeights: {
      performance: number;
      security: number;
      maintainability: number;
      cost: number;
    };
  };
  thresholds: {
    performance: number;
    security: number;
    maintainability: number;
    cost: number;
    overallScore: number;
  };
  automation: {
    autofix: boolean;
    autofixRules: string[];
    blockOnSeverity: ('error' | 'warning' | 'info')[];
    scheduleOptimization: boolean;
    optimizationInterval: number;
  };
  integration: {
    vscode: boolean;
    git: boolean;
    ci: boolean;
    webhook: string | null;
  };
}

export interface ConfigTemplate {
  name: string;
  description: string;
  config: Partial<HookSystemConfig>;
}

export class HookConfigManager {
  private static instance: HookConfigManager;
  private config: HookSystemConfig;
  private configPath: string;
  private watchers: Map<string, Function[]> = new Map();
  private templates: ConfigTemplate[] = [];

  private constructor() {
    this.configPath = this.getConfigPath();
    this.config = this.loadDefaultConfig();
    this.initializeTemplates();
    this.loadConfig();
  }

  public static getInstance(): HookConfigManager {
    if (!HookConfigManager.instance) {
      HookConfigManager.instance = new HookConfigManager();
    }
    return HookConfigManager.instance;
  }

  private getConfigPath(): string {
    const os = require('os');
    const path = require('path');
    return path.join(os.homedir(), '.thrive-send', 'optimization-hooks.json');
  }

  private loadDefaultConfig(): HookSystemConfig {
    return {
      global: {
        enabled: true,
        environment: 'development',
        logLevel: 'info',
        persistenceEnabled: true,
        telemetryEnabled: false
      },
      interceptor: {
        enabled: true,
        autofix: false,
        realTimeNotifications: true,
        blockOnSeverity: ['error'],
        whitelistPatterns: [],
        blacklistPatterns: ['node_modules/', '.git/', 'dist/', 'build/'],
        performanceThreshold: 100
      },
      feedback: {
        enabled: true,
        displayMode: 'both',
        severityLevels: {
          error: true,
          warning: true,
          info: true
        },
        thresholds: {
          performance: 70,
          security: 80,
          maintainability: 70,
          cost: 75
        },
        animations: true,
        sound: false,
        persistence: true
      },
      rules: {
        enabled: [],
        disabled: [],
        customRules: [],
        categoryWeights: {
          performance: 0.3,
          security: 0.25,
          maintainability: 0.25,
          cost: 0.2
        }
      },
      thresholds: {
        performance: 70,
        security: 80,
        maintainability: 70,
        cost: 75,
        overallScore: 70
      },
      automation: {
        autofix: false,
        autofixRules: ['perf-001', 'maint-002'],
        blockOnSeverity: ['error'],
        scheduleOptimization: false,
        optimizationInterval: 3600000 // 1 hour
      },
      integration: {
        vscode: true,
        git: true,
        ci: false,
        webhook: null
      }
    };
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        name: 'strict',
        description: 'Strict optimization with aggressive rules',
        config: {
          automation: {
            autofix: true,
            blockOnSeverity: ['error', 'warning'],
            scheduleOptimization: true,
            optimizationInterval: 1800000 // 30 minutes
          },
          thresholds: {
            performance: 80,
            security: 90,
            maintainability: 80,
            cost: 80,
            overallScore: 80
          }
        }
      },
      {
        name: 'development',
        description: 'Development-friendly configuration',
        config: {
          interceptor: {
            autofix: true,
            realTimeNotifications: true,
            blockOnSeverity: ['error']
          },
          feedback: {
            displayMode: 'console',
            sound: false,
            animations: true
          }
        }
      },
      {
        name: 'production',
        description: 'Production-ready configuration',
        config: {
          global: {
            environment: 'production',
            logLevel: 'warn',
            telemetryEnabled: true
          },
          interceptor: {
            autofix: false,
            realTimeNotifications: false,
            blockOnSeverity: ['error']
          },
          feedback: {
            displayMode: 'notification',
            sound: false,
            animations: false
          }
        }
      },
      {
        name: 'security-focused',
        description: 'Security-focused optimization',
        config: {
          rules: {
            categoryWeights: {
              performance: 0.2,
              security: 0.4,
              maintainability: 0.2,
              cost: 0.2
            }
          },
          thresholds: {
            performance: 60,
            security: 95,
            maintainability: 60,
            cost: 60,
            overallScore: 75
          }
        }
      },
      {
        name: 'performance-focused',
        description: 'Performance-focused optimization',
        config: {
          rules: {
            categoryWeights: {
              performance: 0.5,
              security: 0.2,
              maintainability: 0.15,
              cost: 0.15
            }
          },
          thresholds: {
            performance: 85,
            security: 70,
            maintainability: 60,
            cost: 60,
            overallScore: 75
          }
        }
      }
    ];
  }

  private loadConfig(): void {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        const loadedConfig = JSON.parse(configData);
        this.config = this.mergeConfigs(this.config, loadedConfig);
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
    }
  }

  private mergeConfigs(defaultConfig: HookSystemConfig, userConfig: any): HookSystemConfig {
    const merged = { ...defaultConfig };
    
    Object.keys(userConfig).forEach(key => {
      if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
        merged[key] = { ...merged[key], ...userConfig[key] };
      } else {
        merged[key] = userConfig[key];
      }
    });
    
    return merged;
  }

  private saveConfig(): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const configDir = path.dirname(this.configPath);
      
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      this.emit('config:saved', this.config);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  // Public API
  public getConfig(): HookSystemConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  public updateConfig(updates: Partial<HookSystemConfig>): void {
    const oldConfig = this.getConfig();
    this.config = this.mergeConfigs(this.config, updates);
    this.saveConfig();
    this.emit('config:updated', { old: oldConfig, new: this.config });
  }

  public resetConfig(): void {
    this.config = this.loadDefaultConfig();
    this.saveConfig();
    this.emit('config:reset', this.config);
  }

  public applyTemplate(templateName: string): void {
    const template = this.templates.find(t => t.name === templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    this.updateConfig(template.config);
    this.emit('template:applied', { templateName, config: this.config });
  }

  public getTemplates(): ConfigTemplate[] {
    return [...this.templates];
  }

  public addCustomTemplate(template: ConfigTemplate): void {
    this.templates.push(template);
    this.emit('template:added', template);
  }

  public removeCustomTemplate(templateName: string): void {
    const index = this.templates.findIndex(t => t.name === templateName);
    if (index > -1) {
      this.templates.splice(index, 1);
      this.emit('template:removed', templateName);
    }
  }

  // Rule management
  public enableRule(ruleId: string): void {
    if (!this.config.rules.enabled.includes(ruleId)) {
      this.config.rules.enabled.push(ruleId);
    }
    this.config.rules.disabled = this.config.rules.disabled.filter(id => id !== ruleId);
    this.saveConfig();
    this.emit('rule:enabled', ruleId);
  }

  public disableRule(ruleId: string): void {
    if (!this.config.rules.disabled.includes(ruleId)) {
      this.config.rules.disabled.push(ruleId);
    }
    this.config.rules.enabled = this.config.rules.enabled.filter(id => id !== ruleId);
    this.saveConfig();
    this.emit('rule:disabled', ruleId);
  }

  public addCustomRule(rule: OptimizationRule): void {
    this.config.rules.customRules.push(rule);
    this.saveConfig();
    this.emit('rule:added', rule);
  }

  public removeCustomRule(ruleId: string): void {
    this.config.rules.customRules = this.config.rules.customRules.filter(r => r.id !== ruleId);
    this.saveConfig();
    this.emit('rule:removed', ruleId);
  }

  public getActiveRules(): OptimizationRule[] {
    const ruleEngine = OptimizationRuleEngine.getInstance();
    const allRules = ruleEngine.getAllRules();
    
    return allRules.filter(rule => {
      if (this.config.rules.disabled.includes(rule.id)) return false;
      if (this.config.rules.enabled.length > 0) {
        return this.config.rules.enabled.includes(rule.id);
      }
      return true;
    }).concat(this.config.rules.customRules);
  }

  // Environment-specific configurations
  public setEnvironment(environment: 'development' | 'production' | 'testing'): void {
    this.config.global.environment = environment;
    
    // Apply environment-specific defaults
    switch (environment) {
      case 'development':
        this.updateConfig({
          interceptor: { autofix: true, realTimeNotifications: true },
          feedback: { displayMode: 'console', sound: false }
        });
        break;
      case 'production':
        this.updateConfig({
          interceptor: { autofix: false, realTimeNotifications: false },
          feedback: { displayMode: 'notification', sound: false, animations: false }
        });
        break;
      case 'testing':
        this.updateConfig({
          interceptor: { autofix: false, realTimeNotifications: false },
          feedback: { displayMode: 'console', sound: false, animations: false }
        });
        break;
    }
    
    this.emit('environment:changed', environment);
  }

  // Validation
  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate thresholds
    Object.entries(this.config.thresholds).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        errors.push(`Invalid threshold for ${key}: must be between 0 and 100`);
      }
    });
    
    // Validate category weights
    const weightSum = Object.values(this.config.rules.categoryWeights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(weightSum - 1) > 0.01) {
      errors.push('Category weights must sum to 1.0');
    }
    
    // Validate custom rules
    this.config.rules.customRules.forEach(rule => {
      if (!rule.id || !rule.name || !rule.check) {
        errors.push(`Invalid custom rule: ${rule.id || 'unknown'}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }

  // Import/Export
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  public importConfig(configString: string): void {
    try {
      const importedConfig = JSON.parse(configString);
      const validation = this.validateConfig();
      
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }
      
      this.config = this.mergeConfigs(this.loadDefaultConfig(), importedConfig);
      this.saveConfig();
      this.emit('config:imported', this.config);
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error.message}`);
    }
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.watchers.has(event)) {
      this.watchers.set(event, []);
    }
    this.watchers.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.watchers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.watchers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Statistics
  public getConfigStats(): {
    activeRules: number;
    customRules: number;
    disabledRules: number;
    environment: string;
    lastModified: number;
  } {
    const fs = require('fs');
    let lastModified = Date.now();
    
    try {
      const stats = fs.statSync(this.configPath);
      lastModified = stats.mtime.getTime();
    } catch (error) {
      // File doesn't exist or can't be accessed
    }
    
    return {
      activeRules: this.getActiveRules().length,
      customRules: this.config.rules.customRules.length,
      disabledRules: this.config.rules.disabled.length,
      environment: this.config.global.environment,
      lastModified
    };
  }

  // Utilities
  public getConfigPath(): string {
    return this.configPath;
  }

  public isEnabled(): boolean {
    return this.config.global.enabled;
  }

  public enable(): void {
    this.config.global.enabled = true;
    this.saveConfig();
    this.emit('system:enabled');
  }

  public disable(): void {
    this.config.global.enabled = false;
    this.saveConfig();
    this.emit('system:disabled');
  }
}

// Export singleton
export const configManager = HookConfigManager.getInstance();