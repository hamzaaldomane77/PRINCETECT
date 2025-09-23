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
import { useJobTitles, useDeleteJobTitle } from '@/modules/job-titles';
import { JobTitle } from '@/modules/job-titles/types';
import { toast } from 'sonner';

export default function JobTitlesPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobTitleToDelete, setJobTitleToDelete] = useState<JobTitle | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Job Titles' }
  ];

  // Fetch job titles using the hook
  const { 
    data: jobTitlesResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useJobTitles();

  const jobTitles = jobTitlesResponse?.data.job_titles || [];

  // Mutations
  const deleteJobTitleMutation = useDeleteJobTitle();

  const handleCreateJobTitle = () => {
    router.push('/super-admin/employee-management/job-titles/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteJobTitle = (jobTitle: JobTitle) => {
    setJobTitleToDelete(jobTitle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobTitleToDelete) return;
    
    try {
      await deleteJobTitleMutation.mutateAsync(jobTitleToDelete.id);
      toast.success('Job title deleted successfully!');
      refetch();
    } catch (error) {
      // Handle specific error cases
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg === 'ASSIGNED_TO_EMPLOYEES' || 
          errorMsg.includes('assigned to employees') ||
          errorMsg.includes('Cannot delete')) {
        setErrorMessage('Cannot delete this job title because it is currently assigned to employees.');
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this job title.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Job title not found. It may have been already deleted.');
        refetch(); // Refresh the list since it might be outdated
      } else {
        toast.error('Failed to delete job title. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setJobTitleToDelete(null);
    }
  };

  // Function to get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'junior':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'senior':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'manager':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'director':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Job Title Name', type: 'text', align: 'right' },
    { key: 'code', label: 'Code', type: 'text', align: 'center' },
    { key: 'department', label: 'Department', type: 'text', align: 'center' },
    { key: 'level', label: 'Level', type: 'text', align: 'center' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { key: 'is_active', label: 'Active', type: 'icon', align: 'center' },
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
      onClick: (jobTitle: JobTitle) => {
        router.push(`/super-admin/employee-management/job-titles/${jobTitle.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Job Title',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (jobTitle: JobTitle) => {
        router.push(`/super-admin/employee-management/job-titles/${jobTitle.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Job Title',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteJobTitle
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

  // Transform job titles data for the table
  const transformedJobTitles = jobTitles.map(jobTitle => ({
    ...jobTitle,
    department: jobTitle.department?.name || 'N/A',
    level: (
      <Badge className={getLevelBadgeColor(jobTitle.level)}>
        {jobTitle.level === 'junior' ? 'Junior' :
         jobTitle.level === 'senior' ? 'Senior' :
         jobTitle.level === 'manager' ? 'Manager' :
         jobTitle.level === 'director' ? 'Director' :
         jobTitle.level}
      </Badge>
    ),
    description: jobTitle.description.length > 50 ? 
      `${jobTitle.description.substring(0, 50)}...` : jobTitle.description,
    created_at: formatDate(jobTitle.created_at),
    updated_at: formatDate(jobTitle.updated_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Job Titles
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading job titles...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Titles Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage job titles and positions in the company</p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Titles Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage job titles and positions in the company</p>
            </div>
            
            {/* Create Job Title Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCreateJobTitle}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add New Job Title</span>
              </Button>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {jobTitles.length > 0 ? (
                <DataTable
                  data={transformedJobTitles}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search job titles..."
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
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Job Titles Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No job titles are currently available. Create your first job title to get started.
                    </p>
                    <Button
                      onClick={handleCreateJobTitle}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Job Title
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
                Are you sure you want to delete the job title &quot;{jobTitleToDelete?.name}&quot;? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteJobTitleMutation.isPending}
              >
                {deleteJobTitleMutation.isPending ? 'Deleting...' : 'Delete Job Title'}
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