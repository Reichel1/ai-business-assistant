"use client";

import { useState } from 'react';
import { Project } from '@/types/project';
import { ProjectDashboard } from '@/components/dashboard/project-dashboard';
import { WorkflowLayout } from '@/components/workflow/workflow-layout';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectCreate = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleExitWorkflow = () => {
    setSelectedProject(null);
  };

  if (selectedProject) {
    return (
      <WorkflowLayout
        project={selectedProject}
        onProjectUpdate={handleProjectUpdate}
        onExit={handleExitWorkflow}
      />
    );
  }

  return (
    <ProjectDashboard
      projects={projects}
      onProjectSelect={handleProjectSelect}
      onProjectCreate={handleProjectCreate}
    />
  );
}
