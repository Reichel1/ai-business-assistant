"use client";

import { WORKFLOW_STAGES } from '@/lib/workflow-config';
import { ProjectStage } from '@/types/project';
import { cn } from '@/lib/utils';
import { Check, Lightbulb, Search, Palette, Hammer, Code, Link, Rocket } from 'lucide-react';

const iconMap = {
  Lightbulb,
  Search,
  Palette,
  Hammer,
  Code,
  Link,
  Rocket,
};

interface ProgressTrackerProps {
  currentStage: ProjectStage;
  completedStages: ProjectStage[];
  className?: string;
}

export function ProgressTracker({ 
  currentStage, 
  completedStages, 
  className 
}: ProgressTrackerProps) {
  const currentStageIndex = WORKFLOW_STAGES.findIndex(s => s.id === currentStage);
  
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {WORKFLOW_STAGES.map((stage, index) => {
        const isCompleted = completedStages.includes(stage.id);
        const isCurrent = stage.id === currentStage;
        const isPast = index < currentStageIndex;
        const isFuture = index > currentStageIndex;
        const IconComponent = iconMap[stage.icon as keyof typeof iconMap];
        
        return (
          <div key={stage.id} className="flex items-center">
            {/* Stage Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-300",
                  {
                    [stage.color]: isCurrent,
                    "bg-green-500": isCompleted,
                    "bg-gray-300": isFuture && !isCompleted,
                    "ring-4 ring-blue-200": isCurrent,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <IconComponent className="w-6 h-6" />
                )}
              </div>
              
              {/* Stage Info */}
              <div className="mt-2 text-center min-w-0">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      "text-gray-900": isCurrent || isCompleted,
                      "text-gray-500": isFuture && !isCompleted,
                    }
                  )}
                >
                  {stage.title}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {stage.estimatedTime}
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < WORKFLOW_STAGES.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-1 mx-4 rounded transition-colors duration-300",
                  {
                    "bg-green-500": isPast || isCompleted,
                    "bg-gray-300": isFuture,
                  }
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}