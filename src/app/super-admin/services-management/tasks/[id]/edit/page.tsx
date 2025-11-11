'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeftIcon, SaveIcon, CalendarIcon } from '@/components/ui/icons';
import { useTask, useUpdateTask, useEmployeesLookup } from '@/modules/tasks';
import { UpdateTaskRequest } from '@/modules/tasks/types';
import { toast } from 'sonner';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = parseInt(params.id as string);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Tasks', href: '/super-admin/services-management/tasks' },
    { label: 'Edit Task' }
  ];

  // Fetch task details
  const { data: task, isLoading, error } = useTask(taskId);
  const updateTaskMutation = useUpdateTask();

  // Fetch employees lookup
  const { data: employeesData, isLoading: employeesLoading } = useEmployeesLookup();
  const employees = employeesData || [];

  const [formData, setFormData] = useState({
    assigned_employee_id: 0,
    status: 'pending',
    priority: 'medium',
    due_date: null as string | null,
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
        : (task.assigned_employee as number) || 0;

      const newFormData = {
        assigned_employee_id: assignedEmployeeId,
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date || null,
        notes: task.notes || '',
      };

      console.log('Loading task data:', task);
      console.log('Setting form data:', newFormData);
      
      setFormData(newFormData);
    }
  }, [task]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
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

  // Helper function to parse date string to Date object
  const parseDateString = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return undefined;
    return date;
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
    
    try {
      // Prepare data for submission according to the API format
      const submitData: UpdateTaskRequest = {
        assigned_employee: formData.assigned_employee_id > 0 ? formData.assigned_employee_id : null,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        notes: formData.notes || null,
      };

      await updateTaskMutation.mutateAsync({ id: taskId, data: submitData });
      toast.success('Task updated successfully!');
      router.push(`/super-admin/services-management/tasks/${taskId}`);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      toast.error(error?.response?.data?.message || 'Failed to update task. Please try again.');
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Task</h1>
                <p className="text-gray-600 dark:text-gray-400">Update task information</p>
              </div>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Task
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Update Task</h2>
                  
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Assigned Employee */}
                  <div className="space-y-2">
                    <Label htmlFor="assigned_employee_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Assigned Employee
                    </Label>
                    <Select
                      value={formData.assigned_employee_id > 0 ? formData.assigned_employee_id.toString() : '0'}
                      onValueChange={(value) => handleInputChange('assigned_employee_id', parseInt(value) || 0)}
                      disabled={employeesLoading}
                    >
                      <SelectTrigger id="assigned_employee_id" className="h-11">
                        <SelectValue placeholder={employeesLoading ? "Loading employees..." : "Select employee"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Not Assigned</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee.value} value={employee.value.toString()}>
                            {employee.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger id="status" className="h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </Label>
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

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor="due_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Due Date
                    </Label>
                    <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
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
                          selected={parseDateString(formData.due_date)}
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
                    Notes (ملاحظات)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter notes..."
                    rows={4}
                    className="resize-none"
                  />
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

