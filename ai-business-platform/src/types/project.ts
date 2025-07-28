export interface Project {
  id: string;
  name: string;
  description: string;
  stage: ProjectStage;
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  data: ProjectData;
}

export interface ProjectData {
  spark?: SparkData;
  validate?: ValidateData;
  design?: DesignData;
  build?: BuildData;
  code?: CodeData;
  connect?: ConnectData;
  launch?: LaunchData;
}

export interface SparkData {
  ideaDescription: string;
  problemStatement: string;
  targetAudience: string;
  solution: string;
  uniqueValue: string;
  completed: boolean;
}

export interface ValidateData {
  competitors: Competitor[];
  marketSize: string;
  customerPersonas: CustomerPersona[];
  swotAnalysis: SWOTAnalysis;
  completed: boolean;
}

export interface DesignData {
  businessModel: BusinessModel;
  revenueModel: string;
  pricingStrategy: PricingStrategy;
  completed: boolean;
}

export interface BuildData {
  features: Feature[];
  techStack: TechStack;
  architecture: string;
  completed: boolean;
}

export interface CodeData {
  framework: string;
  generatedCode: string;
  repository: string;
  preview: string;
  completed: boolean;
}

export interface ConnectData {
  integrations: Integration[];
  completed: boolean;
}

export interface LaunchData {
  marketingAssets: string[];
  launchPlan: string;
  metrics: string[];
  completed: boolean;
}

export type ProjectStage = 
  | 'spark' 
  | 'validate' 
  | 'design' 
  | 'build' 
  | 'code' 
  | 'connect' 
  | 'launch';

export interface StageConfig {
  id: ProjectStage;
  title: string;
  description: string;
  icon: string;
  color: string;
  estimatedTime: string;
}

// Supporting interfaces
export interface Competitor {
  name: string;
  url: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

export interface CustomerPersona {
  name: string;
  age: string;
  role: string;
  painPoints: string[];
  goals: string[];
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface BusinessModel {
  keyPartners: string[];
  keyActivities: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  customerSegments: string[];
  keyResources: string[];
  channels: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface PricingStrategy {
  model: 'freemium' | 'subscription' | 'one-time' | 'usage-based';
  tiers: PricingTier[];
}

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  complexity: number; // 1-5
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  hosting: string;
}

export interface Integration {
  name: string;
  type: 'payment' | 'email' | 'analytics' | 'storage' | 'other';
  configured: boolean;
}