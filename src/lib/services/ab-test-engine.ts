import { prisma } from '@/lib/prisma';

interface ABTestVariant {
  id: string;
  name: string;
  trafficAllocation: number;
  isControl: boolean;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    cpc: number;
  };
}

interface ABTestConfig {
  variants: ABTestVariant[];
  campaignId: string;
  startDate: Date;
  endDate?: Date;
  primaryMetric?: 'clicks' | 'conversions' | 'revenue' | 'ctr';
  confidenceLevel?: number;
  autoSelectWinner?: boolean;
}

interface StatisticalResult {
  pValue: number;
  confidence: number;
  isSignificant: boolean;
  winnerVariantId?: string;
  lift: number;
}

export class ABTestEngine {
  private static activeTests: Map<string, ABTestConfig> = new Map();
  private static metricsCache: Map<string, Record<string, ABTestVariant['metrics']>> = new Map();

  /**
   * Initialize an A/B test
   */
  static initializeTest(testId: string, config: ABTestConfig) {
    this.activeTests.set(testId, config);
    
    // Initialize metrics cache for this test
    const metricsCache: Record<string, ABTestVariant['metrics']> = {};
    config.variants.forEach(variant => {
      metricsCache[variant.id] = { ...variant.metrics };
    });
    this.metricsCache.set(testId, metricsCache);

    console.log(`A/B Test ${testId} initialized with ${config.variants.length} variants`);
  }

  /**
   * Assign a user to a variant using deterministic hash-based allocation
   */
  static assignVariant(testId: string, userId: string): string | null {
    const config = this.activeTests.get(testId);
    if (!config) {
      console.warn(`Test ${testId} not found or not active`);
      return null;
    }

    // Create a deterministic hash from testId + userId
    const hash = this.hashString(`${testId}:${userId}`);
    const percentage = hash % 100;

    // Assign based on traffic allocation
    let cumulativeAllocation = 0;
    for (const variant of config.variants) {
      cumulativeAllocation += variant.trafficAllocation;
      if (percentage < cumulativeAllocation) {
        return variant.id;
      }
    }

    // Fallback to control if something goes wrong
    const controlVariant = config.variants.find(v => v.isControl);
    return controlVariant?.id || config.variants[0].id;
  }

  /**
   * Track an event for a variant
   */
  static async trackEvent(
    testId: string, 
    variantId: string, 
    eventType: 'impression' | 'click' | 'conversion',
    value?: number
  ) {
    const config = this.activeTests.get(testId);
    if (!config) {
      console.warn(`Test ${testId} not active for tracking`);
      return;
    }

    const metricsCache = this.metricsCache.get(testId);
    if (!metricsCache || !metricsCache[variantId]) {
      console.warn(`Variant ${variantId} not found in test ${testId}`);
      return;
    }

    const metrics = metricsCache[variantId];

    // Update metrics based on event type
    switch (eventType) {
      case 'impression':
        metrics.impressions += 1;
        break;
      case 'click':
        metrics.clicks += 1;
        break;
      case 'conversion':
        metrics.conversions += 1;
        if (value) {
          metrics.revenue += value;
        }
        break;
    }

    // Recalculate derived metrics
    metrics.ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
    metrics.conversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0;
    metrics.cpc = metrics.clicks > 0 ? metrics.revenue / metrics.clicks : 0;

    // Update cache
    metricsCache[variantId] = metrics;
    this.metricsCache.set(testId, metricsCache);

    // Periodically save to database (every 10 events to reduce DB load)
    if ((metrics.impressions + metrics.clicks + metrics.conversions) % 10 === 0) {
      await this.saveMetricsToDatabase(testId);
    }

    // Check for statistical significance if auto-select is enabled
    const testConfig = config;
    if (testConfig.autoSelectWinner && metrics.conversions >= 100) { // Minimum sample size
      const results = this.calculateStatisticalSignificance(testId);
      if (results.isSignificant) {
        await this.completeTest(testId, results);
      }
    }
  }

