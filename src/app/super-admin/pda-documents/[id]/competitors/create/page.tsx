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
import { useCreateCompetitor } from '@/modules/pda-documents/hooks/use-competitors';
import { CreateCompetitorRequest } from '@/modules/pda-documents/types/competitors';
import { toast } from 'sonner';

export default function CreateCompetitorPage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateCompetitorRequest>({
    name: '',
    strengths: '',
    weaknesses: '',
    notes: ''
  });

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Competitors', href: `/super-admin/pda-documents/${pdaDocumentId}/competitors` },
    { label: 'Create Competitor' }
  ];

  const createCompetitorMutation = useCreateCompetitor(pdaDocumentId);

  const handleInputChange = (field: keyof CreateCompetitorRequest, value: any) => {
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
        toast.error('Competitor Name is required.');
        setIsSubmitting(false);
        return;
      }

      await createCompetitorMutation.mutateAsync(formData);
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors`);
    } catch (error) {
      console.error('Error creating competitor:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create competitor';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors`);
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Competitor</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new competitor for PDA Document {pdaDocumentId}</p>
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
                    value={formData.name}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Create Competitor
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

