'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { useEmployeeType, useUpdateEmployeeType } from '@/modules/employee-types';
import { UpdateEmployeeTypeRequest, UpdateEmployeeTypeApiRequest } from '@/modules/employee-types/types';
import { toast } from 'sonner';

interface EditEmployeeTypePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEmployeeTypePage({ params }: EditEmployeeTypePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const employeeTypeId = parseInt(resolvedParams.id);

  const [formData, setFormData] = useState<UpdateEmployeeTypeRequest>({
    name: '',
    code: '',
    description: '',
    is_active: true,
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  // Fetch employee type data
  const { data: employeeType, isLoading, error } = useEmployeeType(employeeTypeId);
  const updateEmployeeTypeMutation = useUpdateEmployeeType();

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Employee Types', href: '/super-admin/employee-management/employee-types' },
    { label: employeeType?.name || 'Edit Employee Type' },
    { label: 'Edit' }
  ];

  // Update form data when employee type is loaded
  useEffect(() => {
    if (employeeType) {
      setFormData({
        name: employeeType.name,
        code: employeeType.code,
        description: employeeType.description || '',
        is_active: employeeType.is_active,
        notes: employeeType.notes || '',
      });
    }
  }, [employeeType]);

  const handleInputChange = (field: keyof UpdateEmployeeTypeRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform data to match API requirements
      const apiData: UpdateEmployeeTypeApiRequest = {
        ...formData,
        is_active: formData.is_active ? 1 : 0  // Convert boolean to number
      };

      await updateEmployeeTypeMutation.mutateAsync({
        id: employeeTypeId,
        data: apiData as any  // Type assertion for API compatibility
      });
      
      toast.success('Employee type updated successfully!');
      router.push('/super-admin/employee-management/employee-types');
    } catch (error) {
      console.error('Failed to update employee type:', error);
      toast.error('Failed to update employee type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-white dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading employee type data...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !employeeType) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-white dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error Loading Employee Type
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4 text-center">
                  {error?.message || 'The requested employee type could not be found.'}
                </p>
                <Button
                  onClick={() => router.push('/super-admin/employee-management/employee-types')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Back to List
                </Button>
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
        <div className="h-full bg-white dark:bg-gray-900">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Employee Type</h1>
                <p className="text-gray-600 dark:text-gray-400">Update employee type data for &quot;{employeeType.name}&quot;</p>
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
                  <Breadcrumb items={breadcrumbItems} />
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Update Employee Type Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Edit the data below and click save changes
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Employee Type Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Employee Type Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter employee type name"
                          required
                          className="h-11"
                        />
                      </div>

                      {/* Employee Type Code */}
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Employee Type Code *
                        </Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => handleInputChange('code', e.target.value)}
                          placeholder="Example: PERMANENT, CONTRACTOR"
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enter a description of the employee type</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Employee Type Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter a description of the employee type..."
                        rows={4}
                        className="resize-none"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Additional notes and employee type status</p>
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
                            Employee Type Status
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Enable or disable the employee type
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
                      disabled={loading || updateEmployeeTypeMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || updateEmployeeTypeMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {(loading || updateEmployeeTypeMutation.isPending) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <SaveIcon className="h-4 w-4 mr-2" />
                          Save Changes
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
