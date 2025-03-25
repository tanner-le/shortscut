'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import { 
  FiArrowLeft, FiEdit2, FiUsers, FiCalendar, FiMail, FiPhone, 
  FiBriefcase, FiMapPin, FiFileText, FiPlus, FiMessageCircle, 
  FiSettings, FiClock, FiSearch, FiMoreHorizontal, FiPaperclip,
  FiSend, FiImage, FiFile, FiSmile, FiMoreVertical, FiDownload,
  FiFilter, FiChevronRight
} from 'react-icons/fi';
import Link from 'next/link';
import { Client } from '@/types/client';
import { formatDistanceToNow } from 'date-fns';
import { debug } from '@/lib/debug';
import { createBrowserSupabaseClient } from '@/lib/supabase';

// Type definitions for team members
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'teamMember' | 'admin';
  phoneNumber?: string | null;
  createdAt: string;
}

// Extended client type to include the properties we use
interface ExtendedClient extends Client {
  users?: TeamMember[];
  contracts?: any[];
}

// Sample Message type
interface Message {
  id: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: Date;
  isMe: boolean;
  attachment?: {
    name: string;
    type: string;
    size: string;
    url: string;
  };
}

// Sample conversation type
interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  participants: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  }[];
}

export default function ViewClientPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<ExtendedClient | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchTeam, setSearchTeam] = useState('');
  const [messageText, setMessageText] = useState('');
  const [searchMessages, setSearchMessages] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1'); // Default to first conversation
  const { id } = params;

  // Fetch client data (the AdminDashboardLayout already handles auth)
  useEffect(() => {
    async function fetchClient() {
      try {
        setIsLoading(true);
        debug.log('Fetching client data for ID:', id);
        
        // Make sure we're authenticated before fetching data
        // This will use the existing supabase session without redirecting
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getSession();
        
        debug.log('Session check before fetch:', !!data.session);
        
        // If we got here, we can proceed with the fetch
        const response = await fetch(`/api/clients/${id}`, {
          headers: {
            // Add cache control to prevent stale data
            'Cache-Control': 'no-cache',
            // Include auth token if available
            ...(data.session?.access_token ? {
              'Authorization': `Bearer ${data.session.access_token}`
            } : {})
          }
        });
        
        debug.info('Fetch response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          debug.error('Error response from API:', errorData);
          throw new Error(errorData.message || 'Failed to fetch client');
        }
        
        const responseData = await response.json();
        debug.info('Client API response received');
        debug.inspect('API Response', responseData);
        
        if (!responseData.success || !responseData.data) {
          throw new Error('Invalid data structure received from API');
        }
        
        const clientData = responseData.data;
        debug.inspect('Client data extracted', clientData);
        
        // Extract the data and handle potential missing properties
        setClient(clientData);
        setTeamMembers(Array.isArray(clientData.users) ? clientData.users : []);
        
        debug.log('Client state set successfully');
      } catch (err: any) {
        debug.error('Error fetching client:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchClient();
    } else {
      debug.error('No client ID provided');
      setError('No client ID provided');
      setIsLoading(false);
    }
  }, [id]);

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Calculate time since client joined
  const getTimeSinceJoined = (dateString: string | Date) => {
    if (!dateString) return 'Unknown';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (err) {
      console.error('Error calculating time since joined:', err);
      return 'Unknown';
    }
  };

  // Filter team members based on search
  const filteredTeamMembers = useMemo(() => {
    if (!searchTeam.trim()) return teamMembers;
    
    const searchLower = searchTeam.toLowerCase();
    return teamMembers.filter(
      member => 
        member.name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.role?.toLowerCase().includes(searchLower)
    );
  }, [teamMembers, searchTeam]);

  // Sample conversation data
  const conversations = useMemo(() => [
    {
      id: '1',
      name: 'Contract Discussion',
      lastMessage: 'Can you review the latest contract draft?',
      lastMessageTime: '2h ago',
      unreadCount: 3,
      participants: [
        { id: '1', name: 'Erlich Bachman', avatar: 'E', isOnline: true },
        { id: '2', name: 'James Peterson', avatar: 'J', isOnline: true },
        { id: '3', name: 'Maria Santiago', avatar: 'M', isOnline: false }
      ]
    },
    {
      id: '2',
      name: 'Project Kickoff',
      lastMessage: 'Let\'s schedule our kickoff meeting next week',
      lastMessageTime: '1d ago',
      unreadCount: 0,
      participants: [
        { id: '1', name: 'Erlich Bachman', avatar: 'E', isOnline: true },
        { id: '4', name: 'Sarah Johnson', avatar: 'S', isOnline: true }
      ]
    },
    {
      id: '3',
      name: 'Website Redesign',
      lastMessage: 'I\'ve shared the design files in the project folder',
      lastMessageTime: '3d ago',
      unreadCount: 0,
      participants: [
        { id: '1', name: 'Erlich Bachman', avatar: 'E', isOnline: true },
        { id: '5', name: 'Alex Lee', avatar: 'A', isOnline: false }
      ]
    }
  ], []);

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchMessages.trim()) return conversations;
    
    const searchLower = searchMessages.toLowerCase();
    return conversations.filter(
      convo => 
        convo.name.toLowerCase().includes(searchLower) ||
        convo.lastMessage.toLowerCase().includes(searchLower) ||
        convo.participants.some(p => p.name.toLowerCase().includes(searchLower))
    );
  }, [conversations, searchMessages]);

  // Sample messages data for the selected conversation
  const messages = useMemo(() => [
    {
      id: '1',
      text: 'Hi everyone, I\'ve prepared the latest contract draft for review. Please take a look and let me know your thoughts.',
      sender: 'James Peterson',
      senderId: '2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isMe: false,
      attachment: {
        name: 'Contract_v3.2.pdf',
        type: 'PDF',
        size: '2.4 MB',
        url: '#'
      }
    },
    {
      id: '2',
      text: 'Thanks James, I\'ll review it and get back to you by this afternoon.',
      sender: 'Erlich Bachman',
      senderId: '1',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      isMe: true
    },
    {
      id: '3',
      text: 'I\'ve already gone through the document. There are a few sections that need clarification, particularly regarding the payment terms on page 4.',
      sender: 'Maria Santiago',
      senderId: '3',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isMe: false
    }
  ], []);

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center py-16">
              <div className="animate-pulse text-gray-500">Loading client data for ID: {id}...</div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error || !client) {
    console.error("View Client Error:", error, "Client data:", client);
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiArrowLeft className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error || 'Client data could not be loaded.'} 
                    <Link href="/admin/dashboard" className="font-medium text-red-700 underline ml-1">
                      Return to dashboard
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="mx-auto">
        {/* Dev helper - Only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-6 py-3 bg-yellow-800/20 border border-yellow-500/30 text-yellow-400 text-xs">
            <p>Dev helper: Client ID: {id}</p>
            <button 
              onClick={async () => {
                const supabase = createBrowserSupabaseClient();
                const { data } = await supabase.auth.getSession();
                debug.inspect('Current session', data);
                alert(data.session ? 'Session exists' : 'No session found');
              }}
              className="mt-1 px-2 py-1 bg-yellow-800/50 hover:bg-yellow-800/80 rounded text-xs"
            >
              Check session
            </button>
          </div>
        )}
        
        {/* Top navigation */}
        <header className="px-6 py-4 border-b border-[#2a3347] flex justify-between items-center">
          <Link 
            href="/admin/dashboard" 
            className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors duration-150"
          >
            <FiArrowLeft className="mr-1.5" />
            Back to Dashboard
          </Link>
          
          <Link
            href={`/admin/clients/${client.id}/edit`}
            className="inline-flex items-center px-4 py-1.5 border border-transparent rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors duration-150"
          >
            <FiEdit2 className="mr-1.5 -ml-0.5 h-4 w-4" />
            Edit Client
          </Link>
        </header>
        
        {/* Client profile header */}
        <div className="bg-[#151C2C] px-6 py-8 shadow-md">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="flex">
              <div className="w-18 h-18 bg-[#1D2939] border border-[#2A354C] rounded-xl flex items-center justify-center flex-shrink-0 text-white text-3xl font-bold">
                {client.company[0]}
              </div>
              
              <div className="ml-5 flex flex-col justify-center">
                <h1 className="text-3xl font-bold text-white">{client.company}</h1>
                <div className="flex items-center mt-2 text-gray-400">
                  <FiMapPin className="mr-1.5 h-4 w-4" />
                  <span>{client.industry || 'No industry specified'}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span 
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' 
                        ? 'bg-[#1D2939] text-[#66BB6A] border border-[#66BB6A]/30' 
                        : 'bg-[#1D2939] text-[#FF7043] border border-[#FF7043]/30'
                    }`}
                  >
                    {client.status}
                  </span>
                  
                  <span 
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      client.plan === 'creator' 
                        ? 'bg-[#1D2939] text-[#42A5F5] border border-[#42A5F5]/30' 
                        : 'bg-[#1D2939] text-[#FF4F01] border border-[#FF4F01]/30'
                    }`}
                  >
                    {client.plan === 'creator' ? 'Creator' : 'Studio'} Plan
                  </span>
                  
                  <span className="text-xs text-gray-400 flex items-center">
                    <FiClock className="mr-1.5 h-3 w-3" />
                    Joined {getTimeSinceJoined(client.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {client.email && (
                <a 
                  href={`mailto:${client.email}`} 
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white bg-[#1D2939] hover:bg-[#2A354C] transition-colors duration-150"
                >
                  <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                  {client.email}
                </a>
              )}
              
              {client.phone && (
                <a 
                  href={`tel:${client.phone}`} 
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white bg-[#1D2939] hover:bg-[#2A354C] transition-colors duration-150"
                >
                  <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                  {client.phone}
                </a>
              )}
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="mt-8 border-b border-[#2A354C]">
            <div className="flex space-x-1">
              <button 
                onClick={() => setActiveTab('details')} 
                className={`px-6 py-3 flex items-center font-medium text-sm transition-colors duration-150 ${
                  activeTab === 'details' 
                    ? 'text-white border-b-2 border-[#FF4F01]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <FiFileText className={`mr-2 h-4 w-4 ${activeTab === 'details' ? 'text-[#FF4F01]' : ''}`} />
                Details
              </button>
              <button 
                onClick={() => setActiveTab('team')} 
                className={`px-6 py-3 flex items-center font-medium text-sm transition-colors duration-150 ${
                  activeTab === 'team' 
                    ? 'text-white border-b-2 border-[#FF4F01]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <FiUsers className={`mr-2 h-4 w-4 ${activeTab === 'team' ? 'text-[#FF4F01]' : ''}`} />
                Team
              </button>
              <button 
                onClick={() => setActiveTab('communications')} 
                className={`px-6 py-3 flex items-center font-medium text-sm transition-colors duration-150 ${
                  activeTab === 'communications' 
                    ? 'text-white border-b-2 border-[#FF4F01]' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <FiMessageCircle className={`mr-2 h-4 w-4 ${activeTab === 'communications' ? 'text-[#FF4F01]' : ''}`} />
                Communications
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Main content area */}
          <div className="lg:flex-1 px-6 py-6">
            {/* Details tab */}
            {activeTab === 'details' && (
              <div className="fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Client Overview Card - Redesigned information section */}
                  <div className="lg:col-span-2 bg-[#151C2C] rounded-xl border border-[#2A354C] overflow-hidden shadow-lg">
                    <div className="px-5 py-4 border-b border-[#2A354C] flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">Client Information</h3>
                      <button className="text-[#FF4F01] hover:text-[#FF7E3D] text-sm flex items-center transition-colors duration-200">
                        <FiEdit2 className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </button>
                    </div>
                    
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <div className="space-y-6">
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-lg bg-[#1D2939] flex items-center justify-center text-gray-400 mr-3 flex-shrink-0">
                              <FiBriefcase className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Company</h4>
                              <p className="text-sm font-medium text-white">{client.company}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-lg bg-[#1D2939] flex items-center justify-center text-gray-400 mr-3 flex-shrink-0">
                              <FiUsers className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Contact Person</h4>
                              <p className="text-sm font-medium text-white">{client.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-lg bg-[#1D2939] flex items-center justify-center text-gray-400 mr-3 flex-shrink-0">
                              <FiMapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Address</h4>
                              <p className="text-sm font-medium text-white">{client.address || 'No address provided'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-lg bg-[#1D2939] flex items-center justify-center text-gray-400 mr-3 flex-shrink-0">
                              <FiMail className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email</h4>
                              <p className="text-sm font-medium text-white">{client.email || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-lg bg-[#1D2939] flex items-center justify-center text-gray-400 mr-3 flex-shrink-0">
                              <FiPhone className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Phone</h4>
                              <p className="text-sm font-medium text-white">{client.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-lg bg-[#1D2939] flex items-center justify-center text-gray-400 mr-3 flex-shrink-0">
                              <FiCalendar className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Client Since</h4>
                              <p className="text-sm font-medium text-white">{formatDate(client.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-5 border-t border-[#2A354C]">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-lg bg-[#1D2939] flex items-center justify-center text-gray-400 mr-3 flex-shrink-0">
                            <FiFileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Client Code</h4>
                            <p className="text-sm font-medium text-white">{client.code}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Client Stats Card */}
                  <div className="bg-[#151C2C] rounded-xl border border-[#2A354C] overflow-hidden shadow-lg">
                    <div className="px-5 py-4 border-b border-[#2A354C]">
                      <h3 className="text-lg font-medium text-white">Client Stats</h3>
                    </div>
                    
                    <div className="p-5 space-y-5">
                      <div className="bg-[#0F1520] p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-400">Videos Delivered This Month</h4>
                          <span className="text-2xl font-bold text-white">12</span>
                        </div>
                        <div className="w-full bg-[#1D2939] rounded-full h-1.5">
                          <div className="bg-[#FF4F01] h-1.5 rounded-full" style={{ width: `60%` }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-[#0F1520] p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-400">Total Views Generated</h4>
                          <span className="text-2xl font-bold text-white">24.3K</span>
                        </div>
                        <div className="w-full bg-[#1D2939] rounded-full h-1.5">
                          <div className="bg-[#FF4F01]/80 h-1.5 rounded-full" style={{ width: `75%` }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-[#0F1520] p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-400">Monthly Growth</h4>
                          <span className="text-md font-medium text-[#66BB6A]">+18.7%</span>
                        </div>
                        <div className="w-full bg-[#1D2939] rounded-full h-1.5 mt-2">
                          <div className="bg-[#FF4F01]/60 h-1.5 rounded-full" style={{ width: `30%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Notes section */}
                <div className="bg-[#151C2C] rounded-xl border border-[#2A354C] overflow-hidden shadow-lg mt-6">
                  <div className="px-5 py-4 border-b border-[#2A354C] flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Notes</h3>
                    <button className="text-[#FF4F01] hover:text-[#FF7E3D] text-sm flex items-center transition-colors duration-200">
                      <FiEdit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </button>
                  </div>
                  
                  <div className="p-5">
                    {client.notes ? (
                      <div className="bg-[#0F1520] p-5 rounded-lg border border-[#2A354C] text-gray-300 text-sm leading-relaxed">
                        {client.notes}
                      </div>
                    ) : (
                      <div className="py-10 flex flex-col items-center justify-center">
                        <div className="h-16 w-16 bg-[#0F1520] rounded-full flex items-center justify-center mb-3">
                          <FiFileText className="h-8 w-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 font-medium mb-2">No notes available</p>
                        <p className="text-sm text-gray-500 mb-4 max-w-md text-center">
                          Add notes about this client to keep track of important information and reminders.
                        </p>
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#FF4F01] hover:bg-[#FF4F01]/90 focus:outline-none transition-colors duration-200">
                          <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                          Add Notes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Team tab */}
            {activeTab === 'team' && (
              <div className="fade-in">
                <div className="flex flex-col lg:flex-row h-full gap-4">
                  {/* Team Members Sidebar */}
                  <div className="lg:w-72 bg-[#1a2233] rounded-lg border border-[#2a3347] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#2a3347] flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">Team Members</h3>
                      <div className="relative">
                        <button 
                          className="inline-flex items-center p-1.5 text-gray-400 hover:text-white rounded-full bg-[#151f2e]/70 hover:bg-[#151f2e] transition-colors duration-200"
                          title="Invite team member"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                        {teamMembers.length > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-semibold text-white">
                            {teamMembers.length}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-2 border-b border-[#2a3347] bg-[#151f2e]/30">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={searchTeam}
                          onChange={(e) => setSearchTeam(e.target.value)}
                          placeholder="Search team members..." 
                          className="w-full bg-[#151f2e] text-sm border border-[#2a3347] rounded-md py-1.5 pl-8 pr-3 text-gray-300"
                        />
                        <FiSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                      </div>
                    </div>

                    {/* Team Members List */}
                    <div className="overflow-y-auto flex-grow">
                      {filteredTeamMembers.length > 0 ? (
                        <div className="divide-y divide-[#2a3347]/60">
                          {filteredTeamMembers.map((member) => (
                            <div 
                              key={member.id} 
                              className={`p-3 transition-colors duration-200 cursor-pointer ${
                                selectedMember?.id === member.id 
                                  ? 'bg-[#151f2e]' 
                                  : 'hover:bg-[#151f2e]/70'
                              } group`}
                              onClick={() => setSelectedMember(member)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className={`h-9 w-9 rounded-full ${
                                    member.role === 'admin' 
                                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                                      : member.role === 'client'
                                        ? 'bg-gradient-to-br from-blue-500 to-cyan-400'
                                        : 'bg-gradient-to-br from-green-500 to-emerald-400'
                                  } flex items-center justify-center text-white font-medium shadow-md`}>
                                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                  </div>
                                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1a2233] bg-green-500"></div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                                    <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#151f2e] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <FiMoreHorizontal className="h-3 w-3" />
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 truncate">
                                    {member.role === 'admin' ? 'Administrator' : 
                                     member.role === 'client' ? 'Client' : 'Team Member'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                          <div className="w-16 h-16 bg-[#151f2e] rounded-full flex items-center justify-center mb-3">
                            <FiUsers className="h-8 w-8 text-gray-500" />
                          </div>
                          <h4 className="text-gray-400 font-medium mb-1">No team members found</h4>
                          <p className="text-xs text-gray-500 mb-4">
                            {searchTeam ? 'Try a different search term' : 'Invite people to join this client\'s team'}
                          </p>
                          {!searchTeam && (
                            <button className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200">
                              <FiPlus className="mr-1.5 -ml-0.5 h-3.5 w-3.5" />
                              Invite Member
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Member Details */}
                  <div className="flex-1 bg-[#1a2233] rounded-lg border border-[#2a3347] overflow-hidden">
                    {selectedMember ? (
                      <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-[#2a3347] flex justify-between items-center">
                          <h3 className="text-lg font-medium text-white flex items-center">
                            <span>Member Details</span>
                            <span className={`ml-2 inline-flex px-2 py-0.5 text-xs rounded-full ${
                              selectedMember.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-400'
                                : selectedMember.role === 'client'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-green-500/20 text-green-400'
                            }`}>
                              {selectedMember.role}
                            </span>
                          </h3>
                          <div className="flex space-x-2">
                            <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#151f2e] transition-colors duration-200" title="Email">
                              <FiMail className="h-4 w-4" />
                            </button>
                            {selectedMember.phoneNumber && (
                              <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#151f2e] transition-colors duration-200" title="Call">
                                <FiPhone className="h-4 w-4" />
                              </button>
                            )}
                            <button className="p-1.5 rounded-md text-blue-400 hover:text-white hover:bg-blue-500/20 transition-colors duration-200" title="Edit">
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                          <div className="flex items-center mb-6 fade-in">
                            <div className={`h-16 w-16 rounded-lg ${
                              selectedMember.role === 'admin' 
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                                : selectedMember.role === 'client'
                                  ? 'bg-gradient-to-br from-blue-500 to-cyan-400'
                                  : 'bg-gradient-to-br from-green-500 to-emerald-400'
                            } flex items-center justify-center text-white text-2xl font-medium shadow-lg`}>
                              {selectedMember.name ? selectedMember.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="ml-5">
                              <h2 className="text-xl font-semibold text-white">{selectedMember.name}</h2>
                              <p className="text-gray-400">{selectedMember.email}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="fade-in" style={{ animationDelay: '100ms' }}>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Contact Information</h4>
                              <div className="bg-[#151f2e] rounded-lg p-4 space-y-3">
                                <div>
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="text-sm text-white">{selectedMember.email}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Phone</p>
                                  <p className="text-sm text-white">{selectedMember.phoneNumber || 'Not provided'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Role</p>
                                  <p className="text-sm text-white capitalize">{selectedMember.role}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="fade-in" style={{ animationDelay: '200ms' }}>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Date Joined</h4>
                              <div className="bg-[#151f2e] rounded-lg p-4">
                                <p className="text-sm text-white">{formatDate(selectedMember.createdAt)}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {getTimeSinceJoined(selectedMember.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 fade-in" style={{ animationDelay: '300ms' }}>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Recent Activity</h4>
                            <div className="bg-[#151f2e] rounded-lg p-4 flex items-center justify-center h-24">
                              <p className="text-sm text-gray-500">Activity tracking coming soon</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-20 h-20 bg-[#151f2e] rounded-full flex items-center justify-center mb-4">
                          <FiUsers className="h-10 w-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Team Management</h3>
                        <p className="text-gray-400 max-w-md mb-6">
                          Select a team member from the list to view their details, or invite new members to join this client's team.
                        </p>
                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200">
                          <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                          Invite New Member
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Communications tab */}
            {activeTab === 'communications' && (
              <div className="fade-in">
                <div className="flex flex-col lg:flex-row h-full min-h-[600px] gap-4">
                  {/* Conversations Sidebar */}
                  <div className="lg:w-72 bg-[#1a2233] rounded-lg border border-[#2a3347] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#2a3347] flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">Conversations</h3>
                      <button 
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-white rounded-full bg-[#151f2e]/70 hover:bg-[#151f2e] transition-colors duration-200"
                        title="New conversation"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-2 border-b border-[#2a3347] bg-[#151f2e]/30">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={searchMessages}
                          onChange={(e) => setSearchMessages(e.target.value)}
                          placeholder="Search messages..." 
                          className="w-full bg-[#151f2e] text-sm border border-[#2a3347] rounded-md py-1.5 pl-8 pr-3 text-gray-300"
                        />
                        <FiSearch className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                      </div>
                    </div>

                    {/* Conversations List */}
                    <div className="overflow-y-auto flex-grow">
                      {filteredConversations.length > 0 ? (
                        <div className="divide-y divide-[#2a3347]/60">
                          {filteredConversations.map((conversation) => (
                            <div 
                              key={conversation.id} 
                              className={`p-3 transition-colors duration-200 cursor-pointer ${
                                selectedConversation === conversation.id 
                                  ? 'bg-[#151f2e]' 
                                  : 'hover:bg-[#151f2e]/70'
                              }`}
                              onClick={() => setSelectedConversation(conversation.id)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                    {conversation.participants[0].avatar}
                                  </div>
                                  {conversation.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-[#1a2233] flex items-center justify-center">
                                      <span className="text-[10px] font-bold text-white">{conversation.unreadCount}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${conversation.unreadCount > 0 ? 'text-white' : 'text-gray-300'}`}>
                                      {conversation.name}
                                    </p>
                                    <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                                  </div>
                                  <p className="text-xs text-gray-400 truncate">{conversation.lastMessage}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                          <div className="w-16 h-16 bg-[#151f2e] rounded-full flex items-center justify-center mb-3">
                            <FiMessageCircle className="h-8 w-8 text-gray-500" />
                          </div>
                          <h4 className="text-gray-400 font-medium mb-1">No conversations found</h4>
                          {searchMessages ? (
                            <p className="text-xs text-gray-500 mb-4">Try a different search term</p>
                          ) : (
                            <p className="text-xs text-gray-500 mb-4">Start a new conversation</p>
                          )}
                          {!searchMessages && (
                            <button className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200">
                              <FiPlus className="mr-1.5 -ml-0.5 h-3.5 w-3.5" />
                              New Conversation
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 bg-[#1a2233] rounded-lg border border-[#2a3347] overflow-hidden flex flex-col">
                    {selectedConversation ? (
                      <>
                        <div className="p-4 border-b border-[#2a3347] flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium mr-3">
                              {conversations.find(c => c.id === selectedConversation)?.participants[0].avatar || 'E'}
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-white">
                                {conversations.find(c => c.id === selectedConversation)?.name || 'Conversation'}
                              </h3>
                              <div className="flex items-center text-xs text-gray-400">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                {conversations.find(c => c.id === selectedConversation)?.participants.length || 0} participants • Active now
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#151f2e] transition-colors duration-200" title="Call">
                              <FiPhone className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#151f2e] transition-colors duration-200" title="More">
                              <FiMoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          <div className="text-center">
                            <div className="inline-block px-3 py-1 bg-[#151f2e] rounded-full text-xs text-gray-400">
                              Today
                            </div>
                          </div>
                          
                          {messages.map(message => (
                            <div key={message.id} className={`flex items-start ${message.isMe ? 'justify-end' : ''} fade-in-up`} style={{ animationDelay: `${parseInt(message.id) * 100}ms` }}>
                              {!message.isMe && (
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-medium mr-3 mt-1 ${
                                  message.senderId === '2' 
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-400'
                                    : message.senderId === '3'
                                      ? 'bg-gradient-to-br from-blue-500 to-cyan-400'
                                      : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                }`}>
                                  {message.sender.charAt(0)}
                                </div>
                              )}
                              
                              <div className={`max-w-[75%] ${message.isMe ? 'order-1' : ''}`}>
                                <div className={`flex items-center mb-1 ${message.isMe ? 'justify-end' : ''}`}>
                                  {!message.isMe && <p className="text-sm font-medium text-white">{message.sender}</p>}
                                  <span className={`text-xs text-gray-500 ${message.isMe ? 'mr-2' : 'ml-2'}`}>
                                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                  {message.isMe && <p className="text-sm font-medium text-white">Me</p>}
                                </div>
                                
                                <div className={`${
                                  message.isMe 
                                    ? 'bg-blue-600 rounded-lg rounded-tr-none' 
                                    : 'bg-[#151f2e] rounded-lg rounded-tl-none'
                                } p-3 mb-1`}>
                                  <p className={`text-sm ${message.isMe ? 'text-white' : 'text-gray-300'}`}>
                                    {message.text}
                                  </p>
                                </div>
                                
                                {message.attachment && (
                                  <div className={`mt-2 ${
                                    message.isMe 
                                      ? 'bg-blue-700/50' 
                                      : 'bg-[#151f2e]'
                                  } rounded-lg p-3 flex items-center space-x-3`}>
                                    <div className="h-9 w-9 bg-blue-500/10 rounded flex items-center justify-center text-blue-400">
                                      <FiFileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-white">{message.attachment.name}</p>
                                      <p className="text-xs text-gray-500">{message.attachment.size} • {message.attachment.type}</p>
                                    </div>
                                    <button className="ml-auto p-1.5 bg-blue-500/10 rounded text-blue-400 hover:bg-blue-500/20 transition-colors duration-200">
                                      <FiDownload className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {message.isMe && (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-medium ml-3 mt-1">
                                  E
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <div className="text-center mt-8 mb-4">
                            <div className="inline-block px-3 py-1 bg-[#151f2e] rounded-full text-xs text-gray-400">
                              Now
                            </div>
                          </div>
                        </div>
                        
                        {/* Message Input */}
                        <div className="border-t border-[#2a3347] p-4">
                          <div className="flex items-center bg-[#151f2e] rounded-lg border border-[#2a3347] p-1">
                            <button className="p-2 text-gray-400 hover:text-white transition-colors duration-200">
                              <FiPaperclip className="h-5 w-5" />
                            </button>
                            <input 
                              type="text" 
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              placeholder="Type your message..." 
                              className="flex-1 bg-transparent border-0 focus:ring-0 text-white text-sm px-3 py-2"
                            />
                            <button 
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:hover:bg-blue-600"
                              disabled={!messageText.trim()}
                            >
                              <FiSend className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 flex justify-between items-center px-2">
                            <div className="flex space-x-2 text-gray-400">
                              <button className="p-1 hover:text-white transition-colors duration-200">
                                <FiImage className="h-4 w-4" />
                              </button>
                              <button className="p-1 hover:text-white transition-colors duration-200">
                                <FiFile className="h-4 w-4" />
                              </button>
                              <button className="p-1 hover:text-white transition-colors duration-200">
                                <FiSmile className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500">
                              Press Enter to send
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-20 h-20 bg-[#151f2e] rounded-full flex items-center justify-center mb-4">
                          <FiMessageCircle className="h-10 w-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No Conversation Selected</h3>
                        <p className="text-gray-400 max-w-md mb-6">
                          Select a conversation from the sidebar or start a new conversation to begin messaging.
                        </p>
                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200">
                          <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                          New Conversation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-80 py-6 px-5 border-t lg:border-t-0 lg:border-l border-[#2a3347]">
            {/* Team Members List */}
            <div className="bg-[#1a2233] rounded-xl border border-[#2a3347] overflow-hidden mb-5 shadow-lg">
              <div className="px-5 py-4 border-b border-[#2a3347] flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Team Members</h3>
                <div className="relative">
                  <button 
                    className="inline-flex items-center p-1.5 text-gray-400 hover:text-white rounded-full bg-[#151f2e]/70 hover:bg-[#151f2e] transition-colors duration-200"
                    title="Invite team member"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                  {teamMembers.length > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-semibold text-white">
                      {teamMembers.length}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[300px]">
                {teamMembers.length > 0 ? (
                  <div className="divide-y divide-[#2a3347]/50">
                    {teamMembers.slice(0, 5).map((member) => (
                      <div 
                        key={member.id} 
                        className="p-3 transition-colors duration-200 cursor-pointer hover:bg-[#151f2e]/70 group"
                        onClick={() => {
                          setSelectedMember(member);
                          setActiveTab('team');
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className={`h-9 w-9 rounded-full ${
                              member.role === 'admin' 
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                                : member.role === 'client'
                                  ? 'bg-gradient-to-br from-blue-500 to-cyan-400'
                                  : 'bg-gradient-to-br from-green-500 to-emerald-400'
                            } flex items-center justify-center text-white font-medium shadow-md`}>
                              {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1a2233] bg-green-500"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white truncate">{member.name}</p>
                              <div className="ml-2 flex">
                                <span className="inline-flex items-center justify-center px-1.5 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                                  2
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 truncate">
                              {member.role === 'admin' ? 'Administrator' : 
                              member.role === 'client' ? 'Client' : 'Team Member'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {teamMembers.length > 5 && (
                      <div className="p-3 text-center">
                        <button 
                          className="text-sm text-blue-400 hover:text-blue-300"
                          onClick={() => setActiveTab('team')}
                        >
                          View all {teamMembers.length} members
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-gray-400">No team members</p>
                    <button className="mt-2 inline-flex items-center px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200">
                      <FiPlus className="mr-1.5 -ml-0.5 h-3 w-3" />
                      Invite Member
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-[#1a2233] rounded-xl border border-[#2a3347] overflow-hidden shadow-lg">
              <div className="px-5 py-4 border-b border-[#2a3347] flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Recent Activity</h3>
                <button className="text-gray-400 hover:text-white text-sm p-1.5 rounded-full hover:bg-[#151f2e]/70 transition-colors duration-200">
                  <FiFilter className="h-3.5 w-3.5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Sample activity items */}
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <FiEdit2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Contract updated</p>
                    <p className="text-xs text-gray-400 mt-0.5">Website Redesign contract was updated by <span className="text-blue-400">James Peterson</span></p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/15 flex items-center justify-center text-green-400 flex-shrink-0">
                    <FiUsers className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white">Team member joined</p>
                    <p className="text-xs text-gray-400 mt-0.5"><span className="text-green-400">Sarah Johnson</span> joined the team</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-500/15 flex items-center justify-center text-yellow-400 flex-shrink-0">
                    <FiMessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white">New conversation</p>
                    <p className="text-xs text-gray-400 mt-0.5"><span className="text-yellow-400">Erlich Bachman</span> started a new conversation</p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
                
                <button className="w-full text-center text-xs text-blue-400 hover:text-blue-300 py-2 mt-2 flex items-center justify-center">
                  View All Activity <FiChevronRight className="ml-1 h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 