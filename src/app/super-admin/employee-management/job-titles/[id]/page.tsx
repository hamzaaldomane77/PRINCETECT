'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon, UsersIcon, SettingsIcon, BuildingIcon, TagIcon, FileTextIcon, CalendarIcon, HashIcon, BriefcaseIcon, HomeIcon } from '@/components/ui/icons';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useJobTitle, useDeleteJobTitle } from '@/modules/job-titles';
import { toast } from 'sonner';

interface JobTitleDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobTitleDetailsPage({ params }: JobTitleDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const jobTitleId = parseInt(resolvedParams.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if ID is valid
  if (isNaN(jobTitleId) || jobTitleId <= 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Invalid Job Title ID
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4 text-center">
                  The job title ID provided is not valid.
                </p>
                <Button
                  onClick={() => router.push('/super-admin/employee-management/job-titles')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Back to Job Titles
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  // Fetch job title data
  const {
    data: jobTitle,
    isLoading,
    error,
    refetch,
    isError,
    isPending,
    isRefetching
  } = useJobTitle(jobTitleId);

  const deleteJobTitleMutation = useDeleteJobTitle();

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Job Titles', href: '/super-admin/employee-management/job-titles' },
    { label: jobTitle?.name || 'Job Title Details' }
  ];

  // Function to get level badge color
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'junior':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'senior':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'manager':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'director':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Function to format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  // Function to get employee status badge
  const getEmployeeStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const handleBack = () => {
    router.push('/super-admin/employee-management/job-titles');
  };

  const handleEdit = () => {
    router.push(`/super-admin/employee-management/job-titles/${jobTitleId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteJobTitleMutation.mutateAsync(jobTitleId);
      toast.success('Job title deleted successfully!');
      router.push('/super-admin/employee-management/job-titles');
    } catch (error) {
      // Handle specific error cases
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg === 'ASSIGNED_TO_EMPLOYEES' || 
          errorMsg.includes('assigned to employees') ||
          errorMsg.includes('Cannot delete')) {
        setErrorMessage('Cannot delete this job title because it is currently assigned to employees.');
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this job title.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Job title not found. It may have been already deleted.');
      } else {
        toast.error('Failed to delete job title. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading || isPending) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading job title details...</div>
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
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Job Title Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested job title could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Job Titles
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
                    {jobTitle.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Job Title Details
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="lg:col-span-2">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Core job title details and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title Name</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {jobTitle.name}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HashIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title ID</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          #{jobTitle.id}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HashIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Code</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {jobTitle.code}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</span>
                        </div>
                        <Badge className={getLevelBadgeColor(jobTitle.level)}>
                          {jobTitle.level.charAt(0).toUpperCase() + jobTitle.level.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {jobTitle.description || 'No description provided'}
                      </p>
                    </div>

                    {jobTitle.notes && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {jobTitle.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Department Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700 mt-6">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <BuildingIcon className="h-5 w-5" />
                      Department Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Details about the department this job title belongs to
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department Name</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {jobTitle.department.name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department Code</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {jobTitle.department.code}
                        </p>
                      </div>
                    </div>
                    {jobTitle.department.description && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department Description</span>
                        <p className="text-gray-700 dark:text-gray-300">
                          {jobTitle.department.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Employees List */}
                {jobTitle.employees && jobTitle.employees.length > 0 && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700 mt-6">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        Assigned Employees
                        <Badge variant="secondary" className="ml-2">
                          {jobTitle.employees.length} employee{jobTitle.employees.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Employees currently assigned to this job title
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {jobTitle.employees.map((employee) => (
                          <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 dark:text-orange-300 font-medium">
                                  {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {employee.name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {employee.employee_id}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <HomeIcon className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatPhoneNumber(employee.work_mobile)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <TagIcon className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {employee.work_email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge className={getEmployeeStatusBadge(employee.status)}>
                                {employee.status}
                              </Badge>
                              
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Status and Metadata */}
              <div className="space-y-6">
                {/* Status Card */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <TagIcon className="h-5 w-5" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title Status</span>
                      <Badge variant={jobTitle.is_active ? "default" : "secondary"}>
                        {jobTitle.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Timestamps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(jobTitle.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(jobTitle.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                {jobTitle.employees && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {jobTitle.employees.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Employees</span>
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {jobTitle.employees.filter(emp => emp.status === 'active').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive Employees</span>
                        <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {jobTitle.employees.filter(emp => emp.status === 'inactive').length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the job title "{jobTitle?.name}"? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteJobTitleMutation.isPending}
              >
                {deleteJobTitleMutation.isPending ? 'Deleting...' : 'Delete Job Title'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Cannot Delete
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </AdminLayout>
    </SuperAdminOnly>
  );
}