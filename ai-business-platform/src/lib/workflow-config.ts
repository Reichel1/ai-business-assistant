import { StageConfig, ProjectStage } from '@/types/project';

export const WORKFLOW_STAGES: StageConfig[] = [
  {
    id: 'spark',
    title: 'Spark',
    description: 'Capture and refine your business idea',
    icon: 'Lightbulb',
    color: 'bg-green-500',
    estimatedTime: '10 min'
  },
  {
    id: 'validate',
    title: 'Validate',
    description: 'Research your market and competition',
    icon: 'Search',
    color: 'bg-blue-500',
    estimatedTime: '15 min'
  },
  {
    id: 'design',
    title: 'Design',
    description: 'Create your business model and strategy',
    icon: 'Palette',
    color: 'bg-purple-500',
    estimatedTime: '20 min'
  },
  {
    id: 'build',
    title: 'Build',
    description: 'Plan your technical architecture',
    icon: 'Hammer',
    color: 'bg-orange-500',
    estimatedTime: '15 min'
  },
  {
    id: 'code',
    title: 'Code',
    description: 'Generate your application with AI',
    icon: 'Code',
    color: 'bg-cyan-500',
    estimatedTime: '25 min'
  },
  {
    id: 'connect',
    title: 'Connect',
    description: 'Integrate essential services',
    icon: 'Link',
    color: 'bg-indigo-500',
    estimatedTime: '20 min'
  },
  {
    id: 'launch',
    title: 'Launch',
    description: 'Prepare for go-to-market',
    icon: 'Rocket',
    color: 'bg-red-500',
    estimatedTime: '30 min'
  }
];

export function getStageConfig(stage: ProjectStage): StageConfig {
  return WORKFLOW_STAGES.find(s => s.id === stage) || WORKFLOW_STAGES[0];
}

export function getNextStage(currentStage: ProjectStage): ProjectStage | null {
  const currentIndex = WORKFLOW_STAGES.findIndex(s => s.id === currentStage);
  if (currentIndex === -1 || currentIndex === WORKFLOW_STAGES.length - 1) {
    return null;
  }
  return WORKFLOW_STAGES[currentIndex + 1].id;
}

export function getPreviousStage(currentStage: ProjectStage): ProjectStage | null {
  const currentIndex = WORKFLOW_STAGES.findIndex(s => s.id === currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  return WORKFLOW_STAGES[currentIndex - 1].id;
}

export function calculateOverallProgress(project: { data: Record<string, { completed?: boolean }> }): number {
  const stages = Object.keys(project.data || {});
  const completedStages = stages.filter(stage => project.data[stage]?.completed);
  return Math.round((completedStages.length / WORKFLOW_STAGES.length) * 100);
}