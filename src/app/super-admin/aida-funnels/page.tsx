'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, MoreVerticalIcon } from '@/components/ui/icons';
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
import { useAidaFunnels, useDeleteAidaFunnel, AidaFunnel } from '@/modules/aida-funnels';

const stageColors: Record<string, string> = {
  attention: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  interest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  desire: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  action: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export default function AidaFunnelsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [funnelToDelete, setFunnelToDelete] = useState<AidaFunnel | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'AIDA Funnels' }
  ];

  // Fetch AIDA Funnels using the hook
  const {
    data: funnelsResponse,
    isLoading,
    error,
    refetch,
    isError
  } = useAidaFunnels();

  const funnels = funnelsResponse?.data?.aida_funnels || [];

  // Debug: Log response data
  console.log('AIDA Funnels Response:', funnelsResponse);
  console.log('AIDA Funnels:', funnels);

  // Mutations
  const deleteFunnelMutation = useDeleteAidaFunnel();

  const handleCreateFunnel = () => {
    router.push('/super-admin/aida-funnels/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteFunnel = (funnel: AidaFunnel) => {
    setFunnelToDelete(funnel);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!funnelToDelete) return;

    try {
      await deleteFunnelMutation.mutateAsync(funnelToDelete.id);
      refetch();
    } catch (error) {
      console.error('Error deleting funnel:', error);
    } finally {
      setDeleteDialogOpen(false);
      setFunnelToDelete(null);
    }
  };

  const handleViewFunnel = (funnel: AidaFunnel) => {
    router.push(`/super-admin/aida-funnels/${funnel.id}`);
  };

  const handleEditFunnel = (funnel: AidaFunnel) => {
    router.push(`/super-admin/aida-funnels/${funnel.id}/edit`);
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

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'pda_document', label: 'PDA Document', type: 'text', align: 'right' },
    { key: 'stage', label: 'Stage', type: 'text', align: 'center' },
    { key: 'description', label: 'Description', type: 'text', align: 'right' },
    { key: 'order', label: 'Order', type: 'text', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'text', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' , width: '30px' }
  ];

  const actions: ActionButton[] = [
    {
      icon: MoreVerticalIcon,
      label: 'Actions',
      color: 'text-gray-600 dark:text-gray-300',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      onClick: () => {},
      dropdownItems: [
        {
          icon: EyeIcon,
          label: 'View Details',
          onClick: handleViewFunnel
        },
        {
          icon: EditIcon,
          label: 'Edit Funnel',
          onClick: handleEditFunnel
        },
        {
          icon: TrashIcon,
          label: 'Delete Funnel',
          onClick: handleDeleteFunnel,
          className: 'text-red-600 dark:text-red-400'
        }
      ]
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

  // Transform funnels data for the table
  const transformedFunnels = funnels.map(funnel => ({
    id: funnel.id,
    pda_document: `Document #${funnel.pda_document_id}`,
    stage: (
      <Badge className={stageColors[funnel.stage.toLowerCase()] || stageColors.attention}>
        {funnel.stage.charAt(0).toUpperCase() + funnel.stage.slice(1)}
      </Badge>
    ),
    description: funnel.description || 'N/A',
    order: funnel.order,
    created_at: formatDate(funnel.created_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading AIDA Funnels
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading AIDA Funnels...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AIDA Funnels</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage AIDA marketing funnels</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AIDA Funnels</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage AIDA marketing funnels</p>
              </div>

              {/* Create Funnel Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateFunnel}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Funnel</span>
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {funnels.length > 0 ? (
                <DataTable
                  data={transformedFunnels}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search funnels..."
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
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No AIDA Funnels Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No funnels are currently available. Create your first funnel to get started.
                    </p>
                    <Button
                      onClick={handleCreateFunnel}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Funnel
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
                Are you sure you want to delete this AIDA funnel?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteFunnelMutation.isPending}
              >
                {deleteFunnelMutation.isPending ? 'Deleting...' : 'Delete Funnel'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Error
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

