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
  useCreateOfflineChannel,
  CreateOfflineChannelRequest
} from '@/modules/marketing-channels';
import { toast } from 'sonner';

export default function CreateOfflineChannelPage() {
  const params = useParams();
  const router = useRouter();
  const marketingChannelId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateOfflineChannelRequest>({
    type: '',
    location: '',
    agency: '',
    street: '',
    type_of_content: '',
    notes: ''
  });

  const breadcrumbItems = [
    { label: 'Marketing Channels', href: '/super-admin/marketing-channels' },
    { label: 'Channel Details', href: `/super-admin/marketing-channels/${marketingChannelId}` },
    { label: 'Offline Channels', href: `/super-admin/marketing-channels/${marketingChannelId}/edit` },
    { label: 'Create Offline Channel' }
  ];

  const createMutation = useCreateOfflineChannel(marketingChannelId);

  const handleInputChange = (field: keyof CreateOfflineChannelRequest, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.type.trim()) {
        toast.error('Please enter a type');
        setIsSubmitting(false);
        return;
      }

      if (!formData.location.trim()) {
        toast.error('Please enter a location');
        setIsSubmitting(false);
        return;
      }

      await createMutation.mutateAsync(formData);
      toast.success('Offline channel created successfully');
      router.push(`/super-admin/marketing-channels`);
    } catch (error) {
      console.error('Error creating offline channel:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create offline channel';
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Offline Channel</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new offline channel</p>
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
                  <Label htmlFor="type">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    placeholder="Enter type..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location (e.g., Riyadh)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency">Agency</Label>
                  <Input
                    id="agency"
                    value={formData.agency || ''}
                    onChange={(e) => handleInputChange('agency', e.target.value)}
                    placeholder="Enter agency (e.g., XYZ Agency)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={formData.street || ''}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="Enter street (e.g., King Fahad Road)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_of_content">Type of Content</Label>
                  <Input
                    id="type_of_content"
                    value={formData.type_of_content || ''}
                    onChange={(e) => handleInputChange('type_of_content', e.target.value)}
                    placeholder="Enter type of content (e.g., Video Campaign)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter notes (e.g., Premium influencer contract)"
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
                    className="bg-purple-600 hover:bg-purple-700 text-white"
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
                        Create Offline Channel
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

