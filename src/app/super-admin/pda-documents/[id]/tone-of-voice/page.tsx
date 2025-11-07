'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon } from '@/components/ui/icons';
import { useToneOfVoice, useDeleteToneOfVoice } from '@/modules/pda-documents/hooks/use-tone-of-voice';
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

export default function ToneOfVoicePage() {
  const router = useRouter();
  const params = useParams();
  const pdaDocumentId = parseInt(params.id as string);

  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const deleteToneOfVoiceMutation = useDeleteToneOfVoice(pdaDocumentId);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: `Document ${pdaDocumentId}`, href: `/super-admin/pda-documents/${pdaDocumentId}` },
    { label: 'Tone of Voice' }
  ];

  const {
    data: toneOfVoiceResponse,
    isLoading,
    error,
    refetch,
    isError
  } = useToneOfVoice(pdaDocumentId);

  const toneOfVoice = toneOfVoiceResponse?.data;

  // Redirect to create page if no tone of voice exists
  useEffect(() => {
    if (!isLoading && !hasRedirected && (!toneOfVoiceResponse || !toneOfVoice)) {
      setHasRedirected(true);
      toast.info('No tone of voice found. Redirecting to create page...');
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/tone-of-voice/create`);
    }
  }, [isLoading, toneOfVoiceResponse, toneOfVoice, pdaDocumentId, router, hasRedirected]);

  const handleCreateToneOfVoice = () => {
    router.push(`/super-admin/pda-documents/${pdaDocumentId}/tone-of-voice/create`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteToneOfVoice = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteToneOfVoiceMutation.mutateAsync();
      refetch();
    } catch (error) {
      const errorMsg = (error as Error)?.message || 'Failed to delete tone of voice.';
      toast.error(errorMsg);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEditToneOfVoice = () => {
    if (toneOfVoice) {
      router.push(`/super-admin/pda-documents/${pdaDocumentId}/tone-of-voice/edit`);
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

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Tone of Voice
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading tone of voice...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  // Show redirecting state if no data found
  if ((!toneOfVoiceResponse || !toneOfVoice) && !isLoading) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">No tone of voice found. Redirecting to create page...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  // Show error only for other errors (not 404)
  if (isError && error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tone of Voice for Document {pdaDocumentId}</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage tone of voice for this PDA document</p>
              </div>
              <ErrorDisplay error={error} onRetry={handleRetry} />
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tone of Voice for Document {pdaDocumentId}</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage tone of voice for this PDA document</p>
              </div>
              <div className="flex-shrink-0 ml-6 flex gap-3">
                <Button
                  onClick={() => router.push(`/super-admin/pda-documents/${pdaDocumentId}`)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                {toneOfVoice ? (
                  <>
                    <Button
                      onClick={handleEditToneOfVoice}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                    >
                      <EditIcon className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      onClick={handleDeleteToneOfVoice}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleCreateToneOfVoice}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Create Tone of Voice</span>
                  </Button>
                )}
              </div>
            </div>

            {toneOfVoice && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Brand Slogan */}
                  {toneOfVoice.brand_slogan && (
                    <Card className="p-6">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Brand Slogan
                      </h3>
                      <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                        {toneOfVoice.brand_slogan}
                      </p>
                    </Card>
                  )}

                  {/* Personality */}
                  {toneOfVoice.personality && (
                    <Card className="p-6">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Personality
                      </h3>
                      <p className="text-base text-gray-900 dark:text-white leading-relaxed">
                        {toneOfVoice.personality}
                      </p>
                    </Card>
                  )}

                  {/* Keywords */}
                  {toneOfVoice.keywords && toneOfVoice.keywords.trim() && (
                    <Card className="p-6">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {toneOfVoice.keywords.split(',').filter(k => k.trim()).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                          >
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Summary */}
                  {toneOfVoice.summary && (
                    <Card className="p-6">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Project Summary
                      </h3>
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {toneOfVoice.summary}
                      </p>
                    </Card>
                  )}

                  {/* Bio */}
                  {toneOfVoice.bio && (
                    <Card className="p-6">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Bio
                      </h3>
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {toneOfVoice.bio}
                      </p>
                    </Card>
                  )}

                  {/* Messages/Comments Response */}
                  {toneOfVoice.msgs_comments_response && (
                    <Card className="p-6">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Messages/Comments Response
                      </h3>
                      <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {toneOfVoice.msgs_comments_response}
                      </p>
                    </Card>
                  )}
                </div>

                {/* Full Width - Metadata */}
                <Card className="p-6 lg:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Metadata
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                        ID
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {toneOfVoice.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                        Created At
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(toneOfVoice.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                        Updated At
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(toneOfVoice.updated_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the tone of voice for this document?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteToneOfVoiceMutation.isPending}
              >
                {deleteToneOfVoiceMutation.isPending ? 'Deleting...' : 'Delete Tone of Voice'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

