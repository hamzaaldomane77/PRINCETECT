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
import { ArrowLeftIcon, PlusIcon, BuildingIcon } from '@/components/ui/icons';
import { useCreateDepartment } from '@/modules/departments';
import { toast } from 'sonner';

export default function CreateDepartmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    manager_id: null,
    is_active: true,
  });

  const createDepartmentMutation = useCreateDepartment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createDepartmentMutation.mutateAsync(formData);
      toast.success('Department created successfully!');
      router.push('/super-admin/basic-data-management/departments');
    } catch (error) {
      console.error('Failed to create department:', error);
      toast.error('Failed to create department. Please try again.');
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Department</h1>
                <p className="text-gray-600 dark:text-gray-400">Add a new department to organize your organization</p>
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
                    Department Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter the details of the new department below
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <BuildingIcon className="h-5 w-5" />
                        Department Details
                      </CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Basic information about the department
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="dark:text-white">
                            Department Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="e.g., Sales Department"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="code" className="dark:text-white">
                            Department Code <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="code"
                            type="text"
                            placeholder="e.g., SALES"
                            value={formData.code}
                            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="dark:text-white">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the department's role and responsibilities..."
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
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
                          Active Department
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-4 pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.back()} 
                      disabled={createDepartmentMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createDepartmentMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {createDepartmentMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Department
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
