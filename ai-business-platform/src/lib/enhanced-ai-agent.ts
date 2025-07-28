import { ChatMessage, ConversationContext, FeatureSuggestion, KnowledgeEntry } from '@/types/chat';
import { AIService, AIProvider } from './ai-service';

interface EnhancedAIAgentConfig {
  stage: string;
  context: ConversationContext;
  knowledgeBase: KnowledgeEntry[];
  aiService: AIService;
  provider?: AIProvider;
}

export class EnhancedAIAgent {
  private config: EnhancedAIAgentConfig;
  private messageHistory: ChatMessage[];
  private conversationSummary: string = '';

  constructor(config: EnhancedAIAgentConfig) {
    this.config = config;
    this.messageHistory = [];
  }

  async generateResponse(userMessage: string): Promise<ChatMessage> {
    // Add user message to history
    const userChatMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.messageHistory.push(userChatMessage);

    // Generate AI response using real AI
    const response = await this.generateRealAIResponse(userMessage);
    
    const aiChatMessage: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: response.metadata
    };

    this.messageHistory.push(aiChatMessage);
    
    // Extract and document knowledge using AI
    await this.extractKnowledgeWithAI();

    // Update conversation summary
    await this.updateConversationSummary();

    return aiChatMessage;
  }

  private async generateRealAIResponse(userMessage: string): Promise<{
    content: string;
    metadata?: Record<string, string | FeatureSuggestion[]>;
  }> {
    const businessContext = this.buildBusinessContext();
    const conversationContext = this.buildConversationContext();
    
    try {
      // Generate main response using AI service
      const aiResponse = await this.config.aiService.generateBusinessAdvice(
        `${businessContext}\n\nConversation Context: ${conversationContext}`,
        userMessage
      );

      // Extract any suggested features using AI
      const suggestedFeatures = await this.generateFeatureSuggestions(userMessage, aiResponse);

      return {
        content: aiResponse,
        metadata: {
          type: 'question',
          stage: this.config.stage,
          ...(suggestedFeatures.length > 0 && { suggestions: suggestedFeatures })
        }
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to static response if AI fails
      return {
        content: "I'm having trouble connecting to my AI services right now. Could you try rephrasing your message? I'm here to help you develop your business idea!",
        metadata: {
          type: 'error',
          stage: this.config.stage
        }
      };
    }
  }

  private buildBusinessContext(): string {
    const knowledge = this.config.knowledgeBase
      .filter(entry => entry.stage === this.config.stage)
      .map(entry => `${entry.title}: ${entry.content}`)
      .join('\n');

    const completedTopics = this.config.context.completedTopics.join(', ');
    
    return `
Current Stage: ${this.config.stage}
Completed Topics: ${completedTopics}
Known Information:
${knowledge}

Conversation Summary: ${this.conversationSummary}
    `.trim();
  }

  private buildConversationContext(): string {
    const recentMessages = this.messageHistory
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return `Recent conversation:\n${recentMessages}`;
  }

  private async generateFeatureSuggestions(userMessage: string, aiResponse: string): Promise<FeatureSuggestion[]> {
    // Only generate suggestions occasionally to avoid overwhelming
    if (Math.random() > 0.3) return [];

    try {
      const suggestionPrompt = `
Based on this business conversation, suggest 1-2 relevant features or improvements:

User: ${userMessage}
AI Response: ${aiResponse}
Business Context: ${this.buildBusinessContext()}

Return a JSON array of suggestions with format:
[{
  "title": "Feature Name",
  "description": "Brief description",
  "reasoning": "Why this would be valuable",
  "priority": "high|medium|low",
  "category": "feature category"
}]

Only suggest truly relevant features. Return empty array [] if no good suggestions.
      `;

      const response = await this.config.aiService.generateResponse([
        {
          role: 'system',
          content: 'You are a product strategist who suggests relevant features based on business discussions. Always return valid JSON.'
        },
        {
          role: 'user',
          content: suggestionPrompt
        }
      ], {
        provider: this.config.provider,
        temperature: 0.7,
        maxTokens: 400
      });

      const suggestions = JSON.parse(response as string);
      
      return suggestions.map((s: {
        title: string;
        description: string;
        reasoning: string;
        priority: 'high' | 'medium' | 'low';
        category: string;
      }) => ({
        id: this.generateId(),
        title: s.title,
        description: s.description,
        reasoning: s.reasoning,
        priority: s.priority,
        status: 'pending' as const,
        category: s.category
      }));
    } catch (error) {
      console.error('Error generating feature suggestions:', error);
      return [];
    }
  }

  private async extractKnowledgeWithAI(): Promise<void> {
    // Get recent conversation for analysis
    const recentConversation = this.messageHistory
      .slice(-4) // Last 4 messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    try {
      // Use AI to extract structured business insights
      const insights = await this.config.aiService.extractBusinessInsights(recentConversation);
      
      // Convert insights to knowledge entries
      Object.entries(insights).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.length > 10) {
          const knowledgeEntry: KnowledgeEntry = {
            id: this.generateId(),
            type: this.mapKeyToKnowledgeType(key),
            title: this.formatTitle(key),
            content: value,
            source: 'ai_analysis',
            stage: this.config.stage,
            timestamp: new Date(),
            confidence: 0.85, // AI-extracted has high confidence
            tags: this.generateTags(value)
          };

          // Only add if we don't already have this information
          const exists = this.config.knowledgeBase.some(existing => 
            existing.type === knowledgeEntry.type && existing.stage === knowledgeEntry.stage
          );

          if (!exists) {
            this.config.knowledgeBase.push(knowledgeEntry);
          }
        }
      });

      // Handle suggested features
      if (insights.suggestedFeatures && Array.isArray(insights.suggestedFeatures)) {
        insights.suggestedFeatures.forEach(feature => {
          const featureEntry: KnowledgeEntry = {
            id: this.generateId(),
            type: 'feature',
            title: feature,
            content: `Suggested feature: ${feature}`,
            source: 'ai_suggestion',
            stage: this.config.stage,
            timestamp: new Date(),
            confidence: 0.75,
            tags: ['feature', 'ai-suggested']
          };

          this.config.knowledgeBase.push(featureEntry);
        });
      }
    } catch (error) {
      console.error('Error extracting knowledge with AI:', error);
    }
  }

  private async updateConversationSummary(): Promise<void> {
    // Update summary every 5 messages to maintain context
    if (this.messageHistory.length % 5 === 0) {
      try {
        const conversation = this.messageHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');

        const summaryResponse = await this.config.aiService.generateResponse([
          {
            role: 'system',
            content: 'Summarize this business conversation in 2-3 sentences, focusing on key business insights and decisions made.'
          },
          {
            role: 'user',
            content: `Summarize this conversation:\n${conversation}`
          }
        ], {
          provider: this.config.provider,
          temperature: 0.3,
          maxTokens: 150
        });

        this.conversationSummary = summaryResponse as string;
      } catch (error) {
        console.error('Error updating conversation summary:', error);
      }
    }
  }

  private mapKeyToKnowledgeType(key: string): KnowledgeEntry['type'] {
    const mapping: Record<string, KnowledgeEntry['type']> = {
      businessIdea: 'business_idea',
      problemStatement: 'problem_statement',
      targetAudience: 'target_audience',
      solution: 'solution',
      uniqueValue: 'unique_value'
    };
    return mapping[key] || 'insight';
  }

  private formatTitle(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }

  private generateTags(content: string): string[] {
    const tags: string[] = [];
    const words = content.toLowerCase().split(' ');
    
    // AI-powered tagging could be enhanced here
    if (words.some(w => ['mobile', 'app', 'smartphone'].includes(w))) tags.push('mobile');
    if (words.some(w => ['web', 'website', 'online'].includes(w))) tags.push('web');
    if (words.some(w => ['business', 'company', 'enterprise'].includes(w))) tags.push('b2b');
    if (words.some(w => ['customer', 'user', 'consumer'].includes(w))) tags.push('b2c');
    if (words.some(w => ['ai', 'artificial', 'intelligence', 'machine', 'learning'].includes(w))) tags.push('ai');

    return tags;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  // Public methods for accessing state
  getContext(): ConversationContext {
    return this.config.context;
  }

  getKnowledgeBase(): KnowledgeEntry[] {
    return this.config.knowledgeBase;
  }

  getMessageHistory(): ChatMessage[] {
    return this.messageHistory;
  }

  getConversationSummary(): string {
    return this.conversationSummary;
  }

  // Method to check if stage is complete
  isStageComplete(): boolean {
    const requiredTopics = this.getRequiredTopicsForStage(this.config.stage);
    const completedTopics = this.config.context.completedTopics;
    
    return requiredTopics.every(topic => completedTopics.includes(topic));
  }

  private getRequiredTopicsForStage(stage: string): string[] {
    const stageRequirements: Record<string, string[]> = {
      spark: ['business_idea', 'problem_statement', 'target_audience', 'solution', 'unique_value'],
      validate: ['market_research', 'competitor_analysis', 'customer_validation'],
      design: ['business_model', 'revenue_strategy', 'pricing_model'],
      // Add more stages as needed
    };

    return stageRequirements[stage] || [];
  }
}