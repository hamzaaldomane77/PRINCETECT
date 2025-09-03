'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeftIcon, SaveIcon, MapPinIcon } from '@/components/ui/icons';
import { useCity, useUpdateCity } from '@/modules/cities';
import { toast } from 'sonner';

export default function EditCityPage() {
  const router = useRouter();
  const params = useParams();
  const cityId = parseInt(params.id as string);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    notes: '',
    is_active: true,
  });

  const breadcrumbItems = [
    { label: 'Basic Data Management', href: '/super-admin/basic-data-management' },
    { label: 'Cities', href: '/super-admin/basic-data-management/cities' },
    { label: 'Edit City' }
  ];

  // Fetch city details
  const { 
    data: currentCity, 
    isLoading, 
    error 
  } = useCity(cityId);

  // Update mutation
  const updateCityMutation = useUpdateCity();

  // Populate form when city data is loaded
  useEffect(() => {
    if (currentCity) {
      setFormData({
        name: currentCity.name || '',
        code: currentCity.code || '',
        country: currentCity.country || '',
        notes: currentCity.notes || '',
        is_active: currentCity.is_active ?? true,
      });
    }
  }, [currentCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateCityMutation.mutateAsync({
        id: cityId,
        data: formData
      });
      toast.success('City updated successfully!');
      router.push('/super-admin/basic-data-management/cities');
    } catch (error) {
      console.error('Failed to update city:', error);
      toast.error('Failed to update city. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    router.push('/super-admin/basic-data-management/cities');
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
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading city details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !currentCity) {
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
                    City Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested city could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Cities
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleBack} variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Edit City: {currentCity.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update city information and details
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="w-full">
              <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5" />
                      City Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Update the city details below
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="dark:text-white">
                          City Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="e.g., Damascus"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="code" className="dark:text-white">
                          City Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="code"
                          type="text"
                          placeholder="e.g., DAM"
                          value={formData.code}
                          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="dark:text-white">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="country"
                          type="text"
                          placeholder="e.g., Syria"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="dark:text-white">
                          Notes
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Add any additional notes about the city..."
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          rows={4}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                        />
                        <Label htmlFor="is_active" className="dark:text-white">
                          Active City
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack} 
                    disabled={updateCityMutation.isPending}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateCityMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                  >
                    {updateCityMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="h-4 w-4 mr-2" />
                        Update City
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