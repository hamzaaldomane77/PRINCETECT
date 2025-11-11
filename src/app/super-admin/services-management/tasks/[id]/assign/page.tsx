'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeftIcon, SaveIcon, CalendarIcon } from '@/components/ui/icons';
import { useTask, useAssignTask, useEmployeesLookup } from '@/modules/tasks';
import { AssignTaskRequest } from '@/modules/tasks/types';
import { toast } from 'sonner';

export default function AssignTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = parseInt(params.id as string);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Tasks', href: '/super-admin/services-management/tasks' },
    { label: 'Assign Task' }
  ];

  // Fetch task details
  const { data: task, isLoading, error } = useTask(taskId);
  const assignTaskMutation = useAssignTask();

  // Fetch employees lookup
  const { data: employeesData, isLoading: employeesLoading } = useEmployeesLookup();
  const employees = employeesData || [];

  const [formData, setFormData] = useState<AssignTaskRequest>({
    assigned_employee_id: 0,
    due_date: null,
    priority: 'medium',
    notes: '',
  });

  // Calendar state
  const [dueDateOpen, setDueDateOpen] = useState(false);

  // Populate form data when task is loaded
  useEffect(() => {
    if (task) {
      // Handle assigned_employee if it's an object
      const assignedEmployeeId = typeof task.assigned_employee === 'object' && task.assigned_employee !== null
        ? (task.assigned_employee as any).id || 0
        : task.assigned_employee || 0;

      setFormData({
        assigned_employee_id: assignedEmployeeId,
        due_date: task.due_date,
        priority: task.priority || 'medium',
        notes: task.notes || '',
      });
    }
  }, [task]);

  const handleInputChange = (field: keyof AssignTaskRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to format date for display
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '';
    const parsed = new Date(date + 'T00:00:00');
    if (isNaN(parsed.getTime())) return '';
    // Format as DD/MM/YYYY
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to format date to YYYY-MM-DD without timezone issues
  const formatDateToISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateToISO(date);
      handleInputChange('due_date', formattedDate);
    }
    setDueDateOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assigned_employee_id || formData.assigned_employee_id === 0) {
      toast.error('Please select an employee to assign the task to');
      return;
    }

    try {
      // Prepare data for submission
      const submitData: AssignTaskRequest = {
        assigned_employee_id: formData.assigned_employee_id,
        due_date: formData.due_date || null,
        priority: formData.priority || 'medium',
        notes: formData.notes || null,
      };

      await assignTaskMutation.mutateAsync({ taskId, data: submitData });
      toast.success('Task assigned successfully!');
      router.push(`/super-admin/services-management/tasks/${taskId}`);
    } catch (error: any) {
      console.error('Failed to assign task:', error);
      toast.error(error?.response?.data?.message || 'Failed to assign task. Please try again.');
    }
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assign Task</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Assign task: <span className="font-medium">{task.name}</span>
                </p>
              </div>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Task Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Task Information</h2>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
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
                        <p className="text-gray-900 dark:text-white">{task.task_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</label>
                        <p className="text-gray-900 dark:text-white">{task.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assignment Information</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assigned Employee */}
                    <div className="space-y-2">
                      <Label htmlFor="assigned_employee_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assign to Employee *
                      </Label>
                      <Select
                        value={formData.assigned_employee_id?.toString() || ''}
                        onValueChange={(value) => handleInputChange('assigned_employee_id', parseInt(value))}
                        disabled={employeesLoading}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={employeesLoading ? "Loading employees..." : "Select employee"} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.value} value={employee.value.toString()}>
                              {employee.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </Label>
                      <Select
                        value={formData.priority || 'medium'}
                        onValueChange={(value) => handleInputChange('priority', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label htmlFor="due_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Due Date
                      </Label>
                      <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal h-11 ${
                              !formData.due_date && 'text-muted-foreground'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.due_date ? formatDate(formData.due_date) : 'Select due date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.due_date ? new Date(formData.due_date) : undefined}
                            onSelect={handleDateSelect}
                            disabled={(date) => date < new Date('1900-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Enter notes for this assignment..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={assignTaskMutation.isPending}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={assignTaskMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                  >
                    {assignTaskMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Assign Task
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

