'use client';

import { useState, useMemo } from 'react';
import { useEmployeeAuth } from '@/contexts/employee-auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  HomeIcon, 
  PdaDocumentsIcon, 
  MeetingsIcon, 
  CustomersIcon 
} from '@/components/ui/icons';
import TasksCalendar from '@/components/employee/tasks-calendar';
import { generateDemoTasks } from '@/lib/demo-tasks';
import { EmployeeTask, TaskStatus, taskStatusLabels } from '@/types/employee-tasks';
import toast, { Toaster } from 'react-hot-toast';

export default function EmployeeDashboard() {
  const { user } = useEmployeeAuth();
  const [tasks, setTasks] = useState<EmployeeTask[]>(generateDemoTasks());

  // Calculate stats from tasks
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO).length;

    return [
      {
        title: 'إجمالي المهام',
        value: totalTasks.toString(),
        icon: PdaDocumentsIcon,
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        change: `${completedTasks} مكتملة`,
      },
      {
        title: 'قيد التنفيذ',
        value: inProgressTasks.toString(),
        icon: MeetingsIcon,
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        change: 'جاري العمل عليها',
      },
      {
        title: 'في الانتظار',
        value: todoTasks.toString(),
        icon: CustomersIcon,
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        change: 'يجب البدء بها',
      },
    ];
  }, [tasks]);

  // Handle task status update
  const handleUpdateTaskStatus = (taskId: number, newStatus: TaskStatus) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updated_at: new Date() }
          : task
      )
    );
    toast.success(`تم تحديث حالة المهمة إلى: ${taskStatusLabels[newStatus]}`);
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <HomeIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مرحباً بك، {user?.name || 'موظف'}!</h1>
            <p className="text-blue-100 mt-1">نظام إدارة الموظفين</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tasks Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">تقويم المهام</h2>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>قيد الانتظار</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>قيد التنفيذ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>مكتملة</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>معلقة</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>ملغية</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TasksCalendar 
            tasks={tasks} 
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </CardContent>
      </Card>

      {/* Info Message */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <HomeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                💡 نصيحة: كيفية استخدام التقويم
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                • انقر على أي مهمة في التقويم لعرض التفاصيل
                <br />
                • يمكنك تحديث حالة المهمة مباشرة من نافذة التفاصيل
                <br />
                • الألوان تمثل حالة المهمة: رمادي (انتظار)، أزرق (تنفيذ)، أخضر (مكتملة)، أصفر (معلقة)، أحمر (ملغية)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}

