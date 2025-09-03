'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeftIcon, PlusIcon, MapPinIcon } from '@/components/ui/icons';
import { useCreateCity } from '@/modules/cities';
import { toast } from 'sonner';

export default function CreateCityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    notes: '',
    is_active: true,
  });

  const createCityMutation = useCreateCity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createCityMutation.mutateAsync(formData);
      toast.success('City created successfully!');
      router.push('/super-admin/basic-data-management/cities');
    } catch (error) {
      console.error('Failed to create city:', error);
      toast.error('Failed to create city. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-white dark:bg-gray-900">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New City</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new city to your locations</p>
              </div>
              <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-auto">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    City Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter the details of the new city below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5" />
                        City Details
                      </CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Basic information about the city
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-4 pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.back()} 
                      disabled={createCityMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createCityMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {createCityMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create City
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
