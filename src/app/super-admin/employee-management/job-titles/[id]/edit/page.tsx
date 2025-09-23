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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeftIcon, SaveIcon } from '@/components/ui/icons';
import { useJobTitle, useUpdateJobTitle, useDepartmentsLookup } from '@/modules/job-titles';
import { UpdateJobTitleRequest, UpdateJobTitleApiRequest } from '@/modules/job-titles/types';
import { toast } from 'sonner';

interface EditJobTitlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditJobTitlePage({ params }: EditJobTitlePageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const jobTitleId = parseInt(resolvedParams.id);

  const [formData, setFormData] = useState<UpdateJobTitleRequest>({
    name: '',
    code: '',
    department_id: 0,
    description: '',
    level: 'junior',
    is_active: true,
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  // Fetch job title data and lookup data
  const { data: jobTitle, isLoading, error } = useJobTitle(jobTitleId);
  const { data: departments = [], isLoading: departmentsLoading } = useDepartmentsLookup();
  const updateJobTitleMutation = useUpdateJobTitle();

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Job Titles', href: '/super-admin/employee-management/job-titles' },
    { label: jobTitle?.name || 'Edit Job Title' },
    { label: 'Edit' }
  ];

  // Update form data when job title is loaded
  useEffect(() => {
    if (jobTitle) {
      setFormData({
        name: jobTitle.name,
        code: jobTitle.code,
        department_id: jobTitle.department_id,
        description: jobTitle.description,
        level: jobTitle.level,
        is_active: jobTitle.is_active,
        notes: jobTitle.notes || '',
      });
    }
  }, [jobTitle]);

  const handleInputChange = (field: keyof UpdateJobTitleRequest, value: any) => {
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
      const apiData: UpdateJobTitleApiRequest = {
        ...formData,
        is_active: formData.is_active ? 1 : 0  // Convert boolean to number
      };

      await updateJobTitleMutation.mutateAsync({
        id: jobTitleId,
        data: apiData as any  // Type assertion for API compatibility
      });
      
      toast.success('Job title updated successfully!');
      router.push('/super-admin/employee-management/job-titles');
    } catch (error) {
      console.error('Failed to update job title:', error);
      toast.error('Failed to update job title. Please try again.');
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
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading job title data...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !jobTitle) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-white dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error Loading Job Title
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4 text-center">
                  {error?.message || 'The requested job title could not be found.'}
                </p>
                <Button
                  onClick={() => router.push('/super-admin/employee-management/job-titles')}
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Job Title</h1>
                <p className="text-gray-600 dark:text-gray-400">Update job title data for &quot;{jobTitle.name}&quot;</p>
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
                    Update Job Title Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Edit the data below and click save changes
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Job Title Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Job Title Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter job title name"
                          required
                          className="h-11"
                        />
                      </div>

                      {/* Job Title Code */}
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Job Title Code *
                        </Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => handleInputChange('code', e.target.value)}
                          placeholder="Example: DIGITAL_MARKETING_SPECIALIST"
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

                      {/* Level */}
                      <div className="space-y-2">
                        <Label htmlFor="level" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Job Level *
                        </Label>
                        <Select
                          value={formData.level}
                          onValueChange={(value) => handleInputChange('level', value as 'junior' | 'senior' | 'manager' | 'director')}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select job level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description & Tasks</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enter a detailed description of the job title and its tasks</p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Job Title Description *
                        </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter a detailed description of the job title and its responsibilities..."
                        rows={4}
                        required
                        className="resize-none"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="space-y-6">
                    <div className="pb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Additional notes and job title status</p>
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
                            Job Title Status
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Enable or disable the job title
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
                      disabled={loading || updateJobTitleMutation.isPending}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || updateJobTitleMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {(loading || updateJobTitleMutation.isPending) ? (
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
