'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon, ArrowLeftIcon } from '@/components/ui/icons';
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
import { useGoals, useDeleteGoal } from '@/modules/pda-documents/hooks/use-goals';
import { Goal } from '@/modules/pda-documents/types/goals';
import { toast } from 'sonner';

export default function GoalsPage() {
  const params = useParams();
  const router = useRouter();
  const pdaDocumentId = parseInt(params.id as string);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: 'Document Details', href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Goals' }
  ];

  // Fetch goals
  const {
    data: goalsResponse,
    isLoading,
    error,
    refetch,
    isError
  } = useGoals(pdaDocumentId);

  const goals = goalsResponse?.data.goals || [];

  // Delete mutation
  const deleteGoalMutation = useDeleteGoal(pdaDocumentId);

  const handleCreateGoal = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/goals/create`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;

    try {
      await deleteGoalMutation.mutateAsync(goalToDelete.id);
      refetch();
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';
      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this goal.');
      } else {
        toast.error('Failed to delete goal. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    }
  };

  const handleViewGoal = (goal: Goal) => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/goals/${goal.id}`);
  };

  const handleEditGoal = (goal: Goal) => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/goals/${goal.id}/edit`);
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'goal_title', label: 'Goal Title', type: 'text', align: 'right' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { key: 'created_at', label: 'Created At', type: 'text', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'right', width: '150px' }
  ];

  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Details',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: handleViewGoal
    },
    {
      icon: EditIcon,
      label: 'Edit Goal',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: handleEditGoal
    },
    {
      icon: TrashIcon,
      label: 'Delete Goal',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteGoal
    }
  ];

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  const handleFilter = () => {
    console.log('Filter clicked');
  };

  // Function to format date
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

  // Transform goals data for the table
  const transformedGoals = goals.map(goal => ({
    ...goal,
    description: goal.description || 'N/A',
    created_at: formatDate(goal.created_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Goals
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading goals...</div>
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
              <Breadcrumb items={breadcrumbItems} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage document goals</p>
              </div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage document goals</p>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 ml-6 flex gap-3">
                <Button
                  onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}`)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={handleCreateGoal}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Goal</span>
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {goals.length > 0 ? (
                <DataTable
                  data={transformedGoals}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search goals..."
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
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Goals Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No goals are currently available. Create your first goal to get started.
                    </p>
                    <Button
                      onClick={handleCreateGoal}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Goal
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
                Are you sure you want to delete the goal &quot;{goalToDelete?.goal_title}&quot;?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteGoalMutation.isPending}
              >
                {deleteGoalMutation.isPending ? 'Deleting...' : 'Delete Goal'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

