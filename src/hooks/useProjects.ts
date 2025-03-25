import { useState, useCallback } from 'react';
import { Project, ProjectCreateInput, ProjectUpdateInput } from '@/types/project';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all projects
  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      const projectsList = data.data || [];
      setProjects(projectsList);
      return projectsList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch a single project by ID
  const fetchProject = useCallback(async (id: string): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      const project = data.data;
      setSelectedProject(project);
      return project;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get projects by organization ID
  const getProjectsByOrganization = useCallback(async (organizationId: string): Promise<Project[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/projects`);
      if (!response.ok) {
        throw new Error('Failed to fetch organization projects');
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new project
  const createProject = useCallback(async (projectData: ProjectCreateInput): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      const data = await response.json();
      fetchProjects(); // Refresh the list
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects]);

  // Update a project
  const updateProject = useCallback(async (id: string, projectData: ProjectUpdateInput): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      const data = await response.json();
      if (selectedProject?.id === id) {
        setSelectedProject(data.data);
      }
      fetchProjects(); // Refresh the list
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, selectedProject]);

  // Delete a project
  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
      fetchProjects(); // Refresh the list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, selectedProject]);

  return {
    projects,
    selectedProject,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    getProjectsByOrganization,
    createProject,
    updateProject,
    deleteProject,
  };
}; 