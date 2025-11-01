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
    platform: ''
  });

  const breadcrumbItems = [
    { label: 'Marketing Channels', href: '/super-admin/marketing-channels' },
    { label: 'Channel Details', href: `/super-admin/marketing-channels/${marketingChannelId}` },
    { label: 'Influencers', href: `/super-admin/marketing-channels/${marketingChannelId}/edit` },
    { label: 'Create Influencer' }
  ];

  const createMutation = useCreateInfluencer(marketingChannelId);

  const handleInputChange = (field: keyof CreateInfluencerRequest, value: string) => {
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
      router.push(`/super-admin/marketing-channels/${marketingChannelId}/edit`);
    } catch (error) {
      console.error('Error creating influencer:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create influencer';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/marketing-channels/${marketingChannelId}/edit`);
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
                    placeholder="Enter platform..."
                    required
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

