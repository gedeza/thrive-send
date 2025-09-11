export interface PerformanceThresholds {
  excellent: {
    min: number;
    color: string;
    label: string;
  };
  good: {
    min: number;
    color: string;
    label: string;
  };
  average: {
    min: number;
    color: string;
    label: string;
  };
  poor: {
    min: number;
    color: string;
    label: string;
  };
}

export interface ContentTypeWeights {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRatio?: number;
}

export interface PerformanceConfig {
  thresholds: PerformanceThresholds;
  contentTypeWeights: {
    blog: ContentTypeWeights;
    social: ContentTypeWeights;
    email: ContentTypeWeights;
    video: ContentTypeWeights;
    default: ContentTypeWeights;
  };
  trendingThresholds: {
    minViews: number;
    minEngagement: number;
    timeWindowHours: number;
  };
}

// Default performance configuration
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  thresholds: {
    excellent: {
      min: 80,
      color: '#10B981', // green-500
      label: 'Excellent'
    },
    good: {
      min: 60,
      color: '#3B82F6', // blue-500
      label: 'Good'
    },
    average: {
      min: 40,
      color: '#F59E0B', // amber-500
      label: 'Average'
    },
    poor: {
      min: 0,
      color: '#EF4444', // red-500
      label: 'Poor'
    }
  },
  contentTypeWeights: {
    blog: {
      views: 0.4,
      likes: 0.2,
      shares: 0.3,
      comments: 0.1,
      engagementRatio: 2.0
    },
    social: {
      views: 0.3,
      likes: 0.3,
      shares: 0.2,
      comments: 0.2,
      engagementRatio: 3.0
    },
    email: {
      views: 0.5, // Open rate equivalent
      likes: 0.1,
      shares: 0.2, // Forward rate
      comments: 0.2, // Reply rate
      engagementRatio: 1.5
    },
    video: {
      views: 0.5,
      likes: 0.2,
      shares: 0.2,
      comments: 0.1,
      engagementRatio: 2.5
    },
    default: {
      views: 0.4,
      likes: 0.2,
      shares: 0.2,
      comments: 0.2,
      engagementRatio: 2.0
    }
  },
  trendingThresholds: {
    minViews: 100,
    minEngagement: 20,
    timeWindowHours: 24
  }
};

// Environment-specific configuration overrides
const getEnvironmentConfig = (): Partial<PerformanceConfig> => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'development':
      return {
        trendingThresholds: {
          minViews: 10, // Lower thresholds for dev
          minEngagement: 5,
          timeWindowHours: 24
        }
      };
    case 'production':
      return {
        trendingThresholds: {
          minViews: 500, // Higher thresholds for production
          minEngagement: 50,
          timeWindowHours: 24
        }
      };
    default:
      return {};
  }
};

// Custom configuration loader
export const loadPerformanceConfig = (): PerformanceConfig => {
  const envConfig = getEnvironmentConfig();
  
  // Merge default config with environment overrides
  return {
    ...DEFAULT_PERFORMANCE_CONFIG,
    ...envConfig,
    thresholds: {
      ...DEFAULT_PERFORMANCE_CONFIG.thresholds,
      ...(envConfig.thresholds || {})
    },
    contentTypeWeights: {
      ...DEFAULT_PERFORMANCE_CONFIG.contentTypeWeights,
      ...(envConfig.contentTypeWeights || {})
    },
    trendingThresholds: {
      ...DEFAULT_PERFORMANCE_CONFIG.trendingThresholds,
      ...(envConfig.trendingThresholds || {})
    }
  };
};

// Utility functions for working with performance thresholds
export const getPerformanceLevel = (score: number, config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG) => {
  if (score >= config.thresholds.excellent.min) return 'excellent';
  if (score >= config.thresholds.good.min) return 'good';
  if (score >= config.thresholds.average.min) return 'average';
  return 'poor';
};

export const getPerformanceColor = (score: number, config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG) => {
  const level = getPerformanceLevel(score, config);
  return config.thresholds[level].color;
};

export const getPerformanceLabel = (score: number, config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG) => {
  const level = getPerformanceLevel(score, config);
  return config.thresholds[level].label;
};

export const getContentTypeWeights = (contentType: string, config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG) => {
  const normalizedType = contentType.toLowerCase() as keyof typeof config.contentTypeWeights;
  return config.contentTypeWeights[normalizedType] || config.contentTypeWeights.default;
};

// Configuration validation
export const validatePerformanceConfig = (config: PerformanceConfig): boolean => {
  try {
    // Validate threshold structure
    const requiredLevels = ['excellent', 'good', 'average', 'poor'];
    for (const level of requiredLevels) {
      if (!config.thresholds[level as keyof PerformanceThresholds]) {
        console.error(`Missing threshold level: ${level}`);
        return false;
      }
    }

    // Validate weights sum to 1 (approximately)
    const contentTypes = Object.keys(config.contentTypeWeights);
    for (const type of contentTypes) {
      const weights = config.contentTypeWeights[type as keyof typeof config.contentTypeWeights];
      const sum = weights.views + weights.likes + weights.shares + weights.comments;
      if (Math.abs(sum - 1.0) > 0.01) {
        console.warn(`Weights for ${type} don't sum to 1.0 (sum: ${sum})`);
      }
    }

    return true;
  } catch (_error) {
    console.error("", _error);
    return false;
  }
};

// Singleton instance
let performanceConfig: PerformanceConfig | null = null;

export const getPerformanceConfig = (): PerformanceConfig => {
  if (!performanceConfig) {
    performanceConfig = loadPerformanceConfig();
    
    // Validate the loaded configuration
    if (!validatePerformanceConfig(performanceConfig)) {
      console.warn('Performance configuration validation failed, using defaults');
      performanceConfig = DEFAULT_PERFORMANCE_CONFIG;
    }
  }
  
  return performanceConfig;
};

// Reset configuration (useful for testing)
export const resetPerformanceConfig = (): void => {
  performanceConfig = null;
};