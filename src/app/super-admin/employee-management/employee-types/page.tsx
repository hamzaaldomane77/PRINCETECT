'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useEmployeeTypes, useDeleteEmployeeType } from '@/modules/employee-types';
import { EmployeeType } from '@/modules/employee-types/types';
import { toast } from 'sonner';

export default function EmployeeTypesPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeTypeToDelete, setEmployeeTypeToDelete] = useState<EmployeeType | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Employee Types' }
  ];

  // Fetch employee types using the hook
  const { 
    data: employeeTypesResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useEmployeeTypes();

  const employeeTypes = employeeTypesResponse?.data.employee_types || [];

  // Mutations
  const deleteEmployeeTypeMutation = useDeleteEmployeeType();

  const handleCreateEmployeeType = () => {
    router.push('/super-admin/employee-management/employee-types/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteEmployeeType = (employeeType: EmployeeType) => {
    setEmployeeTypeToDelete(employeeType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeTypeToDelete) return;
    
    try {
      await deleteEmployeeTypeMutation.mutateAsync(employeeTypeToDelete.id);
      toast.success('Employee type deleted successfully!');
      refetch();
    } catch (error) {
      // Handle specific error cases
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg === 'ASSIGNED_TO_EMPLOYEES' || 
          errorMsg.includes('assigned to employees') ||
          errorMsg.includes('Cannot delete')) {
        setErrorMessage('Cannot delete this employee type because it is currently assigned to employees.');
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this employee type.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Employee type not found. It may have been already deleted.');
        refetch(); // Refresh the list since it might be outdated
      } else {
        toast.error('Failed to delete employee type. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeTypeToDelete(null);
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Employee Type Name', type: 'text', align: 'right' },
    { key: 'code', label: 'Code', type: 'text', align: 'center' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { key: 'is_active', label: 'Active', type: 'icon', align: 'center' },
    { key: 'notes', label: 'Notes', type: 'text', align: 'right' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'updated_at', label: 'Updated At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Details',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (employeeType: EmployeeType) => {
        router.push(`/super-admin/employee-management/employee-types/${employeeType.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Employee Type',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (employeeType: EmployeeType) => {
        router.push(`/super-admin/employee-management/employee-types/${employeeType.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Employee Type',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteEmployeeType
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

  // Function to format date with day, month, year
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Transform employee types data for the table
  const transformedEmployeeTypes = employeeTypes.map(employeeType => ({
    ...employeeType,
    description: employeeType.description && employeeType.description.length > 50 ? 
      `${employeeType.description.substring(0, 50)}...` : employeeType.description || 'N/A',
    notes: employeeType.notes && employeeType.notes.length > 30 ? 
      `${employeeType.notes.substring(0, 30)}...` : employeeType.notes || 'N/A',
    created_at: formatDate(employeeType.created_at),
    updated_at: formatDate(employeeType.updated_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Employee Types
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading employee types...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Types Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage employee types and categories</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Employee Types Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage employee types and categories</p>
            </div>
            
            {/* Create Employee Type Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCreateEmployeeType}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add New Employee Type</span>
              </Button>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {employeeTypes.length > 0 ? (
                <DataTable
                  data={transformedEmployeeTypes}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search employee types..."
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
                    <div className="text-6xl mb-4">🏷️</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Employee Types Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No employee types are currently available. Create your first employee type to get started.
                    </p>
                    <Button
                      onClick={handleCreateEmployeeType}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Employee Type
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
                Are you sure you want to delete the employee type &quot;{employeeTypeToDelete?.name}&quot;? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteEmployeeTypeMutation.isPending}
              >
                {deleteEmployeeTypeMutation.isPending ? 'Deleting...' : 'Delete Employee Type'}
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