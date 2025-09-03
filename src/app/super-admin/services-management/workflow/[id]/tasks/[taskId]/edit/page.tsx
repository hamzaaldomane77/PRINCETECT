'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, SaveIcon, WorkflowIcon } from '@/components/ui/icons';
import { useWorkflowTask, useUpdateWorkflowTask, useTaskTypesLookup, useTaskDependenciesLookup } from '@/modules/workflow-tasks';
import { useServiceWorkflow } from '@/modules/service-workflows';
import { UpdateWorkflowTaskRequest } from '@/modules/workflow-tasks/types';
import { toast } from 'sonner';

export default function EditWorkflowTaskPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = parseInt(params.id as string);
  const taskId = parseInt(params.taskId as string);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Workflow Management', href: '/super-admin/services-management/workflow' },
    { label: 'Workflow Tasks', href: `/super-admin/services-management/workflow/${workflowId}/tasks` },
    { label: 'Edit Task' }
  ];

  // Fetch data
  const { data: currentTask, isLoading: taskLoading, error: taskError } = useWorkflowTask(workflowId, taskId);
  const { data: workflow } = useServiceWorkflow(workflowId);
  const { data: taskTypes, isLoading: taskTypesLoading } = useTaskTypesLookup(workflowId);
  const { data: taskDependencies, isLoading: dependenciesLoading } = useTaskDependenciesLookup(workflowId);

  const updateTaskMutation = useUpdateWorkflowTask(workflowId, taskId);

  const [formData, setFormData] = useState<UpdateWorkflowTaskRequest>({
    name: '',
    description: '',
    task_type: '',
    estimated_duration_hours: 1,
    order_sequence: 1,
    is_required: true,
    dependencies: null,
    required_skills: '',
    notes: '',
  });

  // Populate form data when task is loaded
  useEffect(() => {
    if (currentTask) {
      setFormData({
        name: currentTask.name || '',
        description: currentTask.description || '',
        task_type: currentTask.task_type || '',
        estimated_duration_hours: currentTask.estimated_duration_hours || 1,
        order_sequence: currentTask.order_sequence || 1,
        is_required: currentTask.is_required ?? true,
        dependencies: currentTask.dependencies,
        required_skills: currentTask.required_skills || '',
        notes: currentTask.notes || '',
      });
    }
  }, [currentTask]);

  const handleInputChange = (field: keyof UpdateWorkflowTaskRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateTaskMutation.mutateAsync(formData);
      toast.success('Task updated successfully!');
      router.push(`/super-admin/services-management/workflow/${workflowId}/tasks`);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  if (taskLoading) {
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

  if (taskError || !currentTask) {
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
                  Edit Task
                </h1>
                {workflow && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Edit task in workflow: <span className="font-medium">{workflow.name}</span>
                  </p>
                )}
              </div>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <WorkflowIcon className="h-5 w-5" />
                  Task Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Update the task details below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Task Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Task Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter task name"
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Task Type */}
                  <div className="space-y-2">
                    <Label htmlFor="task_type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Task Type *
                    </Label>
                    <Select
                      value={formData.task_type}
                      onValueChange={(value) => handleInputChange('task_type', value)}
                      disabled={taskTypesLoading}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={taskTypesLoading ? "Loading types..." : "Select task type"} />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes?.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estimated Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="estimated_duration_hours" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration (Hours) *
                    </Label>
                    <Input
                      id="estimated_duration_hours"
                      type="number"
                      min="1"
                      value={formData.estimated_duration_hours || ''}
                      onChange={(e) => handleInputChange('estimated_duration_hours', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Order Sequence */}
                  <div className="space-y-2">
                    <Label htmlFor="order_sequence" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Order Sequence *
                    </Label>
                    <Input
                      id="order_sequence"
                      type="number"
                      min="1"
                      value={formData.order_sequence || ''}
                      onChange={(e) => handleInputChange('order_sequence', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Dependencies */}
                  <div className="space-y-2">
                    <Label htmlFor="dependencies" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dependencies
                    </Label>
                    <Select
                      value={formData.dependencies?.toString() || 'none'}
                      onValueChange={(value) => handleInputChange('dependencies', value === 'none' ? null : parseInt(value))}
                      disabled={dependenciesLoading}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={dependenciesLoading ? "Loading dependencies..." : "Select dependency (optional)"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Dependencies</SelectItem>
                        {taskDependencies?.map((dependency) => (
                          <SelectItem key={dependency.value} value={dependency.value.toString()}>
                            {dependency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Required Skills */}
                  <div className="space-y-2">
                    <Label htmlFor="required_skills" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Required Skills
                    </Label>
                    <Input
                      id="required_skills"
                      value={formData.required_skills}
                      onChange={(e) => handleInputChange('required_skills', e.target.value)}
                      placeholder="Enter required skills"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter task description..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter additional notes..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Status Settings */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  {/* Required Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <Label htmlFor="is_required" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Required Task
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Mark this task as required for the workflow
                      </p>
                    </div>
                    <Switch
                      id="is_required"
                      checked={formData.is_required}
                      onCheckedChange={(checked) => handleInputChange('is_required', checked)}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={updateTaskMutation.isPending}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateTaskMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                  >
                    {updateTaskMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Update Task
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
