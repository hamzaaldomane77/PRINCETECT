'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeftIcon, 
  RefreshIcon, 
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  BuildingIcon,
  BriefcaseIcon
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
import { useEmployeeTask, useUpdateTaskStatus } from '@/modules/employee-tasks';
import { toast } from 'sonner';

const taskTypeColors: Record<string, string> = {
  research: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  content_creation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  design: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  filming: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  voice_over: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  communication: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  // Fetch task details
  const { 
    data: taskResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployeeTask(taskId);

  // Get task data directly from response
  const task = taskResponse?.data;

  // Mutations
  const updateTaskStatusMutation = useUpdateTaskStatus();

  const handleCompleteTask = () => {
    setCompleteDialogOpen(true);
  };

  const confirmCompleteTask = async () => {
    if (!task) return;
    
    try {
      await updateTaskStatusMutation.mutateAsync({
        taskId: task.id,
        data: { 
          status: 'completed',
          progress_percentage: 100
        }
      });
      toast.success('Task completed successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to update task status. Please try again.');
    } finally {
      setCompleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading task details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !task) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Task
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                {error?.message || 'Task not found'}
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={() => refetch()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshIcon className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.name}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Task ID: #{task.id}</p>
          </div>
          
          {task.status !== 'completed' && (
            <Button
              onClick={handleCompleteTask}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Information */}
            <Card>
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileTextIcon className="w-5 h-5" />
                  Task Information
                </h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{task.description || 'No description provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                    <div className="mt-1">
                      <Badge className={taskTypeColors[task.task_type] || taskTypeColors.research}>
                        {task.task_type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-1">
                      <Badge className={statusColors[task.status]}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                    <div className="mt-1">
                      <Badge className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</label>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${task.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {task.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                    <p className="mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {task.notes}
                    </p>
                  </div>
                )}

                {task.feedback && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Feedback</label>
                    <p className="mt-1 text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      {task.feedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time & Dates */}
            <Card>
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  Time & Dates
                </h2>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Hours</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {task.estimated_hours || 'N/A'} hrs
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Hours</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {task.actual_hours || 'N/A'} hrs
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(task.start_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(task.due_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Date</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(task.completed_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</label>
                    <div className="mt-1">
                      <Badge className={task.is_overdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {task.is_overdue ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Related Info */}
          <div className="space-y-6">
            {/* Contract Information */}
            {task.contract && (
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5" />
                    Contract
                  </h2>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract Number</label>
                    <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">{task.contract.contract_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{task.contract.title}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Information */}
            {task.service && (
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5" />
                    Service
                  </h2>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-900 dark:text-white font-medium">{task.service.name}</p>
                </CardContent>
              </Card>
            )}

            {/* Client Information */}
            {task.client && (
              <Card>
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BuildingIcon className="w-5 h-5" />
                    Client
                  </h2>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{task.client.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{task.client.company_name}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Complete Task Confirmation Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Task as Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark the task &quot;{task.name}&quot; as completed? 
              <br />
              <span className="text-green-600 font-medium">This will update the task status to completed.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCompleteTask}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={updateTaskStatusMutation.isPending}
            >
              {updateTaskStatusMutation.isPending ? 'Updating...' : 'Mark as Complete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

