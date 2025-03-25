import React, { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiPlus, FiArrowRight, FiCalendar, FiUser, FiClock, FiChevronDown, FiSliders } from 'react-icons/fi';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import Link from 'next/link';
import ProjectDetailModal from './ProjectDetailModal';
import CreateProjectModal from './CreateProjectModal';
import { Project, ProjectStatus } from '@/types/project';

// CSS for hiding scrollbar while maintaining functionality
const hideScrollbarStyle = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

// Helper to get status color styles
const getStatusStyles = (status: ProjectStatus) => {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-800';
    case 'writing':
      return 'bg-blue-100 text-blue-800';
    case 'filming':
      return 'bg-yellow-100 text-yellow-800';
    case 'editing':
      return 'bg-purple-100 text-purple-800';
    case 'revising':
      return 'bg-orange-100 text-orange-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper to get status color styles for dark mode
const getStatusDarkStyles = (status: ProjectStatus) => {
  switch (status) {
    case 'not_started':
      return 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20';
    case 'writing':
      return 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20';
    case 'filming':
      return 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20';
    case 'editing':
      return 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20';
    case 'revising':
      return 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20';
    case 'delivered':
      return 'bg-green-500/10 text-green-400 hover:bg-green-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20';
  }
};

// Helper to get status color for badges and indicators
const getStatusBadgeColor = (status: ProjectStatus) => {
  switch (status) {
    case 'not_started': return 'bg-gray-400';
    case 'writing': return 'bg-blue-400';
    case 'filming': return 'bg-yellow-400';
    case 'editing': return 'bg-purple-400';
    case 'revising': return 'bg-orange-400';
    case 'delivered': return 'bg-green-400';
    default: return 'bg-gray-400';
  }
};

// Helper to format status display
const formatStatus = (status: ProjectStatus) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to check if project is overdue
const isOverdue = (dueDate: string | Date | null) => {
  if (!dueDate) return false;
  return isBefore(new Date(dueDate), new Date());
};

// Helper to check if project is due soon (within 3 days)
const isDueSoon = (dueDate: string | Date | null) => {
  if (!dueDate) return false;
  const today = new Date();
  const threeDaysFromNow = addDays(today, 3);
  const dueDateObj = new Date(dueDate);
  return isAfter(dueDateObj, today) && isBefore(dueDateObj, threeDaysFromNow);
};

// Get month count for each organization
const getMonthlyProjectCount = (projects: Project[], organizationId: string) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return projects.filter(project => {
    const projectDate = new Date(project.createdAt);
    return (
      project.organizationId === organizationId &&
      projectDate.getMonth() === currentMonth &&
      projectDate.getFullYear() === currentYear
    );
  }).length;
};

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [organizations, setOrganizations] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState(0);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Calculate status counts
  const statusCounts = {
    all: projects.length,
    not_started: projects.filter(p => p.status === 'not_started').length,
    writing: projects.filter(p => p.status === 'writing').length,
    filming: projects.filter(p => p.status === 'filming').length,
    editing: projects.filter(p => p.status === 'editing').length,
    revising: projects.filter(p => p.status === 'revising').length,
    delivered: projects.filter(p => p.status === 'delivered').length,
  };

  // Fetch projects and organizations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch projects
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.data || []);
        
        // Fetch organizations for reference
        const orgsResponse = await fetch('/api/organizations');
        if (!orgsResponse.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const orgsData = await orgsResponse.json();
        
        // Create a lookup map of organizations by id
        const orgsMap = (orgsData.data || []).reduce((acc: Record<string, any>, org: any) => {
          acc[org.id] = org;
          return acc;
        }, {});
        
        console.log('Fetched organizations:', orgsData.data);
        setOrganizations(orgsMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter projects based on search term and status filter
  useEffect(() => {
    let filtered = [...projects];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        project => 
          project.title.toLowerCase().includes(term) || 
          organizations[project.organizationId]?.name.toLowerCase().includes(term)
      );
    }
    
    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, organizations]);

  // Handle creation of a new project
  const handleCreateProject = async (projectData: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Project creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to create project');
      }

      const result = await response.json();
      
      // Add the new project to the list
      setProjects([result.data, ...projects]);
      
      return result.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };
  
  // Handle project deletion
  const handleProjectDelete = async (projectId: string) => {
    try {
      const updatedProjects = projects.filter(project => project.id !== projectId);
      setProjects(updatedProjects);
      setShowModal(false);
    } catch (error) {
      console.error('Error handling project deletion:', error);
    }
  };
  
  // Handle project status change
  const handleProjectStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => 
        project.id === projectId ? { ...project, status: newStatus } : project
      );
      setProjects(updatedProjects);
      
      // If the selected project is the one being updated, update it too
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({ ...selectedProject, status: newStatus });
      }
    } catch (error) {
      console.error('Error handling project status change:', error);
    }
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const getProjectLimitWarning = (project: Project) => {
    const organization = organizations[project.organizationId];
    if (!organization) return null;
    
    const monthlyCount = getMonthlyProjectCount(projects, project.organizationId);
    const limit = organization.plan === 'studio' ? 16 : 8;
    const percentUsed = (monthlyCount / limit) * 100;
    
    if (percentUsed >= 100) {
      return (
        <div className="flex items-center text-red-500 text-xs mt-1">
          <span className="font-medium">Limit reached!</span>
        </div>
      );
    }
    
    if (percentUsed >= 75) {
      return (
        <div className="flex items-center text-yellow-500 text-xs mt-1">
          <span className="font-medium">{monthlyCount}/{limit} projects this month</span>
        </div>
      );
    }
    
    return null;
  };

  // Refresh projects after a successful action
  const refreshProjects = async () => {
    try {
      const projectsResponse = await fetch('/api/projects');
      if (!projectsResponse.ok) {
        throw new Error('Failed to refresh projects');
      }
      const projectsData = await projectsResponse.json();
      const updatedProjects = projectsData.data || [];
      setProjects(updatedProjects);
      
      // If there's a selected project, update it with the latest data
      if (selectedProject) {
        const updatedSelectedProject = updatedProjects.find((p: Project) => p.id === selectedProject.id);
        if (updatedSelectedProject) {
          setSelectedProject(updatedSelectedProject);
        }
      }
    } catch (err) {
      console.error('Error refreshing projects:', err);
    }
  };

  // Trigger a subtle scroll animation on initial render to indicate scrollability
  useEffect(() => {
    if (filteredProjects.length > 3) {
      const container = document.getElementById('project-scroll-container');
      if (container) {
        // Wait for component to render
        const timer = setTimeout(() => {
          // Highlight the right arrow instead of scrolling content
          const rightArrow = document.querySelector('.scroll-indicator-right');
          if (rightArrow && rightArrow.parentElement) {
            // Flash the right arrow
            rightArrow.parentElement.classList.add('opacity-100');
            rightArrow.classList.add('animate-pulse');
            
            // After animation, return to normal state
            setTimeout(() => {
              if (rightArrow && rightArrow.parentElement) {
                rightArrow.parentElement.classList.remove('opacity-100');
                rightArrow.classList.remove('animate-pulse');
              }
            }, 1500);
          }
        }, 1000);
        
        return () => {
          clearTimeout(timer);
        };
      }
    }
  }, [filteredProjects.length]);

  if (loading) {
    return (
      <div className="bg-[#1a2233] shadow-lg rounded-xl p-6 mb-6 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
        </div>
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-10 bg-gray-700 rounded w-full"></div>
          <div className="h-20 bg-gray-700 rounded w-full"></div>
          <div className="h-20 bg-gray-700 rounded w-full"></div>
          <div className="h-20 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a2233] shadow-lg rounded-xl p-6 mb-6 border border-red-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
        </div>
        <div className="text-red-500 bg-red-900/20 p-4 rounded-lg">
          Error loading projects: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a2233] shadow-lg rounded-xl p-6 mb-6 border border-gray-800">
      {/* Inject CSS for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: hideScrollbarStyle }} />
      
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-white">Projects</h2>
        <div className="flex flex-wrap w-full sm:w-auto gap-2">
          <div className="flex items-center w-full sm:w-auto gap-2">
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-9 pr-4 py-1.5 rounded-md bg-[#2a3347] border border-[#3b4559] text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#2a3347] pl-9 pr-8 py-1.5 text-sm text-gray-200 rounded-md border border-[#3b4559] appearance-none focus:outline-none"
                  aria-label="Filter projects by status"
                >
                  <option value="all">All Projects</option>
                  <option value="not_started">Not Started</option>
                  <option value="writing">Writing</option>
                  <option value="filming">Filming</option>
                  <option value="editing">Editing</option>
                  <option value="revising">Revising</option>
                  <option value="delivered">Delivered</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FiChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>
            </div>
            <button 
              className="p-1.5 rounded-md bg-[#2a3347] border border-[#3b4559] text-gray-300 hover:text-white focus:outline-none"
              aria-label="Advanced filters"
            >
              <FiSliders className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center rounded-md bg-[#FF4F01] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#FF4F01]/90 transition-all duration-200 whitespace-nowrap"
          >
            <FiPlus className="mr-1.5 -ml-0.5 h-4 w-4" /> New Project
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`py-1.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center ${
              statusFilter === 'all'
                ? 'bg-[#FF4F01] text-white'
                : 'bg-[#2a3347] text-gray-300 hover:bg-[#3b4559] hover:text-white'
            }`}
          >
            All Projects
            {statusCounts.all > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-white/20">
                {statusCounts.all}
              </span>
            )}
          </button>
          
          {/* Status buttons with counts */}
          {(['not_started', 'writing', 'filming', 'editing', 'revising', 'delivered'] as ProjectStatus[]).map(status => {
            const count = statusCounts[status];
            if (count === 0) return null; // Don't show statuses with no projects
            
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`py-1.5 px-3 rounded-md text-sm font-medium transition-colors flex items-center ${
                  statusFilter === status
                    ? 'bg-[#FF4F01] text-white' // Active status
                    : getStatusDarkStyles(status) // Inactive status with matching color
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${getStatusBadgeColor(status)} mr-2`}></span>
                {formatStatus(status)}
                <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-white/20">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-400 mb-4">
        {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} {statusFilter !== 'all' ? `with status "${formatStatus(statusFilter as ProjectStatus)}"` : ''} {searchTerm ? `matching "${searchTerm}"` : ''}
      </h3>

      {/* Projects list */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#111827] rounded-lg p-8 text-center">
          <p className="text-gray-400">
            {searchTerm || statusFilter !== 'all'
              ? 'No projects match your filters'
              : 'No projects found'}
          </p>
        </div>
      ) : (
        <div className="relative group">
          {/* Left scroll indicator/button */}
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 pl-0.5 pr-3 py-10 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100" 
            onClick={() => {
              const container = document.getElementById('project-scroll-container');
              if (container) {
                // Smooth scroll by 80% of the container width
                const scrollDistance = container.clientWidth * 0.8;
                container.scrollBy({ 
                  left: -scrollDistance, 
                  behavior: 'smooth' 
                });
              }
            }}
            aria-label="Scroll left"
            style={{ transform: 'translate(8px, -50%)' }}
          >
            <div className="h-8 w-8 rounded-full bg-[#1D2939]/80 backdrop-blur-sm flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 scroll-indicator-left">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </div>
          </button>
          
          {/* Right scroll indicator/button */}
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 pr-0.5 pl-3 py-10 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:opacity-100" 
            onClick={() => {
              const container = document.getElementById('project-scroll-container');
              if (container) {
                // Smooth scroll by 80% of the container width
                const scrollDistance = container.clientWidth * 0.8;
                container.scrollBy({ 
                  left: scrollDistance, 
                  behavior: 'smooth' 
                });
              }
            }}
            aria-label="Scroll right"
            style={{ transform: 'translate(-8px, -50%)' }}
          >
            <div className="h-8 w-8 rounded-full bg-[#1D2939]/80 backdrop-blur-sm flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 scroll-indicator-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          {/* Shadow indicators for scrollability */}
          <div className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none bg-gradient-to-r from-[#1a2233] to-transparent z-10 opacity-70"></div>
          <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none bg-gradient-to-l from-[#1a2233] to-transparent z-10 opacity-70"></div>
          
          <div 
            id="project-scroll-container" 
            className="overflow-x-auto hide-scrollbar scroll-smooth-container pb-4 scrollbar-track-[#151f2e] scrollbar-thumb-[#2a3347] hover:scrollbar-thumb-[#3b4559] scrollbar-thin px-6"
            ref={(ref) => {
              if (ref) {
                // Add smooth scrolling with momentum
                let isScrolling = false;
                let scrollAmount = 0;
                let scrollDirection = 0;
                let lastScrollLeft = 0;
                
                // Update active section on any scroll movement
                const updateActiveSection = () => {
                  // Get position information
                  const scrollPosition = ref.scrollLeft;
                  const containerWidth = ref.clientWidth;
                  const scrollWidth = ref.scrollWidth;
                  
                  // Calculate how many cards can fit per view
                  const cardWidth = 300; // Card width
                  const cardGap = 20; // Gap between cards
                  const totalCardWidth = cardWidth + cardGap;
                  const cardsPerView = Math.floor(containerWidth / totalCardWidth);
                  
                  // Calculate the total number of possible sections
                  const totalSections = Math.ceil(filteredProjects.length / cardsPerView);
                  
                  // Calculate the percentage scrolled (as a value between 0 and 1)
                  const maxScroll = scrollWidth - containerWidth;
                  const scrollPercentage = maxScroll > 0 ? scrollPosition / maxScroll : 0;
                  
                  // Calculate the active section index
                  // We multiply by (totalSections-1) because index is 0-based
                  const newSection = Math.min(
                    totalSections - 1,
                    Math.max(0, Math.round(scrollPercentage * (totalSections - 1)))
                  );
                  
                  // Only update state if section changed
                  if (newSection !== activeSection) {
                    setActiveSection(newSection);
                  }
                };
                
                const smoothScroll = () => {
                  if (!scrollDirection) return;
                  
                  // Apply scroll with gradually decreasing momentum
                  ref.scrollLeft += scrollAmount * scrollDirection;
                  scrollAmount *= 0.92; // Damping factor for smooth deceleration
                  
                  // Update active section during momentum scrolling
                  updateActiveSection();
                  
                  // Stop when movement becomes minimal
                  if (Math.abs(scrollAmount) > 0.5) {
                    requestAnimationFrame(smoothScroll);
                  } else {
                    isScrolling = false;
                    // Final check of active section when scroll momentum ends
                    updateActiveSection();
                  }
                };
                
                ref.addEventListener('wheel', (e) => {
                  e.preventDefault();
                  
                  // Normalize scroll speed across different browsers/devices
                  const delta = Math.abs(e.deltaY);
                  const direction = Math.sign(e.deltaY);
                  
                  // Start with a reasonable initial scroll speed (adjusted for delta magnitude)
                  scrollAmount = Math.min(Math.max(delta * 0.4, 5), 30); 
                  scrollDirection = direction;
                  
                  // Start smooth scrolling if not already in progress
                  if (!isScrolling) {
                    isScrolling = true;
                    lastScrollLeft = ref.scrollLeft;
                    requestAnimationFrame(smoothScroll);
                  }
                }, { passive: false });
                
                // Direct scroll event for real-time position tracking
                ref.addEventListener('scroll', () => {
                  // Update dots immediately during regular scrolling
                  updateActiveSection();
                }, { passive: true });
                
                // Additional touch scrolling smoothness (for mobile)
                let startX = 0;
                let scrollLeft = 0;
                
                ref.addEventListener('touchstart', (e) => {
                  startX = e.touches[0].pageX - ref.offsetLeft;
                  scrollLeft = ref.scrollLeft;
                }, { passive: true });
                
                ref.addEventListener('touchmove', (e) => {
                  if (!startX) return;
                  
                  const x = e.touches[0].pageX - ref.offsetLeft;
                  const walk = (x - startX) * 2; // Scroll speed multiplier
                  ref.scrollLeft = scrollLeft - walk;
                  
                  // Update section during touch scrolling
                  updateActiveSection();
                }, { passive: true });
                
                // Initial calculation of active section
                setTimeout(updateActiveSection, 100);
              }
            }}
          >
            <div className="flex gap-5 pt-3 pb-1 min-w-full">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => openProjectModal(project)}
                  className="w-[300px] flex-none snap-start h-auto min-h-[240px] bg-[#111827] rounded-lg border border-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col project-card scroll-snap-item"
                >
                  {/* Card header with colored border based on status */}
                  <div className={`p-4 border-b border-gray-700 ${
                    project.status === 'writing' ? 'border-t-2 border-t-blue-500' :
                    project.status === 'filming' ? 'border-t-2 border-t-yellow-500' :
                    project.status === 'editing' ? 'border-t-2 border-t-purple-500' :
                    project.status === 'revising' ? 'border-t-2 border-t-orange-500' :
                    project.status === 'delivered' ? 'border-t-2 border-t-green-500' :
                    'border-t-2 border-t-gray-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(project.status)}`}
                      >
                        {formatStatus(project.status)}
                      </span>
                      
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        organizations[project.organizationId]?.plan === 'studio'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {organizations[project.organizationId]?.plan === 'studio' ? 'Studio' : 'Creator'}
                      </span>
                    </div>
                    
                    <h3 className="mt-2 text-lg font-medium text-white truncate" title={project.title}>
                      {project.title}
                    </h3>
                    
                    <p className="mt-1 text-sm text-gray-400 overflow-hidden text-ellipsis line-clamp-2 min-h-[2.5rem]" title={project.description || 'No description'}>
                      {project.description || 'No description'}
                    </p>
                  </div>
                  
                  {/* Card body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="text-sm text-gray-400">
                      <div className="flex items-center mb-2">
                        <FiCalendar className="mr-2 text-gray-500 flex-shrink-0" size={14} />
                        <span className="text-gray-300">
                          {format(new Date(project.startDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      {project.dueDate && (
                        <div className={`flex items-center ${
                          isOverdue(project.dueDate) 
                            ? 'text-red-400' 
                            : isDueSoon(project.dueDate) 
                              ? 'text-yellow-400' 
                              : 'text-gray-400'
                        }`}>
                          <FiClock className="mr-2 flex-shrink-0" size={14} />
                          <span>Due: {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 border-t border-gray-700 pt-3">
                      <div className="flex items-center">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center max-w-full">
                            <div className="w-2 h-2 rounded-full bg-blue-400 mr-2 flex-shrink-0"></div>
                            <span 
                              className="text-sm text-white font-medium truncate block max-w-[180px]"
                              title={organizations[project.organizationId]?.name || 'Unknown'}
                            >
                              {organizations[project.organizationId]?.name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <button 
                          className="p-1.5 bg-blue-600/20 rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-600/30 transition-colors flex-shrink-0"
                          aria-label="View project details"
                        >
                          <FiArrowRight size={14} />
                        </button>
                      </div>
                      
                      {getProjectLimitWarning(project) && (
                        <div className="mt-2">
                          {getProjectLimitWarning(project)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Scroll position indicator dots */}
          <div className="flex justify-center mt-4 space-x-3">
            {(() => {
              // Calculate number of sections based on viewport width and card size
              const container = document.getElementById('project-scroll-container');
              if (!container) return null;
              
              const cardWidth = 300; // Card width in pixels
              const cardGap = 20; // Gap between cards
              const totalCardWidth = cardWidth + cardGap;
              const containerWidth = container.clientWidth;
              const cardsPerView = Math.max(1, Math.floor(containerWidth / totalCardWidth));
              const totalSections = Math.ceil(filteredProjects.length / cardsPerView);
              
              // Create pagination dots
              return Array.from({ length: totalSections }).map((_, index) => {
                // Check if this is the currently visible section
                const isActive = index === activeSection;
                
                return (
                  <button
                    key={index}
                    className={`transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4F01] ${
                      isActive 
                        ? 'w-6 h-3 rounded-full bg-[#FF4F01]' 
                        : 'w-3 h-3 rounded-full bg-gray-600 hover:bg-gray-500 hover:scale-110'
                    }`}
                    onClick={() => {
                      const container = document.getElementById('project-scroll-container');
                      if (container) {
                        // For single-section case, just scroll to start
                        if (totalSections <= 1) {
                          container.scrollTo({ left: 0, behavior: 'smooth' });
                          return;
                        }
                        
                        // Calculate precise position to center the section
                        const cardsPerSection = cardsPerView;
                        const cardPosition = index * cardsPerSection;
                        const exactPosition = cardPosition * (cardWidth + cardGap);
                        
                        // Scroll with smooth animation
                        container.scrollTo({ 
                          left: exactPosition, 
                          behavior: 'smooth' 
                        });
                        
                        // Update active section immediately for instant feedback
                        setActiveSection(index);
                      }
                    }}
                    aria-label={`Scroll to section ${index + 1} of ${totalSections}`}
                    aria-current={isActive ? 'true' : 'false'}
                  />
                );
              });
            })()}
          </div>
        </div>
      )}
      
      {/* Project detail modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          organization={organizations[selectedProject.organizationId]}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onStatusChange={handleProjectStatusChange}
          onProjectDelete={handleProjectDelete}
          onSuccessfulAction={refreshProjects}
          organizations={Object.values(organizations)}
        />
      )}

      {/* Create project modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        organizations={Object.values(organizations)}
      />
    </div>
  );
} 