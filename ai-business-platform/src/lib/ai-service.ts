import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIStreamResponse {
  content: string;
  finished: boolean;
  provider: AIProvider;
}

export interface AIServiceConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  defaultProvider: AIProvider;
}

export class AIService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private google?: GoogleGenerativeAI;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    if (this.config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.openaiApiKey,
        dangerouslyAllowBrowser: true
      });
    }

    if (this.config.anthropicApiKey) {
      this.anthropic = new Anthropic({
        apiKey: this.config.anthropicApiKey,
        dangerouslyAllowBrowser: true
      });
    }

    if (this.config.googleApiKey) {
      this.google = new GoogleGenerativeAI(this.config.googleApiKey);
    }
  }

  async generateResponse(
    messages: AIMessage[],
    options: {
      provider?: AIProvider;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<string | AsyncIterable<AIStreamResponse>> {
    const provider = options.provider || this.config.defaultProvider;
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 1000;

    try {
      switch (provider) {
        case 'openai':
          return await this.generateOpenAIResponse(messages, { temperature, maxTokens, stream: options.stream });
        case 'anthropic':
          return await this.generateAnthropicResponse(messages, { temperature, maxTokens, stream: options.stream });
        case 'google':
          return await this.generateGoogleResponse(messages, { temperature, maxTokens, stream: options.stream });
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      console.error(`AI Generation Error (${provider}):`, error);
      throw error;
    }
  }

  private async generateOpenAIResponse(
    messages: AIMessage[],
    options: { temperature: number; maxTokens: number; stream?: boolean }
  ): Promise<string | AsyncIterable<AIStreamResponse>> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    const openaiMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));

    if (options.stream) {
      return this.streamOpenAIResponse(openaiMessages, options);
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async *streamOpenAIResponse(
    messages: Array<{role: 'user' | 'assistant' | 'system'; content: string}>,
    options: { temperature: number; maxTokens: number }
  ): AsyncIterable<AIStreamResponse> {
    if (!this.openai) {
      throw new Error('OpenAI not configured');
    }

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      const finished = chunk.choices[0]?.finish_reason !== null;
      
      yield {
        content,
        finished,
        provider: 'openai'
      };
    }
  }

  private async generateAnthropicResponse(
    messages: AIMessage[],
    options: { temperature: number; maxTokens: number; stream?: boolean }
  ): Promise<string | AsyncIterable<AIStreamResponse>> {
    if (!this.anthropic) {
      throw new Error('Anthropic not configured');
    }

    // Convert messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    if (options.stream) {
      return this.streamAnthropicResponse(systemMessage, conversationMessages, options);
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      system: systemMessage,
      messages: conversationMessages,
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  }

  private async *streamAnthropicResponse(
    systemMessage: string,
    messages: Array<{role: 'user' | 'assistant'; content: string}>,
    options: { temperature: number; maxTokens: number }
  ): AsyncIterable<AIStreamResponse> {
    if (!this.anthropic) {
      throw new Error('Anthropic not configured');
    }

    const stream = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      system: systemMessage,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield {
          content: chunk.delta.text,
          finished: false,
          provider: 'anthropic'
        };
      } else if (chunk.type === 'message_stop') {
        yield {
          content: '',
          finished: true,
          provider: 'anthropic'
        };
      }
    }
  }

  private async generateGoogleResponse(
    messages: AIMessage[],
    options: { temperature: number; maxTokens: number; stream?: boolean }
  ): Promise<string | AsyncIterable<AIStreamResponse>> {
    if (!this.google) {
      throw new Error('Google AI not configured');
    }

    const model = this.google.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert messages to Google format
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

    if (options.stream) {
      return this.streamGoogleResponse(model, prompt, options);
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async *streamGoogleResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: any, // Google's GenerativeModel type
    prompt: string,
    _options: { temperature: number; maxTokens: number }
  ): AsyncIterable<AIStreamResponse> {
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text() || '';
      yield {
        content: text,
        finished: false,
        provider: 'google'
      };
    }

    yield {
      content: '',
      finished: true,
      provider: 'google'
    };
  }

  // Utility methods for different use cases
  async generateBusinessAdvice(context: string, question: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert business advisor and startup mentor. You help entrepreneurs develop and validate their business ideas through natural conversation. 

Business Context: ${context}

Guidelines:
- Ask one thoughtful follow-up question at a time
- Provide specific, actionable advice
- Be encouraging but realistic
- Help extract key business insights
- Suggest practical next steps
- Use a conversational, friendly tone`
      },
      {
        role: 'user',
        content: question
      }
    ];

    const response = await this.generateResponse(messages, {
      provider: 'openai',
      temperature: 0.8,
      maxTokens: 500
    });

    return response as string;
  }

  async extractBusinessInsights(conversation: string): Promise<{
    businessIdea?: string;
    problemStatement?: string;
    targetAudience?: string;
    solution?: string;
    uniqueValue?: string;
    suggestedFeatures?: string[];
  }> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert at extracting structured business information from conversations. 
        
Analyze the conversation and extract key business insights. Return a JSON object with these fields:
- businessIdea: The core business concept
- problemStatement: The problem being solved
- targetAudience: Who the customers are
- solution: How the problem is solved
- uniqueValue: What makes it different
- suggestedFeatures: Array of 3-5 feature suggestions based on what was discussed

Only include fields where you have confidence in the extracted information. Return valid JSON only.`
      },
      {
        role: 'user',
        content: `Extract business insights from this conversation:\n\n${conversation}`
      }
    ];

    try {
      const response = await this.generateResponse(messages, {
        provider: 'openai',
        temperature: 0.3,
        maxTokens: 800
      });

      return JSON.parse(response as string);
    } catch (error) {
      console.error('Error extracting business insights:', error);
      return {};
    }
  }

  isConfigured(provider?: AIProvider): boolean {
    const targetProvider = provider || this.config.defaultProvider;
    
    switch (targetProvider) {
      case 'openai':
        return !!this.openai;
      case 'anthropic':
        return !!this.anthropic;
      case 'google':
        return !!this.google;
      default:
        return false;
    }
  }
}