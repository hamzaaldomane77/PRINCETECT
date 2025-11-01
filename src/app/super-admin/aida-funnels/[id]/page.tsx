'use client';

import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { useAidaFunnel, useDeleteAidaFunnel } from '@/modules/aida-funnels';
import { toast } from 'sonner';
import { useState } from 'react';
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

const stageColors: Record<string, string> = {
  attention: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  interest: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  desire: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  action: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export default function AidaFunnelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const funnelId = parseInt(params.id as string);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const breadcrumbItems = [
    { label: 'AIDA Funnels', href: '/super-admin/aida-funnels' },
    { label: 'Funnel Details' }
  ];

  // Fetch funnel details
  const { data: funnelResponse, isLoading, error } = useAidaFunnel(funnelId);
  const funnel = funnelResponse?.data;

  // Delete mutation
  const deleteFunnelMutation = useDeleteAidaFunnel();

  const handleEdit = () => {
    router.push(`/super-admin/aida-funnels/${funnelId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFunnelMutation.mutateAsync(funnelId);
      router.push('/super-admin/aida-funnels');
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';
      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this funnel.');
      } else {
        toast.error('Failed to delete funnel. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    router.push('/super-admin/aida-funnels');
  };

  if (isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading funnel details...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !funnel) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error Loading Funnel
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {(error as Error)?.message || 'Funnel not found'}
                </p>
                <Button
                  onClick={handleBack}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Funnels
                </Button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  const stageUpper = funnel.stage.charAt(0).toUpperCase() + funnel.stage.slice(1);
  const stageColorClass = stageColors[funnel.stage.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';

  return (
    <SuperAdminOnly>
      <AdminLayout>
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AIDA Funnel Details
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage funnel information
                </p>
              </div>

              <div className="flex items-center space-x-3">
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
                  className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <EditIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>

            {/* Funnel Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Funnel Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Funnel ID
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{funnel.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Stage
                    </label>
                    <div className="mt-1">
                      <Badge className={stageColorClass}>
                        {stageUpper}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Order
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{funnel.order}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      PDA Document ID
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{funnel.pda_document_id}</p>
                  </div>
                </div>
              </Card>

              {/* PDA Document Information */}
              {funnel.pda_document && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    PDA Document Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Document ID
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">{funnel.pda_document.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Contract ID
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">{funnel.pda_document.contract_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Customer ID
                      </label>
                      <p className="text-base text-gray-900 dark:text-white">{funnel.pda_document.customer_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </label>
                      <div className="mt-1">
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                          {funnel.pda_document.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Description */}
            {funnel.description && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Description
                </h2>
                <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                  {funnel.description}
                </p>
              </Card>
            )}

            {/* Timestamps */}
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
                    {formatDate(funnel.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Updated At
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">
                    {formatDate(funnel.updated_at)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete AIDA Funnel</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this AIDA funnel? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Stage: {stageUpper}
              </p>
              {funnel.description && (
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {funnel.description}
                </p>
              )}
            </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

