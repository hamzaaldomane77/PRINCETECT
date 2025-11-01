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
import { useCreateGoal } from '@/modules/pda-documents/hooks/use-goals';
import { CreateGoalRequest } from '@/modules/pda-documents/types/goals';
import { toast } from 'sonner';

export default function CreateGoalPage() {
  const params = useParams();
  const router = useRouter();
  const pdaDocumentId = parseInt(params.id as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateGoalRequest>({
    goal_title: '',
    description: ''
  });

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: 'Document Details', href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Goals', href: `/super-admin/pda-documents/${pdaDocumentId}/goals` },
    { label: 'Create Goal' }
  ];

  const createMutation = useCreateGoal(pdaDocumentId);

  const handleInputChange = (field: keyof CreateGoalRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.goal_title.trim()) {
        toast.error('Please enter a goal title');
        setIsSubmitting(false);
        return;
      }

      await createMutation.mutateAsync(formData);
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/goals`);
    } catch (error) {
      console.error('Error creating goal:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to create goal';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/goals`);
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Goal</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new goal to the document</p>
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
                  <Label htmlFor="goal_title">
                    Goal Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="goal_title"
                    value={formData.goal_title}
                    onChange={(e) => handleInputChange('goal_title', e.target.value)}
                    placeholder="Enter goal title..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter goal description (optional)..."
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
                        Create Goal
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

