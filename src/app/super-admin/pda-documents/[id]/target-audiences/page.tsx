'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { useTargetAudiences, useDeleteTargetAudience } from '@/modules/pda-documents/hooks/use-target-audiences';
import { TargetAudience } from '@/modules/pda-documents/types/target-audiences';
import { toast } from 'sonner';

export default function TargetAudiencesPage() {
  const params = useParams();
  const router = useRouter();
  const pdaDocumentId = parseInt(params.id as string);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [audienceToDelete, setAudienceToDelete] = useState<TargetAudience | null>(null);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Target Audiences' }
  ];

  const {
    data: audiencesResponse,
    isLoading,
    error,
    refetch,
    isError
  } = useTargetAudiences(pdaDocumentId);

  const audiences = audiencesResponse?.data.target_audiences || [];
  const deleteAudienceMutation = useDeleteTargetAudience(pdaDocumentId);

  const handleCreateAudience = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/target-audiences/create`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteAudience = (audience: TargetAudience) => {
    setAudienceToDelete(audience);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!audienceToDelete) return;

    try {
      await deleteAudienceMutation.mutateAsync(audienceToDelete.id);
      refetch();
    } catch (error) {
      const errorMsg = (error as Error)?.message || 'Failed to delete target audience.';
      toast.error(errorMsg);
    } finally {
      setDeleteDialogOpen(false);
      setAudienceToDelete(null);
    }
  };

  const handleViewAudience = (audience: TargetAudience) => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/target-audiences/${audience.id}`);
  };

  const handleEditAudience = (audience: TargetAudience) => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/target-audiences/${audience.id}/edit`);
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'audience_name', label: 'Audience Name', type: 'text', align: 'right' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { key: 'demographics', label: 'Demographics', type: 'text', align: 'right' },
    { key: 'created_at', label: 'Created At', type: 'text', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'right', width: '150px' }
  ];

  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Details',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: handleViewAudience
    },
    {
      icon: EditIcon,
      label: 'Edit Audience',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: handleEditAudience
    },
    {
      icon: TrashIcon,
      label: 'Delete Audience',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteAudience
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

  const transformedAudiences = audiences.map(aud => ({
    ...aud,
    description: aud.description || 'N/A',
    demographics: aud.demographics || 'N/A',
    created_at: formatDate(aud.created_at),
  }));

  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Target Audiences
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
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
  );

  if (isLoading && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading target audiences...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Target Audiences for Document {pdaDocumentId}</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage target audiences for this PDA document</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Target Audiences for Document {pdaDocumentId}</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage target audiences for this PDA document</p>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateAudience}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add New Audience</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              {audiences.length > 0 ? (
                <DataTable
                  data={transformedAudiences}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search target audiences..."
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
                      No Target Audiences Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No target audiences are currently available for this document.
                    </p>
                    <Button
                      onClick={handleCreateAudience}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Audience
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
                Are you sure you want to delete &quot;{audienceToDelete?.audience_name}&quot;?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteAudienceMutation.isPending}
              >
                {deleteAudienceMutation.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

