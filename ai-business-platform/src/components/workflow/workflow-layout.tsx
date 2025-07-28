"use client";

import { useState } from 'react';
import { Project, ProjectStage, SparkData } from '@/types/project';
import { ProgressTracker } from './progress-tracker';
import { SparkStage } from './stages/spark-stage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getNextStage } from '@/lib/workflow-config';

interface WorkflowLayoutProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
  onExit: () => void;
}

export function WorkflowLayout({ project, onProjectUpdate, onExit }: WorkflowLayoutProps) {
  const [currentStage, setCurrentStage] = useState<ProjectStage>(project.stage);
  
  const completedStages = Object.keys(project.data)
    .filter(stage => project.data[stage as keyof typeof project.data]?.completed)
    .map(stage => stage as ProjectStage);

  const handleDataUpdate = (stage: ProjectStage, data: SparkData) => {
    const updatedProject = {
      ...project,
      data: {
        ...project.data,
        [stage]: data
      },
      updatedAt: new Date()
    };
    onProjectUpdate(updatedProject);
  };

  const handleStageComplete = (stage: ProjectStage) => {
    const nextStage = getNextStage(stage);
    if (nextStage) {
      const updatedProject = {
        ...project,
        stage: nextStage,
        progress: Math.round(((completedStages.length + 1) / 7) * 100),
        updatedAt: new Date()
      };
      setCurrentStage(nextStage);
      onProjectUpdate(updatedProject);
    }
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'spark':
        return (
          <SparkStage
            data={project.data.spark}
            onUpdate={(data: SparkData) => handleDataUpdate('spark', data)}
            onComplete={() => handleStageComplete('spark')}
          />
        );
      case 'validate':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Validate Stage</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'design':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Design Stage</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'build':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Build Stage</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'code':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Code Stage</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'connect':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Connect Stage</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'launch':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Launch Stage</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onExit}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 border-l border-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Progress: {project.progress}%
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Tracker */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ProgressTracker
            currentStage={currentStage}
            completedStages={completedStages}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        {renderCurrentStage()}
      </main>
    </div>
  );
}