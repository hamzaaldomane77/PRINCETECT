'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { useGoal, useDeleteGoal } from '@/modules/pda-documents/hooks/use-goals';
import { toast } from 'sonner';
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

export default function GoalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const pdaDocumentId = parseInt(params.id as string);
  const goalId = parseInt(params.goalId as string);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: 'Document Details', href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Goals', href: `/super-admin/pda-documents/${pdaDocumentId}/goals` },
    { label: 'Goal Details' }
  ];

  const { data: goalResponse, isLoading, error } = useGoal(pdaDocumentId, goalId);
  const goal = goalResponse?.data;

  const deleteGoalMutation = useDeleteGoal(pdaDocumentId);

  const handleEdit = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/goals/${goalId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteGoalMutation.mutateAsync(goalId);
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/goals`);
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';
      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this goal.');
      } else {
        toast.error('Failed to delete goal. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/goals`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading goal details...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !goal) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error Loading Goal
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {(error as Error)?.message || 'Goal not found'}
                </p>
                <Button
                  onClick={handleBack}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Goals
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
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Goal Details
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View goal information
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={handleEdit}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                >
                  <EditIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Goal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Goal ID
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{goal.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Goal Title
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{goal.goal_title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </label>
                    <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                      {goal.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Timestamps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created At
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {formatDate(goal.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Updated At
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {formatDate(goal.updated_at)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this goal?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteGoalMutation.isPending}
              >
                {deleteGoalMutation.isPending ? 'Deleting...' : 'Delete Goal'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

