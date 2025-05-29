import { OrganizationService } from '../api/organization-service';
import { AIConfigService, AIModel } from './ai-config';

export class AIService {
  private organizationService: OrganizationService;
  private configService: AIConfigService;

  constructor() {
    this.organizationService = new OrganizationService();
    this.configService = AIConfigService.getInstance();
  }

  private async getLLMResponse(
    organizationId: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    const config = await this.configService.getModelConfig(organizationId);
    
    switch (config.provider) {
      case 'ollama':
        return this.callOllama(config, prompt, systemPrompt);
      case 'openai':
        return this.callOpenAI(config, prompt, systemPrompt);
      case 'anthropic':
        return this.callAnthropic(config, prompt, systemPrompt);
      case 'huggingface':
        return this.callHuggingFace(config, prompt, systemPrompt);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  private async callOllama(config: AIModel, prompt: string, systemPrompt?: string): Promise<string> {
    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama');
    }

    const data = await response.json();
    return data.response;
  }

  private async callOpenAI(config: AIModel, prompt: string, systemPrompt?: string): Promise<string> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(config: AIModel, prompt: string, systemPrompt?: string): Promise<string> {
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Anthropic');
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async callHuggingFace(config: AIModel, prompt: string, systemPrompt?: string): Promise<string> {
    if (!config.apiKey) {
      throw new Error('HuggingFace API key is required');
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${config.model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        inputs: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        parameters: {
          temperature: config.temperature,
          max_new_tokens: config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from HuggingFace');
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0].generated_text : data.generated_text;
  }

  async generateTemplateSuggestions(
    organizationId: string,
    content: string,
    type: 'email' | 'social' | 'blog'
  ): Promise<string[]> {
    // Check if AI features are available for this organization
    const isAvailable = await this.organizationService.checkAIFeatureAvailability(organizationId);
    if (!isAvailable) {
      throw new Error('AI features are not available for your subscription plan');
    }

    // Track usage
    await this.organizationService.trackAIFeatureUsage(organizationId);

    const systemPrompt = `You are an expert content writer specializing in ${type} content. 
    Provide specific, actionable suggestions to improve the following content. 
    Focus on clarity, engagement, and effectiveness.`;

    const prompt = `Content type: ${type}\n\nContent:\n${content}\n\nPlease provide 4 specific suggestions to improve this content.`;

    const response = await this.getLLMResponse(organizationId, prompt, systemPrompt);
    return response.split('\n').filter(line => line.trim().length > 0);
  }

  async optimizeContent(
    organizationId: string,
    content: string
  ): Promise<{ suggestions: string[]; optimizedContent: string }> {
    // Check if AI features are available for this organization
    const isAvailable = await this.organizationService.checkAIFeatureAvailability(organizationId);
    if (!isAvailable) {
      throw new Error('AI features are not available for your subscription plan');
    }

    // Track usage
    await this.organizationService.trackAIFeatureUsage(organizationId);

    const systemPrompt = `You are an expert content editor. 
    Analyze the following content and provide specific suggestions for improvement.
    Then, provide an optimized version of the content.`;

    const prompt = `Content:\n${content}\n\nPlease provide 4 specific suggestions for improvement, followed by an optimized version of the content.`;

    const response = await this.getLLMResponse(organizationId, prompt, systemPrompt);
    const [suggestions, optimizedContent] = response.split('\n\nOptimized Content:\n');
    
    return {
      suggestions: suggestions.split('\n').filter(line => line.trim().length > 0),
      optimizedContent: optimizedContent.trim()
    };
  }
} 