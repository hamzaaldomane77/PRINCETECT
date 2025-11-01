'use client';

import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { useCompetitor, useDeleteCompetitor } from '@/modules/pda-documents/hooks/use-competitors';
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

export default function CompetitorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);
  const competitorId = parseInt(params.competitorId as string);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteCompetitorMutation = useDeleteCompetitor(pdaDocumentId);

  const {
    data: competitorResponse,
    isLoading,
    error,
    isError,
  } = useCompetitor(pdaDocumentId, competitorId);

  const competitor = competitorResponse?.data;

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Competitors', href: `/super-admin/pda-documents/${pdaDocumentId}/competitors` },
    { label: `Competitor ${competitorId}` }
  ];

  const handleEdit = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors/${competitorId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCompetitorMutation.mutateAsync(competitorId);
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors`);
    } catch (error) {
      console.error('Error deleting competitor:', error);
      toast.error((error as Error)?.message || 'Failed to delete competitor.');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading competitor details...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError || !competitor) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                    Error Loading Competitor
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                    {error?.message || 'Failed to load competitor details. Please try again.'}
                  </p>
                  <Button
                    onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors`)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Competitors
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
        <div className="h-full bg-gray-50 dark:bg-gray-900">
          <div className="p-6 space-y-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competitor: {competitor.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">Details for Competitor ID: {competitor.id}</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}/competitors`)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to Competitors</span>
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

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Competitor Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Competitor ID</label>
                  <p className="text-base text-gray-900 dark:text-white">{competitor.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Competitor Name</label>
                  <p className="text-base text-gray-900 dark:text-white">{competitor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Strengths</label>
                  <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{competitor.strengths || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Weaknesses</label>
                  <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{competitor.weaknesses || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                  <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{competitor.notes || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                  <p className="text-base text-gray-900 dark:text-white">{formatDate(competitor.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                  <p className="text-base text-gray-900 dark:text-white">{formatDate(competitor.updated_at)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the competitor &quot;{competitor.name}&quot;?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteCompetitorMutation.isPending}
              >
                {deleteCompetitorMutation.isPending ? 'Deleting...' : 'Delete Competitor'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

