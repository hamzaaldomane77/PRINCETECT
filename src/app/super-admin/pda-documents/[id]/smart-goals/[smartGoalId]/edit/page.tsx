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
import { useSmartGoal, useUpdateSmartGoal, UpdateSmartGoalRequest } from '@/modules/pda-documents/hooks/use-smart-goals';
import { toast } from 'sonner';

export default function EditSmartGoalPage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);
  const smartGoalId = parseInt(params.smartGoalId as string);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: smartGoalResponse, isLoading, isError, error } = useSmartGoal(pdaDocumentId, smartGoalId);
  const updateSmartGoalMutation = useUpdateSmartGoal(pdaDocumentId);

  const [formData, setFormData] = useState<UpdateSmartGoalRequest>({
    goal_title: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    time_bound: ''
  });

  useEffect(() => {
    if (smartGoalResponse?.data) {
      setFormData({
        goal_title: smartGoalResponse.data.goal_title,
        specific: smartGoalResponse.data.specific || '',
        measurable: smartGoalResponse.data.measurable || '',
        achievable: smartGoalResponse.data.achievable || '',
        relevant: smartGoalResponse.data.relevant || '',
        time_bound: smartGoalResponse.data.time_bound || ''
      });
    }
  }, [smartGoalResponse]);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Smart Goals', href: `/super-admin/pda-documents/${pdaDocumentId}/smart-goals` },
    { label: `Smart Goal ${smartGoalId}`, href: `/super-admin/pda-documents/${pdaDocumentId}/smart-goals/${smartGoalId}` },
    { label: 'Edit Smart Goal' }
  ];

  const handleInputChange = (field: keyof UpdateSmartGoalRequest, value: any) => {
    setFormData((prev: UpdateSmartGoalRequest) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.goal_title?.trim()) {
        toast.error('Goal Title is required.');
        setIsSubmitting(false);
        return;
      }

      await updateSmartGoalMutation.mutateAsync({ smartGoalId, data: formData });
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/smart-goals/${smartGoalId}`);
    } catch (error) {
      console.error('Error updating smart goal:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to update smart goal';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/smart-goals/${smartGoalId}`);
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading smart goal for editing...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError || !smartGoalResponse?.data) {
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
                    Error Loading Smart Goal
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                    {error?.message || 'Failed to load smart goal details for editing. Please try again.'}
                  </p>
                  <Button
                    onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}/smart-goals`)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Smart Goals
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Smart Goal</h1>
                <p className="text-gray-600 dark:text-gray-400">Update SMART goal for PDA Document {pdaDocumentId}</p>
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
                    value={formData.goal_title || ''}
                    onChange={(e) => handleInputChange('goal_title', e.target.value)}
                    placeholder="Enter goal title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specific">Specific</Label>
                    <Textarea
                      id="specific"
                      value={formData.specific || ''}
                      onChange={(e) => handleInputChange('specific', e.target.value)}
                      placeholder="What do you want to accomplish?"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="measurable">Measurable</Label>
                    <Textarea
                      id="measurable"
                      value={formData.measurable || ''}
                      onChange={(e) => handleInputChange('measurable', e.target.value)}
                      placeholder="How will you measure progress?"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievable">Achievable</Label>
                    <Textarea
                      id="achievable"
                      value={formData.achievable || ''}
                      onChange={(e) => handleInputChange('achievable', e.target.value)}
                      placeholder="Is this goal realistic?"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relevant">Relevant</Label>
                    <Textarea
                      id="relevant"
                      value={formData.relevant || ''}
                      onChange={(e) => handleInputChange('relevant', e.target.value)}
                      placeholder="Why is this goal important?"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_bound">Time Bound</Label>
                  <Textarea
                    id="time_bound"
                    value={formData.time_bound || ''}
                    onChange={(e) => handleInputChange('time_bound', e.target.value)}
                    placeholder="When will you achieve this goal?"
                    rows={3}
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
                        Update Smart Goal
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

