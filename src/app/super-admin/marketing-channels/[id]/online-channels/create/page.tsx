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
  useCreateOnlineChannel,
  CreateOnlineChannelRequest
} from '@/modules/marketing-channels';
import { toast } from 'sonner';

export default function CreateOnlineChannelPage() {
  const params = useParams();
  const router = useRouter();
  const marketingChannelId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateOnlineChannelRequest>({
    platform: '',
    main_goal: '',
    pages: '',
    type_of_content: '',
    seo: '',
    notes: ''
  });

  const breadcrumbItems = [
    { label: 'Marketing Channels', href: '/super-admin/marketing-channels' },
    { label: 'Channel Details', href: `/super-admin/marketing-channels/${marketingChannelId}` },
    { label: 'Online Channels', href: `/super-admin/marketing-channels/${marketingChannelId}/edit` },
    { label: 'Create Online Channel' }
  ];

  const createMutation = useCreateOnlineChannel(marketingChannelId);

  const handleInputChange = (field: keyof CreateOnlineChannelRequest, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.platform.trim()) {
        toast.error('Please enter a platform');
        setIsSubmitting(false);
        return;
      }

      if (!formData.main_goal.trim()) {
        toast.error('Please enter a main goal');
        setIsSubmitting(false);
        return;
      }

      await createMutation.mutateAsync(formData);
      toast.success('Online channel created successfully');
      router.push(`/super-admin/marketing-channels`);
    } catch (error) {
      console.error('Error creating online channel:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create online channel';
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Online Channel</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new online channel</p>
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

                <div className="space-y-2">
                  <Label htmlFor="main_goal">
                    Main Goal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="main_goal"
                    value={formData.main_goal}
                    onChange={(e) => handleInputChange('main_goal', e.target.value)}
                    placeholder="Enter main goal..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pages">Pages</Label>
                  <Input
                    id="pages"
                    value={formData.pages || ''}
                    onChange={(e) => handleInputChange('pages', e.target.value)}
                    placeholder="Enter pages (e.g., Home, About, Services)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_of_content">Type of Content</Label>
                  <Input
                    id="type_of_content"
                    value={formData.type_of_content || ''}
                    onChange={(e) => handleInputChange('type_of_content', e.target.value)}
                    placeholder="Enter type of content (e.g., Short Reels + Carousel Posts)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo">SEO</Label>
                  <Input
                    id="seo"
                    value={formData.seo || ''}
                    onChange={(e) => handleInputChange('seo', e.target.value)}
                    placeholder="Enter SEO keywords (e.g., digital marketing agency, branding)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter notes (e.g., Prefer modern simple visual style)"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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
                        Create Online Channel
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

