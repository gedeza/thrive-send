import { z } from 'zod';

export const AIModelSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'huggingface', 'ollama']),
  model: z.string(),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
});

export type AIModel = z.infer<typeof AIModelSchema>;

export const DEFAULT_MODELS = {
  free: {
    provider: 'ollama' as const,
    model: 'llama2',
    baseUrl: 'http://localhost:11434',
    temperature: 0.7,
  },
  pro: {
    provider: 'openai' as const,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
  },
  enterprise: {
    provider: 'anthropic' as const,
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
  },
};

export class AIConfigService {
  private static instance: AIConfigService;
  private config: Record<string, AIModel> = {};

  private constructor() {}

  static getInstance(): AIConfigService {
    if (!AIConfigService.instance) {
      AIConfigService.instance = new AIConfigService();
    }
    return AIConfigService.instance;
  }

  async getModelConfig(organizationId: string): Promise<AIModel> {
    // First check if organization has custom config
    if (this.config[organizationId]) {
      return this.config[organizationId];
    }

    // Get organization's subscription plan
    const response = await fetch(`/api/organizations/${organizationId}/subscription`);
    const subscription = await response.json();

    // Return default model based on subscription plan
    return DEFAULT_MODELS[subscription.plan as keyof typeof DEFAULT_MODELS];
  }

  async setCustomModelConfig(organizationId: string, config: AIModel): Promise<void> {
    const validatedConfig = AIModelSchema.parse(config);
    this.config[organizationId] = validatedConfig;

    // Save to database or cache
    await fetch(`/api/organizations/${organizationId}/ai-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedConfig),
    });
  }

  async clearCustomModelConfig(organizationId: string): Promise<void> {
    delete this.config[organizationId];
    
    // Remove from database or cache
    await fetch(`/api/organizations/${organizationId}/ai-config`, {
      method: 'DELETE',
    });
  }
} 