'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format as formatDate, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';
import { useCalendarTasks, useUpdateTaskStatus, useStartTask, useCompleteTask, useHoldTask, useUpdateTask, EmployeeTask } from '@/modules/employee-tasks';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CalendarIcon, 
  ClockIcon, 
  FileTextIcon, 
  BriefcaseIcon, 
  BuildingIcon, 
  AlertTriangleIcon 
} from '@/components/ui/icons';
import { toast } from 'sonner';

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format: formatDate,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: EmployeeTask;
}

interface TasksCalendarProps {
  onUpdateTaskStatus?: (taskId: number, newStatus: string) => void;
}

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

export default function TasksCalendar({ onUpdateTaskStatus }: TasksCalendarProps) {
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({ actual_hours: '', feedback: '' });
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [holdFormData, setHoldFormData] = useState({ reason: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ notes: '', feedback: '', actual_hours: '' });
    const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Format date for API
  const formatDateForAPI = (date: Date) => {
    return formatDate(date, 'yyyy-MM-dd');
  };

  // Get calendar view type
  const getViewType = (view: View): 'month' | 'week' | 'day' => {
    if (view === 'week') return 'week';
    if (view === 'day' || view === 'agenda') return 'day';
    return 'month';
  };

  // Fetch calendar tasks
  const { data: calendarData, isLoading } = useCalendarTasks(
    getViewType(view),
    formatDateForAPI(date)
  );

  const tasks = calendarData?.data?.tasks || [];

  // Mutations
  const updateStatusMutation = useUpdateTaskStatus();
  const startTaskMutation = useStartTask();
  const completeTaskMutation = useCompleteTask();
  const holdTaskMutation = useHoldTask();
  const updateTaskMutation = useUpdateTask();

  // Convert tasks to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return tasks.map(task => {
      const dueDate = task.due_date ? new Date(task.due_date) : new Date();
      return {
        id: task.id,
        title: task.name,
        start: dueDate,
        end: dueDate,
        resource: task,
      };
    });
  }, [tasks]);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedTask(event.resource);
    setIsDialogOpen(true);
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(async (newStatus: string) => {
    if (!selectedTask) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        taskId: selectedTask.id,
        data: { 
          status: newStatus as any,
          progress_percentage: newStatus === 'completed' ? 100 : selectedTask.progress_percentage
        }
      });
      toast.success('Task status updated successfully!');
      setIsDialogOpen(false);
      setSelectedTask(null);
      
      if (onUpdateTaskStatus) {
        onUpdateTaskStatus(selectedTask.id, newStatus);
      }
    } catch (error) {
      toast.error('Failed to update task status');
    }
  }, [selectedTask, onUpdateTaskStatus, updateStatusMutation]);

  // Start Task handlers
  const handleStartTask = () => {
    setIsDialogOpen(false);
    setStartDialogOpen(true);
  };

  const confirmStartTask = async () => {
    if (!selectedTask) return;
    
    try {
      await startTaskMutation.mutateAsync(selectedTask.id);
      toast.success('Task started successfully!');
      setStartDialogOpen(false);
      setSelectedTask(null);
    } catch (error: any) {
      // Get the error message from API
      const apiMessage = error?.response?.data?.message || error?.message || '';
      
      // Provide a clear, user-friendly message
      let errorMessage = apiMessage;
      
      // Check if the error is about task already started or dependencies
      if (apiMessage.includes('لا يمكن بدء') || apiMessage.includes('المهام السابقة')) {
        errorMessage = `⚠️ ${apiMessage}\n\nThe task you selected has already been started, or there are incomplete previous tasks that need to be completed first.`;
      } else if (!apiMessage) {
        errorMessage = 'Failed to start task';
      }
      
      toast.error(errorMessage, {
        duration: 5000, // Show for 5 seconds
      });
    }
  };

  // Complete Task handlers
  const handleCompleteTask = () => {
    if (!selectedTask) return;
    setCompleteFormData({
      actual_hours: selectedTask.actual_hours || '',
      feedback: selectedTask.feedback || ''
    });
    setIsDialogOpen(false);
    setCompleteDialogOpen(true);
  };

  const confirmCompleteTask = async () => {
    if (!selectedTask) return;
    
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
        taskId: selectedTask.id,
        data: {
          actual_hours: parseFloat(completeFormData.actual_hours),
          feedback: completeFormData.feedback
        }
      });
      toast.success('Task completed successfully!');
      setCompleteDialogOpen(false);
      setSelectedTask(null);
      setCompleteFormData({ actual_hours: '', feedback: '' });
    } catch (error: any) {
      // Display specific error message from API or a generic one
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to complete task';
      toast.error(errorMessage);
    }
  };

  // Hold Task handlers
  const handleHoldTask = () => {
    if (!selectedTask) return;
    setHoldFormData({ reason: selectedTask.notes || '' });
    setIsDialogOpen(false);
    setHoldDialogOpen(true);
  };

  const confirmHoldTask = async () => {
    if (!selectedTask) return;
    
    // Validate required field
    if (!holdFormData.reason) {
      toast.error('Please provide a reason for putting the task on hold');
      return;
    }
    
    try {
      // Put task on hold with reason
      await holdTaskMutation.mutateAsync({
        taskId: selectedTask.id,
        data: {
          reason: holdFormData.reason
        }
      });
      toast.success('Task put on hold successfully!');
      setHoldDialogOpen(false);
      setSelectedTask(null);
      setHoldFormData({ reason: '' });
    } catch (error: any) {
      // Display specific error message from API or a generic one
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to hold task';
      toast.error(errorMessage);
    }
  };

  // Edit Task handlers
  const handleEditTask = () => {
    if (!selectedTask) return;
    setEditFormData({
      notes: selectedTask.notes || '',
      feedback: selectedTask.feedback || '',
      actual_hours: selectedTask.actual_hours || ''
    });
    setIsDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTask) return;

    try {
      await updateTaskMutation.mutateAsync({
        taskId: selectedTask.id,
        data: {
          notes: editFormData.notes,
          feedback: editFormData.feedback,
          actual_hours: editFormData.actual_hours ? parseFloat(editFormData.actual_hours) : undefined
        }
      });
      toast.success('Task updated successfully!');
      setEditDialogOpen(false);
      setSelectedTask(null);
    } catch (error: any) {
      // Display specific error message from API or a generic one
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to update task';
      toast.error(errorMessage);
    }
  };

  // Custom event styling based on status
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '#3174ad';
    let borderColor = '#265985';

    switch (task.status) {
      case 'pending':
        backgroundColor = '#6b7280';
        borderColor = '#4b5563';
        break;
      case 'in_progress':
        backgroundColor = '#3b82f6';
        borderColor = '#2563eb';
        break;
      case 'completed':
        backgroundColor = '#10b981';
        borderColor = '#059669';
        break;
      case 'on_hold':
        backgroundColor = '#f59e0b';
        borderColor = '#d97706';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        borderColor = '#dc2626';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        opacity: task.status === 'completed' ? 0.7 : 1,
        color: 'white',
        fontSize: '12px',
        padding: '2px 5px',
      }
    };
  }, []);

  // Custom messages
  const messages = {
    today: 'Today',
    previous: 'Previous',
    next: 'Next',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Time',
    event: 'Event',
    noEventsInRange: 'No tasks in this date range',
    showMore: (total: number) => `+${total} more`,
  };

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return formatDate(date, 'MMM dd, yyyy');
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center" style={{ height: '600px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          culture='en-US'
        />
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedTask?.name}</DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-6">
              {/* Description */}
              {selectedTask.description && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <FileTextIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">Description</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</h3>
                    <Badge className={statusColors[selectedTask.status]}>
                      {selectedTask.status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Priority</h3>
                    <Badge className={priorityColors[selectedTask.priority]}>
                      {selectedTask.priority}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Time Details */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-4">
                    <ClockIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Time & Dates</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Estimated Hours:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedTask.estimated_hours || 'N/A'} hrs</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedTask.progress_percentage}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDisplayDate(selectedTask.due_date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDisplayDate(selectedTask.completed_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contract & Service */}
              <div className="grid grid-cols-1 gap-4">
                {selectedTask.contract && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <FileTextIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">Contract</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{selectedTask.contract.contract_number}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{selectedTask.contract.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedTask.service && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">Service</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.service.name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedTask.client && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <BuildingIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">Client</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.client.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{selectedTask.client.company_name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Notes */}
              {selectedTask.notes && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangleIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">Notes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.notes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions Section */}
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleStartTask}
                      disabled={selectedTask.status === 'in_progress' || selectedTask.status === 'completed'}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Task
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCompleteTask}
                      disabled={selectedTask.status === 'completed'}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleHoldTask}
                      disabled={selectedTask.status === 'on_hold' || selectedTask.status === 'completed'}
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Hold
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditTask}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Update Status Section */}
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Update Status</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled'] as const).map((status) => (
                      <Button
                        key={status}
                        variant={selectedTask.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusUpdate(status)}
                        disabled={selectedTask.status === status || updateStatusMutation.isPending}
                        className="text-xs capitalize"
                      >
                        {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Task Confirmation Dialog */}
      <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start the task &quot;{selectedTask?.name}&quot;? This will mark the task as in progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(true)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartTask} className="bg-green-600 hover:bg-green-700">
              Start Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Task Dialog with Form */}
      <Dialog open={completeDialogOpen} onOpenChange={(open) => {
        setCompleteDialogOpen(open);
        if (!open) {
          setIsDialogOpen(true);
          setCompleteFormData({ actual_hours: '', feedback: '' });
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Task:</strong> {selectedTask?.name}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Please provide the following information before completing this task.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendar_complete_actual_hours">
                Actual Hours Worked <span className="text-red-500">*</span>
              </Label>
              <Input
                id="calendar_complete_actual_hours"
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
              <Label htmlFor="calendar_complete_feedback">
                Feedback <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="calendar_complete_feedback"
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
              setIsDialogOpen(true);
              setCompleteFormData({ actual_hours: '', feedback: '' });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmCompleteTask}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!completeFormData.actual_hours || !completeFormData.feedback}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold Task Dialog with Form */}
      <Dialog open={holdDialogOpen} onOpenChange={(open) => {
        setHoldDialogOpen(open);
        if (!open) {
          setIsDialogOpen(true);
          setHoldFormData({ reason: '' });
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Put Task on Hold</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Task:</strong> {selectedTask?.name}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                Please provide a reason for putting this task on hold.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendar_hold_reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="calendar_hold_reason"
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
              setIsDialogOpen(true);
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
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) setIsDialogOpen(true);
      }}>
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
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              setIsDialogOpen(true);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

