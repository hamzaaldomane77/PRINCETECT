'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeftIcon, SaveIcon, PlusIcon, XIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  useMarketingChannel,
  useUpdateMarketingChannel,
  useCreateOnlineChannel,
  useUpdateOnlineChannel,
  useDeleteOnlineChannel,
  useCreateOfflineChannel,
  useUpdateOfflineChannel,
  useDeleteOfflineChannel,
  useCreateInfluencer,
  useUpdateInfluencer,
  useDeleteInfluencer,
  CHANNEL_TYPE_OPTIONS,
  UpdateMarketingChannelRequest,
  OnlineChannel,
  OfflineChannel,
  Influencer,
  CreateOnlineChannelRequest,
  UpdateOnlineChannelRequest,
  CreateOfflineChannelRequest,
  UpdateOfflineChannelRequest,
  CreateInfluencerRequest,
  UpdateInfluencerRequest,
} from '@/modules/marketing-channels';
import { usePdaDocuments } from '@/modules/pda-documents';
import { toast } from 'sonner';

export default function EditMarketingChannelPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState<string[]>(['']);
  const [detailInput, setDetailInput] = useState('');

  // Online Channels state
  const [onlineChannelDialogOpen, setOnlineChannelDialogOpen] = useState(false);
  const [editingOnlineChannel, setEditingOnlineChannel] = useState<OnlineChannel | null>(null);
  const [onlineChannelForm, setOnlineChannelForm] = useState<CreateOnlineChannelRequest>({
    platform: '',
    main_goal: ''
  });

  // Offline Channels state
  const [offlineChannelDialogOpen, setOfflineChannelDialogOpen] = useState(false);
  const [editingOfflineChannel, setEditingOfflineChannel] = useState<OfflineChannel | null>(null);
  const [offlineChannelForm, setOfflineChannelForm] = useState<CreateOfflineChannelRequest>({
    type: '',
    location: ''
  });

  // Influencers state
  const [influencerDialogOpen, setInfluencerDialogOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [influencerForm, setInfluencerForm] = useState<CreateInfluencerRequest>({
    name: '',
    platform: ''
  });

  const [formData, setFormData] = useState<UpdateMarketingChannelRequest>({
    pda_document_id: '',
    channel_type: 'online',
    name: '',
    details: []
  });

  const breadcrumbItems = [
    { label: 'Marketing Channels', href: '/super-admin/marketing-channels' },
    { label: 'Channel Details', href: `/super-admin/marketing-channels` },
    { label: 'Edit' }
  ];

  // Fetch channel details
  const { data: channelResponse, isLoading: channelLoading, refetch: refetchChannel } = useMarketingChannel(channelId);
  const channel = channelResponse?.data;

  // Fetch PDA documents for dropdown
  const { data: pdaDocumentsResponse, isLoading: pdaDocumentsLoading } = usePdaDocuments();
  const pdaDocuments = pdaDocumentsResponse?.data.pda_documents || [];

  // Update mutation
  const updateMutation = useUpdateMarketingChannel();

  // Online Channels mutations
  const createOnlineChannelMutation = useCreateOnlineChannel(channelId);
  const updateOnlineChannelMutation = useUpdateOnlineChannel(channelId);
  const deleteOnlineChannelMutation = useDeleteOnlineChannel(channelId);

  // Offline Channels mutations
  const createOfflineChannelMutation = useCreateOfflineChannel(channelId);
  const updateOfflineChannelMutation = useUpdateOfflineChannel(channelId);
  const deleteOfflineChannelMutation = useDeleteOfflineChannel(channelId);

  // Influencers mutations
  const createInfluencerMutation = useCreateInfluencer(channelId);
  const updateInfluencerMutation = useUpdateInfluencer(channelId);
  const deleteInfluencerMutation = useDeleteInfluencer(channelId);

  // Initialize form data when channel is loaded
  useEffect(() => {
    if (channel && !pdaDocumentsLoading && !channelLoading) {
      setFormData({
        pda_document_id: channel.pda_document_id.toString(),
        channel_type: channel.channel_type,
        name: channel.name,
        details: channel.details || []
      });
      setDetails(channel.details && channel.details.length > 0 ? channel.details : ['']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, pdaDocumentsLoading, channelLoading]);

  const handleInputChange = (field: keyof UpdateMarketingChannelRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDetail = () => {
    if (detailInput.trim()) {
      setDetails(prev => [...prev, detailInput.trim()]);
      setDetailInput('');
    }
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(prev => prev.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index] = value;
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.pda_document_id) {
        toast.error('Please select a PDA document');
        setIsSubmitting(false);
        return;
      }

      if (!formData.name || formData.name.trim() === '') {
        toast.error('Please enter a channel name');
        setIsSubmitting(false);
        return;
      }

      if (!formData.channel_type) {
        toast.error('Please select a channel type');
        setIsSubmitting(false);
        return;
      }

      // Filter out empty details and submit
      const filteredDetails = details.filter(d => d.trim() !== '');
      
      // Prepare submit data - include all fields even if not changed
      const submitData: UpdateMarketingChannelRequest = {
        pda_document_id: formData.pda_document_id || channel?.pda_document_id.toString() || '',
        channel_type: formData.channel_type || channel?.channel_type || '',
        name: formData.name || channel?.name || '',
        details: filteredDetails.length > 0 ? filteredDetails : (channel?.details || [])
      };

      await updateMutation.mutateAsync({ id: channelId, data: submitData });
      toast.success('Marketing channel updated successfully');
      router.push(`/super-admin/marketing-channels/${channelId}`);
    } catch (error) {
      console.error('Error updating marketing channel:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to update marketing channel';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/marketing-channels`);
  };

  // Online Channels handlers
  const handleAddOnlineChannel = () => {
    setEditingOnlineChannel(null);
    setOnlineChannelForm({ platform: '', main_goal: '' });
    setOnlineChannelDialogOpen(true);
  };

  const handleEditOnlineChannel = (onlineChannel: OnlineChannel) => {
    setEditingOnlineChannel(onlineChannel);
    setOnlineChannelForm({
      platform: onlineChannel.platform || '',
      main_goal: onlineChannel.main_goal || ''
    });
    setOnlineChannelDialogOpen(true);
  };

  const handleDeleteOnlineChannel = async (id: number) => {
    if (confirm('Are you sure you want to delete this online channel?')) {
      try {
        await deleteOnlineChannelMutation.mutateAsync(id);
        toast.success('Online channel deleted successfully');
      } catch (error) {
        toast.error('Failed to delete online channel');
      }
    }
  };

  const handleSaveOnlineChannel = async () => {
    if (!onlineChannelForm.platform || !onlineChannelForm.main_goal) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingOnlineChannel) {
        await updateOnlineChannelMutation.mutateAsync({
          id: editingOnlineChannel.id,
          data: onlineChannelForm
        });
        toast.success('Online channel updated successfully');
      } else {
        await createOnlineChannelMutation.mutateAsync(onlineChannelForm);
        toast.success('Online channel created successfully');
      }
      setOnlineChannelDialogOpen(false);
      setEditingOnlineChannel(null);
      setOnlineChannelForm({ platform: '', main_goal: '' });
    } catch (error) {
      toast.error('Failed to save online channel');
    }
  };

  // Offline Channels handlers
  const handleAddOfflineChannel = () => {
    setEditingOfflineChannel(null);
    setOfflineChannelForm({ type: '', location: '' });
    setOfflineChannelDialogOpen(true);
  };

  const handleEditOfflineChannel = (offlineChannel: OfflineChannel) => {
    setEditingOfflineChannel(offlineChannel);
    setOfflineChannelForm({
      type: offlineChannel.type || '',
      location: offlineChannel.location || ''
    });
    setOfflineChannelDialogOpen(true);
  };

  const handleDeleteOfflineChannel = async (id: number) => {
    if (confirm('Are you sure you want to delete this offline channel?')) {
      try {
        await deleteOfflineChannelMutation.mutateAsync(id);
        toast.success('Offline channel deleted successfully');
      } catch (error) {
        toast.error('Failed to delete offline channel');
      }
    }
  };

  const handleSaveOfflineChannel = async () => {
    if (!offlineChannelForm.type || !offlineChannelForm.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingOfflineChannel) {
        await updateOfflineChannelMutation.mutateAsync({
          id: editingOfflineChannel.id,
          data: offlineChannelForm
        });
        toast.success('Offline channel updated successfully');
      } else {
        await createOfflineChannelMutation.mutateAsync(offlineChannelForm);
        toast.success('Offline channel created successfully');
      }
      setOfflineChannelDialogOpen(false);
      setEditingOfflineChannel(null);
      setOfflineChannelForm({ type: '', location: '' });
    } catch (error) {
      toast.error('Failed to save offline channel');
    }
  };

  // Influencers handlers
  const handleAddInfluencer = () => {
    setEditingInfluencer(null);
    setInfluencerForm({ name: '', platform: '' });
    setInfluencerDialogOpen(true);
  };

  const handleEditInfluencer = (influencer: Influencer) => {
    setEditingInfluencer(influencer);
    setInfluencerForm({
      name: influencer.name || '',
      platform: influencer.platform || ''
    });
    setInfluencerDialogOpen(true);
  };

  const handleDeleteInfluencer = async (id: number) => {
    if (confirm('Are you sure you want to delete this influencer?')) {
      try {
        await deleteInfluencerMutation.mutateAsync(id);
        toast.success('Influencer deleted successfully');
      } catch (error) {
        toast.error('Failed to delete influencer');
      }
    }
  };

  const handleSaveInfluencer = async () => {
    if (!influencerForm.name || !influencerForm.platform) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingInfluencer) {
        await updateInfluencerMutation.mutateAsync({
          id: editingInfluencer.id,
          data: influencerForm
        });
        toast.success('Influencer updated successfully');
      } else {
        await createInfluencerMutation.mutateAsync(influencerForm);
        toast.success('Influencer created successfully');
      }
      setInfluencerDialogOpen(false);
      setEditingInfluencer(null);
      setInfluencerForm({ name: '', platform: '' });
    } catch (error) {
      toast.error('Failed to save influencer');
    }
  };

  if (channelLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading channel...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (!channel) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Channel Not Found
                </h3>
                <Button
                  onClick={() => router.push('/super-admin/marketing-channels')}
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Marketing Channel</h1>
                <p className="text-gray-600 dark:text-gray-400">Update channel information</p>
              </div>

              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </div>

            {/* Form */}
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* PDA Document Selection */}
                <div className="space-y-2">
                  <Label htmlFor="pda_document_id">
                    PDA Document <span className="text-red-500">*</span>
                  </Label>
                  {pdaDocumentsLoading || !channel ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading PDA documents...</div>
                  ) : pdaDocuments.length === 0 ? (
                    <div className="text-sm text-red-500">No PDA documents available</div>
                  ) : (
                    <Select
                      value={formData.pda_document_id ? formData.pda_document_id.toString() : ''}
                      onValueChange={(value) => handleInputChange('pda_document_id', value)}
                      key={`pda-${channel.id}-${formData.pda_document_id}`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a PDA document..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pdaDocuments.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id.toString()}>
                            Document #{doc.id} - Status: {doc.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Channel Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="channel_type">
                    Channel Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.channel_type || ''}
                    onValueChange={(value) => handleInputChange('channel_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Channel Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Channel Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter channel name"
                    required
                  />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Label htmlFor="details">
                    Details
                  </Label>
                  
                  {/* Existing details */}
                  {details.map((detail, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={detail}
                        onChange={(e) => handleDetailChange(index, e.target.value)}
                        placeholder={`Detail ${index + 1}`}
                      />
                      {details.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveDetail(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Add new detail */}
                  <div className="flex gap-2">
                    <Input
                      value={detailInput}
                      onChange={(e) => setDetailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDetail();
                        }
                      }}
                      placeholder="Add a new detail"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddDetail}
                      disabled={!detailInput.trim()}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Update Channel
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Online Channels Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Online Channels
                </h2>
                <Button
                  onClick={() => router.push(`/super-admin/marketing-channels/${channelId}/online-channels/create`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Online Channel
                </Button>
              </div>
              {channel?.online_channels && channel.online_channels.length > 0 ? (
                <div className="space-y-4">
                  {channel.online_channels.map((onlineChannel) => (
                    <div key={onlineChannel.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform</label>
                            <p className="text-base text-gray-900 dark:text-white">{onlineChannel.platform || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Main Goal</label>
                            <p className="text-base text-gray-900 dark:text-white">{onlineChannel.main_goal || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOnlineChannel(onlineChannel)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOnlineChannel(onlineChannel.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No online channels yet</p>
              )}
            </Card>

            {/* Offline Channels Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Offline Channels
                </h2>
                <Button
                  onClick={() => router.push(`/super-admin/marketing-channels/${channelId}/offline-channels/create`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Offline Channel
                </Button>
              </div>
              {channel?.offline_channels && channel.offline_channels.length > 0 ? (
                <div className="space-y-4">
                  {channel.offline_channels.map((offlineChannel) => (
                    <div key={offlineChannel.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                            <p className="text-base text-gray-900 dark:text-white">{offlineChannel.type || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                            <p className="text-base text-gray-900 dark:text-white">{offlineChannel.location || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOfflineChannel(offlineChannel)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOfflineChannel(offlineChannel.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No offline channels yet</p>
              )}
            </Card>

            {/* Influencers Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Influencers
                </h2>
                <Button
                  onClick={() => router.push(`/super-admin/marketing-channels/${channelId}/influencers/create`)}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Influencer
                </Button>
              </div>
              {channel?.influencers && channel.influencers.length > 0 ? (
                <div className="space-y-4">
                  {channel.influencers.map((influencer) => (
                    <div key={influencer.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                            <p className="text-base text-gray-900 dark:text-white">{influencer.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform</label>
                            <p className="text-base text-gray-900 dark:text-white">{influencer.platform || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInfluencer(influencer)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInfluencer(influencer.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No influencers yet</p>
              )}
            </Card>
          </div>
        </div>

        {/* Online Channel Dialog */}
        <Dialog open={onlineChannelDialogOpen} onOpenChange={setOnlineChannelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOnlineChannel ? 'Edit Online Channel' : 'Add Online Channel'}</DialogTitle>
              <DialogDescription>
                {editingOnlineChannel ? 'Update online channel information' : 'Create a new online channel'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform <span className="text-red-500">*</span></Label>
                <Input
                  id="platform"
                  value={onlineChannelForm.platform}
                  onChange={(e) => setOnlineChannelForm({ ...onlineChannelForm, platform: e.target.value })}
                  placeholder="Enter platform"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="main_goal">Main Goal <span className="text-red-500">*</span></Label>
                <Input
                  id="main_goal"
                  value={onlineChannelForm.main_goal}
                  onChange={(e) => setOnlineChannelForm({ ...onlineChannelForm, main_goal: e.target.value })}
                  placeholder="Enter main goal"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOnlineChannelDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveOnlineChannel}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={createOnlineChannelMutation.isPending || updateOnlineChannelMutation.isPending}
              >
                {createOnlineChannelMutation.isPending || updateOnlineChannelMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Offline Channel Dialog */}
        <Dialog open={offlineChannelDialogOpen} onOpenChange={setOfflineChannelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOfflineChannel ? 'Edit Offline Channel' : 'Add Offline Channel'}</DialogTitle>
              <DialogDescription>
                {editingOfflineChannel ? 'Update offline channel information' : 'Create a new offline channel'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
                <Input
                  id="type"
                  value={offlineChannelForm.type}
                  onChange={(e) => setOfflineChannelForm({ ...offlineChannelForm, type: e.target.value })}
                  placeholder="Enter type"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  value={offlineChannelForm.location}
                  onChange={(e) => setOfflineChannelForm({ ...offlineChannelForm, location: e.target.value })}
                  placeholder="Enter location"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOfflineChannelDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveOfflineChannel}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={createOfflineChannelMutation.isPending || updateOfflineChannelMutation.isPending}
              >
                {createOfflineChannelMutation.isPending || updateOfflineChannelMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Influencer Dialog */}
        <Dialog open={influencerDialogOpen} onOpenChange={setInfluencerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingInfluencer ? 'Edit Influencer' : 'Add Influencer'}</DialogTitle>
              <DialogDescription>
                {editingInfluencer ? 'Update influencer information' : 'Create a new influencer'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="influencer_name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="influencer_name"
                  value={influencerForm.name}
                  onChange={(e) => setInfluencerForm({ ...influencerForm, name: e.target.value })}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="influencer_platform">Platform <span className="text-red-500">*</span></Label>
                <Input
                  id="influencer_platform"
                  value={influencerForm.platform}
                  onChange={(e) => setInfluencerForm({ ...influencerForm, platform: e.target.value })}
                  placeholder="Enter platform"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInfluencerDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveInfluencer}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={createInfluencerMutation.isPending || updateInfluencerMutation.isPending}
              >
                {createInfluencerMutation.isPending || updateInfluencerMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

