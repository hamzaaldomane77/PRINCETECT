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
      } else {
        // Handle nested routes
        const routeParts = route.split('/');
        if (routeParts.length >= 2) {
          // For nested routes like customer-management/customers
          pageId = routeParts[1]; // Get the last part (customers, employees, etc.)
        } else {
          pageId = route;
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
      case 'customers':
        router.push('/super-admin/customer-management/customers');
        break;
      case 'potential-customers':
        router.push('/super-admin/customer-management/potential-customers');
        break;
      case 'meetings':
        router.push('/super-admin/customer-management/meetings');
        break;
      case 'offers':
        router.push('/super-admin/customer-management/offers');
        break;
      case 'active-customers':
        router.push('/super-admin/customer-management/active-customers');
        break;
      case 'contracts':
        router.push('/super-admin/customer-management/contracts');
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
      default:
        router.push('/super-admin');
    }
  };

  if (!user) {
    // Redirect to login page if no user
    useEffect(() => {
      router.push('/');
    }, [router]);
    
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