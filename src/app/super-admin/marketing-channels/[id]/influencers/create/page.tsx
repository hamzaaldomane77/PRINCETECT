'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import {
  useCreateInfluencer,
  CreateInfluencerRequest
} from '@/modules/marketing-channels';
import { toast } from 'sonner';

export default function CreateInfluencerPage() {
  const params = useParams();
  const router = useRouter();
  const marketingChannelId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateInfluencerRequest>({
    name: '',
    platform: '',
    domain: '',
    followers: '',
    story_views: '',
    post_likes: '',
    content_type: '',
    notes: ''
  });

  const breadcrumbItems = [
    { label: 'Marketing Channels', href: '/super-admin/marketing-channels' },
    { label: 'Channel Details', href: `/super-admin/marketing-channels/${marketingChannelId}` },
    { label: 'Influencers', href: `/super-admin/marketing-channels/${marketingChannelId}/edit` },
    { label: 'Create Influencer' }
  ];

  const createMutation = useCreateInfluencer(marketingChannelId);

  const handleInputChange = (field: keyof CreateInfluencerRequest, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        toast.error('Please enter a name');
        setIsSubmitting(false);
        return;
      }

      if (!formData.platform.trim()) {
        toast.error('Please enter a platform');
        setIsSubmitting(false);
        return;
      }

      await createMutation.mutateAsync(formData);
      toast.success('Influencer created successfully');
      router.push(`/super-admin/marketing-channels`);
    } catch (error) {
      console.error('Error creating influencer:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create influencer';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/marketing-channels`);
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Influencer</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new influencer</p>
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

            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter name..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">
                    Platform <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="platform"
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    placeholder="Enter platform (e.g., Instagram)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain || ''}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    placeholder="Enter domain (e.g., Lifestyle / Fashion)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followers">Followers</Label>
                    <Input
                      id="followers"
                      type="number"
                      value={formData.followers || ''}
                      onChange={(e) => handleInputChange('followers', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Enter followers (e.g., 95000)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story_views">Story Views</Label>
                    <Input
                      id="story_views"
                      type="number"
                      value={formData.story_views || ''}
                      onChange={(e) => handleInputChange('story_views', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Enter story views (e.g., 18000)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post_likes">Post Likes</Label>
                    <Input
                      id="post_likes"
                      type="number"
                      value={formData.post_likes || ''}
                      onChange={(e) => handleInputChange('post_likes', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Enter post likes (e.g., 3500)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_type">Content Type</Label>
                  <Input
                    id="content_type"
                    value={formData.content_type || ''}
                    onChange={(e) => handleInputChange('content_type', e.target.value)}
                    placeholder="Enter content type (e.g., Reels + Collaborations)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter notes (e.g., Preferred for female audience campaigns)"
                    rows={4}
                  />
                </div>

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
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Create Influencer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

