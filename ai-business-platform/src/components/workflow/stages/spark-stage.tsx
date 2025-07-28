"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { SparkData } from '@/types/project';
import { Lightbulb, Users, Target, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SparkStageProps {
  data?: SparkData;
  onUpdate: (data: SparkData) => void;
  onComplete: () => void;
}

const SPARK_QUESTIONS = [
  {
    id: 'ideaDescription',
    title: 'What is your business idea?',
    description: 'Describe your business concept in a few sentences',
    icon: Lightbulb,
    placeholder: 'E.g., A mobile app that helps people find and book local fitness classes...',
    type: 'textarea'
  },
  {
    id: 'problemStatement',
    title: 'What problem does it solve?',
    description: 'Identify the specific pain point your idea addresses',
    icon: Target,
    placeholder: 'E.g., People struggle to find convenient fitness classes that fit their schedule...',
    type: 'textarea'
  },
  {
    id: 'targetAudience',
    title: 'Who is your target audience?',
    description: 'Define who would use your product or service',
    icon: Users,
    placeholder: 'E.g., Busy professionals aged 25-40 who want to stay fit...',
    type: 'input'
  },
  {
    id: 'solution',
    title: 'How will you solve this problem?',
    description: 'Explain your approach and core features',
    icon: Zap,
    placeholder: 'E.g., A platform that aggregates local fitness classes with real-time booking...',
    type: 'textarea'
  },
  {
    id: 'uniqueValue',
    title: 'What makes you different?',
    description: 'What is your unique value proposition?',
    icon: ArrowRight,
    placeholder: 'E.g., Only platform that offers flexible credits that work across multiple studios...',
    type: 'textarea'
  }
];

export function SparkStage({ data, onUpdate, onComplete }: SparkStageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<SparkData>>(data || {});

  const handleAnswerChange = (field: keyof SparkData, value: string) => {
    const updatedAnswers = { ...answers, [field]: value };
    setAnswers(updatedAnswers);
    onUpdate(updatedAnswers as SparkData);
  };

  const handleNext = () => {
    if (currentQuestion < SPARK_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, mark as complete
      const completedData = { ...answers, completed: true } as SparkData;
      setAnswers(completedData);
      onUpdate(completedData);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = SPARK_QUESTIONS[currentQuestion];
  const IconComponent = currentQ.icon;
  const currentAnswer = (answers[currentQ.id as keyof SparkData] as string) || '';
  const isAnswered = currentAnswer.trim().length > 0;
  const progress = ((currentQuestion + 1) / SPARK_QUESTIONS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Spark Your Idea</h2>
          <span className="text-sm text-gray-500">
            {currentQuestion + 1} of {SPARK_QUESTIONS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <IconComponent className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{currentQ.title}</CardTitle>
              <p className="text-gray-600 mt-1">{currentQ.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentQ.type === 'textarea' ? (
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(currentQ.id as keyof SparkData, e.target.value)}
              placeholder={currentQ.placeholder}
              className="min-h-[120px] text-base"
              autoFocus
            />
          ) : (
            <Input
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(currentQ.id as keyof SparkData, e.target.value)}
              placeholder={currentQ.placeholder}
              className="text-base"
              autoFocus
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {SPARK_QUESTIONS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                {
                  "bg-green-500": index < currentQuestion || (index === currentQuestion && isAnswered),
                  "bg-green-200": index === currentQuestion && !isAnswered,
                  "bg-gray-200": index > currentQuestion,
                }
              )}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={!isAnswered}
          className="bg-green-500 hover:bg-green-600"
        >
          {currentQuestion === SPARK_QUESTIONS.length - 1 ? 'Complete Spark' : 'Next'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Idea Summary (shown when all questions answered) */}
      {Object.keys(answers).length === SPARK_QUESTIONS.length && (
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Your Idea Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-green-800">Business Idea</h4>
              <p className="text-green-700">{answers.ideaDescription}</p>
            </div>
            <div>
              <h4 className="font-medium text-green-800">Target Audience</h4>
              <p className="text-green-700">{answers.targetAudience}</p>
            </div>
            <div>
              <h4 className="font-medium text-green-800">Unique Value</h4>
              <p className="text-green-700">{answers.uniqueValue}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}