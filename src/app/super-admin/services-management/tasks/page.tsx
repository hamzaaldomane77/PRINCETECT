'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon, UserPlusIcon, SearchIcon } from '@/components/ui/icons';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTasks, useDeleteTask, useEmployeesLookup, useTaskTypesLookup, useWorkflowsLookup } from '@/modules/tasks';
import { Task } from '@/modules/tasks/types';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export default function TasksPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const router = useRouter();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState(''); // The actual search query used for filtering
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [assignedEmployeeFilter, setAssignedEmployeeFilter] = useState<string>('all');
  const [workflowFilter, setWorkflowFilter] = useState<string>('all');
  const [overdueFilter, setOverdueFilter] = useState<boolean>(false);
  const [unassignedFilter, setUnassignedFilter] = useState<boolean>(false);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Tasks' }
  ];

  // Fetch lookup data
  const { data: employeesData } = useEmployeesLookup();
  const { data: taskTypesData } = useTaskTypesLookup();
  const { data: workflowsData } = useWorkflowsLookup();
  const employees = employeesData || [];
  const taskTypes = taskTypesData || [];
  const workflows = workflowsData || [];

  // Build filter params using useMemo to prevent unnecessary recalculations
  const filterParams = useMemo(() => {
    const params: any = {};
    
    if (activeSearchQuery) params.q = activeSearchQuery;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (priorityFilter && priorityFilter !== 'all') params.priority = priorityFilter;
    if (taskTypeFilter && taskTypeFilter !== 'all') params.task_type = taskTypeFilter;
    if (assignedEmployeeFilter && assignedEmployeeFilter !== 'all') {
      params.assigned_employee_id = parseInt(assignedEmployeeFilter);
    }
    if (workflowFilter && workflowFilter !== 'all') {
      params.contract_service_workflow_id = parseInt(workflowFilter);
    }
    if (overdueFilter === true) params.overdue = true;
    if (unassignedFilter === true) params.unassigned = true;
    
    return params;
  }, [
    activeSearchQuery,
    statusFilter,
    priorityFilter,
    taskTypeFilter,
    assignedEmployeeFilter,
    workflowFilter,
    overdueFilter,
    unassignedFilter,
  ]);

  // Fetch tasks using the hook with filters
  const { 
    data: tasksResponse, 
    isLoading, 
    error, 
    refetch,
    isError,
    isFetching 
  } = useTasks(filterParams);

  const tasks = tasksResponse?.data.tasks || [];

  // Mutations
  const deleteTaskMutation = useDeleteTask();

  // Note: Tasks are created through workflows, not directly
  // This function can be removed or used for other purposes

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTaskMutation.mutateAsync(taskToDelete.id);
      toast.success('Task deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'in_progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'on_hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[status.toLowerCase()] || colors['pending'];
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[priority.toLowerCase()] || colors['medium'];
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

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Task Name', type: 'text', align: 'right' },
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
      key: 'status_display', 
      label: 'Status', 
      type: 'badge', 
      align: 'center',
      badgeColors: {
        'Pending': getStatusColor('pending'),
        'In Progress': getStatusColor('in_progress'),
        'Completed': getStatusColor('completed'),
        'On Hold': getStatusColor('on_hold'),
      },
    },
    { 
      key: 'priority_display', 
      label: 'Priority', 
      type: 'badge', 
      align: 'center',
      badgeColors: {
        'Low': getPriorityColor('low'),
        'Medium': getPriorityColor('medium'),
        'High': getPriorityColor('high'),
        'Urgent': getPriorityColor('urgent'),
      },
    },
    { key: 'estimated_hours', label: 'Est. Hours', type: 'text', align: 'center' },
    { key: 'progress_display', label: 'Progress', type: 'text', align: 'center' },
    { key: 'assigned_employee_display', label: 'Assigned To', type: 'text', align: 'center' },
    { key: 'contract_display', label: 'Contract', type: 'text', align: 'right' },
    { key: 'service_display', label: 'Service', type: 'text', align: 'right' },
    { key: 'client_display', label: 'Client', type: 'text', align: 'right' },
    { 
      key: 'assign_action', 
      label: 'Assign', 
      type: 'custom', 
      align: 'center',
      width: '100px',
      render: (task: Task) => (
        <Button
          onClick={() => router.push(`/super-admin/services-management/tasks/${task.id}/assign`)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
        >
          <UserPlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Assign</span>
        </Button>
      )
    },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Task',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (task: Task) => {
        router.push(`/super-admin/services-management/tasks/${task.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Task',
      color: 'text-orange-600 dark:text-orange-400',
      hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900',
      onClick: (task: Task) => {
        router.push(`/super-admin/services-management/tasks/${task.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Task',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteTask
    }
  ];

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  const handleSearch = (query: string) => {
    // Update search query for UI display only
    setSearchQuery(query);
  };

  const handleSearchSubmit = () => {
    // Update active search query to trigger API call
    setActiveSearchQuery(searchQuery);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Trigger search on Enter key press
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTaskTypeFilter('all');
    setAssignedEmployeeFilter('all');
    setWorkflowFilter('all');
    setOverdueFilter(false);
    setUnassignedFilter(false);
  };

  // Handle bulk assign - navigate to bulk assign page
  const handleOpenBulkAssign = () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one task to assign');
      return;
    }
    // Navigate to bulk assign page with task IDs as query parameters
    const taskIdsParam = selectedRows.join(',');
    router.push(`/super-admin/services-management/tasks/bulk-assign?task_ids=${taskIdsParam}`);
  };

  // Transform tasks data for the table
  const transformedTasks = tasks.map(task => {
    // Handle assigned_employee if it's an object
    const assignedEmployeeId = typeof task.assigned_employee === 'object' && task.assigned_employee !== null
      ? (task.assigned_employee as any).id || null
      : task.assigned_employee;
    
    // Handle assigned_employee name if it's an object
    const assignedEmployeeName = typeof task.assigned_employee === 'object' && task.assigned_employee !== null
      ? (task.assigned_employee as any).full_name || (task.assigned_employee as any).name || null
      : null;

    // Create a clean task object without nested objects that might cause issues
    const cleanTask = {
      id: task.id,
      name: task.name,
      description: task.description,
      task_type: task.task_type,
      status: task.status,
      priority: task.priority,
      estimated_hours: task.estimated_hours,
      actual_hours: task.actual_hours,
      start_date: task.start_date,
      due_date: task.due_date,
      completed_date: task.completed_date,
      progress_percentage: task.progress_percentage,
      is_overdue: task.is_overdue,
      notes: task.notes,
      feedback: task.feedback,
      assigned_employee: assignedEmployeeId, // Ensure it's always a number or null
      // Display fields
      assigned_employee_display: assignedEmployeeName || 'Not Assigned',
      task_type_display: task.task_type.replace('_', ' '),
      status_display: task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' '),
      priority_display: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
      progress_display: `${task.progress_percentage}%`,
      contract_display: task.contract ? `${task.contract.contract_number} - ${task.contract.title}` : 'N/A',
      service_display: task.service?.name || 'N/A',
      client_display: task.client ? (task.client.company_name || task.client.name) : 'N/A',
      // Create a clean simple object for assign action - no nested objects
      contract: task.contract ? {
        id: task.contract.id,
        contract_number: task.contract.contract_number,
        title: task.contract.title
      } : null,
      service: task.service ? {
        id: task.service.id,
        name: task.service.name
      } : null,
      client: task.client ? {
        id: task.client.id,
        name: task.client.name,
        company_name: task.client.company_name
      } : null,
      workflow_task: task.workflow_task ? {
        id: task.workflow_task.id,
        name: task.workflow_task.name
      } : null,
    };

    return cleanTask;
  });

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Tasks
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

  // Only show full page loading on initial load
  if (isLoading && retryCount === 0 && !tasksResponse) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading tasks...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all tasks</p>
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

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all tasks</p>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-semibold">💡 Tip:</span> You can assign multiple tasks to an employee at once. 
                    Select the tasks you want to assign using the checkboxes, then click the &quot;Assign Selected&quot; button that appears above.
                  </p>
                </div>
              </div>
              
              {selectedRows.length > 0 && (
                <Button
                  onClick={handleOpenBulkAssign}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Assign Selected ({selectedRows.length})
                </Button>
              )}
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  Clear All Filters
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search (Name/Description)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      className="h-10 flex-1"
                    />
                    <Button
                      onClick={handleSearchSubmit}
                      variant="default"
                      size="default"
                      className="h-10 px-4 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <SearchIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Task Type
                  </label>
                  <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {taskTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assigned Employee Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assigned Employee
                  </label>
                  <Select value={assignedEmployeeFilter} onValueChange={setAssignedEmployeeFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.value} value={employee.value.toString()}>
                          {employee.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Workflow Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Workflow
                  </label>
                  <Select value={workflowFilter} onValueChange={setWorkflowFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Workflows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Workflows</SelectItem>
                      {workflows.map((workflow) => (
                        <SelectItem key={workflow.value} value={workflow.value.toString()}>
                          {workflow.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Overdue Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Overdue Tasks
                  </label>
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="overdue"
                      checked={overdueFilter}
                      onCheckedChange={(checked) => setOverdueFilter(checked === true)}
                    />
                    <label
                      htmlFor="overdue"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Show overdue tasks only
                    </label>
                  </div>
                </div>

                {/* Unassigned Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unassigned Tasks
                  </label>
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="unassigned"
                      checked={unassignedFilter}
                      onCheckedChange={(checked) => setUnassignedFilter(checked === true)}
                    />
                    <label
                      htmlFor="unassigned"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Show unassigned tasks only
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 relative">
              {/* Show loading overlay only when fetching (not initial load) */}
              {isFetching && tasksResponse && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Updating...</div>
                  </div>
                </div>
              )}
              
              {tasks.length > 0 ? (
                <DataTable
                  data={transformedTasks}
                  columns={columns}
                  actions={actions}
                  searchable={false}
                  searchPlaceholder="Search tasks..."
                  filterable={false}
                  selectable={true}
                  pagination={true}
                  defaultItemsPerPage={10}
                  onSelectionChange={handleSelectionChange}
                  onSearch={handleSearch}
                  className="flex-1 flex flex-col min-h-0"
                />
              ) : !isFetching ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Tasks Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No tasks are currently available. Tasks are created through workflows.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من أنك تريد حذف المهمة &quot;{taskToDelete?.name}&quot;؟ 
                <br />
                <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteTaskMutation.isPending}
              >
                {deleteTaskMutation.isPending ? 'جاري الحذف...' : 'حذف المهمة'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

