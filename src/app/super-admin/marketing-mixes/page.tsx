'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon, MoreVerticalIcon } from '@/components/ui/icons';
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
import { useMarketingMixes, useDeleteMarketingMix } from '@/modules/marketing-mixes';
import { MarketingMix } from '@/modules/marketing-mixes/types';
import { toast } from 'sonner';

const elementColors = {
  product: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  price: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  place: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  promotion: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

export default function MarketingMixesPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [marketingMixToDelete, setMarketingMixToDelete] = useState<MarketingMix | null>(null);
  
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Marketing Mixes' }
  ];

  // Fetch marketing mixes using the hook
  const { 
    data: marketingMixesResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useMarketingMixes();

  const marketingMixes = marketingMixesResponse?.data?.marketing_mixes || [];

  // Mutations
  const deleteMarketingMixMutation = useDeleteMarketingMix();

  const handleCreateMarketingMix = () => {
    router.push('/super-admin/marketing-mixes/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteMarketingMix = (marketingMix: MarketingMix) => {
    setMarketingMixToDelete(marketingMix);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!marketingMixToDelete) return;
    
    try {
      await deleteMarketingMixMutation.mutateAsync(marketingMixToDelete.id);
      toast.success('Marketing mix deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete marketing mix:', error);
      toast.error('Failed to delete marketing mix. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setMarketingMixToDelete(null);
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { 
      key: 'element', 
      label: 'Element', 
      type: 'badge', 
      align: 'center',
      badgeColors: elementColors
    },
    { key: 'title', label: 'Title', type: 'text', align: 'left' },
    { 
      key: 'description', 
      label: 'Description', 
      type: 'custom',
      align: 'left',
      render: (item: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs block">
          {item.description || '-'}
        </span>
      )
    },
    { 
      key: 'pda_document', 
      label: 'PDA Document', 
      type: 'custom',
      align: 'left',
      render: (item: any) => {
        if (!item.pda_document) return '-';
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">Document #{item.pda_document.id}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Status: {item.pda_document.status}</span>
          </div>
        );
      }
    },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: MoreVerticalIcon,
      label: 'Actions',
      color: 'text-gray-600 dark:text-gray-300',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      onClick: () => {}, // Empty function since we use dropdown
      dropdownItems: [
        {
          icon: EyeIcon,
          label: 'View Marketing Mix',
          onClick: (marketingMix: MarketingMix) => {
            router.push(`/super-admin/marketing-mixes/${marketingMix.id}`);
          }
        },
        {
          icon: EditIcon,
          label: 'Edit Marketing Mix',
          onClick: (marketingMix: MarketingMix) => {
            router.push(`/super-admin/marketing-mixes/${marketingMix.id}/edit`);
          }
        },
        {
          icon: TrashIcon,
          label: 'Delete Marketing Mix',
          onClick: handleDeleteMarketingMix,
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

  // Transform marketing mixes data for the table
  const transformedMarketingMixes = marketingMixes.map(mix => ({
    ...mix,
    element: mix.element ? mix.element.toLowerCase() : 'product',
    description: mix.description || null,
    pda_document: mix.pda_document || null,
    created_at: mix.created_at,
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Marketing Mixes
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading marketing mixes...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing Mixes Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your marketing mixes</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing Mixes Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your marketing mixes (Product, Price, Place, Promotion)</p>
              </div>
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateMarketingMix}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Marketing Mix</span>
                </Button>
              </div>
            </div>
          
            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {marketingMixes.length > 0 ? (
                <DataTable
                  data={transformedMarketingMixes}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search marketing mixes..."
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
                      No Marketing Mixes Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No marketing mixes are currently available. Create your first marketing mix to get started.
                    </p>
                    <Button
                      onClick={handleCreateMarketingMix}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Marketing Mix
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
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من أنك تريد حذف Marketing Mix &quot;{marketingMixToDelete?.title}&quot;؟ 
                <br />
                <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteMarketingMixMutation.isPending}
              >
                {deleteMarketingMixMutation.isPending ? 'جاري الحذف...' : 'حذف Marketing Mix'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

