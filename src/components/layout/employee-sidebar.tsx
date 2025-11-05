'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  HomeIcon, 
  ChevronLeftIcon, 
  ChevronUpIcon,
  MeetingsIcon,
  PdaDocumentsIcon,
  CustomersIcon,
} from '@/components/ui/icons';

interface EmployeeSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onPageChange?: (page: string) => void;
  activePage?: string;
}

export function EmployeeSidebar({ isCollapsed, onToggle, onPageChange, activePage = 'dashboard' }: EmployeeSidebarProps) {
  // Main menu items for employees
  const mainMenuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: HomeIcon },
    { id: 'my-tasks', label: 'مهامي', icon: PdaDocumentsIcon },
    { id: 'my-meetings', label: 'اجتماعاتي', icon: MeetingsIcon },
    { id: 'my-clients', label: 'عملائي', icon: CustomersIcon },
  ];

  return (
    <div className="relative h-full flex">
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute -right-5 top-4 z-50 bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors rounded-full w-8 h-8 flex items-center justify-center shadow-md"
      >
        <ChevronLeftIcon className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>
      
      <div className={`relative overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full transition-all duration-300 flex flex-col flex-shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Background image at bottom */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none select-none z-0">
          <div className="relative w-20 h-80">
            <Image
              src="/Layer 13.png"
              alt="Background"
              width={50}
              height={200}
              className={`object-contain transition-opacity duration-300 ${
                isCollapsed ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex justify-center items-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={isCollapsed ? 90 : 50} 
              height={isCollapsed ? 90 : 50}
              className="transition-all duration-300"
            />
          </div>

          <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
            <div className="space-y-2">
              {/* Main menu items */}
              {mainMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange?.(item.id)}
                  className={`w-full flex items-center gap-3 px-[5px] py-2.5 rounded-lg transition-all duration-200 ${
                    activePage === item.id 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <item.icon className={`flex-shrink-0 transition-all duration-200 ${
                    activePage === item.id ? 'w-5 h-5' : 'w-7 h-7 px-1'
                  }`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              ))}
            </div>
          </nav>

      
        
        </div>
      </div>
    </div>
  );
}

