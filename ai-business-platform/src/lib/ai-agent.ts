import { ChatMessage, ConversationContext, FeatureSuggestion, KnowledgeEntry } from '@/types/chat';

interface AIAgentConfig {
  stage: string;
  context: ConversationContext;
  knowledgeBase: KnowledgeEntry[];
}

export class AIAgent {
  private config: AIAgentConfig;
  private messageHistory: ChatMessage[];

  constructor(config: AIAgentConfig) {
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

    // Generate AI response based on stage and context
    const response = await this.generateStageSpecificResponse(userMessage);
    
    const aiChatMessage: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: response.metadata
    };

    this.messageHistory.push(aiChatMessage);
    
    // Extract and document knowledge
    await this.extractAndDocumentKnowledge(userMessage, response.extractedData);

    return aiChatMessage;
  }

  private async generateStageSpecificResponse(userMessage: string): Promise<{
    content: string;
    metadata?: Record<string, string | FeatureSuggestion[]>;
    extractedData?: Record<string, string>;
  }> {
    switch (this.config.stage) {
      case 'spark':
        return this.generateSparkResponse(userMessage);
      case 'validate':
        return this.generateValidateResponse(userMessage);
      default:
        return {
          content: "I'm here to help you develop your business idea. What would you like to discuss?"
        };
    }
  }

  private generateSparkResponse(userMessage: string): {
    content: string;
    metadata?: Record<string, string | FeatureSuggestion[]>;
    extractedData?: Record<string, string>;
  } {
    const context = this.config.context;
    const completedTopics = context.completedTopics || [];
    
    // Define the conversation flow
    const sparkFlow = [
      {
        topic: 'business_idea',
        question: "That's exciting! Tell me more about your business idea. What exactly are you trying to build?",
        followUp: "I love the concept! Can you elaborate on how this would work in practice?"
      },
      {
        topic: 'problem_statement', 
        question: "Great! Now, what specific problem does this solve? What frustrates people right now that your idea would fix?",
        followUp: "That's a real pain point! How do people currently deal with this problem?"
      },
      {
        topic: 'target_audience',
        question: "Perfect! Who would be your ideal customers? Describe the people who would benefit most from this solution.",
        followUp: "Interesting target market! What makes you think they would pay for this solution?"
      },
      {
        topic: 'solution',
        question: "Now I'm curious - how exactly would your solution work? Walk me through the core features or process.",
        followUp: "That's a solid approach! What would make someone choose your solution over alternatives?"
      },
      {
        topic: 'unique_value',
        question: "What makes your approach different? What's your unique angle that competitors don't have?",
        followUp: "That's a compelling differentiator! How sustainable is this competitive advantage?"
      }
    ];

    // Find current stage in conversation
    const currentTopic = sparkFlow.find(flow => !completedTopics.includes(flow.topic));
    
    if (!currentTopic) {
      // All topics completed, generate summary and suggestions
      return this.generateSparkSummary();
    }

    // Analyze user message for relevant information
    const extractedData = this.extractInformationFromMessage(userMessage, currentTopic.topic);
    
    // Generate contextual response
    let response = currentTopic.question;
    
    // If user provided substantial info, ask follow-up
    if (userMessage.length > 50) {
      response = currentTopic.followUp || currentTopic.question;
      
      // Mark topic as discussed
      context.completedTopics.push(currentTopic.topic);
      
      // Generate feature suggestions based on what they described
      const suggestions = this.generateFeatureSuggestions(userMessage, currentTopic.topic);
      
      if (suggestions.length > 0) {
        response += "\n\nBased on what you described, I have some feature ideas that might enhance your solution:\n\n";
        suggestions.forEach((suggestion, index) => {
          response += `${index + 1}. **${suggestion.title}**: ${suggestion.description}\n`;
        });
        response += "\nWhich of these resonate with you? Feel free to accept, modify, or decline any of them!";
      }

      return {
        content: response,
        metadata: {
          type: 'question',
          stage: 'spark',
          ...(suggestions.length > 0 && { suggestions })
        },
        extractedData
      };
    }

    return {
      content: response,
      metadata: {
        type: 'question',
        stage: 'spark'
      }
    };
  }

  private generateValidateResponse(_userMessage: string): {
    content: string;
    metadata?: Record<string, string>;
    extractedData?: Record<string, string>;
  } {
    return {
      content: "Now let's validate your idea! I'll help you research the market, analyze competitors, and understand your potential customers. What aspect would you like to explore first - market size, competition, or customer validation?",
      metadata: {
        type: 'question',
        stage: 'validate'
      }
    };
  }

  private generateSparkSummary(): {
    content: string;
    metadata?: Record<string, string>;
  } {
    const knowledgeEntries = this.config.knowledgeBase.filter(entry => entry.stage === 'spark');
    
    let summary = "🎉 Excellent! I've captured all the key details about your business idea. Here's what we've documented:\n\n";
    
    knowledgeEntries.forEach(entry => {
      summary += `**${entry.title}**: ${entry.content}\n\n`;
    });

    summary += "Your idea is taking shape! Ready to move to the validation stage where we'll research the market and analyze your competition?";

    return {
      content: summary,
      metadata: {
        type: 'summary',
        stage: 'spark'
      }
    };
  }

  private extractInformationFromMessage(message: string, topic: string): Record<string, string> {
    // Simple keyword-based extraction (in production, use proper NLP)
    const extracted: Record<string, string> = {};
    
    switch (topic) {
      case 'business_idea':
        extracted.businessIdea = message;
        break;
      case 'problem_statement':
        extracted.problemStatement = message;
        break;
      case 'target_audience':
        extracted.targetAudience = message;
        break;
      case 'solution':
        extracted.solution = message;
        break;
      case 'unique_value':
        extracted.uniqueValue = message;
        break;
    }

    return extracted;
  }

  private generateFeatureSuggestions(userMessage: string, topic: string): FeatureSuggestion[] {
    const suggestions: FeatureSuggestion[] = [];

    // Generate contextual feature suggestions based on topic and content
    if (topic === 'solution' && userMessage.toLowerCase().includes('mobile')) {
      suggestions.push({
        id: this.generateId(),
        title: 'Push Notifications',
        description: 'Send timely reminders and updates to keep users engaged',
        reasoning: 'Since you mentioned mobile functionality, push notifications could increase user retention',
        priority: 'high',
        status: 'pending',
        category: 'engagement'
      });
    }

    if (topic === 'solution' && (userMessage.toLowerCase().includes('booking') || userMessage.toLowerCase().includes('schedule'))) {
      suggestions.push({
        id: this.generateId(),
        title: 'Calendar Integration',
        description: 'Sync with Google Calendar, Outlook, and other calendar apps',
        reasoning: 'Booking systems work better when integrated with users\' existing calendars',
        priority: 'high',
        status: 'pending',
        category: 'integration'
      });
    }

    if (topic === 'target_audience' && userMessage.toLowerCase().includes('business')) {
      suggestions.push({
        id: this.generateId(),
        title: 'Team Management',
        description: 'Allow multiple team members to manage bookings and settings',
        reasoning: 'Business customers often need team collaboration features',
        priority: 'medium',
        status: 'pending',
        category: 'collaboration'
      });
    }

    return suggestions;
  }

  private async extractAndDocumentKnowledge(userMessage: string, extractedData?: Record<string, string>): Promise<void> {
    if (!extractedData) return;

    Object.entries(extractedData).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.length > 10) {
        const knowledgeEntry: KnowledgeEntry = {
          id: this.generateId(),
          type: this.mapTopicToKnowledgeType(key),
          title: this.formatTitle(key),
          content: value,
          source: 'user_input',
          stage: this.config.stage,
          timestamp: new Date(),
          confidence: 0.9,
          tags: this.generateTags(value)
        };

        this.config.knowledgeBase.push(knowledgeEntry);
      }
    });
  }

  private mapTopicToKnowledgeType(topic: string): KnowledgeEntry['type'] {
    const mapping: Record<string, KnowledgeEntry['type']> = {
      businessIdea: 'business_idea',
      problemStatement: 'problem_statement',
      targetAudience: 'target_audience',
      solution: 'solution',
      uniqueValue: 'unique_value'
    };
    return mapping[topic] || 'insight';
  }

  private formatTitle(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }

  private generateTags(content: string): string[] {
    // Simple tag generation (could be enhanced with NLP)
    const tags: string[] = [];
    const words = content.toLowerCase().split(' ');
    
    if (words.some(w => ['mobile', 'app', 'smartphone'].includes(w))) tags.push('mobile');
    if (words.some(w => ['web', 'website', 'online'].includes(w))) tags.push('web');
    if (words.some(w => ['business', 'company', 'enterprise'].includes(w))) tags.push('b2b');
    if (words.some(w => ['customer', 'user', 'consumer'].includes(w))) tags.push('b2c');

    return tags;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  getContext(): ConversationContext {
    return this.config.context;
  }

  getKnowledgeBase(): KnowledgeEntry[] {
    return this.config.knowledgeBase;
  }

  getMessageHistory(): ChatMessage[] {
    return this.messageHistory;
  }
}