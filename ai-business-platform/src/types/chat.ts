export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'question' | 'suggestion' | 'summary' | 'feature_proposal';
    stage?: string;
    suggestions?: FeatureSuggestion[];
    extractedData?: Record<string, string | number | boolean>;
  };
}

export interface FeatureSuggestion {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'declined';
  category: string;
}

export interface ConversationContext {
  stage: string;
  projectData: Record<string, string | number | boolean>;
  collectedData: Record<string, string | number | boolean>;
  nextQuestions: string[];
  completedTopics: string[];
  suggestions: FeatureSuggestion[];
}

export interface KnowledgeEntry {
  id: string;
  type: 'business_idea' | 'problem_statement' | 'target_audience' | 'solution' | 'unique_value' | 'feature' | 'insight';
  title: string;
  content: string;
  source: 'user_input' | 'ai_analysis' | 'ai_suggestion';
  stage: string;
  timestamp: Date;
  confidence: number; // 0-1
  tags: string[];
}