'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { RefreshIcon, ArrowLeftIcon } from '@/components/ui/icons';
import { useContractTasks } from '@/modules/contracts';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const taskTypeColors = {
  research: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  design: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  development: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  content_creation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  filming: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  voice_over: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  communication: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

export default function ContractTasksPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params?.id ? parseInt(params.id as string) : 0;

  const [retryCount, setRetryCount] = useState(0);

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Contracts', href: '/super-admin/clients-management/contracts' },
    { label: 'Contract Tasks' }
  ];

  // Fetch contract tasks
  const { 
    data: tasksResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useContractTasks(contractId);

  const tasks = tasksResponse?.data?.tasks || [];

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Define table columns (Read-only - no actions column)
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Task Name', type: 'text', align: 'right' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { 
      key: 'task_type', 
      label: 'Type', 
      type: 'badge', 
      align: 'center',
      badgeColors: taskTypeColors
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge', 
      align: 'center',
      badgeColors: statusColors
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'badge', 
      align: 'center',
      badgeColors: priorityColors
    },
    { key: 'assigned_employee_name', label: 'Assigned To', type: 'text', align: 'right' },
    { key: 'service_name', label: 'Service', type: 'text', align: 'right' },
    { key: 'estimated_hours', label: 'Est. Hours', type: 'text', align: 'center' },
    { key: 'progress', label: 'Progress', type: 'text', align: 'center' },
    { key: 'due_date', label: 'Due Date', type: 'date', align: 'right' }
  ];

  // Transform tasks data for the table
  const transformedTasks = tasks.map((task: any) => ({
    id: task.id,
    name: task.name,
    description: task.description || 'N/A',
    task_type: task.task_type,
    status: task.status,
    priority: task.priority,
    assigned_employee_name: task.assigned_employee?.full_name || task.assigned_employee?.name || 'Unassigned',
    service_name: task.service?.name || 'N/A',
    estimated_hours: task.estimated_hours ? `${task.estimated_hours}h` : 'N/A',
    progress: `${task.progress_percentage || 0}%`,
    due_date: task.due_date
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Contract Tasks
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading contract tasks...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError && error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contract Tasks</h1>
                <p className="text-gray-600 dark:text-gray-400">View tasks for this contract</p>
              </div>
              <ErrorDisplay error={error} onRetry={handleRetry} />
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/super-admin/clients-management/contracts')}
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Contracts
                  </Button>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
                  Contract Tasks
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View all tasks assigned to this contract ({tasks.length} tasks found)
                </p>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {tasks.length > 0 ? (
                <DataTable
                  data={transformedTasks}
                  columns={columns}
                  searchable={true}
                  searchPlaceholder="Search tasks..."
                  filterable={false}
                  selectable={false}
                  pagination={true}
                  defaultItemsPerPage={10}
                  className="flex-1 flex flex-col min-h-0"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Tasks Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No tasks are currently assigned to this contract.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