  /**
   * Calculate statistical significance using Welch's t-test
   */
  static calculateStatisticalSignificance(testId: string): StatisticalResult {
    const config = this.activeTests.get(testId);
    const metricsCache = this.metricsCache.get(testId);
    
    if (!config || !metricsCache) {
      throw new Error(`Test ${testId} not found`);
    }

    const controlVariant = config.variants.find(v => v.isControl);
    if (!controlVariant) {
      throw new Error('No control variant found');
    }

    const controlMetrics = metricsCache[controlVariant.id];
    let bestVariant = controlVariant;
    let bestMetrics = controlMetrics;
    let highestLift = 0;
    let lowestPValue = 1;

    // Compare each test variant against control
    for (const variant of config.variants) {
      if (variant.isControl) continue;

      const variantMetrics = metricsCache[variant.id];
      
      // Calculate conversion rates
      const controlRate = controlMetrics.clicks > 0 ? controlMetrics.conversions / controlMetrics.clicks : 0;
      const variantRate = variantMetrics.clicks > 0 ? variantMetrics.conversions / variantMetrics.clicks : 0;
      
      // Calculate lift
      const lift = controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0;
      
      // Perform statistical test (simplified z-test for proportions)
      const pValue = this.calculatePValue(
        controlMetrics.conversions, controlMetrics.clicks,
        variantMetrics.conversions, variantMetrics.clicks
      );

      if (pValue < lowestPValue && lift > 0) {
        lowestPValue = pValue;
        highestLift = lift;
        bestVariant = variant;
        bestMetrics = variantMetrics;
      }
    }

    const confidenceLevel = config.confidenceLevel || 95;
    const significance = (1 - lowestPValue) * 100;
    const isSignificant = significance >= confidenceLevel && lowestPValue < (1 - confidenceLevel / 100);

    return {
      pValue: lowestPValue,
      confidence: significance,
      isSignificant,
      winnerVariantId: isSignificant ? bestVariant.id : undefined,
      lift: highestLift
    };
  }

  /**
   * Calculate p-value using z-test for proportions
   */
  private static calculatePValue(
    conversions1: number, samples1: number,
    conversions2: number, samples2: number
  ): number {
    if (samples1 === 0 || samples2 === 0) return 1;

    const p1 = conversions1 / samples1;
    const p2 = conversions2 / samples2;
    const pPool = (conversions1 + conversions2) / (samples1 + samples2);
    
    const se = Math.sqrt(pPool * (1 - pPool) * (1/samples1 + 1/samples2));
    
    if (se === 0) return 1;
    
    const z = Math.abs(p2 - p1) / se;
    
    // Convert z-score to p-value (two-tailed test)
    return 2 * (1 - this.normalCDF(z));
  }

  /**
   * Normal cumulative distribution function approximation
   */
  private static normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    if (x > 0) {
      prob = 1 - prob;
    }
    
    return prob;
  }

  /**
   * Complete a test with results
   */
  private static async completeTest(testId: string, results: StatisticalResult) {
    try {
      const config = this.activeTests.get(testId);
      if (!config) return;

      const winner = results.winnerVariantId ? 
        config.variants.find(v => v.id === results.winnerVariantId) : 
        config.variants.find(v => v.isControl);

      const summary = results.isSignificant ? 
        `${winner?.name} won with ${results.lift.toFixed(1)}% lift (${results.confidence.toFixed(1)}% confidence)` :
        `No statistically significant winner found`;

      await prisma.aBTest.update({
        where: { id: testId },
        data: {
          status: 'COMPLETED',
          results: JSON.stringify({
            winner: results.winnerVariantId,
            confidence: results.confidence,
            significance: results.confidence,
            lift: results.lift,
            pValue: results.pValue,
            summary
          })
        }
      });

      // Remove from active tests
      this.activeTests.delete(testId);
      
      console.log(`A/B Test ${testId} completed: ${summary}`);
    } catch (_error) {
      console.error("", _error);
    }
  }

  /**
   * Pause a test
   */
  static pauseTest(testId: string) {
    this.activeTests.delete(testId);
    console.log(`A/B Test ${testId} paused`);
  }

  /**
   * Get current metrics for a test
   */
  static getCurrentMetrics(testId: string): Record<string, ABTestVariant['metrics']> | null {
    return this.metricsCache.get(testId) || null;
  }

  /**
   * Save metrics to database
   */
  private static async saveMetricsToDatabase(testId: string) {
    try {
      const config = this.activeTests.get(testId);
      const metricsCache = this.metricsCache.get(testId);
      
      if (!config || !metricsCache) return;

      // Update variants with current metrics
      const updatedVariants = config.variants.map(variant => ({
        ...variant,
        metrics: metricsCache[variant.id] || variant.metrics
      }));

      await prisma.aBTest.update({
        where: { id: testId },
        data: {
          variants: JSON.stringify(updatedVariants)
        }
      });
    } catch (_error) {
      console.error("", _error);
    }
  }

  /**
   * Simple hash function for deterministic user assignment
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Load active tests from database on startup
   */
  static async loadActiveTests() {
    try {
      const activeTests = await prisma.aBTest.findMany({
        where: { status: 'RUNNING' },
        include: { campaign: true }
      });

      for (const test of activeTests) {
        const variants = typeof test.variants === 'string' ? JSON.parse(test.variants) : test.variants;
        
        this.initializeTest(test.id, {
          variants,
          campaignId: test.campaignId,
          startDate: test.startDate,
          endDate: test.endDate || undefined,
          primaryMetric: 'conversions', // Default
          confidenceLevel: 95,
          autoSelectWinner: false
        });
      }

      console.log(`Loaded ${activeTests.length} active A/B tests`);
    } catch (_error) {
      console.error("", _error);
    }
  }
}

// Initialize active tests on module load
if (typeof window === 'undefined') { // Server-side only
  ABTestEngine.loadActiveTests();
}