'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, FiUsers, FiBriefcase, FiSettings, FiMenu, FiX,
  FiActivity, FiLogOut, FiBell, FiSearch, FiMoon, FiLoader,
  FiCalendar, FiPieChart, FiMessageCircle, FiBookmark
} from 'react-icons/fi';
import { createBrowserSupabaseClient } from '@/lib/supabase';

/**
 * Props for the AdminDashboardLayout component
 */
type AdminDashboardLayoutProps = {
  /** React children to render within the layout */
  children: ReactNode;
};

/**
 * AdminDashboardLayout provides the main layout structure for the admin dashboard.
 * It includes a responsive sidebar navigation, header with user actions,
 * and a main content area.
 *
 * @param {AdminDashboardLayoutProps} props - Component props
 * @returns {JSX.Element} The rendered admin dashboard layout
 */
export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userName, setUserName] = useState('Admin');
  const [userInitial, setUserInitial] = useState('A');
  const pathname = usePathname();
  const router = useRouter();

  // Check authentication on layout mount
  useEffect(() => {
    async function checkAuth() {
      try {
        // Check authentication
        const supabase = createBrowserSupabaseClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session || !session.user) {
          console.error('No valid session');
          router.push('/login');
          return;
        }

        // Verify admin role
        const user = session.user;
        const role = user.user_metadata?.role || user.role;
        
        if (role !== 'admin') {
          console.log('User is not an admin, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }

        // Set user information for display
        if (user.user_metadata?.name) {
          setUserName(user.user_metadata.name);
          setUserInitial(user.user_metadata.name.charAt(0).toUpperCase());
        } else if (user.email) {
          setUserName(user.email.split('@')[0]);
          setUserInitial(user.email.charAt(0).toUpperCase());
        }
        
        setIsAuthChecking(false);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      }
    }

    checkAuth();
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Navigation items for the sidebar
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
    { name: 'Clients', href: '/admin/clients', icon: FiBriefcase },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    { name: 'Calendar', href: '/admin/calendar', icon: FiCalendar },
    { name: 'Analytics', href: '/admin/analytics', icon: FiPieChart },
    { name: 'Messages', href: '/admin/messages', icon: FiMessageCircle },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ];

  // If still checking authentication, show loading screen
  if (isAuthChecking) {
    return (
      <div className="flex h-screen bg-[#0F1520] items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-t-2 border-b-2 border-[#FF4F01] animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0F1520] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-70 transition-opacity md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-30 h-full flex-shrink-0 bg-[#151C2C] transition-all duration-500 ease-in-out md:static md:translate-x-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isSidebarExpanded ? 'w-64' : 'w-[72px]'
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {/* Logo & Brand */}
        <div className="h-16 flex items-center justify-center border-b border-[#2A354C] px-4">
          <Link href="/admin/dashboard" className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#FF4F01] to-[#FF7E3D] flex items-center justify-center shadow-lg shadow-[#FF4F01]/20">
              <span className="text-sm font-bold text-white">SC</span>
            </div>
            <div className={`transition-all duration-500 ease-in-out ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'}`}>
              <span className="text-base font-bold text-white">Shortscut</span>
              <span className="block text-xs text-[#FF4F01]">Admin Portal</span>
            </div>
          </Link>
        </div>
        
        {/* Sidebar content */}
        <div className="flex flex-col h-[calc(100%-4rem)] py-4">          
          {/* Main navigation */}
          <div className="flex-1 px-2">
            <nav className="space-y-1 mt-2" aria-label="Main Navigation">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#FF4F01]/10 text-white'
                        : 'text-gray-300 hover:bg-[#1D2939]/80 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-[#FF4F01]' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    <span className={`ml-3 transition-all duration-500 ease-in-out whitespace-nowrap ${
                      isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'
                    }`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <span className={`${
                        isSidebarExpanded ? 'ml-auto' : 'absolute right-3'
                      } h-1.5 w-1.5 rounded-full bg-[#FF4F01]`} aria-hidden="true"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Logout button - push to bottom */}
          <div className="mt-auto px-2 pt-4 border-t border-[#2A354C]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-300 hover:bg-[#1D2939]/80 hover:text-white transition-all duration-200 focus:outline-none"
            >
              <FiLogOut className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <span className={`ml-3 transition-all duration-500 ease-in-out whitespace-nowrap ${
                isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'
              }`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-[#151C2C] shadow-lg shadow-black/10 z-10">
          <div className="px-4 h-16 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
              onClick={toggleSidebar}
              aria-expanded={isSidebarOpen}
              aria-controls="mobile-sidebar"
            >
              <span className="sr-only">Open sidebar</span>
              {isSidebarOpen ? 
                <FiX className="h-6 w-6" aria-hidden="true" /> : 
                <FiMenu className="h-6 w-6" aria-hidden="true" />
              }
            </button>
            
            {/* Search bar - hidden on mobile */}
            <div className="hidden md:flex items-center max-w-md w-full ml-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-[#1D2939] w-full pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 rounded-lg border border-[#2A354C] focus:outline-none focus:ring-1 focus:ring-[#FF4F01]/50 focus:border-[#FF4F01]/50 transition-all duration-200"
                  aria-label="Search"
                />
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <button 
                className="rounded-full bg-[#1D2939] p-2 text-gray-400 hover:text-white hover:bg-[#1D2939]/70 focus:outline-none transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                <FiMoon className="h-5 w-5" aria-hidden="true" />
              </button>
              
              <button 
                className="relative rounded-full bg-[#1D2939] p-2 text-gray-400 hover:text-white hover:bg-[#1D2939]/70 focus:outline-none transition-all duration-200"
                aria-label="Notifications"
              >
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4F01] text-xs font-bold text-white">3</span>
                <FiBell className="h-5 w-5" aria-hidden="true" />
              </button>
              
              <div className="relative flex items-center">
                <div 
                  className="h-9 w-9 rounded-full bg-[#1D2939] border-2 border-[#2A354C] flex items-center justify-center text-white font-semibold shadow-lg"
                  aria-label="User profile"
                >
                  {userInitial}
                </div>
                <span className="ml-2 text-sm font-medium text-white hidden md:block">{userName}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto bg-[#0F1520]">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 