'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon, MoreVerticalIcon } from '@/components/ui/icons';
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
import { usePdaDocuments, useDeletePdaDocument, PdaDocument, PdaDocumentStatus } from '@/modules/pda-documents';
import { toast } from 'sonner';

const statusColors: Record<PdaDocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export default function PdaDocumentsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<PdaDocument | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const breadcrumbItems = [
    { label: 'PDA Documents' }
  ];

  // Fetch PDA documents using the hook
  const {
    data: documentsResponse,
    isLoading,
    error,
    refetch,
    isError
  } = usePdaDocuments();

  const documents = documentsResponse?.data.pda_documents || [];

  // Mutations
  const deleteDocumentMutation = useDeletePdaDocument();

  const handleCreateDocument = () => {
    router.push('/super-admin/pda-documents/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleDeleteDocument = (document: PdaDocument) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocumentMutation.mutateAsync(documentToDelete.id);
      refetch();
    } catch (error) {
      const errorMsg = (error as Error)?.message || '';

      if (errorMsg.includes('permission')) {
        toast.error('You do not have permission to delete this document.');
      } else if (errorMsg.includes('not found')) {
        toast.error('Document not found. It may have been already deleted.');
        refetch();
      } else {
        toast.error('Failed to delete document. Please try again.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleViewDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}`);
  };

  const handleEditDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}/edit`);
  };

  const handleGoalsDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}/goals`);
  };

  const handleSmartGoalsDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}/smart-goals`);
  };

  const handleSwotDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}/swot`);
  };

  const handleCompetitorsDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}/competitors`);
  };

  const handleMarketSegmentationsDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}/market-segmentations`);
  };

  const handleMarketChallengesDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}/market-challenges`);
  };

  const handleTargetAudiencesDocument = (document: PdaDocument) => {
    router.push(`/super-admin/pda-documents/${document.id}/target-audiences`);
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'contract_number', label: 'Contract Number', type: 'text', align: 'right' },
    { key: 'contract_title', label: 'Contract Title', type: 'text', align: 'right' },
    { key: 'customer_name', label: 'Customer', type: 'text', align: 'right' },
    { key: 'created_by_name', label: 'Created By', type: 'text', align: 'right' },
    { key: 'status', label: 'Status', type: 'text', align: 'center' },
    { key: 'notes', label: 'Notes', type: 'text', align: 'right' },
    { key: 'created_at', label: 'Created At', type: 'text', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  const actions: ActionButton[] = [
    {
      icon: MoreVerticalIcon,
      label: 'Actions',
      color: 'text-gray-600 dark:text-gray-300',
      hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      onClick: () => {},
      dropdownItems: [
        {
          icon: EyeIcon,
          label: 'View Details',
          onClick: handleViewDocument
        },
        {
          icon: EditIcon,
          label: 'Edit Document',
          onClick: handleEditDocument
        },
        {
          icon: PlusIcon,
          label: 'Goals',
          onClick: handleGoalsDocument,
          className: 'text-blue-600 dark:text-blue-400'
        },
        {
          icon: PlusIcon,
          label: 'Smart Goals',
          onClick: handleSmartGoalsDocument,
          className: 'text-purple-600 dark:text-purple-400'
        },
        {
          icon: PlusIcon,
          label: 'SWOT Analysis',
          onClick: handleSwotDocument,
          className: 'text-teal-600 dark:text-teal-400'
        },
        {
          icon: PlusIcon,
          label: 'Competitors',
          onClick: handleCompetitorsDocument,
          className: 'text-indigo-600 dark:text-indigo-400'
        },
        {
          icon: PlusIcon,
          label: 'Market Segmentations',
          onClick: handleMarketSegmentationsDocument,
          className: 'text-pink-600 dark:text-pink-400'
        },
        {
          icon: PlusIcon,
          label: 'Market Challenges',
          onClick: handleMarketChallengesDocument,
          className: 'text-amber-600 dark:text-amber-400'
        },
        {
          icon: PlusIcon,
          label: 'Target Audiences',
          onClick: handleTargetAudiencesDocument,
          className: 'text-cyan-600 dark:text-cyan-400'
        },
        {
          icon: TrashIcon,
          label: 'Delete Document',
          onClick: handleDeleteDocument,
          className: 'text-red-600 dark:text-red-400'
        }
      ]
    }
  ];

  const handleSelectionChange = (selectedIds: number[]) => {
    setSelectedRows(selectedIds);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  const handleFilter = () => {
    console.log('Filter clicked');
    // TODO: Implement filter functionality
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Transform documents data for the table
  const transformedDocuments = documents.map(doc => ({
    ...doc,
    contract_number: doc.contract?.contract_number || 'N/A',
    contract_title: doc.contract?.title || 'N/A',
    customer_name: doc.customer_id || 'N/A',
    created_by_name: doc.created_by?.name || 'N/A',
    status: (
      <Badge className={statusColors[doc.status] || statusColors.draft}>
        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
      </Badge>
    ),
    notes: doc.notes || 'N/A',
    created_at: formatDate(doc.created_at),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading PDA Documents
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

  if (isLoading && retryCount === 0) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading PDA documents...</div>
            </div>
          </div>
        </AdminLayout>
      </SuperAdminOnly>
    );
  }

  if (isError && error) {
    return (
      <SuperAdminOnly>
        <AdminLayout>
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            <div className="p-6 space-y-6">
              {/* Breadcrumb */}
              <Breadcrumb items={breadcrumbItems} />

              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PDA Documents</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage PDA documents</p>
              </div>

              {/* Error Display */}
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
          <div className="p-6 space-y-6 h-full flex flex-col min-h-0">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PDA Documents</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage PDA documents</p>
              </div>

              {/* Create Document Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateDocument}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Document</span>
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {documents.length > 0 ? (
                <DataTable
                  data={transformedDocuments}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search documents..."
                  filterable={false}
                  selectable={true}
                  pagination={true}
                  defaultItemsPerPage={10}
                  onSelectionChange={handleSelectionChange}
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  className="flex-1 flex flex-col min-h-0"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No PDA Documents Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No documents are currently available. Create your first document to get started.
                    </p>
                    <Button
                      onClick={handleCreateDocument}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Document
                    </Button>
                  </div>
                </div>
              )}
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

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                ⚠️ Error
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

