'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, RefreshIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon, XIcon } from '@/components/ui/icons';
import { useEmployeeContract, useContractTasks } from '@/modules/employee-contracts';
import { ContractTasksFilters } from '@/modules/employee-contracts/types';
import { useLeadEmployees } from '@/modules/employee-leads';
import { format } from 'date-fns';

interface ContractTasksPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ContractTasksPage({ params }: ContractTasksPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contractId = parseInt(resolvedParams.id);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<ContractTasksFilters>({
    q: '',
    status: '',
    priority: '',
    assigned_employee_id: undefined,
    per_page: 15,
    page: 1
  });

  // Fetch lookup data for filters
  const { data: employeesData } = useLeadEmployees();

  const { data: contractResponse, isLoading: isLoadingContract } = useEmployeeContract(contractId);
  const { data: tasksResponse, isLoading: isLoadingTasks, refetch } = useContractTasks(contractId, filters);

  const contract = contractResponse?.data;
  const tasks = tasksResponse?.data?.tasks || [];
  const meta = tasksResponse?.meta || null;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, page: 1 };
      
      if (key === 'assigned_employee_id') {
        newFilters.assigned_employee_id = value ? parseInt(value) : undefined;
      } else if (key === 'per_page') {
        newFilters.per_page = value ? parseInt(value) : 15;
      } else if (key === 'page') {
        newFilters.page = value ? parseInt(value) : 1;
      } else {
        (newFilters as any)[key] = value || undefined;
      }
      
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    setFilters({
      q: '',
      status: '',
      priority: '',
      assigned_employee_id: undefined,
      per_page: 15,
      page: 1
    });
  };

  const hasActiveFilters = () => {
    return !!(filters.q || filters.status || filters.priority || filters.assigned_employee_id);
  };

  if (isNaN(contractId) || contractId <= 0) {
    return (
      <div className="h-full">
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Invalid Contract ID
            </h3>
            <Button onClick={() => router.push('/employee/my-contracts')}>
              Back to Contracts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingContract || isLoadingTasks) {
    return (
      <div className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading tasks...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { 
      key: 'name', 
      label: 'Task Name', 
      type: 'text', 
      align: 'right' 
    },
    { 
      key: 'service_name', 
      label: 'Service', 
      type: 'text', 
      align: 'right' 
    },
    { 
      key: 'task_type', 
      label: 'Type', 
      type: 'text', 
      align: 'center' 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge', 
      align: 'center',
      badgeColors: statusColors
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'badge', 
      align: 'center',
      badgeColors: priorityColors
    },
    { 
      key: 'assigned_employee', 
      label: 'Assigned To', 
      type: 'text', 
      align: 'center' 
    },
    { 
      key: 'estimated_hours', 
      label: 'Est. Hours', 
      type: 'text', 
      align: 'center' 
    },
    { 
      key: 'due_date', 
      label: 'Due Date', 
      type: 'date', 
      align: 'center' 
    },
  ];

  // Transform tasks data for the table
  const transformedTasks = tasks.map(task => ({
    id: task.id,
    name: task.name,
    service_name: task.contract_service_workflow?.contract_service?.service?.name || '-',
    task_type: task.task_type || '-',
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    assigned_employee: task.assigned_employee?.name || '-',
    estimated_hours: task.estimated_hours || '-',
    due_date: task.due_date,
  }));

  return (
    <div className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button onClick={() => router.push(`/employee/my-contracts/${contractId}`)} variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Contract
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contract Tasks</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {contract?.title} • {contract?.contract_number}
              </p>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                {hasActiveFilters() && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters() && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
                <Button
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  {isFiltersOpen ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Show Filters
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {isFiltersOpen && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Search..."
                      value={filters.q || ''}
                      onChange={(e) => handleFilterChange('q', e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Filter by Status</Label>
                    <Select 
                      value={filters.status || undefined} 
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Filter by Priority</Label>
                    <Select 
                      value={filters.priority || undefined} 
                      onValueChange={(value) => handleFilterChange('priority', value)}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assigned Employee */}
                  <div className="space-y-2">
                    <Label htmlFor="assigned_employee_id">Filter by Employee</Label>
                    <Select 
                      value={filters.assigned_employee_id ? String(filters.assigned_employee_id) : undefined}
                      onValueChange={(value) => handleFilterChange('assigned_employee_id', value)}
                    >
                      <SelectTrigger id="assigned_employee_id">
                        <SelectValue placeholder="All Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeesData?.data?.map((employee) => (
                          <SelectItem key={employee.id} value={String(employee.id)}>
                            {employee.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks ({meta?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <DataTable
                data={transformedTasks}
                columns={columns}
                searchable={false}
                filterable={false}
                selectable={false}
                pagination={true}
                defaultItemsPerPage={filters.per_page}
                serverSide={true}
                currentPage={meta?.current_page || 1}
                totalPages={meta?.last_page || 1}
                totalItems={meta?.total || 0}
                itemsPerPage={meta?.per_page || filters.per_page}
                onPageChange={(newPage) => handleFilterChange('page', String(newPage))}
                onItemsPerPageChange={(newPerPage) => {
                  handleFilterChange('per_page', String(newPerPage));
                }}
                className="flex-1 flex flex-col min-h-0"
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No Tasks Found
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  This contract doesn't have any tasks assigned yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks Details */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{task.name}</span>
                    <div className="flex gap-2">
                      <Badge className={statusColors[task.status as keyof typeof statusColors] || statusColors.pending}>
                        {task.status}
                      </Badge>
                      <Badge className={priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}>
                        {task.priority}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Service</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {task.contract_service_workflow?.contract_service?.service?.name || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Task Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{task.task_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {task.assigned_employee?.name || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Hours</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {task.estimated_hours || '-'}
                      </p>
                    </div>
                    {task.due_date && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {format(new Date(task.due_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    {task.actual_hours && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Actual Hours</p>
                        <p className="font-medium text-gray-900 dark:text-white">{task.actual_hours}</p>
                      </div>
                    )}
                  </div>
                  {task.description && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-900 dark:text-white">{task.description}</p>
                    </div>
                  )}
                  {task.notes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-gray-900 dark:text-white">{task.notes}</p>
                    </div>
                  )}
                  {task.feedback && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Feedback</p>
                      <p className="text-gray-900 dark:text-white">{task.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

