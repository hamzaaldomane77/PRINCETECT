'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon, UsersIcon, SettingsIcon, BuildingIcon, TagIcon, FileTextIcon, CalendarIcon, HashIcon, BriefcaseIcon, HomeIcon, MailIcon, PhoneIcon } from '@/components/ui/icons';
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
import { useEmployee, useDeleteEmployee } from '@/modules/employees';
import { getEmployeePhotoUrl } from '@/lib/image-utils';
import { toast } from 'sonner';

interface EmployeeDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EmployeeDetailsPage({ params }: EmployeeDetailsPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const employeeId = parseInt(resolvedParams.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if ID is valid
  if (isNaN(employeeId) || employeeId <= 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Invalid Employee ID
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4 text-center">
                  The employee ID provided is not valid.
                </p>
                <Button
                  onClick={() => router.push('/super-admin/employee-management/employees')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Back to Employees
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  // Fetch employee data
  const {
    data: employee,
    isLoading,
    error,
    refetch,
    isError,
    isPending,
    isRefetching
  } = useEmployee(employeeId);

  const deleteEmployeeMutation = useDeleteEmployee();

  const breadcrumbItems = [
    { label: 'Employee Management', href: '/super-admin/employee-management' },
    { label: 'Employees', href: '/super-admin/employee-management/employees' },
    { label: employee?.name || 'Employee Details' }
  ];

  // Function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Function to get gender badge color
  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'female':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Function to get marital status badge color
  const getMaritalStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'married':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'single':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'divorced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'widowed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleBack = () => {
    router.push('/super-admin/employee-management/employees');
  };

  const handleEdit = () => {
    router.push(`/super-admin/employee-management/employees/${employeeId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployeeMutation.mutateAsync(employeeId);
      toast.success('Employee deleted successfully!');
      router.push('/super-admin/employee-management/employees');
    } catch (error) {
      // Handle specific error cases
      const errorMsg = (error as Error)?.message || '';
      
      if (errorMsg === 'EMPLOYEE_HAS_RECORDS' || 
          errorMsg.includes('existing records') ||
          errorMsg.includes('Cannot delete')) {
        setErrorMessage('Cannot delete this employee because they have existing records in the system.');
        setErrorDialogOpen(true);
      } else if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this employee.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Employee not found. They may have been already deleted.');
      } else {
        toast.error('Failed to delete employee. Please try again.');
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
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading employee details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !employee) {
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
                    Employee Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested employee could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Employees
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
              
                {/* Employee Avatar */}
                <div className="flex items-center space-x-4">
                  {employee.photo ? (
                    <img
                      src={getEmployeePhotoUrl(employee.photo) || ''}
                      alt={employee.name}
                      className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg dark:border-gray-800"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg ${employee.photo ? 'hidden' : 'flex'}`}
                  >
                    {employee.name
                      .split(' ')
                      .map(word => word.charAt(0))
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {employee.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {employee.job_title.name} • {employee.department.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Employee ID: {employee.employee_id}
                    </p>
                  </div>
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
                      Personal Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Core employee details and personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.name}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <HashIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee ID</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.employee_id}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</span>
                        </div>
                        <Badge className={getGenderBadgeColor(employee.gender)}>
                          {employee.gender === 'male' ? 'Male' : 'Female'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Marital Status</span>
                        </div>
                        <Badge className={getMaritalStatusBadgeColor(employee.marital_status)}>
                          {employee.marital_status.charAt(0).toUpperCase() + employee.marital_status.slice(1)}
                        </Badge>
                      </div>

                      {employee.birth_date && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Birth Date</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {new Date(employee.birth_date).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      )}

                      {employee.address && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <HomeIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {employee.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Work Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700 mt-6">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5" />
                      Work Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Employee work details and position information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.job_title.name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.department.name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee Type</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.employee_type.name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Hire Date</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(employee.hire_date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    {employee.team_name && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Team</span>
                        <p className="text-gray-700 dark:text-gray-300">
                          {employee.team_name}
                        </p>
                      </div>
                    )}
                    {employee.job_description && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Description</span>
                        <p className="text-gray-700 dark:text-gray-300">
                          {employee.job_description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="dark:bg-gray-800 dark:border-gray-700 mt-6">
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Employee contact details and emergency contacts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Email</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.work_email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Work Mobile</span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.work_mobile}
                        </p>
                      </div>
                      {employee.personal_email && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Email</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {employee.personal_email}
                          </p>
                        </div>
                      )}
                      {employee.personal_mobile && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Mobile</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {employee.personal_mobile}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {(employee.emergency_contact_name || employee.emergency_contact_number) && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {employee.emergency_contact_name && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Name</span>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {employee.emergency_contact_name}
                              </p>
                            </div>
                          )}
                          {employee.emergency_contact_number && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</span>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {employee.emergency_contact_number}
                              </p>
                            </div>
                          )}
                          {employee.emergency_contact_relationship && (
                            <div className="space-y-2">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Relationship</span>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {employee.emergency_contact_relationship}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee Status</span>
                      <Badge className={getStatusBadgeColor(employee.status)}>
                        {employee.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* City Information */}
                {employee.city && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <BuildingIcon className="h-5 w-5" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">City</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {employee.city.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                        {new Date(employee.created_at).toLocaleDateString('en-US', {
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
                        {new Date(employee.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {employee.last_login_at && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(employee.last_login_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes */}
                {employee.notes && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white flex items-center gap-2">
                        <FileTextIcon className="h-5 w-5" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {employee.notes}
                      </p>
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
                Are you sure you want to delete the employee "{employee?.name}"? 
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteEmployeeMutation.isPending}
              >
                {deleteEmployeeMutation.isPending ? 'Deleting...' : 'Delete Employee'}
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
