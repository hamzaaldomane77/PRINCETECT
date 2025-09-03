'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon, BuildingIcon } from '@/components/ui/icons';
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
import { useDepartment, useDeleteDepartment } from '@/modules/departments';
import { toast } from 'sonner';


export default function DepartmentDetailsPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const departmentId = parseInt(params.id as string);

  const breadcrumbItems = [
    { label: 'Basic Data Management', href: '/super-admin/basic-data-management' },
    { label: 'Departments', href: '/super-admin/basic-data-management/departments' },
    { label: 'Department Details' }
  ];

  // Fetch department details
  const { 
    data: currentDepartment, 
    isLoading, 
    error, 
    refetch 
  } = useDepartment(departmentId);

  // Delete mutation
  const deleteDepartmentMutation = useDeleteDepartment();

  const handleEdit = () => {
    router.push(`/super-admin/basic-data-management/departments/${departmentId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDepartmentMutation.mutateAsync(departmentId);
      toast.success('Department deleted successfully!');
      router.push('/super-admin/basic-data-management/departments');
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.error('Failed to delete department. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    router.push('/super-admin/basic-data-management/departments');
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
                  <div className="text-lg text-gray-600 dark:text-gray-400">Loading department details...</div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !currentDepartment) {
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
                    Department Not Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    The requested department could not be found or an error occurred while loading.
                  </p>
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Departments
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
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <Button onClick={handleBack} variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentDepartment.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Department Details and Information
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleEdit}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit Department
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Department
                </Button>
              </div>
            </div>

            {/* Department Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Department Name
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {currentDepartment.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge 
                          variant={currentDepartment.is_active ? "default" : "secondary"}
                          className={currentDepartment.is_active 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          }
                        >
                          {currentDepartment.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Department Code
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono">
                        {currentDepartment.code}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Manager
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {currentDepartment.manager?.name || 'No manager assigned'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Description */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Description
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentDepartment.description || 'No description provided.'}
                  </p>
                </Card>

                {/* Notes */}
                {currentDepartment.notes && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Notes
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentDepartment.notes}
                    </p>
                  </Card>
                )}
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                {/* Department Icon */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Department Icon
                  </h2>
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <BuildingIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </Card>

                {/* Timestamps */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Timestamps
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created At
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(currentDepartment.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {currentDepartment.updated_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Last Updated
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(currentDepartment.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Department ID */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Department ID
                  </h2>
                  <p className="text-gray-900 dark:text-white font-mono text-lg">
                    #{currentDepartment.id}
                  </p>
                </Card>

                {/* Manager Information */}
                {currentDepartment.manager && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Manager Information
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Manager Name
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {currentDepartment.manager.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Manager ID
                        </label>
                        <p className="text-gray-900 dark:text-white font-mono">
                          #{currentDepartment.manager.id}
                        </p>
                      </div>
                    </div>
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
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{currentDepartment.name}"? This action cannot be undone.
                All associated data with this department will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteDepartmentMutation.isPending}
              >
                {deleteDepartmentMutation.isPending ? 'Deleting...' : 'Delete Department'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}
