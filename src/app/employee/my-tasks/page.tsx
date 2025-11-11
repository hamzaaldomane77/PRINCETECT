'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  EyeIcon, 
  RefreshIcon, 
  CheckCircleIcon, 
  EditIcon,
  AlertTriangleIcon,
  ClockIcon,
  PdaDocumentsIcon
} from '@/components/ui/icons';
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
import { 
  useEmployeeTasks, 
  useStartTask,
  useCompleteTask,
  useHoldTask,
  useUpdateTask,
  useWorkload,
  EmployeeTask 
} from '@/modules/employee-tasks';
import { toast } from 'sonner';

// Custom Icons
const PlayIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PauseIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const taskTypeColors = {
  research: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  content_creation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  design: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  filming: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  voice_over: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  communication: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function MyTasksPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({ actual_hours: '', feedback: '' });
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [holdFormData, setHoldFormData] = useState({ reason: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<EmployeeTask | null>(null);
  const [taskToStart, setTaskToStart] = useState<EmployeeTask | null>(null);
  const [taskToHold, setTaskToHold] = useState<EmployeeTask | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<EmployeeTask | null>(null);
  const [editFormData, setEditFormData] = useState({ notes: '', feedback: '', actual_hours: '' });
  const router = useRouter();

  // Fetch employee tasks and workload
  const { 
    data: tasksResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployeeTasks({ per_page: 15 });

  const { data: workloadData, isLoading: isLoadingWorkload } = useWorkload();

  const tasks = tasksResponse?.data.tasks || [];
  const workload = workloadData?.data;

  // Mutations
  const startTaskMutation = useStartTask();
  const completeTaskMutation = useCompleteTask();
  const holdTaskMutation = useHoldTask();
  const updateTaskMutation = useUpdateTask();

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Start Task
  const handleStartTask = (task: EmployeeTask) => {
    setTaskToStart(task);
    setStartDialogOpen(true);
  };

  const confirmStartTask = async () => {
    if (!taskToStart) return;
    
    try {
      await startTaskMutation.mutateAsync(taskToStart.id);
      toast.success('Task started successfully!');
      refetch();
    } catch (error: any) {
      // Get the error message from API
      const apiMessage = error?.response?.data?.message || error?.message || '';
      
      // Provide a clear, user-friendly message
      let errorMessage = apiMessage;
      
      // Check if the error is about task already started or dependencies
      if (apiMessage.includes('لا يمكن بدء') || apiMessage.includes('المهام السابقة')) {
        errorMessage = `⚠️ ${apiMessage}\n\nThe task you selected has already been started, or there are incomplete previous tasks that need to be completed first.`;
      } else if (!apiMessage) {
        errorMessage = 'Failed to start task. Please try again.';
      }
      
      toast.error(errorMessage, {
        duration: 5000, // Show for 5 seconds
      });
    } finally {
      setStartDialogOpen(false);
      setTaskToStart(null);
    }
  };

  // Complete Task
  const handleCompleteTask = (task: EmployeeTask) => {
    setTaskToComplete(task);
    setCompleteFormData({
      actual_hours: task.actual_hours || '',
      feedback: task.feedback || ''
    });
    setCompleteDialogOpen(true);
  };

  const confirmCompleteTask = async () => {
    if (!taskToComplete) return;
    
    // Validate required fields
    if (!completeFormData.actual_hours) {
      toast.error('Please enter actual hours worked');
      return;
    }
    if (!completeFormData.feedback) {
      toast.error('Please provide feedback');
      return;
    }
    
    try {
      // Complete the task with actual_hours and feedback
      await completeTaskMutation.mutateAsync({
        taskId: taskToComplete.id,
        data: {
          actual_hours: parseFloat(completeFormData.actual_hours),
          feedback: completeFormData.feedback
        }
      });
      toast.success('Task completed successfully!');
      refetch();
    } catch (error: any) {
      // Display specific error message from API or a generic one
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to complete task. Please try again.';
      toast.error(errorMessage);
    } finally {
      setCompleteDialogOpen(false);
      setTaskToComplete(null);
      setCompleteFormData({ actual_hours: '', feedback: '' });
    }
  };

  // Hold Task
  const handleHoldTask = (task: EmployeeTask) => {
    setTaskToHold(task);
    setHoldFormData({ reason: task.notes || '' });
    setHoldDialogOpen(true);
  };

  const confirmHoldTask = async () => {
    if (!taskToHold) return;
    
    // Validate required field
    if (!holdFormData.reason) {
      toast.error('Please provide a reason for putting the task on hold');
      return;
    }
    
    try {
      // Put task on hold with reason
      await holdTaskMutation.mutateAsync({
        taskId: taskToHold.id,
        data: {
          reason: holdFormData.reason
        }
      });
      toast.success('Task put on hold successfully!');
      refetch();
    } catch (error: any) {
      // Display specific error message from API or a generic one
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to hold task. Please try again.';
      toast.error(errorMessage);
    } finally {
      setHoldDialogOpen(false);
      setTaskToHold(null);
      setHoldFormData({ reason: '' });
    }
  };

  // Edit Task
  const handleEditTask = (task: EmployeeTask) => {
    setTaskToEdit(task);
    setEditFormData({
      notes: task.notes || '',
      feedback: task.feedback || '',
      actual_hours: task.actual_hours || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!taskToEdit) return;

    try {
      await updateTaskMutation.mutateAsync({
        taskId: taskToEdit.id,
        data: {
          notes: editFormData.notes,
          feedback: editFormData.feedback,
          actual_hours: editFormData.actual_hours ? parseFloat(editFormData.actual_hours) : undefined
        }
      });
      toast.success('Task updated successfully!');
      refetch();
      setEditDialogOpen(false);
    } catch (error: any) {
      // Display specific error message from API or a generic one
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to update task. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  const handleSearch = (query: string) => {
    // Search functionality can be implemented here
    console.log('Search:', query);
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Task Name', type: 'text', align: 'right' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { 
      key: 'task_type', 
      label: 'Type', 
      type: 'badge', 
      badgeColors: taskTypeColors,
      align: 'center',
      width: '140px'
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge', 
      badgeColors: statusColors,
      align: 'center',
      width: '120px'
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'badge', 
      badgeColors: priorityColors,
      align: 'center',
      width: '100px'
    },
    { 
      key: 'estimated_hours', 
      label: 'Est. Hours', 
      type: 'text', 
      align: 'center',
      width: '100px'
    },
    { 
      key: 'progress_percentage', 
      label: 'Progress', 
      type: 'text', 
      align: 'center',
      width: '90px'
    },
    { 
      key: 'due_date', 
      label: 'Due Date', 
      type: 'date', 
      align: 'center',
      width: '120px'
    },
    { 
      key: 'contract_number', 
      label: 'Contract', 
      type: 'text', 
      align: 'center',
      width: '140px'
    },
    { 
      key: 'service_name', 
      label: 'Service', 
      type: 'text', 
      align: 'right',
      width: '150px'
    },
    { 
      key: 'client_name', 
      label: 'Client', 
      type: 'text', 
      align: 'right',
      width: '150px'
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      type: 'actions', 
      align: 'center',
      width: '200px'
    },
  ];

  // Define table actions
  const actions: ActionButton[] = [
    {
      label: 'View Details',
      icon: EyeIcon,
      onClick: (task: any) => router.push(`/employee/my-tasks/${task.id}`),
      variant: 'outline'
    },
    {
      label: 'Start Task',
      icon: PlayIcon,
      onClick: (task: any) => handleStartTask(task),
      variant: 'default',
      color: 'bg-green-600 text-white',
      hoverColor: 'hover:bg-green-700'
    },
    {
      label: 'Complete',
      icon: CheckCircleIcon,
      onClick: (task: any) => handleCompleteTask(task),
      variant: 'default',
      color: 'bg-blue-600 text-white',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      label: 'Hold',
      icon: PauseIcon,
      onClick: (task: any) => handleHoldTask(task),
      variant: 'outline',
      color: 'border-yellow-500 text-yellow-600',
      hoverColor: 'hover:bg-yellow-50'
    },
    {
      label: 'Edit',
      icon: EditIcon,
      onClick: (task: any) => handleEditTask(task),
      variant: 'outline'
    }
  ];

  // Error Display Component
  const ErrorDisplay = ({ error, onRetry }: { error: any; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Tasks
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          {error?.message || 'Something went wrong while loading your tasks.'}
        </p>
        <Button onClick={onRetry} className="mt-2">
          <RefreshIcon className="mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );

  // Transform tasks for data table
  const transformedTasks = tasks.map(task => ({
    ...task,
    contract_number: task.contract?.contract_number || 'N/A',
    service_name: task.service?.name || 'N/A',
    client_name: task.client ? (task.client.name || task.client.company_name) : 'N/A',
    progress_percentage: `${task.progress_percentage}%`
  }));

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && error) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track your daily tasks</p>
          </div>
          <ErrorDisplay error={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track your daily tasks</p>
          </div>
        </div>

        {/* Workload Statistics */}
        {workload && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Workload</p>
                    <h3 className="text-3xl font-bold">{workload.percentage.toFixed(1)}%</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <TrendingUpIcon className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Active Tasks</p>
                    <h3 className="text-3xl font-bold">{workload.active_tasks}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <PlayIcon className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">Overdue</p>
                    <h3 className="text-3xl font-bold">{workload.overdue_tasks}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <AlertTriangleIcon className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Total Tasks</p>
                    <h3 className="text-3xl font-bold">{workload.total_tasks}</h3>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <PdaDocumentsIcon className="w-8 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 flex flex-col min-h-0">
          {tasks.length > 0 ? (
            <DataTable
              data={transformedTasks}
              columns={columns}
              actions={actions}
              searchable={true}
              searchPlaceholder="Search tasks..."
              filterable={false}
              selectable={true}
              pagination={true}
              defaultItemsPerPage={10}
              onSelectionChange={handleSelectionChange}
              onSearch={handleSearch}
              className="flex-1 flex flex-col min-h-0"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Tasks Assigned
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  You don't have any tasks assigned at the moment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start Task Confirmation Dialog */}
      <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start the task &quot;{taskToStart?.name}&quot;? This will mark the task as in progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartTask} className="bg-green-600 hover:bg-green-700">
              Start Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Task Dialog with Form */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Task:</strong> {taskToComplete?.name}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Please provide the following information before completing this task.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complete_actual_hours">
                Actual Hours Worked <span className="text-red-500">*</span>
              </Label>
              <Input
                id="complete_actual_hours"
                type="number"
                step="0.5"
                min="0"
                value={completeFormData.actual_hours}
                onChange={(e) => setCompleteFormData({ ...completeFormData, actual_hours: e.target.value })}
                placeholder="e.g., 8"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter the actual number of hours you spent on this task
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complete_feedback">
                Feedback <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="complete_feedback"
                value={completeFormData.feedback}
                onChange={(e) => setCompleteFormData({ ...completeFormData, feedback: e.target.value })}
                placeholder="e.g., Task completed successfully. Work was professional and met specifications."
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Provide feedback about the task completion
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCompleteDialogOpen(false);
              setCompleteFormData({ actual_hours: '', feedback: '' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmCompleteTask}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!completeFormData.actual_hours || !completeFormData.feedback}
            >
              <CheckCircleIcon className="mr-2 w-4 h-4" />
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold Task Dialog with Form */}
      <Dialog open={holdDialogOpen} onOpenChange={setHoldDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Put Task on Hold</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Task:</strong> {taskToHold?.name}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                Please provide a reason for putting this task on hold.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hold_reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="hold_reason"
                value={holdFormData.reason}
                onChange={(e) => setHoldFormData({ reason: e.target.value })}
                placeholder="e.g., في انتظار مراجعة من المدير قبل المتابعة"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Explain why this task needs to be put on hold
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setHoldDialogOpen(false);
              setHoldFormData({ reason: '' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmHoldTask}
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={!holdFormData.reason}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Put on Hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Enter task notes..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={editFormData.feedback}
                onChange={(e) => setEditFormData({ ...editFormData, feedback: e.target.value })}
                placeholder="Enter feedback..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual_hours">Actual Hours</Label>
              <Input
                id="actual_hours"
                type="number"
                step="0.5"
                value={editFormData.actual_hours}
                onChange={(e) => setEditFormData({ ...editFormData, actual_hours: e.target.value })}
                placeholder="e.g., 5.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
