'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, FiUsers, FiBriefcase, FiSettings, FiMenu, FiX,
  FiActivity, FiLogOut, FiBell, FiSearch, FiMoon
} from 'react-icons/fi';

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
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigation items for the sidebar
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
    { name: 'Clients', href: '/admin/clients', icon: FiBriefcase },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="flex h-screen bg-[#111827] overflow-hidden">
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
        className={`fixed z-30 h-full w-64 flex-shrink-0 bg-[#1a2233] md:static md:translate-x-0 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Brand */}
        <div className="h-16 flex items-center border-b border-[#2a3347] px-4">
          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">SC</span>
            </div>
            <div>
              <span className="text-base font-bold text-white">Shortscut</span>
              <span className="block text-xs text-blue-400">Admin Portal</span>
            </div>
          </Link>
        </div>
        
        {/* Sidebar content */}
        <div className="h-[calc(100%-4rem)] flex flex-col overflow-y-auto py-4 px-3">
          {/* Search box */}
          <div className="mb-6 px-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#2a3347] w-full pl-10 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Search"
              />
            </div>
          </div>
          
          {/* Main navigation */}
          <div className="px-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Main
            </p>
            <nav className="space-y-1" aria-label="Main Navigation">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                        : 'text-gray-300 hover:bg-[#2a3347] hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" aria-hidden="true"></span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Analytics section */}
          <div className="mt-8 px-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Analytics
            </p>
            <Link
              href="/admin/analytics"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-[#2a3347] hover:text-white transition-colors"
            >
              <FiActivity className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              Performance
            </Link>
          </div>
          
          {/* Logout button - push to bottom */}
          <div className="mt-auto px-2 pt-4 border-t border-[#2a3347]">
            <Link
              href="/logout"
              className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-[#2a3347] hover:text-white transition-colors"
            >
              <FiLogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-[#1a2233] shadow-md z-10">
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
            
            {/* Right side actions */}
            <div className="flex items-center space-x-4 ml-auto">
              <button 
                className="rounded-full bg-[#2a3347] p-1.5 text-gray-400 hover:text-white focus:outline-none"
                aria-label="Toggle dark mode"
              >
                <FiMoon className="h-5 w-5" aria-hidden="true" />
              </button>
              
              <button 
                className="relative rounded-full bg-[#2a3347] p-1.5 text-gray-400 hover:text-white focus:outline-none"
                aria-label="Notifications"
              >
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">3</span>
                <FiBell className="h-5 w-5" aria-hidden="true" />
              </button>
              
              <div className="relative">
                <div 
                  className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm"
                  aria-label="User profile"
                >
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto bg-[#111827]">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 