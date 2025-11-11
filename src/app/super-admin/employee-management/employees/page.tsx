'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon } from '@/components/ui/icons';
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
import { useEmployees, useDeleteEmployee } from '@/modules/employees';
import { Employee } from '@/modules/employees/types';
import { getEmployeePhotoUrl } from '@/lib/image-utils';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Employees' }
  ];

  // Fetch employees using the hook
  const { 
    data: employeesResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployees();

  const employees = employeesResponse?.data.employees || [];

  // Mutations
  const deleteEmployeeMutation = useDeleteEmployee();

  const handleCreateEmployee = () => {
    router.push('/super-admin/employee-management/employees/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    
    try {
      await deleteEmployeeMutation.mutateAsync(employeeToDelete.id);
      toast.success('Employee deleted successfully!');
      refetch();
    } catch (error) {
      // Handle specific error cases
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg === 'EMPLOYEE_HAS_RECORDS' || 
          errorMsg.includes('existing records') ||
          errorMsg.includes('Cannot delete')) {
        setErrorMessage('Cannot delete this employee because they have existing records in the system.');
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this employee.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Employee not found. They may have been already deleted.');
        refetch(); // Refresh the list since it might be outdated
      } else {
        toast.error('Failed to delete employee. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // Badge colors
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const genderColors = {
    male: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    female: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'avatar', label: 'Photo', type: 'custom', width: '80px', align: 'center', render: (employee: any) => <EmployeeAvatar employee={employee} /> },
    { key: 'employee_id', label: 'Employee ID', type: 'text', align: 'center' },
    { key: 'name', label: 'Full Name', type: 'text', align: 'right' },
    { key: 'job_title', label: 'Job Title', type: 'text', align: 'center' },
    { key: 'department', label: 'Department', type: 'text', align: 'center' },
    { key: 'work_email', label: 'Work Email', type: 'text', align: 'center' },
    { key: 'work_mobile', label: 'Mobile', type: 'text', align: 'center' },
    { key: 'gender', label: 'Gender', type: 'badge', align: 'center', badgeColors: genderColors },
    { key: 'status', label: 'Status', type: 'badge', align: 'center', badgeColors: statusColors },
    { key: 'hire_date', label: 'Hire Date', type: 'date', align: 'right' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Details',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (employee: Employee) => {
        router.push(`/super-admin/employee-management/employees/${employee.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Employee',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (employee: Employee) => {
        router.push(`/super-admin/employee-management/employees/${employee.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Employee',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteEmployee
    }
  ];

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  const handleFilter = () => {
    console.log('Filter clicked');
    // TODO: Implement filter functionality
  };

  // Component for employee avatar
  const EmployeeAvatar = ({ employee }: { employee: Employee }) => {
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    if (employee.photo) {
      const imageUrl = getEmployeePhotoUrl(employee.photo);
      
      return (
        <div className="flex items-center justify-center">
          <img
            src={imageUrl || ''}
            alt={employee.name}
            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextSibling as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
          <div 
            className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center text-white text-sm font-medium hidden"
          >
            {getInitials(employee.name)}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {getInitials(employee.name)}
        </div>
      </div>
    );
  };

  // Transform employees data for the table
  const transformedEmployees = employees.map(employee => ({
    id: employee.id,
    avatar: employee, // Pass the whole employee for the custom render
    employee_id: employee.employee_id,
    name: employee.name,
    job_title: employee.job_title?.name || 'N/A',
    department: employee.department?.name || 'N/A',
    work_email: employee.work_email || 'N/A',
    work_mobile: employee.work_mobile || 'N/A',
    gender: employee.gender, // Return simple string value
    status: employee.status, // Return simple string value
    hire_date: employee.hire_date, // Let DataTable handle date formatting
    created_at: employee.created_at, // Let DataTable handle date formatting
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Employees
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading employees...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError && error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              {/* Breadcrumb */}
              <Breadcrumb items={breadcrumbItems} />

              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employees Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage employee information and profiles</p>
              </div>

              {/* Error Display */}
              <ErrorDisplay error={error} onRetry={handleRetry} />
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
          <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employees Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage employee information and profiles</p>
              </div>
              
              {/* Create Employee Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateEmployee}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add New Employee</span>
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {employees.length > 0 ? (
                <DataTable
                  data={transformedEmployees}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search employees..."
                  filterable={false}
                  selectable={true}
                  pagination={true}
                  defaultItemsPerPage={10}
                  onSelectionChange={handleSelectionChange}
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  className="flex-1 flex flex-col min-h-0"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Employees Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No employees are currently available. Create your first employee to get started.
                    </p>
                    <Button
                      onClick={handleCreateEmployee}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Employee
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the employee &quot;{employeeToDelete?.name}&quot;? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteEmployeeMutation.isPending}
              >
                {deleteEmployeeMutation.isPending ? 'Deleting...' : 'Delete Employee'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Cannot Delete
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AdminLayout>
    </SuperAdminOnly>
  );
}