'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeftIcon, SaveIcon, CalendarIcon } from '@/components/ui/icons';
import { useBulkAssignTasks, useEmployeesLookup, useTasks } from '@/modules/tasks';
import { BulkAssignTasksRequest } from '@/modules/tasks/types';
import { toast } from 'sonner';

export default function BulkAssignTasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get task IDs from query parameters
  const taskIdsParam = searchParams.get('task_ids');
  const taskIds = taskIdsParam ? taskIdsParam.split(',').map(id => parseInt(id)).filter(id => !isNaN(id)) : [];

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Tasks', href: '/super-admin/services-management/tasks' },
    { label: 'Bulk Assign Tasks' }
  ];

  // Fetch tasks to show their names
  const { data: tasksResponse } = useTasks({ per_page: 1000 });
  const allTasks = tasksResponse?.data.tasks || [];
  const selectedTasks = allTasks.filter(task => taskIds.includes(task.id));

  const bulkAssignMutation = useBulkAssignTasks();

  // Fetch employees lookup
  const { data: employeesData, isLoading: employeesLoading } = useEmployeesLookup();
  const employees = employeesData || [];

  const [formData, setFormData] = useState<Omit<BulkAssignTasksRequest, 'task_ids'>>({
    assigned_employee_id: 0,
    due_date: null,
    priority: 'medium',
  });

  // Calendar state
  const [dueDateOpen, setDueDateOpen] = useState(false);

  // Redirect if no tasks selected
  useEffect(() => {
    if (taskIds.length === 0) {
      toast.error('No tasks selected');
      router.push('/super-admin/services-management/tasks');
    }
  }, [taskIds.length, router]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to format date to YYYY-MM-DD
  const formatDateToISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date string to Date object
  const parseDateString = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return undefined;
    return date;
  };

  // Helper function to format date for display
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '';
    const parsed = parseDateString(date);
    if (!parsed) return '';
    // Format as DD/MM/YYYY or MM/DD/YYYY based on locale
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateToISO(date);
      handleInputChange('due_date', formattedDate);
      setDueDateOpen(false);
    } else {
      handleInputChange('due_date', null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (taskIds.length === 0) {
      toast.error('No tasks selected');
      return;
    }

    if (!formData.assigned_employee_id || formData.assigned_employee_id === 0) {
      toast.error('Please select an employee to assign the tasks to');
      return;
    }

    try {
      const requestData: BulkAssignTasksRequest = {
        task_ids: taskIds,
        assigned_employee_id: formData.assigned_employee_id,
        due_date: formData.due_date || null,
        priority: formData.priority || 'medium',
      };

      await bulkAssignMutation.mutateAsync(requestData);
      toast.success(`Successfully assigned ${taskIds.length} task(s) to employee`);
      router.push('/super-admin/services-management/tasks');
    } catch (error) {
      console.error('Failed to bulk assign tasks:', error);
      toast.error('Failed to assign tasks. Please try again.');
    }
  };

  if (taskIds.length === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No tasks selected. Redirecting...</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bulk Assign Tasks</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Assign {taskIds.length} selected task(s) to an employee
                </p>
              </div>
              <Button
                onClick={() => router.push('/super-admin/services-management/tasks')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Tasks
              </Button>
            </div>

            {/* Selected Tasks List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Selected Tasks ({selectedTasks.length})
              </h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{task.name}</p>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {task.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assignment Details</h2>

              {/* Employee Selection */}
              <div className="space-y-2">
                <Label htmlFor="employee" className="text-base">
                  Employee <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.assigned_employee_id > 0 ? formData.assigned_employee_id.toString() : ''}
                  onValueChange={(value) => handleInputChange('assigned_employee_id', parseInt(value))}
                  disabled={employeesLoading}
                >
                  <SelectTrigger id="employee" className="h-11">
                    <SelectValue placeholder={employeesLoading ? 'Loading employees...' : 'Select an employee'} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.value} value={employee.value.toString()}>
                        {employee.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {employeesLoading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading employees...</p>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label className="text-base">Due Date (Optional)</Label>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? (
                        formatDate(formData.due_date)
                      ) : (
                        <span className="text-gray-500">Select due date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseDateString(formData.due_date)}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-base">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger id="priority" className="h-11">
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

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/super-admin/services-management/tasks')}
                  disabled={bulkAssignMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bulkAssignMutation.isPending || !formData.assigned_employee_id || formData.assigned_employee_id === 0}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <SaveIcon className="h-4 w-4" />
                  {bulkAssignMutation.isPending ? 'Assigning...' : `Assign ${taskIds.length} Task(s)`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

