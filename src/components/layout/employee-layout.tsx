'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { EmployeeSidebar } from './employee-sidebar';
import EmployeeHeader from './employee-header';
import { useEmployeeAuth } from '@/contexts/employee-auth-context';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useEmployeeAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    // Extract the page from pathname
    const path = pathname.split('/').pop() || 'dashboard';
    
    // Map pathname to page id
    let pageId = 'dashboard';
    if (pathname.includes('/employee/')) {
      const route = pathname.replace('/employee/', '');
      if (route === '' || route === 'dashboard') {
        pageId = 'dashboard';
      } else if (pathname.includes('/my-tasks')) {
        pageId = 'my-tasks';
      } else if (pathname.includes('/my-meetings')) {
        pageId = 'my-meetings';
      } else if (pathname.includes('/my-clients')) {
        pageId = 'my-clients';
      } else if (pathname.includes('/my-leads')) {
        pageId = 'my-leads';
      } else if (pathname.includes('/my-contracts')) {
        pageId = 'my-contracts';
      } else if (pathname.includes('/my-quotations')) {
        pageId = 'my-quotations';
      } else {
        pageId = route;
      }
    }
    
    setActivePage(pageId);
  }, [pathname]);

  const onPageChange = (page: string) => {
    setActivePage(page);
    switch (page) {
      case 'dashboard':
        router.push('/employee/dashboard');
        break;
      case 'my-tasks':
        router.push('/employee/my-tasks');
        break;
      case 'my-meetings':
        router.push('/employee/my-meetings');
        break;
      case 'my-clients':
        router.push('/employee/my-clients');
        break;
      case 'my-leads':
        router.push('/employee/my-leads');
        break;
      case 'my-contracts':
        router.push('/employee/my-contracts');
        break;
      case 'my-quotations':
        router.push('/employee/my-quotations');
        break;
      default:
        router.push('/employee/dashboard');
    }
  };

  // Strict redirect to login page if not authenticated
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      console.log('EmployeeLayout: Redirecting to login - not authenticated');
      router.replace('/employee/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirect message if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <div className="flex h-full">
        <EmployeeSidebar 
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onPageChange={onPageChange}
          activePage={activePage}
        />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <EmployeeHeader />
          
          <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

