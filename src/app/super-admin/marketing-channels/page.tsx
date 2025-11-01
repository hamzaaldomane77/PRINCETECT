'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useMarketingChannels, useDeleteMarketingChannel, MarketingChannel } from '@/modules/marketing-channels';
import { toast } from 'sonner';

export default function MarketingChannelsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<MarketingChannel | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'Marketing Channels' }
  ];

  // Fetch marketing channels using the hook
  const {
    data: channelsResponse,
    isLoading,
    error,
    refetch,
    isError
  } = useMarketingChannels();

  const channels = channelsResponse?.data.marketing_channels || [];

  // Mutations
  const deleteChannelMutation = useDeleteMarketingChannel();

  const handleCreateChannel = () => {
    router.push('/super-admin/marketing-channels/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteChannel = (channel: MarketingChannel) => {
    setChannelToDelete(channel);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!channelToDelete) return;

    try {
      await deleteChannelMutation.mutateAsync(channelToDelete.id);
      refetch();
      toast.success('Marketing channel deleted successfully');
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';

      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this channel.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Channel not found. It may have been already deleted.');
        refetch();
      } else {
        toast.error('Failed to delete channel. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setChannelToDelete(null);
    }
  };

  const handleViewChannel = (channel: MarketingChannel) => {
    router.push(`/super-admin/marketing-channels/${channel.id}`);
  };

  const handleEditChannel = (channel: MarketingChannel) => {
    router.push(`/super-admin/marketing-channels/${channel.id}/edit`);
  };

  const handleOnlineChannels = (channel: MarketingChannel) => {
    router.push(`/super-admin/marketing-channels/${channel.id}/online-channels/create`);
  };

  const handleOfflineChannels = (channel: MarketingChannel) => {
    router.push(`/super-admin/marketing-channels/${channel.id}/offline-channels/create`);
  };

  const handleInfluencers = (channel: MarketingChannel) => {
    router.push(`/super-admin/marketing-channels/${channel.id}/influencers/create`);
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'name', label: 'Name', type: 'text', align: 'right' },
    { key: 'channel_type', label: 'Channel Type', type: 'text', align: 'center' },
    { key: 'pda_document_id', label: 'PDA Document ID', type: 'text', align: 'right' },
    { key: 'details_count', label: 'Details Count', type: 'text', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'text', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' , width: '60px' }
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
          onClick: handleViewChannel
        },
        {
          icon: EditIcon,
          label: 'Edit Channel',
          onClick: handleEditChannel
        },
        {
          icon: PlusIcon,
          label: 'Online Channels',
          onClick: handleOnlineChannels,
          className: 'text-blue-600 dark:text-blue-400'
        },
        {
          icon: PlusIcon,
          label: 'Offline Channels',
          onClick: handleOfflineChannels,
          className: 'text-purple-600 dark:text-purple-400'
        },
        {
          icon: PlusIcon,
          label: 'Influencers',
          onClick: handleInfluencers,
          className: 'text-teal-600 dark:text-teal-400'
        },
        {
          icon: TrashIcon,
          label: 'Delete Channel',
          onClick: handleDeleteChannel,
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

  // Transform channels data for the table
  const transformedChannels = channels.map(channel => ({
    ...channel,
    channel_type: (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
        {channel.channel_type.charAt(0).toUpperCase() + channel.channel_type.slice(1).replace('_', ' ')}
      </Badge>
    ),
    pda_document_id: channel.pda_document_id || 'N/A',
    details_count: channel.details?.length || 0,
    created_at: formatDate(channel.created_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Marketing Channels
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading marketing channels...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing Channels</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage marketing channels</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing Channels</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage marketing channels</p>
              </div>

              {/* Create Channel Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateChannel}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Channel</span>
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {channels.length > 0 ? (
                <DataTable
                  data={transformedChannels}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search channels..."
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
                    <div className="text-6xl mb-4">📢</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Marketing Channels Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No channels are currently available. Create your first channel to get started.
                    </p>
                    <Button
                      onClick={handleCreateChannel}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Channel
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
                Are you sure you want to delete this marketing channel?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteChannelMutation.isPending}
              >
                {deleteChannelMutation.isPending ? 'Deleting...' : 'Delete Channel'}
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

