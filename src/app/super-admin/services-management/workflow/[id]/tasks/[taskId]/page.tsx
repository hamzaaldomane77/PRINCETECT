'use client';

import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, WorkflowIcon, ClockIcon, HashIcon, TagIcon, SettingsIcon } from '@/components/ui/icons';
import { useWorkflowTask } from '@/modules/workflow-tasks';
import { useServiceWorkflow as useWorkflow } from '@/modules/service-workflows';

export default function WorkflowTaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = parseInt(params.id as string);
  const taskId = parseInt(params.taskId as string);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Workflow Management', href: '/super-admin/services-management/workflow' },
    { label: 'Workflow Tasks', href: `/super-admin/services-management/workflow/${workflowId}/tasks` },
    { label: 'Task Details' }
  ];

  // Fetch data
  const { data: task, isLoading: taskLoading, error: taskError } = useWorkflowTask(workflowId, taskId);
  const { data: workflow, isLoading: workflowLoading } = useWorkflow(workflowId);

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
    };
    return colors[taskType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  if (taskLoading || workflowLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading task details...</p>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (taskError || !task) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Task Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested task could not be found.
                  </p>
                  <Button onClick={() => router.back()}>
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Go Back
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
                  Task Details
                </h1>
                {workflow && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Task from workflow: <span className="font-medium">{workflow.name}</span>
                  </p>
                )}
              </div>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Tasks
              </Button>
            </div>

            {/* Task Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Task Name */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <TagIcon className="h-4 w-4" />
                    Task Name
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task.name}
                  </p>
                </CardContent>
              </Card>

              {/* Task Type */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Task Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getTaskTypeColor(task.task_type)}>
                    {task.task_type.replace('_', ' ')}
                  </Badge>
                </CardContent>
              </Card>

              {/* Order Sequence */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <HashIcon className="h-4 w-4" />
                    Order Sequence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task.order_sequence}
                  </p>
                </CardContent>
              </Card>

              {/* Estimated Duration */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Estimated Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {task.estimated_duration_hours} hours
                  </p>
                </CardContent>
              </Card>

              {/* Required Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={task.is_required ? 'default' : 'secondary'}>
                    {task.is_required ? 'Required' : 'Optional'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Dependencies */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dependencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 dark:text-white">
                    {task.dependencies ? `Task #${task.dependencies}` : 'No dependencies'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Description */}
              {task.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Required Skills */}
              {task.required_skills && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Required Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">
                      {task.required_skills}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {task.notes && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {task.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Created At
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(task.created_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(task.updated_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
