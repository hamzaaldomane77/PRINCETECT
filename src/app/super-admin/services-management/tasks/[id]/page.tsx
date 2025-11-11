'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { useTask, useDeleteTask } from '@/modules/tasks';
import { toast } from 'sonner';
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

export default function TaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = parseInt(params.id as string);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Tasks', href: '/super-admin/services-management/tasks' },
    { label: 'Task Details' }
  ];

  const { 
    data: task, 
    isLoading, 
    error, 
    refetch 
  } = useTask(taskId);

  const deleteTaskMutation = useDeleteTask();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast.success('Task deleted successfully!');
      router.push('/super-admin/services-management/tasks');
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading task details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !task) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Task Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested task could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
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

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Details</h1>
                <p className="text-gray-600 dark:text-gray-400">View task information</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/super-admin/services-management/tasks/${taskId}/assign`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <EditIcon className="h-4 w-4" />
                  Assign Task
                </Button>
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </Button>
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Information</CardTitle>
                    <CardDescription>Basic task details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Task Name</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{task.name}</p>
                    </div>
                    {task.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                        <p className="text-gray-900 dark:text-white">{task.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Task Type</label>
                        <div className="mt-1">
                          <Badge className={getTaskTypeColor(task.task_type)}>
                            {task.task_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <div className="mt-1">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</label>
                        <div className="mt-1">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{task.progress_percentage}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time & Dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Hours</label>
                        <p className="text-gray-900 dark:text-white">{task.estimated_hours} hours</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Hours</label>
                        <p className="text-gray-900 dark:text-white">{task.actual_hours || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(task.start_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(task.due_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Date</label>
                        <p className="text-gray-900 dark:text-white">{formatDate(task.completed_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Is Overdue</label>
                        <p className="text-gray-900 dark:text-white">
                          {task.is_overdue ? (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Yes</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">No</Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {(task.notes || task.feedback) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes & Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {task.notes && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                          <p className="text-gray-900 dark:text-white">{task.notes}</p>
                        </div>
                      )}
                      {task.feedback && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Feedback</label>
                          <p className="text-gray-900 dark:text-white">{task.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Related Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.contract && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract</label>
                        <p className="text-gray-900 dark:text-white">{task.contract.contract_number}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.contract.title}</p>
                      </div>
                    )}
                    {task.service && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</label>
                        <p className="text-gray-900 dark:text-white">{task.service.name}</p>
                      </div>
                    )}
                    {task.client && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</label>
                        <p className="text-gray-900 dark:text-white">{task.client.name}</p>
                        {task.client.company_name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{task.client.company_name}</p>
                        )}
                      </div>
                    )}
                    {task.workflow_task && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Workflow Task</label>
                        <p className="text-gray-900 dark:text-white">{task.workflow_task.name}</p>
                      </div>
                    )}
                    {task.assigned_employee && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Employee</label>
                        <p className="text-gray-900 dark:text-white">
                          {typeof task.assigned_employee === 'object' && task.assigned_employee !== null
                            ? (task.assigned_employee as any).full_name || (task.assigned_employee as any).name || `Employee ID: ${(task.assigned_employee as any).id}`
                            : `Employee ID: ${task.assigned_employee}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من أنك تريد حذف المهمة &quot;{task.name}&quot;؟ 
                <br />
                <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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

