'use client';

import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { useMarketingChannel, useDeleteMarketingChannel } from '@/modules/marketing-channels';
import { toast } from 'sonner';
import { useState } from 'react';
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

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export default function MarketingChannelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = parseInt(params.id as string);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const breadcrumbItems = [
    { label: 'Marketing Channels', href: '/super-admin/marketing-channels' },
    { label: 'Channel Details' }
  ];

  // Fetch channel details
  const { data: channelResponse, isLoading, error } = useMarketingChannel(channelId);
  const channel = channelResponse?.data;

  // Delete mutation
  const deleteChannelMutation = useDeleteMarketingChannel();

  const handleEdit = () => {
    router.push(`/super-admin/marketing-channels/${channelId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteChannelMutation.mutateAsync(channelId);
      toast.success('Marketing channel deleted successfully');
      router.push('/super-admin/marketing-channels');
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';
      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this channel.');
      } else {
        toast.error('Failed to delete channel. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    router.push('/super-admin/marketing-channels');
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading channel details...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !channel) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error Loading Channel
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {(error as Error)?.message || 'Channel not found'}
                </p>
                <Button
                  onClick={handleBack}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Channels
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  const channelTypeUpper = channel.channel_type.charAt(0).toUpperCase() + channel.channel_type.slice(1).replace('_', ' ');

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Marketing Channel Details
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage channel information
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <EditIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>

            {/* Channel Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Channel Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      Channel ID
                    </label>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{channel.id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      Channel Name
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{channel.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      Channel Type
                    </label>
                    <div className="mt-1">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {channelTypeUpper}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      PDA Document ID
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{channel.pda_document_id}</p>
                  </div>
                </div>
              </Card>

              {/* PDA Document Information */}
              {channel.pda_document && (
                <Card className="p-6">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    PDA Document Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                        Document ID
                      </label>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{channel.pda_document.id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                        Contract ID
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">{channel.pda_document.contract_id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                        Customer ID
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">{channel.pda_document.customer_id}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                          {channel.pda_document.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Details */}
            {channel.details && channel.details.length > 0 && (
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Details
                </h2>
                <div className="space-y-3">
                  {channel.details.map((detail, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-orange-600 dark:text-orange-400 mr-3 mt-1">•</span>
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{detail}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Online Channels */}
            {channel.online_channels && channel.online_channels.length > 0 && (
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Online Channels ({channel.online_channels.length})
                </h2>
                <div className="space-y-6">
                  {channel.online_channels.map((onlineChannel) => (
                    <div key={onlineChannel.id} className="border-l-4 border-blue-500 pl-4 pb-4 last:pb-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Platform
                          </label>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{onlineChannel.platform || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Main Goal
                          </label>
                          <p className="text-base text-gray-900 dark:text-white">{onlineChannel.main_goal || 'N/A'}</p>
                        </div>
                        {onlineChannel.pages && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Pages
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{onlineChannel.pages}</p>
                          </div>
                        )}
                        {onlineChannel.type_of_content && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Type of Content
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{onlineChannel.type_of_content}</p>
                          </div>
                        )}
                        {onlineChannel.seo && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              SEO
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{onlineChannel.seo}</p>
                          </div>
                        )}
                        {onlineChannel.notes && (
                          <div className="lg:col-span-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Notes
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{onlineChannel.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Offline Channels */}
            {channel.offline_channels && channel.offline_channels.length > 0 && (
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Offline Channels ({channel.offline_channels.length})
                </h2>
                <div className="space-y-6">
                  {channel.offline_channels.map((offlineChannel) => (
                    <div key={offlineChannel.id} className="border-l-4 border-purple-500 pl-4 pb-4 last:pb-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Type
                          </label>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{offlineChannel.type || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Location
                          </label>
                          <p className="text-base text-gray-900 dark:text-white">{offlineChannel.location || 'N/A'}</p>
                        </div>
                        {offlineChannel.agency && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Agency
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{offlineChannel.agency}</p>
                          </div>
                        )}
                        {offlineChannel.street && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Street
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{offlineChannel.street}</p>
                          </div>
                        )}
                        {offlineChannel.type_of_content && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Type of Content
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{offlineChannel.type_of_content}</p>
                          </div>
                        )}
                        {offlineChannel.notes && (
                          <div className="lg:col-span-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Notes
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{offlineChannel.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Influencers */}
            {channel.influencers && channel.influencers.length > 0 && (
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  Influencers ({channel.influencers.length})
                </h2>
                <div className="space-y-6">
                  {channel.influencers.map((influencer) => (
                    <div key={influencer.id} className="border-l-4 border-teal-500 pl-4 pb-4 last:pb-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Name
                          </label>
                          <p className="text-base font-medium text-gray-900 dark:text-white">{influencer.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            Platform
                          </label>
                          <p className="text-base text-gray-900 dark:text-white">{influencer.platform || 'N/A'}</p>
                        </div>
                        {influencer.domain && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Domain
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{influencer.domain}</p>
                          </div>
                        )}
                        {influencer.followers && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Followers
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{influencer.followers}</p>
                          </div>
                        )}
                        {influencer.story_views && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Story Views
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{influencer.story_views}</p>
                          </div>
                        )}
                        {influencer.post_likes && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Post Likes
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{influencer.post_likes}</p>
                          </div>
                        )}
                        {influencer.content_type && (
                          <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Content Type
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300">{influencer.content_type}</p>
                          </div>
                        )}
                        {influencer.notes && (
                          <div className="lg:col-span-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                              Notes
                            </label>
                            <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{influencer.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Timestamps */}
            <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Timestamps
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    Created At
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(channel.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                    Updated At
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(channel.updated_at)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Marketing Channel</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this marketing channel? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Channel: {channel.name}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Type: {channelTypeUpper}
                  </p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

