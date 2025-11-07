'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, PlusIcon, EyeIcon, EditIcon, TrashIcon, WorkflowIcon } from '@/components/ui/icons';
import { useWorkflowTasks, useDeleteWorkflowTask, useToggleWorkflowTaskStatus, useTaskTypesLookup } from '@/modules/workflow-tasks';
import { useServiceWorkflow as useWorkflow } from '@/modules/service-workflows';
import { toast } from 'sonner';

export default function WorkflowTasksPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = parseInt(params.id as string);

  const [searchTerm, setSearchTerm] = useState('');
  const [taskTypeFilter, setTaskTypeFilter] = useState('');
  const [requiredFilter, setRequiredFilter] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Workflow Management', href: '/super-admin/services-management/workflow' },
    { label: 'Workflow Tasks' }
  ];

  // Fetch workflow details (which includes tasks)
  const { data: workflow, isLoading, error } = useWorkflow(workflowId);
  
  // Fetch task types for filter
  const { data: taskTypes, isLoading: taskTypesLoading } = useTaskTypesLookup(workflowId);
  
  // Extract and filter tasks from workflow data
  const allTasks = workflow?.tasks || [];
  
  // Apply local filtering
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = !searchTerm || task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !taskTypeFilter || taskTypeFilter === 'all' || task.task_type === taskTypeFilter;
    const matchesRequired = !requiredFilter || requiredFilter === 'all' ||
      (requiredFilter === 'true' && task.is_required) || 
      (requiredFilter === 'false' && !task.is_required);
    
    return matchesSearch && matchesType && matchesRequired;
  });
  
  // Sort by order sequence
  const tasks = filteredTasks.sort((a, b) => a.order_sequence - b.order_sequence);

  const deleteTaskMutation = useDeleteWorkflowTask(workflowId);
  const toggleTaskStatusMutation = useToggleWorkflowTaskStatus(workflowId);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleTaskTypeFilter = (value: string) => {
    setTaskTypeFilter(value);
  };

  const handleRequiredFilter = (value: string) => {
    setRequiredFilter(value);
  };

  const handleDelete = (taskId: number) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTaskMutation.mutateAsync(taskToDelete);
        toast.success('Task deleted successfully!');
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleToggleStatus = async (taskId: number) => {
    try {
      await toggleTaskStatusMutation.mutateAsync(taskId);
      toast.success('Task status updated successfully!');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    const colors: Record<string, string> = {
      script_writing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      filming: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      editing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      design: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      voice_over: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      animation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      sound_design: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      review: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      research: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      content_creation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      communication: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    };
    return colors[taskType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  // Transform tasks data for the table
  const tableData = tasks.map(task => ({
    ...task,
    task_type_display: task.task_type.replace('_', ' '),
    duration_display: `${task.estimated_duration_hours}h`,
    required_display: task.is_required ? 'Required' : 'Optional',
  }));

  const columns: Column[] = [
    {
      key: 'order_sequence',
      label: 'Order',
      type: 'text',
      width: '80px',
      align: 'center',
    },
    {
      key: 'name',
      label: 'Task Name',
      type: 'text',
      align: 'right',
    },
    {
      key: 'task_type_display',
      label: 'Type',
      type: 'badge',
      align: 'center',
      badgeColors: {
        'script writing': getTaskTypeColor('script_writing'),
        'filming': getTaskTypeColor('filming'),
        'editing': getTaskTypeColor('editing'),
        'design': getTaskTypeColor('design'),
        'voice over': getTaskTypeColor('voice_over'),
        'animation': getTaskTypeColor('animation'),
        'sound design': getTaskTypeColor('sound_design'),
        'review': getTaskTypeColor('review'),
        'research': getTaskTypeColor('research'),
        'content creation': getTaskTypeColor('content_creation'),
        'communication': getTaskTypeColor('communication'),
      },
    },
    {
      key: 'duration_display',
      label: 'Duration (Hours)',
      type: 'text',
      align: 'center',
    },
    {
      key: 'required_display',
      label: 'Required',
      type: 'badge',
      align: 'center',
      badgeColors: {
        'Required': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Optional': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      align: 'center',
      width: '80px',
    },
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: TrashIcon,
      label: 'Delete Task',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: (task: any) => {
        handleDelete(task.id);
      }
    }
  ];

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Error Loading Tasks
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Failed to load workflow tasks. Please try again.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
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
          <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <WorkflowIcon className="h-6 w-6" />
                  Workflow Tasks
                </h1>
                {workflow && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Tasks for workflow: <span className="font-medium">{workflow.name}</span>
                  </p>
                )}
              </div>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Workflows
              </Button>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="flex-1">
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={taskTypeFilter} onValueChange={handleTaskTypeFilter} disabled={taskTypesLoading}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={taskTypesLoading ? "Loading types..." : "Filter by type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {taskTypes?.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={requiredFilter} onValueChange={handleRequiredFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Required" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Required</SelectItem>
                      <SelectItem value="false">Optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => router.push(`/super-admin/services-management/workflow/${workflowId}/tasks/create`)}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <DataTable
                data={tableData}
                columns={columns}
                actions={actions}
                searchable={false}
                filterable={false}
                selectable={false}
                pagination={true}
                defaultItemsPerPage={10}
              />
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this task?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete Task'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
