'use client';

import { useParams, useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { usePdaDocument, useDeletePdaDocument, PdaDocumentStatus } from '@/modules/pda-documents';
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

const statusColors: Record<PdaDocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export default function PdaDocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = parseInt(params.id as string);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const breadcrumbItems = [
    { label: 'PDA Documents', href: '/super-admin/pda-documents' },
    { label: 'Document Details' }
  ];

  // Fetch document details
  const { data: documentResponse, isLoading, error } = usePdaDocument(documentId);
  const document = documentResponse?.data;

  // Delete mutation
  const deleteDocumentMutation = useDeletePdaDocument();

  const handleEdit = () => {
    router.push(`/super-admin/pda-documents/${documentId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDocumentMutation.mutateAsync(documentId);
      router.push('/super-admin/pda-documents');
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';
      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this document.');
      } else {
        toast.error('Failed to delete document. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleBack = () => {
    router.push('/super-admin/pda-documents');
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading document details...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (error || !document) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              <Breadcrumb items={breadcrumbItems} />
              <div className="flex flex-col items-center justify-center h-64">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Error Loading Document
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {(error as Error)?.message || 'Document not found'}
                </p>
                <Button
                  onClick={handleBack}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Documents
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
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  PDA Document Details
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View document information
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

            {/* Document Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Document Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Document ID
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{document.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge className={statusColors[document.status]}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer ID
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">{document.customer_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created By
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {document.created_by?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Contract Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Contract Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Contract Number
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {document.contract?.contract_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Contract Title
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {document.contract?.title || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Contract Type
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {document.contract?.contract_type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Amount
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {document.contract?.total_amount || 'N/A'} {document.contract?.currency || ''}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Notes */}
              {document.notes && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Notes
                  </h2>
                  <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                    {document.notes}
                  </p>
                </Card>
              )}

              {/* Tone of Voice */}
              {document.tone_of_voice && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Tone of Voice
                  </h2>
                  <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                    {document.tone_of_voice}
                  </p>
                </Card>
              )}

              {/* Goals */}
              {document.goals && document.goals.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Goals ({document.goals.length})
                  </h2>
                  <div className="space-y-3">
                    {document.goals.map((goal) => (
                      <div key={goal.id} className="border-l-4 border-orange-500 pl-4 py-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{goal.goal_title}</h3>
                        {goal.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* SMART Goals */}
              {document.smart_goals && document.smart_goals.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    SMART Goals ({document.smart_goals.length})
                  </h2>
                  <div className="space-y-4">
                    {document.smart_goals.map((goal) => (
                      <div key={goal.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{goal.goal_title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {goal.specific && (
                            <div>
                              <span className="font-medium text-orange-600 dark:text-orange-400">Specific:</span>
                              <p className="text-gray-700 dark:text-gray-300">{goal.specific}</p>
                            </div>
                          )}
                          {goal.measurable && (
                            <div>
                              <span className="font-medium text-orange-600 dark:text-orange-400">Measurable:</span>
                              <p className="text-gray-700 dark:text-gray-300">{goal.measurable}</p>
                            </div>
                          )}
                          {goal.achievable && (
                            <div>
                              <span className="font-medium text-orange-600 dark:text-orange-400">Achievable:</span>
                              <p className="text-gray-700 dark:text-gray-300">{goal.achievable}</p>
                            </div>
                          )}
                          {goal.relevant && (
                            <div>
                              <span className="font-medium text-orange-600 dark:text-orange-400">Relevant:</span>
                              <p className="text-gray-700 dark:text-gray-300">{goal.relevant}</p>
                            </div>
                          )}
                          {goal.time_bound && (
                            <div>
                              <span className="font-medium text-orange-600 dark:text-orange-400">Time-bound:</span>
                              <p className="text-gray-700 dark:text-gray-300">{goal.time_bound}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* SWOT Analysis */}
              {document.swot_analysis && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    SWOT Analysis
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {document.swot_analysis.strengths && (
                      <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                        <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">Strengths</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{document.swot_analysis.strengths}</p>
                      </div>
                    )}
                    {document.swot_analysis.weaknesses && (
                      <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Weaknesses</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{document.swot_analysis.weaknesses}</p>
                      </div>
                    )}
                    {document.swot_analysis.opportunities && (
                      <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                        <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Opportunities</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{document.swot_analysis.opportunities}</p>
                      </div>
                    )}
                    {document.swot_analysis.threats && (
                      <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                        <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">Threats</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{document.swot_analysis.threats}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Competitors */}
              {document.competitors && document.competitors.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Competitors ({document.competitors.length})
                  </h2>
                  <div className="space-y-3">
                    {document.competitors.map((competitor) => (
                      <div key={competitor.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{competitor.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {competitor.strengths && (
                            <div>
                              <span className="font-medium text-green-600 dark:text-green-400">Strengths:</span>
                              <p className="text-gray-700 dark:text-gray-300">{competitor.strengths}</p>
                            </div>
                          )}
                          {competitor.weaknesses && (
                            <div>
                              <span className="font-medium text-red-600 dark:text-red-400">Weaknesses:</span>
                              <p className="text-gray-700 dark:text-gray-300">{competitor.weaknesses}</p>
                            </div>
                          )}
                        </div>
                        {competitor.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{competitor.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Marketing Channels */}
              {document.marketing_channels && document.marketing_channels.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Marketing Channels ({document.marketing_channels.length})
                  </h2>
                  <div className="space-y-3">
                    {document.marketing_channels.map((channel) => (
                      <div key={channel.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{channel.name}</h3>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {channel.channel_type}
                          </Badge>
                        </div>
                        {channel.details && channel.details.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            {channel.details.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Marketing Mix */}
              {document.marketing_mixes && document.marketing_mixes.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Marketing Mix ({document.marketing_mixes.length})
                  </h2>
                  <div className="space-y-3">
                    {document.marketing_mixes.map((mix) => (
                      <div key={mix.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{mix.title}</h3>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            {mix.element}
                          </Badge>
                        </div>
                        {mix.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{mix.description}</p>
                        )}
                        {mix.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{mix.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Market Segmentations */}
              {document.market_segmentations && document.market_segmentations.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Market Segmentations ({document.market_segmentations.length})
                  </h2>
                  <div className="space-y-3">
                    {document.market_segmentations.map((segment) => (
                      <div key={segment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{segment.segment_name}</h3>
                        {segment.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{segment.description}</p>
                        )}
                        {segment.criteria && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Criteria:</span> {segment.criteria}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Target Audiences */}
              {document.target_audiences && document.target_audiences.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Target Audiences ({document.target_audiences.length})
                  </h2>
                  <div className="space-y-3">
                    {document.target_audiences.map((audience) => (
                      <div key={audience.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{audience.audience_name}</h3>
                        {audience.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{audience.description}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {audience.demographics && (
                            <div>
                              <span className="font-medium text-orange-600 dark:text-orange-400">Demographics:</span>
                              <p className="text-gray-700 dark:text-gray-300">{audience.demographics}</p>
                            </div>
                          )}
                          {audience.psychographics && (
                            <div>
                              <span className="font-medium text-orange-600 dark:text-orange-400">Psychographics:</span>
                              <p className="text-gray-700 dark:text-gray-300">{audience.psychographics}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Market Challenges */}
              {document.market_challenges && document.market_challenges.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Market Challenges ({document.market_challenges.length})
                  </h2>
                  <div className="space-y-3">
                    {document.market_challenges.map((challenge) => (
                      <div key={challenge.id} className="border-l-4 border-red-500 pl-4 py-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{challenge.challenge_title}</h3>
                        {challenge.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{challenge.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* AIDA Funnels */}
              {document.aida_funnels && document.aida_funnels.length > 0 && (
                <Card className="p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    AIDA Funnels ({document.aida_funnels.length})
                  </h2>
                  <div className="space-y-3">
                    {document.aida_funnels
                      .sort((a, b) => a.order - b.order)
                      .map((funnel) => (
                        <div key={funnel.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{funnel.stage}</h3>
                            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                              Order: {funnel.order}
                            </Badge>
                          </div>
                          {funnel.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">{funnel.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </Card>
              )}

              {/* Timestamps */}
              <Card className="p-6 lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Timestamps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created At
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {formatDate(document.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Updated At
                    </label>
                    <p className="text-base text-gray-900 dark:text-white">
                      {formatDate(document.updated_at)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this PDA document?
                <br />
                <span className="text-red-600 font-medium">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteDocumentMutation.isPending}
              >
                {deleteDocumentMutation.isPending ? 'Deleting...' : 'Delete Document'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
}

