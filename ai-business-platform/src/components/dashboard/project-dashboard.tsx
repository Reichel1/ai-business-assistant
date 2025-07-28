"use client";

import { useState } from 'react';
import { Project } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Lightbulb, ArrowRight, MoreHorizontal } from 'lucide-react';
import { getStageConfig } from '@/lib/workflow-config';

interface ProjectDashboardProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function ProjectDashboard({ projects, onProjectSelect, onProjectCreate }: ProjectDashboardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      onProjectCreate({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        stage: 'spark',
        progress: 0,
        data: {}
      });
      setNewProject({ name: '', description: '' });
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Business Platform</h1>
              <p className="text-sm text-gray-500">Transform your ideas into reality</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="E.g., Fitness Class Booking App"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Brief description of your project idea..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} disabled={!newProject.name.trim()}>
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Lightbulb className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to build your next big idea?
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start by creating your first project. Our AI will guide you through validation, 
              design, and development step by step.
            </p>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-green-500 hover:bg-green-600">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Project
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          /* Projects Grid */
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Projects ({projects.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const stageConfig = getStageConfig(project.stage);
                return (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-600">{project.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Current Stage */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full ${stageConfig.color} flex items-center justify-center`}>
                              <span className="text-white text-xs font-medium">
                                {stageConfig.title[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Current: {stageConfig.title}</p>
                              <p className="text-xs text-gray-500">{stageConfig.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          className="w-full" 
                          onClick={() => onProjectSelect(project)}
                        >
                          Continue Working
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}