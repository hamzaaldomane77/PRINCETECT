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
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { useMarketChallenge, useUpdateMarketChallenge, UpdateMarketChallengeRequest } from '@/modules/pda-documents/hooks/use-market-challenges';
import { toast } from 'sonner';

export default function EditMarketChallengePage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);
  const challengeId = parseInt(params.challengeId as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: challengeResponse, isLoading, isError, error } = useMarketChallenge(pdaDocumentId, challengeId);
  const updateMutation = useUpdateMarketChallenge(pdaDocumentId);

  const [formData, setFormData] = useState<UpdateMarketChallengeRequest>({
    challenge_title: '',
    description: ''
  });

  useEffect(() => {
    if (challengeResponse?.data) {
      setFormData({
        challenge_title: challengeResponse.data.challenge_title,
        description: challengeResponse.data.description || ''
      });
    }
  }, [challengeResponse]);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Market Challenges', href: `/super-admin/pda-documents/${pdaDocumentId}/market-challenges` },
    { label: `Challenge ${challengeId}`, href: `/super-admin/pda-documents/${pdaDocumentId}/market-challenges/${challengeId}` },
    { label: 'Edit' }
  ];

  const handleInputChange = (field: keyof UpdateMarketChallengeRequest, value: any) => {
    setFormData((prev: UpdateMarketChallengeRequest) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.challenge_title?.trim()) {
        toast.error('Challenge Title is required.');
        setIsSubmitting(false);
        return;
      }

      await updateMutation.mutateAsync({ challengeId, data: formData });
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/market-challenges/${challengeId}`);
    } catch (error) {
      console.error('Error updating market challenge:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to update market challenge';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/market-challenges/${challengeId}`);
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError || !challengeResponse?.data) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Error Loading
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                    {error?.message || 'Failed to load. Please try again.'}
                  </p>
                  <Button
                    onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}/market-challenges`)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
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
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Market Challenge</h1>
                <p className="text-gray-600 dark:text-gray-400">Update market challenge</p>
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
                  <Label htmlFor="challenge_title">
                    Challenge Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="challenge_title"
                    value={formData.challenge_title || ''}
                    onChange={(e) => handleInputChange('challenge_title', e.target.value)}
                    placeholder="Enter challenge title"
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
                        Update
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

