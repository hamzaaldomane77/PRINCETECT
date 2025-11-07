'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, SaveIcon, WorkflowIcon } from '@/components/ui/icons';
import { useServiceWorkflow, useUpdateServiceWorkflow } from '@/modules/service-workflows';
import { UpdateServiceWorkflowRequest } from '@/modules/service-workflows/types';
import { toast } from 'sonner';

export default function EditWorkflowPage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = parseInt(params.id as string);

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Workflow Management', href: '/super-admin/services-management/workflow' },
    { label: 'Edit Workflow' }
  ];

  // Fetch workflow details
  const { data: currentWorkflow, isLoading, error } = useServiceWorkflow(workflowId);
  const updateWorkflow = useUpdateServiceWorkflow();

  const [formData, setFormData] = useState<UpdateServiceWorkflowRequest>({
    name: '',
    description: '',
    is_default: false,
    is_active: true,
    estimated_duration_days: 1,
    notes: '',
  });

  // Populate form data when workflow is loaded
  useEffect(() => {
    if (currentWorkflow) {
      setFormData({
        name: currentWorkflow.name || '',
        description: currentWorkflow.description || '',
        is_default: currentWorkflow.is_default ?? false,
        is_active: currentWorkflow.is_active ?? true,
        estimated_duration_days: currentWorkflow.estimated_duration_days || 1,
        notes: currentWorkflow.notes || '',
      });
    }
  }, [currentWorkflow]);

  const handleInputChange = (field: keyof UpdateServiceWorkflowRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateWorkflow.mutateAsync({ id: workflowId, data: formData });
      toast.success('Workflow updated successfully!');
      router.push('/super-admin/services-management/workflow');
    } catch (error: any) {
      console.error('Failed to update workflow:', error);
      
      // Check if error is due to duplicate default workflow
      const errorMessage = error?.response?.data?.message || error?.message || '';
      const isDuplicateDefaultError = 
        errorMessage.includes('Duplicate entry') &&
        errorMessage.includes('unique_default_workflow_per_service');
      
      if (isDuplicateDefaultError) {
        toast.error('A default workflow already exists for this service. Please uncheck "Default Workflow" or edit the existing default workflow first.');
      } else {
        toast.error('Failed to update workflow. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading workflow details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !currentWorkflow) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Workflow Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested workflow could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={() => router.back()} variant="outline">
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
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Workflow</h1>
                <p className="text-gray-600 dark:text-gray-400">Update workflow information</p>
              </div>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Workflows
              </Button>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <WorkflowIcon className="h-5 w-5" />
                  Edit Workflow
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Update the workflow details below
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Workflow Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Workflow Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter workflow name"
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="estimated_duration_days" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estimated Duration (Days) *
                    </Label>
                    <Input
                      id="estimated_duration_days"
                      type="number"
                      min="1"
                      value={formData.estimated_duration_days || ''}
                      onChange={(e) => handleInputChange('estimated_duration_days', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter workflow description..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter additional notes..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Status Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Default Status */}
                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex-1">
                      <Label htmlFor="is_default" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Default Workflow
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Set as default workflow for the service
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">
                        ⚠️ Note: Only one default workflow allowed per service
                      </p>
                    </div>
                    <Switch
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => handleInputChange('is_default', checked)}
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Workflow Status
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enable or disable the workflow
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={updateWorkflow.isPending}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateWorkflow.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                  >
                    {updateWorkflow.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Update Workflow
                      </>
                    )}
                  </Button>
                </div>
                </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
