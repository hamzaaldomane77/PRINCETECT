'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminOnly } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DataTable, Column, ActionButton } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, EditIcon, TrashIcon, PlusIcon, RefreshIcon } from '@/components/ui/icons';
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
import { useLeads, useDeleteLead } from '@/modules/leads';
import { Lead } from '@/modules/leads/types';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/image-utils';

const industryColors = {
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  healthcare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  education: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  retail: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  manufacturing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  services: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

const sizeColors = {
  startup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  small: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  large: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  enterprise: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

const statusColors = {
  contacted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  proposal_sent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  negotiation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const sourceColors = {
  website: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  social_media: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  referral: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cold_call: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  event: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  email: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

export default function PotentialClientsPage() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const router = useRouter();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const breadcrumbItems = [
    { label: 'Clients Management', href: '/super-admin/clients-management' },
    { label: 'Potential Clients' }
  ];

  // Fetch leads using the hook with pagination
  const { 
    data: leadsResponse, 
    isLoading, 
    error, 
    refetch,
    isError 
  } = useLeads({
    page: currentPage,
    per_page: itemsPerPage
  });

  const leads = leadsResponse?.data?.leads || [];
  const meta = leadsResponse?.meta || null;

  // Mutations
  const deleteLeadMutation = useDeleteLead();

  const handleCreateLead = () => {
    router.push('/super-admin/clients-management/potential-clients/create');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };


  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    
    try {
      await deleteLeadMutation.mutateAsync(leadToDelete.id);
      toast.success('Lead deleted successfully!');
      refetch();
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Failed to delete lead. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  // Define table columns
  const columns: Column[] = [
    { key: 'id', label: 'ID', type: 'text', width: '60px' },
    { key: 'logo', label: 'Lead', type: 'text', align: 'right' },
    { key: 'company_name', label: 'Company', type: 'text', align: 'right' },
    { key: 'email', label: 'Email', type: 'text', align: 'right' },
    { key: 'phone', label: 'Phone', type: 'text', align: 'center' },
    { key: 'status', label: 'Status', type: 'text', align: 'center' },
    { key: 'priority', label: 'Priority', type: 'text', align: 'center' },
    { key: 'source', label: 'Source', type: 'text', align: 'center' },
    { key: 'industry', label: 'Industry', type: 'text', align: 'center' },
    { key: 'assigned_to', label: 'Assigned To', type: 'text', align: 'center' },
    { key: 'city', label: 'City', type: 'text', align: 'center' },
    { key: 'created_at', label: 'Created At', type: 'date', align: 'right' },
    { key: 'actions', label: 'Actions', type: 'actions', align: 'center' }
  ];

  // Define action buttons
  const actions: ActionButton[] = [
    {
      icon: EyeIcon,
      label: 'View Lead',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900',
      onClick: (lead: Lead) => {
        router.push(`/super-admin/clients-management/potential-clients/${lead.id}`);
      }
    },
    {
      icon: EditIcon,
      label: 'Edit Lead',
      color: 'text-green-600 dark:text-green-400',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900',
      onClick: (lead: Lead) => {
        router.push(`/super-admin/clients-management/potential-clients/${lead.id}/edit`);
      }
    },
    {
      icon: TrashIcon,
      label: 'Delete Lead',
      color: 'text-red-600 dark:text-red-400',
      hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900',
      onClick: handleDeleteLead
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

  // Transform leads data for the table
  const transformedLeads = leads.map(lead => ({
    ...lead,
    logo: (
      <div className="flex items-center space-x-3">
        <img 
          src={getImageUrl(lead.logo)} 
          alt={`${lead.name} logo`}
          className="w-8 h-8 object-contain rounded"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-logo.svg';
          }}
        />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
          {lead.company_name && !lead.company_name.startsWith('http') && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{lead.company_name}</p>
          )}
        </div>
      </div>
    ),
    company_name: lead.company_name && !lead.company_name.startsWith('http') ? lead.company_name : '-',
    email: lead.email,
    phone: lead.phone || lead.mobile || '-',
    status: (
      <Badge className={statusColors[lead.status] || statusColors.contacted}>
        {lead.status?.replace('_', ' ').toUpperCase() || 'CONTACTED'}
      </Badge>
    ),
    priority: (
      <Badge className={priorityColors[lead.priority] || priorityColors.medium}>
        {lead.priority?.toUpperCase() || 'MEDIUM'}
      </Badge>
    ),
    source: lead.source ? (
      <Badge className={sourceColors[lead.source] || sourceColors.other}>
        {lead.source.replace('_', ' ').toUpperCase()}
      </Badge>
    ) : '-',
    industry: lead.industry ? (
      <Badge className={industryColors[lead.industry] || industryColors.other}>
        {lead.industry.toUpperCase()}
      </Badge>
    ) : '-',
    assigned_to: lead.assigned_employee ? lead.assigned_employee.name : 'Unassigned',
    city: lead.city?.name || '-',
    created_at: new Date(lead.created_at).toLocaleDateString('ar-SA'),
  }));

  // Error display component
  const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
          Error Loading Potential Clients
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
          {error.message}
        </p>
        
        {/* Specific error handling for common issues */}
        {error.message.includes('Authentication required') && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Authentication Issue:</strong> The API requires authentication. 
              This might be due to missing login routes in your Laravel backend.
            </p>
          </div>
        )}
        
        {error.message.includes('API endpoint not found') && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>API Endpoint Issue:</strong> The leads API endpoint is not accessible. 
              Please check your Laravel routes and ensure the API is properly configured.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            <RefreshIcon className="h-4 w-4 mr-2" />
            {isLoading ? 'Retrying...' : 'Retry'}
          </Button>
          
          <Button
            onClick={() => window.open('http://princetect.peaklink.pro/api/v1/admin/leads', '_blank')}
            variant="outline"
          >
            Test API Directly
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
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading potential clients...</div>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Potential Clients Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your sales leads and prospects</p>
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Potential Clients Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your sales leads and prospects</p>
                {meta && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Showing {leads.length} of {meta.total} potential clients
                    {meta.total > meta.per_page && (
                      <span> • Page {meta.current_page} of {meta.last_page}</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Create Lead Button */}
              <div className="flex-shrink-0 ml-6">
                <Button
                  onClick={handleCreateLead}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Lead</span>
                </Button>
              </div>
            </div>
          
            {/* Data Table */}
            <div className="flex-1 flex flex-col min-h-0">
              {leads.length > 0 ? (
                <DataTable
                  data={transformedLeads}
                  columns={columns}
                  actions={actions}
                  searchable={true}
                  searchPlaceholder="Search potential clients..."
                  filterable={false}
                  selectable={true}
                  pagination={true}
                  itemsPerPageOptions={[5, 10, 15]}
                  defaultItemsPerPage={5}
                  serverSide={true}
                  currentPage={meta?.current_page || 1}
                  totalPages={meta?.last_page || 1}
                  totalItems={meta?.total || 0}
                  itemsPerPage={meta?.per_page || 5}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  onSelectionChange={handleSelectionChange}
                  onSearch={handleSearch}
                  onFilter={handleFilter}
                  className="flex-1 flex flex-col min-h-0"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No Potential Clients Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                      No potential clients are currently available. Create your first lead to get started.
                    </p>
                    <Button
                      onClick={handleCreateLead}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Lead
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
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من أنك تريد حذف العميل المحتمل &quot;{leadToDelete?.name}&quot;؟ 
                <br />
                <span className="text-red-600 font-medium">هذا الإجراء لا يمكن التراجع عنه.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteLeadMutation.isPending}
              >
                {deleteLeadMutation.isPending ? 'جاري الحذف...' : 'حذف العميل المحتمل'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </SuperAdminOnly>
  );
} 