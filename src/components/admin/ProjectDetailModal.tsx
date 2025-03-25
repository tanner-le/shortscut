import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { FiX, FiCalendar, FiClock, FiPaperclip, FiSend, FiEdit2, FiTrash2, FiChevronDown, FiCheck, FiMessageSquare, FiAlertTriangle, FiUsers, FiInfo } from 'react-icons/fi';
import { Project, ProjectStatus } from '@/types/project';

interface ProjectDetailModalProps {
  project: Project;
  organization: any;
  isOpen: boolean;
  onClose: () => void;
}

// Sample team members for the project (to be replaced with real data in production)
const PROJECT_TEAM = [
  {
    id: 'admin1',
    name: 'David Admin',
    role: 'admin',
    avatar: null,
    initial: 'D',
    color: 'bg-blue-600',
  },
  {
    id: 'client1',
    name: 'Sarah Client',
    role: 'client',
    avatar: null,
    initial: 'S',
    color: 'bg-purple-600',
  },
  {
    id: 'team1',
    name: 'Michael Filmmaker',
    role: 'teamMember',
    avatar: null,
    initial: 'M',
    color: 'bg-green-600',
  },
  {
    id: 'team2',
    name: 'Alex Editor',
    role: 'teamMember',
    avatar: null,
    initial: 'A',
    color: 'bg-amber-600',
  },
];

// Mock messages for the communication system
const MOCK_MESSAGES = [
  {
    id: '1',
    userId: 'admin1',
    userName: 'David Admin',
    userRole: 'admin',
    content: 'We need to update the timeline for this project based on client feedback.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    attachments: [],
  },
  {
    id: '2',
    userId: 'client1',
    userName: 'Sarah Client',
    userRole: 'client',
    content: 'Looks good! I was wondering if we could speed up the filming phase?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    attachments: [],
  },
  {
    id: '3',
    userId: 'team1',
    userName: 'Michael Filmmaker',
    userRole: 'teamMember',
    content: 'I\'ve added the latest storyboard drafts to the project files. Let me know what you think!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    attachments: [
      { name: 'storyboard_v2.pdf', size: '2.4 MB' }
    ],
  },
];

