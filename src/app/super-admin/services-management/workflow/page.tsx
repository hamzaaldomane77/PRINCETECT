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
import { useServiceWorkflows, useDeleteServiceWorkflow, useToggleServiceWorkflowStatus } from '@/modules/service-workflows';
import { ServiceWorkflow } from '@/modules/service-workflows/types';
import { toast } from 'sonner';

export default function WorkflowPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<ServiceWorkflow | null>(null);
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Workflow Management' }
  ];

  // Fetch workflows using the hook
  const { 
    data: workflowsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useServiceWorkflows();

  const workflows = workflowsResponse?.data.workflows || [];

  // Mutations
  const deleteWorkflowMutation = useDeleteServiceWorkflow();
  const toggleStatusMutation = useToggleServiceWorkflowStatus();

  const handleCreateWorkflow = () => {
    router.push('/super-admin/services-management/workflow/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteWorkflow = (workflow: ServiceWorkflow) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!workflowToDelete) return;
    
    try {
      await deleteWorkflowMutation.mutateAsync(workflowToDelete.id);
      toast.success('Workflow deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast.error('Failed to delete workflow. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Workflow Name', type: 'text', align: 'right' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { key: 'service', label: 'Service', type: 'text', align: 'center' },
    { key: 'estimated_duration_days', label: 'Duration (Days)', type: 'text', align: 'center' },
    { key: 'tasks_count', label: 'Tasks Count', type: 'text', align: 'center' },
    { key: 'is_default', label: 'Default', type: 'icon', align: 'center' },
    { key: 'is_active', label: 'Active', type: 'icon', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'center' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Tasks',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (workflow: ServiceWorkflow) => {
        router.push(`/super-admin/services-management/workflow/${workflow.id}/tasks`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Workflow',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (workflow: ServiceWorkflow) => {
        router.push(`/super-admin/services-management/workflow/${workflow.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Workflow',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteWorkflow
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

  // Transform data for the table
  const tableData = workflows.map(workflow => ({
    ...workflow,
    service: workflow.service.name,
    is_default: workflow.is_default,
    is_active: workflow.is_active
  }));

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="text-lg text-gray-600 dark:text-gray-400">Loading workflows...</span>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Failed to Load Workflows
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {error?.message || 'An error occurred while loading workflows'}
                </p>
                <Button onClick={handleRetry} variant="outline">
                  <RefreshIcon className="h-4 w-4 mr-2" />
                  Retry ({retryCount})
                </Button>
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
          <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workflow Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage service workflows and processes</p>
                
                {/* Tasks Management Notice */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Task Management Available
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                        <p>
                          Task management is now available! Click &quot;View Tasks&quot; to see and manage tasks for each workflow. 
                          Tasks are loaded with workflow details and can be filtered and searched locally.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Create Workflow Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateWorkflow}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Workflow</span>
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {workflows.length > 0 ? (
                <DataTable
                  data={tableData}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search workflows..."
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
                    <div className="text-6xl mb-4">🔄</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Workflows Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No workflows are currently available. Create your first workflow to get started.
                    </p>
                    <Button
                      onClick={handleCreateWorkflow}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Workflow
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
              <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the workflow &quot;{workflowToDelete?.name}&quot;? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteWorkflowMutation.isPending}
              >
                {deleteWorkflowMutation.isPending ? 'Deleting...' : 'Delete Workflow'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}