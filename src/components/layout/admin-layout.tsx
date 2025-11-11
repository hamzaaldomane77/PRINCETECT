'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import Header from './header';
import { useAuth } from '@/contexts/auth-context';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    // Extract the page from pathname
    const path = pathname.split('/').pop() || 'dashboard';
    
    // Map pathname to page id
    let pageId = 'dashboard';
    if (pathname.includes('/super-admin/')) {
      const route = pathname.replace('/super-admin/', '');
      if (route === '') {
        pageId = 'dashboard';
      } else       if (pathname.includes('/pda-documents')) {
        // Handle PDA Documents routes
        pageId = 'pda-documents';
      } else if (pathname.includes('/aida-funnels')) {
        // Handle AIDA Funnels routes
        pageId = 'aida-funnels';
      } else if (pathname.includes('/marketing-channels')) {
        // Handle Marketing Channels routes
        pageId = 'marketing-channels';
      } else if (pathname.includes('/marketing-mixes')) {
        // Handle Marketing Mixes routes
        pageId = 'marketing-mixes';
      } else {
        // Handle nested routes
        const routeParts = route.split('/');
        if (routeParts.length >= 2) {
          // For nested routes like clients-management/clients
          pageId = routeParts[1]; // Get the last part (clients, employees, etc.)
        } else {
          pageId = route;
        }
        
        // Special handling for tasks routes
        if (pathname.includes('/tasks')) {
          pageId = 'tasks';
        }
      }
    }
    
    setActivePage(pageId);
  }, [pathname]);

  const onPageChange = (page: string) => {
    setActivePage(page);
    switch (page) {
      case 'dashboard':
        router.push('/super-admin');
        break;
      case 'clients':
        router.push('/super-admin/clients-management/clients');
        break;
      case 'potential-clients':
        router.push('/super-admin/clients-management/potential-clients');
        break;
      case 'meetings':
        router.push('/super-admin/clients-management/meetings');
        break;
      case 'offers':
        router.push('/super-admin/clients-management/offers');
        break;
      case 'active-clients':
        router.push('/super-admin/clients-management/active-clients');
        break;
      case 'contracts':
        router.push('/super-admin/clients-management/contracts');
        break;
      case 'employee-types':
        router.push('/super-admin/employee-management/employee-types');
        break;
      case 'job-titles':
        router.push('/super-admin/employee-management/job-titles');
        break;
      case 'employees':
        router.push('/super-admin/employee-management/employees');
        break;
      case 'cities':
        router.push('/super-admin/basic-data-management/cities');
        break;
      case 'departments':
        router.push('/super-admin/basic-data-management/departments');
        break;
      case 'service-categories':
        router.push('/super-admin/services-management/service-categories');
        break;
      case 'services':
        router.push('/super-admin/services-management/services');
        break;
      case 'workflow':
        router.push('/super-admin/services-management/workflow');
        break;
      case 'tasks':
        router.push('/super-admin/services-management/tasks');
        break;
      case 'pda-documents':
        router.push('/super-admin/pda-documents');
        break;
      case 'aida-funnels':
        router.push('/super-admin/aida-funnels');
        break;
      case 'marketing-channels':
        router.push('/super-admin/marketing-channels');
        break;
      case 'marketing-mixes':
        router.push('/super-admin/marketing-mixes');
        break;
      default:
        router.push('/super-admin');
    }
  };

  // Redirect to login page if no user
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري إعادة التوجيه لصفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <div className="flex h-full">
        <Sidebar 
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onPageChange={onPageChange}
          activePage={activePage}
        />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 