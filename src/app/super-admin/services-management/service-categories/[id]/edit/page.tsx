'use client';

import { useState, useEffect } from 'react';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2, RefreshCw } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useServiceCategory, useUpdateServiceCategory } from '@/modules/service-categories';
import { toast } from 'sonner';

export default function EditServiceCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);
  
  const { data: category, isLoading, error } = useServiceCategory(categoryId);
  const updateCategory = useUpdateServiceCategory();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
    notes: '',
  });

  const breadcrumbItems = [
    { label: 'Services Management', href: '/super-admin/services-management' },
    { label: 'Service Categories', href: '/super-admin/services-management/service-categories' },
    { label: 'Edit Category' }
  ];

  // Update form data when category data is loaded
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        code: category.code,
        description: category.description || '',
        is_active: category.is_active,
        notes: category.notes || '',
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateCategory.mutateAsync({ id: categoryId, data: formData });
      toast.success('Service category updated successfully!');
      router.push('/super-admin/services-management/service-categories');
    } catch (error) {
      console.error('Failed to update service category:', error);
      toast.error('Failed to update service category. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading...</span>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !category) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error?.message || 'Category not found'}
              </p>
              <Button onClick={() => router.back()}>Go Back</Button>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Service Category</h1>
              <p className="text-gray-600 dark:text-gray-400">Update service category information</p>
            </div>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </div>

          {/* Edit Form */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Service Category Information</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Update the service category details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-white">
                      Category Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Digital Marketing"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  {/* Code */}
                  <div className="space-y-2">
                    <Label htmlFor="code" className="dark:text-white">
                      Category Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      placeholder="e.g., DIGITAL_MARKETING"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                      required
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use uppercase letters, numbers, and underscores (_)
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="dark:text-white">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the category..."
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={3}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="dark:text-white">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows={2}
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active" className="dark:text-white">
                    Category is active
                  </Label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={updateCategory.isPending}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateCategory.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                  >
                    {updateCategory.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Category
                      </>
                    )}
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
