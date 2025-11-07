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
import { useCreateToneOfVoice } from '@/modules/pda-documents/hooks/use-tone-of-voice';
import { CreateToneOfVoiceRequest } from '@/modules/pda-documents/types/tone-of-voice';
import { toast } from 'sonner';

export default function CreateToneOfVoicePage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateToneOfVoiceRequest>({
    personality: '',
    summary: '',
    bio: '',
    msgs_comments_response: '',
    keywords: '',
    brand_slogan: ''
  });

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Tone of Voice', href: `/super-admin/pda-documents/${pdaDocumentId}/tone-of-voice` },
    { label: 'Create Tone of Voice' }
  ];

  const createToneOfVoiceMutation = useCreateToneOfVoice(pdaDocumentId);

  const handleInputChange = (field: keyof CreateToneOfVoiceRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createToneOfVoiceMutation.mutateAsync(formData);
      router.push(`/super-admin/pda-documents/${pdaDocumentId}`);
    } catch (error) {
      console.error('Error creating tone of voice:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create tone of voice';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/tone-of-voice`);
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Tone of Voice</h1>
                <p className="text-gray-600 dark:text-gray-400">Add tone of voice for PDA Document {pdaDocumentId}</p>
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
                  <Label htmlFor="personality">Personality</Label>
                  <Input
                    id="personality"
                    value={formData.personality || ''}
                    onChange={(e) => handleInputChange('personality', e.target.value)}
                    placeholder="Enter personality (e.g., bold & friendly)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary || ''}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Enter a short project summary"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Enter bio information"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="msgs_comments_response">Messages/Comments Response</Label>
                  <Textarea
                    id="msgs_comments_response"
                    value={formData.msgs_comments_response || ''}
                    onChange={(e) => handleInputChange('msgs_comments_response', e.target.value)}
                    placeholder="Enter default response for messages and comments"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords || ''}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    placeholder="Enter keywords (e.g., marketing, design, brand)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_slogan">Brand Slogan</Label>
                  <Input
                    id="brand_slogan"
                    value={formData.brand_slogan || ''}
                    onChange={(e) => handleInputChange('brand_slogan', e.target.value)}
                    placeholder="Enter brand slogan (e.g., Make it Real. Make it Bold.)"
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
                        Create Tone of Voice
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

