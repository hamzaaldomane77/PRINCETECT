'use client';

import { useMemo } from 'react';
import { useEmployeeAuth } from '@/contexts/employee-auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  HomeIcon, 
  PdaDocumentsIcon, 
  MeetingsIcon, 
  CustomersIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  UsersIcon,
  BriefcaseIcon,
  TrendingUpIcon
} from '@/components/ui/icons';
import TasksCalendar from '@/components/employee/tasks-calendar';
import { useDashboardOverview } from '@/modules/employee-dashboard';
import { Toaster } from 'sonner';

export default function EmployeeDashboard() {
  const { user, isAuthenticated, isLoading } = useEmployeeAuth();
  
  // Fetch dashboard overview
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardOverview();

  // Security: Check authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please login first
          </p>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.data;

  // Calculate stats from API data
  const stats = useMemo(() => {
    if (!overview) {
      return [
        {
          title: 'Total Tasks',
          value: '0',
          icon: PdaDocumentsIcon,
          color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
          change: 'Loading...',
        },
        {
          title: 'Meetings',
          value: '0',
          icon: MeetingsIcon,
          color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
          change: 'Loading...',
        },
        {
          title: 'Contracts',
          value: '0',
          icon: FileTextIcon,
          color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
          change: 'Loading...',
        },
        {
          title: 'Clients',
          value: '0',
          icon: CustomersIcon,
          color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
          change: 'Loading...',
        },
        {
          title: 'Leads',
          value: '0',
          icon: UsersIcon,
          color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
          change: 'Loading...',
        },
        {
          title: 'Completion Rate',
          value: '0%',
          icon: TrendingUpIcon,
          color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
          change: 'Loading...',
        },
      ];
    }

    return [
      {
        title: 'Total Tasks',
        value: overview.tasks.total.toString(),
        icon: PdaDocumentsIcon,
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        change: `${overview.tasks.completed} Completed • ${overview.tasks.in_progress} In Progress`,
      },
      {
        title: 'Meetings',
        value: overview.meetings.total.toString(),
        icon: MeetingsIcon,
        color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        change: `${overview.meetings.upcoming} Upcoming • ${overview.meetings.today} Today`,
      },
      {
        title: 'Contracts',
        value: overview.contracts.total.toString(),
        icon: FileTextIcon,
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        change: `${overview.contracts.active} Active • ${overview.contracts.completed} Completed`,
      },
      {
        title: 'Clients',
        value: overview.clients.total.toString(),
        icon: CustomersIcon,
        color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        change: `${overview.clients.active} Active Clients`,
      },
      {
        title: 'Leads',
        value: overview.leads.total.toString(),
        icon: UsersIcon,
        color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        change: `${overview.leads.new} New • ${overview.leads.converted} Converted`,
      },
      {
        title: 'Completion Rate',
        value: `${overview.performance.completion_rate.toFixed(1)}%`,
        icon: TrendingUpIcon,
        color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
        change: `Workload: ${overview.performance.workload_percentage.toFixed(1)}%`,
      },
    ];
  }, [overview]);

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <HomeIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name || 'Employee'}!</h1>
            <p className="text-blue-100 mt-1">Employee Management System</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoadingDashboard ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tasks Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tasks Calendar</h2>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>To Do</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>On Hold</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TasksCalendar />
        </CardContent>
      </Card>

      {/* Info Message */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <HomeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                💡 Tip: How to Use the Calendar
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                • Click on any task in the calendar to view details
                <br />
                • You can update the task status directly from the details window
                <br />
                • Colors represent task status: Gray (to do), Blue (in progress), Green (completed), Yellow (on hold), Red (cancelled)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}

