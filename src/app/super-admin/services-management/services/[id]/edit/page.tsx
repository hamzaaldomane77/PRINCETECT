'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { useService, useUpdateService } from '@/modules/services';
import { Service, UpdateServiceRequest } from '@/modules/services/types';
import { toast } from 'sonner';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = parseInt(params.id as string);

  const [formData, setFormData] = useState<UpdateServiceRequest>({
    name: '',
    description: '',
    department_id: 0,
    service_category_id: 0,
    base_price: '',
    currency: 'SAR',
    features: [],
    delivery_time_days: 0,
    notes: '',
    is_active: true
  });

  const [loading, setLoading] = useState(false);

  // Fetch service data
  const { data: service, isLoading, error } = useService(serviceId);
  const updateServiceMutation = useUpdateService();

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Services', href: '/super-admin/services-management/services' },
    { label: 'Edit Service' }
  ];

  // Update form data when service is loaded
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        department_id: service.department_id,
        service_category_id: service.service_category_id,
        base_price: service.base_price,
        currency: service.currency,
        features: service.features || [],
        delivery_time_days: service.delivery_time_days,
        notes: service.notes || '',
        is_active: service.is_active
      });
    }
  }, [service]);

  const handleInputChange = (field: keyof UpdateServiceRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateServiceMutation.mutateAsync({
        id: serviceId,
        data: formData
      });
      
      toast.success('Service updated successfully!');
      router.push('/super-admin/services-management/services');
    } catch (error) {
      console.error('Failed to update service:', error);
      toast.error('Failed to update service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Loading service...</p>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !service) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Service</h3>
              <p className="text-gray-600 mb-4">
                {error?.message || 'Service not found'}
              </p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Service</h1>
              <p className="text-gray-600 dark:text-gray-400">Update service information</p>
            </div>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </div>

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
              <CardDescription>Update the service details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter service name"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter service description"
                      required
                    />
                  </div>

                  {/* Department ID */}
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department ID *</Label>
                    <Input
                      id="department_id"
                      type="number"
                      value={formData.department_id}
                      onChange={(e) => handleInputChange('department_id', parseInt(e.target.value))}
                      placeholder="Enter department ID"
                      required
                    />
                  </div>

                  {/* Service Category ID */}
                  <div className="space-y-2">
                    <Label htmlFor="service_category_id">Service Category ID *</Label>
                    <Input
                      id="service_category_id"
                      type="number"
                      value={formData.service_category_id}
                      onChange={(e) => handleInputChange('service_category_id', parseInt(e.target.value))}
                      placeholder="Enter service category ID"
                      required
                    />
                  </div>

                  {/* Base Price */}
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Base Price *</Label>
                    <Input
                      id="base_price"
                      type="number"
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) => handleInputChange('base_price', e.target.value)}
                      placeholder="Enter base price"
                      required
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      placeholder="Enter currency (e.g., SAR, USD)"
                      required
                    />
                  </div>

                  {/* Delivery Time */}
                  <div className="space-y-2">
                    <Label htmlFor="delivery_time_days">Delivery Time (Days) *</Label>
                    <Input
                      id="delivery_time_days"
                      type="number"
                      value={formData.delivery_time_days}
                      onChange={(e) => handleInputChange('delivery_time_days', parseInt(e.target.value))}
                      placeholder="Enter delivery time in days"
                      required
                    />
                  </div>

                  {/* Active Status */}
                  <div className="space-y-2">
                    <Label htmlFor="is_active">Active Status</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">Service is active</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter additional notes (optional)"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Service'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

