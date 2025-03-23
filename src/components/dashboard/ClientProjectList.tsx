'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiFile, FiClock, FiCheckCircle, FiCalendar } from 'react-icons/fi';

type Project = {
  id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  dueDate: string;
  description?: string;
};

export default function ClientProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would fetch projects from an API
    // For now, we'll just use some placeholder data
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          name: 'Website Redesign',
          status: 'in_progress',
          dueDate: '2023-12-15',
          description: 'Redesign of the company website with new branding',
        },
        {
          id: '2',
          name: 'Social Media Campaign',
          status: 'planning',
          dueDate: '2024-01-10',
          description: 'Q1 social media campaign for product launch',
        },
        {
          id: '3',
          name: 'Email Newsletter',
          status: 'completed',
          dueDate: '2023-11-01',
          description: 'Monthly newsletter for November',
        },
      ]);
      setIsLoading(false);
    }, 1000); // Simulate loading
  }, []);

  // Get status badge styling
  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Planning',
          icon: FiFile,
        };
      case 'in_progress':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'In Progress',
          icon: FiClock,
        };
      case 'review':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          label: 'Review',
          icon: FiFile,
        };
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Completed',
          icon: FiCheckCircle,
        };
      case 'on_hold':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'On Hold',
          icon: FiCalendar,
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status,
          icon: FiFile,
        };
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="mb-4 bg-white rounded-lg shadow p-4 border border-gray-200"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/5"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">Error loading projects: {error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-500">
          You don't have any active projects at the moment. Please contact your account manager for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const statusBadge = getStatusBadge(project.status);
        const StatusIcon = statusBadge.icon;
        
        return (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900 mb-1">{project.name}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
              >
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusBadge.label}
              </span>
            </div>
            
            {project.description && (
              <p className="text-gray-600 text-sm mb-3">{project.description}</p>
            )}
            
            <div className="flex justify-between mt-2">
              <div className="text-sm text-gray-500">
                Due: {new Date(project.dueDate).toLocaleDateString()}
              </div>
              
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View Details
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
} 