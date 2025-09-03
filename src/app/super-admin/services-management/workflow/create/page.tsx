'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, PlusIcon } from '@/components/ui/icons';
import { useCreateServiceWorkflow, useServicesLookup } from '@/modules/service-workflows';
import { CreateServiceWorkflowRequest } from '@/modules/service-workflows/types';
import { toast } from 'sonner';

export default function CreateWorkflowPage() {
  const router = useRouter();
  const createWorkflowMutation = useCreateServiceWorkflow();

  // Fetch services lookup data
  const { data: services = [], isLoading: servicesLoading } = useServicesLookup();

  const [formData, setFormData] = useState<CreateServiceWorkflowRequest>({
    service_id: 0,
    name: '',
    description: '',
    is_default: false,
    is_active: true,
    estimated_duration_days: 1,
    notes: '',
  });

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Workflow Management', href: '/super-admin/services-management/workflow' },
    { label: 'Create Workflow' }
  ];

  const handleInputChange = (field: keyof CreateServiceWorkflowRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createWorkflowMutation.mutateAsync(formData);
      toast.success('Workflow created successfully!');
      router.push('/super-admin/services-management/workflow');
    } catch (error) {
      console.error('Failed to create workflow:', error);
      toast.error('Failed to create workflow. Please try again.');
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Workflow</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new workflow for service processes</p>
              </div>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Workflow Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter the details of the new workflow below
                </p>
              </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                      {/* Service */}
                      <div className="space-y-2">
                        <Label htmlFor="service" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Service *
                        </Label>
                        <Select
                          value={formData.service_id ? formData.service_id.toString() : ''}
                          onValueChange={(value) => handleInputChange('service_id', parseInt(value))}
                          disabled={servicesLoading}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={servicesLoading ? "Loading services..." : "Select service"} />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.value} value={service.value.toString()}>
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  </div>

                  {/* Description Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enter a detailed description of the workflow</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Workflow Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter a detailed description of the workflow..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Additional notes and workflow settings</p>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Additional Notes
                        </Label>
                        <Textarea
                          id="notes"
                          value={formData.notes || ''}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Enter any additional notes (optional)..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      {/* Status Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label htmlFor="is_default" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Default Workflow
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Set as default workflow for the service
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
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={createWorkflowMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createWorkflowMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {createWorkflowMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Workflow
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
