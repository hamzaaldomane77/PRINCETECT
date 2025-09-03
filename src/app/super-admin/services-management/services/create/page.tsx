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
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, PlusIcon } from '@/components/ui/icons';
import { useCreateService, useServiceCategoriesLookup, useDepartmentsLookup, useCurrenciesLookup } from '@/modules/services';
import { CreateServiceRequest } from '@/modules/services/types';
import { toast } from 'sonner';

export default function CreateServicePage() {
  const router = useRouter();
  const createServiceMutation = useCreateService();

  // Fetch lookup data
  const { data: categories = [], isLoading: categoriesLoading } = useServiceCategoriesLookup();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartmentsLookup();
  const { data: currencies = [], isLoading: currenciesLoading } = useCurrenciesLookup();

  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: '',
    description: '',
    department_id: 0,
    service_category_id: 0,
    base_price: '',
    currency: '',
    is_active: true,
    features: [],
    delivery_time_days: 30,
    notes: '',
  });

  const [newFeature, setNewFeature] = useState('');

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Services', href: '/super-admin/services-management/services' },
    { label: 'Create Service' }
  ];

  const handleInputChange = (field: keyof CreateServiceRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createServiceMutation.mutateAsync(formData);
      toast.success('Service created successfully!');
      router.push('/super-admin/services-management/services');
    } catch (error) {
      console.error('Failed to create service:', error);
      toast.error('Failed to create service. Please try again.');
    }
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-white dark:bg-gray-900">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Service</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new service to your offerings</p>
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
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Service Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter the details of the new service below
                  </p>
                </div>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="space-y-6">
                    
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Service Name */}
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Service Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter service name"
                            required
                            className="h-11"
                          />
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                          <Label htmlFor="department" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Department *
                          </Label>
                          <Select
                            value={formData.department_id ? formData.department_id.toString() : ''}
                            onValueChange={(value) => handleInputChange('department_id', parseInt(value))}
                            disabled={departmentsLoading}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={departmentsLoading ? "Loading departments..." : "Select department"} />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.value} value={dept.value.toString()}>
                                  {dept.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category *
                          </Label>
                          <Select
                            value={formData.service_category_id ? formData.service_category_id.toString() : ''}
                            onValueChange={(value) => handleInputChange('service_category_id', parseInt(value))}
                            disabled={categoriesLoading}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value.toString()}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Delivery Time */}
                        <div className="space-y-2">
                          <Label htmlFor="delivery_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Delivery Time (Days) *
                          </Label>
                          <Input
                            id="delivery_time"
                            type="number"
                            value={formData.delivery_time_days}
                            onChange={(e) => handleInputChange('delivery_time_days', parseInt(e.target.value))}
                            placeholder="30"
                            required
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-6">
                      <div className="pb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pricing</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Set the service price and currency</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Base Price */}
                        <div className="space-y-2">
                          <Label htmlFor="base_price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Base Price *
                          </Label>
                          <Input
                            id="base_price"
                            type="number"
                            step="0.01"
                            value={formData.base_price}
                            onChange={(e) => handleInputChange('base_price', e.target.value)}
                            placeholder="0.00"
                            required
                            className="h-11"
                          />
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                          <Label htmlFor="currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Currency *
                          </Label>
                          <Select
                            value={formData.currency}
                            onValueChange={(value) => handleInputChange('currency', value)}
                            disabled={currenciesLoading}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder={currenciesLoading ? "Loading currencies..." : "Select currency"} />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.value} value={currency.value.toString()}>
                                  {currency.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-6">
                      <div className="pb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Enter a detailed description of the service</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Service Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Enter a detailed description of the service..."
                          rows={4}
                          required
                          className="resize-none"
                        />
                      </div>
                    </div>

                    {/* Features Section */}
                    <div className="space-y-6">
                      <div className="pb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Features</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add service features</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add a new feature..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                            className="h-11"
                          />
                          <Button 
                            type="button" 
                            onClick={handleAddFeature} 
                            variant="outline"
                            className="h-11 px-4"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        
                        {formData.features && formData.features.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.features.map((feature, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-2 px-3 py-2 text-sm"
                              >
                                <span>{feature}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature(index)}
                                  className="text-gray-500 hover:text-red-500 transition-colors text-lg font-bold"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="space-y-6">
                      <div className="pb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Additional notes and service status</p>
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

                        {/* Active Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Service Status
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Enable or disable the service
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

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={createServiceMutation.isPending}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createServiceMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                      >
                        {createServiceMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Service
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
