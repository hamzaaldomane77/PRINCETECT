'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';
import {
  EmployeeTask,
  TaskEvent,
  TaskStatus,
  taskStatusLabels,
  taskStatusColors,
  taskPriorityLabels,
  taskPriorityColors
} from '@/types/employee-tasks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Setup the localizer for react-big-calendar
const locales = {
  'ar': ar,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ar }),
  getDay,
  locales,
});

interface TasksCalendarProps {
  tasks: EmployeeTask[];
  onUpdateTaskStatus?: (taskId: number, newStatus: TaskStatus) => void;
}

export default function TasksCalendar({ tasks, onUpdateTaskStatus }: TasksCalendarProps) {
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Convert tasks to calendar events
  const events: TaskEvent[] = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      start: task.start_date,
      end: task.end_date,
    }));
  }, [tasks]);

  // Handle event selection
  const handleSelectEvent = useCallback((event: any) => {
    setSelectedTask(event as TaskEvent);
    setIsDialogOpen(true);
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback((newStatus: TaskStatus) => {
    if (selectedTask && onUpdateTaskStatus) {
      onUpdateTaskStatus(selectedTask.id, newStatus);
      setIsDialogOpen(false);
      setSelectedTask(null);
    }
  }, [selectedTask, onUpdateTaskStatus]);

  // Custom event styling based on status
  const eventStyleGetter = useCallback((event: any) => {
    const taskEvent = event as TaskEvent;
    let backgroundColor = '#3174ad';
    let borderColor = '#265985';

    switch (taskEvent.status) {
      case TaskStatus.TODO:
        backgroundColor = '#6b7280';
        borderColor = '#4b5563';
        break;
      case TaskStatus.IN_PROGRESS:
        backgroundColor = '#3b82f6';
        borderColor = '#2563eb';
        break;
      case TaskStatus.COMPLETED:
        backgroundColor = '#10b981';
        borderColor = '#059669';
        break;
      case TaskStatus.ON_HOLD:
        backgroundColor = '#f59e0b';
        borderColor = '#d97706';
        break;
      case TaskStatus.CANCELLED:
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
        opacity: taskEvent.status === TaskStatus.COMPLETED ? 0.7 : 1,
        color: 'white',
        fontSize: '12px',
        padding: '2px 5px',
      }
    };
  }, []);

  // Custom messages in Arabic
  const messages = {
    today: 'اليوم',
    previous: 'السابق',
    next: 'التالي',
    month: 'شهر',
    week: 'أسبوع',
    day: 'يوم',
    agenda: 'جدول الأعمال',
    date: 'التاريخ',
    time: 'الوقت',
    event: 'حدث',
    noEventsInRange: 'لا توجد مهام في هذا النطاق الزمني',
    showMore: (total: number) => `+${total} المزيد`,
  };

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
          rtl={true}
          culture='ar'
        />
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedTask?.title}</DialogTitle>
            <DialogDescription className="text-right">
              {selectedTask?.description || 'لا يوجد وصف متاح'}
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-4">
              {/* Current Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الحالة الحالية:</span>
                <Badge className={taskStatusColors[selectedTask.status]}>
                  {taskStatusLabels[selectedTask.status]}
                </Badge>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">الأولوية:</span>
                <Badge className={taskPriorityColors[selectedTask.priority]}>
                  {taskPriorityLabels[selectedTask.priority]}
                </Badge>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    تاريخ البدء:
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(selectedTask.start_date, 'dd/MM/yyyy', { locale: ar })}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    تاريخ الانتهاء:
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(selectedTask.end_date, 'dd/MM/yyyy', { locale: ar })}
                  </p>
                </div>
              </div>

              {/* Assigned By */}
              {selectedTask.assigned_by && (
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    تم التعيين بواسطة:
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTask.assigned_by}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedTask.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    ملاحظات:
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTask.notes}
                  </p>
                </div>
              )}

              {/* Update Status Section */}
              <div className="border-t pt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                  تحديث الحالة:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(TaskStatus).map((status) => (
                    <Button
                      key={status}
                      variant={selectedTask.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusUpdate(status)}
                      disabled={selectedTask.status === status}
                      className="text-xs"
                    >
                      {taskStatusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

