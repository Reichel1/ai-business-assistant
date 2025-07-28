"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SparkData } from '@/types/project';
import { ChatMessage, FeatureSuggestion, KnowledgeEntry } from '@/types/chat';
import { EnhancedAIAgent } from '@/lib/enhanced-ai-agent';
import { AIService } from '@/lib/ai-service';
import { APIKeyManager } from '@/components/settings/api-key-manager';
import { Bot, User, Send, Check, X, FileText, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationalSparkProps {
  data?: SparkData;
  onUpdate: (data: SparkData) => void;
  onComplete: () => void;
}

export function ConversationalSpark({ data, onUpdate, onComplete }: ConversationalSparkProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([]);
  const [aiAgent, setAiAgent] = useState<EnhancedAIAgent>();
  const [, setAiService] = useState<AIService>();
  const [apiKeys, setApiKeys] = useState<{openai?: string; anthropic?: string; google?: string}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load API keys from localStorage
    const savedKeys = localStorage.getItem('ai-api-keys');
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        setApiKeys(keys);
        initializeAI(keys);
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }
  }, [data]);

  const initializeAI = (keys: {openai?: string; anthropic?: string; google?: string}) => {
    // Initialize AI Service
    const service = new AIService({
      openaiApiKey: keys.openai,
      anthropicApiKey: keys.anthropic,
      googleApiKey: keys.google,
      defaultProvider: keys.openai ? 'openai' : keys.anthropic ? 'anthropic' : 'google'
    });

    setAiService(service);

    // Initialize Enhanced AI Agent
    const agent = new EnhancedAIAgent({
      stage: 'spark',
      context: {
        stage: 'spark',
        projectData: {},
        collectedData: {},
        nextQuestions: [],
        completedTopics: [],
        suggestions: []
      },
      knowledgeBase: [],
      aiService: service
    });

    setAiAgent(agent);

    // Send initial greeting
    const hasAnyKey = keys.openai || keys.anthropic || keys.google;
    const initialMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'assistant',
      content: hasAnyKey 
        ? "Hi there! I'm your AI business companion, and I'm excited to help you develop your business idea!\n\nLet's start with the basics - what's the business idea you'd like to explore? Don't worry about having all the details figured out yet, just tell me what's on your mind!"
        : "Hi! I'm your AI business companion, but I need an API key to get started. Please click the 'AI Settings' button above to configure your OpenAI, Anthropic, or Google AI key so we can have a real conversation about your business idea!",
      timestamp: new Date(),
      metadata: {
        type: 'question',
        stage: 'spark'
      }
    };

    setMessages([initialMessage]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleApiKeysUpdate = (newKeys: {openai?: string; anthropic?: string; google?: string}) => {
    setApiKeys(newKeys);
    localStorage.setItem('ai-api-keys', JSON.stringify(newKeys));
    initializeAI(newKeys);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !aiAgent) return;

    setIsLoading(true);
    
    try {
      const response = await aiAgent.generateResponse(inputValue.trim());
      setMessages(prev => [...prev, response]);
      
      // Update knowledge base
      setKnowledgeBase(aiAgent.getKnowledgeBase());
      
      // Update project data
      const context = aiAgent.getContext();
      const updatedData: SparkData = {
        ideaDescription: (context.collectedData.businessIdea as string) || '',
        problemStatement: (context.collectedData.problemStatement as string) || '',
        targetAudience: (context.collectedData.targetAudience as string) || '',
        solution: (context.collectedData.solution as string) || '',
        uniqueValue: (context.collectedData.uniqueValue as string) || '',
        completed: context.completedTopics.length >= 5
      };
      
      onUpdate(updatedData);
      
      // Check if stage is complete
      if (updatedData.completed) {
        setTimeout(() => onComplete(), 2000);
      }
      
    } catch (error) {
      console.error('Error generating AI response:', error);
    }

    setInputValue('');
    setIsLoading(false);
  };

  const handleSuggestionAction = (suggestionId: string, action: 'accept' | 'decline') => {
    setMessages(prev => prev.map(msg => {
      if (msg.metadata?.suggestions) {
        const updatedSuggestions = msg.metadata.suggestions.map((s: FeatureSuggestion) => 
          s.id === suggestionId ? { ...s, status: action === 'accept' ? 'accepted' as const : 'declined' as const } : s
        );
        return {
          ...msg,
          metadata: { ...msg.metadata, suggestions: updatedSuggestions }
        };
      }
      return msg;
    }));

    // Add confirmation message
    const confirmationMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'assistant',
      content: action === 'accept' 
        ? "Great choice! I'll make note of that feature for later stages. 📝" 
        : "No problem! We can always revisit this later if needed.",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, confirmationMessage]);
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}>
        <div className={cn(
          "flex max-w-[80%] space-x-3",
          isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
            isUser ? "bg-blue-500" : "bg-green-500"
          )}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          
          <div className={cn(
            "rounded-lg px-4 py-3",
            isUser 
              ? "bg-blue-500 text-white" 
              : "bg-gray-100 text-gray-900"
          )}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            
            {/* Render feature suggestions */}
            {message.metadata?.suggestions && (
              <div className="mt-4 space-y-3">
                {message.metadata.suggestions.map((suggestion: FeatureSuggestion) => (
                  <div key={suggestion.id} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        <p className="text-xs text-gray-500">{suggestion.reasoning}</p>
                      </div>
                      <Badge variant={suggestion.priority === 'high' ? 'default' : 'secondary'} className="ml-2">
                        {suggestion.priority}
                      </Badge>
                    </div>
                    
                    {suggestion.status === 'pending' && (
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSuggestionAction(suggestion.id, 'decline')}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                    
                    {suggestion.status !== 'pending' && (
                      <div className="mt-2">
                        <Badge variant={suggestion.status === 'accepted' ? 'default' : 'secondary'}>
                          {suggestion.status === 'accepted' ? 'Accepted' : 'Declined'}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-xs opacity-70 mt-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      {/* Header with API Settings */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Business Idea Development</h2>
          <p className="text-gray-600">Chat with AI to develop and refine your business concept</p>
        </div>
        <APIKeyManager 
          currentKeys={apiKeys}
          onKeysUpdate={handleApiKeysUpdate}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
        {/* Chat Interface */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex space-x-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Base */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-4 h-4" />
                <h3 className="font-medium">Knowledge Base</h3>
              </div>
              
              <div className="space-y-3">
                {knowledgeBase.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Information will appear here as we discuss your idea
                  </p>
                ) : (
                  knowledgeBase.map((entry) => (
                    <div key={entry.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium text-gray-900 mb-1">
                            {entry.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {entry.content}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}