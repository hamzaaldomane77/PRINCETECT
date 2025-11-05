export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface EmployeeTask {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: Date;
  end_date: Date;
  assigned_by?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface TaskEvent extends EmployeeTask {
  // For react-big-calendar
  start: Date;
  end: Date;
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'قيد الانتظار',
  [TaskStatus.IN_PROGRESS]: 'قيد التنفيذ',
  [TaskStatus.COMPLETED]: 'مكتملة',
  [TaskStatus.ON_HOLD]: 'معلقة',
  [TaskStatus.CANCELLED]: 'ملغية'
};

export const taskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-700 border-gray-300',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-300',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-300',
  [TaskStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  [TaskStatus.CANCELLED]: 'bg-red-100 text-red-700 border-red-300'
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'منخفضة',
  [TaskPriority.MEDIUM]: 'متوسطة',
  [TaskPriority.HIGH]: 'عالية',
  [TaskPriority.URGENT]: 'عاجلة'
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-600',
  [TaskPriority.MEDIUM]: 'bg-blue-100 text-blue-600',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-600',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-600'
};