export default function ProjectDetailModal({ project, organization, isOpen, onClose }: ProjectDetailModalProps) {
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [messageText, setMessageText] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;
  
  // Function to handle status change
  const handleStatusChange = async (newStatus: ProjectStatus) => {
    // Only prompt for confirmation if status is actually changing
    if (newStatus !== status) {
      setPendingStatus(newStatus);
      setShowStatusConfirm(true);
    }
    setShowStatusMenu(false);
  };

  // Function to confirm status change
  const confirmStatusChange = async () => {
    if (pendingStatus) {
      try {
        setStatus(pendingStatus);
        // In a real implementation, this would update the project in the database
        // await fetch(`/api/projects/${project.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ status: pendingStatus }),
        // });
      } catch (error) {
        console.error('Failed to update project status:', error);
      }
    }
    setShowStatusConfirm(false);
    setPendingStatus(null);
  };

  // Function to handle message submission
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    // In a real implementation, this would send the message to the server
    // and then update the UI
    console.log('Sending message:', messageText);
    setMessageText('');
    
    // Scroll to bottom of chat
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Helper to get status color
  const getStatusColor = (projectStatus: ProjectStatus) => {
    switch (projectStatus) {
      case 'not_started': return 'bg-gray-400';
      case 'writing': return 'bg-blue-400';
      case 'filming': return 'bg-yellow-400';
      case 'editing': return 'bg-purple-400';
      case 'revising': return 'bg-orange-400';
      case 'delivered': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  // Helper to format status for display
  const formatStatus = (projectStatus: ProjectStatus) => {
    return projectStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get a team member by ID
  const getTeamMember = (userId: string) => {
    return PROJECT_TEAM.find(member => member.id === userId) || {
      name: 'Unknown User',
      role: 'unknown',
      avatar: null,
      initial: 'U',
      color: 'bg-gray-600',
    };
  };

  // Project Details Component
  const ProjectDetailsContent = () => (
    <div className="space-y-5">
      {/* Organization info */}
      <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-700/50 shadow-md">
        <div className="bg-[#151f2e] px-4 py-2.5 border-b border-gray-700/50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Organization</h3>
          {organization?.plan && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              organization.plan === 'studio' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {organization.plan} plan
            </span>
          )}
        </div>
        <div className="p-4 flex items-center gap-x-8">
          <div className="flex items-center flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {organization?.name?.charAt(0) || '?'}
            </div>
            <div className="ml-3">
              <p className="text-white font-medium">{organization?.name || 'Unknown'}</p>
              <div className="flex items-center text-xs text-gray-400 mt-0.5">
                <span className="flex items-center">
                  {organization?.email && (
                    <span className="mr-3">Email: {organization.email}</span>
                  )}
                  {organization?.phone && (
                    <span>Phone: {organization.phone}</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project information in two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Description */}
          <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-700/50 shadow-md">
            <div className="bg-[#151f2e] px-4 py-2.5 border-b border-gray-700/50">
              <h3 className="text-sm font-medium text-white">Project Description</h3>
            </div>
            <div className="p-4">
              <p className="text-white text-sm">{project.description || 'No description provided'}</p>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-700/50 shadow-md">
            <div className="bg-[#151f2e] px-4 py-2.5 border-b border-gray-700/50">
              <h3 className="text-sm font-medium text-white">Timeline</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                  <FiCalendar className="text-blue-400 h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Start Date</p>
                  <p className="text-white text-sm font-medium">{format(new Date(project.startDate), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              {project.dueDate && (
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center mr-3">
                    <FiClock className="text-orange-400 h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
                    <p className="text-white text-sm font-medium">{format(new Date(project.dueDate), 'MMMM d, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column */}
        <div className="space-y-5">
          {/* Team Members */}
          <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-700/50 shadow-md">
            <div className="bg-[#151f2e] px-4 py-2.5 border-b border-gray-700/50">
              <h3 className="text-sm font-medium text-white flex items-center">
                <FiUsers className="mr-1.5 h-4 w-4 text-gray-500" />
                Team Members
              </h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {PROJECT_TEAM.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center bg-[#151f2e] rounded-full pl-1 pr-3 py-1"
                  >
                    <div className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-medium mr-2`}>
                      {member.initial}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{member.name}</p>
                      <p className="text-xs text-gray-400 -mt-0.5">{
                        member.role === 'admin' 
                          ? 'Admin' 
                          : member.role === 'client' 
                            ? 'Client' 
                            : 'Team Member'
                      }</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Project Management */}
          <div className="bg-[#111827] rounded-xl overflow-hidden border border-gray-700/50 shadow-md">
            <div className="bg-[#151f2e] px-4 py-2.5 border-b border-gray-700/50">
              <h3 className="text-sm font-medium text-white">Project Management</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Created:</span>
                <span className="text-white">{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last Updated:</span>
                <span className="text-white">{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
              </div>
              
              {/* Project Actions */}
              <div className="pt-3 mt-3 border-t border-gray-700/30 space-y-3">
                {/* Edit Project Button */}
                <button 
                  onClick={() => window.location.href = `/admin/projects/${project.id}/edit`}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-blue-700/30 text-sm font-medium rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 hover:border-blue-700/50 transition-colors"
                >
                  <FiEdit2 className="mr-1.5 -ml-0.5 h-4 w-4" />
                  Edit Project
                </button>
                
                {/* Delete project button */}
                {showDeleteConfirm ? (
                  <div>
                    <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mb-3">
                      <div className="flex items-start">
                        <FiAlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">
                          Are you sure you want to delete this project? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                        // In a real implementation, this would delete the project
                        onClick={() => console.log('Delete project:', project.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-red-700/30 text-sm font-medium rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-700/50 transition-colors"
                  >
                    <FiTrash2 className="mr-1.5 -ml-0.5 h-4 w-4" />
                    Delete Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Chat Component
  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-5 py-3 border-b border-gray-700/50 bg-[#151f2e] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center">
          <FiMessageSquare className="mr-1.5 h-4 w-4 text-gray-500" />
          Chat
        </h3>
        
        {/* Display team avatars */}
        <div className="flex -space-x-1">
          {PROJECT_TEAM.map((member) => (
            <div
              key={member.id}
              className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-medium border border-[#151f2e]`}
              title={`${member.name} (${member.role})`}
            >
              {member.initial}
            </div>
          ))}
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-grow overflow-y-auto px-5 py-4 space-y-4">
        {MOCK_MESSAGES.map((message) => {
          const member = getTeamMember(message.userId);
          return (
            <div key={message.id} className="flex items-start group">
              <div className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center text-white font-medium mr-2 flex-shrink-0`}>
                {member.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline mb-0.5">
                  <span className="font-medium text-white text-xs">{message.userName}</span>
                  <span className="ml-auto text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {format(message.timestamp, 'h:mm a')}
                  </span>
                </div>
                <div className="bg-[#1a2233] p-2 rounded-lg shadow-sm">
                  <p className="text-gray-300 text-sm">{message.content}</p>
                  
                  {message.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-md px-2 py-1 flex items-center text-xs group cursor-pointer hover:bg-gray-700/50 transition-colors">
                          <FiPaperclip className="mr-1 text-gray-400" />
                          <span className="text-gray-300">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {format(message.timestamp, 'MMM d')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      
      {/* Message input */}
      <div className="px-5 py-3 border-t border-gray-700/50">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-[#1a2233] border border-gray-700/50 rounded-full py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
            />
            <button className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors">
              <FiPaperclip size={16} />
              <span className="sr-only">Attach file</span>
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className={`rounded-full p-2 ${
              messageText.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600/50 cursor-not-allowed text-blue-300/50'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#111827]`}
            aria-label="Send message"
          >
            <FiSend size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
           onClick={onClose} 
           aria-hidden="true" />
      
      <div className="relative w-full max-w-6xl mx-auto flex flex-col max-h-[90vh] bg-gradient-to-b from-[#1a2233] to-[#111827] rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden transform transition-all">
        {/* Header with title and actions */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-700/50 bg-[#111827]">
          <h2 className="text-xl font-bold text-white flex items-center">
            {project.title}
            
            {/* Status indicator */}
            <div className="relative ml-4">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-700/50 bg-[#151f2e] hover:bg-[#1c273a] transition-colors"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)} mr-2`}></span>
                <span className="text-sm font-medium text-white">{formatStatus(status)}</span>
                <FiChevronDown className="ml-2 h-4 w-4 text-gray-400" />
              </button>
              
              {/* Status dropdown menu */}
              {showStatusMenu && (
                <div 
                  ref={statusMenuRef}
                  className="absolute top-full left-0 mt-1 w-56 bg-[#151f2e] rounded-lg shadow-lg border border-gray-700/50 py-1 z-10"
                >
                  {(['not_started', 'writing', 'filming', 'editing', 'revising', 'delivered'] as ProjectStatus[]).map((statusOption) => (
                    <button
                      key={statusOption}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700/30 flex items-center ${
                        status === statusOption ? 'bg-gray-700/20 font-medium' : ''
                      }`}
                      onClick={() => handleStatusChange(statusOption)}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(statusOption)} mr-2`}></span>
                      {formatStatus(statusOption)}
                      {status === statusOption && (
                        <FiCheck className="ml-auto h-4 w-4 text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </h2>
          
          {/* Action buttons in header */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
              aria-label="Close modal"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile tabs - only visible on small screens */}
        <div className="lg:hidden flex border-b border-gray-700/50 bg-[#151f2e]">
          <button
            className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('details')}
          >
            <span className="flex items-center justify-center">
              <FiInfo className="mr-1.5 h-4 w-4" />
              Project Details
            </span>
            {activeTab === 'details' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></span>
            )}
          </button>
          <button
            className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="flex items-center justify-center">
              <FiMessageSquare className="mr-1.5 h-4 w-4" />
              Chat
            </span>
            {activeTab === 'chat' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></span>
            )}
          </button>
        </div>

        {/* Main content - Responsive layout with tabs for mobile and side-by-side for desktop */}
        <div className="flex-grow overflow-hidden flex flex-col lg:flex-row">
          {/* Project details section */}
          <div className={`
            ${activeTab === 'details' ? 'block' : 'hidden'}
            lg:block lg:w-3/4 overflow-auto p-6
          `}>
            <ProjectDetailsContent />
          </div>
          
          {/* Chat section */}
          <div className={`
            ${activeTab === 'chat' ? 'flex' : 'hidden'} 
            lg:flex lg:w-1/4 lg:border-l border-gray-700/50 flex-col h-full bg-[#111827]
          `}>
            <ChatContent />
          </div>
        </div>
        
        {/* Status change confirmation dialog */}
        {showStatusConfirm && pendingStatus && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-[#1a2233] rounded-lg shadow-lg border border-gray-700/50 p-5 max-w-sm w-full">
              <h3 className="text-lg font-medium text-white mb-3">Change Project Status</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to change the project status from <span className="font-medium text-white">{formatStatus(status)}</span> to <span className="font-medium text-white">{formatStatus(pendingStatus)}</span>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStatusConfirm(false);
                    setPendingStatus(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Close button at bottom - only visible on mobile */}
        <div className="lg:hidden bg-[#111827] px-6 py-4 border-t border-gray-700/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 