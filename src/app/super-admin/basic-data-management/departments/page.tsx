'use client';

import { useState, useEffect } from 'react';
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
import { useDepartments, useDeleteDepartment, useToggleDepartmentStatus } from '@/modules/departments';
import { Department } from '@/modules/departments/types';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Basic Data Management', href: '/super-admin/basic-data-management' },
    { label: 'Departments' }
  ];

  // Fetch departments using the hook
  const { 
    data: departmentsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useDepartments();

  const departments = departmentsResponse?.data.departments || [];

  // Mutations
  const deleteDepartmentMutation = useDeleteDepartment();
  const toggleStatusMutation = useToggleDepartmentStatus();

  const handleCreateDepartment = () => {
    router.push('/super-admin/basic-data-management/departments/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    
    try {
      await deleteDepartmentMutation.mutateAsync(departmentToDelete.id);
      toast.success('Department deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.error('Failed to delete department. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px', align: 'right' },
    { key: 'name', label: 'Department Name', type: 'text', align: 'right' },
    { key: 'code', label: 'Code', type: 'text', align: 'center' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { key: 'manager', label: 'Manager', type: 'text', align: 'center' },
    { key: 'is_active', label: 'Active', type: 'icon', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'center' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'right' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Department',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (department: Department) => {
        router.push(`/super-admin/basic-data-management/departments/${department.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Department',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (department: Department) => {
        router.push(`/super-admin/basic-data-management/departments/${department.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Department',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteDepartment
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

  // Transform departments data for the table
  const transformedDepartments = departments.map(department => ({
    ...department,
    manager: department.manager?.name || 'No manager assigned',
    description: department.description || 'No description',
    created_at: new Date(department.created_at).toLocaleDateString('en-US'),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Departments
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
        
        {/* Specific error handling for common issues */}
        {error.message.includes('Authentication required') && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Authentication Issue:</strong> The API requires authentication. 
              This might be due to missing login routes in your Laravel backend.
            </p>
          </div>
        )}
        
        {error.message.includes('API endpoint not found') && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>API Endpoint Issue:</strong> The departments API endpoint is not accessible. 
              Please check your Laravel routes and ensure the API is properly configured.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
          
          <Button
            onClick={() => window.open('http://princetect.peaklink.pro/api/v1/admin/departments', '_blank')}
            variant="outline"
          >
            Test API Directly
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading departments...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Departments Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage organizational departments and structure</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Departments Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage organizational departments and structure</p>
              </div>
              
              {/* Create Department Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateDepartment}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Department</span>
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {departments.length > 0 ? (
                <DataTable
                  data={transformedDepartments}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search departments..."
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
                    <div className="text-6xl mb-4">🏢</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Departments Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No departments are currently available. Create your first department to get started.
                    </p>
                    <Button
                      onClick={handleCreateDepartment}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Department
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
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the department &quot;{departmentToDelete?.name}&quot;? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteDepartmentMutation.isPending}
              >
                {deleteDepartmentMutation.isPending ? 'Deleting...' : 'Delete Department'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
} 