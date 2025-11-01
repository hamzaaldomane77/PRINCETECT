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
import { useCompetitor, useUpdateCompetitor } from '@/modules/pda-documents/hooks/use-competitors';
import { UpdateCompetitorRequest } from '@/modules/pda-documents/types/competitors';
import { toast } from 'sonner';

export default function EditCompetitorPage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);
  const competitorId = parseInt(params.competitorId as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: competitorResponse, isLoading, isError, error } = useCompetitor(pdaDocumentId, competitorId);
  const updateCompetitorMutation = useUpdateCompetitor(pdaDocumentId);

  const [formData, setFormData] = useState<UpdateCompetitorRequest>({
    name: '',
    strengths: '',
    weaknesses: '',
    notes: ''
  });

  useEffect(() => {
    if (competitorResponse?.data) {
      setFormData({
        name: competitorResponse.data.name,
        strengths: competitorResponse.data.strengths || '',
        weaknesses: competitorResponse.data.weaknesses || '',
        notes: competitorResponse.data.notes || ''
      });
    }
  }, [competitorResponse]);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Competitors', href: `/super-admin/pda-documents/${pdaDocumentId}/competitors` },
    { label: `Competitor ${competitorId}`, href: `/super-admin/pda-documents/${pdaDocumentId}/competitors/${competitorId}` },
    { label: 'Edit Competitor' }
  ];

  const handleInputChange = (field: keyof UpdateCompetitorRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name?.trim()) {
        toast.error('Competitor Name is required.');
        setIsSubmitting(false);
        return;
      }

      await updateCompetitorMutation.mutateAsync({ competitorId, data: formData });
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors/${competitorId}`);
    } catch (error) {
      console.error('Error updating competitor:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to update competitor';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors/${competitorId}`);
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading competitor for editing...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError || !competitorResponse?.data) {
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
                    Error Loading Competitor
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                    {error?.message || 'Failed to load competitor details for editing. Please try again.'}
                  </p>
                  <Button
                    onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors`)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Competitors
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Competitor</h1>
                <p className="text-gray-600 dark:text-gray-400">Update competitor for PDA Document {pdaDocumentId}</p>
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
                    Competitor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter competitor name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strengths">Strengths</Label>
                  <Textarea
                    id="strengths"
                    value={formData.strengths || ''}
                    onChange={(e) => handleInputChange('strengths', e.target.value)}
                    placeholder="Enter competitor strengths (optional)"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weaknesses">Weaknesses</Label>
                  <Textarea
                    id="weaknesses"
                    value={formData.weaknesses || ''}
                    onChange={(e) => handleInputChange('weaknesses', e.target.value)}
                    placeholder="Enter competitor weaknesses (optional)"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter additional notes (optional)"
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
                        Update Competitor
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

