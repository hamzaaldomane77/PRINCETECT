'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { useCreateTargetAudience, CreateTargetAudienceRequest } from '@/modules/pda-documents/hooks/use-target-audiences';
import { toast } from 'sonner';

export default function CreateTargetAudiencePage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateTargetAudienceRequest>({
    audience_name: '',
    description: '',
    demographics: '',
    psychographics: ''
  });

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Target Audiences', href: `/super-admin/pda-documents/${pdaDocumentId}/target-audiences` },
    { label: 'Create' }
  ];

  const createMutation = useCreateTargetAudience(pdaDocumentId);

  const handleInputChange = (field: keyof CreateTargetAudienceRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.audience_name.trim()) {
        toast.error('Audience Name is required.');
        setIsSubmitting(false);
        return;
      }

      await createMutation.mutateAsync(formData);
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/target-audiences`);
    } catch (error) {
      console.error('Error creating target audience:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create target audience';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/target-audiences`);
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Target Audience</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new target audience for PDA Document {pdaDocumentId}</p>
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
                  <Label htmlFor="audience_name">
                    Audience Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="audience_name"
                    value={formData.audience_name}
                    onChange={(e) => handleInputChange('audience_name', e.target.value)}
                    placeholder="Enter audience name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter description (optional)"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demographics">Demographics</Label>
                  <Textarea
                    id="demographics"
                    value={formData.demographics || ''}
                    onChange={(e) => handleInputChange('demographics', e.target.value)}
                    placeholder="Enter demographics (optional)"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="psychographics">Psychographics</Label>
                  <Textarea
                    id="psychographics"
                    value={formData.psychographics || ''}
                    onChange={(e) => handleInputChange('psychographics', e.target.value)}
                    placeholder="Enter psychographics (optional)"
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
                    className="bg-orange-600 hover:bg-orange-700 text-white"
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
                        Create Audience
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

