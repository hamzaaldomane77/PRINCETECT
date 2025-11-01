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
import { useSmartGoals, useDeleteSmartGoal, SmartGoal } from '@/modules/pda-documents/hooks/use-smart-goals';
import { toast } from 'sonner';

export default function PdaDocumentSmartGoalsPage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [smartGoalToDelete, setSmartGoalToDelete] = useState<SmartGoal | null>(null);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Smart Goals' }
  ];

  const {
    data: smartGoalsResponse,
    isLoading,
    error,
    refetch,
    isError
  } = useSmartGoals(pdaDocumentId);

  const smartGoals = smartGoalsResponse?.data.smart_goals || [];
  const deleteSmartGoalMutation = useDeleteSmartGoal(pdaDocumentId);

  const handleCreateSmartGoal = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/smart-goals/create`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteSmartGoal = (smartGoal: SmartGoal) => {
    setSmartGoalToDelete(smartGoal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!smartGoalToDelete) return;

    try {
      await deleteSmartGoalMutation.mutateAsync(smartGoalToDelete.id);
      refetch();
    } catch (error) {
      const errorMsg = (error as Error)?.message || 'Failed to delete smart goal.';
      toast.error(errorMsg);
    } finally {
      setDeleteDialogOpen(false);
      setSmartGoalToDelete(null);
    }
  };

  const handleViewSmartGoal = (smartGoal: SmartGoal) => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/smart-goals/${smartGoal.id}`);
  };

  const handleEditSmartGoal = (smartGoal: SmartGoal) => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/smart-goals/${smartGoal.id}/edit`);
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'goal_title', label: 'Goal Title', type: 'text', align: 'right' },
    { key: 'specific', label: 'Specific', type: 'text', align: 'right' },
    { key: 'measurable', label: 'Measurable', type: 'text', align: 'right' },
    { key: 'achievable', label: 'Achievable', type: 'text', align: 'right' },
    { key: 'relevant', label: 'Relevant', type: 'text', align: 'right' },
    { key: 'time_bound', label: 'Time Bound', type: 'text', align: 'right' },
    { key: 'created_at', label: 'Created At', type: 'text', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'right', width: '150px' }
  ];

  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Details',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: handleViewSmartGoal
    },
    {
      icon: EditIcon,
      label: 'Edit Smart Goal',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: handleEditSmartGoal
    },
    {
      icon: TrashIcon,
      label: 'Delete Smart Goal',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteSmartGoal
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Transform smart goals data for the table
  const transformedSmartGoals = smartGoals.map(smartGoal => ({
    ...smartGoal,
    specific: smartGoal.specific || 'N/A',
    measurable: smartGoal.measurable || 'N/A',
    achievable: smartGoal.achievable || 'N/A',
    relevant: smartGoal.relevant || 'N/A',
    time_bound: smartGoal.time_bound || 'N/A',
    created_at: formatDate(smartGoal.created_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Smart Goals
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading smart goals...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Goals for Document {pdaDocumentId}</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage SMART goals for this PDA document</p>
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
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Smart Goals for Document {pdaDocumentId}</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage SMART goals for this PDA document</p>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateSmartGoal}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add New Smart Goal</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              {smartGoals.length > 0 ? (
                <DataTable
                  data={transformedSmartGoals}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search smart goals..."
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
                      No Smart Goals Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No SMART goals are currently available for this document. Create your first smart goal to get started.
                    </p>
                    <Button
                      onClick={handleCreateSmartGoal}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Smart Goal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the smart goal &quot;{smartGoalToDelete?.goal_title}&quot;?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteSmartGoalMutation.isPending}
              >
                {deleteSmartGoalMutation.isPending ? 'Deleting...' : 'Delete Smart Goal'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

