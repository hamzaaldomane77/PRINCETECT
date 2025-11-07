'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, SaveIcon, WorkflowIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { useCreateWorkflowTask, useTaskTypesLookup, useTaskDependenciesLookup, useWorkflowTasks } from '@/modules/workflow-tasks';
import { useServiceWorkflow } from '@/modules/service-workflows';
import { CreateWorkflowTaskRequest } from '@/modules/workflow-tasks/types';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function CreateWorkflowTaskPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = parseInt(params.id as string);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Workflow Management', href: '/super-admin/services-management/workflow' },
    { label: 'Workflow Tasks', href: `/super-admin/services-management/workflow/${workflowId}/tasks` },
    { label: 'Create Task' }
  ];

  // Fetch workflow details
  const { data: workflow } = useServiceWorkflow(workflowId);

  // Fetch lookup data
  const { data: taskTypes, isLoading: taskTypesLoading } = useTaskTypesLookup(workflowId);
  const { data: taskDependencies, isLoading: dependenciesLoading } = useTaskDependenciesLookup(workflowId);
  
  // Fetch existing tasks to calculate next order_sequence
  const { data: existingTasksResponse } = useWorkflowTasks(workflowId, {});
  const existingTasks = existingTasksResponse?.data.tasks || [];

  const createTaskMutation = useCreateWorkflowTask(workflowId);

  const [formData, setFormData] = useState<CreateWorkflowTaskRequest>({
    name: '',
    description: '',
    task_type: '',
    estimated_duration_hours: 1,
    order_sequence: 1,
    is_required: true,
    dependencies: [],
    required_skills: [],
    notes: '',
  });

  // Calculate next available order_sequence
  const getNextOrderSequence = () => {
    if (existingTasks.length === 0) return 1;
    const maxOrder = Math.max(...existingTasks.map(t => t.order_sequence));
    return maxOrder + 1;
  };

  // Update order_sequence automatically when existing tasks are loaded
  useEffect(() => {
    const nextOrder = getNextOrderSequence();
    setFormData(prev => ({
      ...prev,
      order_sequence: nextOrder
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingTasks.length]);

  const handleInputChange = (field: keyof CreateWorkflowTaskRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle dependencies array
  const toggleDependency = (taskId: number) => {
    setFormData(prev => {
      const currentDeps = prev.dependencies || [];
      const isSelected = currentDeps.includes(taskId);
      
      if (isSelected) {
        // Remove dependency
        return {
          ...prev,
          dependencies: currentDeps.filter((d: number) => d !== taskId)
        };
      } else {
        // Add dependency
        return {
          ...prev,
          dependencies: [...currentDeps, taskId]
        };
      }
    });
  };

  // Handle required_skills array
  const addRequiredSkill = () => {
    setFormData(prev => ({
      ...prev,
      required_skills: [...(prev.required_skills || []), '']
    }));
  };

  const removeRequiredSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      required_skills: (prev.required_skills || []).filter((_: string, i: number) => i !== index)
    }));
  };

  const updateRequiredSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: (prev.required_skills || []).map((s: string, i: number) => i === index ? value : s)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate and set order_sequence automatically
    const nextOrder = getNextOrderSequence();
    
    // Prepare data for submission
    const dependenciesArray = formData.dependencies && formData.dependencies.length > 0
      ? formData.dependencies.filter(d => d !== null && d !== undefined)
      : null;
    
    const requiredSkillsArray = formData.required_skills && formData.required_skills.length > 0
      ? formData.required_skills.filter(s => s && s.trim().length > 0)
      : null;
    
    const submitData: CreateWorkflowTaskRequest = {
      ...formData,
      order_sequence: nextOrder, // Set automatically calculated order
      dependencies: dependenciesArray,
      required_skills: requiredSkillsArray,
    };
    
    try {
      await createTaskMutation.mutateAsync(submitData);
      toast.success('Task created successfully!');
      router.push(`/super-admin/services-management/workflow/${workflowId}/tasks`);
    } catch (error: any) {
      // Check for duplicate order_sequence error
      if (error?.response?.data?.message?.includes('unique_task_order_per_workflow') || 
          error?.response?.data?.message?.includes('Duplicate entry')) {
        toast.error(`Order sequence ${formData.order_sequence} is already used. Please choose a different value.`);
      } else {
        toast.error(error?.response?.data?.message || 'Failed to create task');
      }
    }
  };

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
                  Create New Task
                </h1>
                {workflow && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Add a new task to workflow: <span className="font-medium">{workflow.name}</span>
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
                  Fill in the details below to create a new task
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
                      type="text"
                      value={formData.estimated_duration_hours || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers
                        if (value === '' || /^\d+$/.test(value)) {
                          handleInputChange('estimated_duration_hours', value === '' ? 1 : parseInt(value) || 1);
                        }
                      }}
                      placeholder="Enter hours"
                      required
                      className="h-11"
                    />
                  </div>


                  {/* Dependencies */}
                  <div className="space-y-2 lg:col-span-2 xl:col-span-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dependencies
                    </Label>
                    {dependenciesLoading ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Loading dependencies...</p>
                    ) : taskDependencies && taskDependencies.length > 0 ? (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 max-h-48 overflow-y-auto">
                        <div className="space-y-3">
                          {taskDependencies.map((dependency) => {
                            const isSelected = formData.dependencies?.includes(dependency.value) || false;
                            return (
                              <div key={dependency.value} className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                  id={`dependency-${dependency.value}`}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleDependency(dependency.value)}
                                />
                                <Label
                                  htmlFor={`dependency-${dependency.value}`}
                                  className="text-sm font-normal cursor-pointer flex-1"
                                >
                                  {dependency.label}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No dependencies available. Create tasks first to add dependencies.
                      </p>
                    )}
                    {formData.dependencies && formData.dependencies.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Selected: {formData.dependencies.length} {formData.dependencies.length === 1 ? 'dependency' : 'dependencies'}
                      </p>
                    )}
                  </div>

                  {/* Required Skills */}
                  <div className="space-y-2 lg:col-span-2 xl:col-span-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Required Skills
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addRequiredSkill}
                        className="h-8"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add Skill
                      </Button>
                    </div>
                    {formData.required_skills && formData.required_skills.length > 0 ? (
                      <div className="space-y-2">
                        {formData.required_skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={skill || ''}
                              onChange={(e) => updateRequiredSkill(index, e.target.value)}
                              placeholder="Enter skill name"
                              className="h-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRequiredSkill(index)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 h-10 w-10 p-0"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No skills added. Click "Add Skill" to add one.
                      </p>
                    )}
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
                    disabled={createTaskMutation.isPending}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTaskMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                  >
                    {createTaskMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Create Task
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
