'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  HomeIcon, 
  ChevronLeftIcon, 
  ChevronUpIcon,
  CustomerManagementIcon,
  EmployeeManagementIcon,
  CustomersIcon,
  PotentialCustomersIcon,
  MeetingsIcon,
  OffersIcon,
  ActiveCustomersIcon,
  ContractsIcon,
  EmployeeTypesIcon,
  JobTitlesIcon,
  EmployeesIcon,
  BasicDataManagementIcon,
  CitiesIcon,
  DepartmentsIcon,
  ServicesIcon,
  ServiceCategoriesIcon,
  WorkflowIcon,
  PdaDocumentsIcon,
  AidaFunnelsIcon,
  MarketingChannelsIcon
} from '@/components/ui/icons';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onPageChange?: (page: string) => void;
  activePage?: string;
}

export function Sidebar({ isCollapsed, onToggle, onPageChange, activePage = 'dashboard' }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    customerManagement: true,
    employeeManagement: true,
    basicDataManagement: true,
    services: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const customerManagementItems = [
    { id: 'clients', label: 'Clients', icon: CustomersIcon },
    { id: 'potential-clients', label: 'Potential Clients', icon: PotentialCustomersIcon },
    { id: 'meetings', label: 'Meetings', icon: MeetingsIcon },
    { id: 'offers', label: 'Offers', icon: OffersIcon },
    { id: 'active-clients', label: 'Active Clients', icon: ActiveCustomersIcon },
    { id: 'contracts', label: 'Contracts', icon: ContractsIcon }
  ];

  const employeeManagementItems = [
    { id: 'employee-types', label: 'Employee Types', icon: EmployeeTypesIcon },
    { id: 'job-titles', label: 'Job Titles', icon: JobTitlesIcon },
    { id: 'employees', label: 'Employees', icon: EmployeesIcon }
  ];

  const basicDataManagementItems = [
    { id: 'cities', label: 'Cities', icon: CitiesIcon },
    { id: 'departments', label: 'Departments', icon: DepartmentsIcon }
  ];

  const servicesItems = [
    { id: 'service-categories', label: 'Service Categories', icon: ServiceCategoriesIcon },
    { id: 'services', label: 'Services', icon: ServicesIcon },
    { id: 'workflow', label: 'Workflow', icon: WorkflowIcon }
  ];

  return (
    <div className="relative h-full flex">
      {/* Toggle button - now positioned absolutely to the right of the sidebar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute -right-5 top-4 z-50 bg-amber-50 dark:bg-amber-900/20 flex-shrink-0 hover:bg-amber-100 dark:hover:bg-amber-900/30 cursor-pointer transition-colors rounded-full w-8 h-8 flex items-center justify-center shadow-md"
      >
        <ChevronLeftIcon className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>
      
      <div className={`relative overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full transition-all duration-300 flex flex-col flex-shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Background image at bottom */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none select-none z-0">
          <div className="relative w-20 h-50">
            <Image
              src="/Layer 13.png"
              alt="Tiki Torch"
              fill
              sizes="80px"
              className="object-contain opacity-70 dark:opacity-70"
            />
          </div>
        </div>

        {/* Logo Section */}
        <div className="relative z-10 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-9">
                <Image
                  src="/logo.png"
                  alt="Princetect Logo"
                  fill
                  sizes="48px"
                  priority
                  className="object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">PRINCETECT</span>
                  <span className="text-xs text-orange-500">DIGITAL AGENCY</span>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Navigation Menu */}
      <nav className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start cursor-pointer transition-all duration-200 ${
            activePage === 'dashboard' 
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-r-2 border-orange-500' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onClick={() => onPageChange?.('dashboard')}
        >
          <HomeIcon className="w-5 h-5 mr-3" />
          {!isCollapsed && <span>Dashboard</span>}
        </Button>

        {/* Basic Data Management */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => toggleSection('basicDataManagement')}
        >
          <div className="flex items-center">
            <BasicDataManagementIcon className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Basic Data Management</span>}
          </div>
          {!isCollapsed && (
            <ChevronUpIcon className={`w-4 h-4 transition-transform ${
              expandedSections.basicDataManagement ? 'rotate-180' : ''
            }`} />
          )}
        </Button>

        {expandedSections.basicDataManagement && !isCollapsed && (
          <div className="ml-6 space-y-1">
            {basicDataManagementItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start cursor-pointer transition-all duration-200 ${
                  activePage === item.id 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-r-2 border-orange-500' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => onPageChange?.(item.id)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Customer Management */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => toggleSection('customerManagement')}
        >
          <div className="flex items-center">
            <CustomerManagementIcon className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Clients Management</span>}
          </div>
          {!isCollapsed && (
            <ChevronUpIcon className={`w-4 h-4 transition-transform ${
              expandedSections.customerManagement ? 'rotate-180' : ''
            }`} />
          )}
        </Button>

        {expandedSections.customerManagement && !isCollapsed && (
          <div className="ml-6 space-y-1">
            {customerManagementItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start cursor-pointer transition-all duration-200 ${
                  activePage === item.id 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-r-2 border-orange-500' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => onPageChange?.(item.id)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Employee Management */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => toggleSection('employeeManagement')}
        >
          <div className="flex items-center">
            <EmployeeManagementIcon className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Employee Management</span>}
          </div>
          {!isCollapsed && (
            <ChevronUpIcon className={`w-4 h-4 transition-transform ${
              expandedSections.employeeManagement ? 'rotate-180' : ''
            }`} />
          )}
        </Button>

        {expandedSections.employeeManagement && !isCollapsed && (
          <div className="ml-6 space-y-1">
            {employeeManagementItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start cursor-pointer transition-all duration-200 ${
                  activePage === item.id 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-r-2 border-orange-500' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => onPageChange?.(item.id)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Services */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => toggleSection('services')}
        >
          <div className="flex items-center">
            <ServicesIcon className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Services</span>}
          </div>
          {!isCollapsed && (
            <ChevronUpIcon className={`w-4 h-4 transition-transform ${
              expandedSections.services ? 'rotate-180' : ''
            }`} />
          )}
        </Button>

        {expandedSections.services && !isCollapsed && (
          <div className="ml-6 space-y-1">
            {servicesItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start cursor-pointer transition-all duration-200 ${
                  activePage === item.id 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-r-2 border-orange-500' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => onPageChange?.(item.id)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
        )}
        
        {/* PDA Documents - standalone menu item */}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start cursor-pointer transition-all duration-200 ${
            activePage === 'pda-documents' 
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-r-2 border-orange-500' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onClick={() => onPageChange?.('pda-documents')}
        >
          <PdaDocumentsIcon className="w-5 h-5 mr-3" />
          {!isCollapsed && <span>PDA Documents</span>}
        </Button>

        {/* AIDA Funnels - standalone menu item */}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start cursor-pointer transition-all duration-200 ${
            activePage === 'aida-funnels' 
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-r-2 border-orange-500' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onClick={() => onPageChange?.('aida-funnels')}
        >
          <AidaFunnelsIcon className="w-5 h-5 mr-3" />
          {!isCollapsed && <span>AIDA Funnels</span>}
        </Button>

        {/* Marketing Channels - standalone menu item */}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start cursor-pointer transition-all duration-200 ${
            activePage === 'marketing-channels' 
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-r-2 border-orange-500' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onClick={() => onPageChange?.('marketing-channels')}
        >
          <MarketingChannelsIcon className="w-5 h-5 mr-3" />
          {!isCollapsed && <span>Marketing Channels</span>}
        </Button>
      </nav>

      {/* Removed old bottom image block and kept background image instead */}
    </div>
    </div>
  );
} 